// app/public/js/components/about/research-goals.js
import { LitElement, html } from "https://esm.run/lit";

class ResearchGoals extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <section class="research-goals-section">
        <div class="section-header">
          <h2 class="section-title">Research Goals</h2>
          <div class="section-divider"></div>
          <p class="section-subtitle">
            Exploring the intersection of traditional craftsmanship and digital
            technology
          </p>
        </div>

        <div class="goals-grid">
          <div class="goal-card">
            <div class="goal-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <h3 class="goal-title">Cultural Preservation</h3>
            <p class="goal-description">
              Documenting and digitally preserving traditional craft techniques
              and cultural knowledge that might otherwise be lost to time.
            </p>
          </div>

          <div class="goal-card">
            <div class="goal-icon">
              <i class="fas fa-brain"></i>
            </div>
            <h3 class="goal-title">AI Assistance</h3>
            <p class="goal-description">
              Investigating how AI can effectively communicate cultural context
              and craft knowledge to enhance user understanding and
              appreciation.
            </p>
          </div>

          <div class="goal-card">
            <div class="goal-icon">
              <i class="fas fa-palette"></i>
            </div>
            <h3 class="goal-title">UX Design</h3>
            <p class="goal-description">
              Exploring immersive interface design that evokes the sensory
              experience of traditional craft environments in a digital space.
            </p>
          </div>

          <div class="goal-card">
            <div class="goal-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <h3 class="goal-title">Economic Impact</h3>
            <p class="goal-description">
              Analyzing how digital marketplaces can create sustainable economic
              opportunities for artisans while maintaining cultural
              authenticity.
            </p>
          </div>
        </div>
      </section>

      <style>
        .research-goals-section {
          padding: 4rem 0;
          background-color: #32201c;
          margin: 5rem -20px;
          padding: 5rem 20px;
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

        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .goal-card {
          background-color: rgba(62, 39, 35, 0.6);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .goal-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
        }

        .goal-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background-color: #3e2723;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffd700;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
        }

        .goal-icon i {
          color: #ffd700;
          font-size: 1.8rem;
        }

        .goal-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 1rem;
        }

        .goal-description {
          color: #e0e0e0;
          line-height: 1.6;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 2rem;
          }

          .section-subtitle {
            font-size: 1.1rem;
          }

          .goals-grid {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          }
        }
      </style>
    `;
  }
}

customElements.define("research-goals", ResearchGoals);
