// app/public/js/components/about/acknowledgements-section.js
import { LitElement, html } from "https://esm.run/lit";

class AcknowledgementsSection extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <section class="acknowledgements-section">
        <div class="section-header">
          <h2 class="section-title">Acknowledgements</h2>
          <div class="section-divider"></div>
        </div>

        <div class="acknowledgements-content">
          <p class="acknowledgements-intro">
            This research project would not have been possible without the
            support and contributions of many individuals and organizations.
          </p>

          <div class="acknowledgements-list">
            <div class="acknowledgement-item">
              <h3 class="acknowledgement-title">Academic Supervision</h3>
              <p class="acknowledgement-details">
                Sincere gratitude to the faculty members of Plymouth University
                and NSBM Green University for their guidance and expertise
                throughout this research journey.
              </p>
            </div>

            <div class="acknowledgement-item">
              <h3 class="acknowledgement-title">Artisan Contributors</h3>
              <p class="acknowledgement-details">
                Special thanks to the artisans from various regions of Sri Lanka
                who shared their craft knowledge, techniques, and cultural
                insights that form the foundation of this project.
              </p>
            </div>

            <div class="acknowledgement-item">
              <h3 class="acknowledgement-title">Technical Resources</h3>
              <p class="acknowledgement-details">
                Appreciation for the open-source community and technical
                resources that made the development of this platform possible.
              </p>
            </div>

            <div class="acknowledgement-item">
              <h3 class="acknowledgement-title">Cultural Institutions</h3>
              <p class="acknowledgement-details">
                Gratitude to the cultural institutions and museums that provided
                valuable information about Sri Lankan craft heritage and
                traditions.
              </p>
            </div>
          </div>

          <div class="research-note">
            <p>
              This research project is conducted in accordance with the academic
              guidelines of Plymouth University. All content on this platform is
              for educational and research purposes only.
            </p>
          </div>
        </div>
      </section>

      <style>
        .acknowledgements-section {
          padding: 4rem 0 6rem;
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

        .acknowledgements-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .acknowledgements-intro {
          font-size: 1.2rem;
          text-align: center;
          margin-bottom: 3rem;
          color: #e0e0e0;
          line-height: 1.6;
        }

        .acknowledgements-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .acknowledgement-item {
          background-color: rgba(62, 39, 35, 0.4);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .acknowledgement-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #ffd700;
          margin-bottom: 0.8rem;
        }

        .acknowledgement-details {
          font-size: 1rem;
          line-height: 1.6;
          color: #e0e0e0;
        }

        .research-note {
          text-align: center;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 3rem;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 2rem;
          }

          .acknowledgements-intro {
            font-size: 1.1rem;
          }

          .acknowledgements-list {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }
}

customElements.define("acknowledgements-section", AcknowledgementsSection);
