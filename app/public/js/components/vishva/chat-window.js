import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";
import { getUser } from "../../utils/auth_utils.js";

/**
 * Chat Window Component
 * Displays messages between the user and Vishva
 */
class ChatWindow extends LitElement {
  static get properties() {
    return {
      chatId: { type: String, attribute: "chat-id" },
      messages: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
      lastFetchTime: { type: Number },
      vishvaIsTyping: { type: Boolean }, // New property for Vishva typing indicator
    };
  }

  constructor() {
    super();
    this.chatId = "";
    this.messages = [];
    this.loading = true;
    this.error = null;
    this.lastFetchTime = 0;
    this.refreshInterval = null;
    this.vishvaIsTyping = false; // Initialize typing state
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();

    // Check URL parameters if chat-id is not provided as attribute
    if (!this.chatId) {
      const urlParams = new URLSearchParams(window.location.search);
      this.chatId = urlParams.get("id");
    }

    // Load initial messages
    this.fetchMessages();

    // Set up polling for new messages
    this.refreshInterval = setInterval(() => {
      this.checkForNewMessages();
    }, 10000); // Check every 10 seconds

    // Listen for new message events from message-input component
    window.addEventListener(
      "vishva-new-message",
      this.handleNewMessage.bind(this)
    );

    // Listen for Vishva typing events
    window.addEventListener(
      "vishva-typing",
      this.handleVishvaTyping.bind(this)
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clear polling interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    // Remove event listeners
    window.removeEventListener(
      "vishva-new-message",
      this.handleNewMessage.bind(this)
    );

    window.removeEventListener(
      "vishva-typing",
      this.handleVishvaTyping.bind(this)
    );
  }

  async fetchMessages() {
    if (!this.chatId) {
      this.error = "No chat ID provided";
      this.loading = false;
      return;
    }

    try {
      this.loading = true;
      const fetchedMessages = await fetchJson(
        `/api/vishva/chats/${this.chatId}/messages`
      );
      this.messages = fetchedMessages || [];
      this.lastFetchTime = Date.now();
      this.loading = false;

      // Scroll to the latest message after a brief delay to allow rendering
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error("Error fetching messages:", error);
      this.error = error.message || "Failed to load messages";
      this.loading = false;
    }
  }

  async checkForNewMessages() {
    if (!this.chatId || this.loading) {
      return;
    }

    try {
      const fetchedMessages = await fetchJson(
        `/api/vishva/chats/${this.chatId}/messages?since=${this.lastFetchTime}`
      );

      if (fetchedMessages && fetchedMessages.length > 0) {
        // Merge new messages with existing ones (avoid duplicates)
        const existingIds = new Set(this.messages.map((m) => m.id));
        const newMessages = fetchedMessages.filter(
          (m) => !existingIds.has(m.id)
        );

        if (newMessages.length > 0) {
          this.messages = [...this.messages, ...newMessages];
          this.lastFetchTime = Date.now();

          // Scroll to bottom when new messages are added
          setTimeout(() => this.scrollToBottom(), 100);
        }
      }
    } catch (error) {
      console.error("Error checking for new messages:", error);
      // Don't display error for polling failures
    }
  }

  handleNewMessage(event) {
    if (event.detail) {
      const { userMessage, vishvaMessage } = event.detail;
      if (userMessage) {
        // Add user message immediately
        this.messages = [...this.messages, userMessage];

        // Show Vishva typing indicator
        this.vishvaIsTyping = true;

        // Scroll to bottom when new message is added
        setTimeout(() => this.scrollToBottom(), 100);

        // If we already have Vishva's response, add it after a delay
        if (vishvaMessage) {
          setTimeout(() => {
            this.vishvaIsTyping = false;
            this.messages = [...this.messages, vishvaMessage];
            setTimeout(() => this.scrollToBottom(), 100);
          }, 1000); // Show typing indicator for at least 1 second
        }
      }
    }
  }

  handleVishvaTyping(event) {
    if (event.detail && typeof event.detail.isTyping === "boolean") {
      this.vishvaIsTyping = event.detail.isTyping;
      if (this.vishvaIsTyping) {
        this.scrollToBottom();
      }
    }
  }

  scrollToBottom() {
    const messagesList = this.querySelector(".messages-list");
    if (messagesList) {
      messagesList.scrollTop = messagesList.scrollHeight;
    }
  }

  formatTimestamp(timestamp) {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    // Format: HH:MM for today, MM/DD HH:MM for other days
    const timeOptions = { hour: "2-digit", minute: "2-digit" };
    const time = date.toLocaleTimeString(undefined, timeOptions);

    if (isToday) {
      return time;
    } else {
      const dateOptions = { month: "numeric", day: "numeric" };
      const dateStr = date.toLocaleDateString(undefined, dateOptions);
      return `${dateStr} ${time}`;
    }
  }

  renderLoadingIndicator() {
    return html`
      <div class="chat-loading">
        <div class="loading-spinner"></div>
        <p>Loading messages...</p>
      </div>
    `;
  }

  renderErrorMessage() {
    return html`
      <div class="chat-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${this.error}</p>
        <button @click=${this.fetchMessages}>Try Again</button>
      </div>
    `;
  }

  renderEmptyState() {
    return html`
      <div class="chat-empty">
        <div class="empty-icon">
          <i class="fas fa-comments"></i>
        </div>
        <h3>Start Your Conversation with Vishva</h3>
        <p>
          Ask about Sri Lankan handicrafts, cultural heritage, or get assistance
          with finding the perfect artisan creation.
        </p>
        <div class="sample-questions">
          <h4>Sample Questions</h4>
          <button
            class="sample-question-btn"
            @click=${() =>
              this.triggerSampleQuestion(
                "Tell me about traditional Sri Lankan masks"
              )}
          >
            Tell me about traditional Sri Lankan masks
          </button>
          <button
            class="sample-question-btn"
            @click=${() =>
              this.triggerSampleQuestion(
                "What materials are used in Ceylon handicrafts?"
              )}
          >
            What materials are used in Ceylon handicrafts?
          </button>
          <button
            class="sample-question-btn"
            @click=${() =>
              this.triggerSampleQuestion(
                "Can you recommend unique wooden crafts?"
              )}
          >
            Can you recommend unique wooden crafts?
          </button>
        </div>
      </div>
    `;
  }

  renderVishvaTypingIndicator() {
    return html`
      <div class="message-item vishva-message vishva-typing">
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;
  }

  triggerSampleQuestion(question) {
    const event = new CustomEvent("vishva-sample-question", {
      detail: { question },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  renderMessageItem(message) {
    // Check the is_from_user flag from the API response
    const isUser = message.is_from_user === true;

    // Get message content from wherever it might be stored
    const messageContent = message.content || message.message || "";

    return html`
      <div class="message-item ${isUser ? "user-message" : "vishva-message"}">
        <div class="message-content">
          <div class="message-text">${messageContent}</div>
          <div class="message-time">
            ${this.formatTimestamp(message.created_at)}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="chat-window">
        ${this.loading
          ? this.renderLoadingIndicator()
          : this.error
          ? this.renderErrorMessage()
          : html`
              <div class="messages-list">
                ${this.messages.length === 0
                  ? this.renderEmptyState()
                  : this.messages.map((message) =>
                      this.renderMessageItem(message)
                    )}
                ${this.vishvaIsTyping ? this.renderVishvaTypingIndicator() : ""}
              </div>
            `}
      </div>

      <style>
        .chat-window {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .messages-list {
          height: 100%;
          width: 100%;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message-item {
          display: flex;
          max-width: 85%;
          width: fit-content; /* Ensures the message only takes up needed space */
        }

        .user-message {
          align-self: flex-end;
          margin-left: auto; /* Ensures right alignment without overflow */
          margin-right: 20px; /* Increased space from the right edge */
          max-width: 85%; /* Limit width to prevent overflow */
        }

        .vishva-message {
          align-self: flex-start;
        }

        .message-content {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          position: relative;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          width: 100%; /* Ensure content uses full available width */
          word-wrap: break-word; /* Ensure long words break */
        }

        .user-message .message-content {
          background-color: var(--accent-color, #ffd700);
          color: var(--primary-color, #3e2723);
          border-bottom-right-radius: 4px;
          font-weight: 500;
        }

        .vishva-message .message-content {
          background-color: rgba(0, 0, 0, 0.25);
          color: var(--text-color, #ffffff);
          border-bottom-left-radius: 4px;
        }

        .message-text {
          font-size: 1rem;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: break-word; /* Help with long words */
        }

        .user-message .message-text {
          color: var(--primary-color, #3e2723);
          font-weight: 500;
        }

        .vishva-message .message-text {
          color: var(--text-color, #ffffff);
          font-weight: normal;
        }

        .message-time {
          font-size: 0.7rem;
          opacity: 0.8;
          text-align: right;
          margin-top: 0.25rem;
        }

        .user-message .message-time {
          color: var(--primary-color, #3e2723);
          opacity: 0.6;
        }

        .vishva-message .message-time {
          color: var(--text-secondary, #e0e0e0);
        }

        /* Loading indicator */
        .chat-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-secondary, #e0e0e0);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top: 3px solid var(--accent-color, #ffd700);
          border-radius: 50%;
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

        /* Vishva Typing Indicator */
        .vishva-typing .message-content {
          min-width: 70px; /* Minimum width for the typing indicator */
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 20px;
        }

        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 2px;
          background-color: var(--accent-color, #ffd700);
          border-radius: 50%;
          display: inline-block;
          opacity: 0.7;
        }

        .typing-indicator span:nth-child(1) {
          animation: bounce 1.2s infinite 0.1s;
        }
        .typing-indicator span:nth-child(2) {
          animation: bounce 1.2s infinite 0.3s;
        }
        .typing-indicator span:nth-child(3) {
          animation: bounce 1.2s infinite 0.5s;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        /* Error state */
        .chat-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-secondary, #e0e0e0);
          padding: 1rem;
          text-align: center;
        }

        .chat-error i {
          font-size: 2rem;
          color: var(--danger-color, #e74c3c);
          margin-bottom: 1rem;
        }

        .chat-error button {
          background-color: var(--accent-color, #ffd700);
          color: var(--primary-color, #3e2723);
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          margin-top: 1rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .chat-error button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        /* Empty state */
        .chat-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary, #e0e0e0);
          max-width: 600px;
          margin: auto;
        }

        .empty-icon {
          font-size: 3rem;
          color: var(--accent-color, #ffd700);
          opacity: 0.7;
          margin-bottom: 1rem;
        }

        .chat-empty h3 {
          margin: 0.5rem 0;
          color: var(--accent-color, #ffd700);
        }

        .chat-empty p {
          margin-bottom: 2rem;
        }

        .sample-questions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sample-questions h4 {
          margin: 0 0 0.5rem 0;
          color: var(--accent-color, #ffd700);
          font-size: 1rem;
        }

        .sample-question-btn {
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 215, 0, 0.3);
          color: var(--text-color, #ffffff);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .sample-question-btn:hover {
          background-color: rgba(255, 215, 0, 0.1);
          border-color: var(--accent-color, #ffd700);
        }

        @media (max-width: 768px) {
          .message-item {
            max-width: 90%;
          }

          .user-message {
            max-width: 90%;
          }

          .chat-empty {
            padding: 1rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("chat-window", ChatWindow);
