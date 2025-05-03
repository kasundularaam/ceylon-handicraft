// app/public/js/components/landing/site-footer.js
import { LitElement, html } from "https://esm.run/lit";

class SiteFooter extends LitElement {
  static get properties() {
    return {
      currentYear: { type: Number },
    };
  }

  constructor() {
    super();
    this.currentYear = new Date().getFullYear();
  }

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <footer class="site-footer">
        <div class="footer-content">
          <div class="footer-main">
            <div class="footer-brand">
              <img
                src="/static/images/logo.png"
                alt="Ceylon Handicrafts"
                class="footer-logo"
              />
              <p class="footer-tagline">
                Connecting artisans with the world, preserving Sri Lankan
                heritage through authentic craftsmanship.
              </p>
              <div class="social-links">
                <a href="#" class="social-link"
                  ><i class="fab fa-facebook-f"></i
                ></a>
                <a href="#" class="social-link"
                  ><i class="fab fa-instagram"></i
                ></a>
                <a href="#" class="social-link"
                  ><i class="fab fa-pinterest-p"></i
                ></a>
                <a href="#" class="social-link"
                  ><i class="fab fa-twitter"></i
                ></a>
              </div>
            </div>

            <div class="footer-links">
              <div class="footer-links-column">
                <h3 class="footer-heading">Shop</h3>
                <div class="footer-divider"></div>
                <ul class="footer-nav">
                  <li><a href="/sale">All Products</a></li>
                  <li><a href="/auction">Auctions</a></li>
                  <li><a href="/categories">Categories</a></li>
                  <li><a href="/artisans">Artisans</a></li>
                </ul>
              </div>

              <div class="footer-links-column">
                <h3 class="footer-heading">About</h3>
                <div class="footer-divider"></div>
                <ul class="footer-nav">
                  <li><a href="/about">Our Story</a></li>
                  <li><a href="/vishva">Meet Vishva</a></li>
                  <li><a href="/blog">Blog</a></li>
                  <li><a href="/impact">Social Impact</a></li>
                </ul>
              </div>

              <div class="footer-links-column">
                <h3 class="footer-heading">Help</h3>
                <div class="footer-divider"></div>
                <ul class="footer-nav">
                  <li><a href="/shipping">Shipping</a></li>
                  <li><a href="/returns">Returns</a></li>
                  <li><a href="/faq">FAQs</a></li>
                  <li><a href="/contact">Contact Us</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div class="newsletter-section">
            <h3 class="newsletter-heading">Join Our Newsletter</h3>
            <p class="newsletter-text">
              Get updates on new arrivals, exclusive auctions, and artisan
              stories.
            </p>
            <form class="newsletter-form">
              <input
                type="email"
                placeholder="Your email address"
                class="newsletter-input"
              />
              <button type="submit" class="newsletter-button">Subscribe</button>
            </form>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <p class="copyright">
              © ${this.currentYear} Ceylon Handicrafts. All rights reserved.
            </p>
            <div class="footer-bottom-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/accessibility">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>

      <style>
        .site-footer {
          background-color: #2c1a17;
          color: #e0e0e0;
          border-top: 1px solid #5d4037;
          margin-top: 5rem;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
        }

        .footer-main {
          display: flex;
          flex-wrap: wrap;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-brand {
          flex: 1 1 300px;
          margin-right: 2rem;
        }

        .footer-logo {
          width: 180px;
          margin-bottom: 1rem;
        }

        .footer-tagline {
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #3e2723;
          color: #ffd700;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .social-link:hover {
          background-color: #ffd700;
          color: #3e2723;
          transform: translateY(-3px);
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
        }

        .footer-links {
          flex: 2 1 600px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-around;
          gap: 2rem;
        }

        .footer-links-column {
          flex: 1 1 160px;
        }

        .footer-heading {
          font-size: 1.1rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }

        .footer-divider {
          width: 30px;
          height: 2px;
          background-color: #ffd700;
          margin-bottom: 1rem;
          border-radius: 1px;
        }

        .footer-nav {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-nav li {
          margin-bottom: 0.7rem;
        }

        .footer-nav a {
          color: #e0e0e0;
          text-decoration: none;
          transition: color 0.2s ease, transform 0.2s ease;
          display: inline-block;
        }

        .footer-nav a:hover {
          color: #ffd700;
          transform: translateX(3px);
        }

        .newsletter-section {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 2rem;
          text-align: center;
        }

        .newsletter-heading {
          font-size: 1.2rem;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }

        .newsletter-text {
          max-width: 500px;
          margin: 0 auto 1.5rem;
          font-size: 0.95rem;
        }

        .newsletter-form {
          display: flex;
          max-width: 500px;
          margin: 0 auto;
        }

        .newsletter-input {
          flex: 1;
          padding: 0.8rem 1rem;
          border-radius: 4px 0 0 4px;
          border: none;
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-family: inherit;
        }

        .newsletter-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .newsletter-input:focus {
          outline: none;
          background-color: rgba(255, 255, 255, 0.15);
        }

        .newsletter-button {
          padding: 0 1.5rem;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          border-radius: 0 4px 4px 0;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .newsletter-button:hover {
          background-color: #ffea80;
        }

        .footer-bottom {
          background-color: #241310;
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footer-bottom-content {
          max-width: a1200px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .copyright {
          font-size: 0.9rem;
          margin: 0;
        }

        .footer-bottom-links {
          display: flex;
          gap: 1.5rem;
        }

        .footer-bottom-links a {
          color: #e0e0e0;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .footer-bottom-links a:hover {
          color: #ffd700;
        }

        @media (max-width: 768px) {
          .footer-main {
            flex-direction: column;
            gap: 2rem;
          }

          .footer-brand {
            margin-right: 0;
            text-align: center;
          }

          .social-links {
            justify-content: center;
          }

          .footer-links {
            gap: 3rem;
          }

          .footer-links-column {
            text-align: center;
          }

          .footer-divider {
            margin: 0 auto 1rem;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .newsletter-input {
            border-radius: 4px;
            margin-bottom: 0.5rem;
          }

          .newsletter-button {
            border-radius: 4px;
            padding: 0.8rem;
          }

          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
          }

          .footer-bottom-links {
            justify-content: center;
          }
        }
      </style>
    `;
  }
}

customElements.define("site-footer", SiteFooter);
