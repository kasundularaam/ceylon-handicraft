import { LitElement, html } from "https://esm.run/lit";
import {
  isSignedIn,
  getUser,
  getRole,
  signOut,
} from "../../utils/auth_utils.js";

class CraftsmanDashboard extends LitElement {
  static get properties() {
    return {
      user: { type: Object },
      isAuthenticated: { type: Boolean },
      isCraftsman: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.user = null;
    this.isAuthenticated = false;
    this.isCraftsman = false;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.checkAuth();
  }

  checkAuth() {
    this.isAuthenticated = isSignedIn();
    if (this.isAuthenticated) {
      this.user = getUser();
      const role = getRole();
      this.isCraftsman = role === "Craftsman";

      // Redirect if not craftsman
      if (!this.isCraftsman) {
        window.location.href = "/";
      }
    } else {
      // Redirect to login if not authenticated
      window.location.href = "/auth/login";
    }
  }

  handleSignOut() {
    signOut();
    window.location.href = "/";
  }

  render() {
    if (!this.isAuthenticated || !this.isCraftsman) {
      return html`<div>Checking authentication...</div>`;
    }

    return html`
      <div class="craftsman-container">
        <header class="header">
          <div class="logo">
            <img src="/static/images/logo.png" alt="Ceylon Handicrafts" />
          </div>
          <nav class="nav">
            <div class="user-info">
              <span>Welcome, ${this.user.name}</span>
              <button @click=${this.handleSignOut} class="sign-out-btn">
                Sign Out
              </button>
            </div>
          </nav>
        </header>

        <main class="main-content">
          <h1>Craftsman Dashboard</h1>

          <div class="craftsman-panel">
            <div class="craftsman-details">
              <h2>Craftsman Details</h2>
              <p><strong>Name:</strong> ${this.user.name}</p>
              <p><strong>Email:</strong> ${this.user.email}</p>
              <p><strong>Role:</strong> ${this.user.role}</p>
            </div>
          </div>
        </main>
      </div>

      <style>
        .craftsman-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #3e2723;
          color: #ffffff;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background-color: rgba(0, 0, 0, 0.2);
        }

        .logo img {
          height: 50px;
        }

        .nav {
          display: flex;
          align-items: center;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .sign-out-btn {
          background-color: transparent;
          color: #ffd700;
          border: 1px solid #ffd700;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: 0.3s;
        }

        .sign-out-btn:hover {
          background-color: #ffd700;
          color: #3e2723;
        }

        .main-content {
          flex: 1;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #ffd700;
        }

        .craftsman-panel {
          margin-top: 2rem;
          background-color: rgba(0, 0, 0, 0.2);
          padding: 2rem;
          border-radius: 10px;
        }

        .craftsman-details p {
          margin: 0.5rem 0;
        }

        h2 {
          color: #ffd700;
          margin-bottom: 1rem;
        }
      </style>
    `;
  }
}

customElements.define("craftsman-dashboard", CraftsmanDashboard);
