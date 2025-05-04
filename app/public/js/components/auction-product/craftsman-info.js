import { LitElement, html } from "https://esm.run/lit";

class CraftsmanInfo extends LitElement {
  static get properties() {
    return {
      craftsman: { type: Object },
    };
  }

  constructor() {
    super();
    this.craftsman = null;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  render() {
    if (!this.craftsman) {
      return html`
        <div class="craftsman-info-loading">
          <i class="fas fa-spinner fa-pulse"></i>
          <p>Loading craftsman details...</p>
        </div>

        <style>
          .craftsman-info-loading {
            background-color: #5d4037;
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
            margin-bottom: 1.5rem;
          }

          .craftsman-info-loading i {
            font-size: 1.5rem;
            color: #ffd700;
            margin-bottom: 0.5rem;
          }

          .craftsman-info-loading p {
            color: #e0e0e0;
          }
        </style>
      `;
    }

    return html`
      <div class="craftsman-info">
        <h3>About the Craftsman</h3>

        <div class="craftsman-details">
          <div class="craftsman-avatar">
            <i class="fas fa-user-circle"></i>
          </div>

          <div class="craftsman-data">
            <div class="craftsman-name">${this.craftsman.name}</div>
            <div class="craftsman-contact">
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                ${this.craftsman.email}
              </div>
              <div class="contact-item">
                <i class="fas fa-phone"></i>
                ${this.craftsman.phone}
              </div>
            </div>
          </div>
        </div>

        <a href="/craftsman/${this.craftsman.id}" class="view-profile">
          View Craftsman Profile
          <i class="fas fa-chevron-right"></i>
        </a>
      </div>

      <style>
        .craftsman-info {
          background-color: #5d4037;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .craftsman-info h3 {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          color: #ffffff;
        }

        .craftsman-details {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .craftsman-avatar {
          flex: 0 0 auto;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e0e0e0;
        }

        .craftsman-avatar i {
          font-size: 1.8rem;
        }

        .craftsman-data {
          flex: 1;
        }

        .craftsman-name {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }

        .craftsman-contact {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.9rem;
          color: #e0e0e0;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .view-profile {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(0, 0, 0, 0.2);
          color: #ffd700;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .view-profile:hover {
          text-decoration: underline;
        }
      </style>
    `;
  }
}

customElements.define("craftsman-info", CraftsmanInfo);
