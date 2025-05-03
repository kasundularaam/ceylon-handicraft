// app/public/js/components/about/project-overview.js
import { LitElement, html } from "https://esm.run/lit";

class ProjectOverview extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <section class="project-overview-section">
        <div class="section-header">
          <h2 class="section-title">Project Overview</h2>
          <div class="section-divider"></div>
        </div>

        <div class="overview-content">
          <div class="overview-image-container">
            <img
              src="/static/images/about/project-overview.jpg"
              alt="Sri Lankan handicrafts"
              class="overview-image"
            />
          </div>

          <div class="overview-text">
            <p>
              Ceylon Handicrafts is an academic research project exploring the
              intersection of traditional craftsmanship and modern e-commerce
              technology. The platform aims to document, preserve, and promote
              Sri Lanka's rich heritage of handcrafted arts by creating an
              immersive digital marketplace experience.
            </p>

            <p>
              This project was developed as part of a BSc (Hons) Computer
              Science degree program at Plymouth University (UK), offered
              through NSBM Green University Sri Lanka. The research spans
              2024-2025 and investigates how technology can help preserve
              cultural heritage while creating sustainable economic
              opportunities for traditional artisans.
            </p>

            <p>
              The platform features an innovative AI assistant named Vishva that
              provides cultural context and educational information about Sri
              Lankan crafts. By combining traditional knowledge with modern
              technology, Ceylon Handicrafts demonstrates how digital platforms
              can help bridge generational gaps in craft knowledge and connect
              artisans with global audiences.
            </p>

            <p>
              This prototype serves as both a functional marketplace and a
              research tool for exploring user interactions with cultural
              products in a digital environment.
            </p>
          </div>
        </div>
      </section>

      <style>
        .project-overview-section {
          padding: 4rem 0;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
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
          margin: 0 auto;
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
        }

        .overview-content {
          display: flex;
          gap: 3rem;
          align-items: center;
        }

        .overview-image-container {
          flex: 1;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .overview-image {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.5s ease;
        }

        .overview-image-container:hover .overview-image {
          transform: scale(1.03);
        }

        .overview-text {
          flex: 1;
        }

        .overview-text p {
          font-size: 1.1rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          color: #e0e0e0;
        }

        .overview-text p:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .overview-content {
            flex-direction: column;
          }

          .section-title {
            font-size: 2rem;
          }

          .overview-image-container {
            margin-bottom: 2rem;
          }

          .overview-text p {
            font-size: 1rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("project-overview", ProjectOverview);
