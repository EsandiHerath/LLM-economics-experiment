from models import ExperimentConfig
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create OpenAI client using API key stored securely in .env
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ---------- LLM CALL FUNCTION ----------

def call_llm(system_prompt, user_prompt, model, temperature):
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=temperature
    )
    return response.choices[0].message.content


# ---------- SYSTEM PROMPTS ----------

MANUFACTURER_SYSTEM = """
You are player A (the manufacturer) in a one-shot posted-offer game.
Market: quantity q = 10 − p (if p > 10, then q = 0).
Your unit cost is c = 2.
You will announce a contract once. There is no negotiation.
Return only valid JSON as specified.
"""

RETAILER_SYSTEM = """
You are player B (the retailer). This is one shot.
Market: q = 10 − p (if p > 10, then q = 0).
First, decide whether to accept the offer.
If you accept, choose price B as an integer between 0 and 10.
Return only valid JSON: {"accept": true|false, "PRICE_B": <int 0–10 or null if reject>}.
"""


# ---------- PROMPT BUILDERS ----------

def manufacturer_prompt(config):

    if config.frame == "LP":
        return """
Choose price A, an integer between 0 and 10, at which to offer the product to player B.
Return JSON: {"treatment":"LP","PRICE_A": <int 0–10>}
"""

    if config.frame == "TPT":
        return """
Choose price A (an integer between 0 and 10) and a lump-sum fixed fee (a nonnegative integer) to charge your partner.
Return JSON: {"treatment":"TPT","PRICE_A": <int 0–10>,"FIXED_FEE": <int ≥0>}
"""

    if config.frame == "QD":
        return """
Determine a pricing scheme. The pricing scheme must be that the more B buys, the lower the average unit price.
Specifically, price A = x + y/quantity.
Choose x (an integer between 0 and 10) and y (a nonnegative integer).
Return JSON: {"treatment":"QD","x": <int 0–10>,"y": <int ≥0>}
"""


def retailer_prompt(config, m_decision):

    if config.frame == "LP":
        w = m_decision["PRICE_A"]
        return f"""
The manufacturer offers price A = {w}.
If you accept, your points are (price B − price A) × quantity, with quantity = 10 − price B.
Decide to accept or reject. If you accept, choose price B (0–10).
"""

    if config.frame == "TPT":
        w = m_decision["PRICE_A"]
        F = m_decision["FIXED_FEE"]
        return f"""
The manufacturer offers a fixed fee = {F} and price A = {w}.
If you accept, you agree to pay the fixed fee no matter what, then choose price B.
Your points if accepted: (price B − price A) × quantity − fixed fee, with quantity = 10 − price B.
Decide accept or reject. If you accept, choose price B (0–10).
"""

    if config.frame == "QD":
        x = m_decision["x"]
        y = m_decision["y"]
        return f"""
The manufacturer offers an average-unit pricing scheme: price A = x + y/quantity,
with x = {x} and y = {y}.
If you accept, you choose price B.
Your points if accepted: (price B − price A) × quantity,
where quantity = 10 − price B and price A = x + y/quantity.
Decide to accept or reject. If you accept, choose price B (0–10).
"""


# ---------- PARSING HELPERS ----------

def safe_json(text):
    try:
        return json.loads(text)
    except:
        return None


# ---------- ECONOMICS LOGIC ----------

def compute_quantity(p):
    return max(0, 10 - p)


def score_round(frame, m, r):

    accepted = r["accept"]
    p = r["PRICE_B"] if accepted else None

    if not accepted:
        # If retailer rejects, profits and efficiency are zero
        return 0, 0, 0, 0

    q = compute_quantity(p)

    if frame == "LP":
        w = m["PRICE_A"]
        manufacturer_profit = (w - 2) * q
        retailer_profit = (p - w) * q

    elif frame == "TPT":
        w = m["PRICE_A"]
        F = m["FIXED_FEE"]
        manufacturer_profit = (w - 2) * q + F
        retailer_profit = (p - w) * q - F

    elif frame == "QD":
        x = m["x"]
        y = m["y"]
        priceA = x + y / q if q > 0 else 0
        manufacturer_profit = (priceA - 2) * q
        retailer_profit = (p - priceA) * q

    channel_profit = manufacturer_profit + retailer_profit

    # Full efficiency benchmark = 16
    efficiency = channel_profit / 16

    return manufacturer_profit, retailer_profit, q, efficiency


# ---------- MAIN SIMULATION ----------

def run_simulation(config: ExperimentConfig):

    rounds = []

    for i in range(config.rounds):

        # Manufacturer decision
        m_text = call_llm(
            MANUFACTURER_SYSTEM,
            manufacturer_prompt(config),
            config.model,
            config.temperature
        )

        m_decision = safe_json(m_text)

        # Retailer decision
        r_text = call_llm(
            RETAILER_SYSTEM,
            retailer_prompt(config, m_decision),
            config.model,
            config.temperature
        )

        r_decision = safe_json(r_text)

        m_profit, r_profit, q, eff = score_round(
            config.frame, m_decision, r_decision
        )

        rounds.append({
            "accepted": r_decision["accept"],
            "p": r_decision["PRICE_B"],
            "q": q,
            "manufacturer_profit": m_profit,
            "retailer_profit": r_profit,
            "channel_profit": m_profit + r_profit,
            "efficiency": eff
        })

    # ---------- METRICS ----------

    acceptance_rate = sum(r["accepted"] for r in rounds) / len(rounds)

    accepted_rounds = [r for r in rounds if r["accepted"]]

    conditional_efficiency = (
        sum(r["efficiency"] for r in accepted_rounds) / len(accepted_rounds)
        if accepted_rounds else 0
    )

    overall_efficiency = sum(r["efficiency"] for r in rounds) / len(rounds)

    mean_price = (
        sum(r["p"] for r in accepted_rounds) / len(accepted_rounds)
        if accepted_rounds else 0
    )

    metrics = [{
        "frame": config.frame,
        "acceptanceRate": round(acceptance_rate, 3),
        "conditionalEfficiency": round(conditional_efficiency, 3),
        "overallEfficiency": round(overall_efficiency, 3),
        "meanRetailPrice": round(mean_price, 2),
        "temperature": config.temperature,
        "model": config.model
    }]

    last = rounds[-1]

    last_round = {
        "frame": config.frame,
        "manufacturerChoice": str(m_decision),
        "retailerChoice": str(r_decision),
        "q": last["q"],
        "temperature": config.temperature,
        "model": config.model
    }

    return last_round, metrics
