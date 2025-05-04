// app/public/js/components/cart/cart-item.js
import { LitElement, html } from "https://esm.run/lit";
import { deleteJson, patchJson, fetchJson } from "../../utils/api_utils.js";

class CartItem extends LitElement {
  static get properties() {
    return {
      item: { type: Object },
      loading: { type: Boolean },
      productImages: { type: Array },
    };
  }

  constructor() {
    super();
    this.item = null;
    this.loading = false;
    this.productImages = [];
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    if (this.item && this.item.product) {
      await this.loadProductImages(this.item.product.id);
    }
  }

  async loadProductImages(productId) {
    try {
      const response = await fetchJson(
        `/api/landing/product/${productId}/images`
      );
      this.productImages = response.images || [];
    } catch (error) {
      console.error("Failed to load product images:", error);
      this.productImages = [];
    }
  }

  async updateQuantity(newQuantity) {
    if (newQuantity < 1) return;

    this.loading = true;
    try {
      await patchJson(`/api/cart-page/items/${this.item.id}`, {
        quantity: newQuantity,
      });

      // Update the local item
      this.item = { ...this.item, quantity: newQuantity };

      // Dispatch event to update total
      this.dispatchEvent(
        new CustomEvent("cart-updated", {
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
    } finally {
      this.loading = false;
    }
  }

  async removeItem() {
    if (!confirm("Are you sure you want to remove this item from your cart?")) {
      return;
    }

    this.loading = true;
    try {
      await deleteJson(`/api/cart-page/items/${this.item.id}`);

      // Dispatch event to remove from list
      this.dispatchEvent(
        new CustomEvent("item-removed", {
          bubbles: true,
          composed: true,
          detail: { itemId: this.item.id },
        })
      );
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item. Please try again.");
    } finally {
      this.loading = false;
    }
  }

  render() {
    if (!this.item) return html`<div>Loading...</div>`;

    const product = this.item.product;
    const subtotal = (product.base_price * this.item.quantity).toFixed(2);

    // Get the first image if available
    const productImage =
      this.productImages.length > 0 ? this.productImages[0] : null;

    return html`
      <div class="cart-item ${this.loading ? "loading" : ""}">
        <div class="cart-item-image">
          ${productImage
            ? html`<img src="${productImage}" alt="${product.title}" />`
            : html`<div class="placeholder-image">
                <i class="fas fa-image"></i>
              </div>`}
        </div>

        <div class="cart-item-details">
          <h3 class="cart-item-title">${product.title}</h3>
          <p class="cart-item-craftsman">By: ${product.craftsman.name}</p>
          <p class="cart-item-price">$${product.base_price.toFixed(2)}</p>
        </div>

        <div class="cart-item-actions">
          <div class="quantity-controls">
            <button
              class="quantity-btn"
              @click=${() => this.updateQuantity(this.item.quantity - 1)}
              ?disabled=${this.loading || this.item.quantity <= 1}
            >
              <i class="fas fa-minus"></i>
            </button>

            <span class="quantity">${this.item.quantity}</span>

            <button
              class="quantity-btn"
              @click=${() => this.updateQuantity(this.item.quantity + 1)}
              ?disabled=${this.loading}
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>

          <div class="subtotal">$${subtotal}</div>

          <button
            class="remove-btn"
            @click=${this.removeItem}
            ?disabled=${this.loading}
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <style>
        .cart-item {
          display: grid;
          grid-template-columns: 100px 1fr auto;
          gap: 1rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
          background-color: #44302b;
          border-radius: 8px;
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .cart-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .cart-item.loading {
          opacity: 0.7;
          pointer-events: none;
        }

        .cart-item-image {
          width: 100px;
          height: 100px;
          overflow: hidden;
          border-radius: 4px;
          background-color: #2c1a16;
          border: 1px solid #6d5047;
        }

        .cart-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #806960;
          font-size: 24px;
        }

        .cart-item-details {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .cart-item-title {
          margin: 0 0 0.5rem;
          color: #ffffff;
          font-size: 1.2rem;
        }

        .cart-item-craftsman {
          margin: 0 0 0.5rem;
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        .cart-item-price {
          margin: 0;
          color: #ffd700;
          font-weight: 500;
        }

        .cart-item-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .quantity-btn {
          width: 30px;
          height: 30px;
          border: none;
          background-color: #5d4037;
          color: #ffffff;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .quantity-btn:hover {
          background-color: #6d5047;
        }

        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity {
          padding: 0 1rem;
          font-weight: 500;
          color: #ffffff;
        }

        .subtotal {
          font-weight: 600;
          font-size: 1.1rem;
          color: #ffd700;
          margin-bottom: 1rem;
        }

        .remove-btn {
          background: none;
          border: none;
          color: #e57373;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.2s;
        }

        .remove-btn:hover {
          color: #f44336;
        }

        @media (max-width: 640px) {
          .cart-item {
            grid-template-columns: 80px 1fr;
          }

          .cart-item-actions {
            grid-column: 1 / span 2;
            flex-direction: row;
            margin-top: 1rem;
          }

          .quantity-controls {
            margin-bottom: 0;
          }

          .subtotal {
            margin-bottom: 0;
          }
        }
      </style>
    `;
  }
}

customElements.define("cart-item", CartItem);
