import { LitElement, html } from "https://esm.run/lit";
import { postJson } from "../../utils/api_utils.js";

class SignupForm extends LitElement {
  static get properties() {
    return {
      role: { type: String },
      loading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.role = "Buyer";
    this.loading = false;
    this.error = "";
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  async handleSubmit(e) {
    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;
    const phone = e.target.phone.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (!name || !email || !phone || !password || !confirmPassword) {
      this.error = "Please fill in all fields";
      return;
    }

    if (password !== confirmPassword) {
      this.error = "Passwords do not match";
      return;
    }

    this.loading = true;
    this.error = "";

    try {
      const data = await postJson("/api/auth/signup", {
        name,
        email,
        phone,
        password,
        role: this.role,
      });

      // Redirect to address page
      window.location.href = `/auth/address?userid=${data.id}&role=${this.role}`;
    } catch (error) {
      this.error = error.message || "Signup failed";
    } finally {
      this.loading = false;
    }
  }

  getRoleSpecificTitle() {
    return this.role === "Craftsman"
      ? "Join as a Craftsman"
      : "Create Your Account";
  }

  getRoleSpecificSubtitle() {
    return this.role === "Craftsman"
      ? "Share your craftsmanship with the world"
      : "Join Ceylon Handicrafts to discover authentic Sri Lankan crafts";
  }

  getImageOverlayContent() {
    if (this.role === "Craftsman") {
      return html`
        <h2>Share Your Craft with the World</h2>
        <p>
          Join our marketplace of skilled artisans preserving Sri Lankan
          traditions
        </p>
      `;
    } else {
      return html`
        <h2>Explore Authentic Ceylon Crafts</h2>
        <p>
          Discover handcrafted treasures with stories of heritage and tradition
        </p>
      `;
    }
  }

  render() {
    return html`
      <div class="signup-form-container">
        <div class="form-image">
          <img
            src="${this.role === "Craftsman"
              ? "/static/images/auth_craftsman_featuring.jpg"
              : "/static/images/auth_buyer_featuring.jpg"}"
            alt="Featured Image"
          />
          <div class="image-overlay"></div>
          <div class="image-content">${this.getImageOverlayContent()}</div>
        </div>
        <div class="form-content">
          <h2 class="form-title">
            <i
              class="fas ${this.role === "Craftsman"
                ? "fa-tools"
                : "fa-user-plus"}"
            ></i>
            ${this.getRoleSpecificTitle()}
          </h2>
          <p class="form-subtitle">${this.getRoleSpecificSubtitle()}</p>

          <div class="divider"></div>

          ${this.error
            ? html`
                <div class="error-message">
                  <i class="fas fa-exclamation-circle"></i> ${this.error}
                </div>
              `
            : ""}

          <form @submit=${this.handleSubmit}>
            <div class="form-group">
              <label for="name"> <i class="fas fa-user"></i> Full Name </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div class="form-group">
              <label for="email"> <i class="fas fa-envelope"></i> Email </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div class="form-group">
              <label for="phone">
                <i class="fas fa-phone"></i> Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div class="form-group">
              <label for="password">
                <i class="fas fa-lock"></i> Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a password"
                required
              />
            </div>

            <div class="form-group">
              <label for="confirmPassword">
                <i class="fas fa-shield-alt"></i> Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              class="submit-button"
              ?disabled=${this.loading}
            >
              ${this.loading
                ? html`<i class="fas fa-spinner fa-spin"></i> Creating
                    Account...`
                : html`<i class="fas fa-user-plus"></i> Create Account`}
            </button>
          </form>

          <div class="form-links">
            ${this.role === "Buyer"
              ? html`<p>
                  Are you a craftsman?
                  <a href="/auth/signup?role=Craftsman">
                    <i class="fas fa-tools"></i> Register as a craftsman
                  </a>
                </p>`
              : ""}
            <p>
              Already have an account?
              <a href="/auth/login">
                <i class="fas fa-sign-in-alt"></i> Login
              </a>
            </p>
          </div>
        </div>
      </div>

      <style>
        .signup-form-container {
          display: flex;
          width: 100%;
          background-color: #3e2723;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
        }

        .form-image {
          flex: 1;
          overflow: hidden;
          display: none;
          position: relative;
        }

        .form-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to right,
            rgba(62, 39, 35, 0.9),
            rgba(62, 39, 35, 0.4)
          );
        }

        .image-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 3rem;
          color: #ffffff;
          text-align: left;
        }

        .image-content h2 {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #ffd700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .image-content p {
          font-size: 1.1rem;
          opacity: 0.9;
          max-width: 80%;
        }

        .form-content {
          flex: 1;
          padding: 2.5rem;
          color: #ffffff;
        }

        .form-title {
          font-size: 2.2rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .form-title i {
          color: #ffd700;
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
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        label i {
          color: #ffd700;
          width: 16px;
        }

        input {
          width: 100%;
          padding: 0.9rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        input:focus {
          outline: none;
          border-color: #ffd700;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
        }

        .submit-button {
          width: 100%;
          padding: 0.9rem;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .submit-button:hover {
          background-color: #f5cc00;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .submit-button:disabled {
          background-color: #ccaa00;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .error-message {
          background-color: rgba(255, 0, 0, 0.2);
          color: #ffffff;
          padding: 0.9rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
          border-left: 4px solid #ff4d4d;
        }

        .error-message i {
          color: #ff4d4d;
        }

        .form-links {
          margin-top: 2rem;
          text-align: center;
        }

        .form-links a {
          color: #ffd700;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .form-links a:hover {
          color: #f5cc00;
        }

        @media (min-width: 768px) {
          .form-image {
            display: block;
          }
        }

        @media (max-width: 768px) {
          .form-content {
            padding: 2rem;
          }

          .form-title {
            font-size: 1.8rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("signup-form", SignupForm);
