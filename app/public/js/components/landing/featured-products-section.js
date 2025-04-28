import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class FeaturedProductsSection extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      type: { type: String }, // 'sale' or 'auction'
      products: { type: Array },
      loading: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.title = "Featured Products";
    this.type = "sale";
    this.products = [];
    this.loading = true;
    this.slideIntervals = new Map(); // Store interval IDs for each product
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchProducts();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clear all slide intervals when component is removed
    this.slideIntervals.forEach((intervalId) => clearInterval(intervalId));
    this.slideIntervals.clear();
  }

  async fetchProducts() {
    try {
      const endpoint =
        this.type === "auction"
          ? "/api/landing/featured/auction"
          : "/api/landing/featured/sale";

      const products = await fetchJson(endpoint);

      // Fetch image paths for each product
      for (let i = 0; i < products.length; i++) {
        try {
          const imageData = await fetchJson(
            `/api/landing/product/${products[i].id}/images`
          );
          products[i].image_paths = imageData.images;
          products[i].currentImageIndex = 0; // Initialize current image index
        } catch (error) {
          console.error(
            `Error fetching images for product ${products[i].id}:`,
            error
          );
          products[i].image_paths = [];
        }
      }

      this.products = products;
      this.loading = false;

      // Setup slideshows after rendering
      this.updateComplete.then(() => this.setupSlideshows());
    } catch (error) {
      console.error(`Error fetching ${this.type} products:`, error);
      this.products = [];
      this.loading = false;
    }
  }

  setupSlideshows() {
    // Clear any existing intervals
    this.slideIntervals.forEach((intervalId) => clearInterval(intervalId));
    this.slideIntervals.clear();

    // Setup new intervals for each product
    this.products.forEach((product, productIndex) => {
      if (product.image_paths && product.image_paths.length > 1) {
        const intervalId = setInterval(() => {
          // Update current image index
          product.currentImageIndex =
            (product.currentImageIndex + 1) % product.image_paths.length;

          // Update the DOM
          const slides = this.querySelectorAll(
            `.product-${productIndex} .product-image-slide`
          );
          const indicators = this.querySelectorAll(
            `.product-${productIndex} .slideshow-indicator`
          );

          slides.forEach((slide, index) => {
            if (index === product.currentImageIndex) {
              slide.classList.add("slide-active");
            } else {
              slide.classList.remove("slide-active");
            }
          });

          indicators.forEach((indicator, index) => {
            if (index === product.currentImageIndex) {
              indicator.classList.add("active");
            } else {
              indicator.classList.remove("active");
            }
          });
        }, 3000); // Change slide every 3 seconds

        this.slideIntervals.set(product.id, intervalId);
      }
    });
  }

  handleIndicatorClick(product, productIndex, imageIndex) {
    // Update current image index
    product.currentImageIndex = imageIndex;

    // Update the DOM
    const slides = this.querySelectorAll(
      `.product-${productIndex} .product-image-slide`
    );
    const indicators = this.querySelectorAll(
      `.product-${productIndex} .slideshow-indicator`
    );

    slides.forEach((slide, idx) => {
      if (idx === imageIndex) {
        slide.classList.add("slide-active");
      } else {
        slide.classList.remove("slide-active");
      }
    });

    indicators.forEach((indicator, idx) => {
      if (idx === imageIndex) {
        indicator.classList.add("active");
      } else {
        indicator.classList.remove("active");
      }
    });

    // Reset the interval to prevent immediate change after manual click
    if (this.slideIntervals.has(product.id)) {
      clearInterval(this.slideIntervals.get(product.id));
      const intervalId = setInterval(() => {
        product.currentImageIndex =
          (product.currentImageIndex + 1) % product.image_paths.length;

        // Update the DOM
        const slides = this.querySelectorAll(
          `.product-${productIndex} .product-image-slide`
        );
        const indicators = this.querySelectorAll(
          `.product-${productIndex} .slideshow-indicator`
        );

        slides.forEach((slide, idx) => {
          if (idx === product.currentImageIndex) {
            slide.classList.add("slide-active");
          } else {
            slide.classList.remove("slide-active");
          }
        });

        indicators.forEach((indicator, idx) => {
          if (idx === product.currentImageIndex) {
            indicator.classList.add("active");
          } else {
            indicator.classList.remove("active");
          }
        });
      }, 3000);

      this.slideIntervals.set(product.id, intervalId);
    }
  }

  renderLoading() {
    return html`
      <div class="loading-container">
        <div class="loader"></div>
        <p>Loading featured products...</p>
      </div>
    `;
  }

  renderProductCard(product, productIndex) {
    const isAuction = this.type === "auction";

    // Background style with first image and overlay
    const firstImageUrl =
      product.image_paths && product.image_paths.length > 0
        ? product.image_paths[0]
        : "";

    // Use a gradient background if no image is available
    const backgroundStyle = firstImageUrl
      ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url(${firstImageUrl})`
      : `linear-gradient(to bottom right, #5D4037, #3E2723)`;

    const handleCardClick = () => {
      const route = isAuction
        ? `/auction/${product.id}`
        : `/sale/${product.id}`;
      window.location.href = route;
    };

    return html`
      <div
        class="product-card product-${productIndex}"
        @click=${handleCardClick}
      >
        <div
          class="product-background"
          style="background-image: ${backgroundStyle}; backdrop-filter: blur(8px);"
        ></div>

        <div class="product-type-indicator ${isAuction ? "auction" : "sale"}">
          ${isAuction ? "Auction" : "Sale"}
        </div>

        <div class="product-content">
          <!-- Product Images -->
          <div class="product-images-slideshow">
            ${product.image_paths && product.image_paths.length > 0
              ? product.image_paths.map(
                  (path, index) => html`
                    <div
                      class="product-image-slide ${index ===
                      (product.currentImageIndex || 0)
                        ? "slide-active"
                        : ""}"
                      style="background-image: url(${path})"
                    ></div>
                  `
                )
              : html`<div class="no-image">
                  <i class="fa fa-image"></i>
                  <p>Product Image</p>
                </div>`}

            <div class="slideshow-indicators">
              ${product.image_paths &&
              product.image_paths.map(
                (_, index) => html`
                  <span
                    class="slideshow-indicator ${index ===
                    (product.currentImageIndex || 0)
                      ? "active"
                      : ""}"
                    @click=${(e) => {
                      e.stopPropagation();
                      this.handleIndicatorClick(product, productIndex, index);
                    }}
                  >
                  </span>
                `
              )}
            </div>
          </div>

          <!-- Product Details -->
          <h3 class="product-title">${product.title}</h3>

          <div class="product-meta">
            <div class="category">
              <i class="${product.category?.icon || "fa fa-tag"}"></i>
              <span>${product.category?.title || "Uncategorized"}</span>
            </div>
          </div>

          <!-- Price Content -->
          ${isAuction
            ? html`
                <div class="price-content">
                  <div class="current-bid">
                    <div class="bid-label">
                      <i class="fas fa-gavel"></i>
                      Current Bid:
                    </div>
                    <div class="bid-value">
                      $${(product.current_bid || product.base_price).toFixed(2)}
                    </div>
                  </div>
                  <div class="base-price">
                    Starting at: $${product.base_price.toFixed(2)}
                  </div>
                </div>
              `
            : html`
                <div class="price-content">
                  <div class="price">
                    <span class="price-label">Price:</span>
                    <span class="price-value"
                      >$${product.base_price.toFixed(2)}</span
                    >
                  </div>
                </div>
              `}
        </div>
      </div>
    `;
  }

  renderProducts() {
    if (this.products.length === 0) {
      return html`
        <div class="no-products">
          <p>No ${this.type} products available at the moment.</p>
        </div>
      `;
    }

    return html`
      <div class="products-grid">
        ${this.products.map((product, index) =>
          this.renderProductCard(product, index)
        )}
      </div>
    `;
  }

  render() {
    return html`
      <section class="featured-products-section ${this.type}-products">
        <div class="section-header">
          <h2 class="section-title">${this.title}</h2>
          <a href="/${this.type}" class="view-all-link">
            View All
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>

        ${this.loading ? this.renderLoading() : this.renderProducts()}
      </section>

      <style>
        .featured-products-section {
          padding: 40px 20px;
          margin-bottom: 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .section-title {
          color: #ffffff;
          font-size: 1.8rem;
          margin: 0;
          position: relative;
          padding-left: 15px;
        }

        .section-title:before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 5px;
          background-color: #ffd700;
          border-radius: 2px;
        }

        .view-all-link {
          color: #ffd700;
          text-decoration: none;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .view-all-link:hover {
          opacity: 0.8;
          transform: translateX(5px);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 25px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
          color: #e0e0e0;
        }

        .loader {
          border: 4px solid rgba(255, 215, 0, 0.2);
          border-top: 4px solid #ffd700;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }

        .no-products {
          text-align: center;
          padding: 30px;
          color: #e0e0e0;
          border: 1px dashed #5d4037;
          border-radius: 8px;
        }

        /* Product Card Styles */
        .product-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background-color: #3e2723;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          height: 380px;
          width: 100%;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .product-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          z-index: 0;
          filter: blur(5px);
          transform: scale(1.1); /* Prevent blur from showing edges */
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .product-type-indicator {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          z-index: 2;
        }

        .product-type-indicator.sale {
          background-color: #3e2723;
          color: #ffd700;
          border: 2px solid #ffd700;
        }

        .product-type-indicator.auction {
          background-color: #ffd700;
          color: #3e2723;
          border: 2px solid #3e2723;
        }

        .product-content {
          position: relative;
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          color: #ffffff;
          z-index: 1;
          box-sizing: border-box;
        }

        .product-images-slideshow {
          position: relative;
          height: 180px;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 15px;
          background-color: rgba(0, 0, 0, 0.2);
        }

        .no-image {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #e0e0e0;
          background-color: #5d4037;
        }

        .no-image i {
          font-size: 2rem;
          margin-bottom: 10px;
          color: #ffd700;
        }

        .no-image p {
          margin: 0;
          font-size: 0.9rem;
        }

        .product-image-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transition: opacity 1s ease;
        }

        .slide-active {
          opacity: 1;
        }

        .slideshow-indicators {
          position: absolute;
          bottom: 10px;
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 8px;
          z-index: 3;
        }

        .slideshow-indicator {
          width: 8px;
          height: 8px;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .slideshow-indicator.active {
          background-color: #ffd700;
        }

        .slideshow-indicator:hover {
          background-color: rgba(255, 215, 0, 0.7);
        }

        .product-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-top: 0;
          margin-bottom: 10px;
          color: #ffffff;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          max-height: 3em;
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
          font-size: 0.9rem;
          margin-bottom: 10px;
        }

        .category {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .category i {
          color: #ffd700;
        }

        /* Sale Price Styles */
        .price-content {
          margin-top: auto;
          margin-bottom: 10px;
        }

        .price {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: rgba(255, 215, 0, 0.2);
          border: 1px solid #ffd700;
          border-radius: 8px;
          text-align: center;
        }

        .price-label {
          font-size: 0.9rem;
          color: #e0e0e0;
        }

        .price-value {
          font-size: 1.2rem;
          font-weight: 600;
          color: #ffd700;
        }

        /* Auction Price Styles */
        .current-bid {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          background-color: rgba(255, 215, 0, 0.2);
          border: 1px solid #ffd700;
          border-radius: 8px;
          text-align: center;
        }

        .bid-label {
          font-size: 0.9rem;
          color: #e0e0e0;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .bid-label i {
          color: #ffd700;
        }

        .bid-value {
          font-size: 1.4rem;
          font-weight: 700;
          color: #ffd700;
        }

        .base-price {
          font-size: 0.8rem;
          color: #e0e0e0;
          text-align: center;
          margin-top: 5px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
        }

        @media (max-width: 480px) {
          .products-grid {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      </style>
    `;
  }
}

customElements.define("featured-products-section", FeaturedProductsSection);
