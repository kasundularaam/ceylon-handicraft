import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class FeaturedProducts extends LitElement {
  static get properties() {
    return {
      products: { type: Array },
      loading: { type: Boolean },
      currentSlides: { type: Object },
    };
  }

  constructor() {
    super();
    this.products = [];
    this.loading = true;
    this.currentSlides = {};
    this.slideIntervals = {};
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    this.loadProducts();

    // Add intersection observer for animation
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.querySelector(".featured-products").classList.add("visible");
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clear all intervals when component is removed
    Object.values(this.slideIntervals).forEach((interval) =>
      clearInterval(interval)
    );
  }

  async loadProducts() {
    try {
      this.loading = true;
      this.products = await fetchJson("/api/landing/featured-products");

      // Initialize current slide for each product
      this.products.forEach((product) => {
        this.currentSlides[product.id] = 0;
      });

      // Setup auto-rotation for slideshows after small delay
      setTimeout(() => {
        this.setupSlideshows();
      }, 500);
    } catch (error) {
      console.error("Error loading featured products:", error);
      this.products = [];
    } finally {
      this.loading = false;
    }
  }

  setupSlideshows() {
    // Clear any existing intervals
    Object.values(this.slideIntervals).forEach((interval) =>
      clearInterval(interval)
    );

    // Setup new intervals
    this.products.forEach((product) => {
      if (product.images && product.images.length > 1) {
        this.slideIntervals[product.id] = setInterval(() => {
          this.nextSlide(product.id);
        }, 3000 + Math.random() * 2000); // Stagger intervals slightly
      }
    });
  }

  nextSlide(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (!product || !product.images || product.images.length <= 1) return;

    this.currentSlides[productId] =
      (this.currentSlides[productId] + 1) % product.images.length;
    this.updateSlideshow(productId);
  }

  prevSlide(productId, event) {
    if (event) event.stopPropagation();

    const product = this.products.find((p) => p.id === productId);
    if (!product || !product.images || product.images.length <= 1) return;

    this.currentSlides[productId] =
      (this.currentSlides[productId] - 1 + product.images.length) %
      product.images.length;
    this.updateSlideshow(productId);

    // Reset the interval to prevent immediate rotation after manual navigation
    clearInterval(this.slideIntervals[productId]);
    this.slideIntervals[productId] = setInterval(() => {
      this.nextSlide(productId);
    }, 3000 + Math.random() * 2000);
  }

  goToSlide(productId, index, event) {
    if (event) event.stopPropagation();

    this.currentSlides[productId] = index;
    this.updateSlideshow(productId);

    // Reset the interval
    clearInterval(this.slideIntervals[productId]);
    this.slideIntervals[productId] = setInterval(() => {
      this.nextSlide(productId);
    }, 3000 + Math.random() * 2000);
  }

  updateSlideshow(productId) {
    const slideTrack = this.querySelector(
      `.slideshow-track[data-product-id="${productId}"]`
    );
    const indicators = this.querySelectorAll(
      `.slideshow-indicator[data-product-id="${productId}"]`
    );

    if (slideTrack) {
      const currentSlide = this.currentSlides[productId];
      slideTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

      indicators.forEach((indicator, index) => {
        if (index === currentSlide) {
          indicator.classList.add("active");
        } else {
          indicator.classList.remove("active");
        }
      });
    }
  }

  pauseSlideshow(productId) {
    if (this.slideIntervals[productId]) {
      clearInterval(this.slideIntervals[productId]);
    }
  }

  resumeSlideshow(productId) {
    if (this.slideIntervals[productId]) {
      clearInterval(this.slideIntervals[productId]);
      this.slideIntervals[productId] = setInterval(() => {
        this.nextSlide(productId);
      }, 3000 + Math.random() * 2000);
    }
  }

  render() {
    return html`
      <section class="section featured-products">
        <div class="container">
          <h2 class="section-title">
            Featured <span class="accent-text">Crafts</span>
          </h2>

          ${this.loading
            ? html`
                <div class="loading-container">
                  <div class="loading-spinner"></div>
                  <p>Discovering artisan treasures...</p>
                </div>
              `
            : html`
                <div class="products-grid">
                  ${this.products.length > 0
                    ? this.products.map(
                        (product, index) => html`
                          <div
                            class="product-card"
                            style="animation-delay: ${index * 0.1}s"
                          >
                            <div class="product-image">
                              <!-- Slideshow Container -->
                              <div
                                class="slideshow-container"
                                @mouseenter=${() =>
                                  this.pauseSlideshow(product.id)}
                                @mouseleave=${() =>
                                  this.resumeSlideshow(product.id)}
                              >
                                <div
                                  class="slideshow-track"
                                  data-product-id="${product.id}"
                                >
                                  ${product.images.map(
                                    (image) => html`
                                      <div class="slideshow-slide">
                                        <img
                                          src="${image}"
                                          alt="${product.title}"
                                        />
                                      </div>
                                    `
                                  )}
                                </div>

                                <!-- Slideshow Navigation Arrows -->
                                ${product.images.length > 1
                                  ? html`
                                      <button
                                        class="slideshow-arrow prev"
                                        @click=${(e) =>
                                          this.prevSlide(product.id, e)}
                                      >
                                        <i class="fas fa-chevron-left"></i>
                                      </button>
                                      <button
                                        class="slideshow-arrow next"
                                        @click=${(e) =>
                                          this.nextSlide(product.id, e)}
                                      >
                                        <i class="fas fa-chevron-right"></i>
                                      </button>
                                    `
                                  : ""}

                                <!-- Slideshow Indicators -->
                                ${product.images.length > 1
                                  ? html`
                                      <div class="slideshow-indicators">
                                        ${product.images.map(
                                          (_, i) => html`
                                            <button
                                              class="slideshow-indicator ${i ===
                                              0
                                                ? "active"
                                                : ""}"
                                              data-product-id="${product.id}"
                                              @click=${(e) =>
                                                this.goToSlide(
                                                  product.id,
                                                  i,
                                                  e
                                                )}
                                            ></button>
                                          `
                                        )}
                                      </div>
                                    `
                                  : ""}
                              </div>

                              <!-- Product Actions Overlay -->
                              <div class="product-actions">
                                <a
                                  href="/product/${product.id}"
                                  class="view-product"
                                >
                                  <span>View Details</span>
                                </a>
                                <button class="add-to-cart">
                                  <i class="fas fa-shopping-cart"></i>
                                  <span>Add to Cart</span>
                                </button>
                              </div>
                            </div>
                            <div class="product-info">
                              <div class="product-header">
                                <h3 class="product-title">${product.title}</h3>
                                <span class="product-price"
                                  >$${product.price.toFixed(2)}</span
                                >
                              </div>
                              <div class="product-footer">
                                <div class="product-rating">
                                  <i class="fas fa-star"></i>
                                  <i class="fas fa-star"></i>
                                  <i class="fas fa-star"></i>
                                  <i class="fas fa-star"></i>
                                  <i class="fas fa-star-half-alt"></i>
                                  <span class="rating-count">(24)</span>
                                </div>
                                <span class="product-type">
                                  ${product.type === "Sale"
                                    ? html`<span class="sale-badge">Sale</span>`
                                    : html`<span class="auction-badge"
                                        >Auction</span
                                      >`}
                                </span>
                              </div>
                            </div>
                          </div>
                        `
                      )
                    : html`
                        <div class="no-products">
                          <i class="fas fa-exclamation-circle"></i>
                          <p>No featured products available at the moment.</p>
                        </div>
                      `}
                </div>

                <div class="view-all-container">
                  <a href="/shop" class="view-all-btn">
                    <span>Explore All Crafts</span>
                    <i class="fas fa-arrow-right"></i>
                  </a>
                </div>
              `}
        </div>
      </section>

      <style>
        .featured-products {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
          padding: 5rem 0;
        }

        .featured-products.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 0;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 215, 0, 0.3);
          border-radius: 50%;
          border-top-color: var(--accent-yellow);
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .product-card {
          background-color: var(--secondary-brown);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          animation: fadeIn 0.5s ease forwards;
          opacity: 0;
          position: relative;
        }

        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .product-image {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        /* Slideshow Styles */
        .slideshow-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .slideshow-track {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 0.5s ease-in-out;
        }

        .slideshow-slide {
          flex: 0 0 100%;
          height: 100%;
        }

        .slideshow-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .product-card:hover .slideshow-slide img {
          transform: scale(1.05);
        }

        .slideshow-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.3s ease, background-color 0.3s ease;
        }

        .slideshow-container:hover .slideshow-arrow {
          opacity: 1;
        }

        .slideshow-arrow.prev {
          left: 10px;
        }

        .slideshow-arrow.next {
          right: 10px;
        }

        .slideshow-arrow:hover {
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown);
        }

        .slideshow-indicators {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }

        .slideshow-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }

        .slideshow-indicator.active {
          background-color: var(--accent-yellow);
          transform: scale(1.2);
        }

        /* Product Actions Overlay */
        .product-actions {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: linear-gradient(
            to top,
            rgba(62, 39, 35, 0.9),
            transparent
          );
          transform: translateY(100%);
          transition: transform 0.4s ease;
        }

        .product-card:hover .product-actions {
          transform: translateY(0);
        }

        .view-product,
        .add-to-cart {
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          border: none;
          border-radius: 8px;
        }

        .view-product {
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown);
          text-decoration: none;
        }

        .add-to-cart {
          background-color: rgba(255, 255, 255, 0.2);
          color: var(--text-white);
          backdrop-filter: blur(10px);
        }

        .view-product:hover {
          background-color: #e6c200;
          transform: translateY(-2px);
        }

        .add-to-cart:hover {
          background-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .product-info {
          padding: 1.5rem;
        }

        .product-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .product-title {
          font-size: 1.1rem;
          margin: 0;
          flex: 1;
          color: var(--text-white);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-price {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--accent-yellow);
          margin-left: 0.5rem;
          white-space: nowrap;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          color: var(--accent-yellow);
          font-size: 0.85rem;
        }

        .rating-count {
          color: var(--subtle-grey);
          margin-left: 0.3rem;
        }

        .product-type {
          font-size: 0.85rem;
        }

        .sale-badge,
        .auction-badge {
          padding: 0.35rem 0.75rem;
          border-radius: 50px;
          font-weight: 500;
          font-size: 0.8rem;
        }

        .sale-badge {
          background-color: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
        }

        .auction-badge {
          background-color: rgba(255, 215, 0, 0.2);
          color: var(--accent-yellow);
        }

        .no-products {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          background-color: rgba(93, 64, 55, 0.5);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
        }

        .no-products i {
          font-size: 3rem;
          color: var(--accent-yellow);
          margin-bottom: 1rem;
        }

        .view-all-container {
          display: flex;
          justify-content: center;
          margin-top: 3rem;
        }

        .view-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background-color: transparent;
          color: var(--accent-yellow);
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border: 2px solid var(--accent-yellow);
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }

        .view-all-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 100%;
          background-color: var(--accent-yellow);
          z-index: -1;
          transition: width 0.3s ease;
        }

        .view-all-btn:hover {
          color: var(--primary-dark-brown);
        }

        .view-all-btn:hover::before {
          width: 100%;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .products-grid {
            grid-template-columns: 1fr;
          }

          .slideshow-arrow {
            opacity: 1;
            width: 36px;
            height: 36px;
          }
        }
      </style>
    `;
  }
}

customElements.define("featured-products", FeaturedProducts);
