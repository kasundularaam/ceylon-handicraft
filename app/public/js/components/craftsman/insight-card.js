// File: app/public/js/components/craftsman/insight-card.js
import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class InsightCard extends LitElement {
  static get properties() {
    return {
      type: { type: String },
      value: { type: String },
      loading: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.type = "";
    this.value = "0";
    this.loading = true;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadData();
  }

  async loadData() {
    try {
      const data = await fetchJson(`/api/craftsman/insights/${this.type}`);
      this.value = data.value;
      this.loading = false;
    } catch (error) {
      console.error(`Error loading ${this.type} data:`, error);
      this.loading = false;
    }
  }

  getIcon() {
    switch (this.type) {
      case "earnings":
        return "fa-coins";
      case "orders":
        return "fa-shopping-bag";
      case "products":
        return "fa-boxes";
      case "ratings":
        return "fa-star";
      default:
        return "fa-chart-bar";
    }
  }

  getTitle() {
    switch (this.type) {
      case "earnings":
        return "Total Earnings";
      case "orders":
        return "Total Orders";
      case "products":
        return "Total Products";
      case "ratings":
        return "Average Rating";
      default:
        return "Insight";
    }
  }

  formatValue() {
    if (this.loading) return "...";

    switch (this.type) {
      case "earnings":
        return `Rs ${this.value}`;
      case "ratings":
        return `${this.value} ★`;
      default:
        return this.value;
    }
  }

  render() {
    return html`
      <div class="insight-card ${this.type}">
        <div class="card-icon">
          <i class="fas ${this.getIcon()}"></i>
        </div>
        <div class="card-content">
          <h3 class="card-title">${this.getTitle()}</h3>
          <p class="card-value">${this.formatValue()}</p>
        </div>
      </div>

      <style>
        .insight-card {
          background-color: #5d4037; /* Secondary brown */
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .insight-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: rgba(
            255,
            215,
            0,
            0.2
          ); /* Accent yellow with opacity */
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .card-icon i {
          font-size: 1.5rem;
          color: #ffd700; /* Accent yellow */
        }

        .card-content {
          flex-grow: 1;
        }

        .card-title {
          color: #e0e0e0; /* Subtle grey */
          margin: 0 0 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .card-value {
          color: #ffffff; /* Text white */
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        /* Card type-specific colors */
        .insight-card.earnings .card-icon {
          background-color: rgba(39, 174, 96, 0.2);
        }

        .insight-card.earnings .card-icon i {
          color: #27ae60;
        }

        .insight-card.orders .card-icon {
          background-color: rgba(52, 152, 219, 0.2);
        }

        .insight-card.orders .card-icon i {
          color: #3498db;
        }

        .insight-card.products .card-icon {
          background-color: rgba(155, 89, 182, 0.2);
        }

        .insight-card.products .card-icon i {
          color: #9b59b6;
        }

        .insight-card.ratings .card-icon {
          background-color: rgba(241, 196, 15, 0.2);
        }

        .insight-card.ratings .card-icon i {
          color: #f1c40f;
        }
      </style>
    `;
  }
}

customElements.define("insight-card", InsightCard);
