import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class ProductImages extends LitElement {
  static get properties() {
    return {
      productId: { type: String },
      images: { type: Array },
      currentImage: { type: Number },
      loading: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.productId = null;
    this.images = [];
    this.currentImage = 0;
    this.loading = true;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.productId) {
      this.fetchProductImages();
    }
  }

  updated(changedProperties) {
    if (changedProperties.has("productId") && this.productId) {
      this.fetchProductImages();
    }

    if (changedProperties.has("images") && this.images.length > 0) {
      this.currentImage = 0;
    }
  }

  async fetchProductImages() {
    this.loading = true;

    try {
      const response = await fetchJson(
        `/api/product-details/${this.productId}/images`
      );
      this.images = response.images || [];
    } catch (err) {
      console.error("Error fetching product images:", err);
      this.images = [];
    } finally {
      this.loading = false;
    }
  }

  selectImage(index) {
    this.currentImage = index;
  }

  nextImage() {
    if (this.images.length === 0) return;
    this.currentImage = (this.currentImage + 1) % this.images.length;
  }

  prevImage() {
    if (this.images.length === 0) return;
    this.currentImage =
      (this.currentImage - 1 + this.images.length) % this.images.length;
  }

  render() {
    if (this.loading) {
      return html`
        <div class="product-images loading">
          <div class="main-image-container">
            <div class="loading-indicator">
              <i class="fas fa-spinner fa-pulse"></i>
              <p>Loading images...</p>
            </div>
          </div>
        </div>
      `;
    }

    if (!this.images || this.images.length === 0) {
      return html`
        <div class="product-images empty">
          <div class="main-image-container">
            <div class="no-image">
              <i class="fas fa-image"></i>
              <p>No product images available</p>
            </div>
          </div>
        </div>
      `;
    }

    const mainImage = this.images[this.currentImage];

    return html`
      <div class="product-images">
        <div class="main-image-container">
          <button
            class="nav-button prev"
            @click=${this.prevImage}
            ?disabled=${this.images.length <= 1}
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <img class="main-image" src="${mainImage}" alt="Product image" />

          <button
            class="nav-button next"
            @click=${this.nextImage}
            ?disabled=${this.images.length <= 1}
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        ${this.images.length > 1
          ? html`
              <div class="thumbnail-container">
                ${this.images.map(
                  (image, index) => html`
                    <div
                      class="thumbnail ${index === this.currentImage
                        ? "active"
                        : ""}"
                      @click=${() => this.selectImage(index)}
                    >
                      <img src="${image}" alt="Thumbnail image" />
                    </div>
                  `
                )}
              </div>
            `
          : ""}
      </div>

      <style>
        .product-images {
          margin-bottom: 1.5rem;
        }

        .main-image-container {
          position: relative;
          background-color: #5d4037;
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 4/3;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .main-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(62, 39, 35, 0.7);
          color: #ffffff;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          transition: background-color 0.3s;
        }

        .nav-button:hover {
          background-color: rgba(62, 39, 35, 0.9);
        }

        .nav-button:disabled {
          display: none;
        }

        .nav-button.prev {
          left: 10px;
        }

        .nav-button.next {
          right: 10px;
        }

        .thumbnail-container {
          display: flex;
          margin-top: 0.75rem;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .thumbnail {
          width: 70px;
          height: 70px;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          background-color: #5d4037;
        }

        .thumbnail.active {
          border-color: #ffd700;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image,
        .loading-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #e0e0e0;
          text-align: center;
          padding: 2rem;
        }

        .no-image i,
        .loading-indicator i {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
      </style>
    `;
  }
}

customElements.define("product-images", ProductImages);
