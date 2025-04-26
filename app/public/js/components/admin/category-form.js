import { LitElement, html } from "https://esm.run/lit";
import { fetchJson, postJson, putJson } from "/static/js/utils/api_utils.js";

class CategoryForm extends LitElement {
  static get properties() {
    return {
      categoryId: { type: String, attribute: "category-id" },
      category: { type: Object },
      loading: { type: Boolean },
      saving: { type: Boolean },
      error: { type: String },
      success: { type: String },
      formData: { type: Object },
      formErrors: { type: Object },
      popularIcons: { type: Array },
      imagePreview: { type: String },
      uploadingImage: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.categoryId = "";
    this.category = null;
    this.loading = false;
    this.saving = false;
    this.uploadingImage = false;
    this.error = null;
    this.success = null;
    this.formData = {
      title: "",
      description: "",
      icon: "fas fa-tag",
      image: "",
    };
    this.imagePreview = "";
    this.formErrors = {};
    this.popularIcons = [
      "fas fa-tag",
      "fas fa-box",
      "fas fa-gift",
      "fas fa-gem",
      "fas fa-mask",
      "fas fa-palette",
      "fas fa-paint-brush",
      "fas fa-tshirt",
      "fas fa-chair",
      "fas fa-couch",
      "fas fa-leaf",
      "fas fa-feather-alt",
      "fas fa-bolt",
      "fas fa-fire",
      "fas fa-crown",
      "fas fa-magic",
      "fas fa-hammer",
      "fas fa-tools",
      "fas fa-scroll",
      "fas fa-heart",
    ];
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();

    // Get the categoryId from attribute if not set via property
    if (!this.categoryId || this.categoryId === "") {
      const attrValue = this.getAttribute("category-id");
      if (attrValue) {
        this.categoryId = attrValue;
        console.log("CategoryForm: Got ID from attribute", this.categoryId);
      }
    }
  }

  updated(changedProperties) {
    if (changedProperties.has("category") && this.category) {
      console.log("CategoryForm: Category updated", this.category);
      this.formData = {
        title: this.category.title || "",
        description: this.category.description || "",
        icon: this.category.icon || "fas fa-tag",
        image: this.category.image || "",
      };

      // Set image preview if category has an image
      if (this.category.image) {
        this.imagePreview = this.category.image;
      }
    }
  }

  async firstUpdated() {
    console.log("CategoryForm: firstUpdated", this.categoryId);
    if (this.categoryId && this.categoryId !== "") {
      await this.fetchCategory();
    }
  }

  async fetchCategory() {
    try {
      this.loading = true;
      this.error = null;

      console.log("CategoryForm: Fetching category", this.categoryId);

      const response = await fetchJson(
        `/api/admin/categories/${this.categoryId}`
      );
      console.log("CategoryForm: Fetched data", response);

      this.category = response;
      this.formData = {
        title: this.category.title || "",
        description: this.category.description || "",
        icon: this.category.icon || "fas fa-tag",
        image: this.category.image || "",
      };

      // Set image preview if category has an image
      if (this.category.image) {
        this.imagePreview = this.category.image;
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      this.error = "Failed to load category. Please try again.";
    } finally {
      this.loading = false;
    }
  }

  handleInputChange(e) {
    const { name, value } = e.target;
    this.formData = {
      ...this.formData,
      [name]: value,
    };

    if (this.formErrors[name]) {
      this.formErrors = {
        ...this.formErrors,
        [name]: null,
      };
    }

    if (this.success) {
      this.success = null;
    }
  }

  async handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match("image.*")) {
      this.formErrors = {
        ...this.formErrors,
        image: "Please select an image file",
      };
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.formErrors = {
        ...this.formErrors,
        image: "Image file size should be less than 2MB",
      };
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      this.imagePreview = event.target.result;
    };
    reader.readAsDataURL(file);

    // Upload the file
    try {
      this.uploadingImage = true;

      // Create form data for upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload the file
      const response = await fetch("/api/admin/categories/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();
      console.log("Image uploaded successfully", result);

      // Store the returned path in formData
      this.formData = {
        ...this.formData,
        image: result.path,
      };

      // Clear any error
      if (this.formErrors.image) {
        this.formErrors = {
          ...this.formErrors,
          image: null,
        };
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      this.formErrors = {
        ...this.formErrors,
        image: "Failed to upload image. Please try again.",
      };
    } finally {
      this.uploadingImage = false;
    }
  }

  selectIcon(icon) {
    this.formData = {
      ...this.formData,
      icon,
    };

    if (this.formErrors.icon) {
      this.formErrors = {
        ...this.formErrors,
        icon: null,
      };
    }
  }

  validateForm() {
    const errors = {};

    if (!this.formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!this.formData.icon.trim()) {
      errors.icon = "Icon is required";
    }

    this.formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    try {
      this.saving = true;
      this.error = null;
      this.success = null;

      const formDataToSend = {
        title: this.formData.title,
        description: this.formData.description,
        icon: this.formData.icon,
        image: this.formData.image,
      };

      console.log("Saving category data:", formDataToSend);

      if (this.categoryId) {
        await putJson(
          `/api/admin/categories/${this.categoryId}`,
          formDataToSend
        );
        this.success = "Category updated successfully";

        // Redirect after a brief delay to show success message
        setTimeout(() => {
          window.location.href = `/admin/categories/${this.categoryId}?mode=view`;
        }, 1500);
      } else {
        const result = await postJson("/api/admin/categories", formDataToSend);
        this.success = "Category created successfully";

        // Redirect after a brief delay to show success message
        setTimeout(() => {
          window.location.href = `/admin/categories/${result.id}?mode=view`;
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      this.error = "Failed to save category. Please try again.";
    } finally {
      this.saving = false;
    }
  }

  handleCancel() {
    if (this.categoryId) {
      window.location.href = `/admin/categories/${this.categoryId}?mode=view`;
    } else {
      window.location.href = "/admin/categories";
    }
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading-container">
          <div class="loading-spinner">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
          <p>Loading category data...</p>
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

    return html`
      <div class="category-form-container">
        <form @submit=${this.handleSubmit} class="category-form">
          ${this.error
            ? html`
                <div class="form-error">
                  <i class="fas fa-exclamation-triangle"></i>
                  ${this.error}
                </div>
              `
            : ""}
          ${this.success
            ? html`
                <div class="form-success">
                  <i class="fas fa-check-circle"></i>
                  ${this.success}
                </div>
              `
            : ""}

          <div class="form-group">
            <label for="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              .value=${this.formData.title}
              @input=${this.handleInputChange}
              class="${this.formErrors.title ? "input-error" : ""}"
              placeholder="Enter category title"
            />
            ${this.formErrors.title
              ? html`
                  <div class="error-message">${this.formErrors.title}</div>
                `
              : ""}
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              name="description"
              .value=${this.formData.description}
              @input=${this.handleInputChange}
              placeholder="Enter category description"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Icon</label>
            <div class="icon-selector">
              <div class="selected-icon">
                <i class="${this.formData.icon}"></i>
                <span>${this.formData.icon}</span>
              </div>

              <div class="popular-icons">
                <h4>Popular Icons</h4>
                <div class="icons-grid">
                  ${this.popularIcons.map(
                    (icon) => html`
                      <div
                        class="icon-option ${this.formData.icon === icon
                          ? "selected"
                          : ""}"
                        @click=${() => this.selectIcon(icon)}
                      >
                        <i class="${icon}"></i>
                      </div>
                    `
                  )}
                </div>
              </div>

              <div class="custom-icon">
                <h4>Custom Icon</h4>
                <input
                  type="text"
                  name="icon"
                  .value=${this.formData.icon}
                  @input=${this.handleInputChange}
                  placeholder="Enter FontAwesome icon class"
                  class="${this.formErrors.icon ? "input-error" : ""}"
                />
                ${this.formErrors.icon
                  ? html`
                      <div class="error-message">${this.formErrors.icon}</div>
                    `
                  : ""}
                <div class="icon-hint">
                  Visit
                  <a
                    href="https://fontawesome.com/icons"
                    target="_blank"
                    rel="noopener"
                    >FontAwesome</a
                  >
                  for more icons
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="image">Category Image</label>
            <div class="image-upload-container">
              <div class="image-upload-area">
                <input
                  type="file"
                  id="image"
                  name="imageFile"
                  accept="image/*"
                  @change=${this.handleImageChange}
                  class="image-input ${this.formErrors.image
                    ? "input-error"
                    : ""}"
                  ?disabled=${this.uploadingImage}
                />
                <label
                  for="image"
                  class="image-upload-label ${this.uploadingImage
                    ? "uploading"
                    : ""}"
                >
                  ${this.uploadingImage
                    ? html`<i class="fas fa-circle-notch fa-spin"></i
                        ><span>Uploading...</span>`
                    : html`<i class="fas fa-cloud-upload-alt"></i
                        ><span>Choose image file</span>`}
                </label>
              </div>

              ${this.imagePreview
                ? html`
                    <div class="image-preview">
                      <img
                        src="${this.imagePreview}"
                        alt="Category image preview"
                      />
                    </div>
                  `
                : ""}
            </div>
            ${this.formErrors.image
              ? html`
                  <div class="error-message">${this.formErrors.image}</div>
                `
              : ""}
            <div class="form-hint">
              Uploaded images will be stored in the server's categories
              directory.
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click=${this.handleCancel}
              class="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="submit-button"
              ?disabled=${this.saving || this.uploadingImage}
            >
              ${this.saving
                ? html` <i class="fas fa-circle-notch fa-spin"></i> Saving... `
                : this.categoryId
                ? "Update Category"
                : "Create Category"}
            </button>
          </div>
        </form>
      </div>

      <style>
        .category-form-container {
          background-color: #5d4037;
          border-radius: 8px;
          overflow: hidden;
          max-width: 800px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .category-form {
          padding: 2rem;
          width: 100%;
          box-sizing: border-box;
        }

        .form-error,
        .form-success {
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .form-error {
          background-color: rgba(244, 67, 54, 0.1);
          border: 1px solid #f44336;
          color: #f44336;
        }

        .form-success {
          background-color: rgba(76, 175, 80, 0.1);
          border: 1px solid #4caf50;
          color: #4caf50;
        }

        .form-group {
          margin-bottom: 1.5rem;
          width: 100%;
          box-sizing: border-box;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        input,
        textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          font-size: 1rem;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #ffd700;
        }

        .input-error {
          border-color: #f44336;
        }

        .error-message {
          color: #f44336;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }

        .form-hint,
        .icon-hint {
          color: #e0e0e0;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }

        .icon-selector {
          margin-top: 1rem;
        }

        .selected-icon {
          background-color: #3e2723;
          padding: 1rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .selected-icon i {
          font-size: 2rem;
          color: #ffd700;
        }

        .selected-icon span {
          font-family: monospace;
        }

        .popular-icons h4,
        .custom-icon h4 {
          margin: 0 0 1rem 0;
          font-weight: 500;
          color: #ffd700;
        }

        .icons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .icon-option {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #3e2723;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1.5rem;
          color: #ffffff;
          transition: all 0.2s;
        }

        .icon-option:hover {
          background-color: rgba(255, 215, 0, 0.2);
          color: #ffd700;
        }

        .icon-option.selected {
          background-color: rgba(255, 215, 0, 0.3);
          color: #ffd700;
          border: 2px solid #ffd700;
        }

        .custom-icon {
          margin-top: 1.5rem;
        }

        .icon-hint a {
          color: #ffd700;
          text-decoration: none;
        }

        .icon-hint a:hover {
          text-decoration: underline;
        }

        /* Image upload styles */
        .image-upload-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .image-upload-area {
          position: relative;
          width: 100%;
        }

        .image-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 2;
        }

        .image-input:disabled {
          cursor: not-allowed;
        }

        .image-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 2rem;
          border: 2px dashed rgba(255, 215, 0, 0.3);
          border-radius: 4px;
          background-color: rgba(255, 215, 0, 0.05);
          transition: all 0.2s;
          cursor: pointer;
        }

        .image-upload-label:hover:not(.uploading) {
          background-color: rgba(255, 215, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.5);
        }

        .image-upload-label.uploading {
          background-color: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          cursor: wait;
        }

        .image-upload-label i {
          font-size: 2rem;
          color: #ffd700;
        }

        .image-preview {
          margin-top: 1rem;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .image-preview img {
          max-width: 100%;
          max-height: 200px;
          border-radius: 4px;
          border: 2px solid #3e2723;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2.5rem;
        }

        .cancel-button,
        .submit-button {
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

        .submit-button {
          background-color: #ffd700;
          border: none;
          color: #3e2723;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          background-color: #f0c800;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      </style>
    `;
  }
}

customElements.define("category-form", CategoryForm);
