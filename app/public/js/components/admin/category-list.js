import { LitElement, html } from "https://esm.run/lit";
import { fetchJson, deleteJson } from "/static/js/utils/api_utils.js";

class CategoryList extends LitElement {
  static get properties() {
    return {
      categories: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
      confirmDelete: { type: Object },
    };
  }

  constructor() {
    super();
    this.categories = [];
    this.loading = true;
    this.error = null;
    this.confirmDelete = null; // {id, title} when confirming delete
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    await this.fetchCategories();
  }

  async fetchCategories() {
    try {
      this.loading = true;
      this.error = null;
      const data = await fetchJson("/api/admin/categories");
      this.categories = data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      this.error = "Failed to load categories. Please try again.";
    } finally {
      this.loading = false;
    }
  }

  showDeleteConfirm(category) {
    this.confirmDelete = {
      id: category.id,
      title: category.title,
    };
  }

  cancelDelete() {
    this.confirmDelete = null;
  }

  async confirmDeleteAction() {
    try {
      await deleteJson(`/api/admin/categories/${this.confirmDelete.id}`);
      // Remove the deleted category from the list
      this.categories = this.categories.filter(
        (c) => c.id !== this.confirmDelete.id
      );
      this.confirmDelete = null;
    } catch (error) {
      console.error("Error deleting category:", error);
      this.error = "Failed to delete category. Please try again.";
    }
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading-container">
          <div class="loading-spinner">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
          <p>Loading categories...</p>
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
        </style>
      `;
    }

    if (this.error) {
      return html`
        <div class="error-container">
          <i class="fas fa-exclamation-triangle"></i>
          <p>${this.error}</p>
          <button @click=${this.fetchCategories} class="retry-button">
            <i class="fas fa-sync"></i> Retry
          </button>
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
            gap: the same issue 0.5rem;
          }
        </style>
      `;
    }

    if (this.categories.length === 0) {
      return html`
        <div class="empty-container">
          <i class="fas fa-folder-open"></i>
          <p>No categories found</p>
          <p class="empty-hint">Create your first category to get started</p>
          <a href="/admin/categories/new" class="add-button">
            <i class="fas fa-plus"></i> Add New Category
          </a>
        </div>

        <style>
          .empty-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            background-color: #5d4037;
            border-radius: 8px;
            text-align: center;
          }

          .empty-container i {
            font-size: 2.5rem;
            color: #ffd700;
            margin-bottom: 1rem;
          }

          .empty-hint {
            color: #e0e0e0;
            margin-top: 0;
          }

          .add-button {
            margin-top: 1rem;
            background-color: #ffd700;
            color: #3e2723;
            border: none;
            border-radius: 4px;
            padding: 0.75rem 1.25rem;
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
          }

          .add-button:hover {
            background-color: #f0c800;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
        </style>
      `;
    }

    return html`
      <div class="categories-list">
        ${this.confirmDelete ? this.renderDeleteConfirm() : ""}

        <div class="categories-grid">
          ${this.categories.map((category) =>
            this.renderCategoryCard(category)
          )}
        </div>
      </div>

      <style>
        .categories-list {
          width: 100%;
          box-sizing: border-box;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          width: 100%;
          box-sizing: border-box;
        }

        .category-card {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
          height: 100%;
          min-height: 180px;
          box-sizing: border-box;
        }

        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .category-icon {
          background-color: rgba(255, 215, 0, 0.2);
          color: #ffd700;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .category-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: #ffffff;
          padding-right: 90px; /* Space for actions */
        }

        .category-description {
          margin: 0 0 0.5rem 0;
          color: #e0e0e0;
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .category-products-count {
          margin: 0;
          color: #ffd700;
          font-size: 0.85rem;
          margin-top: auto;
          padding-top: 1rem;
        }

        .category-actions {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.5rem;
        }

        .action-button {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .action-button.view:hover {
          background-color: rgba(33, 150, 243, 0.2);
          border-color: #2196f3;
          color: #2196f3;
        }

        .action-button.edit:hover {
          background-color: rgba(255, 193, 7, 0.2);
          border-color: #ffc107;
          color: #ffc107;
        }

        .action-button.delete:hover {
          background-color: rgba(244, 67, 54, 0.2);
          border-color: #f44336;
          color: #f44336;
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
        .delete-button {
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

        .delete-button {
          background-color: #f44336;
          border: none;
          color: #ffffff;
        }

        .delete-button:hover {
          background-color: #d32f2f;
        }
      </style>
    `;
  }

  renderCategoryCard(category) {
    return html`
      <div class="category-card">
        <div class="category-icon">
          <i class="${category.icon || "fas fa-tag"}"></i>
        </div>

        <div class="category-details">
          <h3 class="category-title">${category.title}</h3>
          <p class="category-description">
            ${category.description || "No description"}
          </p>
          <p class="category-products-count">
            ${category.products?.length || 0} products
          </p>
        </div>

        <div class="category-actions">
          <a
            href="/admin/categories/${category.id}?mode=view"
            class="action-button view"
          >
            <i class="fas fa-eye"></i>
          </a>
          <a
            href="/admin/categories/${category.id}?mode=edit"
            class="action-button edit"
          >
            <i class="fas fa-pencil-alt"></i>
          </a>
          <button
            class="action-button delete"
            @click=${() => this.showDeleteConfirm(category)}
          >
            <i class="fas fa-trash"></i>
          </button>
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
              "${this.confirmDelete.title}"?
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

customElements.define("category-list", CategoryList);
