import { LitElement, html } from "https://esm.run/lit";
import { patchJson } from "../../utils/api_utils.js";

class OrderCard extends LitElement {
  static get properties() {
    return {
      order: { type: Object },
      isExpanded: { type: Boolean },
      isUpdating: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.order = null;
    this.isExpanded = false;
    this.isUpdating = false;
    this.error = null;
    this.productImages = [];
    this.loadingImages = false;

    // Define allowed status transitions based on current status
    // Using UPPERCASE enum names to match API expectations
    this.allowedStatusTransitions = {
      PAID: ["ACCEPTED", "DENIED"],
      ACCEPTED: ["DEPARTED"],
      DEPARTED: ["DELIVERED", "DELIVER_FAILED"],
      DELIVER_FAILED: ["DEPARTED", "DENIED"],
    };
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  // Toggle expanded view
  toggleExpand() {
    this.isExpanded = !this.isExpanded;

    // Fetch product images when expanding
    if (this.isExpanded && this.order && this.order.product) {
      this.fetchProductImages(this.order.product.id);
    }
  }

  // Fetch product images from API
  async fetchProductImages(productId) {
    if (!productId) return;

    this.loadingImages = true;

    try {
      const response = await fetch(`/api/landing/product/${productId}/images`);
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.status}`);
      }

      const data = await response.json();
      this.productImages = data.images || [];
    } catch (err) {
      console.error("Error fetching product images:", err);
      this.productImages = [];
    } finally {
      this.loadingImages = false;
      this.requestUpdate();
    }
  }

  // Format date for display
  formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Format price with currency
  formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(price);
  }

  // Get allowed next status options based on current status
  getNextStatusOptions() {
    if (!this.order) return [];

    // Get the current status, normalize it to uppercase for comparison
    // The API returns status values like "Paid" but our map uses keys like "PAID"
    const currentStatus = this.order.status.toUpperCase();
    return this.allowedStatusTransitions[currentStatus] || [];
  }

  // Handle status update
  async updateStatus(newStatus) {
    if (!this.order || this.isUpdating) return;

    this.isUpdating = true;
    this.error = null;

    try {
      const updatedOrder = await patchJson(
        `/api/craftsman/orders/${this.order.id}`,
        {
          status: newStatus,
        }
      );

      // Update local order data
      this.order = updatedOrder;

      // Dispatch event to parent component
      const event = new CustomEvent("order-status-updated", {
        bubbles: true,
        composed: true,
        detail: {
          orderId: this.order.id,
          newStatus: newStatus,
        },
      });
      this.dispatchEvent(event);
    } catch (err) {
      this.error = `Failed to update status: ${err.message}`;
      console.error("Error updating order status:", err);
    } finally {
      this.isUpdating = false;
    }
  }

  // Get status badge color based on status
  getStatusColor(status) {
    const statusColors = {
      PAID: "#FFD700", // Yellow
      ACCEPTED: "#4CAF50", // Green
      DENIED: "#F44336", // Red
      DEPARTED: "#2196F3", // Blue
      DELIVERED: "#8BC34A", // Light Green
      DELIVER_FAILED: "#FF9800", // Orange
    };

    return statusColors[status] || "#E0E0E0"; // Default grey
  }

  renderStatusBadge(status) {
    return html`
      <span
        class="status-badge"
        style="background-color: ${this.getStatusColor(status)}"
      >
        ${status.replace("_", " ")}
      </span>
    `;
  }

  renderStatusActions() {
    const nextStatusOptions = this.getNextStatusOptions();

    if (nextStatusOptions.length === 0) {
      return html`<p class="no-actions">No further actions available</p>`;
    }

    return html`
      <div class="status-actions">
        <p>Update status to:</p>
        <div class="action-buttons">
          ${nextStatusOptions.map(
            (status) => html`
              <button
                @click=${() => this.updateStatus(status)}
                ?disabled=${this.isUpdating}
                class="status-btn"
                data-status=${status}
              >
                ${status.replace("_", " ")}
              </button>
            `
          )}
        </div>
      </div>
    `;
  }

  renderOrderDetails() {
    if (!this.order) return html`<p>No order data available</p>`;

    return html`
      <div class="order-card ${this.isExpanded ? "expanded" : ""}">
        <div class="order-header" @click=${this.toggleExpand}>
          <div class="order-basic-info">
            <div class="order-id">#${this.order.id.substring(0, 8)}</div>
            <div class="order-date">
              ${this.formatDate(this.order.created_at)}
            </div>
          </div>
          <div class="order-status">
            ${this.renderStatusBadge(this.order.status)}
            <i
              class="fas fa-chevron-${this.isExpanded
                ? "up"
                : "down"} expand-icon"
            ></i>
          </div>
        </div>

        ${this.isExpanded
          ? html`
              <div class="order-content">
                ${this.order.product
                  ? html`
                      <div class="order-section">
                        <h3>Product Details</h3>
                        <div class="product-details">
                          <div class="product-image">
                            ${this.loadingImages
                              ? html`
                                  <div class="loading-spinner">
                                    <i class="fas fa-spinner fa-spin"></i>
                                  </div>
                                `
                              : this.productImages.length > 0
                              ? html`
                                  <img
                                    src="${this.productImages[0]}"
                                    alt="${this.order.product.title ||
                                    "Product Image"}"
                                  />
                                `
                              : html`
                                  <img
                                    src="/static/images/placeholder.png"
                                    alt="${this.order.product.title ||
                                    "Product Image"}"
                                  />
                                `}
                          </div>
                          <div class="product-info">
                            <h4>
                              ${this.order.product.title || "Unknown Product"}
                            </h4>
                            <p class="product-category">
                              ${this.order.product.category?.title ||
                              "Uncategorized"}
                            </p>
                            <p class="product-price">
                              Unit Price:
                              ${this.formatPrice(this.order.unit_price)}
                            </p>
                            <p class="product-quantity">
                              Quantity: ${this.order.quantity}
                            </p>
                            <p class="product-total">
                              Total:
                              ${this.formatPrice(
                                this.order.unit_price * this.order.quantity
                              )}
                            </p>
                          </div>
                        </div>
                        ${this.productImages.length > 1
                          ? html`
                              <div class="product-thumbnails">
                                ${this.productImages.map(
                                  (img) => html`
                                    <div class="thumbnail">
                                      <img
                                        src="${img}"
                                        alt="Product thumbnail"
                                      />
                                    </div>
                                  `
                                )}
                              </div>
                            `
                          : ""}
                      </div>
                    `
                  : html`
                      <div class="order-section">
                        <h3>Product Details</h3>
                        <p class="missing-data">
                          Product information unavailable
                        </p>
                      </div>
                    `}
                ${this.order.user
                  ? html`
                      <div class="order-section">
                        <h3>Customer Details</h3>
                        <div class="customer-details">
                          <p>
                            <strong>Name:</strong> ${this.order.user.name ||
                            "Not provided"}
                          </p>
                          <p>
                            <strong>Email:</strong> ${this.order.user.email ||
                            "Not provided"}
                          </p>
                          <p>
                            <strong>Phone:</strong> ${this.order.user.phone ||
                            "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div class="order-section">
                        <h3>Delivery Address</h3>
                        <div class="address-details">
                          ${this.order.user.address
                            ? html`
                                <p>
                                  ${this.order.user.address.address_line ||
                                  "No address line provided"}
                                </p>
                                <p>
                                  ${this.order.user.address.city || ""},
                                  ${this.order.user.address.state || ""}
                                  ${this.order.user.address.postal_code || ""}
                                </p>
                                <p>${this.order.user.address.country || ""}</p>
                              `
                            : html` <p>No address information available</p> `}
                        </div>
                      </div>
                    `
                  : html`
                      <div class="order-section">
                        <h3>Customer Details</h3>
                        <p class="missing-data">
                          Customer information unavailable
                        </p>
                      </div>

                      <div class="order-section">
                        <h3>Delivery Address</h3>
                        <p class="missing-data">
                          Address information unavailable
                        </p>
                      </div>
                    `}

                <div class="order-section status-section">
                  <h3>Status Management</h3>
                  ${this.error
                    ? html`<p class="error-message">${this.error}</p>`
                    : ""}
                  ${this.renderStatusActions()}
                </div>

                <div class="order-section">
                  <h3>Order Timeline</h3>
                  <div class="order-timeline">
                    <div class="timeline-item">
                      <div class="timeline-icon">
                        <i class="fas fa-shopping-cart"></i>
                      </div>
                      <div class="timeline-content">
                        <p class="timeline-date">
                          ${this.formatDate(this.order.created_at)}
                        </p>
                        <p class="timeline-title">Order Created</p>
                      </div>
                    </div>
                    <div class="timeline-item">
                      <div class="timeline-icon">
                        <i class="fas fa-money-bill-wave"></i>
                      </div>
                      <div class="timeline-content">
                        <p class="timeline-date">
                          ${this.formatDate(this.order.updated_at)}
                        </p>
                        <p class="timeline-title">
                          Last Updated (${this.order.status.replace("_", " ")})
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `
          : ""}
      </div>
    `;
  }

  render() {
    return html`
      ${this.renderOrderDetails()}

      <style>
        .order-card {
          background-color: #5d4037; /* Secondary brown */
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .order-card.expanded {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .order-header:hover {
          background-color: #6d4c41; /* Slightly lighter brown */
        }

        .order-basic-info {
          display: flex;
          flex-direction: column;
        }

        .order-id {
          font-weight: bold;
          color: #ffd700; /* Accent yellow */
          margin-bottom: 0.25rem;
        }

        .order-date {
          font-size: 0.9rem;
          color: #e0e0e0; /* Subtle grey */
        }

        .order-status {
          display: flex;
          align-items: center;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #212121; /* Dark text for readability on colored badges */
          margin-right: 0.75rem;
          text-transform: capitalize;
        }

        .expand-icon {
          color: #ffd700; /* Accent yellow */
        }

        .order-content {
          padding: 0 1rem 1rem;
        }

        .order-section {
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #6d4c41; /* Slightly lighter brown */
          padding-bottom: 1.5rem;
        }

        .order-section:last-child {
          margin-bottom: 0;
          border-bottom: none;
          padding-bottom: 0;
        }

        .order-section h3 {
          color: #ffd700; /* Accent yellow */
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .product-details {
          display: flex;
          align-items: flex-start;
        }

        .product-image {
          width: 80px;
          height: 80px;
          margin-right: 1rem;
          border-radius: 4px;
          overflow: hidden;
          background-color: #3e2723; /* Dark brown */
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .loading-spinner {
          color: #ffd700; /* Accent yellow */
          font-size: 1.5rem;
        }

        .product-thumbnails {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .thumbnail {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          overflow: hidden;
          border: 2px solid #3e2723; /* Dark brown */
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .thumbnail:hover {
          border-color: #ffd700; /* Accent yellow */
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info h4 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }

        .product-info p {
          margin: 0.25rem 0;
          color: #e0e0e0; /* Subtle grey */
        }

        .product-category {
          font-style: italic;
          font-size: 0.9rem;
        }

        .product-price,
        .product-quantity,
        .product-total {
          font-size: 0.95rem;
        }

        .product-total {
          font-weight: bold;
          color: #ffd700; /* Accent yellow */
        }

        .customer-details p,
        .address-details p {
          margin: 0.5rem 0;
          color: #e0e0e0; /* Subtle grey */
        }

        .status-section {
          background-color: #4e342e; /* Slightly darker brown */
          padding: 1rem;
          border-radius: 4px;
        }

        .error-message {
          color: #f44336; /* Red */
          background-color: rgba(244, 67, 54, 0.1);
          padding: 0.5rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .status-actions p {
          margin-top: 0;
          color: #ffffff;
          margin-bottom: 0.75rem;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .status-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-family: "Poppins", sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .status-btn[data-status="ACCEPTED"] {
          background-color: #4caf50; /* Green */
          color: white;
        }

        .status-btn[data-status="DENIED"] {
          background-color: #f44336; /* Red */
          color: white;
        }

        .status-btn[data-status="DEPARTED"] {
          background-color: #2196f3; /* Blue */
          color: white;
        }

        .status-btn[data-status="DELIVERED"] {
          background-color: #8bc34a; /* Light Green */
          color: white;
        }

        .status-btn[data-status="DELIVER_FAILED"] {
          background-color: #ff9800; /* Orange */
          color: white;
        }

        .status-btn:hover {
          opacity: 0.9;
        }

        .status-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .no-actions,
        .missing-data {
          color: #e0e0e0; /* Subtle grey */
          font-style: italic;
        }

        .order-timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .timeline-item {
          display: flex;
          align-items: flex-start;
        }

        .timeline-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #ffd700; /* Accent yellow */
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .timeline-icon i {
          color: #3e2723; /* Dark brown */
        }

        .timeline-content {
          flex-grow: 1;
        }

        .timeline-date {
          font-size: 0.8rem;
          color: #e0e0e0; /* Subtle grey */
          margin: 0;
        }

        .timeline-title {
          font-weight: 500;
          color: #ffffff;
          margin: 0.25rem 0 0;
        }
      </style>
    `;
  }
}

customElements.define("order-card", OrderCard);
