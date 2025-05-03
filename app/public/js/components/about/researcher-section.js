// app/public/js/components/about/researcher-section.js
import { LitElement, html } from "https://esm.run/lit";

class ResearcherSection extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <section class="researcher-section">
        <div class="section-header">
          <h2 class="section-title">The Researcher</h2>
          <div class="section-divider"></div>
        </div>

        <div class="researcher-profile">
          <div class="profile-image-container">
            <img
              src="/static/images/about/researcher.jpg"
              alt="Gimhan Ramanayake"
              class="profile-image"
            />
          </div>

          <div class="profile-content">
            <h3 class="researcher-name">Gimhan Ramanayake</h3>
            <p class="researcher-degree">BSc (Hons) Computer Science</p>
            <p class="researcher-university">
              Plymouth University, United Kingdom
            </p>
            <p class="researcher-details">
              Offered by NSBM Green University, Sri Lanka
            </p>

            <div class="researcher-bio">
              <p>
                As a computer science student with a passion for cultural
                heritage, Gimhan developed the Ceylon Handicrafts platform to
                explore how technology can help preserve and promote traditional
                Sri Lankan craftsmanship.
              </p>

              <p>
                This project merges technical innovation with cultural
                significance, combining modern web development frameworks,
                artificial intelligence, and immersive user experience design to
                create a prototype e-commerce platform specifically designed for
                handcrafted products.
              </p>

              <p>
                The research conducted through this platform contributes to the
                academic understanding of digital cultural preservation and
                ethically-designed e-commerce systems for traditional crafts.
              </p>
            </div>

            <div class="academic-details">
              <div class="academic-item">
                <span class="academic-label">Research Period:</span>
                <span class="academic-value">2024-2025</span>
              </div>

              <div class="academic-item">
                <span class="academic-label">Project Supervisor:</span>
                <span class="academic-value">Dr. [Supervisor Name]</span>
              </div>

              <div class="academic-item">
                <span class="academic-label">Focus Areas:</span>
                <span class="academic-value"
                  >Web Development, AI Integration, UX Design, Cultural
                  Preservation</span
                >
              </div>
            </div>

            <div class="contact-section">
              <a
                href="mailto:gimhan.ramanayake@students.plymouth.ac.uk"
                class="contact-link"
              >
                <i class="fas fa-envelope"></i> Academic Contact
              </a>
              <a
                href="https://github.com/gimhanr"
                class="contact-link"
                target="_blank"
              >
                <i class="fab fa-github"></i> GitHub
              </a>
              <a
                href="https://linkedin.com/in/gimhanr"
                class="contact-link"
                target="_blank"
              >
                <i class="fab fa-linkedin-in"></i> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>
        .researcher-section {
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

        .researcher-profile {
          display: flex;
          gap: 3rem;
          align-items: flex-start;
          background-color: rgba(62, 39, 35, 0.4);
          border-radius: 12px;
          padding: 3rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .profile-image-container {
          flex: 0 0 250px;
        }

        .profile-image {
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 215, 0, 0.3);
        }

        .profile-content {
          flex: 1;
        }

        .researcher-name {
          font-size: 1.8rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
        }

        .researcher-degree {
          font-size: 1.2rem;
          color: #ffd700;
          margin: 0 0 0.3rem 0;
          font-weight: 500;
        }

        .researcher-university {
          font-size: 1.1rem;
          color: #ffffff;
          margin: 0 0 0.2rem 0;
        }

        .researcher-details {
          font-size: 1rem;
          color: #e0e0e0;
          margin: 0 0 1.5rem 0;
        }

        .researcher-bio {
          margin-bottom: 2rem;
        }

        .researcher-bio p {
          font-size: 1.05rem;
          line-height: 1.7;
          margin-bottom: 1rem;
          color: #e0e0e0;
        }

        .academic-details {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .academic-item {
          margin-bottom: 0.8rem;
          display: flex;
          flex-wrap: wrap;
        }

        .academic-item:last-child {
          margin-bottom: 0;
        }

        .academic-label {
          font-weight: 600;
          color: #ffffff;
          width: 150px;
          flex: 0 0 150px;
        }

        .academic-value {
          flex: 1;
          color: #e0e0e0;
        }

        .contact-section {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .contact-link {
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 0.6rem 1.2rem;
          border-radius: 50px;
          text-decoration: none;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        .contact-link:hover {
          background-color: #ffd700;
          color: #3e2723;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .contact-link i {
          margin-right: 0.5rem;
        }

        @media (max-width: 992px) {
          .researcher-profile {
            flex-direction: column;
            padding: 2rem;
          }

          .profile-image-container {
            flex: 0 0 auto;
            width: 200px;
            margin: 0 auto 2rem;
          }
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 2rem;
          }

          .researcher-name {
            font-size: 1.6rem;
          }

          .researcher-bio p {
            font-size: 1rem;
          }

          .academic-item {
            flex-direction: column;
          }

          .academic-label {
            width: 100%;
            margin-bottom: 0.3rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("researcher-section", ResearcherSection);
