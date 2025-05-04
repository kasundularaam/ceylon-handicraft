import { LitElement, html } from "https://esm.run/lit";

class ProductGallery extends LitElement {
  static get properties() {
    return {
      images: { type: Array },
      activeIndex: { type: Number, attribute: "active-index" },
    };
  }

  constructor() {
    super();
    this.images = [];
    this.activeIndex = 0;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  selectImage(index) {
    this.activeIndex = index;

    // Dispatch event for parent component
    this.dispatchEvent(
      new CustomEvent("image-select", {
        detail: { index },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this.images || this.images.length === 0) {
      return html`
        <div class="product-gallery-empty">
          <img
            src="/static/images/placeholder-product.jpg"
            alt="Product image not available"
          />
        </div>
      `;
    }

    return html`
      <div class="product-gallery-container">
        <div class="product-gallery-main">
          <img
            src="${this.images[this.activeIndex]}"
            alt="Product image ${this.activeIndex + 1}"
            class="main-image"
          />
        </div>

        ${this.images.length > 1
          ? html`
              <div class="product-gallery-thumbnails">
                ${this.images.map(
                  (image, index) => html`
                    <div
                      class="thumbnail ${index === this.activeIndex
                        ? "active"
                        : ""}"
                      @click=${() => this.selectImage(index)}
                    >
                      <img
                        src="${image}"
                        alt="Product thumbnail ${index + 1}"
                      />
                    </div>
                  `
                )}
              </div>
            `
          : ""}
      </div>

      <style>
        .product-gallery-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .product-gallery-main {
          background-color: #5d4037;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        .main-image {
          width: 100%;
          height: auto;
          object-fit: contain;
          max-height: 400px;
        }

        .product-gallery-thumbnails {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .thumbnail {
          width: 80px;
          height: 80px;
          border: 2px solid #5d4037;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .thumbnail.active {
          border-color: #ffd700;
        }

        .thumbnail:hover {
          border-color: #ffd700;
          opacity: 0.9;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-gallery-empty {
          background-color: #5d4037;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        .product-gallery-empty img {
          width: 100%;
          height: auto;
          opacity: 0.7;
        }
      </style>
    `;
  }
}

customElements.define("product-gallery", ProductGallery);
