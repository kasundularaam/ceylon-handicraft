import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "/static/js/utils/api_utils.js";

class AdminRecentOrders extends LitElement {
  static get properties() {
    return {
      limit: { type: Number },
      orders: { type: Array },
      loading: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.limit = 10;
    this.orders = [];
    this.loading = true;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    await this.fetchRecentOrders();
  }

  async fetchRecentOrders() {
    try {
      this.orders = await fetchJson(
        `/api/admin/orders/recent?limit=${this.limit}`
      );
    } catch (error) {
      console.error("Error fetching recent orders:", error);
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

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getStatusClass(status) {
    switch (status) {
      case "PENDING":
        return "pending";
      case "ACCEPTED":
        return "accepted";
      case "DEPARTED":
        return "departed";
      case "DELIVERED":
        return "delivered";
      case "DENIED":
      case "DELIVER_FAILED":
        return "failed";
      default:
        return "";
    }
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading-spinner">
          <i class="fas fa-circle-notch fa-spin"></i>
        </div>
      `;
    }

    if (this.orders.length === 0) {
      return html`<div class="no-orders">No recent orders found</div>`;
    }

    return html`
      <div class="orders-table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th>Buyer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.orders.map(
              (order) => html`
                <tr>
                  <td class="order-id">${order.id.substring(0, 8)}...</td>
                  <td class="product-name">${order.product.title}</td>
                  <td class="buyer-name">${order.user.name}</td>
                  <td class="order-date">
                    ${this.formatDate(order.created_at)}
                  </td>
                  <td class="order-amount">
                    ${this.formatCurrency(order.unit_price * order.quantity)}
                  </td>
                  <td>
                    <span
                      class="status-badge ${this.getStatusClass(order.status)}"
                    >
                      ${order.status}
                    </span>
                  </td>
                  <td class="actions">
                    <button
                      class="view-btn"
                      @click=${() => this.viewOrderDetails(order.id)}
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>

      <style>
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          font-size: 2rem;
          color: #ffd700;
        }

        .no-orders {
          text-align: center;
          padding: 2rem;
          color: #e0e0e0;
        }

        .orders-table-container {
          overflow-x: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .orders-table th {
          background-color: #3e2723;
          padding: 1rem;
          color: #ffd700;
          font-weight: 600;
        }

        .orders-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .orders-table tr:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .order-id {
          font-family: monospace;
          font-size: 0.9rem;
        }

        .product-name,
        .buyer-name {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .order-amount {
          font-weight: 600;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
          text-align: center;
        }

        .status-badge.pending {
          background-color: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }

        .status-badge.accepted {
          background-color: rgba(33, 150, 243, 0.2);
          color: #2196f3;
        }

        .status-badge.departed {
          background-color: rgba(156, 39, 176, 0.2);
          color: #9c27b0;
        }

        .status-badge.delivered {
          background-color: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .status-badge.failed {
          background-color: rgba(244, 67, 54, 0.2);
          color: #f44336;
        }

        .actions {
          text-align: center;
        }

        .view-btn {
          background-color: transparent;
          border: none;
          color: #ffd700;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .view-btn:hover {
          background-color: rgba(255, 215, 0, 0.1);
        }
      </style>
    `;
  }

  viewOrderDetails(orderId) {
    window.location.href = `/admin/orders/${orderId}`;
  }
}

customElements.define("admin-recent-orders", AdminRecentOrders);
