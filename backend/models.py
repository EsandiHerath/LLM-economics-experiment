# Import BaseModel from Pydantic for data validation
from pydantic import BaseModel

# ExperimentConfig defines the structure of the experiment settings
# received from the frontend when a simulation is started.
class ExperimentConfig(BaseModel):

    # Name of the LLM model to be used (e.g., "gpt-4o")
    model: str

    # Number of rounds to simulate (e.g., 50 or 200)
    rounds: int

    # Temperature parameter controlling randomness in LLM responses
    # Value typically between 0.0 and 1.0
    temperature: float

    # Pricing frame used in the experiment:
    # "LP" (Linear Pricing), "TPT" (Two-Part Tariff), or "QD" (Quantity Discount)
    frame: str

    # Custom prompt for the manufacturer agent
    # Defaults to empty string if not provided
    manufacturerPrompt: str = ""

    # Custom prompt for the retailer agent
    # Defaults to empty string if not provided
    retailerPrompt: str = ""
