import { LitElement, html } from "https://esm.run/lit";
import { createProductAuctionConnection } from "../../utils/websocket_utils.js";
import { getUser, isSignedIn } from "../../utils/auth_utils.js";

class CraftsmanAuctionWidget extends LitElement {
  static get properties() {
    return {
      productId: { type: String, attribute: "product-id" },
      basePrice: { type: Number, attribute: "base-price" },
      highestBid: { type: Number },
      bids: { type: Array },
      loading: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.productId = null;
    this.basePrice = 0;
    this.highestBid = null;
    this.bids = [];
    this.loading = false;
    this.wsConnection = null;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.productId) {
      this.connectToAuctionWs();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.wsConnection) {
      this.wsConnection.close();
    }
  }

  connectToAuctionWs() {
    this.wsConnection = createProductAuctionConnection(this.productId, {
      onOpen: () => {
        console.log("Connected to auction WebSocket");
      },
      onMessage: (data) => {
        console.log("Received auction data:", data);
        if (data.highest_bid) {
          this.highestBid = data.highest_bid;

          // Add to bids list (in a real app, you'd fetch the complete list)
          const now = new Date();
          this.bids = [
            {
              amount: data.highest_bid,
              timestamp: now.toISOString(),
              formattedTime: now.toLocaleTimeString(),
            },
            ...this.bids,
          ].slice(0, 10); // Keep only the 10 most recent bids
        }

        if (data.error) {
          console.error("Auction error:", data.error);
        }
      },
      onClose: () => {
        console.log("Disconnected from auction WebSocket");
      },
      onError: (error) => {
        console.error("Auction WebSocket error:", error);
      },
    });
  }

  render() {
    const currentBid = this.highestBid || this.basePrice;

    return html`
      <div class="auction-widget">
        <div class="auction-header">
          <h2>Auction Information</h2>
        </div>

        <div class="auction-info">
          <div class="bid-info">
            <div class="bid-label">Current Highest Bid</div>
            <div class="bid-value">Rs. ${currentBid.toFixed(2)}</div>
          </div>

          <div class="base-price-info">
            <div class="base-price-label">Base Price</div>
            <div class="base-price-value">Rs. ${this.basePrice.toFixed(2)}</div>
          </div>
        </div>

        ${this.bids.length > 0
          ? html`
              <div class="bid-history">
                <h3>Recent Bids</h3>
                <div class="bid-list">
                  ${this.bids.map(
                    (bid) => html`
                      <div class="bid-item">
                        <div class="bid-amount">
                          Rs. ${bid.amount.toFixed(2)}
                        </div>
                        <div class="bid-time">${bid.formattedTime}</div>
                      </div>
                    `
                  )}
                </div>
              </div>
            `
          : html`
              <div class="no-bids">
                <p>No bids have been placed yet</p>
              </div>
            `}
      </div>

      <style>
        :root {
          --dark-brown: #3e2723;
          --secondary-brown: #5d4037;
          --accent-yellow: #ffd700;
          --text-white: #ffffff;
          --subtle-grey: #e0e0e0;
        }

        .auction-widget {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }

        .auction-header h2 {
          color: var(--accent-yellow);
          font-size: 1.3rem;
          margin: 0 0 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.75rem;
        }

        .auction-info {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .bid-info,
        .base-price-info {
          flex: 1;
          min-width: 200px;
        }

        .bid-label,
        .base-price-label {
          color: var(--subtle-grey);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .bid-value {
          color: var(--accent-yellow);
          font-size: 1.8rem;
          font-weight: 700;
        }

        .base-price-value {
          color: var(--text-white);
          font-size: 1.2rem;
        }

        .bid-history h3 {
          color: var(--text-white);
          font-size: 1.1rem;
          margin: 0 0 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.5rem;
        }

        .bid-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .bid-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .bid-amount {
          color: var(--accent-yellow);
          font-weight: 600;
        }

        .bid-time {
          color: var(--subtle-grey);
          font-size: 0.9rem;
        }

        .no-bids {
          text-align: center;
          color: var(--subtle-grey);
          padding: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .no-bids p {
          margin: 0;
        }
      </style>
    `;
  }
}

customElements.define("craftsman-auction-widget", CraftsmanAuctionWidget);
