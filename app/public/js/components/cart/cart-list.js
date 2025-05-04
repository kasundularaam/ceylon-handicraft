// app/public/js/components/cart/cart-list.js
import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";
import "./cart-item.js";

class CartList extends LitElement {
  static get properties() {
    return {
      items: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.items = [];
    this.loading = true;
    this.error = null;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadCartItems();

    // Listen for cart updates from child components
    this.addEventListener("item-removed", this.handleItemRemoved);
    this.addEventListener("cart-updated", this.handleCartUpdated);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("item-removed", this.handleItemRemoved);
    this.removeEventListener("cart-updated", this.handleCartUpdated);
  }

  handleItemRemoved(e) {
    const itemId = e.detail.itemId;
    this.items = this.items.filter((item) => item.id !== itemId);

    // Dispatch event to update summary
    this.dispatchEvent(
      new CustomEvent("cart-updated", {
        bubbles: true,
        composed: true,
      })
    );
  }

  handleCartUpdated() {
    // Update the cart totals in the summary component
    this.dispatchEvent(
      new CustomEvent("cart-updated", {
        bubbles: true,
        composed: true,
        detail: { items: this.items },
      })
    );
  }

  async loadCartItems() {
    this.loading = true;
    this.error = null;

    try {
      const data = await fetchJson("/api/cart-page/items");
      this.items = data;

      // Notify the summary component about the items
      this.dispatchEvent(
        new CustomEvent("cart-updated", {
          bubbles: true,
          composed: true,
          detail: { items: this.items },
        })
      );
    } catch (error) {
      console.error("Error loading cart items:", error);
      this.error = error.message || "Failed to load cart items";
    } finally {
      this.loading = false;
    }
  }

  render() {
    if (this.loading) {
      return html`
        <div class="cart-list-loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading your cart items...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="cart-list-error">
          <i class="fas fa-exclamation-circle"></i>
          <p>${this.error}</p>
          <button @click=${this.loadCartItems}>Try Again</button>
        </div>
      `;
    }

    if (this.items.length === 0) {
      return html`
        <div class="cart-empty">
          <i class="fas fa-shopping-cart"></i>
          <h2>Your cart is empty</h2>
          <p>
            Discover unique handcrafted treasures from Ceylon's finest artisans.
          </p>
          <a href="/products" class="browse-btn">Browse Products</a>
        </div>
      `;
    }

    return html`
      <div class="cart-list">
        <h2 class="cart-list-title">Cart Items (${this.items.length})</h2>

        ${this.items.map(
          (item) => html` <cart-item .item=${item}></cart-item> `
        )}
      </div>

      <style>
        .cart-list {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .cart-list-title {
          color: #ffd700;
          margin-top: 0;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #6d5047;
          padding-bottom: 1rem;
        }

        .cart-list-loading,
        .cart-list-error,
        .cart-empty {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 3rem 1.5rem;
          text-align: center;
          color: #e0e0e0;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .cart-list-loading i,
        .cart-list-error i,
        .cart-empty i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #ffd700;
        }

        .cart-empty h2 {
          color: #ffffff;
          margin-bottom: 1rem;
        }

        .cart-list-error button,
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

        .cart-list-error button:hover,
        .browse-btn:hover {
          background-color: #ffc107;
          transform: translateY(-2px);
        }
      </style>
    `;
  }
}

customElements.define("cart-list", CartList);
