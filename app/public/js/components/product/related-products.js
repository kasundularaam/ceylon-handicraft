import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class RelatedProducts extends LitElement {
  static get properties() {
    return {
      productId: { type: String, attribute: "product-id" },
      categoryId: { type: String, attribute: "category-id" },
      products: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.productId = null;
    this.categoryId = null;
    this.products = [];
    this.loading = true;
    this.error = null;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    await this.fetchRelatedProducts();
  }

  async fetchRelatedProducts() {
    try {
      // If we have a category ID, fetch products from that category
      // Otherwise, fetch featured products
      const endpoint = this.categoryId
        ? `/api/products/category/${this.categoryId}?limit=4&exclude=${this.productId}`
        : `/api/featured/sale?limit=4`;

      const products = await fetchJson(endpoint);

      // For each product, fetch the first image
      const productsWithImages = await Promise.all(
        products.map(async (product) => {
          if (product.id === this.productId) return null;

          try {
            const imagesResponse = await fetchJson(
              `/api/product/${product.id}/images`
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

      // Filter out null values (the current product) and limit to 4 items
      this.products = productsWithImages
        .filter((product) => product !== null)
        .slice(0, 4);

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
        <div class="related-products-loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading related products...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="related-products-error">
          <p>Error loading related products: ${this.error}</p>
        </div>
      `;
    }

    if (this.products.length === 0) {
      return html`
        <div class="related-products-empty">
          <p>No related products found.</p>
        </div>
      `;
    }

    return html`
      <div class="related-products-container">
        ${this.products.map(
          (product) => html`
            <div class="related-product-card">
              <a href="/products/${product.id}" class="product-link">
                <div class="product-image-container">
                  <img
                    src="${product.image}"
                    alt="${product.title}"
                    class="product-image"
                  />
                </div>

                <div class="product-details">
                  <h3 class="product-title">${product.title}</h3>
                  <p class="product-price">
                    ${this.formatPrice(product.base_price)}
                  </p>
                </div>
              </a>
            </div>
          `
        )}
      </div>

      <style>
        .related-products-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.5rem;
          margin: 1rem 0;
        }

        .related-product-card {
          background-color: #5d4037;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .related-product-card:hover {
          transform: translateY(-5px);
        }

        .product-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .product-image-container {
          height: 180px;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .related-product-card:hover .product-image {
          transform: scale(1.05);
        }

        .product-details {
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
          margin: 0;
        }

        .related-products-loading,
        .related-products-error,
        .related-products-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: #e0e0e0;
          text-align: center;
        }

        .related-products-loading i {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #ffd700;
        }

        @media (max-width: 768px) {
          .related-products-container {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }

          .product-image-container {
            height: 140px;
          }
        }
      </style>
    `;
  }
}

customElements.define("related-products", RelatedProducts);
