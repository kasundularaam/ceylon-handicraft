import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "/static/js/utils/api_utils.js";

class AdminSalesChart extends LitElement {
  static get properties() {
    return {
      days: { type: Number },
      salesData: { type: Array },
      loading: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.days = 5;
    this.salesData = [];
    this.loading = true;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    await this.fetchSalesData();
    this.renderChart();
  }

  async fetchSalesData() {
    try {
      this.salesData = await fetchJson(`/api/admin/sales?days=${this.days}`);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      this.loading = false;
    }
  }

  renderChart() {
    if (this.loading || !this.salesData.length) return;

    const canvas = this.querySelector("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Using Chart.js (assumed to be loaded via CDN in base.html)
    new Chart(ctx, {
      type: "line",
      data: {
        labels: this.salesData.map((item) => item.date),
        datasets: [
          {
            label: "Total Sales (LKR)",
            data: this.salesData.map((item) => item.total),
            borderColor: "#FFD700",
            backgroundColor: "rgba(255, 215, 0, 0.1)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#FFD700",
            pointBorderColor: "#3E2723",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#E0E0E0",
              callback: function (value) {
                return "LKR " + value.toLocaleString();
              },
            },
          },
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#E0E0E0",
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "#FFFFFF",
            },
          },
          tooltip: {
            backgroundColor: "#5D4037",
            titleColor: "#FFD700",
            bodyColor: "#FFFFFF",
            borderColor: "#FFD700",
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return "LKR " + context.raw.toLocaleString();
              },
            },
          },
        },
      },
    });
  }

  render() {
    return html`
      <div class="sales-chart-container">
        ${this.loading
          ? html`<div class="loading-spinner">
              <i class="fas fa-circle-notch fa-spin"></i>
            </div>`
          : this.salesData.length === 0
          ? html`<div class="no-data">
              No sales data available for the selected period
            </div>`
          : html`<canvas height="300"></canvas>`}
      </div>

      <style>
        .sales-chart-container {
          width: 100%;
          height: 300px;
          position: relative;
        }

        .loading-spinner,
        .no-data {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loading-spinner {
          font-size: 2rem;
          color: #ffd700;
        }

        .no-data {
          color: #e0e0e0;
          text-align: center;
        }
      </style>
    `;
  }
}

customElements.define("admin-sales-chart", AdminSalesChart);
