// File: app/public/js/components/craftsman/sales-chart.js
import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class SalesChart extends LitElement {
  static get properties() {
    return {
      loading: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.loading = true;
    this.chart = null;
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  async loadData() {
    try {
      const data = await fetchJson("/api/craftsman/sales/weekly");
      this.renderChart(data);
      this.loading = false;
    } catch (error) {
      console.error("Error loading sales data:", error);
      this.loading = false;
    }
  }

  renderChart(data) {
    const ctx = this.querySelector("#salesChart");
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Sales (Rs)",
            data: data.values,
            backgroundColor: "rgba(255, 215, 0, 0.2)",
            borderColor: "#FFD700",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#FFD700",
            pointBorderColor: "#3E2723",
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#3E2723",
            titleColor: "#FFD700",
            bodyColor: "#FFFFFF",
            bodyFont: {
              family: "Poppins, sans-serif",
            },
            titleFont: {
              family: "Poppins, sans-serif",
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#E0E0E0",
              font: {
                family: "Poppins, sans-serif",
              },
            },
          },
          y: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#E0E0E0",
              font: {
                family: "Poppins, sans-serif",
              },
              callback: function (value) {
                return "Rs " + value;
              },
            },
            beginAtZero: true,
          },
        },
      },
    });
  }

  render() {
    return html`
      <div class="chart-wrapper">
        ${this.loading
          ? html`<div class="loading-indicator">
              <i class="fas fa-spinner fa-spin"></i> Loading sales data...
            </div>`
          : html`<canvas id="salesChart"></canvas>`}
      </div>

      <style>
        .chart-wrapper {
          width: 100%;
          height: 300px;
          position: relative;
        }

        .loading-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #e0e0e0;
          text-align: center;
        }

        .loading-indicator i {
          margin-right: 8px;
          color: #ffd700;
        }

        canvas {
          width: 100% !important;
          height: 100% !important;
        }
      </style>
    `;
  }
}

customElements.define("sales-chart", SalesChart);
