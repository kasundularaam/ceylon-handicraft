import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";
import "../../components/global/auction-product-card.js";
import "../../components/global/sale-product-card.js";

class FeaturedProductsSection extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      type: { type: String }, // 'sale' or 'auction'
      products: { type: Array },
      loading: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.title = "Featured Products";
    this.type = "sale";
    this.products = [];
    this.loading = true;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchProducts();
  }

  async fetchProducts() {
    try {
      const endpoint =
        this.type === "auction"
          ? "/api/landing/featured/auction"
          : "/api/landing/featured/sale";

      const products = await fetchJson(endpoint);

      // Fetch image paths for each product
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
      this.loading = false;
    } catch (error) {
      console.error(`Error fetching ${this.type} products:`, error);
      this.products = [];
      this.loading = false;
    }
  }

  renderLoading() {
    return html`
      <div class="loading-container">
        <div class="loader"></div>
        <p>Loading featured products...</p>
      </div>
    `;
  }

  renderProducts() {
    if (this.products.length === 0) {
      return html`
        <div class="no-products">
          <p>No ${this.type} products available at the moment.</p>
        </div>
      `;
    }

    return html`
      <div class="products-grid">
        ${this.products.map((product, index) =>
          this.type === "auction"
            ? html`<auction-product-card
                .product=${product}
                .index=${index}
              ></auction-product-card>`
            : html`<sale-product-card
                .product=${product}
                .index=${index}
              ></sale-product-card>`
        )}
      </div>
    `;
  }

  render() {
    return html`
      <section class="featured-products-section ${this.type}-products">
        <div class="section-header">
          <h2 class="section-title">${this.title}</h2>
          <a href="/${this.type}" class="view-all-link">
            View All
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>

        ${this.loading ? this.renderLoading() : this.renderProducts()}
      </section>

      <style>
        .featured-products-section {
          padding: 40px 20px;
          margin-bottom: 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .section-title {
          color: #ffffff;
          font-size: 1.8rem;
          margin: 0;
          position: relative;
          padding-left: 15px;
        }

        .section-title:before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 5px;
          background-color: #ffd700;
          border-radius: 2px;
        }

        .view-all-link {
          color: #ffd700;
          text-decoration: none;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .view-all-link:hover {
          opacity: 0.8;
          transform: translateX(5px);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 25px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
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

        .no-products {
          text-align: center;
          padding: 30px;
          color: #e0e0e0;
          border: 1px dashed #5d4037;
          border-radius: 8px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
        }

        @media (max-width: 480px) {
          .products-grid {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      </style>
    `;
  }
}

customElements.define("featured-products-section", FeaturedProductsSection);
