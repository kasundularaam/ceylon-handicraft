import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class AuctionShowcase extends LitElement {
  static get properties() {
    return {
      auctions: { type: Array },
      loading: { type: Boolean },
      currentSlides: { type: Object },
    };
  }

  constructor() {
    super();
    this.auctions = [];
    this.loading = true;
    this.currentSlides = {};
    this.slideIntervals = {};
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    this.loadAuctions();

    // Add intersection observer for animation
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.querySelector(".auction-section").classList.add("visible");
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clear all intervals when component is removed
    Object.values(this.slideIntervals).forEach((interval) =>
      clearInterval(interval)
    );
  }

  async loadAuctions() {
    try {
      this.loading = true;
      this.auctions = await fetchJson("/api/landing/featured-auctions");

      // Initialize current slide for each auction
      this.auctions.forEach((auction) => {
        this.currentSlides[auction.id] = 0;
      });

      // Setup auto-rotation for slideshows after small delay
      setTimeout(() => {
        this.setupSlideshows();
      }, 500);
    } catch (error) {
      console.error("Error loading featured auctions:", error);
      this.auctions = [];
    } finally {
      this.loading = false;
    }
  }

  setupSlideshows() {
    // Clear any existing intervals
    Object.values(this.slideIntervals).forEach((interval) =>
      clearInterval(interval)
    );

    // Setup new intervals
    this.auctions.forEach((auction) => {
      if (auction.images && auction.images.length > 1) {
        this.slideIntervals[auction.id] = setInterval(() => {
          this.nextSlide(auction.id);
        }, 3000 + Math.random() * 2000); // Stagger intervals slightly
      }
    });
  }

  nextSlide(auctionId, event) {
    if (event) event.stopPropagation();

    const auction = this.auctions.find((a) => a.id === auctionId);
    if (!auction || !auction.images || auction.images.length <= 1) return;

    this.currentSlides[auctionId] =
      (this.currentSlides[auctionId] + 1) % auction.images.length;
    this.updateSlideshow(auctionId);
  }

  prevSlide(auctionId, event) {
    if (event) event.stopPropagation();

    const auction = this.auctions.find((a) => a.id === auctionId);
    if (!auction || !auction.images || auction.images.length <= 1) return;

    this.currentSlides[auctionId] =
      (this.currentSlides[auctionId] - 1 + auction.images.length) %
      auction.images.length;
    this.updateSlideshow(auctionId);

    // Reset the interval to prevent immediate rotation after manual navigation
    clearInterval(this.slideIntervals[auctionId]);
    this.slideIntervals[auctionId] = setInterval(() => {
      this.nextSlide(auctionId);
    }, 3000 + Math.random() * 2000);
  }

  goToSlide(auctionId, index, event) {
    if (event) event.stopPropagation();

    this.currentSlides[auctionId] = index;
    this.updateSlideshow(auctionId);

    // Reset the interval
    clearInterval(this.slideIntervals[auctionId]);
    this.slideIntervals[auctionId] = setInterval(() => {
      this.nextSlide(auctionId);
    }, 3000 + Math.random() * 2000);
  }

  updateSlideshow(auctionId) {
    const slideTrack = this.querySelector(
      `.slideshow-track[data-auction-id="${auctionId}"]`
    );
    const indicators = this.querySelectorAll(
      `.slideshow-indicator[data-auction-id="${auctionId}"]`
    );

    if (slideTrack) {
      const currentSlide = this.currentSlides[auctionId];
      slideTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

      indicators.forEach((indicator, index) => {
        if (index === currentSlide) {
          indicator.classList.add("active");
        } else {
          indicator.classList.remove("active");
        }
      });
    }
  }

  pauseSlideshow(auctionId) {
    if (this.slideIntervals[auctionId]) {
      clearInterval(this.slideIntervals[auctionId]);
    }
  }

  resumeSlideshow(auctionId) {
    if (this.slideIntervals[auctionId]) {
      clearInterval(this.slideIntervals[auctionId]);
      this.slideIntervals[auctionId] = setInterval(() => {
        this.nextSlide(auctionId);
      }, 3000 + Math.random() * 2000);
    }
  }

  render() {
    return html`
      <section class="section auction-section">
        <div class="container">
          <div class="auction-header">
            <div class="auction-title-wrapper">
              <h2 class="section-title">
                Live <span class="accent-text">Auctions</span>
              </h2>
              <p class="auction-subtitle">
                Bid on exclusive crafts directly from Ceylon artisans
              </p>
            </div>
            <a href="/auctions" class="view-all-auctions">
              <span>View All Auctions</span>
              <i class="fas fa-gavel"></i>
            </a>
          </div>

          ${this.loading
            ? html`
                <div class="loading-container">
                  <div class="loading-spinner"></div>
                  <p>Fetching active auctions...</p>
                </div>
              `
            : html`
                <div class="auction-grid">
                  ${this.auctions.length > 0
                    ? this.auctions.map(
                        (auction, index) => html`
                          <div
                            class="auction-card"
                            style="animation-delay: ${index * 0.1}s"
                          >
                            <div class="auction-badge">
                              <i class="fas fa-gavel"></i> Live Auction
                            </div>

                            <!-- Slideshow Container -->
                            <div class="auction-image">
                              <div
                                class="slideshow-container"
                                @mouseenter=${() =>
                                  this.pauseSlideshow(auction.id)}
                                @mouseleave=${() =>
                                  this.resumeSlideshow(auction.id)}
                              >
                                <div
                                  class="slideshow-track"
                                  data-auction-id="${auction.id}"
                                >
                                  ${auction.images.map(
                                    (image) => html`
                                      <div class="slideshow-slide">
                                        <img
                                          src="${image}"
                                          alt="${auction.title}"
                                        />
                                      </div>
                                    `
                                  )}
                                </div>

                                <div class="slideshow-overlay"></div>

                                <!-- Slideshow Navigation Arrows -->
                                ${auction.images.length > 1
                                  ? html`
                                      <button
                                        class="slideshow-arrow prev"
                                        @click=${(e) =>
                                          this.prevSlide(auction.id, e)}
                                      >
                                        <i class="fas fa-chevron-left"></i>
                                      </button>
                                      <button
                                        class="slideshow-arrow next"
                                        @click=${(e) =>
                                          this.nextSlide(auction.id, e)}
                                      >
                                        <i class="fas fa-chevron-right"></i>
                                      </button>
                                    `
                                  : ""}

                                <!-- Slideshow Indicators -->
                                ${auction.images.length > 1
                                  ? html`
                                      <div class="slideshow-indicators">
                                        ${auction.images.map(
                                          (_, i) => html`
                                            <button
                                              class="slideshow-indicator ${i ===
                                              0
                                                ? "active"
                                                : ""}"
                                              data-auction-id="${auction.id}"
                                              @click=${(e) =>
                                                this.goToSlide(
                                                  auction.id,
                                                  i,
                                                  e
                                                )}
                                            ></button>
                                          `
                                        )}
                                      </div>
                                    `
                                  : ""}
                              </div>
                            </div>

                            <div class="auction-info">
                              <h3 class="auction-title">${auction.title}</h3>

                              <div class="auction-details">
                                <div class="auction-detail">
                                  <span class="detail-label">Starting Bid</span>
                                  <span class="detail-value"
                                    >$${auction.price.toFixed(2)}</span
                                  >
                                </div>
                                <div class="auction-detail">
                                  <span class="detail-label">Current Bid</span>
                                  <span class="detail-value accent"
                                    >$${(auction.price * 1.2).toFixed(2)}</span
                                  >
                                </div>
                                <div class="auction-detail">
                                  <span class="detail-label">Ends In</span>
                                  <div class="countdown">
                                    <div class="countdown-item">
                                      <span class="countdown-value">2</span>
                                      <span class="countdown-label">Days</span>
                                    </div>
                                    <div class="countdown-item">
                                      <span class="countdown-value">8</span>
                                      <span class="countdown-label">Hours</span>
                                    </div>
                                    <div class="countdown-item">
                                      <span class="countdown-value">45</span>
                                      <span class="countdown-label">Mins</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div class="auction-actions">
                                <button class="quick-bid-btn">
                                  <i class="fas fa-bolt"></i>
                                  <span>Quick Bid</span>
                                </button>
                                <a
                                  href="/auction/${auction.id}"
                                  class="view-auction-btn"
                                >
                                  <span>View Auction</span>
                                  <i class="fas fa-arrow-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        `
                      )
                    : html`
                        <div class="no-auctions">
                          <i class="fas fa-exclamation-circle"></i>
                          <p>No active auctions available at the moment.</p>
                          <a href="/shop" class="browse-products-link"
                            >Browse Our Products Instead</a
                          >
                        </div>
                      `}
                </div>
              `}
        </div>
      </section>

      <style>
        .auction-section {
          background: linear-gradient(
            to bottom,
            var(--primary-dark-brown),
            var(--secondary-brown)
          );
          padding: 5rem 0;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
          position: relative;
        }

        .auction-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("/static/images/pattern-bg.png");
          background-size: 300px;
          background-repeat: repeat;
          opacity: 0.05;
          pointer-events: none;
        }

        .auction-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .auction-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          position: relative;
        }

        .auction-title-wrapper {
          flex: 1;
        }

        .auction-title-wrapper .section-title {
          text-align: left;
          margin-bottom: 0.5rem;
        }

        .auction-title-wrapper .section-title::after {
          left: 0;
          transform: none;
        }

        .auction-subtitle {
          color: var(--subtle-grey);
          font-size: 1.1rem;
        }

        .view-all-auctions {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background-color: transparent;
          color: var(--accent-yellow);
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border: 2px solid var(--accent-yellow);
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }

        .view-all-auctions::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 100%;
          background-color: var(--accent-yellow);
          z-index: -1;
          transition: width 0.3s ease;
        }

        .view-all-auctions:hover {
          color: var(--primary-dark-brown);
        }

        .view-all-auctions:hover::before {
          width: 100%;
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

        .auction-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2.5rem;
        }

        .auction-card {
          background: linear-gradient(
            135deg,
            rgba(93, 64, 55, 0.8),
            rgba(62, 39, 35, 0.8)
          );
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          position: relative;
          animation: fadeIn 0.5s ease forwards;
          opacity: 0;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .auction-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }

        .auction-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-weight: bold;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 10;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .auction-image {
          height: 200px;
          position: relative;
          overflow: hidden;
        }

        /* Slideshow Styles */
        .slideshow-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .slideshow-track {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 0.5s ease-in-out;
        }

        .slideshow-slide {
          flex: 0 0 100%;
          height: 100%;
        }

        .slideshow-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .slideshow-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(62, 39, 35, 0.9) 100%
          );
          pointer-events: none;
        }

        .auction-card:hover .slideshow-slide img {
          transform: scale(1.08);
        }

        .slideshow-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.3s ease, background-color 0.3s ease;
        }

        .slideshow-container:hover .slideshow-arrow {
          opacity: 1;
        }

        .slideshow-arrow.prev {
          left: 10px;
        }

        .slideshow-arrow.next {
          right: 10px;
        }

        .slideshow-arrow:hover {
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown);
        }

        .slideshow-indicators {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }

        .slideshow-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }

        .slideshow-indicator.active {
          background-color: var(--accent-yellow);
          transform: scale(1.2);
        }

        .auction-info {
          padding: 1.5rem;
        }

        .auction-title {
          font-size: 1.4rem;
          margin-bottom: 1.5rem;
          color: var(--text-white);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .auction-details {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          margin-bottom: 1.5rem;
        }

        .auction-detail {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .detail-label {
          font-size: 0.9rem;
          color: var(--subtle-grey);
        }

        .detail-value {
          font-size: 1.2rem;
          font-weight: 600;
        }

        .detail-value.accent {
          color: var(--accent-yellow);
        }

        .countdown {
          display: flex;
          gap: 0.8rem;
        }

        .countdown-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          background-color: rgba(255, 255, 255, 0.1);
          padding: 0.6rem 0.8rem;
          border-radius: 8px;
          min-width: 60px;
          backdrop-filter: blur(5px);
        }

        .countdown-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--accent-yellow);
        }

        .countdown-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--subtle-grey);
        }

        .auction-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .quick-bid-btn,
        .view-auction-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .quick-bid-btn {
          background-color: rgba(255, 215, 0, 0.15);
          color: var(--accent-yellow);
          border: none;
          cursor: pointer;
        }

        .view-auction-btn {
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown);
          text-decoration: none;
        }

        .quick-bid-btn:hover {
          background-color: rgba(255, 215, 0, 0.25);
          transform: translateY(-3px);
        }

        .view-auction-btn:hover {
          background-color: #e6c200;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
        }

        .no-auctions {
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
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .no-auctions i {
          font-size: 3rem;
          color: var(--accent-yellow);
          margin-bottom: 1rem;
        }

        .browse-products-link {
          display: inline-block;
          margin-top: 1.5rem;
          color: var(--accent-yellow);
          text-decoration: none;
          font-weight: 500;
          padding: 0.6rem 1.2rem;
          border: 1px solid var(--accent-yellow);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .browse-products-link:hover {
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown);
          transform: translateY(-3px);
        }

        /* Responsive adjustments */
        @media (max-width: 992px) {
          .auction-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }

          .auction-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }

          .auction-title-wrapper .section-title {
            text-align: center;
          }

          .auction-title-wrapper .section-title::after {
            left: 50%;
            transform: translateX(-50%);
          }

          .auction-subtitle {
            text-align: center;
          }

          .view-all-auctions {
            align-self: center;
          }
        }

        @media (max-width: 768px) {
          .auction-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
          }

          .slideshow-arrow {
            opacity: 1;
          }
        }

        @media (max-width: 480px) {
          .auction-grid {
            grid-template-columns: 1fr;
          }

          .auction-actions {
            grid-template-columns: 1fr;
          }

          .slideshow-arrow {
            width: 36px;
            height: 36px;
          }
        }
      </style>
    `;
  }
}

customElements.define("auction-showcase", AuctionShowcase);
