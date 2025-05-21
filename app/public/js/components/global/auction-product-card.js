import { LitElement, html } from "https://esm.run/lit";

class AuctionProductCard extends LitElement {
  static get properties() {
    return {
      product: { type: Object },
      index: { type: Number },
    };
  }

  constructor() {
    super();
    this.product = {};
    this.index = 0;
    this.intervalId = null;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => this.setupSlideshow());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setupSlideshow() {
    if (!this.product.image_paths || this.product.image_paths.length <= 1)
      return;

    this.intervalId = setInterval(() => {
      // Update current image index
      this.product.currentImageIndex =
        (this.product.currentImageIndex + 1) % this.product.image_paths.length;

      // Update the DOM
      this.updateSlideshowDisplay();
    }, 3000); // Change slide every 3 seconds
  }

  updateSlideshowDisplay() {
    const slides = this.querySelectorAll(`.product-image-slide`);
    const indicators = this.querySelectorAll(`.slideshow-indicator`);

    slides.forEach((slide, index) => {
      if (index === this.product.currentImageIndex) {
        slide.classList.add("slide-active");
      } else {
        slide.classList.remove("slide-active");
      }
    });

    indicators.forEach((indicator, index) => {
      if (index === this.product.currentImageIndex) {
        indicator.classList.add("active");
      } else {
        indicator.classList.remove("active");
      }
    });
  }

  handleIndicatorClick(imageIndex, event) {
    event.stopPropagation();

    // Update current image index
    this.product.currentImageIndex = imageIndex;

    // Update the DOM
    this.updateSlideshowDisplay();

    // Reset the interval to prevent immediate change after manual click
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.product.currentImageIndex =
          (this.product.currentImageIndex + 1) %
          this.product.image_paths.length;
        this.updateSlideshowDisplay();
      }, 3000);
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(price);
  }

  handleCardClick() {
    window.location.href = `/auction/${this.product.id}`;
  }

  render() {
    // Background style with first image and overlay
    const firstImageUrl =
      this.product.image_paths && this.product.image_paths.length > 0
        ? this.product.image_paths[0]
        : "";

    // Use a gradient background if no image is available
    const backgroundStyle = firstImageUrl
      ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url(${firstImageUrl})`
      : `linear-gradient(to bottom right, #5D4037, #3E2723)`;

    return html`
      <div class="product-card auction-product" @click=${this.handleCardClick}>
        <div
          class="product-background"
          style="background-image: ${backgroundStyle}; backdrop-filter: blur(8px);"
        ></div>

        <div class="product-type-indicator auction">Auction</div>

        <div class="product-content">
          <!-- Product Images -->
          <div class="product-images-slideshow">
            ${this.product.image_paths && this.product.image_paths.length > 0
              ? this.product.image_paths.map(
                  (path, index) => html`
                    <div
                      class="product-image-slide ${index ===
                      (this.product.currentImageIndex || 0)
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
              ${this.product.image_paths &&
              this.product.image_paths.map(
                (_, index) => html`
                  <span
                    class="slideshow-indicator ${index ===
                    (this.product.currentImageIndex || 0)
                      ? "active"
                      : ""}"
                    @click=${(e) => this.handleIndicatorClick(index, e)}
                  >
                  </span>
                `
              )}
            </div>
          </div>

          <!-- Product Details -->
          <h3 class="product-title">${this.product.title}</h3>

          <div class="product-meta">
            <div class="category">
              <i class="${this.product.category?.icon || "fa fa-tag"}"></i>
              <span>${this.product.category?.title || "Uncategorized"}</span>
            </div>
          </div>

          <!-- Price Content for Auction -->
          <div class="price-content">
            <div class="current-bid">
              <div class="bid-label">
                <i class="fas fa-gavel"></i>
                Current Bid:
              </div>
              <div class="bid-value">
                ${this.formatPrice(
                  this.product.current_bid || this.product.base_price
                )}
              </div>
            </div>
            <div class="base-price">
              Starting at: ${this.formatPrice(this.product.base_price)}
            </div>
          </div>
        </div>
      </div>

      <style>
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

        /* Auction Price Styles */
        .price-content {
          margin-top: auto;
          margin-bottom: 10px;
        }

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
      </style>
    `;
  }
}

customElements.define("auction-product-card", AuctionProductCard);
