import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";
import { getUser } from "../../utils/auth_utils.js";

class OrderList extends LitElement {
  static get properties() {
    return {
      orders: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
      statusFilter: { type: String },
    };
  }

  constructor() {
    super();
    this.orders = [];
    this.loading = true;
    this.error = null;
    this.statusFilter = ""; // Empty string means 'All'
    this.statuses = [
      { value: "", label: "All Orders" },
      { value: "PAID", label: "Paid" },
      { value: "ACCEPTED", label: "Accepted" },
      { value: "DENIED", label: "Denied" },
      { value: "DEPARTED", label: "Departed" },
      { value: "DELIVERED", label: "Delivered" },
      { value: "DELIVER_FAILED", label: "Delivery Failed" },
    ];
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchOrders();

    // Listen for order status updates
    window.addEventListener(
      "order-status-updated",
      this.handleOrderStatusUpdated.bind(this)
    );
  }

  disconnectedCallback() {
    window.removeEventListener(
      "order-status-updated",
      this.handleOrderStatusUpdated.bind(this)
    );
    super.disconnectedCallback();
  }

  async fetchOrders() {
    this.loading = true;
    this.error = null;

    try {
      let url = "/api/craftsman/orders";
      if (this.statusFilter) {
        url += `?status=${this.statusFilter}`;
      }

      this.orders = await fetchJson(url);

      // Sort orders by date (newest first)
      this.orders.sort((a, b) => {
        return new Date(b.updated_at) - new Date(a.updated_at);
      });
    } catch (err) {
      this.error = `Failed to load orders: ${err.message}`;
      console.error("Error fetching orders:", err);
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  // Handle status filter change
  handleStatusChange(e) {
    this.statusFilter = e.target.value;
    this.fetchOrders();
  }

  // Handle order status update event from child components
  handleOrderStatusUpdated(e) {
    const { orderId, newStatus } = e.detail;

    // Update the order in our local state
    const orderIndex = this.orders.findIndex((order) => order.id === orderId);
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = newStatus;
      this.requestUpdate();

      // If we're filtering and the order no longer matches the filter, refetch
      if (this.statusFilter && this.statusFilter !== newStatus) {
        this.fetchOrders();
      }
    }
  }

  renderStatusFilter() {
    return html`
      <div class="filter-container">
        <label for="status-filter">Filter by Status:</label>
        <select id="status-filter" @change=${this.handleStatusChange}>
          ${this.statuses.map(
            (status) => html`
              <option
                value="${status.value}"
                ?selected=${this.statusFilter === status.value}
              >
                ${status.label}
              </option>
            `
          )}
        </select>
      </div>
    `;
  }

  renderOrders() {
    if (this.loading) {
      return html`<div class="loading">Loading orders...</div>`;
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    if (this.orders.length === 0) {
      return html`<div class="no-orders">
        No orders found with the selected status.
      </div>`;
    }

    return html`
      <div class="orders-grid">
        ${this.orders.map(
          (order) => html` <order-card .order=${order}></order-card> `
        )}
      </div>
    `;
  }

  render() {
    return html`
      <div class="orders-container">
        ${this.renderStatusFilter()} ${this.renderOrders()}
      </div>

      <style>
        .orders-container {
          width: 100%;
        }

        .filter-container {
          margin-bottom: 1.5rem;
          background-color: #5d4037; /* Secondary brown */
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
        }

        .filter-container label {
          margin-right: 1rem;
          font-weight: 500;
          color: #ffd700; /* Accent yellow */
        }

        .filter-container select {
          padding: 0.5rem 1rem;
          border: 2px solid #ffd700; /* Accent yellow */
          background-color: #3e2723; /* Dark brown */
          color: #ffffff;
          border-radius: 4px;
          font-family: "Poppins", sans-serif;
        }

        .loading,
        .error,
        .no-orders {
          padding: 2rem;
          text-align: center;
          background-color: #5d4037; /* Secondary brown */
          border-radius: 8px;
        }

        .error {
          color: #ff6b6b; /* Red for errors */
        }

        .no-orders {
          color: #e0e0e0; /* Subtle grey */
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .orders-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }
}

customElements.define("order-list", OrderList);
