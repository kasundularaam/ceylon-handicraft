import { LitElement, html } from "https://esm.run/lit";

class ProductDescription extends LitElement {
  static get properties() {
    return {
      product: { type: Object },
      category: { type: Object },
      expanded: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.product = null;
    this.category = null;
    this.expanded = false;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  render() {
    if (!this.product) {
      return html`
        <div class="product-description-loading">
          <i class="fas fa-spinner fa-pulse"></i>
          <p>Loading product details...</p>
        </div>

        <style>
          .product-description-loading {
            background-color: #5d4037;
            padding: 1.5rem;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 1.5rem;
          }

          .product-description-loading i {
            font-size: 1.5rem;
            color: #ffd700;
            margin-bottom: 0.5rem;
          }

          .product-description-loading p {
            color: #e0e0e0;
          }
        </style>
      `;
    }

    return html`
      <div class="product-description">
        <div class="product-meta">
          <div class="meta-item">
            <i class="fas fa-tag"></i>
            ${this.category ? this.category.title : "Uncategorized"}
          </div>

          ${this.product.length
            ? html`
                <div class="meta-item">
                  <i class="fas fa-ruler-combined"></i>
                  ${this.product.length} × ${this.product.width} ×
                  ${this.product.height} cm
                </div>
              `
            : ""}
          ${this.product.weight
            ? html`
                <div class="meta-item">
                  <i class="fas fa-weight-hanging"></i>
                  ${this.product.weight} kg
                </div>
              `
            : ""}
        </div>

        <div class="product-base-price">
          <span class="label">Starting Price:</span>
          <span class="value"
            >${this.product.base_price.toLocaleString()} LKR</span
          >
        </div>

        <div class="product-description-content">
          <h3>Description</h3>

          <div class="description-text ${this.expanded ? "expanded" : ""}">
            ${this.product.description || "No description provided."}
          </div>

          ${this.product.description && this.product.description.length > 200
            ? html`
                <button class="btn-expand" @click=${this.toggleExpand}>
                  ${this.expanded ? "Show Less" : "Read More"}
                </button>
              `
            : ""}
        </div>
      </div>

      <style>
        .product-description {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .product-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        .product-base-price {
          background-color: rgba(0, 0, 0, 0.15);
          border-radius: 4px;
          padding: 0.75rem;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-base-price .label {
          font-size: 0.9rem;
          color: #e0e0e0;
        }

        .product-base-price .value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #ffd700;
        }

        .product-description-content h3 {
          font-size: 1.2rem;
          margin-bottom: 0.75rem;
          color: #ffffff;
        }

        .description-text {
          line-height: 1.6;
          color: #e0e0e0;
          max-height: 120px;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .description-text.expanded {
          max-height: 1000px;
        }

        .btn-expand {
          background: none;
          border: none;
          color: #ffd700;
          font-size: 0.9rem;
          padding: 0.5rem 0;
          cursor: pointer;
          display: block;
          margin-top: 0.5rem;
        }

        .btn-expand:hover {
          text-decoration: underline;
        }
      </style>
    `;
  }
}

customElements.define("product-description", ProductDescription);
