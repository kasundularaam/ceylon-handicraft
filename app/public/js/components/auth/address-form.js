import { LitElement, html } from "https://esm.run/lit";
import { postJson } from "../../utils/api_utils.js";
import { saveToken, saveUser } from "../../utils/auth_utils.js";

class AddressForm extends LitElement {
  static get properties() {
    return {
      userid: { type: String },
      role: { type: String },
      loading: { type: Boolean },
      error: { type: String },
      countries: { type: Array },
    };
  }

  constructor() {
    super();
    this.userid = "";
    this.role = "";
    this.loading = false;
    this.error = "";
    this.countries = [
      "Sri Lanka",
      "United States",
      "United Kingdom",
      "Australia",
      "Canada",
      "India",
      "Singapore",
      "Japan",
      "Germany",
      "France",
    ];
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  async handleSubmit(e) {
    e.preventDefault();

    const country = e.target.country.value;
    const state = e.target.state.value;
    const city = e.target.city.value;
    const postalCode = e.target.postalCode.value;
    const addressLine = e.target.addressLine.value;

    if (!country || !state || !city || !postalCode || !addressLine) {
      this.error = "Please fill in all fields";
      return;
    }

    this.loading = true;
    this.error = "";

    try {
      const data = await postJson("/api/auth/address", {
        user_id: this.userid,
        country,
        state,
        city,
        postal_code: postalCode,
        address_line: addressLine,
      });

      // Save auth data
      saveToken(data.access_token);
      saveUser(data.user);

      // Redirect based on user role
      if (this.role === "Buyer") {
        window.location.href = "/";
      } else if (this.role === "Craftsman") {
        window.location.href = "/craftsman";
      }
    } catch (error) {
      this.error = error.message || "Failed to add address";
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="address-form-container">
        <div class="form-image">
          <img
            src="/static/images/auth_address_featuring.jpg"
            alt="Featured Image"
          />
        </div>
        <div class="form-content">
          <h2 class="form-title">Add Your Address</h2>
          <p class="form-subtitle">
            Your shipping details help us serve you better
          </p>

          <div class="divider"></div>

          ${this.error
            ? html`<div class="error-message">${this.error}</div>`
            : ""}

          <form @submit=${this.handleSubmit}>
            <div class="form-group">
              <label for="country">Country</label>
              <select id="country" name="country" required>
                <option value="">Select your country</option>
                ${this.countries.map(
                  (country) => html`
                    <option value="${country}">${country}</option>
                  `
                )}
              </select>
            </div>

            <div class="form-group">
              <label for="state">State/Province</label>
              <input
                type="text"
                id="state"
                name="state"
                placeholder="Enter your state/province"
                required
              />
            </div>

            <div class="form-group">
              <label for="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter your city"
                required
              />
            </div>

            <div class="form-group">
              <label for="postalCode">Postal/ZIP Code</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                placeholder="Enter your postal/ZIP code"
                required
              />
            </div>

            <div class="form-group">
              <label for="addressLine">Address Line</label>
              <input
                type="text"
                id="addressLine"
                name="addressLine"
                placeholder="Enter your street address"
                required
              />
            </div>

            <button
              type="submit"
              class="submit-button"
              ?disabled=${this.loading}
            >
              ${this.loading ? "Saving Address..." : "Complete Registration"}
            </button>
          </form>
        </div>
      </div>

      <style>
        .address-form-container {
          display: flex;
          width: 100%;
          background-color: #3e2723;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        }

        .form-image {
          flex: 1;
          overflow: hidden;
          display: none;
        }

        .form-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .form-content {
          flex: 1;
          padding: 2rem;
          color: #ffffff;
        }

        .form-title {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .form-subtitle {
          font-size: 1rem;
          color: #e0e0e0;
          margin-bottom: 1.5rem;
        }

        .divider {
          height: 1px;
          background-color: rgba(255, 255, 255, 0.2);
          margin: 1.5rem 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        input,
        select {
          width: 100%;
          padding: 0.75rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 1rem;
        }

        select option {
          background-color: #3e2723;
          color: #ffffff;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #ffd700;
          box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.3);
        }

        .submit-button {
          width: 100%;
          padding: 0.75rem;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .submit-button:hover {
          background-color: #f5cc00;
        }

        .submit-button:disabled {
          background-color: #ccaa00;
          cursor: not-allowed;
        }

        .error-message {
          background-color: rgba(255, 0, 0, 0.2);
          color: #ffffff;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .form-image {
            display: block;
          }
        }
      </style>
    `;
  }
}

customElements.define("address-form", AddressForm);
