import { LitElement, html } from "https://esm.run/lit";
import { postJson } from "../../utils/api_utils.js";

class VishvaFileUploader extends LitElement {
  static get properties() {
    return {
      uploading: { type: Boolean },
      uploadProgress: { type: Number },
      error: { type: String },
      selectedFile: { type: Object },
      dragActive: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.uploading = false;
    this.uploadProgress = 0;
    this.error = null;
    this.selectedFile = null;
    this.dragActive = false;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  handleFileSelect(e) {
    const files = e.target.files || e.dataTransfer.files;
    if (!files || !files.length) return;

    const file = files[0];

    // Check if file is a PDF
    if (!file.type.includes("pdf")) {
      this.error = "Only PDF files are allowed";
      this.selectedFile = null;
      return;
    }

    // Check file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      this.error = "File size exceeds 20MB limit";
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.error = null;
  }

  async uploadFile() {
    if (!this.selectedFile || this.uploading) return;

    try {
      this.uploading = true;
      this.uploadProgress = 0;
      this.error = null;

      // Create form data
      const formData = new FormData();
      formData.append("file", this.selectedFile);

      // Create xhr to track progress
      const xhr = new XMLHttpRequest();

      // Setup progress tracking
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        }
      });

      // Setup promise for completion
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (err) {
              reject(new Error("Invalid response from server"));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.detail || `HTTP error ${xhr.status}`));
            } catch (e) {
              reject(new Error(`HTTP error ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error occurred"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload aborted"));
        });
      });

      // Start upload
      xhr.open("POST", "/api/vishva-library/files", true);

      // Add auth token if available
      const token = localStorage.getItem("auth_token");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.send(formData);

      // Wait for completion
      const response = await uploadPromise;

      // Dispatch success event
      this.dispatchEvent(
        new CustomEvent("file-uploaded", {
          detail: response,
          bubbles: true,
          composed: true,
        })
      );

      // Reset form
      this.selectedFile = null;

      // Reset file input
      const fileInput = this.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("Upload error:", err);
      this.error = err.message || "Failed to upload file";
    } finally {
      this.uploading = false;
    }
  }

  handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dragActive = true;
  }

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dragActive = false;
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dragActive = false;
    this.handleFileSelect(e);
  }

  triggerFileInput() {
    const fileInput = this.querySelector('input[type="file"]');
    if (fileInput) fileInput.click();
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  render() {
    return html`
      <div class="vishva-file-uploader">
        <h2>Add PDF to Vishva Library</h2>

        <div
          class="upload-area ${this.dragActive ? "drag-active" : ""}"
          @dragenter=${this.handleDragEnter}
          @dragover=${this.handleDragOver}
          @dragleave=${this.handleDragLeave}
          @drop=${this.handleDrop}
          @click=${this.triggerFileInput}
        >
          <input
            type="file"
            accept=".pdf"
            @change=${this.handleFileSelect}
            style="display: none;"
          />

          ${this.selectedFile
            ? html`
                <div class="selected-file">
                  <i class="fas fa-file-pdf"></i>
                  <div class="file-details">
                    <div class="file-name">${this.selectedFile.name}</div>
                    <div class="file-size">
                      ${this.formatFileSize(this.selectedFile.size)}
                    </div>
                  </div>
                  <button
                    class="remove-file"
                    @click=${(e) => {
                      e.stopPropagation();
                      this.selectedFile = null;
                    }}
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              `
            : html`
                <div class="upload-placeholder">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>Drag & drop PDF file here or click to browse</p>
                  <p class="upload-note">PDF files only, maximum 20MB</p>
                </div>
              `}
        </div>

        ${this.uploading
          ? html`
              <div class="upload-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    style="width: ${this.uploadProgress}%"
                  ></div>
                </div>
                <div class="progress-text">
                  Uploading: ${this.uploadProgress}%
                </div>
              </div>
            `
          : this.selectedFile
          ? html`
              <button class="upload-button" @click=${this.uploadFile}>
                <i class="fas fa-upload"></i> Upload to Library
              </button>
            `
          : null}
        ${this.error
          ? html`
              <div class="upload-error">
                <i class="fas fa-exclamation-triangle"></i> ${this.error}
              </div>
            `
          : null}
      </div>

      <style>
        .vishva-file-uploader {
          background-color: rgba(93, 64, 55, 0.4);
          border-radius: 8px;
          padding: 1.5rem;
        }

        h2 {
          color: #ffd700;
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .upload-area {
          border: 2px dashed rgba(255, 215, 0, 0.4);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-area:hover,
        .upload-area.drag-active {
          border-color: #ffd700;
          background-color: rgba(255, 215, 0, 0.1);
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #e0e0e0;
        }

        .upload-placeholder i {
          font-size: 3rem;
          color: #ffd700;
          margin-bottom: 1rem;
        }

        .upload-placeholder p {
          margin: 0.5rem 0;
        }

        .upload-note {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .selected-file {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .selected-file i {
          font-size: 2rem;
          color: #ffd700;
          margin-right: 1rem;
        }

        .file-details {
          flex: 1;
          text-align: left;
        }

        .file-name {
          font-weight: 500;
          word-break: break-all;
        }

        .file-size {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-top: 0.25rem;
        }

        .remove-file {
          background: none;
          border: none;
          color: #e0e0e0;
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-file:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .upload-button {
          margin-top: 1.5rem;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          border-radius: 4px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          transition: background-color 0.3s ease;
        }

        .upload-button:hover {
          background-color: #e6c300;
        }

        .upload-progress {
          margin-top: 1.5rem;
        }

        .progress-bar {
          height: 8px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: #ffd700;
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: center;
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: #e0e0e0;
        }

        .upload-error {
          margin-top: 1rem;
          color: #ff6b6b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
      </style>
    `;
  }
}

customElements.define("vishva-file-uploader", VishvaFileUploader);
