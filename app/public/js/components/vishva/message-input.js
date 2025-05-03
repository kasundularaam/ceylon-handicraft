import { LitElement, html } from "https://esm.run/lit";
import { postJson, fetchJson, patchJson } from "../../utils/api_utils.js";
import { getUser, isSignedIn } from "../../utils/auth_utils.js";

/**
 * Message Input Component
 * Input field for sending messages to Vishva
 */
class MessageInput extends LitElement {
  static get properties() {
    return {
      chatId: { type: String, attribute: "chat-id" },
      message: { type: String },
      sending: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.chatId = "";
    this.message = "";
    this.sending = false;
    this.error = null;
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

    // Listen for sample question events
    window.addEventListener(
      "vishva-sample-question",
      this.handleSampleQuestion.bind(this)
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      "vishva-sample-question",
      this.handleSampleQuestion.bind(this)
    );
  }

  handleSampleQuestion(event) {
    if (event.detail && event.detail.question) {
      this.message = event.detail.question;
      // Let the template update, then focus the input
      setTimeout(() => this.focusInput(), 0);
    }
  }

  focusInput() {
    const inputElement = this.querySelector(".message-input");
    if (inputElement) {
      inputElement.focus();
    }
  }

  handleInput(event) {
    this.message = event.target.value;
  }

  handleKeyDown(event) {
    // Send message on Enter key (without Shift)
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage() {
    // Trim the message and check if it's empty
    const messageText = this.message.trim();
    if (!messageText || this.sending) {
      return;
    }

    if (!isSignedIn()) {
      this.error = "Please sign in to send messages";
      return;
    }

    if (!this.chatId) {
      this.error = "Chat ID is missing";
      return;
    }

    this.sending = true;
    this.error = null;

    try {
      // Save the message to clear the input field immediately
      const currentMessage = messageText;
      this.message = "";

      // Check if this is the first message in the chat (for title generation)
      const needsTitle = await this.isFirstMessage();

      // Send the message to the API
      const response = await postJson(
        `/api/vishva/chats/${this.chatId}/messages`,
        {
          message: currentMessage,
        }
      );

      // If this is the first message, automatically generate a title
      if (needsTitle) {
        await this.generateTitle(currentMessage);
      }

      // Dispatch event with new messages
      if (response.user_message && response.vishva_message) {
        const event = new CustomEvent("vishva-new-message", {
          detail: {
            userMessage: response.user_message,
            vishvaMessage: response.vishva_message,
          },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      }

      this.sending = false;
    } catch (error) {
      console.error("Error sending message:", error);
      this.error = error.message || "Failed to send message";
      this.sending = false;
      // Restore the message if sending failed
      this.message = messageText;
    }
  }

  async isFirstMessage() {
    try {
      const messages = await fetchJson(
        `/api/vishva/chats/${this.chatId}/messages`
      );
      return messages.length === 0;
    } catch (error) {
      console.error("Error checking messages:", error);
      return false;
    }
  }

  async generateTitle(message) {
    try {
      // Generate a title from the message (max 50 chars)
      let title = message;
      if (title.length > 50) {
        title = title.substring(0, 47) + "...";
      }

      // Update the chat title
      await patchJson(`/api/vishva/chats/${this.chatId}`, {
        title: title,
      });

      // Update the title in the UI
      const chatTitleSpan = document.getElementById("chat-title");
      if (chatTitleSpan) {
        chatTitleSpan.textContent = title;
      }
    } catch (error) {
      console.error("Error generating title:", error);
    }
  }

  render() {
    return html`
      <div class="message-input-container ${this.sending ? "sending" : ""}">
        ${this.error
          ? html`
              <div class="input-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>${this.error}</span>
                <button
                  class="clear-error-btn"
                  @click=${() => (this.error = null)}
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            `
          : ""}

        <div class="input-row">
          <textarea
            class="message-input"
            placeholder="Type your message..."
            .value=${this.message}
            @input=${this.handleInput}
            @keydown=${this.handleKeyDown}
            ?disabled=${this.sending}
          ></textarea>

          <button
            class="send-button"
            @click=${this.sendMessage}
            ?disabled=${!this.message.trim() || this.sending}
          >
            ${this.sending
              ? html` <div class="send-spinner"></div> `
              : html` <i class="fas fa-paper-plane"></i> `}
          </button>
        </div>

        <div class="input-help">
          <span
            >Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new
            line</span
          >
        </div>
      </div>

      <style>
        .message-input-container {
          width: 100%;
        }

        .input-row {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .message-input {
          flex: 1;
          min-height: 56px;
          max-height: 150px;
          resize: none;
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--text-color, #ffffff);
          font-family: "Poppins", sans-serif;
          font-size: 1rem;
          line-height: 1.5;
          overflow-y: auto;
          transition: all 0.2s;
        }

        .message-input:focus {
          outline: none;
          border-color: var(--accent-color, #ffd700);
          background-color: rgba(0, 0, 0, 0.35);
        }

        .message-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .send-button {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--accent-color, #ffd700);
          color: var(--primary-color, #3e2723);
          border: none;
          border-radius: 50%;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .send-button:disabled {
          background-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.3);
          cursor: not-allowed;
        }

        .send-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(62, 39, 35, 0.2);
          border-top: 2px solid var(--primary-color, #3e2723);
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

        .input-help {
          display: flex;
          justify-content: flex-end;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 0.5rem;
          padding: 0 0.5rem;
        }

        .input-help kbd {
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          padding: 0.1rem 0.3rem;
          font-family: monospace;
          font-size: 0.8rem;
        }

        .input-error {
          display: flex;
          align-items: center;
          background-color: rgba(231, 76, 60, 0.2);
          color: var(--text-color, #ffffff);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .input-error i {
          color: var(--danger-color, #e74c3c);
          margin-right: 0.5rem;
        }

        .input-error span {
          flex: 1;
        }

        .clear-error-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 0.2rem;
        }

        .clear-error-btn:hover {
          color: var(--text-color, #ffffff);
        }

        .message-input-container.sending .message-input {
          background-color: rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .input-help {
            display: none;
          }
        }
      </style>
    `;
  }
}

customElements.define("message-input", MessageInput);
