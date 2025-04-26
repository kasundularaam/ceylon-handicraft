import { LitElement, html } from "https://esm.run/lit";
import {
  isSignedIn,
  getUser,
  getRole,
  signOut,
} from "../../utils/auth_utils.js";

class HomePage extends LitElement {
  static get properties() {
    return {
      user: { type: Object },
      isAuthenticated: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.user = null;
    this.isAuthenticated = false;
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

      // Redirect if not a buyer
      if (role === "Admin") {
        window.location.href = "/admin";
      } else if (role === "Craftsman") {
        window.location.href = "/craftsman";
      }
    }
  }

  handleSignOut() {
    signOut();
    this.isAuthenticated = false;
    this.user = null;
  }

  render() {
    return html`
      <div class="home-container">
        <!-- Header -->
        <header class="header">
          <div class="logo">
            <img src="/static/images/logo.png" alt="Ceylon Handicrafts" />
          </div>
          <nav class="nav">
            ${this.isAuthenticated
              ? html`
                  <div class="user-info">
                    <div class="user-greeting">
                      <i class="fas fa-user-circle"></i>
                      <span>Welcome, ${this.user.name}</span>
                    </div>
                    <button @click=${this.handleSignOut} class="sign-out-btn">
                      <i class="fas fa-sign-out-alt"></i> Sign Out
                    </button>
                  </div>
                `
              : html`
                  <a href="/auth/login" class="auth-link">
                    <i class="fas fa-sign-in-alt"></i> Sign In
                  </a>
                `}
          </nav>
        </header>

        <!-- Hero Section -->
        <section class="hero">
          <div class="hero-content">
            <h1 class="hero-title">
              Discover Authentic Sri Lankan Craftsmanship
            </h1>
            <p class="hero-subtitle">
              Connect with skilled artisans and explore handcrafted treasures
              that tell stories of Ceylon's rich heritage
            </p>
            ${!this.isAuthenticated
              ? html`
                  <div class="hero-cta">
                    <a
                      href="/auth/signup?role=Buyer"
                      class="cta-button primary"
                    >
                      <i class="fas fa-user-plus"></i> Create Account
                    </a>
                    <a href="/auth/login" class="cta-button secondary">
                      <i class="fas fa-sign-in-alt"></i> Sign In
                    </a>
                  </div>
                `
              : ""}
          </div>
          <div class="hero-overlay"></div>
        </section>

        <!-- Main Content -->
        <main class="main-content">
          ${this.isAuthenticated
            ? html`
                <section class="user-dashboard">
                  <div class="dashboard-header">
                    <h2><i class="fas fa-user"></i> Your Account</h2>
                  </div>
                  <div class="dashboard-card">
                    <div class="user-profile">
                      <div class="user-avatar">
                        <i class="fas fa-user-circle"></i>
                      </div>
                      <div class="user-details">
                        <p>
                          <i class="fas fa-id-card"></i>
                          <strong>Name:</strong> ${this.user.name}
                        </p>
                        <p>
                          <i class="fas fa-envelope"></i>
                          <strong>Email:</strong> ${this.user.email}
                        </p>
                        <p>
                          <i class="fas fa-user-tag"></i>
                          <strong>Role:</strong> ${this.user.role}
                        </p>
                      </div>
                    </div>
                    <div class="quick-actions">
                      <h3>Quick Actions</h3>
                      <div class="action-buttons">
                        <a href="#" class="action-button">
                          <i class="fas fa-shopping-bag"></i>
                          <span>View Orders</span>
                        </a>
                        <a href="#" class="action-button">
                          <i class="fas fa-heart"></i>
                          <span>Favorites</span>
                        </a>
                        <a href="#" class="action-button">
                          <i class="fas fa-cog"></i>
                          <span>Settings</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              `
            : html`
                <!-- Featured Categories Section -->
                <section class="featured-categories">
                  <h2 class="section-title">Explore Our Collections</h2>
                  <div class="category-grid">
                    ${this.renderCategoryCard("Wood Carvings", "fa-tree")}
                    ${this.renderCategoryCard(
                      "Sri Lankan Masks",
                      "fa-theater-masks"
                    )}
                    ${this.renderCategoryCard("Handwoven & Batik", "fa-tshirt")}
                    ${this.renderCategoryCard("Brass & Metal Art", "fa-gem")}
                  </div>
                  <a href="#" class="view-all-link"
                    >View All Categories <i class="fas fa-arrow-right"></i
                  ></a>
                </section>

                <!-- About Section -->
                <section class="about-section">
                  <div class="about-content">
                    <h2 class="section-title">
                      The Ceylon Handicrafts Experience
                    </h2>
                    <p>
                      Discover the beauty and artistry of traditional Sri Lankan
                      craftsmanship, passed down through generations of skilled
                      artisans.
                    </p>

                    <div class="features">
                      <div class="feature">
                        <i class="fas fa-certificate"></i>
                        <h3>Authentic Crafts</h3>
                        <p>Directly from artisans across Sri Lanka</p>
                      </div>
                      <div class="feature">
                        <i class="fas fa-handshake"></i>
                        <h3>Support Artisans</h3>
                        <p>Buy directly from traditional craftspeople</p>
                      </div>
                      <div class="feature">
                        <i class="fas fa-history"></i>
                        <h3>Cultural Heritage</h3>
                        <p>Each piece tells a story of Sri Lankan tradition</p>
                      </div>
                    </div>
                  </div>
                </section>
              `}
        </main>

        <!-- Footer -->
        <footer class="footer">
          <div class="footer-content">
            <div class="footer-brand">
              <img
                src="/static/images/logo.png"
                alt="Ceylon Handicrafts"
                class="footer-logo"
              />
              <p>Connecting global buyers with Sri Lankan artisans</p>
            </div>
            <div class="footer-links">
              <div class="footer-column">
                <h3>Shop</h3>
                <ul>
                  <li><a href="#">Wood Carvings</a></li>
                  <li><a href="#">Traditional Masks</a></li>
                  <li><a href="#">Handwoven Textiles</a></li>
                  <li><a href="#">Brass & Metal Art</a></li>
                </ul>
              </div>
              <div class="footer-column">
                <h3>About</h3>
                <ul>
                  <li><a href="#">Our Story</a></li>
                  <li><a href="#">Meet the Artisans</a></li>
                  <li><a href="#">Shipping & Returns</a></li>
                  <li><a href="#">Contact Us</a></li>
                </ul>
              </div>
              <div class="footer-column">
                <h3>Connect</h3>
                <div class="social-icons">
                  <a href="#" class="social-icon"
                    ><i class="fab fa-facebook-f"></i
                  ></a>
                  <a href="#" class="social-icon"
                    ><i class="fab fa-instagram"></i
                  ></a>
                  <a href="#" class="social-icon"
                    ><i class="fab fa-pinterest"></i
                  ></a>
                  <a href="#" class="social-icon"
                    ><i class="fab fa-twitter"></i
                  ></a>
                </div>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>
              &copy; ${new Date().getFullYear()} Ceylon Handicrafts. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>

      <style>
        /* Base Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Poppins", sans-serif;
          color: #ffffff;
          background-color: #3e2723;
        }

        .home-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Header Styles */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 5%;
          background-color: rgba(0, 0, 0, 0.3);
          position: sticky;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .logo img {
          height: 50px;
        }

        .nav {
          display: flex;
          align-items: center;
        }

        .auth-link {
          color: #ffd700;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1.2rem;
          border: 2px solid #ffd700;
          border-radius: 50px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-link i {
          font-size: 0.9rem;
        }

        .auth-link:hover {
          background-color: #ffd700;
          color: #3e2723;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .user-greeting {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-greeting i {
          font-size: 1.2rem;
          color: #ffd700;
        }

        .sign-out-btn {
          background-color: transparent;
          color: #ffd700;
          border: 2px solid #ffd700;
          padding: 0.5rem 1.2rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sign-out-btn:hover {
          background-color: #ffd700;
          color: #3e2723;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        /* Hero Section */
        .hero {
          position: relative;
          height: 80vh;
          max-height: 700px;
          min-height: 500px;
          background-image: url("/static/images/hero-background.jpg");
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            rgba(62, 39, 35, 0.7),
            rgba(62, 39, 35, 0.9)
          );
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 1000px;
          padding: 0 2rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #ffd700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero-subtitle {
          font-size: 1.2rem;
          margin-bottom: 2.5rem;
          line-height: 1.6;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-cta {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .cta-button.primary {
          background-color: #ffd700;
          color: #3e2723;
          border: 2px solid #ffd700;
        }

        .cta-button.primary:hover {
          background-color: #f5cc00;
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
        }

        .cta-button.secondary {
          background-color: transparent;
          color: #ffffff;
          border: 2px solid #ffffff;
        }

        .cta-button.secondary:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
        }

        /* Main Content */
        .main-content {
          flex: 1;
          padding: 4rem 5%;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Section Styles */
        .section-title {
          font-size: 2.2rem;
          color: #ffd700;
          margin-bottom: 2rem;
          text-align: center;
        }

        /* Featured Categories */
        .featured-categories {
          margin-bottom: 5rem;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .category-card {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 15px;
          overflow: hidden;
          transition: all 0.3s ease;
          text-decoration: none;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2.5rem 1.5rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .category-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 215, 0, 0.3);
        }

        .category-icon {
          font-size: 3rem;
          color: #ffd700;
          margin-bottom: 1.5rem;
        }

        .category-name {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .view-all-link {
          display: block;
          text-align: center;
          color: #ffd700;
          text-decoration: none;
          font-weight: 500;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .view-all-link:hover {
          color: #f5cc00;
          text-decoration: underline;
        }

        /* About Section */
        .about-section {
          background-color: rgba(0, 0, 0, 0.2);
          padding: 4rem 2rem;
          border-radius: 15px;
          margin-bottom: 5rem;
        }

        .about-content {
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
        }

        .about-content p {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 3rem;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature {
          padding: 1.5rem;
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .feature:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
        }

        .feature i {
          font-size: 2.5rem;
          color: #ffd700;
          margin-bottom: 1rem;
        }

        .feature h3 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: #ffd700;
        }

        .feature p {
          font-size: 0.9rem;
          margin-bottom: 0;
        }

        /* User Dashboard */
        .user-dashboard {
          margin-bottom: 4rem;
        }

        .dashboard-header {
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard-header h2 {
          color: #ffd700;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dashboard-header h2 i {
          font-size: 1.8rem;
        }

        .dashboard-card {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 15px;
          padding: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-profile {
          display: flex;
          gap: 2rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .user-avatar {
          flex-shrink: 0;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-color: rgba(255, 215, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffd700;
        }

        .user-avatar i {
          font-size: 3rem;
          color: #ffd700;
        }

        .user-details {
          flex: 1;
        }

        .user-details p {
          margin-bottom: 1rem;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-details p i {
          color: #ffd700;
          width: 20px;
          text-align: center;
        }

        .quick-actions h3 {
          color: #ffd700;
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
          text-align: center;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .action-button {
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          text-decoration: none;
          padding: 1.5rem;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
          text-align: center;
        }

        .action-button:hover {
          background-color: rgba(255, 215, 0, 0.2);
          transform: translateY(-5px);
        }

        .action-button i {
          font-size: 1.8rem;
          color: #ffd700;
        }

        /* Footer */
        .footer {
          background-color: rgba(0, 0, 0, 0.4);
          padding-top: 4rem;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 5%;
          display: flex;
          flex-wrap: wrap;
          gap: 4rem;
          margin-bottom: 4rem;
        }

        .footer-brand {
          flex: 1;
          min-width: 250px;
        }

        .footer-logo {
          height: 40px;
          margin-bottom: 1rem;
        }

        .footer-links {
          display: flex;
          gap: 4rem;
          flex-wrap: wrap;
        }

        .footer-column h3 {
          color: #ffd700;
          margin-bottom: 1.5rem;
          font-size: 1.2rem;
        }

        .footer-column ul {
          list-style: none;
        }

        .footer-column ul li {
          margin-bottom: 0.8rem;
        }

        .footer-column ul li a {
          color: #e0e0e0;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .footer-column ul li a:hover {
          color: #ffd700;
        }

        .social-icons {
          display: flex;
          gap: 1rem;
        }

        .social-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffd700;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .social-icon:hover {
          background-color: #ffd700;
          color: #3e2723;
          transform: translateY(-3px);
        }

        .footer-bottom {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 1.5rem 0;
          text-align: center;
        }

        .footer-bottom p {
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .user-profile {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .footer-content {
            flex-direction: column;
            gap: 2.5rem;
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }

  renderCategoryCard(name, iconClass) {
    return html`
      <a href="#" class="category-card">
        <i class="fas ${iconClass} category-icon"></i>
        <h3 class="category-name">${name}</h3>
        <span class="explore-text"
          >Explore <i class="fas fa-arrow-right"></i
        ></span>
      </a>
    `;
  }
}

customElements.define("home-page", HomePage);
