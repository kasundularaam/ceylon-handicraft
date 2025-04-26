import { LitElement, html } from "https://esm.run/lit";
import { signIn } from "../../utils/auth_utils.js";

class LoginForm extends LitElement {
  static get properties() {
    return {
      loading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.loading = false;
    this.error = "";
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  async handleSubmit(e) {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!email || !password) {
      this.error = "Please fill in all fields";
      return;
    }

    this.loading = true;
    this.error = "";

    try {
      const data = await signIn(email, password);

      // Redirect based on user role
      const role = data.user.role;
      if (role === "Buyer") {
        window.location.href = "/";
      } else if (role === "Craftsman") {
        window.location.href = "/craftsman";
      } else if (role === "Admin") {
        window.location.href = "/admin";
      }
    } catch (error) {
      this.error = error.message || "Login failed";
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="login-form-container">
        <div class="form-image">
          <img src="/static/images/auth_featuring.jpg" alt="Featured Image" />
          <div class="image-overlay"></div>
          <div class="image-content">
            <h2>Discover the Essence of Ceylon</h2>
            <p>Authentic Handicrafts, Timeless Traditions</p>
          </div>
        </div>
        <div class="form-content">
          <h2 class="form-title">
            <i class="fas fa-user-circle"></i> Welcome Back
          </h2>
          <p class="form-subtitle">
            Sign in to continue your journey with Ceylon Handicrafts
          </p>

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
              <label for="password">
                <i class="fas fa-lock"></i> Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              class="submit-button"
              ?disabled=${this.loading}
            >
              ${this.loading
                ? html`<i class="fas fa-spinner fa-spin"></i> Signing In...`
                : html`<i class="fas fa-sign-in-alt"></i> Sign In`}
            </button>
          </form>

          <div class="form-links">
            <p>
              Don't have an account?
              <a href="/auth/signup?role=Buyer"
                >Create Account <i class="fas fa-arrow-right"></i
              ></a>
            </p>
          </div>
        </div>
      </div>

      <style>
        .login-form-container {
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
      </style>
    `;
  }
}

customElements.define("login-form", LoginForm);
