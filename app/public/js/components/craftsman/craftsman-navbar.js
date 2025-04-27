// File: app/public/js/components/craftsman/craftsman-navbar.js
import { LitElement, html } from "https://esm.run/lit";
import { getUser, signOut } from "../../utils/auth_utils.js";

class CraftsmanNavbar extends LitElement {
  static get properties() {
    return {
      user: { type: Object },
    };
  }

  constructor() {
    super();
    this.user = null;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadUserData();
  }

  async loadUserData() {
    this.user = getUser();
  }

  handleSignOut() {
    signOut();
    window.location.href = "/";
  }

  render() {
    return html`
      <nav class="craftsman-navbar">
        <div class="navbar-logo">
          <img src="/static/images/logo.png" alt="Ceylon Handicrafts" />
          <span>Ceylon Handicrafts</span>
        </div>

        <ul class="navbar-links">
          <li class="active">
            <a href="/craftsman"><i class="fas fa-chart-line"></i> Dashboard</a>
          </li>
          <li>
            <a href="/craftsman/products"
              ><i class="fas fa-box"></i> Products</a
            >
          </li>
          <li>
            <a href="/craftsman/orders"
              ><i class="fas fa-shipping-fast"></i> Orders</a
            >
          </li>
        </ul>

        <div class="navbar-profile">
          <div class="profile-info">
            <span>${this.user ? this.user.name : "Craftsman"}</span>
            <a href="/craftsman/profile"><i class="fas fa-user-circle"></i></a>
          </div>
          <button class="sign-out-btn" @click=${this.handleSignOut}>
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </nav>

      <style>
        .craftsman-navbar {
          width: 250px;
          background-color: #5d4037; /* Secondary brown */
          min-height: 100vh;
          padding: 1.5rem 0;
          display: flex;
          flex-direction: column;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          margin-bottom: 2rem;
          color: #ffd700; /* Accent yellow */
        }

        .navbar-logo img {
          width: 40px;
          margin-right: 0.5rem;
        }

        .navbar-links {
          list-style: none;
          padding: 0;
          margin: 0;
          flex-grow: 1;
        }

        .navbar-links li {
          padding: 0.75rem 1.5rem;
          transition: background-color 0.3s;
        }

        .navbar-links li:hover {
          background-color: #3e2723; /* Main dark brown */
        }

        .navbar-links li.active {
          background-color: #3e2723; /* Main dark brown */
          border-left: 4px solid #ffd700; /* Accent yellow */
        }

        .navbar-links a {
          color: #ffffff; /* Text white */
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        .navbar-links a i {
          margin-right: 0.5rem;
          width: 20px;
          text-align: center;
        }

        .navbar-profile {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .profile-info {
          display: flex;
          align-items: center;
        }

        .profile-info span {
          margin-right: 0.5rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }

        .profile-info a {
          color: #ffd700; /* Accent yellow */
          font-size: 1.25rem;
        }

        .sign-out-btn {
          background: none;
          border: none;
          color: #e0e0e0; /* Subtle grey */
          cursor: pointer;
        }

        .sign-out-btn:hover {
          color: #ffd700; /* Accent yellow */
        }
      </style>
    `;
  }
}

customElements.define("craftsman-navbar", CraftsmanNavbar);
