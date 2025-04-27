import { LitElement, html } from "https://esm.run/lit";

class HeroCarousel extends LitElement {
  static get properties() {
    return {
      currentSlide: { type: Number },
      slides: { type: Array },
    };
  }

  constructor() {
    super();
    this.currentSlide = 0;
    this.slides = [
      {
        title: "Welcome to Ceylon Handicrafts",
        subtitle:
          "Authentic Sri Lankan artisan creations delivered to your doorstep",
        description:
          "Discover unique handcrafted treasures created by skilled Sri Lankan artisans, preserving centuries of tradition and cultural heritage.",
        image: "/static/images/hero-1.jpg",
        buttonText: "Explore Shop",
        buttonLink: "/shop",
      },
      {
        title: "Why We're Different",
        subtitle:
          "Direct connection with artisans, authentic cultural experience",
        description:
          "Our immersive platform lets you connect directly with craftspeople while exploring the rich cultural context behind each handmade piece.",
        image: "/static/images/hero-2.jpg",
        buttonText: "Learn More",
        buttonLink: "/about",
      },
      {
        title: "Vishva AI — Your Cultural Companion",
        subtitle: "Explore the stories and traditions behind the crafts",
        description:
          "Meet Vishva, your AI guide to the rich cultural heritage and crafting traditions of Sri Lanka. Ask anything about the crafts you discover.",
        image: "/static/images/hero-3.jpg",
        buttonText: "Chat with Vishva",
        buttonLink: "/vishva",
      },
    ];
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    // Set interval for automatic slide rotation
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 6000);

    // Add intersection observer for pause/resume
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.resumeAutoSlide();
        } else {
          this.pauseAutoSlide();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.pauseAutoSlide();
  }

  pauseAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  resumeAutoSlide() {
    if (!this.slideInterval) {
      this.slideInterval = setInterval(() => {
        this.nextSlide();
      }, 6000);
    }
  }

  goToSlide(index) {
    this.pauseAutoSlide();
    this.currentSlide = index;
    this.updateSlides();
    this.resumeAutoSlide();
  }

  prevSlide() {
    this.pauseAutoSlide();
    this.currentSlide =
      (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.updateSlides();
    this.resumeAutoSlide();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.updateSlides();
  }

  updateSlides() {
    const slideElements = this.querySelectorAll(".carousel-slide");
    const indicators = this.querySelectorAll(".carousel-indicator");

    slideElements.forEach((slide, index) => {
      if (index === this.currentSlide) {
        slide.classList.add("active");
      } else {
        slide.classList.remove("active");
      }
    });

    indicators.forEach((indicator, index) => {
      if (index === this.currentSlide) {
        indicator.classList.add("active");
      } else {
        indicator.classList.remove("active");
      }
    });
  }

  render() {
    return html`
      <section class="hero-carousel">
        <div class="carousel-container">
          ${this.slides.map(
            (slide, index) => html`
              <div
                class="carousel-slide ${index === this.currentSlide
                  ? "active"
                  : ""}"
              >
                <div
                  class="slide-image"
                  style="background-image: url(${slide.image})"
                ></div>
                <div class="slide-content container">
                  <h1 class="slide-title">${slide.title}</h1>
                  <h2 class="slide-subtitle">${slide.subtitle}</h2>
                  <p class="slide-description">${slide.description}</p>
                  <a href="${slide.buttonLink}" class="slide-button">
                    ${slide.buttonText}
                    <i class="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            `
          )}

          <button class="carousel-control prev" @click=${this.prevSlide}>
            <i class="fas fa-chevron-left"></i>
          </button>

          <button class="carousel-control next" @click=${this.nextSlide}>
            <i class="fas fa-chevron-right"></i>
          </button>

          <div class="carousel-indicators">
            ${this.slides.map(
              (_, index) => html`
                <button
                  class="carousel-indicator ${index === this.currentSlide
                    ? "active"
                    : ""}"
                  @click=${() => this.goToSlide(index)}
                ></button>
              `
            )}
          </div>
        </div>
      </section>

      <style>
        .hero-carousel {
          height: 80vh;
          margin-top: 80px;
          position: relative;
          overflow: hidden;
        }

        .carousel-container {
          position: relative;
          height: 100%;
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
          z-index: 1;
        }

        .carousel-slide.active {
          opacity: 1;
          z-index: 2;
        }

        .slide-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          filter: brightness(0.5);
          z-index: -1;
        }

        .slide-content {
          color: var(--text-white);
          text-align: center;
          max-width: 800px;
          padding: 0 20px;
          z-index: 2;
        }

        .slide-title {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          animation: slideUp 0.8s ease-out forwards;
          animation-delay: 0.2s;
          opacity: 0;
        }

        .slide-subtitle {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--accent-yellow);
          animation: slideUp 0.8s ease-out forwards;
          animation-delay: 0.4s;
          opacity: 0;
        }

        .slide-description {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          animation: slideUp 0.8s ease-out forwards;
          animation-delay: 0.6s;
          opacity: 0;
        }

        .slide-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown);
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: bold;
          transition: all 0.3s ease;
          animation: slideUp 0.8s ease-out forwards;
          animation-delay: 0.8s;
          opacity: 0;
        }

        .slide-button:hover {
          background-color: #e6c200;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .carousel-control {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(0, 0, 0, 0.3);
          color: var(--text-white);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .carousel-control:hover {
          background-color: rgba(0, 0, 0, 0.5);
        }

        .carousel-control.prev {
          left: 20px;
        }

        .carousel-control.next {
          right: 20px;
        }

        .carousel-indicators {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
        }

        .carousel-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid var(--text-white);
          background-color: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .carousel-indicator.active {
          background-color: var(--accent-yellow);
          border-color: var(--accent-yellow);
          transform: scale(1.2);
        }

        .carousel-slide.active .slide-title,
        .carousel-slide.active .slide-subtitle,
        .carousel-slide.active .slide-description,
        .carousel-slide.active .slide-button {
          animation-play-state: running;
        }

        /* Animation keyframes */
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .hero-carousel {
            height: 100vh;
          }

          .slide-title {
            font-size: 2rem;
          }

          .slide-subtitle {
            font-size: 1.2rem;
          }

          .slide-description {
            font-size: 1rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("hero-carousel", HeroCarousel);
