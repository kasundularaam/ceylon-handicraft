import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class CraftsmanProductForm extends LitElement {
  static get properties() {
    return {
      mode: { type: String },
      productId: { type: String, attribute: "product-id" },
      product: { type: Object },
      categories: { type: Array },
      loading: { type: Boolean },
      submitting: { type: Boolean },
      error: { type: String },
      submitError: { type: String },
      imagePreviewUrls: { type: Array },
      removedImages: { type: Array },
    };
  }

  constructor() {
    super();
    this.mode = "new";
    this.productId = null;
    this.product = {
      title: "",
      description: "",
      type: "Sale",
      category_id: "",
      base_price: "",
      weight: "",
      length: "",
      width: "",
      height: "",
      images: [],
    };
    this.categories = [];
    this.loading = false;
    this.submitting = false;
    this.error = null;
    this.submitError = null;
    this.imagePreviewUrls = [];
    this.removedImages = [];
  }

  // Disable Shadow DOM
  createRenderRoot() {
    return this;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadCategories();

    if (this.mode === "edit" && this.productId) {
      await this.loadProduct();
    }
  }

  async loadCategories() {
    try {
      this.categories = await fetchJson("/api/products/categories/all");
    } catch (error) {
      console.error("Error loading categories:", error);
      this.error = "Failed to load categories. Please try again.";
    }
  }

  async loadProduct() {
    try {
      this.loading = true;
      this.error = null;

      const product = await fetchJson(`/api/products/${this.productId}`);
      this.product = {
        ...product,
        weight: product.weight || "",
        length: product.length || "",
        width: product.width || "",
        height: product.height || "",
      };

      // Initialize images for editing
      if (product.images && product.images.length > 0) {
        this.product.images = product.images;
        this.imagePreviewUrls = product.images.map((img) => ({
          url: img,
          isExisting: true,
        }));
      }
    } catch (error) {
      console.error("Error loading product:", error);
      this.error = error.message || "Failed to load product";
    } finally {
      this.loading = false;
    }
  }

  handleInputChange(e) {
    const { name, value } = e.target;
    this.product = { ...this.product, [name]: value };
  }

  handleNumberInput(e) {
    const { name, value } = e.target;

    // Allow empty value or valid number
    if (value === "" || (!isNaN(value) && Number(value) >= 0)) {
      this.product = { ...this.product, [name]: value };
    }
  }

  handleImageUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Preview images
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        this.imagePreviewUrls = [
          ...this.imagePreviewUrls,
          {
            url: event.target.result,
            isExisting: false,
            file: file,
          },
        ];
        this.requestUpdate();
      };

      reader.readAsDataURL(file);
    }
  }

  removeImage(index) {
    // If it's an existing image, add to removedImages array
    const image = this.imagePreviewUrls[index];
    if (image.isExisting) {
      this.removedImages = [...this.removedImages, image.url];
    }

    // Remove from preview array
    this.imagePreviewUrls = this.imagePreviewUrls.filter((_, i) => i !== index);
  }

  validateForm() {
    const requiredFields = ["title", "type", "category_id", "base_price"];

    for (const field of requiredFields) {
      if (!this.product[field]) {
        this.submitError = `Please fill in all required fields`;
        return false;
      }
    }

    // Validate price
    if (
      isNaN(this.product.base_price) ||
      Number(this.product.base_price) <= 0
    ) {
      this.submitError = "Please enter a valid price";
      return false;
    }

    // Validate optional numeric fields if they're not empty
    const numericFields = ["weight", "length", "width", "height"];
    for (const field of numericFields) {
      if (
        this.product[field] &&
        (isNaN(this.product[field]) || Number(this.product[field]) < 0)
      ) {
        this.submitError = `Please enter a valid value for ${field}`;
        return false;
      }
    }

    return true;
  }

  async handleSubmit(e) {
    e.preventDefault();

    this.submitError = null;

    if (!this.validateForm()) {
      return;
    }

    try {
      this.submitting = true;

      // Create FormData for file upload
      const formData = new FormData();

      // Add product data
      formData.append("title", this.product.title);
      formData.append("description", this.product.description || "");
      formData.append("type", this.product.type);
      formData.append("category_id", this.product.category_id);
      formData.append("base_price", Number(this.product.base_price));

      // Add optional fields if they have values
      if (this.product.weight)
        formData.append("weight", Number(this.product.weight));
      if (this.product.length)
        formData.append("length", Number(this.product.length));
      if (this.product.width)
        formData.append("width", Number(this.product.width));
      if (this.product.height)
        formData.append("height", Number(this.product.height));

      // Add removed images if in edit mode
      if (this.mode === "edit") {
        formData.append("removed_images", JSON.stringify(this.removedImages));
      }

      // Add new image files
      this.imagePreviewUrls.forEach((image) => {
        if (!image.isExisting && image.file) {
          formData.append("files", image.file);
        }
      });

      let response;

      if (this.mode === "new") {
        // Create new product
        response = await fetch("/api/products/", {
          method: "POST",
          body: formData,
          headers: {
            // Don't set content-type header for multipart/form-data
            // Let the browser set it with the boundary
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
      } else {
        // Update existing product
        response = await fetch(`/api/products/${this.productId}`, {
          method: "PUT",
          body: formData,
          headers: {
            // Don't set content-type header for multipart/form-data
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error saving product");
      }

      const data = await response.json();

      // Redirect to products list on success
      if (this.mode === "new") {
        window.location.href = `/craftsman/products/${data.id}`;
      } else {
        window.location.href = `/craftsman/products/${this.productId}`;
      }
    } catch (error) {
      console.error("Error saving product:", error);
      this.submitError = error.message || "Failed to save product";
    } finally {
      this.submitting = false;
    }
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading-container">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading...</p>
        </div>
      `;
    }

    return html`
      <form @submit="${this.handleSubmit}" class="product-form">
        ${this.error
          ? html`
              <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                ${this.error}
              </div>
            `
          : ""}
        ${this.submitError
          ? html`
              <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                ${this.submitError}
              </div>
            `
          : ""}

        <div class="form-grid">
          <div class="form-section">
            <h2>Basic Information</h2>

            <div class="form-group">
              <label for="title">Title <span class="required">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                .value="${this.product.title}"
                @input="${this.handleInputChange}"
                required
              />
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                name="description"
                .value="${this.product.description}"
                @input="${this.handleInputChange}"
                rows="5"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="type">Type <span class="required">*</span></label>
                <select
                  id="type"
                  name="type"
                  .value="${this.product.type}"
                  @change="${this.handleInputChange}"
                  required
                >
                  <option value="Sale">Sale</option>
                  <option value="Auction">Auction</option>
                </select>
              </div>

              <div class="form-group">
                <label for="category_id"
                  >Category <span class="required">*</span></label
                >
                <select
                  id="category_id"
                  name="category_id"
                  .value="${this.product.category_id}"
                  @change="${this.handleInputChange}"
                  required
                >
                  <option value="">Select Category</option>
                  ${this.categories.map(
                    (category) => html`
                      <option
                        value="${category.id}"
                        ?selected="${this.product.category_id === category.id}"
                      >
                        ${category.name}
                      </option>
                    `
                  )}
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="base_price">
                ${this.product.type === "Auction" ? "Base Price" : "Price"}
                <span class="required">*</span>
              </label>
              <div class="price-input">
                <span class="currency">Rs.</span>
                <input
                  type="number"
                  id="base_price"
                  name="base_price"
                  min="0"
                  step="0.01"
                  .value="${this.product.base_price}"
                  @input="${this.handleNumberInput}"
                  required
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>Specifications</h2>

            <div class="form-group">
              <label for="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                min="0"
                step="0.01"
                .value="${this.product.weight}"
                @input="${this.handleNumberInput}"
              />
            </div>

            <div class="dimensions-group">
              <label>Dimensions (cm)</label>
              <div class="form-row">
                <div class="form-group">
                  <input
                    type="number"
                    id="length"
                    name="length"
                    min="0"
                    step="0.1"
                    .value="${this.product.length}"
                    @input="${this.handleNumberInput}"
                    placeholder="Length"
                  />
                </div>

                <div class="form-group">
                  <input
                    type="number"
                    id="width"
                    name="width"
                    min="0"
                    step="0.1"
                    .value="${this.product.width}"
                    @input="${this.handleNumberInput}"
                    placeholder="Width"
                  />
                </div>

                <div class="form-group">
                  <input
                    type="number"
                    id="height"
                    name="height"
                    min="0"
                    step="0.1"
                    .value="${this.product.height}"
                    @input="${this.handleNumberInput}"
                    placeholder="Height"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="images">Images</label>
              <div class="image-upload">
                <input
                  type="file"
                  id="images"
                  name="images"
                  accept="image/*"
                  multiple
                  @change="${this.handleImageUpload}"
                />
                <label for="images" class="upload-button">
                  <i class="fas fa-cloud-upload-alt"></i>
                  Upload Images
                </label>
              </div>
            </div>

            ${this.imagePreviewUrls.length > 0
              ? html`
                  <div class="image-previews">
                    ${this.imagePreviewUrls.map(
                      (image, index) => html`
                        <div class="image-preview">
                          <img src="${image.url}" alt="Preview ${index + 1}" />
                          <button
                            type="button"
                            class="remove-image"
                            @click="${() => this.removeImage(index)}"
                          >
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      `
                    )}
                  </div>
                `
              : ""}
          </div>
        </div>

        <div class="form-actions">
          <a href="/craftsman/products" class="cancel-btn">Cancel</a>
          <button
            type="submit"
            class="submit-btn"
            ?disabled="${this.submitting}"
          >
            ${this.submitting
              ? html`<i class="fas fa-spinner fa-spin"></i>`
              : ""}
            ${this.mode === "new" ? "Create Product" : "Update Product"}
          </button>
        </div>
      </form>

      <style>
        :root {
          --dark-brown: #3e2723;
          --secondary-brown: #5d4037;
          --accent-yellow: #ffd700;
          --text-white: #ffffff;
          --subtle-grey: #e0e0e0;
        }

        .product-form {
          background-color: var(--secondary-brown);
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-section h2 {
          color: var(--accent-yellow);
          font-size: 1.3rem;
          margin: 0 0 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.75rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-row .form-group {
          margin: 0;
        }

        label {
          color: var(--subtle-grey);
          font-size: 0.9rem;
        }

        input,
        select,
        textarea {
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-white);
          padding: 0.75rem;
          border-radius: 4px;
          font-family: "Poppins", sans-serif;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: var(--accent-yellow);
          outline: none;
        }

        .price-input {
          position: relative;
        }

        .price-input .currency {
          position: absolute;
          left: 0.75rem;
          top: 0.75rem;
          color: var(--subtle-grey);
        }

        .price-input input {
          padding-left: 2.5rem;
        }

        .dimensions-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .image-upload {
          position: relative;
        }

        .image-upload input[type="file"] {
          position: absolute;
          width: 0.1px;
          height: 0.1px;
          opacity: 0;
          overflow: hidden;
          z-index: -1;
        }

        .upload-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px dashed rgba(255, 255, 255, 0.3);
          color: var(--text-white);
          padding: 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-button:hover {
          background-color: rgba(255, 215, 0, 0.2);
          border-color: var(--accent-yellow);
        }

        .upload-button i {
          font-size: 1.2rem;
          color: var(--accent-yellow);
        }

        .image-previews {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .image-preview {
          position: relative;
          width: 100%;
          padding-top: 100%;
          border-radius: 4px;
          overflow: hidden;
        }

        .image-preview img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background-color: rgba(0, 0, 0, 0.6);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .remove-image:hover {
          background-color: #f44336;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 2rem;
        }

        .cancel-btn,
        .submit-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-family: "Poppins", sans-serif;
          font-size: 1rem;
        }

        .cancel-btn {
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: var(--text-white);
          text-decoration: none;
        }

        .cancel-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .submit-btn {
          background-color: var(--accent-yellow);
          color: var(--dark-brown);
          border: none;
          cursor: pointer;
        }

        .submit-btn:hover {
          background-color: #e5c100;
        }

        .submit-btn:disabled {
          background-color: #a8a8a8;
          cursor: not-allowed;
        }

        .required {
          color: #f44336;
        }

        .error-message {
          background-color: rgba(244, 67, 54, 0.2);
          color: #f44336;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          text-align: center;
          background-color: var(--secondary-brown);
          border-radius: 8px;
          padding: 2rem;
        }

        .loading-container i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: var(--accent-yellow);
        }
      </style>
    `;
  }
}

customElements.define("craftsman-product-form", CraftsmanProductForm);
