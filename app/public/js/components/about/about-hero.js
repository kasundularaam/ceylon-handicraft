// app/public/js/components/about/about-hero.js
import { LitElement, html } from "https://esm.run/lit";

class AboutHero extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <section class="about-hero">
        <div class="hero-content">
          <h1 class="hero-title">Ceylon Handicrafts</h1>
          <div class="hero-divider"></div>
          <p class="hero-subtitle">
            A research project preserving Sri Lankan craftsmanship through
            modern technology
          </p>
        </div>
      </section>

      <style>
        .about-hero {
          height: 500px;
          width: 100%;
          margin-bottom: 4rem;
          background-image: url("/static/images/about/about-hero.jpg");
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          border-radius: 12px;
          overflow: hidden;
        }

        .about-hero::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            rgba(0, 0, 0, 0.3),
            rgba(30, 15, 10, 0.7)
          );
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          padding: 0 2rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #ffffff;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .hero-divider {
          height: 3px;
          width: 60px;
          background-color: #ffd700;
          margin: 0 auto 1.5rem;
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
        }

        .hero-subtitle {
          font-size: 1.3rem;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
          color: #ffffff;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
        }

        @media (max-width: 768px) {
          .about-hero {
            height: 400px;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }
        }

        @media (max-width: 480px) {
          .about-hero {
            height: 350px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("about-hero", AboutHero);
