import { LitElement, html } from "https://esm.run/lit";
import { postJson } from "../../utils/api_utils.js";
import { getUser, isSignedIn } from "../../utils/auth_utils.js";

class NewChatButton extends LitElement {
  static get properties() {
    return {
      size: { type: String },
      creating: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.size = "medium"; // small, medium, large
    this.creating = false;
    this.error = null;
  }

  createRenderRoot() {
    return this;
  }

  async createNewChat() {
    if (!isSignedIn()) {
      window.location.href = "/auth/login";
      return;
    }

    this.creating = true;
    this.error = null;

    try {
      const user = getUser();
      const newChat = await postJson("/api/vishva/chats", {
        user_id: user.id,
        title: "New Chat",
      });

      window.location.href = `/vishva/chat?id=${newChat.id}`;
    } catch (error) {
      console.error("Error creating new chat:", error);
      this.error = error.message || "Failed to create new chat";
      this.creating = false;
    }
  }

  render() {
    return html`
      <div class="new-chat-button-container ${this.size}">
        ${this.error
          ? html`
              <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <span>${this.error}</span>
              </div>
            `
          : ""}

        <button
          @click=${this.createNewChat}
          class="new-chat-button"
          ?disabled=${this.creating}
        >
          ${this.creating
            ? html` <span class="button-spinner"></span> Creating... `
            : html` <i class="fas fa-plus-circle"></i> New Chat `}
        </button>
      </div>

      <style>
        .new-chat-button-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0.5rem 0;
        }

        .new-chat-button-container.large .new-chat-button {
          font-size: 1.1rem;
          padding: 0.8rem 1.5rem;
        }

        .new-chat-button-container.small .new-chat-button {
          font-size: 0.85rem;
          padding: 0.4rem 0.8rem;
        }

        .new-chat-button {
          background-color: var(--accent-color, #ffd700);
          color: var(--primary-color, #3e2723);
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-family: inherit;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .new-chat-button:hover:not(:disabled) {
          background-color: #e6c300;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
        }

        .new-chat-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .button-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(62, 39, 35, 0.3);
          border-top: 2px solid #3e2723;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .error-message {
          background-color: rgba(231, 76, 60, 0.2);
          border-radius: 6px;
          padding: 0.6rem 1rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ffffff;
          width: 100%;
          max-width: 300px;
          font-size: 0.9rem;
        }

        .error-message i {
          color: #e74c3c;
        }
      </style>
    `;
  }
}

customElements.define("new-chat-button", NewChatButton);
