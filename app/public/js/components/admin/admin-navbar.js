import { LitElement, html } from "https://esm.run/lit";
import { getUser, signOut } from "/static/js/utils/auth_utils.js";

class AdminNavbar extends LitElement {
  static get properties() {
    return {
      adminName: { type: String },
      activePage: { type: String },
    };
  }

  constructor() {
    super();
    this.adminName = "";
    this.activePage = "dashboard";

    // Check authentication
    this.checkAuth();
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  checkAuth() {
    const user = getUser();
    if (user) {
      this.adminName = user.name;
    } else {
      window.location.href = "/auth/login?redirect=/admin";
    }
  }

  firstUpdated() {
    // Set active page based on URL
    const path = window.location.pathname;
    if (path.includes("/admin/categories")) {
      this.activePage = "categories";
    } else if (path.includes("/admin/vishva-library")) {
      this.activePage = "vishva";
    } else {
      this.activePage = "dashboard";
    }
  }

  handleSignOut() {
    signOut();
  }

  render() {
    return html`
      <nav class="admin-navbar">
        <div class="navbar-brand">
          <h1>Ceylon Handicrafts</h1>
        </div>

        <div class="navbar-menu">
          <a
            href="/admin"
            class="${this.activePage === "dashboard" ? "active" : ""}"
          >
            <i class="fas fa-chart-line"></i> Dashboard
          </a>
          <a
            href="/admin/categories"
            class="${this.activePage === "categories" ? "active" : ""}"
          >
            <i class="fas fa-tag"></i> Categories
          </a>
          <a
            href="/admin/vishva-library"
            class="${this.activePage === "vishva" ? "active" : ""}"
          >
            <i class="fas fa-book"></i> Vishva Library
          </a>
        </div>

        <div class="navbar-user">
          <div class="user-info">
            <span class="user-name">${this.adminName}</span>
            <span class="user-role">Administrator</span>
          </div>
          <button class="signout-btn" @click=${this.handleSignOut}>
            <i class="fas fa-sign-out-alt"></i> Sign Out
          </button>
        </div>
      </nav>

      <style>
        .admin-navbar {
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
      </style>
    `;
  }
}

customElements.define("admin-navbar", AdminNavbar);
