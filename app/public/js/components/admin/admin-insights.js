import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "/static/js/utils/api_utils.js";

class AdminInsights extends LitElement {
  static get properties() {
    return {
      totalSales: { type: Number },
      totalProducts: { type: Number },
      totalCraftsmen: { type: Number },
      totalBuyers: { type: Number },
      loading: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.totalSales = 0;
    this.totalProducts = 0;
    this.totalCraftsmen = 0;
    this.totalBuyers = 0;
    this.loading = true;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    await this.fetchInsightData();
  }

  async fetchInsightData() {
    try {
      const data = await fetchJson("/api/admin/insights");
      this.totalSales = data.totalSales;
      this.totalProducts = data.totalProducts;
      this.totalCraftsmen = data.totalCraftsmen;
      this.totalBuyers = data.totalBuyers;
    } catch (error) {
      console.error("Error fetching insight data:", error);
    } finally {
      this.loading = false;
    }
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  }

  render() {
    if (this.loading) {
      return html`
        <div class="insights-grid loading">
          <div class="loading-spinner">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
        </div>
      `;
    }

    return html`
      <div class="insights-grid">
        <div class="insight-card">
          <div class="insight-icon sales">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="insight-content">
            <h3>Total Sales</h3>
            <p class="insight-value">${this.formatCurrency(this.totalSales)}</p>
          </div>
        </div>

        <div class="insight-card">
          <div class="insight-icon products">
            <i class="fas fa-box"></i>
          </div>
          <div class="insight-content">
            <h3>Total Products</h3>
            <p class="insight-value">${this.totalProducts}</p>
          </div>
        </div>

        <div class="insight-card">
          <div class="insight-icon craftsmen">
            <i class="fas fa-hammer"></i>
          </div>
          <div class="insight-content">
            <h3>Total Craftsmen</h3>
            <p class="insight-value">${this.totalCraftsmen}</p>
          </div>
        </div>

        <div class="insight-card">
          <div class="insight-icon buyers">
            <i class="fas fa-user"></i>
          </div>
          <div class="insight-content">
            <h3>Total Buyers</h3>
            <p class="insight-value">${this.totalBuyers}</p>
          </div>
        </div>
      </div>

      <style>
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .insights-grid.loading {
          min-height: 150px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loading-spinner {
          font-size: 2rem;
          color: #ffd700;
        }

        .insight-card {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        .insight-card:hover {
          transform: translateY(-5px);
        }

        .insight-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.5rem;
        }

        .insight-icon.sales {
          background-color: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .insight-icon.products {
          background-color: rgba(33, 150, 243, 0.2);
          color: #2196f3;
        }

        .insight-icon.craftsmen {
          background-color: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }

        .insight-icon.buyers {
          background-color: rgba(233, 30, 99, 0.2);
          color: #e91e63;
        }

        .insight-content {
          flex-grow: 1;
        }

        .insight-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: #e0e0e0;
        }

        .insight-value {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
        }
      </style>
    `;
  }
}

customElements.define("admin-insights", AdminInsights);
