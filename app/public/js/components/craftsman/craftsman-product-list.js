import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class CraftsmanProductList extends LitElement {
  static get properties() {
    return {
      products: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.products = [];
    this.loading = true;
    this.error = null;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadProducts();
  }

  async loadProducts() {
    try {
      this.loading = true;
      this.error = null;

      this.products = await fetchJson("/api/products/craftsman");
    } catch (error) {
      console.error("Error loading products:", error);
      this.error = error.message || "Failed to load products";
    } finally {
      this.loading = false;
    }
  }

  async handleDeleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await fetchJson(`/api/products/${productId}`, {
        method: "DELETE",
      });

      // Refresh product list
      await this.loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product: " + (error.message || "Unknown error"));
    }
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading-container">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading products...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="error-container">
          <i class="fas fa-exclamation-circle"></i>
          <p>${this.error}</p>
          <button @click="${this.loadProducts}" class="retry-btn">Retry</button>
        </div>
      `;
    }

    if (this.products.length === 0) {
      return html`
        <div class="empty-container">
          <i class="fas fa-box-open"></i>
          <p>You don't have any products yet</p>
          <a href="/craftsman/product?mode=new" class="add-btn">
            Add Your First Product
          </a>
        </div>
      `;
    }

    return html`
      <div class="products-grid">
        ${this.products.map(
          (product) => html`
            <craftsman-product-card
              .product="${product}"
              @delete-product="${() => this.handleDeleteProduct(product.id)}"
            >
            </craftsman-product-card>
          `
        )}
      </div>

      <style>
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .loading-container,
        .error-container,
        .empty-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          text-align: center;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2rem;
        }

        .loading-container i,
        .error-container i,
        .empty-container i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: var(--accent-yellow);
        }

        .error-container i {
          color: #f44336;
        }

        .retry-btn,
        .add-btn {
          background-color: var(--accent-yellow);
          color: var(--dark-brown);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.3s ease;
          font-family: "Poppins", sans-serif;
          text-decoration: none;
          display: inline-block;
        }

        .retry-btn:hover,
        .add-btn:hover {
          background-color: #e5c100;
        }
      </style>
    `;
  }
}

customElements.define("craftsman-product-list", CraftsmanProductList);
