// app/public/js/components/about/impact-section.js
import { LitElement, html } from "https://esm.run/lit";

class ImpactSection extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <section class="impact-section">
        <div class="section-header">
          <h2 class="section-title">Our Impact</h2>
          <div class="section-divider"></div>
          <p class="section-subtitle">
            Together with our community, we're making a difference
          </p>
        </div>

        <div class="impact-stats">
          <div class="stat-card">
            <div class="stat-value">200+</div>
            <div class="stat-divider"></div>
            <div class="stat-label">Artisans Supported</div>
          </div>

          <div class="stat-card">
            <div class="stat-value">25</div>
            <div class="stat-divider"></div>
            <div class="stat-label">Rural Communities</div>
          </div>

          <div class="stat-card">
            <div class="stat-value">12</div>
            <div class="stat-divider"></div>
            <div class="stat-label">Craft Techniques Preserved</div>
          </div>

          <div class="stat-card">
            <div class="stat-value">85%</div>
            <div class="stat-divider"></div>
            <div class="stat-label">Revenue to Artisans</div>
          </div>
        </div>

        <div class="testimonial-section">
          <div class="testimonial-container">
            <div class="testimonial-quote">
              <i class="fas fa-quote-left quote-icon"></i>
              <blockquote>
                Working with Ceylon Handicrafts has transformed my family's
                traditional mask carving business. Now our creations reach homes
                around the world, and the stories of our cultural heritage are
                shared far beyond our village.
              </blockquote>
              <div class="testimonial-author">
                <img
                  src="/static/images/about/artisan-1.jpg"
                  alt="Saman Kumara"
                  class="author-image"
                />
                <div class="author-details">
                  <div class="author-name">Saman Kumara</div>
                  <div class="author-info">
                    Traditional Mask Artisan, Ambalangoda
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="cta-container">
          <h3 class="cta-title">Join Our Mission</h3>
          <p class="cta-text">
            Support artisans, preserve traditions, and bring home a piece of Sri
            Lankan heritage.
          </p>
          <a href="/sale" class="cta-button">Explore Our Collections</a>
        </div>
      </section>

      <style>
        .impact-section {
          padding: 4rem 0 6rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
        }

        .section-divider {
          height: 3px;
          width: 60px;
          background-color: #ffd700;
          margin: 0.5rem auto 1.5rem;
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: #e0e0e0;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .impact-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-bottom: 5rem;
        }

        .stat-card {
          background-color: rgba(62, 39, 35, 0.4);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-value {
          font-size: 3rem;
          font-weight: 700;
          color: #ffd700;
          margin-bottom: 0.5rem;
        }

        .stat-divider {
          height: 2px;
          width: 40px;
          background-color: rgba(255, 255, 255, 0.2);
          margin: 0.5rem auto 1rem;
        }

        .stat-label {
          font-size: 1.1rem;
          color: #ffffff;
        }

        .testimonial-section {
          margin: 4rem 0;
        }

        .testimonial-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .testimonial-quote {
          background-color: rgba(62, 39, 35, 0.6);
          border-radius: 12px;
          padding: 3rem;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .quote-icon {
          position: absolute;
          top: 2rem;
          left: 2rem;
          font-size: 2rem;
          color: rgba(255, 215, 0, 0.3);
        }

        blockquote {
          font-size: 1.2rem;
          line-height: 1.8;
          color: #ffffff;
          margin: 0 0 2rem 0;
          padding-left: 2rem;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
        }

        .author-image {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 1rem;
          border: 2px solid #ffd700;
        }

        .author-name {
          font-weight: 600;
          color: #ffffff;
          font-size: 1.1rem;
          margin-bottom: 0.3rem;
        }

        .author-info {
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        .cta-container {
          text-align: center;
          margin-top: 5rem;
          background-color: rgba(62, 39, 35, 0.6);
          border-radius: 12px;
          padding: 3rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cta-title {
          font-size: 1.8rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 1rem;
        }

        .cta-text {
          font-size: 1.1rem;
          color: #e0e0e0;
          max-width: 600px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        .cta-button {
          display: inline-block;
          background-color: #ffd700;
          color: #3e2723;
          padding: 1rem 2.5rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          background-color: #ffea80;
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 2rem;
          }

          .section-subtitle {
            font-size: 1.1rem;
          }

          .testimonial-quote {
            padding: 2rem;
          }

          blockquote {
            font-size: 1.1rem;
            padding-left: 1rem;
          }

          .cta-container {
            padding: 2rem;
          }

          .cta-title {
            font-size: 1.6rem;
          }

          .cta-text {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .impact-stats {
            grid-template-columns: 1fr;
            max-width: 250px;
            margin: 0 auto 3rem;
          }

          .testimonial-quote {
            padding: 2rem 1.5rem;
          }

          blockquote {
            font-size: 1rem;
            padding-left: 0;
          }
        }
      </style>
    `;
  }
}

customElements.define("impact-section", ImpactSection);
