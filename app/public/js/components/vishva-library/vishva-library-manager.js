import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class VishvaLibraryManager extends LitElement {
  static get properties() {
    return {
      files: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.files = [];
    this.loading = true;
    this.error = null;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchFiles();
  }

  async fetchFiles() {
    try {
      this.loading = true;
      this.error = null;

      const files = await fetchJson("/api/vishva-library/files");
      this.files = files;
    } catch (err) {
      console.error("Error fetching files:", err);
      this.error = err.message || "Failed to fetch library files";
    } finally {
      this.loading = false;
    }
  }

  handleFileUploaded(e) {
    const fileData = e.detail;
    this.files = [...this.files, fileData];
  }

  handleFileDeleted(e) {
    const { fileId } = e.detail;
    this.files = this.files.filter((file) => file.id !== fileId);
  }

  render() {
    return html`
      <div class="vishva-library-manager">
        <div class="manager-content">
          <vishva-file-uploader
            @file-uploaded=${this.handleFileUploaded}
          ></vishva-file-uploader>

          ${this.loading
            ? html`<div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i> Loading library files...
              </div>`
            : this.error
            ? html`<div class="error-message">
                <i class="fas fa-exclamation-triangle"></i> ${this.error}
                <button @click=${this.fetchFiles}>Retry</button>
              </div>`
            : html`<vishva-file-list
                .files=${this.files}
                @file-deleted=${this.handleFileDeleted}
              ></vishva-file-list>`}
        </div>
      </div>

      <style>
        .vishva-library-manager {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .manager-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 1rem;
        }

        .loading-indicator,
        .error-message {
          padding: 2rem;
          border-radius: 8px;
          text-align: center;
          font-size: 1.1rem;
        }

        .loading-indicator {
          background-color: rgba(255, 215, 0, 0.1);
        }

        .error-message {
          background-color: rgba(255, 0, 0, 0.1);
          color: #ff6b6b;
        }

        .error-message button {
          margin-left: 1rem;
          background-color: #ffd700;
          color: #3e2723;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .error-message button:hover {
          background-color: #e6c300;
        }
      </style>
    `;
  }
}

customElements.define("vishva-library-manager", VishvaLibraryManager);
