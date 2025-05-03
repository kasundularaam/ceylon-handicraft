import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";
import { getUser, isSignedIn } from "../../utils/auth_utils.js";

/**
 * Chat List Component
 * Displays a list of user's chat sessions with Vishva
 */
class ChatList extends LitElement {
  static get properties() {
    return {
      chats: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
      hideCreateButton: { type: Boolean, attribute: "hide-create-button" },
    };
  }

  constructor() {
    super();
    this.chats = [];
    this.loading = true;
    this.error = null;
    this.hideCreateButton = false;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadChats();
  }

  async loadChats() {
    if (!isSignedIn()) {
      this.error = "Please sign in to view your chats";
      this.loading = false;
      return;
    }

    try {
      const user = getUser();
      const chats = await fetchJson(`/api/vishva/chats?user_id=${user.id}`);
      this.chats = chats;
      this.loading = false;
    } catch (error) {
      console.error("Error loading chats:", error);
      this.error = error.message || "Failed to load chats";
      this.loading = false;
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    // Same day
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Within the last week
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return (
        date.toLocaleDateString([], { weekday: "short" }) +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }

    // Older
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  render() {
    if (this.loading) {
      return html`
        <div class="chat-list-loading">
          <div class="spinner"></div>
          <p>Loading chats...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="chat-list-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>${this.error}</p>
          ${!isSignedIn()
            ? html` <a href="/auth/login" class="primary-button">Sign In</a> `
            : html`
                <button @click=${this.loadChats} class="primary-button">
                  Try Again
                </button>
              `}
        </div>
      `;
    }

    return html`
      <div class="chat-list-container">
        <div class="chat-list-header">
          <h2>
            ${this.chats.length ? "Your Conversations" : "Your Conversations"}
          </h2>
        </div>

        ${this.chats.length === 0
          ? html`
              <div class="empty-state">
                <div class="empty-icon">
                  <i class="fas fa-comments"></i>
                </div>
                <p>
                  You haven't chatted with Vishva yet. Use the New Chat button
                  above to start a conversation about Sri Lankan handicrafts!
                </p>
              </div>
            `
          : html`
              <div class="chat-list">
                ${this.chats.map(
                  (chat) => html`
                    <a href="/vishva/chat?id=${chat.id}" class="chat-item">
                      <div class="chat-info">
                        <h3 class="chat-title">${chat.title}</h3>
                        <p class="chat-preview">
                          ${chat.last_message
                            ? chat.last_message.length > 60
                              ? chat.last_message.substring(0, 60) + "..."
                              : chat.last_message
                            : "No messages yet"}
                        </p>
                      </div>
                      <div class="chat-meta">
                        <span class="chat-date"
                          >${this.formatDate(chat.updated_at)}</span
                        >
                        <i class="fas fa-chevron-right"></i>
                      </div>
                    </a>
                  `
                )}
              </div>
            `}
      </div>

      <style>
        .chat-list-container {
          background-color: rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          padding: 1.5rem;
        }

        .chat-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .chat-list-header h2 {
          margin: 0;
          color: var(--accent-color, #ffd700);
          font-size: 1.5rem;
        }

        .chat-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .chat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          text-decoration: none;
          color: var(--text-color, #ffffff);
          transition: all 0.2s;
        }

        .chat-item:hover {
          background-color: rgba(255, 215, 0, 0.1);
          transform: translateX(4px);
        }

        .chat-info {
          flex: 1;
          min-width: 0; /* Allow text to be truncated */
        }

        .chat-title {
          margin: 0 0 0.3rem 0;
          font-size: 1.1rem;
          color: var(--text-color, #ffffff);
        }

        .chat-preview {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary, #e0e0e0);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chat-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-left: 1rem;
        }

        .chat-date {
          font-size: 0.85rem;
          color: var(--text-secondary, #e0e0e0);
        }

        .chat-meta i {
          color: var(--accent-color, #ffd700);
          font-size: 0.8rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem;
          text-align: center;
        }

        .empty-icon {
          font-size: 3rem;
          color: var(--accent-color, #ffd700);
          opacity: 0.5;
          margin-bottom: 1rem;
        }

        .empty-state p {
          color: var(--text-secondary, #e0e0e0);
          max-width: 30rem;
          line-height: 1.5;
        }

        .chat-list-loading,
        .chat-list-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          text-align: center;
        }

        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid var(--accent-color, #ffd700);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .chat-list-error i {
          color: var(--danger-color, #e74c3c);
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .chat-list-error p {
          color: var(--text-secondary, #e0e0e0);
          margin-bottom: 1.5rem;
        }

        .primary-button {
          background-color: var(--accent-color, #ffd700);
          color: var(--primary-color, #3e2723);
          border: none;
          padding: 0.7rem 1.5rem;
          border-radius: 6px;
          font-family: inherit;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: all 0.2s;
        }

        .primary-button:hover {
          background-color: #e6c300;
        }

        @media (max-width: 768px) {
          .chat-list-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("chat-list", ChatList);
