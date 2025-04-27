import { LitElement, html } from "https://esm.run/lit";
import { isSignedIn, getUser, signOut } from "../../utils/auth_utils.js";

class AppNavbar extends LitElement {
  static get properties() {
    return {
      isAuthenticated: { type: Boolean },
      user: { type: Object },
      isMenuOpen: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.isAuthenticated = false;
    this.user = null;
    this.isMenuOpen = false;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    // Check authentication status
    this.isAuthenticated = isSignedIn();
    if (this.isAuthenticated) {
      this.user = getUser();
    }

    // Add scroll event listener for navbar styling
    window.addEventListener("scroll", () => {
      const navbar = this.querySelector(".app-navbar");
      if (window.scrollY > 50) {
        navbar.classList.add("navbar-scrolled");
      } else {
        navbar.classList.remove("navbar-scrolled");
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    const navLinks = this.querySelector(".nav-links");
    if (this.isMenuOpen) {
      navLinks.classList.add("show");
    } else {
      navLinks.classList.remove("show");
    }
  }

  handleSignOut() {
    signOut();
    window.location.href = "/";
  }

  render() {
    return html`
      <nav class="app-navbar">
        <div class="container navbar-container">
          <div class="navbar-brand">
            <a href="/" class="logo">
              <img
                src="/static/images/logo.png"
                alt="Ceylon Handicrafts Logo"
              />
            </a>
          </div>

          <button class="menu-toggle" @click=${this.toggleMenu}>
            <i class="fas fa-bars"></i>
          </button>

          <div class="nav-links">
            <a href="/" class="nav-link active">Home</a>
            <a href="/vishva" class="nav-link">Vishva AI</a>
            <a href="/shop" class="nav-link">Shop</a>
            <a href="/about" class="nav-link">About</a>

            ${this.isAuthenticated
              ? html`
                  <a href="/cart" class="nav-link cart-link">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-badge">0</span>
                  </a>
                  <div class="user-menu">
                    <button class="user-menu-btn">
                      <span>${this.user?.username || "User"}</span>
                      <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="user-dropdown">
                      <a href="/profile">My Profile</a>
                      <a href="/orders">My Orders</a>
                      ${this.user?.role === "Craftsman"
                        ? html`<a href="/craftsman/dashboard">Dashboard</a>`
                        : ""}
                      <a href="#" @click=${this.handleSignOut}>Sign Out</a>
                    </div>
                  </div>
                `
              : html`
                  <a href="/signin" class="nav-link signin-link">
                    <i class="fas fa-user"></i> Sign In
                  </a>
                `}
          </div>
        </div>
      </nav>

      <style>
        .app-navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          background-color: rgba(62, 39, 35, 0.9);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .navbar-scrolled {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          background-color: rgba(62, 39, 35, 0.95);
        }

        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
        }

        .logo img {
          height: 50px;
          transition: transform 0.3s ease;
        }

        .logo img:hover {
          transform: scale(1.05);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-link {
          color: var(--text-white);
          text-decoration: none;
          font-weight: 500;
          position: relative;
          padding: 0.5rem 0;
          transition: color 0.3s ease;
        }

        .nav-link:hover,
        .nav-link.active {
          color: var(--accent-yellow);
        }

        .nav-link::after {
          content: "";
          position: absolute;
          width: 0;
          height: 2px;
          background-color: var(--accent-yellow);
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          transition: width 0.3s ease;
        }

        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }

        .cart-link {
          position: relative;
          font-size: 1.1rem;
        }

        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown);
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .signin-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown) !important;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .signin-link:hover {
          background-color: #e6c200;
          transform: translateY(-2px);
        }

        .user-menu {
          position: relative;
        }

        .user-menu-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: var(--text-white);
          font-family: "Poppins", sans-serif;
          font-weight: 500;
          cursor: pointer;
          padding: 0.5rem;
        }

        .user-menu-btn:hover {
          color: var(--accent-yellow);
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: var(--secondary-brown);
          border-radius: 4px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          min-width: 180px;
          display: none;
          flex-direction: column;
          z-index: 100;
          overflow: hidden;
        }

        .user-menu:hover .user-dropdown {
          display: flex;
          animation: fadeIn 0.3s ease;
        }

        .user-dropdown a {
          padding: 0.75rem 1rem;
          color: var(--text-white);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .user-dropdown a:hover {
          background-color: var(--primary-dark-brown);
          color: var(--accent-yellow);
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-white);
          font-size: 1.5rem;
          cursor: pointer;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
          }

          .nav-links {
            position: fixed;
            top: 80px;
            left: 0;
            width: 100%;
            background-color: var(--primary-dark-brown);
            flex-direction: column;
            gap: 0;
            height: 0;
            overflow: hidden;
            transition: height 0.3s ease;
          }

          .nav-links.show {
            height: calc(100vh - 80px);
            overflow-y: auto;
          }

          .nav-link {
            width: 100%;
            padding: 1rem;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .user-menu {
            width: 100%;
          }

          .user-menu-btn {
            width: 100%;
            justify-content: center;
            padding: 1rem;
          }

          .user-dropdown {
            position: static;
            width: 100%;
          }

          .signin-link {
            margin: 1rem auto;
            width: 80%;
            justify-content: center;
          }
        }
      </style>
    `;
  }
}

customElements.define("app-navbar", AppNavbar);
