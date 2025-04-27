import { LitElement, html } from "https://esm.run/lit";

class VishvaIntro extends LitElement {
  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    // Add intersection observer for animation
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.querySelector(".vishva-section").classList.add("visible");

          // Animate the image separately with a delay
          setTimeout(() => {
            this.querySelector(".vishva-image").classList.add("visible");
          }, 300);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(this);
  }

  render() {
    return html`
      <section class="section vishva-section">
        <div class="container vishva-container">
          <div class="vishva-content">
            <h2 class="section-title">
              Meet <span class="accent-text">Vishva</span>
            </h2>
            <p class="vishva-description">
              Vishva is your AI-powered cultural companion, offering deep
              insights into Ceylon's rich handicraft traditions.
            </p>
            <ul class="vishva-features">
              <li>
                <i class="fas fa-history"></i>
                <span
                  >Explore the history and cultural significance behind each
                  craft</span
                >
              </li>
              <li>
                <i class="fas fa-tools"></i>
                <span
                  >Learn about traditional techniques and materials used by
                  artisans</span
                >
              </li>
              <li>
                <i class="fas fa-map-marked-alt"></i>
                <span
                  >Discover regional crafting traditions across Sri Lanka</span
                >
              </li>
              <li>
                <i class="fas fa-gift"></i>
                <span
                  >Get personalized recommendations based on your
                  interests</span
                >
              </li>
            </ul>
            <a href="/vishva" class="vishva-button">
              Chat with Vishva
              <i class="fas fa-comment-dots"></i>
            </a>
          </div>

          <div class="vishva-image">
            <div class="vishva-avatar">
              <div class="vishva-avatar-glow"></div>
              <img
                src="/static/images/vishva-avatar.jpg"
                alt="Vishva AI Assistant"
              />
            </div>
            <div class="vishva-quote">
              "I'm Vishva, your guide to the rich cultural heritage of Ceylon
              handicrafts. How may I assist you today?"
            </div>
          </div>
        </div>
      </section>

      <style>
        .vishva-section {
          background-color: var(--secondary-brown);
          padding: 5rem 0;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .vishva-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .vishva-container {
          display: flex;
          align-items: center;
          gap: 3rem;
        }

        .vishva-content {
          flex: 1;
        }

        .vishva-description {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .vishva-features {
          list-style: none;
          padding: 0;
          margin-bottom: 2rem;
        }

        .vishva-features li {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.2rem;
          padding-left: 0.5rem;
        }

        .vishva-features i {
          color: var(--accent-yellow);
          font-size: 1.2rem;
          margin-top: 0.25rem;
        }

        .vishva-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background-color: var(--accent-yellow);
          color: var(--primary-dark-brown);
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .vishva-button:hover {
          background-color: #e6c200;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .vishva-image {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          opacity: 0;
          transform: translateX(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .vishva-image.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .vishva-avatar {
          position: relative;
          width: 200px;
          height: 200px;
          margin-bottom: 2rem;
        }

        .vishva-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid var(--accent-yellow);
          z-index: 2;
          position: relative;
        }

        .vishva-avatar-glow {
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 215, 0, 0.5) 0%,
            rgba(255, 215, 0, 0) 70%
          );
          animation: pulse 3s infinite;
          z-index: 1;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
        }

        .vishva-quote {
          background-color: var(--primary-dark-brown);
          padding: 1.5rem;
          border-radius: 10px;
          position: relative;
          max-width: 300px;
          text-align: center;
          font-style: italic;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          border-left: 3px solid var(--accent-yellow);
        }

        .vishva-quote::before {
          content: "";
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 15px 15px;
          border-style: solid;
          border-color: transparent transparent var(--primary-dark-brown);
        }

        /* Responsive adjustments */
        @media (max-width: 992px) {
          .vishva-container {
            flex-direction: column;
            text-align: center;
          }

          .vishva-features li {
            justify-content: center;
          }

          .vishva-image {
            margin-top: 2rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("vishva-intro", VishvaIntro);
