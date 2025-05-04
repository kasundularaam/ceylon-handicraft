import { LitElement, html } from "https://esm.run/lit";

class AuctionTimer extends LitElement {
  static get properties() {
    return {
      endTime: { type: Object },
      timeLeft: { type: Object },
      auctionEnded: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.endTime = null;
    this.timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    this.auctionEnded = false;
    this.timerInterval = null;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.startTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopTimer();
  }

  updated(changedProperties) {
    if (changedProperties.has("endTime") && this.endTime) {
      this.stopTimer();
      this.startTimer();
    }
  }

  startTimer() {
    if (!this.endTime) return;

    this.updateTimeLeft();

    this.timerInterval = setInterval(() => {
      this.updateTimeLeft();

      // Check if auction has ended
      if (this.timeLeft.total <= 0) {
        this.auctionEnded = true;
        this.stopTimer();

        // Dispatch event when auction ends
        this.dispatchEvent(
          new CustomEvent("auction-ended", {
            detail: { endTime: this.endTime },
            bubbles: true,
            composed: true,
          })
        );
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimeLeft() {
    if (!this.endTime) return;

    const now = new Date();
    const endTime = new Date(this.endTime);
    const total = endTime - now;

    if (total <= 0) {
      this.timeLeft = { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
      this.auctionEnded = true;
      return;
    }

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((total % (1000 * 60)) / 1000);

    this.timeLeft = { total, days, hours, minutes, seconds };
    this.auctionEnded = false;
  }

  render() {
    if (!this.endTime) {
      return html`
        <div class="auction-timer-loading">Loading auction time...</div>

        <style>
          .auction-timer-loading {
            background-color: #5d4037;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
            color: #e0e0e0;
          }
        </style>
      `;
    }

    if (this.auctionEnded) {
      return html`
        <div class="auction-timer auction-ended">
          <div class="timer-icon">
            <i class="fas fa-hourglass-end"></i>
          </div>
          <div class="timer-text">Auction has ended</div>
        </div>

        <style>
          .auction-timer {
            background-color: #5d4037;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1.5rem;
          }

          .auction-ended {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .timer-icon {
            font-size: 1.5rem;
            color: #ffd700;
            margin-bottom: 0.5rem;
          }

          .timer-text {
            font-weight: 600;
            color: #e0e0e0;
          }
        </style>
      `;
    }

    return html`
      <div class="auction-timer">
        <div class="timer-header">Time Remaining:</div>
        <div class="timer-units">
          <div class="timer-unit">
            <div class="timer-value">${this.timeLeft.days}</div>
            <div class="timer-label">Days</div>
          </div>
          <div class="timer-unit">
            <div class="timer-value">${this.timeLeft.hours}</div>
            <div class="timer-label">Hours</div>
          </div>
          <div class="timer-unit">
            <div class="timer-value">${this.timeLeft.minutes}</div>
            <div class="timer-label">Min</div>
          </div>
          <div class="timer-unit">
            <div class="timer-value">${this.timeLeft.seconds}</div>
            <div class="timer-label">Sec</div>
          </div>
        </div>
      </div>

      <style>
        .auction-timer {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .timer-header {
          font-weight: 500;
          margin-bottom: 0.75rem;
          color: #ffffff;
        }

        .timer-units {
          display: flex;
          justify-content: space-around;
        }

        .timer-unit {
          text-align: center;
          min-width: 60px;
        }

        .timer-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffd700;
        }

        .timer-label {
          font-size: 0.75rem;
          color: #e0e0e0;
        }
      </style>
    `;
  }
}

customElements.define("auction-timer", AuctionTimer);
