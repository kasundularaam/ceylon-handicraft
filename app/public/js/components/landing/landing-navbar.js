import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";
import {
  isSignedIn,
  getUser,
  getRole,
  signOut,
} from "../../utils/auth_utils.js";

class LandingNavbar extends LitElement {
  static get properties() {
    return {
      cartCount: { type: Number },
      isAuthenticated: { type: Boolean },
      username: { type: String },
      isBuyer: { type: Boolean },
      menuOpen: { type: Boolean },
      currentPath: { type: String }, // Added property to track current path
    };
  }

  constructor() {
    super();
    this.cartCount = 0;
    this.isAuthenticated = false;
    this.username = "";
    this.isBuyer = false;
    this.menuOpen = false;
    this.currentPath = window.location.pathname; // Initialize with current path
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.checkAuthStatus();
    this.fetchCartCount();
    this.currentPath = window.location.pathname;

    // Listen for navigation events (for single-page app navigation)
    window.addEventListener("popstate", () => {
      this.currentPath = window.location.pathname;
    });
  }

  async checkAuthStatus() {
    this.isAuthenticated = isSignedIn();
    if (this.isAuthenticated) {
      const user = getUser();
      this.username = user?.name || "User";
      this.isBuyer = getRole() === "Buyer";
    }
  }

  async fetchCartCount() {
    if (this.isAuthenticated && this.isBuyer) {
      try {
        const data = await fetchJson("/api/landing/cart/count");
        this.cartCount = data.count || 0;
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  handleSignOut() {
    signOut();
    window.location.href = "/";
  }

  // Helper method to check if a path matches the current path
  isActive(path) {
    // Basic check for exact match
    if (this.currentPath === path) return true;

    // Special case for non-root paths (check if currentPath starts with given path)
    if (path !== "/" && this.currentPath.startsWith(path)) return true;

    return false;
  }

  render() {
    return html`
      <nav class="landing-navbar">
        <div class="navbar-container">
          <div class="navbar-logo">
            <a href="/">
              <img
                src="/static/images/logo.png"
                alt="Ceylon Handicrafts"
                width="180"
              />
            </a>
          </div>

          <div class="mobile-menu-toggle" @click=${this.toggleMenu}>
            <i class="fas fa-bars"></i>
          </div>

          <div class="navbar-menu ${this.menuOpen ? "active" : ""}">
            <ul class="navbar-links">
              <li>
                <a href="/" class="${this.isActive("/") ? "active" : ""}"
                  >Home</a
                >
              </li>
              <li>
                <a
                  href="/vishva"
                  class="${this.isActive("/vishva") ? "active" : ""}"
                  >Vishva</a
                >
              </li>
              <li>
                <a
                  href="/sale"
                  class="${this.isActive("/sale") ? "active" : ""}"
                  >Shop</a
                >
              </li>
              <li>
                <a
                  href="/auction"
                  class="${this.isActive("/auction") ? "active" : ""}"
                  >Auction</a
                >
              </li>
              <li>
                <a
                  href="/about"
                  class="${this.isActive("/about") ? "active" : ""}"
                  >About</a
                >
              </li>
            </ul>

            <div class="navbar-actions">
              ${this.isAuthenticated && this.isBuyer
                ? html`
                    <a href="/cart" class="cart-link">
                      <i class="fas fa-shopping-cart"></i>
                      ${this.cartCount > 0
                        ? html`<span class="cart-badge"
                            >${this.cartCount}</span
                          >`
                        : ""}
                    </a>
                  `
                : ""}
              ${this.isAuthenticated
                ? html`
                    <a href="/profile" class="user-link">
                      <i class="fas fa-user"></i> ${this.username}
                    </a>
                    <button class="signout-button" @click=${this.handleSignOut}>
                      <i class="fas fa-sign-out-alt"></i>
                    </button>
                  `
                : html`
                    <a href="/auth/login" class="signin-button">
                      <i class="fas fa-sign-in-alt"></i> Sign In
                    </a>
                  `}
            </div>
          </div>
        </div>
      </nav>

      <style>
        .landing-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #3e2723;
          padding: 1rem 1.5rem;
          width: 100%;
          border-bottom: 1px solid #5d4037;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }

        /* Rest of the CSS remains unchanged */
        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .navbar-logo img {
          transition: transform 0.3s ease;
        }

        .navbar-logo img:hover {
          transform: scale(1.05);
        }

        .navbar-menu {
          display: flex;
          align-items: center;
        }

        .navbar-links {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .navbar-links li {
          margin: 0 0.5rem;
        }

        .navbar-links a {
          color: #ffffff;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          transition: color 0.3s ease;
          position: relative;
        }

        .navbar-links a::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 0;
          height: 2px;
          background-color: #ffd700;
          transition: width 0.3s ease, left 0.3s ease;
        }

        .navbar-links a:hover::after,
        .navbar-links a.active::after {
          width: 100%;
          left: 0;
        }

        .navbar-links a:hover,
        .navbar-links a.active {
          color: #ffd700;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          margin-left: 2rem;
          gap: 1rem;
        }

        .cart-link {
          position: relative;
          color: #ffffff;
          font-size: 1.2rem;
          transition: color 0.3s ease;
        }

        .cart-link:hover {
          color: #ffd700;
        }

        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background-color: #ffd700;
          color: #3e2723;
          font-size: 0.7rem;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        .signin-button,
        .user-link {
          background-color: #ffd700;
          color: #3e2723;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .signin-button:hover,
        .user-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .user-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .signout-button {
          background-color: transparent;
          color: #ffffff;
          border: 1px solid #ffd700;
          width: 38px;
          height: 38px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .signout-button:hover {
          background-color: rgba(255, 215, 0, 0.2);
          color: #ffd700;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-menu-toggle {
          display: none;
          color: #ffffff;
          font-size: 1.5rem;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: block;
          }

          .navbar-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #5d4037;
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem;
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: transform 0.3s ease, opacity 0.3s ease,
              visibility 0.3s ease;
            z-index: 100;
          }

          .navbar-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .navbar-links {
            flex-direction: column;
            width: 100%;
          }

          .navbar-links li {
            margin: 0.5rem 0;
            width: 100%;
          }

          .navbar-links a {
            display: block;
            padding: 0.75rem 0;
            width: 100%;
          }

          .navbar-actions {
            margin-left: 0;
            margin-top: 1rem;
            width: 100%;
            justify-content: space-between;
          }
        }
      </style>
    `;
  }
}

customElements.define("landing-navbar", LandingNavbar);
