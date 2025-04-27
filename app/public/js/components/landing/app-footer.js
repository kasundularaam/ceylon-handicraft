import { LitElement, html } from "https://esm.run/lit";

class AppFooter extends LitElement {
  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    // Add intersection observer for animation
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.querySelector(".app-footer").classList.add("visible");
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(this);

    // Smooth scroll to top
    const scrollTopBtn = this.querySelector(".scroll-top");
    scrollTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  render() {
    return html`
      <footer class="app-footer">
        <div class="footer-top">
          <div class="container">
            <div class="footer-grid">
              <div class="footer-brand">
                <div class="footer-logo">
                  <img
                    src="/static/images/logo.png"
                    alt="Ceylon Handicrafts Logo"
                  />
                </div>
                <p class="footer-description">
                  Ceylon Handicrafts connects skilled Sri Lankan artisans with
                  global consumers, preserving cultural traditions through
                  authentic handcrafted products.
                </p>
                <div class="social-links">
                  <a href="#" class="social-link"
                    ><i class="fab fa-facebook-f"></i
                  ></a>
                  <a href="#" class="social-link"
                    ><i class="fab fa-instagram"></i
                  ></a>
                  <a href="#" class="social-link"
                    ><i class="fab fa-twitter"></i
                  ></a>
                  <a href="#" class="social-link"
                    ><i class="fab fa-pinterest-p"></i
                  ></a>
                </div>
              </div>

              <div class="footer-links">
                <h3 class="footer-title">Quick Links</h3>
                <ul class="footer-menu">
                  <li><a href="/">Home</a></li>
                  <li><a href="/shop">Shop</a></li>
                  <li><a href="/auctions">Auctions</a></li>
                  <li><a href="/vishva">Vishva AI</a></li>
                  <li><a href="/about">About Us</a></li>
                  <li><a href="/artisans">Our Artisans</a></li>
                </ul>
              </div>

              <div class="footer-links">
                <h3 class="footer-title">Categories</h3>
                <ul class="footer-menu">
                  <li>
                    <a href="/shop/category/wood-carvings">Wood Carvings</a>
                  </li>
                  <li><a href="/shop/category/masks">Sri Lankan Masks</a></li>
                  <li>
                    <a href="/shop/category/textiles">Handwoven & Batik</a>
                  </li>
                  <li><a href="/shop/category/metal">Brass & Metal Art</a></li>
                  <li>
                    <a href="/shop/category/pottery">Pottery & Ceramics</a>
                  </li>
                  <li><a href="/shop/category/all">View All Categories</a></li>
                </ul>
              </div>

              <div class="footer-contact">
                <h3 class="footer-title">Contact Us</h3>
                <ul class="contact-info">
                  <li>
                    <i class="fas fa-map-marker-alt"></i>
                    <span>123 Handicraft Lane, Colombo, Sri Lanka</span>
                  </li>
                  <li>
                    <i class="fas fa-envelope"></i>
                    <span>info@ceylonhandicrafts.com</span>
                  </li>
                  <li>
                    <i class="fas fa-phone"></i>
                    <span>+94 11 234 5678</span>
                  </li>
                </ul>
                <div class="newsletter">
                  <h4 class="newsletter-title">Subscribe to Newsletter</h4>
                  <form class="newsletter-form">
                    <input
                      type="email"
                      placeholder="Your email address"
                      required
                    />
                    <button type="submit">
                      <i class="fas fa-paper-plane"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="container">
            <div class="footer-bottom-content">
              <p class="copyright">
                &copy; ${new Date().getFullYear()} Ceylon Handicrafts. All
                rights reserved.
              </p>
              <div class="footer-bottom-links">
                <a href="/terms">Terms & Conditions</a>
                <a href="/privacy">Privacy Policy</a>
                <a href="/shipping">Shipping Policy</a>
              </div>
            </div>
          </div>
        </div>

        <button class="scroll-top">
          <i class="fas fa-chevron-up"></i>
        </button>
      </footer>

      <style>
        .app-footer {
          background-color: var(--primary-dark-brown);
          color: var(--text-white);
          position: relative;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .app-footer.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .footer-top {
          padding: 5rem 0 3rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 3rem;
        }

        .footer-brand {
          grid-column: span 1;
        }

        .footer-logo {
          margin-bottom: 1.5rem;
        }

        .footer-logo img {
          height: 60px;
        }

        .footer-description {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--subtle-grey);
          margin-bottom: 1.5rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-white);
          border-radius: 50%;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown);
          transform: translateY(-3px);
        }

        .footer-title {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
          position: relative;
          padding-bottom: 0.5rem;
        }

        .footer-title::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 40px;
          height: 2px;
          background-color: var(--accent-yellow);
        }

        .footer-menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-menu li {
          margin-bottom: 0.8rem;
        }

        .footer-menu a {
          color: var(--subtle-grey);
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-block;
          position: relative;
          padding-left: 15px;
        }

        .footer-menu a::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          background-color: var(--accent-yellow);
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .footer-menu a:hover {
          color: var(--accent-yellow);
          transform: translateX(3px);
        }

        .footer-menu a:hover::before {
          background-color: var(--accent-yellow);
        }

        .footer-contact {
          grid-column: span 1;
        }

        .contact-info {
          list-style: none;
          padding: 0;
          margin: 0 0 2rem;
        }

        .contact-info li {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
          color: var(--subtle-grey);
        }

        .contact-info i {
          color: var(--accent-yellow);
          margin-top: 0.3rem;
        }

        .newsletter-title {
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .newsletter-form {
          display: flex;
          height: 45px;
        }

        .newsletter-form input {
          flex: 1;
          height: 100%;
          padding: 0 15px;
          border: none;
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-white);
          border-radius: 4px 0 0 4px;
        }

        .newsletter-form input::placeholder {
          color: var(--subtle-grey);
        }

        .newsletter-form button {
          width: 45px;
          height: 100%;
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown);
          border: none;
          border-radius: 0 4px 4px 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .newsletter-form button:hover {
          background-color: #e6c200;
        }

        .footer-bottom {
          padding: 1.5rem 0;
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .copyright {
          color: var(--subtle-grey);
          font-size: 0.9rem;
        }

        .footer-bottom-links {
          display: flex;
          gap: 1.5rem;
        }

        .footer-bottom-links a {
          color: var(--subtle-grey);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .footer-bottom-links a:hover {
          color: var(--accent-yellow);
        }

        .scroll-top {
          position: absolute;
          right: 30px;
          bottom: 30px;
          width: 40px;
          height: 40px;
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown);
          border: none;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }

        .scroll-top:hover {
          background-color: #e6c200;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        /* Responsive adjustments */
        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer-brand,
          .footer-contact {
            grid-column: span 2;
            text-align: center;
          }

          .footer-title::after {
            left: 50%;
            transform: translateX(-50%);
          }

          .social-links {
            justify-content: center;
          }

          .contact-info li {
            justify-content: center;
          }

          .footer-menu a {
            padding-left: 0;
          }

          .footer-menu a::before {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-brand,
          .footer-links,
          .footer-contact {
            grid-column: span 1;
            text-align: center;
          }

          .footer-bottom-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .footer-bottom-links {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("app-footer", AppFooter);
