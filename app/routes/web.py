from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from app.config import templates

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )


@router.get("/auth/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse(
        "pages/auth/login.html",
        {"request": request}
    )


@router.get("/auth/signup", response_class=HTMLResponse)
async def signup_page(request: Request, role: str = "Buyer"):
    return templates.TemplateResponse(
        "pages/auth/signup.html",
        {"request": request, "role": role}
    )


@router.get("/auth/address", response_class=HTMLResponse)
async def address_page(request: Request, userid: str, role: str):
    return templates.TemplateResponse(
        "pages/auth/address.html",
        {"request": request, "userid": userid, "role": role}
    )


@router.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request):
    return templates.TemplateResponse(
        "pages/admin/dashboard.html",
        {"request": request}
    )


@router.get("/craftsman", response_class=HTMLResponse)
async def craftsman_dashboard(request: Request):
    return templates.TemplateResponse(
        "pages/craftsman/dashboard.html",
        {"request": request}
    )
