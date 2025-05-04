from fastapi.templating import Jinja2Templates
from pathlib import Path

# Create shared templates object
templates = Jinja2Templates(directory=Path(__file__).parent / "templates")


AUCTION_DURATION = 60 * 60 * 24 * 7  # 7 days in seconds
