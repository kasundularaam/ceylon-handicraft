import { LitElement, html } from "https://esm.run/lit";
import { createProductAuctionConnection } from "../../utils/websocket_utils.js";

class CraftsmanProductCard extends LitElement {
  static get properties() {
    return {
      product: { type: Object },
      highestBid: { type: Number },
    };
  }

  constructor() {
    super();
    this.product = null;
    this.highestBid = null;
    this.wsConnection = null;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();

    // Connect to WebSocket for auction products
    if (this.product && this.product.type === "Auction") {
      this.connectToAuctionWs();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Close WebSocket connection when component is removed
    if (this.wsConnection) {
      this.wsConnection.close();
    }
  }

  updated(changedProperties) {
    if (
      changedProperties.has("product") &&
      this.product &&
      this.product.type === "Auction"
    ) {
      if (this.wsConnection) {
        this.wsConnection.close();
      }
      this.connectToAuctionWs();
    }
  }

  connectToAuctionWs() {
    this.wsConnection = createProductAuctionConnection(this.product.id, {
      onMessage: (data) => {
        if (data.highest_bid) {
          this.highestBid = data.highest_bid;
        }
      },
    });
  }

  handleDelete() {
    const event = new CustomEvent("delete-product", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.product) {
      return html`<div class="product-card loading"></div>`;
    }

    const displayPrice =
      this.product.type === "Auction" &&
      (this.highestBid || this.product.highest_bid)
        ? this.highestBid || this.product.highest_bid
        : this.product.base_price;

    const imageUrl =
      this.product.images && this.product.images.length > 0
        ? this.product.images[0]
        : "/static/images/placeholder-product.jpg";

    return html`
      <div class="product-card ${this.product.type.toLowerCase()}">
        <div class="product-image">
          <img src="${imageUrl}" alt="${this.product.title}" />
          <div class="product-type">
            ${this.product.type === "Auction"
              ? html`<i class="fas fa-gavel"></i> Auction`
              : html`<i class="fas fa-tag"></i> Sale`}
          </div>
        </div>

        <div class="product-info">
          <h3 class="product-title">${this.product.title}</h3>

          <div class="product-details">
            ${this.product.category
              ? html`
                  <div class="product-category">
                    <i class="fas fa-folder"></i> ${this.product.category}
                  </div>
                `
              : ""}

            <div class="product-price">
              <i class="fas fa-coins"></i> Rs. ${displayPrice.toFixed(2)}
              ${this.product.type === "Auction"
                ? html`<span class="price-label">Current Bid</span>`
                : html`<span class="price-label">Price</span>`}
            </div>
          </div>
        </div>

        <div class="product-actions">
          <a href="/craftsman/products/${this.product.id}" class="view-btn">
            <i class="fas fa-eye"></i>
          </a>
          <a
            href="/craftsman/product?mode=edit&id=${this.product.id}"
            class="edit-btn"
          >
            <i class="fas fa-edit"></i>
          </a>
          <button class="delete-btn" @click="${this.handleDelete}">
            <i class="fas fa-trash"></i>
          </button>
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

        .product-card {
          background-color: var(--secondary-brown);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .product-card.auction {
          border: 2px solid var(--accent-yellow);
        }

        .product-image {
          height: 200px;
          position: relative;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.05);
        }

        .product-type {
          position: absolute;
          top: 10px;
          left: 10px;
          background-color: rgba(0, 0, 0, 0.6);
          color: var(--accent-yellow);
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .product-info {
          padding: 1rem;
        }

        .product-title {
          margin: 0 0 1rem 0;
          color: var(--text-white);
          font-size: 1.2rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .product-category,
        .product-price {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--subtle-grey);
          font-size: 0.9rem;
        }

        .product-price {
          color: var(--accent-yellow);
          font-weight: 600;
        }

        .price-label {
          color: var(--subtle-grey);
          font-size: 0.8rem;
          font-weight: normal;
          margin-left: 0.3rem;
        }

        .product-actions {
          display: flex;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .view-btn,
        .edit-btn,
        .delete-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          background: none;
          border: none;
          color: var(--text-white);
          cursor: pointer;
          transition: background-color 0.3s ease;
          text-decoration: none;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .delete-btn {
          border-right: none;
        }

        .view-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .edit-btn:hover {
          background-color: rgba(255, 215, 0, 0.2);
          color: var(--accent-yellow);
        }

        .delete-btn:hover {
          background-color: rgba(244, 67, 54, 0.2);
          color: #f44336;
        }

        .product-card.loading {
          height: 330px;
          background: linear-gradient(
            90deg,
            var(--secondary-brown) 25%,
            rgba(93, 64, 55, 0.8) 50%,
            var(--secondary-brown) 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      </style>
    `;
  }
}

customElements.define("craftsman-product-card", CraftsmanProductCard);
