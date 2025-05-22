import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class CategoryHeader extends LitElement {
  static get properties() {
    return {
      category: { type: Object },
      loading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.category = {};
    this.loading = true;
    this.error = null;

    // Extract category ID from URL
    const urlParts = window.location.pathname.split("/");
    this.categoryId = urlParts[urlParts.length - 1];
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    await this.fetchCategoryDetails();
  }

  async fetchCategoryDetails() {
    try {
      this.loading = true;
      this.category = await fetchJson(`/api/categories/${this.categoryId}`);

      // Set page title dynamically
      document.title = `${this.category.title} - Ceylon Handicrafts`;

      this.loading = false;
    } catch (error) {
      console.error("Error fetching category details:", error);
      this.error = error.message;
      this.loading = false;
    }
  }

  renderLoading() {
    return html`
      <div class="category-header-loading">
        <div class="loader"></div>
        <p>Loading category details...</p>
      </div>
    `;
  }

  renderError() {
    return html`
      <div class="category-header-error">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Category</h3>
        <p>${this.error || "Unknown error occurred"}</p>
        <button @click=${this.fetchCategoryDetails}>Try Again</button>
      </div>
    `;
  }

  render() {
    if (this.loading) {
      return this.renderLoading();
    }

    if (this.error) {
      return this.renderError();
    }

    const categoryImage =
      this.category.image || "/static/images/placeholder-category.jpg";

    return html`
      <div class="category-header">
        <div
          class="category-banner"
          style="background-image: linear-gradient(rgba(62, 39, 35, 0.8), rgba(62, 39, 35, 0.95)), url(${categoryImage});"
        >
          <div class="category-icon">
            <i class="${this.category.icon || "fas fa-tag"}"></i>
          </div>
          <div class="category-info">
            <h1 class="category-title">${this.category.title}</h1>
            ${this.category.description
              ? html`
                  <p class="category-description">
                    ${this.category.description}
                  </p>
                `
              : ""}
          </div>
        </div>
      </div>

      <style>
        .category-header {
          margin-bottom: 2rem;
        }

        .category-banner {
          display: flex;
          align-items: center;
          padding: 2.5rem 2rem;
          border-radius: 10px;
          background-size: cover;
          background-position: center;
          background-color: #5d4037;
          position: relative;
          overflow: hidden;
        }

        .category-icon {
          background-color: #ffd700;
          color: #3e2723;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1.5rem;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .category-icon i {
          font-size: 2.5rem;
        }

        .category-info {
          flex: 1;
        }

        .category-title {
          color: #ffd700;
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .category-description {
          color: #e0e0e0;
          font-size: 1.1rem;
          margin: 0;
          max-width: 700px;
          line-height: 1.5;
        }

        .category-header-loading,
        .category-header-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          text-align: center;
          background-color: rgba(93, 64, 55, 0.5);
          border-radius: 10px;
        }

        .loader {
          border: 4px solid rgba(255, 215, 0, 0.2);
          border-top: 4px solid #ffd700;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .category-header-error i {
          font-size: 2.5rem;
          color: #ffd700;
          margin-bottom: 1rem;
        }

        .category-header-error h3 {
          color: #ffffff;
          margin: 0 0 0.5rem 0;
        }

        .category-header-error button {
          margin-top: 1rem;
          padding: 0.5rem 1.5rem;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          border-radius: 5px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .category-header-error button:hover {
          background-color: #ffc400;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .category-banner {
            flex-direction: column;
            text-align: center;
            padding: 2rem 1rem;
          }

          .category-icon {
            margin-right: 0;
            margin-bottom: 1rem;
          }

          .category-title {
            font-size: 2rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("category-header", CategoryHeader);
