import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";
import "../../components/global/sale-product-card.js";

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

      // Fetch images for each product and format for sale-product-card
      const productsWithImages = await Promise.all(
        relatedProducts.map(async (product) => {
          try {
            const imagesResponse = await fetchJson(
              `/api/product-details/${product.id}/images`
            );

            // Format for sale-product-card
            return {
              ...product,
              image_paths:
                imagesResponse.images && imagesResponse.images.length > 0
                  ? imagesResponse.images
                  : ["/static/images/placeholder-product.jpg"],
              currentImageIndex: 0,
              // Format category in the structure that sale-product-card expects
              category: {
                title: product.category_title || "Uncategorized",
                icon: "fa fa-tag",
              },
            };
          } catch (error) {
            console.error(
              `Error fetching images for product ${product.id}:`,
              error
            );
            return {
              ...product,
              image_paths: ["/static/images/placeholder-product.jpg"],
              currentImageIndex: 0,
              category: {
                title: product.category_title || "Uncategorized",
                icon: "fa fa-tag",
              },
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
          (product, index) => html`
            <sale-product-card
              .product=${product}
              .index=${index}
            ></sale-product-card>
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
        }
      </style>
    `;
  }
}

customElements.define("related-products", RelatedProducts);
