// app/public/js/components/landing/vishva-intro.js
import { LitElement, html } from "https://esm.run/lit";

class VishvaIntro extends LitElement {
  static get properties() {
    return {
      samplePrompts: { type: Array },
      currentPromptIndex: { type: Number },
      currentText: { type: String },
      isTyping: { type: Boolean },
      fullText: { type: String },
    };
  }

  constructor() {
    super();
    this.samplePrompts = [
      "Tell me about Sri Lankan masks",
      "What materials are used in Dumbara weaving?",
      "History of lacquerware in Ceylon",
      "Explain the significance of devil masks",
      "How are coconut shell crafts created?",
      "Traditional patterns in Batik textiles",
    ];
    this.currentPromptIndex = 0;
    this.currentText = "";
    this.fullText = this.samplePrompts[0];
    this.isTyping = true;
    this.typingSpeed = 70; // milliseconds per character
    this.typingPause = 3000; // pause between prompts
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    // Create stars once the component is connected
    setTimeout(() => this.createStars(), 100);
    // Set up meteoroid animation
    this.meteoroidInterval = setInterval(() => this.createMeteor(), 8000);
    // Start typing animation
    this.startTypingAnimation();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.meteoroidInterval);
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
  }

  startTypingAnimation() {
    const typeNextChar = () => {
      if (this.isTyping) {
        if (this.currentText.length < this.fullText.length) {
          // Still typing the current prompt
          this.currentText = this.fullText.substring(
            0,
            this.currentText.length + 1
          );
          this.typingTimeout = setTimeout(typeNextChar, this.typingSpeed);
        } else {
          // Finished typing, pause before erasing
          this.isTyping = false;
          this.typingTimeout = setTimeout(typeNextChar, this.typingPause);
        }
      } else {
        if (this.currentText.length > 0) {
          // Erasing the current prompt
          this.currentText = this.currentText.substring(
            0,
            this.currentText.length - 1
          );
          this.typingTimeout = setTimeout(typeNextChar, this.typingSpeed / 2);
        } else {
          // Move to the next prompt
          this.currentPromptIndex =
            (this.currentPromptIndex + 1) % this.samplePrompts.length;
          this.fullText = this.samplePrompts[this.currentPromptIndex];
          this.isTyping = true;
          this.typingTimeout = setTimeout(typeNextChar, this.typingSpeed);
        }
      }
      this.requestUpdate();
    };

    // Start the typing animation
    typeNextChar();
  }

  createStars() {
    const starsContainer = this.querySelector(".stars-container");
    if (!starsContainer) return;

    const containerWidth = starsContainer.offsetWidth;
    const containerHeight = starsContainer.offsetHeight;

    // Create 100 stars
    for (let i = 0; i < 100; i++) {
      const star = document.createElement("div");
      star.classList.add("star");

      // Random position
      const left = Math.random() * containerWidth;
      const top = Math.random() * containerHeight;

      // Random size (0.8px to 2.5px)
      const size = 0.8 + Math.random() * 1.7;

      // Random opacity (0.2 to 0.8)
      const opacity = 0.2 + Math.random() * 0.6;

      // Random animation delay
      const delay = Math.random() * 5;

      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${left}px`;
      star.style.top = `${top}px`;
      star.style.opacity = opacity;
      star.style.animationDelay = `${delay}s`;

      starsContainer.appendChild(star);
    }
  }

  createMeteor() {
    const starsContainer = this.querySelector(".stars-container");
    if (!starsContainer) return;

    const containerWidth = starsContainer.offsetWidth;
    const containerHeight = starsContainer.offsetHeight;

    const meteor = document.createElement("div");
    meteor.classList.add("meteor");

    // Random starting position (top-half left side)
    const startLeft = Math.random() * (containerWidth * 0.5);
    const startTop = Math.random() * (containerHeight * 0.5);

    // End at bottom-right
    const endLeft = startLeft + containerWidth * 0.6;
    const endTop = startTop + containerHeight * 0.6;

    meteor.style.left = `${startLeft}px`;
    meteor.style.top = `${startTop}px`;
    meteor.style.setProperty("--end-left", `${endLeft}px`);
    meteor.style.setProperty("--end-top", `${endTop}px`);

    starsContainer.appendChild(meteor);

    // Remove meteor after animation completes
    setTimeout(() => {
      meteor.remove();
    }, 1500);
  }

  render() {
    return html`
      <section class="vishva-intro-section">
        <div class="stars-container"></div>
        <div class="vishva-content">
          <div class="main-content-area">
            <div class="vishva-avatar-container">
              <img
                src="/static/images/vishva/avatar.jpg"
                alt="Vishva AI Assistant"
                class="vishva-avatar"
              />
              <div class="avatar-glow"></div>
            </div>

            <div class="vishva-text">
              <h2>Meet Vishva, Your Knowledgeable Guide</h2>
              <p>
                I am Vishva, your divine companion on this journey through
                Ceylon's rich handicraft heritage. With ancient wisdom and
                modern knowledge, I'm here to illuminate the stories,
                techniques, and cultural significance behind each treasured
                artisan creation.
              </p>
              <a href="/vishva/chats" class="vishva-cta">
                <span>Start a Conversation</span>
                <i class="fas fa-chevron-right"></i>
              </a>
            </div>
          </div>

          <!-- Typing prompt display -->
          <div class="prompt-display-container">
            <div class="prompt-display">
              <div class="prompt-icon">
                <i class="fas fa-comment-dots"></i>
              </div>
              <div class="prompt-text-container">
                <span class="prompt-text">${this.currentText}</span>
                <span class="cursor ${this.isTyping ? "blinking" : ""}">|</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>
        .vishva-intro-section {
          position: relative;
          width: 100vw;
          height: 850px; /* Increased height */
          margin: 4rem 0;
          margin-left: calc(-50vw + 50%);
          overflow: hidden;
          background-image: url("/static/images/vishva/intro-bg.jpg");
          background-size: cover;
          background-position: center;
        }

        /* Gradient fades to blend with background color - more gradual now */
        .vishva-intro-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
              to bottom,
              #3e2723 0%,
              rgba(0, 0, 0, 0) 10%,
              rgba(0, 0, 0, 0) 90%,
              #3e2723 100%
            ),
            linear-gradient(135deg, rgba(60, 0, 80, 0.7), rgba(40, 0, 60, 0.7));
          backdrop-filter: blur(2px);
          z-index: 1;
        }

        .stars-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
        }

        .star {
          position: absolute;
          background-color: #fff;
          border-radius: 50%;
          animation: twinkle 4s infinite ease-in-out;
        }

        .meteor {
          position: absolute;
          width: 2px;
          height: 2px;
          background-color: #fff;
          border-radius: 50%;
          box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8);
          animation: meteor 1.5s forwards linear;
          z-index: 2;
        }

        .meteor::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 60px;
          height: 1px;
          background: linear-gradient(
            to left,
            rgba(255, 255, 255, 0.8),
            transparent
          );
          transform: rotate(-45deg);
          transform-origin: right top;
        }

        .vishva-content {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          padding: 2rem;
          color: #fff;
          max-width: 1200px;
          margin: 0 auto;
        }

        .main-content-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-top: 5rem;
        }

        .vishva-avatar-container {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .vishva-avatar {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #ffd700;
          z-index: 2;
          position: relative;
        }

        .avatar-glow {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(110, 40, 130, 0.6) 0%,
            rgba(110, 40, 130, 0) 70%
          );
          animation: pulse 3s infinite ease-in-out;
          z-index: 1;
        }

        .vishva-text {
          max-width: 800px;
          margin-bottom: 2rem;
        }

        .vishva-text h2 {
          font-size: 2.2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          background: linear-gradient(to right, #ffd700, #b170d8);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .vishva-text p {
          font-size: 1.2rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .vishva-cta {
          display: inline-flex;
          align-items: center;
          background-color: #ffd700;
          color: #3e2723;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .vishva-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          background-color: #ffea80;
        }

        .vishva-cta i {
          margin-left: 8px;
          transition: transform 0.3s ease;
        }

        .vishva-cta:hover i {
          transform: translateX(4px);
        }

        /* New prompt display styles */
        .prompt-display-container {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-top: 2rem;
          margin-bottom: 5rem;
        }

        .prompt-display {
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          width: 80%;
          max-width: 800px;
          height: 80px;
          overflow: hidden;
          position: relative;
        }

        .prompt-display::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 16px;
          padding: 1.5px;
          background: linear-gradient(
            135deg,
            rgba(255, 215, 0, 0.5),
            rgba(110, 40, 130, 0.5)
          );
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask-composite: xor;
          pointer-events: none;
        }

        .prompt-icon {
          background-color: #6e2882;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .prompt-icon i {
          color: #ffd700;
          font-size: 1.2rem;
        }

        .prompt-text-container {
          flex-grow: 1;
          display: flex;
          align-items: center;
        }

        .prompt-text {
          font-size: 1.1rem;
          line-height: 1.5;
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .cursor {
          display: inline-block;
          margin-left: 2px;
          font-weight: 100;
          color: #ffd700;
        }

        .cursor.blinking {
          animation: blink 1s infinite step-end;
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes meteor {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(
              calc(var(--end-left) - left),
              calc(var(--end-top) - top)
            );
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        /* Responsive styles */
        @media (max-width: 992px) {
          .vishva-intro-section {
            height: 800px;
          }

          .vishva-text h2 {
            font-size: 1.8rem;
          }

          .vishva-text p {
            font-size: 1rem;
          }

          .prompt-display {
            width: 90%;
          }
        }

        @media (max-width: 768px) {
          .vishva-intro-section {
            height: 850px;
            margin: 2rem 0;
          }

          .vishva-avatar {
            width: 120px;
            height: 120px;
          }

          .vishva-text h2 {
            font-size: 1.6rem;
          }

          .prompt-text {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .vishva-intro-section {
            height: 800px;
          }

          .vishva-text h2 {
            font-size: 1.4rem;
          }

          .vishva-text p {
            font-size: 0.9rem;
          }

          .vishva-cta {
            padding: 0.8rem 1.5rem;
            font-size: 0.9rem;
          }

          .prompt-display {
            padding: 1rem;
            height: 70px;
          }

          .prompt-icon {
            width: 32px;
            height: 32px;
          }
        }
      </style>
    `;
  }
}

customElements.define("vishva-intro", VishvaIntro);
