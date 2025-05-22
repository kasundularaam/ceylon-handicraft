import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";
import "../../components/global/sale-product-card.js";
import "../../components/global/auction-product-card.js";

class CategoryProducts extends LitElement {
  static get properties() {
    return {
      products: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
      currentPage: { type: Number },
      totalPages: { type: Number },
      sortBy: { type: String },
      filterType: { type: String },
    };
  }

  constructor() {
    super();
    this.products = [];
    this.loading = true;
    this.error = null;
    this.currentPage = 1;
    this.totalPages = 1;
    this.sortBy = "newest";
    this.filterType = "all"; // 'all', 'sale', or 'auction'

    // Extract category ID from URL
    const urlParts = window.location.pathname.split("/");
    this.categoryId = urlParts[urlParts.length - 1];

    // Parse URL parameters
    this.parseUrlParams();
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchCategoryProducts();

    // Add event listener for browser back button
    window.addEventListener("popstate", this.handlePopState);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this.handlePopState);
  }

  handlePopState = () => {
    this.parseUrlParams();
    this.fetchCategoryProducts();
  };

  parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    this.currentPage = parseInt(urlParams.get("page") || "1");
    this.sortBy = urlParams.get("sort") || "newest";
    this.filterType = urlParams.get("type") || "all";
  }

  updateUrlParams() {
    const urlParams = new URLSearchParams();
    if (this.currentPage > 1) {
      urlParams.set("page", this.currentPage.toString());
    }
    if (this.sortBy !== "newest") {
      urlParams.set("sort", this.sortBy);
    }
    if (this.filterType !== "all") {
      urlParams.set("type", this.filterType);
    }

    const newUrl = `${window.location.pathname}${
      urlParams.toString() ? "?" + urlParams.toString() : ""
    }`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  }

  async fetchCategoryProducts() {
    try {
      this.loading = true;

      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", this.currentPage.toString());
      params.append("limit", "12"); // 12 products per page
      params.append("sort", this.sortBy);

      // Add product type filter if not 'all'
      if (this.filterType !== "all") {
        params.append("product_type", this.filterType);
      }

      // Fetch category products from API
      const endpoint = `/api/categories/${
        this.categoryId
      }/products?${params.toString()}`;

      const response = await fetchJson(endpoint);

      // Fetch image paths for each product
      const products = response.products || [];
      await Promise.all(
        products.map(async (product) => {
          try {
            const imageData = await fetchJson(
              `/api/landing/product/${product.id}/images`
            );
            product.image_paths = imageData.images;
            product.currentImageIndex = 0;

            // Format for product card components
            if (!product.category) {
              product.category = {
                title: product.category_title || "Uncategorized",
                icon: product.category_icon || "fa fa-tag",
              };
            }
          } catch (error) {
            console.error(
              `Error fetching images for product ${product.id}:`,
              error
            );
            product.image_paths = [];
          }
        })
      );

      this.products = products;
      this.totalPages = response.totalPages || 1;
      this.currentPage = response.currentPage || 1;
      this.loading = false;

      // Update URL params to reflect the current state
      this.updateUrlParams();

      // Scroll to top when products update
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error fetching category products:", error);
      this.error = error.message;
      this.loading = false;
    }
  }

  handleSortChange(event) {
    this.sortBy = event.target.value;
    this.currentPage = 1;
    this.fetchCategoryProducts();
  }

  handleTypeChange(event) {
    this.filterType = event.target.value;
    this.currentPage = 1;
    this.fetchCategoryProducts();
  }

  handlePageChange(newPage) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.currentPage = newPage;
    this.fetchCategoryProducts();
  }

  renderLoading() {
    return html`
      <div class="loading-container">
        <div class="loader"></div>
        <p>Loading products...</p>
      </div>
    `;
  }

  renderError() {
    return html`
      <div class="error-container">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Products</h3>
        <p>${this.error || "Unknown error occurred"}</p>
        <button @click=${this.fetchCategoryProducts}>Try Again</button>
      </div>
    `;
  }

  renderEmptyState() {
    return html`
      <div class="empty-state">
        <i class="fas fa-box-open"></i>
        <h3>No Products Found</h3>
        <p>
          ${this.filterType !== "all"
            ? `No ${this.filterType} products found in this category.`
            : "This category doesn't have any products yet."}
        </p>
        ${this.filterType !== "all"
          ? html`
              <button
                @click=${() => {
                  this.filterType = "all";
                  this.fetchCategoryProducts();
                }}
              >
                View All Products
              </button>
            `
          : ""}
      </div>
    `;
  }

  renderFilters() {
    return html`
      <div class="filters-container">
        <div class="type-filter">
          <label for="type-select">Product Type:</label>
          <select id="type-select" @change=${this.handleTypeChange}>
            <option value="all" ?selected=${this.filterType === "all"}>
              All Types
            </option>
            <option value="sale" ?selected=${this.filterType === "sale"}>
              Sale Only
            </option>
            <option value="auction" ?selected=${this.filterType === "auction"}>
              Auction Only
            </option>
          </select>
        </div>

        <div class="sort-filter">
          <label for="sort-select">Sort By:</label>
          <select id="sort-select" @change=${this.handleSortChange}>
            <option value="newest" ?selected=${this.sortBy === "newest"}>
              Newest First
            </option>
            <option value="price_low" ?selected=${this.sortBy === "price_low"}>
              Price: Low to High
            </option>
            <option
              value="price_high"
              ?selected=${this.sortBy === "price_high"}
            >
              Price: High to Low
            </option>
            <option value="popular" ?selected=${this.sortBy === "popular"}>
              Most Popular
            </option>
          </select>
        </div>
      </div>
    `;
  }

  renderPagination() {
    if (this.totalPages <= 1) return html``;

    const pages = [];
    const maxButtons = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(this.totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Previous button
    pages.push(html`
      <button
        class="pagination-button prev"
        ?disabled=${this.currentPage === 1}
        @click=${() => this.handlePageChange(this.currentPage - 1)}
      >
        <i class="fas fa-chevron-left"></i>
      </button>
    `);

    // First page if not visible
    if (startPage > 1) {
      pages.push(html`
        <button
          class="pagination-button"
          @click=${() => this.handlePageChange(1)}
        >
          1
        </button>
      `);

      if (startPage > 2) {
        pages.push(html`<span class="pagination-ellipsis">...</span>`);
      }
    }

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      pages.push(html`
        <button
          class="pagination-button ${i === this.currentPage ? "active" : ""}"
          @click=${() => this.handlePageChange(i)}
        >
          ${i}
        </button>
      `);
    }

    // Last page if not visible
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        pages.push(html`<span class="pagination-ellipsis">...</span>`);
      }

      pages.push(html`
        <button
          class="pagination-button"
          @click=${() => this.handlePageChange(this.totalPages)}
        >
          ${this.totalPages}
        </button>
      `);
    }

    // Next button
    pages.push(html`
      <button
        class="pagination-button next"
        ?disabled=${this.currentPage === this.totalPages}
        @click=${() => this.handlePageChange(this.currentPage + 1)}
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    `);

    return html` <div class="pagination">${pages}</div> `;
  }

  renderProductsGrid() {
    return html`
      <div class="products-grid">
        ${this.products.map((product, index) => {
          // Use appropriate product card based on type
          const productType = String(product.type).toLowerCase();
          if (productType === "auction") {
            return html`<auction-product-card
              .product=${product}
              .index=${index}
            ></auction-product-card>`;
          } else {
            return html`<sale-product-card
              .product=${product}
              .index=${index}
            ></sale-product-card>`;
          }
        })}
      </div>
    `;
  }

  render() {
    return html`
      <div class="category-products">
        <div class="products-header">
          <h2 class="section-title">Products in this Category</h2>
          ${this.renderFilters()}
        </div>

        ${this.loading
          ? this.renderLoading()
          : this.error
          ? this.renderError()
          : this.products.length === 0
          ? this.renderEmptyState()
          : this.renderProductsGrid()}
        ${this.renderPagination()}
      </div>

      <style>
        .category-products {
          margin-top: 2rem;
        }

        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .section-title {
          color: #ffd700;
          font-size: 1.8rem;
          margin: 0;
          padding-bottom: 0.5rem;
          position: relative;
        }

        .section-title:after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: #ffd700;
        }

        .filters-container {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .sort-filter,
        .type-filter {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sort-filter label,
        .type-filter label {
          color: #ffffff;
          font-weight: 500;
        }

        .sort-filter select,
        .type-filter select {
          padding: 8px 12px;
          border: 1px solid #5d4037;
          border-radius: 5px;
          background-color: #3e2723;
          color: #ffffff;
          cursor: pointer;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 25px;
        }

        .loading-container,
        .error-container,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          text-align: center;
          background-color: rgba(93, 64, 55, 0.5);
          border-radius: 10px;
          margin: 2rem 0;
        }

        .loader {
          border: 4px solid rgba(255, 215, 0, 0.2);
          border-top: 4px solid #ffd700;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .error-container i,
        .empty-state i {
          font-size: 2.5rem;
          color: #ffd700;
          margin-bottom: 1rem;
        }

        .error-container h3,
        .empty-state h3 {
          color: #ffffff;
          margin: 0 0 0.5rem 0;
        }

        .error-container button,
        .empty-state button {
          margin-top: 1rem;
          padding: 0.5rem 1.5rem;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          border-radius: 5px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .error-container button:hover,
        .empty-state button:hover {
          background-color: #ffc400;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          margin-top: 2rem;
          flex-wrap: wrap;
        }

        .pagination-button {
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #3e2723;
          color: #ffffff;
          border: 1px solid #5d4037;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-button:hover:not(:disabled) {
          background-color: #5d4037;
        }

        .pagination-button.active {
          background-color: #ffd700;
          color: #3e2723;
          border-color: #ffd700;
          font-weight: bold;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-ellipsis {
          min-width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .products-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .filters-container {
            width: 100%;
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .sort-filter,
          .type-filter {
            width: 100%;
          }

          .sort-filter select,
          .type-filter select {
            flex: 1;
          }

          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
        }

        @media (max-width: 480px) {
          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }
}

customElements.define("category-products", CategoryProducts);
