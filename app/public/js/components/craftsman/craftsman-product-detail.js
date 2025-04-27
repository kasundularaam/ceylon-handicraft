import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";
import { createProductAuctionConnection } from "../../utils/websocket_utils.js";

class CraftsmanProductDetail extends LitElement {
  static get properties() {
    return {
      productId: { type: String, attribute: "product-id" },
      product: { type: Object },
      activeImageIndex: { type: Number },
      loading: { type: Boolean },
      error: { type: String },
      highestBid: { type: Number },
    };
  }

  constructor() {
    super();
    this.productId = null;
    this.product = null;
    this.activeImageIndex = 0;
    this.loading = true;
    this.error = null;
    this.highestBid = null;
    this.wsConnection = null;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  async connectedCallback() {
    super.connectedCallback();
    if (this.productId) {
      await this.loadProduct();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.wsConnection) {
      this.wsConnection.close();
    }
  }

  async loadProduct() {
    try {
      this.loading = true;
      this.error = null;

      this.product = await fetchJson(`/api/products/${this.productId}`);

      // Connect to WebSocket for auction products
      if (this.product && this.product.type === "Auction") {
        this.connectToAuctionWs();
      }
    } catch (error) {
      console.error("Error loading product:", error);
      this.error = error.message || "Failed to load product";
    } finally {
      this.loading = false;
    }
  }

  connectToAuctionWs() {
    this.wsConnection = createProductAuctionConnection(this.productId, {
      onMessage: (data) => {
        if (data.highest_bid) {
          this.highestBid = data.highest_bid;
        }
      },
    });
  }

  setActiveImage(index) {
    this.activeImageIndex = index;
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading-container">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading product details...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="error-container">
          <i class="fas fa-exclamation-circle"></i>
          <p>${this.error}</p>
          <button @click="${this.loadProduct}" class="retry-btn">Retry</button>
        </div>
      `;
    }

    if (!this.product) {
      return html`
        <div class="error-container">
          <i class="fas fa-box"></i>
          <p>Product not found</p>
        </div>
      `;
    }

    const displayPrice =
      this.product.type === "Auction" &&
      (this.highestBid || this.product.highest_bid)
        ? this.highestBid || this.product.highest_bid
        : this.product.base_price;

    const hasImages = this.product.images && this.product.images.length > 0;
    const activeImage = hasImages
      ? this.product.images[this.activeImageIndex]
      : "/static/images/placeholder-product.jpg";

    return html`
      <div class="product-detail">
        <div class="product-gallery">
          <div class="main-image">
            <img src="${activeImage}" alt="${this.product.title}" />
            <div class="product-type ${this.product.type.toLowerCase()}">
              ${this.product.type === "Auction"
                ? html`<i class="fas fa-gavel"></i> Auction`
                : html`<i class="fas fa-tag"></i> Sale`}
            </div>
          </div>

          ${hasImages && this.product.images.length > 1
            ? html`
                <div class="image-thumbnails">
                  ${this.product.images.map(
                    (image, index) => html`
                      <div
                        class="thumbnail ${index === this.activeImageIndex
                          ? "active"
                          : ""}"
                        @click="${() => this.setActiveImage(index)}"
                      >
                        <img src="${image}" alt="Thumbnail ${index + 1}" />
                      </div>
                    `
                  )}
                </div>
              `
            : ""}
        </div>

        <div class="product-info">
          <h1 class="product-title">${this.product.title}</h1>

          <div class="price-section">
            ${this.product.type === "Auction"
              ? html`
                  <div class="price auction">
                    <div class="price-label">Current Highest Bid</div>
                    <div class="price-value">
                      Rs. ${displayPrice.toFixed(2)}
                    </div>
                    <div class="base-price">
                      Base Price: Rs. ${this.product.base_price.toFixed(2)}
                    </div>
                  </div>
                `
              : html`
                  <div class="price sale">
                    <div class="price-label">Price</div>
                    <div class="price-value">
                      Rs. ${displayPrice.toFixed(2)}
                    </div>
                  </div>
                `}
          </div>

          <div class="details-section">
            <h2>Details</h2>

            <div class="detail-row">
              <div class="detail-label">Category</div>
              <div class="detail-value">${this.product.category_id}</div>
            </div>

            ${this.product.weight
              ? html`
                  <div class="detail-row">
                    <div class="detail-label">Weight</div>
                    <div class="detail-value">${this.product.weight} kg</div>
                  </div>
                `
              : ""}
            ${this.product.length && this.product.width && this.product.height
              ? html`
                  <div class="detail-row">
                    <div class="detail-label">Dimensions</div>
                    <div class="detail-value">
                      ${this.product.length} × ${this.product.width} ×
                      ${this.product.height} cm
                    </div>
                  </div>
                `
              : ""}

            <div class="detail-row">
              <div class="detail-label">Created</div>
              <div class="detail-value">
                ${new Date(this.product.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          ${this.product.description
            ? html`
                <div class="description-section">
                  <h2>Description</h2>
                  <p>${this.product.description}</p>
                </div>
              `
            : ""}
          ${this.product.type === "Auction"
            ? html`
                <craftsman-auction-widget
                  product-id="${this.productId}"
                  base-price="${this.product.base_price}"
                ></craftsman-auction-widget>
              `
            : ""}
        </div>
      </div>

      <style>
        :root {
          --dark-brown: #3e2723;
          --secondary-brown: #5d4037;
          --accent-yellow: #ffd700;
          --text-white: #ffffff;
          --subtle-grey: #e0e0e0;
        }

        .product-detail {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          background-color: var(--secondary-brown);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .product-detail {
            grid-template-columns: 1fr;
          }
        }

        .product-gallery {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .main-image {
          position: relative;
          height: 400px;
          border-radius: 8px;
          overflow: hidden;
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-type {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background-color: rgba(0, 0, 0, 0.6);
          color: var(--accent-yellow);
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .image-thumbnails {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .thumbnail:hover {
          opacity: 0.9;
          transform: scale(1.05);
        }

        .thumbnail.active {
          opacity: 1;
          border: 2px solid var(--accent-yellow);
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .product-title {
          margin: 0;
          color: var(--text-white);
          font-size: 1.8rem;
          font-weight: 600;
        }

        .price-section {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
        }

        .price-label {
          color: var(--subtle-grey);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .price-value {
          color: var(--accent-yellow);
          font-size: 2rem;
          font-weight: 700;
        }

        .base-price {
          color: var(--subtle-grey);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .details-section,
        .description-section {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1.5rem;
        }

        .details-section h2,
        .description-section h2 {
          color: var(--text-white);
          font-size: 1.3rem;
          margin: 0 0 1rem 0;
        }

        .detail-row {
          display: flex;
          margin-bottom: 0.75rem;
        }

        .detail-label {
          flex: 0 0 120px;
          color: var(--subtle-grey);
        }

        .detail-value {
          color: var(--text-white);
        }

        .description-section p {
          color: var(--text-white);
          line-height: 1.6;
          margin: 0;
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          text-align: center;
          background-color: var(--secondary-brown);
          border-radius: 8px;
          padding: 2rem;
        }

        .loading-container i,
        .error-container i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: var(--accent-yellow);
        }

        .error-container i {
          color: #f44336;
        }

        .retry-btn {
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
        }

        .retry-btn:hover {
          background-color: #e5c100;
        }
      </style>
    `;
  }
}

customElements.define("craftsman-product-detail", CraftsmanProductDetail);
