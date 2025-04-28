// app/public/js/components/landing/landing-carousal.js
import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class LandingCarousal extends LitElement {
  static get properties() {
    return {
      slides: { type: Array },
      currentSlide: { type: Number },
      isLoading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.slides = [];
    this.currentSlide = 0;
    this.isLoading = true;
    this.error = "";
    this.autoplayInterval = null;
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchCarouselData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  async fetchCarouselData() {
    try {
      // Use sample data until API endpoint is available
      const data = {
        slides: [
          {
            id: 1,
            title: "Welcome to Ceylon Handicrafts",
            subtitle: "Discover authentic Sri Lankan craftsmanship",
            image: "/static/images/hero/welcome.jpg",
            cta: "Explore Collection",
            link: "/shop",
          },
          {
            id: 2,
            title: "Why We're Different",
            subtitle: "Direct connections to skilled artisans across Sri Lanka",
            image: "/static/images/hero/different.jpg",
            cta: "Learn More",
            link: "/about",
          },
          {
            id: 3,
            title: "Vishva AI — Your Cultural Companion",
            subtitle: "Get personalized guidance from our AI assistant",
            image: "/static/images/hero/vishva.jpg",
            cta: "Chat with Vishva",
            link: "/vishva",
          },
        ],
      };

      // Uncomment when API is ready
      // const data = await fetchJson('/api/landing/carousel');

      this.slides = data.slides || [];
      this.isLoading = false;

      if (this.slides.length > 0) {
        this.startAutoplay();
      }
    } catch (error) {
      console.error("Error fetching carousel data:", error);
      this.error = "Failed to load carousel data";
      this.isLoading = false;
    }
  }

  startAutoplay() {
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index) {
    this.currentSlide = index;

    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.startAutoplay();
    }
  }

  render() {
    if (this.isLoading) {
      return html`
        <div class="carousel-loading">
          <div class="spinner"></div>
          <p>Loading beautiful crafts...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="carousel-error">
          <p>${this.error}</p>
        </div>
      `;
    }

    return html`
      <div class="carousel-container">
        <div class="carousel-wrapper">
          <div class="carousel-slides">
            ${this.slides.map(
              (slide, index) => html`
                <div
                  class="carousel-slide ${index === this.currentSlide
                    ? "active"
                    : ""}"
                >
                  <div
                    class="slide-background"
                    style="background-image: url(${slide.image})"
                  ></div>
                  <div class="slide-overlay"></div>
                  <div class="slide-content">
                    <h1 class="slide-title">${slide.title}</h1>
                    <p class="slide-subtitle">${slide.subtitle}</p>
                    <a href="${slide.link}" class="slide-cta">${slide.cta}</a>
                  </div>
                </div>
              `
            )}
          </div>

          <button class="carousel-control prev" @click=${this.prevSlide}>
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="carousel-control next" @click=${this.nextSlide}>
            <i class="fas fa-chevron-right"></i>
          </button>

          <div class="carousel-indicators">
            ${this.slides.map(
              (slide, index) => html`
                <button
                  class="indicator ${index === this.currentSlide
                    ? "active"
                    : ""}"
                  @click=${() => this.goToSlide(index)}
                ></button>
              `
            )}
          </div>
        </div>
      </div>

      <style>
        .carousel-container {
          width: 100%;
          height: calc(100vh - 76px);
          position: relative;
          overflow: hidden;
        }

        .carousel-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .carousel-slides {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .carousel-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carousel-slide.active {
          opacity: 1;
          z-index: 1;
        }

        .slide-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transform: scale(1);
          transition: transform 10s ease;
          z-index: -1;
        }

        .carousel-slide.active .slide-background {
          transform: scale(1.1);
        }

        .slide-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to top,
            rgba(62, 39, 35, 0.8) 0%,
            rgba(62, 39, 35, 0.4) 50%,
            rgba(62, 39, 35, 0.6) 100%
          );
          z-index: 0;
        }

        .slide-content {
          text-align: center;
          max-width: 800px;
          padding: 2rem;
          position: relative;
          z-index: 2;
          transform: translateY(30px);
          opacity: 0;
          transition: transform 0.8s ease, opacity 0.8s ease;
          transition-delay: 0.3s;
        }

        .carousel-slide.active .slide-content {
          transform: translateY(0);
          opacity: 1;
        }

        .slide-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #ffd700;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .slide-subtitle {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          color: #ffffff;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
        }

        .slide-cta {
          display: inline-block;
          background-color: #ffd700;
          color: #3e2723;
          font-weight: 600;
          padding: 1rem 2rem;
          border-radius: 4px;
          text-decoration: none;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .slide-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
        }

        .carousel-control {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(62, 39, 35, 0.3);
          color: #ffffff;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: background-color 0.3s ease, transform 0.3s ease;
        }

        .carousel-control:hover {
          background-color: rgba(255, 215, 0, 0.7);
          color: #3e2723;
        }

        .carousel-control.prev {
          left: 20px;
        }

        .carousel-control.next {
          right: 20px;
        }

        .carousel-indicators {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          transition: transform 0.3s ease, background-color 0.3s ease;
        }

        .indicator.active {
          background-color: #ffd700;
          transform: scale(1.2);
        }

        .carousel-loading,
        .carousel-error {
          width: 100%;
          height: calc(100vh - 76px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          background-color: #3e2723;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255, 215, 0, 0.3);
          border-radius: 50%;
          border-top-color: #ffd700;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
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
          .slide-title {
            font-size: 2rem;
          }

          .slide-subtitle {
            font-size: 1.2rem;
          }

          .carousel-control {
            width: 40px;
            height: 40px;
          }
        }

        @media (max-width: 480px) {
          .slide-title {
            font-size: 1.5rem;
          }

          .slide-subtitle {
            font-size: 1rem;
          }

          .slide-cta {
            padding: 0.75rem 1.5rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("landing-carousal", LandingCarousal);
