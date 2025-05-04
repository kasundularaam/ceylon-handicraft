import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class ProductRatings extends LitElement {
  static get properties() {
    return {
      ratings: { type: Array },
      averageRating: { type: Number },
      totalRatings: { type: Number },
      ratingCounts: { type: Object },
      loading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    // Get product ID from URL
    const urlParts = window.location.pathname.split("/");
    this.productId = urlParts[urlParts.length - 1];

    this.ratings = [];
    this.averageRating = 0;
    this.totalRatings = 0;
    this.ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.loading = true;
    this.error = null;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    await this.fetchRatings();
  }

  async fetchRatings() {
    try {
      // Fetch ratings
      const response = await fetchJson(
        `/api/product-details/${this.productId}/ratings`
      );
      console.log("Ratings data:", response);

      this.ratings = response.ratings || [];
      this.totalRatings = this.ratings.length;

      // Calculate average rating
      if (this.totalRatings > 0) {
        let sum = 0;
        this.ratings.forEach((rating) => {
          sum += rating.rating;
          // Count ratings by value
          this.ratingCounts[rating.rating] =
            (this.ratingCounts[rating.rating] || 0) + 1;
        });
        this.averageRating = sum / this.totalRatings;
      }

      this.loading = false;
    } catch (error) {
      console.error("Error fetching ratings:", error);
      // Don't show error, just show no ratings
      this.ratings = [];
      this.totalRatings = 0;
      this.loading = false;
    }
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return html`
      <div class="star-rating">
        ${Array(fullStars)
          .fill()
          .map(() => html`<i class="fas fa-star"></i>`)}
        ${hasHalfStar ? html`<i class="fas fa-star-half-alt"></i>` : ""}
        ${Array(emptyStars)
          .fill()
          .map(() => html`<i class="far fa-star"></i>`)}
      </div>
    `;
  }

  formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  render() {
    if (this.loading) {
      return html`
        <div class="ratings-loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading product ratings...</p>
        </div>
      `;
    }

    if (this.totalRatings === 0) {
      return html`
        <div class="no-ratings">
          <p>
            This product has no reviews yet. Be the first to leave a review!
          </p>
        </div>
      `;
    }

    return html`
      <div class="ratings-container">
        <div class="ratings-summary">
          <div class="average-rating">
            <div class="average-score">${this.averageRating.toFixed(1)}</div>
            ${this.renderStars(this.averageRating)}
            <div class="ratings-count">
              ${this.totalRatings} rating${this.totalRatings !== 1 ? "s" : ""}
            </div>
          </div>

          <div class="rating-bars">
            ${[5, 4, 3, 2, 1].map((stars) => {
              const count = this.ratingCounts[stars] || 0;
              const percentage =
                this.totalRatings > 0 ? (count / this.totalRatings) * 100 : 0;

              return html`
                <div class="rating-bar">
                  <div class="bar-label">
                    ${stars} <i class="fas fa-star"></i>
                  </div>
                  <div class="bar-track">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                  </div>
                  <div class="bar-count">${count}</div>
                </div>
              `;
            })}
          </div>
        </div>

        <div class="ratings-list">
          <h3 class="ratings-title">Customer Reviews</h3>

          ${this.ratings.map(
            (rating) => html`
              <div class="rating-item">
                <div class="rating-header">
                  <div class="rating-stars">
                    ${this.renderStars(rating.rating)}
                  </div>
                  <div class="rating-date">
                    ${this.formatDate(rating.created_at)}
                  </div>
                </div>

                <div class="rating-user">
                  <i class="fas fa-user-circle"></i>
                  <span>${rating.user_name || "Anonymous"}</span>
                </div>

                ${rating.description
                  ? html`
                      <div class="rating-text">
                        <p>${rating.description}</p>
                      </div>
                    `
                  : ""}
                ${rating.images && rating.images.length > 0
                  ? html`
                      <div class="rating-images">
                        ${rating.images.map(
                          (image) => html`
                            <div class="rating-image">
                              <img src="${image}" alt="Review image" />
                            </div>
                          `
                        )}
                      </div>
                    `
                  : ""}
              </div>
            `
          )}
        </div>
      </div>

      <style>
        .ratings-container {
          margin: 1rem 0;
        }

        .ratings-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #5d4037;
        }

        .average-rating {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 120px;
        }

        .average-score {
          font-size: 3rem;
          font-weight: 700;
          color: #ffd700;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .star-rating {
          color: #ffd700;
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }

        .ratings-count {
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        .rating-bars {
          flex: 1;
          min-width: 200px;
        }

        .rating-bar {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .bar-label {
          width: 50px;
          color: #e0e0e0;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .bar-track {
          flex: 1;
          height: 10px;
          background-color: #4e342e;
          border-radius: 5px;
          margin: 0 0.8rem;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background-color: #ffd700;
          border-radius: 5px;
        }

        .bar-count {
          width: 30px;
          text-align: right;
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        .ratings-title {
          color: #ffffff;
          font-size: 1.5rem;
          margin: 1.5rem 0 1rem;
        }

        .rating-item {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.2rem;
          margin-bottom: 1rem;
        }

        .rating-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
        }

        .rating-date {
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        .rating-user {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e0e0e0;
          font-size: 0.9rem;
          margin-bottom: 0.8rem;
        }

        .rating-text {
          margin-bottom: 0.8rem;
        }

        .rating-text p {
          margin: 0;
          line-height: 1.5;
        }

        .rating-images {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          margin-top: 1rem;
        }

        .rating-image {
          width: 80px;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
        }

        .rating-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-ratings {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          color: #e0e0e0;
        }

        .ratings-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: #e0e0e0;
          text-align: center;
        }

        .ratings-loading i {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #ffd700;
        }

        @media (max-width: 768px) {
          .ratings-summary {
            flex-direction: column;
            gap: 1.5rem;
          }

          .average-rating {
            align-items: center;
          }
        }
      </style>
    `;
  }
}

customElements.define("product-ratings", ProductRatings);
