import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class ProductDetail extends LitElement {
  static get properties() {
    return {
      product: { type: Object },
      images: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
      activeImageIndex: { type: Number },
    };
  }

  constructor() {
    super();
    // Get product ID from URL
    const urlParts = window.location.pathname.split("/");
    this.productId = urlParts[urlParts.length - 1];

    this.product = null;
    this.images = [];
    this.loading = true;
    this.error = null;
    this.activeImageIndex = 0;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    await this.fetchProductData();
  }

  async fetchProductData() {
    try {
      // Fetch product details
      this.product = await fetchJson(`/api/product-details/${this.productId}`);
      console.log("Product data:", this.product);

      // Fetch product images
      const imagesResponse = await fetchJson(
        `/api/product-details/${this.productId}/images`
      );
      this.images = imagesResponse.images || [];

      // Use placeholder if no images
      if (this.images.length === 0) {
        this.images = ["/static/images/placeholder-product.jpg"];
      }

      this.loading = false;
    } catch (error) {
      console.error("Error fetching product data:", error);
      this.error = error.message;
      this.loading = false;
    }
  }

  setActiveImage(index) {
    this.activeImageIndex = index;
  }

  formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  render() {
    if (this.loading) {
      return html`
        <div class="product-detail-loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading product details...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="product-detail-error">
          <i class="fas fa-exclamation-circle"></i>
          <p>Error loading product: ${this.error}</p>
        </div>
      `;
    }

    return html`
      <div class="product-detail">
        <div class="product-gallery">
          <product-gallery
            .images=${this.images}
            active-index=${this.activeImageIndex}
            @image-select=${(e) => this.setActiveImage(e.detail.index)}
          ></product-gallery>
        </div>

        <div class="product-info">
          <h1 class="product-title">${this.product.title}</h1>

          <div class="product-category">
            <span class="category-label">Category:</span>
            <span class="category-value">${this.product.category_title}</span>
          </div>

          <div class="product-price">
            <span class="price-value"
              >${this.formatPrice(this.product.base_price)}</span
            >
          </div>

          <div class="product-description">
            <p>${this.product.description}</p>
          </div>

          <div class="product-dimensions">
            <h3>Dimensions & Weight</h3>
            <ul>
              ${this.product.weight
                ? html`<li>
                    <strong>Weight:</strong> ${this.product.weight} kg
                  </li>`
                : ""}
              ${this.product.length
                ? html`<li>
                    <strong>Length:</strong> ${this.product.length} cm
                  </li>`
                : ""}
              ${this.product.width
                ? html`<li>
                    <strong>Width:</strong> ${this.product.width} cm
                  </li>`
                : ""}
              ${this.product.height
                ? html`<li>
                    <strong>Height:</strong> ${this.product.height} cm
                  </li>`
                : ""}
            </ul>
          </div>

          <product-buy
            product-id=${this.productId}
            product-title=${this.product.title}
            product-price=${this.product.base_price}
          ></product-buy>
        </div>
      </div>

      <style>
        .product-detail {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          margin: 1rem 0;
        }

        .product-gallery {
          flex: 1;
          min-width: 300px;
          max-width: 500px;
        }

        .product-info {
          flex: 1;
          min-width: 300px;
        }

        .product-title {
          color: #ffd700;
          font-size: 2rem;
          margin: 0 0 1rem 0;
        }

        .product-category {
          margin-bottom: 1rem;
        }

        .category-label {
          color: #e0e0e0;
          margin-right: 0.5rem;
        }

        .category-value {
          color: #ffd700;
          font-weight: 500;
        }

        .product-price {
          margin: 1.5rem 0;
        }

        .price-value {
          color: #ffffff;
          font-size: 1.8rem;
          font-weight: 600;
        }

        .product-description {
          margin: 1.5rem 0;
          line-height: 1.6;
          color: #e0e0e0;
        }

        .product-dimensions {
          background-color: #5d4037;
          padding: 1rem;
          border-radius: 8px;
          margin: 1.5rem 0;
        }

        .product-dimensions h3 {
          color: #ffd700;
          margin-top: 0;
          margin-bottom: 0.5rem;
        }

        .product-dimensions ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .product-dimensions li {
          margin-bottom: 0.5rem;
        }

        .product-detail-loading,
        .product-detail-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: #e0e0e0;
          text-align: center;
        }

        .fa-spinner,
        .fa-exclamation-circle {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #ffd700;
        }

        @media (max-width: 768px) {
          .product-detail {
            flex-direction: column;
          }

          .product-gallery {
            max-width: 100%;
          }
        }
      </style>
    `;
  }
}

customElements.define("product-detail", ProductDetail);
