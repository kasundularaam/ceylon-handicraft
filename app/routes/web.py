from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, RedirectResponse
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

# ADMIN PAGES


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
    print(f"Category route called - ID: {category_id}, Mode: {mode}")
    return templates.TemplateResponse(
        "pages/admin/category.html",
        {"request": request, "category_id": category_id, "mode": mode}
    )

# CRAFTSMAN PAGES


@router.get("/craftsman", response_class=HTMLResponse)
async def craftsman_dashboard(request: Request):
    return templates.TemplateResponse(
        "pages/craftsman/dashboard.html",
        {"request": request}
    )


# Remove auth checking from web routes

# Craftsman Products Routes
@router.get("/craftsman/products", response_class=HTMLResponse)
async def craftsman_products(request: Request):
    # No auth checking - handled by client
    return templates.TemplateResponse(
        "pages/craftsman/products.html",
        {"request": request}
    )


@router.get("/craftsman/products/{product_id}", response_class=HTMLResponse)
async def craftsman_product_detail(request: Request, product_id: str):
    # No auth checking - handled by client
    return templates.TemplateResponse(
        "pages/craftsman/product.html",
        {"request": request, "product_id": product_id}
    )


@router.get("/craftsman/product", response_class=HTMLResponse)
async def craftsman_product_form(request: Request):
    # No auth checking - handled by client
    mode = request.query_params.get("mode", "new")
    product_id = request.query_params.get("id", None)

    if mode == "edit" and product_id:
        return templates.TemplateResponse(
            "pages/craftsman/edit-product.html",
            {"request": request, "product_id": product_id}
        )
    else:
        return templates.TemplateResponse(
            "pages/craftsman/new-product.html",
            {"request": request}
        )


@router.get("/sale", response_class=HTMLResponse)
async def sale_products(request: Request):
    return templates.TemplateResponse(
        "pages/products/sale.html",
        {"request": request}
    )


@router.get("/auction", response_class=HTMLResponse)
async def auction_products(request: Request):
    return templates.TemplateResponse(
        "pages/products/auction.html",
        {"request": request}
    )


@router.get("/about", response_class=HTMLResponse)
async def auction_products(request: Request):
    return templates.TemplateResponse(
        "pages/global/about.html",
        {"request": request}
    )


@router.get("/sale/{product_id}", response_class=HTMLResponse)
async def sale_product_detail(request: Request, product_id: str):
    return templates.TemplateResponse(
        "pages/products/product_detail.html",
        {"request": request, "product_id": product_id, "product_type": "sale"}
    )


@router.get("/auction/{product_id}", response_class=HTMLResponse)
async def auction_product_detail(request: Request, product_id: str):
    return templates.TemplateResponse(
        "pages/products/product_detail.html",
        {"request": request, "product_id": product_id, "product_type": "auction"}
    )
