import { LitElement, html } from "https://esm.run/lit";
import { fetchJson, deleteJson } from "/static/js/utils/api_utils.js";

class CategoryDetail extends LitElement {
  static get properties() {
    return {
      categoryId: { type: String, attribute: "category-id" },
      mode: { type: String },
      category: { type: Object },
      loading: { type: Boolean },
      error: { type: String },
      confirmDelete: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.categoryId = "";
    this.mode = "view";
    this.category = null;
    this.loading = true;
    this.error = null;
    this.confirmDelete = false;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();

    console.log("CategoryDetail: Connected");

    // Get the categoryId from attribute
    if (!this.categoryId || this.categoryId === "") {
      const attrValue = this.getAttribute("category-id");
      if (attrValue) {
        this.categoryId = attrValue;
        console.log("CategoryDetail: Got ID from attribute:", this.categoryId);
      }
    }

    // Get mode from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get("mode");
    if (modeParam) {
      this.mode = modeParam;
      console.log("CategoryDetail: Got mode from URL:", this.mode);
    }
  }

  async firstUpdated() {
    console.log("CategoryDetail: First updated");

    // If no category ID from attribute, try from URL
    if (!this.categoryId || this.categoryId === "") {
      const url = window.location.pathname;
      const match = url.match(/\/admin\/categories\/([^\/\?]+)/);
      if (match && match[1]) {
        this.categoryId = match[1];
        console.log("CategoryDetail: Extracted ID from URL:", this.categoryId);
      }
    }

    // Double check mode from URL
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get("mode");
    if (modeParam) {
      this.mode = modeParam;
      console.log("CategoryDetail: Confirmed mode from URL:", this.mode);
    }

    if (this.categoryId && this.categoryId !== "") {
      await this.fetchCategory();
    } else {
      console.error("CategoryDetail: No category ID found");
      this.error = "No category ID provided";
      this.loading = false;
    }
  }

  async fetchCategory() {
    try {
      this.loading = true;
      this.error = null;

      console.log(
        "CategoryDetail: Fetching category data for ID:",
        this.categoryId
      );

      const response = await fetchJson(
        `/api/admin/categories/${this.categoryId}`
      );
      console.log("CategoryDetail: Fetched data:", response);

      this.category = response;
    } catch (error) {
      console.error("Error fetching category:", error);
      this.error = "Failed to load category. Please try again.";
    } finally {
      this.loading = false;
    }
  }

  showDeleteConfirm() {
    this.confirmDelete = true;
  }

  cancelDelete() {
    this.confirmDelete = false;
  }

  async confirmDeleteAction() {
    try {
      await deleteJson(`/api/admin/categories/${this.categoryId}`);
      window.location.href = "/admin/categories";
    } catch (error) {
      console.error("Error deleting category:", error);
      this.error = "Failed to delete category. Please try again.";
    }
  }

  toggleEditMode() {
    window.location.href = `/admin/categories/${this.categoryId}?mode=edit`;
  }

  render() {
    console.log("CategoryDetail: Rendering with mode:", this.mode);

    if (this.loading) {
      return html`
        <div class="loading-container">
          <div class="loading-spinner">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
          <p>Loading category...</p>
          <p class="debug-info">ID: ${this.categoryId}, Mode: ${this.mode}</p>
        </div>

        <style>
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            background-color: #5d4037;
            border-radius: 8px;
            text-align: center;
          }

          .loading-spinner {
            font-size: 2.5rem;
            color: #ffd700;
            margin-bottom: 1rem;
          }

          .debug-info {
            font-size: 0.8rem;
            color: #e0e0e0;
            font-family: monospace;
          }
        </style>
      `;
    }

    if (this.error) {
      return html`
        <div class="error-container">
          <i class="fas fa-exclamation-triangle"></i>
          <p>${this.error}</p>
          <p class="debug-info">ID: ${this.categoryId}, Mode: ${this.mode}</p>
          <button @click=${this.fetchCategory} class="retry-button">
            <i class="fas fa-sync"></i> Retry
          </button>
          <a href="/admin/categories" class="back-link">
            <i class="fas fa-arrow-left"></i> Back to Categories
          </a>
        </div>

        <style>
          .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            background-color: #5d4037;
            border-radius: 8px;
            text-align: center;
          }

          .error-container i {
            font-size: 2.5rem;
            color: #ffd700;
            margin-bottom: 1rem;
          }

          .debug-info {
            font-size: 0.8rem;
            color: #e0e0e0;
            font-family: monospace;
            margin-bottom: 1rem;
          }

          .retry-button {
            margin-top: 1rem;
            background-color: #ffd700;
            color: #3e2723;
            border: none;
            border-radius: 4px;
            padding: 0.6rem 1.2rem;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
          }

          .back-link {
            margin-top: 1rem;
            color: #ffffff;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
          }
        </style>
      `;
    }

    if (this.mode === "edit") {
      console.log("CategoryDetail: Rendering edit mode");
      return html`
        <div class="category-detail edit-mode">
          <category-form
            category-id="${this.categoryId}"
            .category="${this.category}"
          ></category-form>
        </div>
      `;
    }

    console.log("CategoryDetail: Rendering view mode");
    return html`
      <div class="category-detail">
        ${this.confirmDelete ? this.renderDeleteConfirm() : ""}
        ${this.renderViewMode()}
      </div>

      <style>
        .detail-container {
          background-color: #5d4037;
          border-radius: 8px;
          overflow: hidden;
          width: 100%;
          box-sizing: border-box;
        }

        .detail-header {
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .category-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background-color: rgba(255, 215, 0, 0.2);
          color: #ffd700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .category-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.8rem;
          color: #ffffff;
        }

        .category-products {
          margin: 0;
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .edit-button,
        .delete-button {
          padding: 0.75rem 1.25rem;
          border-radius: 4px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .edit-button {
          background-color: #ffc107;
          border: none;
          color: #3e2723;
        }

        .edit-button:hover {
          background-color: #f0b000;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .delete-button {
          background-color: transparent;
          border: 1px solid #f44336;
          color: #f44336;
        }

        .delete-button:hover {
          background-color: rgba(244, 67, 54, 0.1);
        }

        .detail-content {
          padding: 2rem;
        }

        .detail-section {
          margin-bottom: 2rem;
        }

        .section-title {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          color: #ffd700;
        }

        .category-description {
          margin: 0;
          color: #ffffff;
          line-height: 1.6;
        }

        .icon-preview {
          background-color: #3e2723;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .icon-preview i {
          font-size: 2rem;
          color: #ffd700;
        }

        .icon-code {
          font-family: monospace;
          background-color: rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 4px;
        }

        .image-preview {
          margin-top: 1rem;
        }

        .image-preview img {
          max-width: 100%;
          max-height: 300px;
          border-radius: 8px;
        }

        .id-preview {
          font-family: monospace;
          background-color: #3e2723;
          border-radius: 4px;
          padding: 0.75rem 1rem;
          color: #e0e0e0;
        }

        .confirm-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .confirm-dialog {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .confirm-header {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
          color: #f44336;
        }

        .confirm-header i {
          font-size: 1.5rem;
          margin-right: 1rem;
        }

        .confirm-header h3 {
          margin: 0;
          font-size: 1.25rem;
        }

        .confirm-warning {
          color: #f44336;
          font-size: 0.9rem;
        }

        .confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .cancel-button,
        .confirm-actions .delete-button {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-button {
          background-color: transparent;
          border: 1px solid #ffffff;
          color: #ffffff;
        }

        .cancel-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .confirm-actions .delete-button {
          background-color: #f44336;
          border: none;
          color: #ffffff;
        }

        .confirm-actions .delete-button:hover {
          background-color: #d32f2f;
        }
      </style>
    `;
  }

  renderViewMode() {
    if (!this.category) {
      console.error(
        "CategoryDetail: No category data available in renderViewMode"
      );
      return html`<div>No category data available</div>`;
    }

    return html`
      <div class="detail-container">
        <div class="detail-header">
          <div class="header-content">
            <div class="category-icon">
              <i class="${this.category.icon || "fas fa-tag"}"></i>
            </div>
            <div>
              <h2 class="category-title">${this.category.title}</h2>
              <p class="category-products">
                ${this.category.products?.length || 0} products in this category
              </p>
            </div>
          </div>

          <div class="header-actions">
            <button @click=${this.toggleEditMode} class="edit-button">
              <i class="fas fa-pencil-alt"></i> Edit
            </button>
            <button @click=${this.showDeleteConfirm} class="delete-button">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>

        <div class="detail-content">
          <div class="detail-section">
            <h3 class="section-title">Description</h3>
            <p class="category-description">
              ${this.category.description || "No description provided."}
            </p>
          </div>

          <div class="detail-section">
            <h3 class="section-title">Icon</h3>
            <div class="icon-preview">
              <i class="${this.category.icon || "fas fa-tag"}"></i>
              <span class="icon-code"
                >${this.category.icon || "fas fa-tag"}</span
              >
            </div>
          </div>

          ${this.category.image
            ? html`
                <div class="detail-section">
                  <h3 class="section-title">Image</h3>
                  <div class="image-preview">
                    <img
                      src="${this.category.image}"
                      alt="${this.category.title}"
                      onerror="this.src='/static/images/placeholder-image.jpg';"
                    />
                  </div>
                </div>
              `
            : html``}

          <div class="detail-section">
            <h3 class="section-title">Category ID</h3>
            <div class="id-preview">${this.category.id}</div>
          </div>
        </div>
      </div>
    `;
  }

  renderDeleteConfirm() {
    return html`
      <div class="confirm-overlay">
        <div class="confirm-dialog">
          <div class="confirm-header">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Confirm Deletion</h3>
          </div>

          <div class="confirm-content">
            <p>
              Are you sure you want to delete the category
              "${this.category?.title}"?
            </p>
            <p class="confirm-warning">
              This action cannot be undone. All products in this category will
              need to be reassigned.
            </p>
          </div>

          <div class="confirm-actions">
            <button @click=${this.cancelDelete} class="cancel-button">
              Cancel
            </button>
            <button @click=${this.confirmDeleteAction} class="delete-button">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("category-detail", CategoryDetail);
