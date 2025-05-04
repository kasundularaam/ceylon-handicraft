// app/public/js/components/checkout/checkout-summary.js
import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class CheckoutSummary extends LitElement {
  static get properties() {
    return {
      orders: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
      total: { type: Number },
    };
  }

  constructor() {
    super();
    this.orders = [];
    this.loading = true;
    this.error = null;
    this.total = 0;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadOrderSummary();
  }

  async loadOrderSummary() {
    this.loading = true;
    this.error = null;

    try {
      const data = await fetchJson("/api/checkout-page/summary");
      this.orders = data.orders || [];
      this.calculateTotal();

      // Dispatch event for payment component
      this.dispatchEvent(
        new CustomEvent("order-loaded", {
          bubbles: true,
          composed: true,
          detail: { total: this.total, orders: this.orders },
        })
      );
    } catch (error) {
      console.error("Error loading order summary:", error);
      this.error = error.message || "Failed to load order summary";
    } finally {
      this.loading = false;
    }
  }

  calculateTotal() {
    this.total = this.orders.reduce((sum, order) => {
      return sum + order.unit_price * order.quantity;
    }, 0);
  }

  render() {
    if (this.loading) {
      return html`
        <div class="summary-loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading your order details...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="summary-error">
          <i class="fas fa-exclamation-circle"></i>
          <p>${this.error}</p>
          <button @click=${this.loadOrderSummary}>Try Again</button>
        </div>
      `;
    }

    if (this.orders.length === 0) {
      return html`
        <div class="summary-empty">
          <i class="fas fa-shopping-bag"></i>
          <h2>No orders found</h2>
          <p>It seems you don't have any pending orders.</p>
          <a href="/products" class="browse-btn">Browse Products</a>
        </div>
      `;
    }

    return html`
      <div class="checkout-summary">
        <h2 class="summary-title">Order Summary</h2>

        <div class="order-items">
          ${this.orders.map(
            (order) => html`
              <div class="order-item">
                <div class="order-item-details">
                  <h3 class="item-title">${order.product.title}</h3>
                  <p class="item-craftsman">
                    By: ${order.product.craftsman.name}
                  </p>
                </div>
                <div class="order-item-pricing">
                  <p class="item-quantity">Qty: ${order.quantity}</p>
                  <p class="item-price">$${order.unit_price.toFixed(2)} each</p>
                  <p class="item-subtotal">
                    $${(order.unit_price * order.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            `
          )}
        </div>

        <div class="summary-divider"></div>

        <div class="order-total">
          <span>Total Amount</span>
          <span class="total-amount">$${this.total.toFixed(2)}</span>
        </div>
      </div>

      <style>
        .checkout-summary {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .summary-title {
          color: #ffd700;
          margin-top: 0;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #6d5047;
          padding-bottom: 1rem;
        }

        .summary-loading,
        .summary-error,
        .summary-empty {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 3rem 1.5rem;
          text-align: center;
          color: #e0e0e0;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .summary-loading i,
        .summary-error i,
        .summary-empty i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #ffd700;
        }

        .summary-empty h2 {
          color: #ffffff;
          margin-bottom: 1rem;
        }

        .summary-error button,
        .browse-btn {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.3s, transform 0.2s;
        }

        .summary-error button:hover,
        .browse-btn:hover {
          background-color: #ffc107;
          transform: translateY(-2px);
        }

        .order-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background-color: #44302b;
          border-radius: 8px;
        }

        .order-item-details {
          flex: 1;
        }

        .item-title {
          margin: 0 0 0.5rem;
          color: #ffffff;
          font-size: 1.1rem;
        }

        .item-craftsman {
          margin: 0;
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        .order-item-pricing {
          text-align: right;
          min-width: 120px;
        }

        .item-quantity,
        .item-price {
          margin: 0 0 0.25rem;
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        .item-subtotal {
          margin: 0.5rem 0 0;
          font-weight: 600;
          color: #ffd700;
          font-size: 1.1rem;
        }

        .summary-divider {
          height: 1px;
          background-color: #6d5047;
          margin: 1.5rem 0;
        }

        .order-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.2rem;
          color: #ffffff;
        }

        .total-amount {
          font-weight: 700;
          color: #ffd700;
          font-size: 1.5rem;
        }
      </style>
    `;
  }
}

customElements.define("checkout-summary", CheckoutSummary);
