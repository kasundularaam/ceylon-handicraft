import { LitElement, html } from "https://esm.run/lit";
import { fetchJson, postJson } from "../../utils/api_utils.js";
import { isSignedIn, getUser } from "../../utils/auth_utils.js";

class AuctionDetails extends LitElement {
  static get properties() {
    return {
      productId: { type: String, attribute: "product-id" },
      product: { type: Object },
      loading: { type: Boolean },
      error: { type: String },
      auction: { type: Object },
    };
  }

  constructor() {
    super();
    this.productId = null;
    this.product = null;
    this.loading = true;
    this.error = null;
    this.auction = {
      endTime: null,
      highestBid: null,
      userIsHighestBidder: false,
    };
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.productId) {
      this.fetchProductData();
    }
  }

  async fetchProductData() {
    this.loading = true;
    this.error = null;

    try {
      console.log("Fetching auction product data for ID:", this.productId);

      // Fetch product data from API
      this.product = await fetchJson(`/api/auction-product/${this.productId}`);
      console.log("Product data received:", this.product);

      // Calculate auction end time
      if (this.product && this.product.created_at) {
        const createdAt = new Date(this.product.created_at);
        const auctionDuration = this.product.auction_duration * 1000; // Convert seconds to milliseconds
        this.auction.endTime = new Date(createdAt.getTime() + auctionDuration);

        // Check if the user is the highest bidder
        this.checkHighestBidder();
      }
    } catch (err) {
      console.error("Error fetching product data:", err);
      this.error =
        err.message ||
        "Failed to load product data. Please try refreshing the page.";
    } finally {
      this.loading = false;
      // Force re-render
      this.requestUpdate();
    }
  }

  async checkHighestBidder() {
    if (!isSignedIn()) {
      this.auction.userIsHighestBidder = false;
      return;
    }

    try {
      const bidderStatus = await fetchJson(
        `/api/auction-product/${this.productId}/bidder-status`
      );
      this.auction.userIsHighestBidder = bidderStatus.is_highest_bidder;
    } catch (err) {
      console.error("Error checking highest bidder status:", err);
    }
  }

  async createOrder() {
    if (!isSignedIn()) {
      alert("Please login to complete your purchase");
      window.location.href =
        "/login?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }

    try {
      // Create order for the winning bid
      const order = await postJson(
        `/api/auction-product/${this.productId}/create-order`
      );

      // Redirect to checkout page
      window.location.href = `/checkout/${order.id}`;
    } catch (err) {
      alert(`Failed to create order: ${err.message}`);
      console.error("Error creating order:", err);
    }
  }

  isAuctionEnded() {
    if (!this.auction.endTime) return false;
    return new Date() > this.auction.endTime;
  }

  renderLoading() {
    return html`
      <div class="loading-container">
        <i class="fas fa-spinner fa-pulse"></i>
        <p>Loading auction details...</p>
      </div>

      <style>
        .loading-container {
          text-align: center;
          padding: 2rem;
          background-color: #5d4037;
          border-radius: 8px;
        }

        .loading-container i {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #ffd700;
        }

        .loading-container p {
          color: #e0e0e0;
        }
      </style>
    `;
  }

  renderError() {
    return html`
      <div class="error-card">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Something went wrong</h3>
        <p>${this.error}</p>
        <button class="retry-button" @click=${this.fetchProductData}>
          <i class="fas fa-sync-alt"></i> Try Again
        </button>
      </div>

      <style>
        .error-card {
          text-align: center;
          padding: 2rem;
          background-color: #5d4037;
          border-radius: 8px;
        }

        .error-icon {
          font-size: 2.5rem;
          color: #ffc107;
          margin-bottom: 1rem;
        }

        .error-card h3 {
          margin-bottom: 1rem;
          color: #ffffff;
        }

        .error-card p {
          margin-bottom: 1.5rem;
          color: #e0e0e0;
        }

        .retry-button {
          padding: 0.75rem 1.5rem;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          border-radius: 4px;
          font-family: "Poppins", sans-serif;
          font-weight: 500;
          cursor: pointer;
        }

        .retry-button:hover {
          background-color: #ffc107;
        }
      </style>
    `;
  }

  renderProduct() {
    const auctionEnded = this.isAuctionEnded();
    const showBuyButton = auctionEnded && this.auction.userIsHighestBidder;

    return html`
      <div class="auction-product">
        <div class="auction-product-header">
          <h1>${this.product.title}</h1>
          <auction-timer
            .endTime=${this.auction.endTime}
            .auctionEnded=${auctionEnded}
          ></auction-timer>
        </div>

        <div class="auction-product-grid">
          <div class="auction-product-left">
            <product-images .productId=${this.productId}></product-images>
          </div>

          <div class="auction-product-right">
            <product-description
              .product=${this.product}
              .category=${this.product.category}
            ></product-description>

            <craftsman-info
              .craftsman=${this.product.craftsman}
            ></craftsman-info>

            <bid-section
              .productId=${this.productId}
              .basePrice=${this.product.base_price}
              .auctionEnded=${auctionEnded}
              @highest-bid-update=${(e) =>
                this.handleHighestBidUpdate(e.detail)}
              @user-bid-status-change=${(e) =>
                this.handleUserBidStatusChange(e.detail)}
            ></bid-section>

            ${showBuyButton
              ? html`
                  <div class="auction-win-section">
                    <h3><i class="fas fa-trophy"></i> Congratulations!</h3>
                    <p>
                      You are the highest bidder. Complete your purchase now.
                    </p>
                    <button class="buy-button" @click=${this.createOrder}>
                      <i class="fas fa-shopping-cart"></i> Complete Purchase
                    </button>
                  </div>
                `
              : ""}
          </div>
        </div>
      </div>

      <style>
        .auction-product-header {
          margin-bottom: 2rem;
        }

        .auction-product-header h1 {
          margin-bottom: 1rem;
          color: #ffd700;
          font-size: 1.8rem;
        }

        .auction-product-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .auction-product-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .auction-win-section {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background-color: #5d4037;
          border-radius: 8px;
          text-align: center;
        }

        .auction-win-section h3 {
          color: #ffd700;
          margin-bottom: 0.5rem;
        }

        .auction-win-section p {
          margin-bottom: 1rem;
          color: #e0e0e0;
        }

        .buy-button {
          padding: 0.75rem 1.5rem;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          border-radius: 4px;
          font-family: "Poppins", sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .buy-button:hover {
          background-color: #ffc107;
        }
      </style>
    `;
  }

  handleHighestBidUpdate(detail) {
    // Update highest bid info
    this.auction.highestBid = detail.highestBid;
  }

  handleUserBidStatusChange(detail) {
    // Update whether current user is highest bidder
    this.auction.userIsHighestBidder = detail.isHighestBidder;
  }

  render() {
    if (this.loading) return this.renderLoading();
    if (this.error) return this.renderError();
    if (this.product) return this.renderProduct();

    return html`<p>No product data available</p>`;
  }
}

customElements.define("auction-details", AuctionDetails);
