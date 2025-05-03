// app/public/js/components/landing/categories-section.js
import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class CategoriesSection extends LitElement {
  static get properties() {
    return {
      categories: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.categories = [];
    this.loading = true;
    this.error = null;
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchCategories();
  }

  async fetchCategories() {
    try {
      // Use the landing API endpoint
      const data = await fetchJson("/api/landing/categories");
      console.log("Categories data:", data);
      this.categories = data;
      this.loading = false;
    } catch (error) {
      console.error("Error fetching categories:", error);
      this.error = "Failed to load categories. Please try again later.";
      this.loading = false;
    }
  }

  render() {
    return html`
      <section class="categories-section">
        <div class="categories-header">
          <h2 class="section-title">Explore Our Collections</h2>
          <p class="section-description">
            Discover the rich traditions and craftsmanship of Sri Lankan
            artisans
          </p>
          <div class="section-divider"></div>
        </div>

        ${this.loading
          ? this.renderLoading()
          : this.error
          ? this.renderError()
          : this.renderCategories()}
      </section>

      <style>
        .categories-section {
          margin: 5rem 0;
          width: 100%;
        }

        .categories-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .section-title {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }

        .section-description {
          font-size: 1.1rem;
          color: #e0e0e0;
          max-width: 700px;
          margin: 0 auto 0.8rem;
        }

        .section-divider {
          height: 3px;
          width: 60px;
          background-color: #ffd700;
          margin: 0 auto;
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .category-card {
          position: relative;
          height: 340px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
        }

        .category-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          z-index: 0;
        }

        .category-card:hover .category-image {
          transform: scale(1.05);
        }

        .category-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(30, 15, 10, 0.2) 0%,
            rgba(30, 15, 10, 0.9) 70%
          );
          backdrop-filter: blur(2px);
          z-index: 1;
        }

        .category-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          z-index: 2;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .category-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: rgba(62, 39, 35, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          border: 2px solid #ffd700;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .category-icon i {
          color: #ffd700;
          font-size: 1.3rem;
        }

        .category-title-container {
          margin-bottom: 0.5rem;
        }

        .category-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .category-divider {
          height: 3px;
          width: 40px;
          background-color: #ffd700;
          margin: 8px auto 0;
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
        }

        .category-description {
          color: #e0e0e0;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0.8rem 0 1.2rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-height: 4.5em;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .category-link {
          color: #ffd700;
          font-weight: 500;
          display: flex;
          align-items: center;
          width: fit-content;
          text-decoration: none;
          transition: transform 0.2s ease;
        }

        .category-link:hover {
          transform: translateX(4px);
        }

        .category-link i {
          margin-left: 0.5rem;
          font-size: 0.9rem;
          transition: transform 0.2s ease;
        }

        .category-link:hover i {
          transform: translateX(2px);
        }

        /* Futuristic details */
        .category-card::after {
          content: "";
          position: absolute;
          top: 10px;
          right: 10px;
          width: 10px;
          height: 10px;
          background-color: #ffd700;
          border-radius: 50%;
          box-shadow: 0 0 15px 3px rgba(255, 215, 0, 0.6);
          z-index: 2;
        }

        /* Loading state */
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255, 215, 0, 0.2);
          border-left-color: #ffd700;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Error state */
        .error-container {
          background-color: rgba(0, 0, 0, 0.2);
          padding: 2rem;
          border-radius: 10px;
          text-align: center;
          color: #e0e0e0;
        }

        .error-container button {
          display: inline-flex;
          align-items: center;
          background-color: #ffd700;
          color: #3e2723;
          padding: 0.8rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          border: none;
          cursor: pointer;
          margin-top: 1rem;
        }

        .error-container button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          background-color: #ffea80;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .section-title {
            font-size: 1.8rem;
          }

          .section-description {
            font-size: 1rem;
          }

          .categories-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .categories-grid {
            grid-template-columns: 1fr;
          }

          .category-card {
            height: 310px;
          }
        }
      </style>
    `;
  }

  renderLoading() {
    return html`
      <div class="loading-container">
        <div class="loading-spinner"></div>
      </div>
    `;
  }

  renderError() {
    return html`
      <div class="error-container">
        <p>${this.error}</p>
        <button @click=${this.fetchCategories}>Try Again</button>
      </div>
    `;
  }

  renderCategories() {
    return html`
      <div class="categories-grid">
        ${this.categories.length > 0
          ? this.categories.map((category) => this.renderCategoryCard(category))
          : html`<p
              style="grid-column: 1/-1; text-align: center; color: #e0e0e0;"
            >
              No categories found
            </p>`}
      </div>
    `;
  }

  renderCategoryCard(category) {
    // Handle missing images with a default
    const imageUrl = category.image || "/static/images/categories/default.jpg";
    // Handle missing icons with a default
    const iconClass = category.icon || "fas fa-gift";
    // Create a shortened description (about 100-120 characters)
    const shortDescription = category.description
      ? category.description.length > 120
        ? category.description.substring(0, 120) + "..."
        : category.description
      : "Explore authentic Sri Lankan craftsmanship in this collection.";

    return html`
      <div
        class="category-card"
        @click=${() => this.navigateToCategory(category.id)}
      >
        <img
          src="${imageUrl}"
          alt="${category.title}"
          class="category-image"
          @error=${(e) => {
            e.target.src = "/static/images/categories/default.jpg";
          }}
        />
        <div class="category-overlay"></div>
        <div class="category-content">
          <div class="category-icon">
            <i class="${iconClass}"></i>
          </div>
          <div class="category-title-container">
            <h3 class="category-title">${category.title}</h3>
            <div class="category-divider"></div>
          </div>
          <p class="category-description">${shortDescription}</p>
          <a href="/category/${category.id}" class="category-link">
            Discover <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `;
  }

  navigateToCategory(categoryId) {
    window.location.href = `/category/${categoryId}`;
  }
}

customElements.define("categories-section", CategoriesSection);
