import { LitElement, html } from "https://esm.run/lit";
import { deleteJson } from "../../utils/api_utils.js";

class VishvaFileList extends LitElement {
  static get properties() {
    return {
      files: { type: Array },
      deleteInProgress: { type: Object },
    };
  }

  constructor() {
    super();
    this.files = [];
    this.deleteInProgress = {};
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  async deleteFile(fileId, fileName) {
    if (this.deleteInProgress[fileId]) return;

    // Ask for confirmation
    if (
      !confirm(
        `Are you sure you want to remove "${fileName}" from the library?`
      )
    ) {
      return;
    }

    try {
      // Set delete in progress for this file
      this.deleteInProgress = { ...this.deleteInProgress, [fileId]: true };
      this.requestUpdate();

      // Delete the file
      await deleteJson(`/api/vishva-library/files/${fileId}`);

      // Dispatch event to parent
      this.dispatchEvent(
        new CustomEvent("file-deleted", {
          detail: { fileId },
          bubbles: true,
          composed: true,
        })
      );
    } catch (err) {
      console.error("Error deleting file:", err);
      alert(`Failed to delete file: ${err.message || "Unknown error"}`);
    } finally {
      // Clear delete in progress
      const newDeleteInProgress = { ...this.deleteInProgress };
      delete newDeleteInProgress[fileId];
      this.deleteInProgress = newDeleteInProgress;
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  render() {
    if (!this.files.length) {
      return html`
        <div class="empty-library">
          <i class="fas fa-book-open"></i>
          <p>No PDF files in the Vishva Library.</p>
          <p class="empty-subtitle">
            Upload PDF files using the form above to add them to the library.
          </p>
        </div>
      `;
    }

    return html`
      <div class="vishva-file-list">
        <h2>Library Files (${this.files.length})</h2>
        <div class="file-list-container">
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.files.map(
                (file) => html`
                  <tr>
                    <td class="file-name">
                      <i class="fas fa-file-pdf"></i>
                      <span>${file.name}</span>
                    </td>
                    <td>${this.formatFileSize(file.size)}</td>
                    <td>${this.formatDate(file.created_at)}</td>
                    <td class="actions">
                      <a
                        href="/api/vishva-library/files/${file.id}/download"
                        class="action-btn download"
                        title="Download File"
                        target="_blank"
                      >
                        <i class="fas fa-download"></i>
                      </a>
                      <button
                        @click=${() => this.deleteFile(file.id, file.name)}
                        class="action-btn delete"
                        title="Delete File"
                        ?disabled=${this.deleteInProgress[file.id]}
                      >
                        ${this.deleteInProgress[file.id]
                          ? html`<i class="fas fa-spinner fa-spin"></i>`
                          : html`<i class="fas fa-trash"></i>`}
                      </button>
                    </td>
                  </tr>
                `
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>
        .vishva-file-list {
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

        .file-list-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          color: #e0e0e0;
        }

        th {
          text-align: left;
          padding: 1rem;
          background-color: rgba(62, 39, 35, 0.8);
          color: #ffd700;
          font-weight: 500;
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 215, 0, 0.2);
        }

        tr:last-child td {
          border-bottom: none;
        }

        .file-name {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .file-name i {
          color: #ffd700;
          font-size: 1.2rem;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: none;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #ffffff;
          text-decoration: none;
        }

        .action-btn.download {
          background-color: rgba(255, 215, 0, 0.2);
        }

        .action-btn.download:hover {
          background-color: rgba(255, 215, 0, 0.4);
        }

        .action-btn.delete {
          background-color: rgba(255, 0, 0, 0.2);
        }

        .action-btn.delete:hover {
          background-color: rgba(255, 0, 0, 0.4);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-library {
          text-align: center;
          padding: 3rem 1rem;
          background-color: rgba(93, 64, 55, 0.4);
          border-radius: 8px;
          color: #e0e0e0;
        }

        .empty-library i {
          font-size: 3rem;
          color: #ffd700;
          margin-bottom: 1rem;
        }

        .empty-library p {
          font-size: 1.2rem;
          margin: 0.5rem 0;
        }

        .empty-subtitle {
          font-size: 1rem !important;
          opacity: 0.8;
        }
      </style>
    `;
  }
}

customElements.define("vishva-file-list", VishvaFileList);
