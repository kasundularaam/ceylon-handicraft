import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class RelatedProducts extends LitElement {
  static get properties() {
    return {
      products: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    // Get product ID from URL
    const urlParts = window.location.pathname.split("/");
    this.productId = urlParts[urlParts.length - 1];

    this.products = [];
    this.loading = true;
    this.error = null;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    await this.fetchRelatedProducts();
  }

  async fetchRelatedProducts() {
    try {
      // Fetch related products - new simplified API endpoint
      const relatedProducts = await fetchJson(
        `/api/product-details/related/${this.productId}`
      );
      console.log("Related products:", relatedProducts);

      // Fetch first image for each product
      const productsWithImages = await Promise.all(
        relatedProducts.map(async (product) => {
          try {
            const imagesResponse = await fetchJson(
              `/api/product-details/${product.id}/images`
            );
            return {
              ...product,
              image:
                imagesResponse.images && imagesResponse.images.length > 0
                  ? imagesResponse.images[0]
                  : "/static/images/placeholder-product.jpg",
            };
          } catch (error) {
            console.error(
              `Error fetching images for product ${product.id}:`,
              error
            );
            return {
              ...product,
              image: "/static/images/placeholder-product.jpg",
            };
          }
        })
      );

      this.products = productsWithImages;
      this.loading = false;
    } catch (error) {
      console.error("Error fetching related products:", error);
      this.error = error.message;
      this.loading = false;
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  render() {
    if (this.loading) {
      return html`
        <div class="related-loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading related products...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="related-error">
          <p>Error loading related products. Please try again later.</p>
        </div>
      `;
    }

    if (this.products.length === 0) {
      return html`
        <div class="related-empty">
          <p>No related products found.</p>
        </div>
      `;
    }

    return html`
      <div class="related-grid">
        ${this.products.map(
          (product) => html`
            <div class="product-card">
              <a href="/products/${product.id}" class="product-link">
                <div class="product-image">
                  <img src="${product.image}" alt="${product.title}" />
                </div>

                <div class="product-info">
                  <h3 class="product-title">${product.title}</h3>
                  <p class="product-price">
                    ${this.formatPrice(product.base_price)}
                  </p>
                  <p class="product-category">${product.category_title}</p>
                </div>
              </a>
            </div>
          `
        )}
      </div>

      <style>
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.5rem;
          margin: 1rem 0;
        }

        .product-card {
          background-color: #5d4037;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-5px);
        }

        .product-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .product-image {
          height: 180px;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.05);
        }

        .product-info {
          padding: 1rem;
        }

        .product-title {
          color: #ffffff;
          font-size: 1rem;
          margin: 0 0 0.5rem 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-price {
          color: #ffd700;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }

        .product-category {
          color: #e0e0e0;
          font-size: 0.8rem;
          margin: 0;
          opacity: 0.8;
        }

        .related-loading,
        .related-error,
        .related-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: #e0e0e0;
          text-align: center;
        }

        .related-loading i {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #ffd700;
        }

        @media (max-width: 768px) {
          .related-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }

          .product-image {
            height: 140px;
          }
        }
      </style>
    `;
  }
}

customElements.define("related-products", RelatedProducts);
