import { LitElement, html } from "https://esm.run/lit";
import { getUser, signOut } from "/static/js/utils/auth_utils.js";

class CraftsmanNavbar extends LitElement {
  static get properties() {
    return {
      craftsmanName: { type: String },
      activePage: { type: String },
      errorMessage: { type: String },
    };
  }

  constructor() {
    super();
    this.craftsmanName = "";
    this.activePage = "dashboard";
    this.errorMessage = "";

    // Check authentication with try/catch
    try {
      this.checkAuth();
    } catch (error) {
      console.error("Error in navbar authentication:", error);
      this.errorMessage = error.message;
    }
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  checkAuth() {
    console.log("Checking auth in navbar");
    const user = getUser();
    console.log("User data:", user);

    if (user) {
      this.craftsmanName = user.name || "Craftsman";
      // Check if user is craftsman, but skip redirect for now to avoid loops
      if (user.role !== "Craftsman") {
        console.log("User is not a Craftsman:", user.role);
        // Instead of redirect, just log the issue for debugging
        this.errorMessage = "This area is for craftsmen only";
      }
    } else {
      console.log("No user found, will redirect to login");
      // For debugging, let's not redirect on page load
      this.errorMessage = "Authentication required";

      // Comment out the redirect for debugging
      // const currentPath = window.location.pathname + window.location.search;
      // window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }

  firstUpdated() {
    try {
      // Set active page based on URL
      const path = window.location.pathname;
      console.log("Current path:", path);

      if (path.includes("/craftsman/products")) {
        this.activePage = "products";
      } else if (path.includes("/craftsman/orders")) {
        this.activePage = "orders";
      } else {
        this.activePage = "dashboard";
      }

      console.log("Active page set to:", this.activePage);
    } catch (error) {
      console.error("Error in firstUpdated:", error);
      this.errorMessage = error.message;
    }
  }

  handleSignOut() {
    signOut();
    window.location.href = "/";
  }

  render() {
    console.log("Rendering navbar, craftsman name:", this.craftsmanName);

    return html`
      <nav class="craftsman-navbar">
        <div class="navbar-brand">
          <h1>Ceylon Handicrafts</h1>
        </div>

        <div class="navbar-menu">
          <a
            href="/craftsman"
            class="${this.activePage === "dashboard" ? "active" : ""}"
          >
            <i class="fas fa-chart-line"></i> Dashboard
          </a>
          <a
            href="/craftsman/products"
            class="${this.activePage === "products" ? "active" : ""}"
          >
            <i class="fas fa-box"></i> Products
          </a>
          <a
            href="/craftsman/orders"
            class="${this.activePage === "orders" ? "active" : ""}"
          >
            <i class="fas fa-shipping-fast"></i> Orders
          </a>
        </div>

        <div class="navbar-user">
          <div class="user-info">
            <span class="user-name">${this.craftsmanName}</span>
            <span class="user-role">Craftsman</span>
          </div>
          <button class="signout-btn" @click=${this.handleSignOut}>
            <i class="fas fa-sign-out-alt"></i> Sign Out
          </button>
        </div>
      </nav>

      ${this.errorMessage
        ? html` <div class="navbar-error">${this.errorMessage}</div> `
        : ""}

      <style>
        .craftsman-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #3e2723;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #5d4037;
        }

        .navbar-brand h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #ffd700;
        }

        .navbar-menu {
          display: flex;
          gap: 1.5rem;
        }

        .navbar-menu a {
          color: #ffffff;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 0;
          transition: color 0.2s;
        }

        .navbar-menu a:hover {
          color: #ffd700;
        }

        .navbar-menu a.active {
          color: #ffd700;
          border-bottom: 2px solid #ffd700;
        }

        .navbar-menu a i {
          margin-right: 0.5rem;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          text-align: right;
        }

        .user-name {
          font-weight: 600;
          color: #ffffff;
        }

        .user-role {
          font-size: 0.85rem;
          color: #e0e0e0;
        }

        .signout-btn {
          background-color: transparent;
          border: 1px solid #ffd700;
          color: #ffd700;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .signout-btn:hover {
          background-color: #ffd700;
          color: #3e2723;
        }

        .navbar-error {
          background-color: rgba(255, 0, 0, 0.1);
          color: #ffcccc;
          text-align: center;
          padding: 0.5rem;
          font-size: 0.9rem;
        }
      </style>
    `;
  }
}

customElements.define("craftsman-navbar", CraftsmanNavbar);
