import { LitElement, html } from "https://esm.run/lit";
import { createProductAuctionConnection } from "../../utils/websocket_utils.js";
import { isSignedIn, getUser } from "../../utils/auth_utils.js";
import { fetchJson } from "../../utils/api_utils.js";

class BidSection extends LitElement {
  static get properties() {
    return {
      productId: { type: String },
      basePrice: { type: Number },
      auctionEnded: { type: Boolean },
      currentBid: { type: Number },
      nextBid: { type: Number },
      bidHistory: { type: Array },
      wsConnection: { type: Object },
      loadingBids: { type: Boolean },
      userIsHighestBidder: { type: Boolean },
      currentUserId: { type: String },
    };
  }

  constructor() {
    super();
    this.productId = null;
    this.basePrice = 0;
    this.auctionEnded = false;
    this.currentBid = 0;
    this.nextBid = 0;
    this.bidHistory = [];
    this.wsConnection = null;
    this.loadingBids = true;
    this.userIsHighestBidder = false;
    this.currentUserId = null;

    // Bid increment rules (can be adjusted as needed)
    this.bidIncrements = [
      { threshold: 100, increment: 5 },
      { threshold: 500, increment: 10 },
      { threshold: 1000, increment: 25 },
      { threshold: 5000, increment: 50 },
      { threshold: 10000, increment: 100 },
    ];
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();

    // Get current user ID if authenticated
    if (isSignedIn()) {
      this.fetchCurrentUser();
    }

    if (this.productId) {
      this.setupWebSocketConnection();
      this.fetchBidHistory();
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
    // If product ID changes, reset and reconnect
    if (changedProperties.has("productId") && this.productId) {
      if (this.wsConnection) {
        this.wsConnection.close();
      }
      this.setupWebSocketConnection();
      this.fetchBidHistory();
    }

    // If auction ended, update UI
    if (changedProperties.has("auctionEnded") && this.auctionEnded) {
      this.requestUpdate();
    }
  }

  fetchCurrentUser() {
    const userData = getUser();
    if (userData) {
      this.currentUserId = userData.id;
    }
  }

  async fetchBidHistory() {
    this.loadingBids = true;

    try {
      const history = await fetchJson(
        `/api/auction-product/${this.productId}/bids`
      );
      this.bidHistory = history;

      // Set current bid to highest bid or base price
      if (history.length > 0) {
        // Sort by bid price (highest first)
        history.sort((a, b) => b.bid_price - a.bid_price);
        this.currentBid = history[0].bid_price;

        // Check if current user is the highest bidder
        if (this.currentUserId && history[0].user_id === this.currentUserId) {
          this.userIsHighestBidder = true;

          // Notify parent component
          this.dispatchEvent(
            new CustomEvent("user-bid-status-change", {
              detail: { isHighestBidder: true },
              bubbles: true,
              composed: true,
            })
          );
        }
      } else {
        this.currentBid = this.basePrice;
      }

      // Calculate next minimum bid
      this.calculateNextBid();
    } catch (err) {
      console.error("Error fetching bid history:", err);
    } finally {
      this.loadingBids = false;
    }
  }

  setupWebSocketConnection() {
    // Create WebSocket connection for real-time bidding
    this.wsConnection = createProductAuctionConnection(this.productId, {
      onOpen: () => {
        console.log("WebSocket connection opened for auction");
      },
      onMessage: (data) => {
        this.handleWebSocketMessage(data);
      },
      onClose: () => {
        console.log("WebSocket connection closed for auction");
      },
      onError: (error) => {
        console.error("WebSocket error:", error);
      },
    });
  }

  handleWebSocketMessage(data) {
    if (data.error) {
      console.error("WebSocket error:", data.error);
      return;
    }

    // Update current bid from WebSocket data
    if (data.highest_bid !== undefined) {
      this.currentBid = data.highest_bid || this.basePrice;
      this.calculateNextBid();

      // Notify parent component about highest bid update
      this.dispatchEvent(
        new CustomEvent("highest-bid-update", {
          detail: { highestBid: this.currentBid },
          bubbles: true,
          composed: true,
        })
      );

      // Update bid history
      this.fetchBidHistory();
    }
  }

  calculateNextBid() {
    // Find appropriate increment based on current bid
    let increment = 5; // Default increment

    for (let i = this.bidIncrements.length - 1; i >= 0; i--) {
      if (this.currentBid >= this.bidIncrements[i].threshold) {
        increment = this.bidIncrements[i].increment;
        break;
      }
    }

    // Calculate next minimum bid
    this.nextBid = this.currentBid + increment;
  }

  async placeBid() {
    if (!isSignedIn()) {
      alert("Please login to place a bid");
      window.location.href =
        "/login?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }

    const bidInput = this.querySelector("#bid-amount");
    const bidAmount = parseFloat(bidInput.value);

    // Validate bid amount
    if (isNaN(bidAmount) || bidAmount <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }

    if (bidAmount < this.nextBid) {
      alert(`Your bid must be at least ${this.nextBid}`);
      return;
    }

    try {
      // Send bid through WebSocket
      this.wsConnection.send({
        user_id: this.currentUserId,
        bid_price: bidAmount,
      });

      // Clear input field
      bidInput.value = "";
    } catch (err) {
      console.error("Error placing bid:", err);
      alert("Failed to place bid. Please try again.");
    }
  }

  renderBidHistory() {
    if (this.loadingBids) {
      return html`
        <div class="bid-loading">
          <i class="fas fa-spinner fa-pulse"></i>
          <p>Loading bid history...</p>
        </div>
      `;
    }

    if (this.bidHistory.length === 0) {
      return html`
        <div class="no-bids">
          <p>
            <i class="fas fa-info-circle"></i> No bids yet. Be the first to bid!
          </p>
        </div>
      `;
    }

    return html`
      <div class="bid-history">
        <h3>Bid History</h3>
        <ul class="bid-list">
          ${this.bidHistory.slice(0, 5).map(
            (bid) => html`
              <li
                class="bid-item ${bid.user_id === this.currentUserId
                  ? "user-bid"
                  : ""}"
              >
                <span class="bid-user">
                  ${bid.user_id === this.currentUserId
                    ? html`<i class="fas fa-user"></i> You`
                    : html`<i class="fas fa-user-alt"></i> User
                        ${bid.user_id.substring(0, 8)}`}
                </span>
                <span class="bid-amount"
                  >${bid.bid_price.toLocaleString()} LKR</span
                >
                <span class="bid-time"
                  >${new Date(bid.created_at).toLocaleString()}</span
                >
              </li>
            `
          )}
        </ul>
        ${this.bidHistory.length > 5
          ? html`
              <p class="more-bids">+${this.bidHistory.length - 5} more bids</p>
            `
          : ""}
      </div>
    `;
  }

  render() {
    return html`
      <div class="bid-section">
        <div class="current-bid">
          <div class="bid-label">Current Bid:</div>
          <div class="bid-value">${this.currentBid.toLocaleString()} LKR</div>

          ${this.userIsHighestBidder
            ? html`
                <div class="user-highest-bid">
                  <i class="fas fa-check-circle"></i> You are the highest
                  bidder!
                </div>
              `
            : ""}
        </div>

        ${this.renderBidHistory()}
        ${!this.auctionEnded
          ? html`
              <div class="place-bid">
                <div class="min-bid-info">
                  <i class="fas fa-tag"></i> Minimum bid:
                  ${this.nextBid.toLocaleString()} LKR
                </div>

                <div class="bid-input-group">
                  <input
                    type="number"
                    id="bid-amount"
                    min=${this.nextBid}
                    step="1"
                    placeholder="Enter your bid amount"
                    .value=${this.nextBid}
                  />
                  <button
                    class="bid-button"
                    @click=${this.placeBid}
                    ?disabled=${!isSignedIn()}
                  >
                    <i class="fas fa-gavel"></i> Place Bid
                  </button>
                </div>

                ${!isSignedIn()
                  ? html`
                      <p class="login-prompt">
                        <a
                          href="/auth/login?redirect=${encodeURIComponent(
                            window.location.pathname
                          )}"
                          >Login</a
                        >
                        to place a bid
                      </p>
                    `
                  : ""}
              </div>
            `
          : html`
              <div class="auction-ended-message">
                <i class="fas fa-hourglass-end"></i> This auction has ended
              </div>
            `}
      </div>

      <style>
        .bid-section {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }

        .current-bid {
          text-align: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.2);
        }

        .bid-label {
          font-size: 1rem;
          color: #e0e0e0;
        }

        .bid-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #ffd700;
        }

        .user-highest-bid {
          background-color: rgba(255, 215, 0, 0.1);
          color: #ffd700;
          padding: 0.5rem;
          border-radius: 4px;
          margin-top: 0.5rem;
          font-weight: 500;
        }

        .bid-history {
          margin: 1.5rem 0;
        }

        .bid-history h3 {
          font-size: 1rem;
          margin-bottom: 0.75rem;
          color: #ffffff;
        }

        .bid-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .bid-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .bid-item.user-bid {
          background-color: rgba(255, 215, 0, 0.1);
        }

        .bid-user {
          flex: 0 0 30%;
        }

        .bid-amount {
          flex: 0 0 30%;
          font-weight: 500;
          color: #e0e0e0;
        }

        .bid-time {
          flex: 0 0 40%;
          font-size: 0.8rem;
          color: #e0e0e0;
          text-align: right;
        }

        .more-bids {
          text-align: center;
          font-size: 0.8rem;
          color: #e0e0e0;
          margin-top: 0.5rem;
        }

        .place-bid {
          margin-top: 1.5rem;
        }

        .min-bid-info {
          font-size: 0.9rem;
          color: #e0e0e0;
          margin-bottom: 0.75rem;
        }

        .bid-input-group {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        #bid-amount {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          background-color: rgba(0, 0, 0, 0.2);
          color: #ffffff;
        }

        .bid-button {
          padding: 0.75rem 1.5rem;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .bid-button:hover {
          background-color: #ffc107;
        }

        .bid-button:disabled {
          background-color: #e0e0e0;
          cursor: not-allowed;
        }

        .login-prompt {
          text-align: center;
          font-size: 0.9rem;
          margin-top: 0.5rem;
          color: #e0e0e0;
        }

        .login-prompt a {
          color: #ffd700;
          text-decoration: none;
        }

        .login-prompt a:hover {
          text-decoration: underline;
        }

        .auction-ended-message {
          text-align: center;
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          color: #e0e0e0;
          font-weight: 500;
          margin-top: 1rem;
        }

        .bid-loading,
        .no-bids {
          text-align: center;
          padding: 1rem;
          color: #e0e0e0;
        }

        .bid-loading i {
          font-size: 1.5rem;
          color: #ffd700;
          margin-bottom: 0.5rem;
        }
      </style>
    `;
  }
}

customElements.define("bid-section", BidSection);
