"""PlastiVision AI — Environmental Tips & Waste Category Mapping."""
import random

# Per-class environmental tips (extends the config mapping)
TIPS = {
    # Organic / Biodegradable
    "O": [
        "Composting organic waste reduces methane emissions from landfills by up to 50%.",
        "Food scraps make excellent compost that enriches soil with essential nutrients.",
        "Organic waste in compost bins can be converted into fertilizer within 60–90 days.",
        "Reducing food waste is one of the most impactful actions to fight climate change.",
        "Composting one ton of organic waste saves approximately 0.5 tons of CO₂ equivalent.",
    ],
    "ORGANIC": [
        "Composting organic waste reduces methane emissions from landfills by up to 50%.",
        "Food scraps make excellent compost that enriches soil with essential nutrients.",
        "Organic waste in compost bins can be converted into fertilizer within 60–90 days.",
    ],
    # Recyclable / Non-Biodegradable
    "R": [
        "Recycling one plastic bottle saves enough energy to power a light bulb for 6 hours.",
        "Recycling reduces the need for virgin raw materials, conserving natural resources.",
        "Properly sorted recyclables reduce contamination and improve recycling rates.",
        "Switching to reusable alternatives can eliminate hundreds of single-use items per year.",
        "Every ton of recycled plastic saves approximately 3.8 barrels of crude oil.",
        "Recycling aluminum uses 95% less energy than producing it from raw ore.",
    ],
    "RECYCLE": [
        "Recycling one plastic bottle saves enough energy to power a light bulb for 6 hours.",
        "Recycling reduces the need for virgin raw materials, conserving natural resources.",
        "Properly sorted recyclables reduce contamination and improve recycling rates.",
    ],
}

# Default fallback tips
DEFAULT_TIPS = [
    "Every small act of correct waste disposal contributes to a cleaner environment.",
    "Waste segregation at source is the foundation of an effective recycling system.",
    "Educating others about waste classification multiplies your environmental impact.",
]


def get_tip(class_name: str) -> str:
    """Return a random environmental tip for the given class name."""
    tips = TIPS.get(class_name.upper(), DEFAULT_TIPS)
    return random.choice(tips)
