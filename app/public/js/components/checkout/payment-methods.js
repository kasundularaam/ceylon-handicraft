// app/public/js/components/checkout/payment-methods.js
import { LitElement, html } from "https://esm.run/lit";
import { postJson } from "../../utils/api_utils.js";

class PaymentMethods extends LitElement {
  static get properties() {
    return {
      selectedMethod: { type: String },
      processing: { type: Boolean },
      cardNumber: { type: String },
      cardName: { type: String },
      cardExpiry: { type: String },
      cardCvc: { type: String },
      total: { type: Number },
      orders: { type: Array },
    };
  }

  constructor() {
    super();
    this.selectedMethod = "card";
    this.processing = false;
    this.cardNumber = "";
    this.cardName = "";
    this.cardExpiry = "";
    this.cardCvc = "";
    this.total = 0;
    this.orders = [];
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    // Listen for order data from checkout-summary component
    document.addEventListener(
      "order-loaded",
      this.handleOrderLoaded.bind(this)
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      "order-loaded",
      this.handleOrderLoaded.bind(this)
    );
  }

  handleOrderLoaded(e) {
    if (e.detail) {
      this.total = e.detail.total || 0;
      this.orders = e.detail.orders || [];
    }
  }

  handleMethodChange(method) {
    this.selectedMethod = method;
  }

  updateField(field, event) {
    this[field] = event.target.value;
  }

  validateForm() {
    // Validate card details (basic validation)
    if (this.selectedMethod === "card") {
      if (!this.cardNumber || this.cardNumber.length < 15) {
        alert("Please enter a valid card number");
        return false;
      }

      if (!this.cardName) {
        alert("Please enter the cardholder name");
        return false;
      }

      if (!this.cardExpiry || this.cardExpiry.length < 5) {
        alert("Please enter a valid expiry date (MM/YY)");
        return false;
      }

      if (!this.cardCvc || this.cardCvc.length < 3) {
        alert("Please enter a valid CVC code");
        return false;
      }
    }

    return true;
  }

  async handlePayment() {
    // Check if there are any orders
    if (this.orders.length === 0) {
      alert("No orders to process");
      return;
    }

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.processing = true;

    try {
      // Process payment and update status
      await postJson("/api/checkout-page/process-payment", {
        paymentMethod: this.selectedMethod,
        cardDetails:
          this.selectedMethod === "card"
            ? {
                number: this.cardNumber,
                name: this.cardName,
                expiry: this.cardExpiry,
                cvc: this.cardCvc,
              }
            : null,
      });

      // Show success and redirect
      alert("Payment successful! Thank you for your purchase.");
      window.location.href = "/";
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to process payment. Please try again.");
      this.processing = false;
    }
  }

  render() {
    return html`
      <div class="payment-container">
        <h2 class="payment-title">Payment Method</h2>

        <div class="payment-methods">
          <div
            class="payment-method ${this.selectedMethod === "card"
              ? "selected"
              : ""}"
            @click=${() => this.handleMethodChange("card")}
          >
            <i class="fas fa-credit-card"></i>
            <span>Credit / Debit Card</span>
          </div>
        </div>

        ${this.selectedMethod === "card"
          ? html`
              <div class="card-details">
                <div class="form-group">
                  <label for="card-number">Card Number</label>
                  <input
                    type="text"
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    maxlength="19"
                    .value=${this.cardNumber}
                    @input=${(e) => this.updateField("cardNumber", e)}
                  />
                </div>

                <div class="form-group">
                  <label for="card-name">Cardholder Name</label>
                  <input
                    type="text"
                    id="card-name"
                    placeholder="John Doe"
                    .value=${this.cardName}
                    @input=${(e) => this.updateField("cardName", e)}
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="card-expiry">Expiry Date</label>
                    <input
                      type="text"
                      id="card-expiry"
                      placeholder="MM/YY"
                      maxlength="5"
                      .value=${this.cardExpiry}
                      @input=${(e) => this.updateField("cardExpiry", e)}
                    />
                  </div>

                  <div class="form-group">
                    <label for="card-cvc">CVC</label>
                    <input
                      type="text"
                      id="card-cvc"
                      placeholder="123"
                      maxlength="4"
                      .value=${this.cardCvc}
                      @input=${(e) => this.updateField("cardCvc", e)}
                    />
                  </div>
                </div>
              </div>
            `
          : ""}

        <div class="payment-summary">
          <span>Total Amount:</span>
          <span class="payment-amount">$${this.total.toFixed(2)}</span>
        </div>

        <button
          class="pay-button"
          @click=${this.handlePayment}
          ?disabled=${this.processing || this.total <= 0}
        >
          ${this.processing
            ? html` <i class="fas fa-spinner fa-spin"></i> Processing... `
            : html` Pay $${this.total.toFixed(2)} <i class="fas fa-lock"></i> `}
        </button>

        <p class="secure-note">
          <i class="fas fa-shield-alt"></i> Your payment information is securely
          processed
        </p>
      </div>

      <style>
        .payment-container {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .payment-title {
          color: #ffd700;
          margin-top: 0;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #6d5047;
          padding-bottom: 1rem;
        }

        .payment-methods {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .payment-method {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background-color: #44302b;
          border: 2px solid #44302b;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .payment-method:hover {
          background-color: #513731;
        }

        .payment-method.selected {
          border-color: #ffd700;
          background-color: #513731;
        }

        .payment-method i {
          font-size: 1.5rem;
          color: #ffd700;
        }

        .card-details {
          background-color: #44302b;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          background-color: #5d4037;
          border: 1px solid #6d5047;
          border-radius: 4px;
          color: #ffffff;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #ffd700;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .payment-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          margin-bottom: 1.5rem;
          border-top: 1px solid #6d5047;
          border-bottom: 1px solid #6d5047;
          font-size: 1.2rem;
          color: #ffffff;
        }

        .payment-amount {
          font-weight: 700;
          color: #ffd700;
          font-size: 1.5rem;
        }

        .pay-button {
          display: block;
          width: 100%;
          padding: 1rem;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          border-radius: 4px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .pay-button:hover:not(:disabled) {
          background-color: #ffc107;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .pay-button:disabled {
          background-color: #a1887f;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .pay-button i {
          margin-left: 0.5rem;
        }

        .secure-note {
          font-size: 0.8rem;
          color: #a1887f;
          text-align: center;
          margin-top: 1rem;
          margin-bottom: 0;
        }

        .secure-note i {
          margin-right: 0.25rem;
        }
      </style>
    `;
  }
}

customElements.define("payment-methods", PaymentMethods);
