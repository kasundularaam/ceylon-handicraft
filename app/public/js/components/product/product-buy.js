import { LitElement, html } from "https://esm.run/lit";
import { postJson } from "../../utils/api_utils.js";
import { isSignedIn } from "../../utils/auth_utils.js";

class ProductBuy extends LitElement {
  static get properties() {
    return {
      productId: { type: String, attribute: "product-id" },
      productTitle: { type: String, attribute: "product-title" },
      productPrice: { type: Number, attribute: "product-price" },
      quantity: { type: Number },
      loading: { type: Boolean },
      success: { type: String },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.productId = null;
    this.productTitle = "";
    this.productPrice = 0;
    this.quantity = 1;
    this.loading = false;
    this.success = null;
    this.error = null;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  incrementQuantity() {
    this.quantity += 1;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }

  async addToCart() {
    // Check if user is logged in
    if (!isSignedIn()) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }

    this.loading = true;
    this.success = null;
    this.error = null;

    try {
      await postJson("/api/cart/add", {
        product_id: this.productId,
        quantity: this.quantity,
      });

      this.success = `${this.productTitle} added to your cart!`;
      setTimeout(() => {
        this.success = null;
      }, 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      this.error = error.message || "Failed to add to cart. Please try again.";
    } finally {
      this.loading = false;
    }
  }

  async buyNow() {
    if (!isSignedIn()) {
      // Redirect to login if not authenticated
      window.location.href = `/auth/login?redirect=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }

    this.loading = true;
    this.success = null;
    this.error = null;

    try {
      const response = await postJson("/api/orders/buy-now", {
        product_id: this.productId,
        quantity: this.quantity,
      });

      if (response && response.success && response.redirect_url) {
        // Redirect to checkout page
        window.location.href = response.redirect_url;
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Error proceeding to checkout:", error);

      // Check if unauthorized (not logged in)
      if (
        error.message.includes("401") ||
        error.message.includes("Authentication required")
      ) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`;
        return;
      }

      this.error =
        error.message || "Failed to proceed to checkout. Please try again.";
      this.loading = false;
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(price);
  }

  render() {
    const totalPrice = this.productPrice * this.quantity;

    return html`
      <div class="buy-container">
        <div class="quantity-selector">
          <button
            class="quantity-btn"
            @click=${this.decrementQuantity}
            ?disabled=${this.quantity <= 1 || this.loading}
          >
            <i class="fas fa-minus"></i>
          </button>
          <span class="quantity-value">${this.quantity}</span>
          <button
            class="quantity-btn"
            @click=${this.incrementQuantity}
            ?disabled=${this.loading}
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <div class="buy-actions">
          <button
            class="btn-add-cart"
            @click=${this.addToCart}
            ?disabled=${this.loading}
          >
            ${this.loading
              ? html`<i class="fas fa-spinner fa-spin"></i>`
              : html`<i class="fas fa-shopping-cart"></i>`}
            Add to Cart
          </button>

          <button
            class="btn-buy-now"
            @click=${this.buyNow}
            ?disabled=${this.loading}
          >
            ${this.loading
              ? html`<i class="fas fa-spinner fa-spin"></i>`
              : html`<i class="fas fa-bolt"></i>`}
            Buy Now
          </button>
        </div>

        ${this.quantity > 1
          ? html`
              <div class="total-price">
                Total:
                <span class="price-value">${this.formatPrice(totalPrice)}</span>
              </div>
            `
          : ""}
        ${this.success
          ? html`
              <div class="message success">
                <i class="fas fa-check-circle"></i>
                ${this.success}
              </div>
            `
          : ""}
        ${this.error
          ? html`
              <div class="message error">
                <i class="fas fa-exclamation-circle"></i>
                ${this.error}
              </div>
            `
          : ""}
      </div>

      <style>
        .buy-container {
          margin: 2rem 0;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .quantity-btn {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          background-color: #5d4037;
          color: #ffffff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .quantity-btn:hover:not([disabled]) {
          background-color: #4e342e;
        }

        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity-value {
          width: 40px;
          text-align: center;
          font-size: 1.2rem;
          font-weight: 500;
        }

        .buy-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .btn-add-cart,
        .btn-buy-now {
          flex: 1;
          padding: 0.8rem 1.5rem;
          border-radius: 4px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .btn-add-cart {
          background-color: #5d4037;
          color: #ffffff;
        }

        .btn-add-cart:hover:not([disabled]) {
          background-color: #4e342e;
        }

        .btn-buy-now {
          background-color: #ffd700;
          color: #3e2723;
        }

        .btn-buy-now:hover:not([disabled]) {
          background-color: #ffc107;
        }

        .btn-add-cart:disabled,
        .btn-buy-now:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .total-price {
          margin-top: 1rem;
          font-size: 1.2rem;
          text-align: right;
        }

        .price-value {
          color: #ffd700;
          font-weight: 600;
        }

        .message {
          margin-top: 1rem;
          padding: 0.8rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .message.success {
          background-color: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .message.error {
          background-color: rgba(244, 67, 54, 0.2);
          color: #f44336;
        }
      </style>
    `;
  }
}

customElements.define("product-buy", ProductBuy);
