import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";
import "../landing/featured-products-section.js";

class ProductListing extends LitElement {
  static get properties() {
    return {
      type: { type: String }, // 'sale' or 'auction'
      products: { type: Array },
      loading: { type: Boolean },
      currentPage: { type: Number },
      totalPages: { type: Number },
      category: { type: String },
      searchQuery: { type: String },
      sortBy: { type: String },
      filterOptions: { type: Object },
    };
  }

  constructor() {
    super();
    this.type = "sale";
    this.products = [];
    this.loading = true;
    this.currentPage = 1;
    this.totalPages = 1;
    this.category = "";
    this.searchQuery = "";
    this.sortBy = "newest";
    this.filterOptions = {
      categories: [],
      priceRanges: [],
    };

    // Parse URL parameters
    this.parseUrlParams();
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchProducts();
    this.fetchFilterOptions();

    // Add event listener for browser back button
    window.addEventListener("popstate", () => {
      this.parseUrlParams();
      this.fetchProducts();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("popstate", () => {
      this.parseUrlParams();
      this.fetchProducts();
    });
  }

  parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    this.currentPage = parseInt(urlParams.get("page") || "1");
    this.category = urlParams.get("category") || "";
    this.searchQuery = urlParams.get("search") || "";
    this.sortBy = urlParams.get("sort") || "newest";
  }

  updateUrlParams() {
    const urlParams = new URLSearchParams();
    if (this.currentPage > 1)
      urlParams.set("page", this.currentPage.toString());
    if (this.category) urlParams.set("category", this.category);
    if (this.searchQuery) urlParams.set("search", this.searchQuery);
    if (this.sortBy !== "newest") urlParams.set("sort", this.sortBy);

    const newUrl = `${window.location.pathname}${
      urlParams.toString() ? "?" + urlParams.toString() : ""
    }`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  }

  async fetchProducts() {
    try {
      this.loading = true;

      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", this.currentPage.toString());
      params.append("limit", "12"); // 12 products per page
      if (this.category) params.append("category", this.category);
      if (this.searchQuery) params.append("search", this.searchQuery);
      params.append("sort", this.sortBy);

      const endpoint =
        this.type === "auction"
          ? `/api/products/auction?${params.toString()}`
          : `/api/products/sale?${params.toString()}`;

      // Fallback to featured products endpoint if the product endpoints aren't implemented yet
      const fallbackEndpoint =
        this.type === "auction"
          ? "/api/landing/featured/auction"
          : "/api/landing/featured/sale";

      let response;
      try {
        response = await fetchJson(endpoint);
      } catch (error) {
        console.warn(
          `Product endpoint not available, using fallback: ${fallbackEndpoint}`
        );
        response = {
          products: await fetchJson(fallbackEndpoint),
          totalPages: 1,
          currentPage: 1,
        };
      }

      // Fetch image paths for each product
      const products = response.products || response;
      for (let i = 0; i < products.length; i++) {
        try {
          const imageData = await fetchJson(
            `/api/landing/product/${products[i].id}/images`
          );
          products[i].image_paths = imageData.images;
          products[i].currentImageIndex = 0; // Initialize current image index
        } catch (error) {
          console.error(
            `Error fetching images for product ${products[i].id}:`,
            error
          );
          products[i].image_paths = [];
        }
      }

      this.products = products;
      this.totalPages = response.totalPages || 1;
      this.currentPage = response.currentPage || 1;
      this.loading = false;

      // Update URL params to reflect the current state
      this.updateUrlParams();

      // Scroll to top when products update
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(`Error fetching ${this.type} products:`, error);
      this.products = [];
      this.loading = false;
    }
  }

  async fetchFilterOptions() {
    try {
      // Try to get filter options from API
      try {
        const endpoint = `/api/products/filters?type=${this.type}`;
        const response = await fetchJson(endpoint);
        this.filterOptions = response;
      } catch (error) {
        console.warn("Filter options endpoint not available, using defaults");
        // Default filter options if endpoint not available
        this.filterOptions = {
          categories: [
            {
              id: "wood_carving",
              title: "Wood Carvings & Art",
              icon: "fa fa-tree",
            },
            {
              id: "mask",
              title: "Sri Lankan Masks",
              icon: "fa fa-theater-masks",
            },
            { id: "textile", title: "Handwoven & Batik", icon: "fa fa-tshirt" },
            { id: "metal", title: "Brass & Metal Art", icon: "fa fa-gavel" },
            {
              id: "pottery",
              title: "Pottery & Ceramics",
              icon: "fa fa-wine-bottle",
            },
            {
              id: "lacquer",
              title: "Lacquerware Treasures",
              icon: "fa fa-brush",
            },
            { id: "fiber", title: "Natural Fiber Weaves", icon: "fa fa-leaf" },
          ],
          priceRanges: [
            { id: "under50", title: "Under $50", min: 0, max: 50 },
            { id: "50to100", title: "$50 - $100", min: 50, max: 100 },
            { id: "100to250", title: "$100 - $250", min: 100, max: 250 },
            { id: "250plus", title: "Over $250", min: 250, max: null },
          ],
        };
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }

  handleCategoryChange(event) {
    this.category = event.target.value;
    this.currentPage = 1;
    this.fetchProducts();
  }

  handleSortChange(event) {
    this.sortBy = event.target.value;
    this.currentPage = 1;
    this.fetchProducts();
  }

  handleSearch(event) {
    event.preventDefault();
    const searchInput = this.querySelector("#search-input");
    this.searchQuery = searchInput.value.trim();
    this.currentPage = 1;
    this.fetchProducts();
  }

  handlePageChange(newPage) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.currentPage = newPage;
    this.fetchProducts();
  }

  renderLoading() {
    return html`
      <div class="loading-container">
        <div class="loader"></div>
        <p>Loading products...</p>
      </div>
    `;
  }

  renderFilters() {
    return html`
      <div class="product-filters">
        <div class="search-filter">
          <form @submit=${this.handleSearch}>
            <input
              type="text"
              id="search-input"
              placeholder="Search products..."
              value="${this.searchQuery}"
            />
            <button type="submit">
              <i class="fas fa-search"></i>
            </button>
          </form>
        </div>

        <div class="category-filter">
          <label for="category-select">Category:</label>
          <select id="category-select" @change=${this.handleCategoryChange}>
            <option value="">All Categories</option>
            ${this.filterOptions.categories.map(
              (category) => html`
                <option
                  value="${category.id}"
                  ?selected=${this.category === category.id}
                >
                  ${category.title}
                </option>
              `
            )}
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

  renderEmptyState() {
    return html`
      <div class="empty-state">
        <i class="fas fa-box-open"></i>
        <h3>No Products Found</h3>
        <p>
          ${this.searchQuery
            ? `No ${this.type} products match your search for "${this.searchQuery}"`
            : `No ${this.type} products available`}
        </p>
        ${this.searchQuery || this.category
          ? html`
              <button
                @click=${() => {
                  this.searchQuery = "";
                  this.category = "";
                  this.fetchProducts();
                }}
              >
                Clear Filters
              </button>
            `
          : ""}
      </div>
    `;
  }

  render() {
    // Use the FeaturedProductsSection component to display the products
    // This reuses the product card rendering logic we already have
    return html`
      <div class="product-listing ${this.type}-products">
        <div class="filters-container">${this.renderFilters()}</div>

        ${this.loading
          ? this.renderLoading()
          : html`
              ${this.products.length === 0
                ? this.renderEmptyState()
                : html`
                    <featured-products-section
                      .title=${`${
                        this.type === "auction" ? "Auction" : "Sale"
                      } Products`}
                      .type=${this.type}
                      .products=${this.products}
                      .loading=${false}
                    ></featured-products-section>
                  `}
              ${this.renderPagination()}
            `}
      </div>

      <style>
        .product-listing {
          padding: 20px;
          margin-bottom: 30px;
        }

        .filters-container {
          margin-bottom: 30px;
        }

        .product-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
          padding: 20px;
          background-color: rgba(93, 64, 55, 0.5);
          border-radius: 10px;
          align-items: center;
        }

        .search-filter {
          flex: 1;
          min-width: 200px;
        }

        .search-filter form {
          display: flex;
          border: 1px solid #5d4037;
          border-radius: 30px;
          overflow: hidden;
          background-color: #3e2723;
        }

        .search-filter input {
          flex: 1;
          padding: 10px 15px;
          border: none;
          font-size: 16px;
          background-color: transparent;
          color: #ffffff;
        }

        .search-filter input::placeholder {
          color: #e0e0e0;
        }

        .search-filter button {
          background-color: #ffd700;
          border: none;
          padding: 10px 15px;
          cursor: pointer;
          color: #3e2723;
          font-size: 16px;
          transition: background-color 0.3s;
        }

        .search-filter button:hover {
          background-color: #ffc400;
        }

        .category-filter,
        .sort-filter {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-filter label,
        .sort-filter label {
          color: #ffffff;
          font-weight: 500;
        }

        .category-filter select,
        .sort-filter select {
          padding: 8px 12px;
          border: 1px solid #5d4037;
          border-radius: 5px;
          background-color: #3e2723;
          color: #ffffff;
          cursor: pointer;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50px 0;
          color: #e0e0e0;
        }

        .loader {
          border: 4px solid rgba(255, 215, 0, 0.2);
          border-top: 4px solid #ffd700;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          margin-top: 30px;
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

        .empty-state {
          text-align: center;
          padding: 50px 20px;
          color: #e0e0e0;
        }

        .empty-state i {
          font-size: 3rem;
          color: #ffd700;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 1.8rem;
          margin-bottom: 10px;
          color: #ffffff;
        }

        .empty-state p {
          margin-bottom: 20px;
        }

        .empty-state button {
          padding: 10px 20px;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s;
        }

        .empty-state button:hover {
          background-color: #ffc400;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .product-filters {
            flex-direction: column;
            align-items: flex-start;
          }

          .search-filter,
          .category-filter,
          .sort-filter {
            width: 100%;
          }
        }
      </style>
    `;
  }
}

customElements.define("product-listing", ProductListing);
