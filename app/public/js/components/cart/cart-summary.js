// app/public/js/components/cart/cart-summary.js
import { LitElement, html } from "https://esm.run/lit";
import { postJson } from "../../utils/api_utils.js";

class CartSummary extends LitElement {
  static get properties() {
    return {
      items: { type: Array },
      processing: { type: Boolean },
      subtotal: { type: Number },
      total: { type: Number },
    };
  }

  constructor() {
    super();
    this.items = [];
    this.processing = false;
    this.subtotal = 0;
    this.total = 0;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    // Listen for cart updates from cart-list component
    document.addEventListener(
      "cart-updated",
      this.handleCartUpdated.bind(this)
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      "cart-updated",
      this.handleCartUpdated.bind(this)
    );
  }

  handleCartUpdated(e) {
    if (e.detail && e.detail.items) {
      this.items = e.detail.items;
    }
    this.calculateTotals();
  }

  calculateTotals() {
    // Calculate subtotal and total (no tax now)
    this.subtotal = this.items.reduce((sum, item) => {
      return sum + item.product.base_price * item.quantity;
    }, 0);

    // Total is same as subtotal (no tax)
    this.total = this.subtotal;
  }

  async handleCheckout() {
    if (this.items.length === 0) {
      alert("Your cart is empty. Add some items before checkout.");
      return;
    }

    this.processing = true;

    try {
      await postJson("/api/cart-page/checkout", {});

      // Redirect to checkout page
      window.location.href = "/checkout";
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to process your order. Please try again.");
      this.processing = false;
    }
  }

  render() {
    return html`
      <div class="cart-summary">
        <h2 class="summary-title">Order Summary</h2>

        <div class="summary-row">
          <span>Subtotal</span>
          <span>$${this.subtotal.toFixed(2)}</span>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-row total">
          <span>Total</span>
          <span>$${this.total.toFixed(2)}</span>
        </div>

        <button
          class="checkout-btn"
          @click=${this.handleCheckout}
          ?disabled=${this.processing || this.items.length === 0}
        >
          ${this.processing
            ? html` <i class="fas fa-spinner fa-spin"></i> Processing... `
            : html` Proceed to Checkout <i class="fas fa-arrow-right"></i> `}
        </button>

        <p class="secure-note">
          <i class="fas fa-lock"></i> Secure checkout powered by Ceylon
          Handicrafts
        </p>
      </div>

      <style>
        .cart-summary {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.5rem;
          position: sticky;
          top: 2rem;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .summary-title {
          color: #ffd700;
          margin-top: 0;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #6d5047;
          padding-bottom: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          color: #e0e0e0;
        }

        .summary-row.total {
          font-size: 1.2rem;
          font-weight: 600;
          color: #ffffff;
        }

        .summary-divider {
          height: 1px;
          background-color: #6d5047;
          margin: 1rem 0;
        }

        .checkout-btn {
          display: block;
          width: 100%;
          padding: 1rem;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin: 1.5rem 0 1rem;
          transition: all 0.3s;
        }

        .checkout-btn:hover {
          background-color: #ffc107;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .checkout-btn:disabled {
          background-color: #a1887f;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .checkout-btn i {
          margin-left: 0.5rem;
        }

        .secure-note {
          font-size: 0.8rem;
          color: #a1887f;
          text-align: center;
          margin-bottom: 0;
        }

        .secure-note i {
          margin-right: 0.25rem;
        }
      </style>
    `;
  }
}

customElements.define("cart-summary", CartSummary);
