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
    from datetime import datetime
    return templates.TemplateResponse(
        "pages/admin/dashboard.html",
        {
            "request": request,
            "current_date": datetime.now().strftime("%A, %d %B %Y")
        }
    )


@router.get("/craftsman", response_class=HTMLResponse)
async def craftsman_dashboard(request: Request):
    return templates.TemplateResponse(
        "pages/craftsman/dashboard.html",
        {"request": request}
    )


@router.get("/admin/categories", response_class=HTMLResponse)
async def admin_categories(request: Request):
    return templates.TemplateResponse(
        "pages/admin/categories.html",
        {"request": request}
    )


@router.get("/admin/categories/new", response_class=HTMLResponse)
async def admin_new_category(request: Request):
    return templates.TemplateResponse(
        "pages/admin/new-category.html",
        {"request": request}
    )


@router.get("/admin/categories/{category_id}", response_class=HTMLResponse)
async def admin_category_detail(request: Request, category_id: str, mode: str = "view"):
    print(f"Category ID in route: {category_id}")  # Debug print
    return templates.TemplateResponse(
        "pages/admin/category.html",
        {"request": request, "category_id": category_id, "mode": mode}
    )
