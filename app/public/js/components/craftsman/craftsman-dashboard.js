import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "/static/js/utils/api_utils.js";

class CraftsmanDashboard extends LitElement {
  static get properties() {
    return {
      totalCompletedSales: { type: Number },
      totalPendingSales: { type: Number },
      totalProducts: { type: Number },
      deliveredOrdersCount: { type: Number },
      pendingOrdersCount: { type: Number },
      weeklySalesData: { type: Object },
      ordersByStatus: { type: Array },
      recentOrders: { type: Array },
      loading: { type: Boolean },
      showPendingSales: { type: Boolean },
      dataLoaded: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.totalCompletedSales = 0;
    this.totalPendingSales = 0;
    this.totalProducts = 0;
    this.deliveredOrdersCount = 0;
    this.pendingOrdersCount = 0;
    this.weeklySalesData = null;
    this.ordersByStatus = [];
    this.recentOrders = [];
    this.loading = true;
    this.showPendingSales = false;
    this.dataLoaded = false;
    this.salesChart = null;
    this.statusChart = null;
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
    if (this.salesChart) {
      this.salesChart.destroy();
    }
    if (this.statusChart) {
      this.statusChart.destroy();
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    // Only try to render charts after loading is complete and data is available
    if (changedProperties.has("loading") && !this.loading && this.dataLoaded) {
      // Use setTimeout to ensure the DOM has been updated
      setTimeout(() => {
        this.renderCharts();
      }, 100);
    }
  }

  renderCharts() {
    console.log("Rendering charts");
    this.renderSalesChart();
    this.renderStatusChart();
  }

  async loadData() {
    try {
      // Load all data in parallel
      const [
        dashboardData,
        weeklySalesData,
        orderStatusData,
        recentOrdersData,
      ] = await Promise.all([
        fetchJson("/api/craftsman/dashboard"),
        fetchJson("/api/craftsman/weekly-sales"),
        fetchJson("/api/craftsman/orders-by-status"),
        fetchJson("/api/craftsman/recent-orders"),
      ]);

      // Update component properties with fetched data
      this.totalCompletedSales = dashboardData.totalCompletedSales;
      this.totalPendingSales = dashboardData.totalPendingSales;
      this.totalProducts = dashboardData.totalProducts;
      this.deliveredOrdersCount = dashboardData.deliveredOrdersCount;
      this.pendingOrdersCount = dashboardData.pendingOrdersCount;

      this.weeklySalesData = weeklySalesData;
      this.ordersByStatus = orderStatusData.ordersByStatus;
      this.recentOrders = recentOrdersData.recentOrders;

      // Mark data as loaded and loading as complete
      this.dataLoaded = true;
      this.loading = false;

      // Charts will be rendered by the updated() lifecycle method
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      this.loading = false;
    }
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  getStatusColor(status) {
    const statusColors = {
      Initiated: "#9e9e9e",
      Paid: "#2196f3",
      Accepted: "#ff9800",
      Denied: "#f44336",
      Departed: "#9c27b0",
      Delivered: "#4caf50",
      DeliverFailed: "#e91e63",
    };
    return statusColors[status] || "#9e9e9e";
  }

  togglePendingSales() {
    this.showPendingSales = !this.showPendingSales;

    if (this.salesChart) {
      this.salesChart.destroy();
      this.salesChart = null;
    }

    this.renderSalesChart();
  }

  renderSalesChart() {
    if (!this.weeklySalesData) {
      console.log("No weekly sales data available");
      return;
    }

    const ctx = this.querySelector("#weeklySalesChart");
    if (!ctx) {
      console.error("Sales chart canvas element not found");
      return;
    }

    console.log("Rendering sales chart with data:", this.weeklySalesData);

    const datasets = [
      {
        label: "Completed Sales",
        data: this.weeklySalesData.completedSales,
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        borderColor: "#4CAF50",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#4CAF50",
        pointBorderColor: "#3E2723",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ];

    if (this.showPendingSales) {
      datasets.push({
        label: "Pending Sales",
        data: this.weeklySalesData.pendingSales,
        backgroundColor: "rgba(255, 152, 0, 0.2)",
        borderColor: "#FF9800",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#FF9800",
        pointBorderColor: "#3E2723",
        pointRadius: 4,
        pointHoverRadius: 6,
      });
    }

    this.salesChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: this.weeklySalesData.labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: this.showPendingSales,
            position: "top",
            labels: {
              color: "#E0E0E0",
              font: {
                family: "Poppins, sans-serif",
              },
            },
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
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${this.formatCurrency(
                  context.raw
                )}`;
              },
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
              callback: (value) => {
                return this.formatCurrency(value);
              },
            },
            beginAtZero: true,
          },
        },
      },
    });

    console.log("Sales chart created:", this.salesChart);
  }

  renderStatusChart() {
    if (!this.ordersByStatus || this.ordersByStatus.length === 0) {
      console.log("No order status data available");
      return;
    }

    const ctx = this.querySelector("#orderStatusChart");
    if (!ctx) {
      console.error("Status chart canvas element not found");
      return;
    }

    console.log("Rendering status chart with data:", this.ordersByStatus);

    const labels = [];
    const data = [];
    const backgroundColor = [];

    this.ordersByStatus.forEach((item) => {
      if (item.count > 0) {
        // Only include statuses with orders
        labels.push(item.status);
        data.push(item.count);
        backgroundColor.push(this.getStatusColor(item.status));
      }
    });

    // If no status has any orders, show a placeholder
    if (data.length === 0) {
      labels.push("No Orders");
      data.push(1);
      backgroundColor.push("#9e9e9e");
    }

    this.statusChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColor,
            borderColor: "#3E2723",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "#E0E0E0",
              font: {
                family: "Poppins, sans-serif",
              },
              padding: 20,
            },
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
      },
    });

    console.log("Status chart created:", this.statusChart);
  }

  render() {
    if (this.loading) {
      return html`
        <div class="dashboard-loading">
          <div class="loading-spinner">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
        </div>
      `;
    }

    return html`
      <div class="craftsman-dashboard">
        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-icon completed">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="card-content">
              <h3>Completed Sales</h3>
              <p class="card-value">
                ${this.formatCurrency(this.totalCompletedSales)}
              </p>
              <p class="card-subtitle">
                ${this.deliveredOrdersCount} orders delivered
              </p>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon pending">
              <i class="fas fa-clock"></i>
            </div>
            <div class="card-content">
              <h3>Pending Sales</h3>
              <p class="card-value">
                ${this.formatCurrency(this.totalPendingSales)}
              </p>
              <p class="card-subtitle">
                ${this.pendingOrdersCount} orders in progress
              </p>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon products">
              <i class="fas fa-box"></i>
            </div>
            <div class="card-content">
              <h3>Products</h3>
              <p class="card-value">${this.totalProducts}</p>
              <p class="card-subtitle">Active products</p>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <!-- Weekly Sales Chart -->
          <div class="chart-container sales-chart">
            <div class="chart-header">
              <h3>Weekly Sales Overview</h3>
              <button
                class="toggle-pending ${this.showPendingSales ? "active" : ""}"
                @click="${this.togglePendingSales}"
              >
                ${this.showPendingSales ? "Hide" : "Show"} Pending Sales
              </button>
            </div>
            <div class="chart-body">
              <canvas id="weeklySalesChart" height="250"></canvas>
            </div>
          </div>

          <!-- Orders by Status Chart -->
          <div class="chart-container status-chart">
            <div class="chart-header">
              <h3>Orders by Status</h3>
            </div>
            <div class="chart-body">
              <canvas id="orderStatusChart" height="250"></canvas>
            </div>
          </div>
        </div>

        <!-- Recent Orders Section -->
        <div class="recent-orders-section">
          <div class="section-header">
            <h3>Recent Orders</h3>
          </div>

          ${this.recentOrders.length === 0
            ? html`<div class="no-orders">No recent orders found</div>`
            : html`
                <div class="orders-table-container">
                  <table class="orders-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Buyer</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this.recentOrders.map(
                        (order) => html`
                          <tr>
                            <td class="product-name">${order.product}</td>
                            <td>${order.buyer}</td>
                            <td>
                              <span
                                class="status-pill"
                                style="background-color: ${this.getStatusColor(
                                  order.status
                                )}"
                              >
                                ${order.status}
                              </span>
                            </td>
                            <td>${this.formatCurrency(order.amount)}</td>
                            <td>${order.date}</td>
                          </tr>
                        `
                      )}
                    </tbody>
                  </table>
                </div>
              `}
        </div>
      </div>

      <style>
        .craftsman-dashboard {
          padding: 1.5rem;
        }

        .dashboard-loading {
          min-height: 400px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loading-spinner {
          font-size: 2.5rem;
          color: #ffd700;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        .summary-card:hover {
          transform: translateY(-5px);
        }

        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.75rem;
        }

        .card-icon.completed {
          background-color: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .card-icon.pending {
          background-color: rgba(255, 152, 0, 0.2);
          color: #ff9800;
        }

        .card-icon.products {
          background-color: rgba(33, 150, 243, 0.2);
          color: #2196f3;
        }

        .card-content {
          flex-grow: 1;
        }

        .card-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: #e0e0e0;
        }

        .card-value {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
        }

        .card-subtitle {
          margin: 0.25rem 0 0 0;
          font-size: 0.85rem;
          color: #bdbdbd;
        }

        .charts-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-container {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .chart-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #e0e0e0;
        }

        .toggle-pending {
          background-color: #3e2723;
          color: #e0e0e0;
          border: 1px solid #ffd700;
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-pending:hover {
          background-color: #4e3733;
        }

        .toggle-pending.active {
          background-color: #ffd700;
          color: #3e2723;
        }

        .chart-body {
          position: relative;
          height: 250px;
        }

        .recent-orders-section {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }

        .section-header {
          margin-bottom: 1.25rem;
        }

        .section-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #e0e0e0;
        }

        .no-orders {
          text-align: center;
          padding: 2rem;
          color: #bdbdbd;
          font-style: italic;
        }

        .orders-table-container {
          overflow-x: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
        }

        .orders-table th {
          text-align: left;
          padding: 1rem;
          color: #ffd700;
          border-bottom: 1px solid rgba(255, 215, 0, 0.3);
          font-weight: 500;
        }

        .orders-table td {
          padding: 1rem;
          color: #e0e0e0;
          border-bottom: 1px solid rgba(224, 224, 224, 0.1);
        }

        .product-name {
          font-weight: 500;
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-pill {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          color: #ffffff;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .charts-section {
            grid-template-columns: 1fr;
          }

          .chart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .orders-table {
            font-size: 0.85rem;
          }

          .orders-table th,
          .orders-table td {
            padding: 0.75rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("craftsman-dashboard", CraftsmanDashboard);
