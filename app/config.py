from fastapi.templating import Jinja2Templates
from pathlib import Path

# Create shared templates object
templates = Jinja2Templates(directory=Path(__file__).parent / "templates")
