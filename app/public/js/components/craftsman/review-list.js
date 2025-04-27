// File: app/public/js/components/craftsman/review-list.js
import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class ReviewList extends LitElement {
  static get properties() {
    return {
      reviews: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.reviews = [];
    this.loading = true;
    this.error = null;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadReviews();
  }

  async loadReviews() {
    try {
      const data = await fetchJson("/api/craftsman/reviews");
      this.reviews = data.reviews;
      this.loading = false;
    } catch (error) {
      console.error("Error loading reviews:", error);
      this.error = "Failed to load reviews. Please try again.";
      this.loading = false;
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  renderStars(rating) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(html` <i class="fa${i <= rating ? "s" : "r"} fa-star"></i> `);
    }
    return stars;
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i> Loading reviews...
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i> ${this.error}
        </div>
      `;
    }

    if (this.reviews.length === 0) {
      return html`
        <div class="empty-state">
          <i class="fas fa-comment-slash"></i>
          <p>No reviews yet</p>
          <span
            >Your product reviews will appear here once customers start sharing
            their experiences.</span
          >
        </div>
      `;
    }

    return html`
      <div class="review-list">
        ${this.reviews.map(
          (review) => html`
            <div class="review-item">
              <div class="review-header">
                <div class="review-product">
                  <img
                    src="${review.product_image ||
                    "/static/images/placeholder.png"}"
                    alt="${review.product_title}"
                  />
                  <h4>${review.product_title}</h4>
                </div>
                <div class="review-rating">
                  ${this.renderStars(review.rating)}
                  <span class="review-date"
                    >${this.formatDate(review.created_at)}</span
                  >
                </div>
              </div>
              <div class="review-content">
                <p>${review.description || "No comment provided."}</p>
              </div>
              <div class="review-footer">
                <div class="reviewer">
                  <i class="fas fa-user-circle"></i>
                  <span>${review.user_name}</span>
                </div>
                <div class="review-order-id">
                  <span>Order #${review.order_id.substring(0, 8)}</span>
                </div>
              </div>
            </div>
          `
        )}
      </div>

      <style>
        .review-list {
          display: grid;
          gap: 1rem;
        }

        .review-item {
          background-color: #3e2723; /* Main dark brown */
          border-radius: 8px;
          padding: 1rem;
          transition: transform 0.2s;
        }

        .review-item:hover {
          transform: translateY(-2px);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .review-product {
          display: flex;
          align-items: center;
        }

        .review-product img {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          object-fit: cover;
          margin-right: 0.75rem;
        }

        .review-product h4 {
          margin: 0;
          font-size: 0.95rem;
          color: #ffffff; /* Text white */
        }

        .review-rating {
          text-align: right;
        }

        .review-rating i {
          color: #ffd700; /* Accent yellow */
          margin-right: 2px;
        }

        .review-date {
          display: block;
          font-size: 0.75rem;
          color: #e0e0e0; /* Subtle grey */
          margin-top: 0.25rem;
        }

        .review-content {
          margin-bottom: 0.75rem;
          border-left: 3px solid #5d4037; /* Secondary brown */
          padding-left: 0.75rem;
        }

        .review-content p {
          margin: 0;
          color: #e0e0e0; /* Subtle grey */
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .review-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 0.75rem;
        }

        .reviewer {
          display: flex;
          align-items: center;
        }

        .reviewer i {
          color: #ffd700; /* Accent yellow */
          margin-right: 0.5rem;
        }

        .reviewer span {
          font-size: 0.85rem;
        }

        .review-order-id span {
          font-size: 0.75rem;
          color: #e0e0e0; /* Subtle grey */
        }

        .loading-indicator,
        .error-message,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          color: #e0e0e0; /* Subtle grey */
        }

        .loading-indicator i,
        .error-message i,
        .empty-state i {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #ffd700; /* Accent yellow */
        }

        .empty-state p {
          margin: 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 500;
          color: #ffffff; /* Text white */
        }

        .empty-state span {
          font-size: 0.9rem;
          max-width: 400px;
        }
      </style>
    `;
  }
}

customElements.define("review-list", ReviewList);
