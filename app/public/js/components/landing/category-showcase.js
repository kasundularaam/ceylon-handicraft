import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class CategoryShowcase extends LitElement {
  static get properties() {
    return {
      categories: { type: Array },
      loading: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.categories = [];
    this.loading = true;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    this.loadCategories();

    // Add intersection observer for animation
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.querySelector(".category-section").classList.add("visible");
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(this);
  }

  async loadCategories() {
    try {
      this.loading = true;
      this.categories = await fetchJson("/api/landing/categories");
    } catch (error) {
      console.error("Error loading categories:", error);
      this.categories = [];
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <section class="section category-section">
        <div class="container">
          <h2 class="section-title">
            Explore Our <span class="accent-text">Categories</span>
          </h2>

          ${this.loading
            ? html`
                <div class="loading-container">
                  <div class="loading-spinner"></div>
                  <p>Discovering craft categories...</p>
                </div>
              `
            : html`
                <div class="categories-grid">
                  ${this.categories.length > 0
                    ? this.categories.map(
                        (category, index) => html`
                          <a
                            href="/shop/category/${category.id}"
                            class="category-card"
                            style="animation-delay: ${index * 0.1}s"
                          >
                            <div class="category-image-container">
                              <div
                                class="category-image"
                                style="background-image: url(${category.image})"
                              ></div>
                            </div>
                            <div class="category-content">
                              <div class="category-icon">
                                <i class="fas ${category.icon}"></i>
                              </div>
                              <h3 class="category-title">${category.title}</h3>
                              <p class="category-description">
                                ${category.description
                                  ? category.description.substring(0, 60) +
                                    (category.description.length > 60
                                      ? "..."
                                      : "")
                                  : ""}
                              </p>
                              <div class="category-button">
                                <span>Browse Category</span>
                                <i class="fas fa-arrow-right"></i>
                              </div>
                            </div>
                          </a>
                        `
                      )
                    : html`
                        <div class="no-categories">
                          <i class="fas fa-exclamation-circle"></i>
                          <p>No categories available at the moment.</p>
                        </div>
                      `}
                </div>
              `}
        </div>
      </section>

      <style>
        .category-section {
          padding: 5rem 0;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .category-section.visible {
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

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .category-card {
          display: flex;
          flex-direction: column;
          background: linear-gradient(
            135deg,
            rgba(93, 64, 55, 0.8),
            rgba(62, 39, 35, 0.8)
          );
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          text-decoration: none;
          position: relative;
          isolation: isolate;
          backdrop-filter: blur(10px);
          animation: fadeIn 0.5s ease forwards;
          opacity: 0;
          height: 100%;
        }

        .category-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .category-image-container {
          position: relative;
          height: 180px;
          overflow: hidden;
        }

        .category-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: transform 0.5s ease;
        }

        .category-card:hover .category-image {
          transform: scale(1.1);
        }

        .category-content {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .category-icon {
          width: 60px;
          height: 60px;
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
          transition: all 0.3s ease;
        }

        .category-card:hover .category-icon {
          transform: translateY(-5px) rotate(10deg);
        }

        .category-title {
          font-size: 1.4rem;
          color: var(--text-white);
          margin: 0 0 1rem 0;
          position: relative;
          padding-bottom: 0.75rem;
        }

        .category-title::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 40px;
          height: 3px;
          background-color: var(--accent-yellow);
          transition: width 0.3s ease;
        }

        .category-card:hover .category-title::after {
          width: 80px;
        }

        .category-description {
          color: var(--subtle-grey);
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .category-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--accent-yellow);
          font-weight: 600;
          margin-top: auto;
          transition: all 0.3s ease;
        }

        .category-button i {
          transition: transform 0.3s ease;
        }

        .category-card:hover .category-button {
          color: #e6c200;
        }

        .category-card:hover .category-button i {
          transform: translateX(5px);
        }

        .no-categories {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          background: linear-gradient(
            135deg,
            rgba(93, 64, 55, 0.5),
            rgba(62, 39, 35, 0.5)
          );
          border-radius: 16px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .no-categories i {
          font-size: 3rem;
          color: var(--accent-yellow);
          margin-bottom: 1rem;
        }

        /* Responsive adjustments */
        @media (max-width: 992px) {
          .categories-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .categories-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .categories-grid {
            grid-template-columns: 1fr;
          }

          .category-card {
            max-width: 100%;
          }
        }
      </style>
    `;
  }
}

customElements.define("category-showcase", CategoryShowcase);
