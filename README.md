# Ceylon Handicrafts Online Marketplace

[![Flash Feather](https://img.shields.io/badge/Built%20with-Flash%20Feather-orange.svg)](https://github.com/kasundularaam/flash-feather-starter)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![Lit.js](https://img.shields.io/badge/Lit.js-3.0+-orange.svg)](https://lit.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A specialized e-commerce platform connecting Sri Lankan artisans with global consumers, offering authentic handcrafted products through an immersive digital experience that celebrates the rich heritage of Ceylon's traditional craftsmanship.

> **🏗️ Built with [Flash Feather Framework](https://github.com/kasundularaam/flash-feather-starter)** - An experimental LLM-friendly web framework designed for rapid development.

> **📝 Note**: The live site is no longer running, but this serves as a portfolio demonstration of the Flash Feather framework capabilities.

## 🎯 Project Vision

Ceylon Handicrafts transcends the traditional marketplace model by creating an immersive digital environment that captures the essence of Sri Lankan craftsmanship while leveraging modern technology to enhance user experience. This project demonstrates the power of the Flash Feather framework for building complex e-commerce applications with AI integration.

## ✨ Key Features

### 🛍️ Marketplace Functionality
- **Dual Sales Models**: Both direct sales and auction-based purchasing
- **Product Categories**: Wood carvings, Sri Lankan masks, textiles, metalwork, pottery, lacquerware
- **Advanced Filtering**: Sort by price, popularity, category, and product type
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🤖 Vishva AI Assistant
- **Intelligent Guide**: AI-powered virtual assistant with comprehensive knowledge of Ceylon's handicraft traditions
- **Cultural Context**: Provides historical information, techniques, and cultural significance
- **Personalized Recommendations**: Suggests products based on user preferences and interests
- **Real-time Support**: Instant assistance with navigation and product information

### 🎨 Immersive Design Experience
- **Authentic Ambiance**: Dark brown color theme (#3E2723) evoking traditional handicraft shops
- **Visual Hierarchy**: Bright yellow accents (#FFD700) for important interface elements
- **Cultural Integration**: Design elements that celebrate Sri Lankan heritage
- **Interactive Components**: Dynamic product galleries with slideshow functionality

### 👥 User Experience
- **Artisan Profiles**: Direct connection with craftspeople and their stories
- **Product Discovery**: Categories, search, and recommendation systems
- **Secure Transactions**: JWT-based authentication with Flash Feather's auth system
- **Order Management**: Complete order tracking and management system

## 🏗️ Technology Stack

### Flash Feather Framework Architecture
Built entirely using the **Flash Feather framework** - a custom LLM-friendly web framework that combines:

- **Backend**: Python FastAPI with Flash Feather's clean architecture patterns
- **Database**: SQLAlchemy ORM following Flash Feather conventions
- **Authentication**: Flash Feather's JWT system with secure user management
- **Component System**: Flash Feather's UID-based component isolation
- **Templating**: Jinja2 with Flash Feather's template structure

### Core Technologies
- **Framework**: [Flash Feather](https://github.com/kasundularaam/flash-feather-starter) (Custom LLM-friendly framework)
- **Database**: SQLAlchemy ORM with SQLite
- **Frontend**: Lit.js web components with UID isolation system
- **Styling**: CSS variables following Flash Feather's theming system
- **AI Integration**: Google Gemini Flash 2 for Vishva AI assistant
- **File Handling**: Flash Feather's environment-aware file management

### AI Integration
- **LLM**: Google Gemini Flash 2 for Vishva AI assistant
- **Knowledge Base**: Specialized PDF library (vishva-library)
- **Context Awareness**: Cultural and product-specific information

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Flash Feather framework knowledge (see [docs](https://github.com/kasundularaam/flash-feather-starter))

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/kasundularaam/ceylon-handicraft.git
   cd ceylon-handicraft
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run Application**
   ```bash
   python -m app.main
   ```

6. **Access Application**
   - Frontend: http://localhost:8000
   - Admin account auto-created on first run

## 🎨 Design System

### Color Palette
- **Primary**: Dark Brown (#3E2723) - Warm, authentic ambiance
- **Secondary**: Medium Brown (#5D4037) - Gradients and variations
- **Accent**: Bright Yellow (#FFD700) - Call-to-action elements
- **Text**: White (#FFFFFF) - Primary text color
- **Secondary Text**: Light Grey (#E0E0E0) - Subtle information

### Flash Feather Component Architecture
Following Flash Feather's UID system for component isolation:

```
static/js/components/
├── global/                    # Reusable components (cc01-cc10)
├── landing/                   # Landing page components (cc11-cc20)
├── category/                  # Category page components (cc21-cc30)
├── product/                   # Product page components (cc31-cc40)
└── checkout/                  # Checkout components (cc41-cc50)
```

Each component follows Flash Feather's UID naming convention:
- **File**: `{component_name}_cc{XX}.js`
- **CSS Classes**: `.cc{XX}-{class-name}`
- **HTML IDs**: `cc{XX}-{element-name}`

## 📁 Project Structure

```
ceylon-handicrafts/
├── app/                       # Flash Feather backend structure
│   ├── main.py               # FastAPI app with Flash Feather setup
│   ├── database.py           # Flash Feather database configuration
│   ├── models.py             # SQLAlchemy models
│   ├── routes/               # API routes organized by domain
│   ├── services/             # Business logic services
│   └── templates/            # Jinja2 templates
├── static/                   # Frontend assets (Flash Feather structure)
│   ├── css/                  # CSS with Flash Feather variables
│   └── js/components/        # UID-based Lit.js components
├── uploads/                  # Flash Feather file storage
├── vishva-library/           # AI knowledge base PDFs
└── database.db              # SQLite database
```

## 🌟 Product Categories

1. **Wood Carvings & Art** - Traditional carved figures and decorative items
2. **Sri Lankan Masks** - Ceremonial and decorative masks with cultural significance
3. **Handwoven & Batik** - Textiles featuring traditional patterns and techniques
4. **Brass & Metal Art** - Decorative and functional metal crafts
5. **Pottery & Ceramics** - Traditional clay vessels and decorative items
6. **Lacquerware Treasures** - Wood items with vibrant lacquer finishes
7. **Natural Fiber Weaves** - Baskets and decorative items from local fibers
8. **Coir Crafts** - Items made from coconut husk fibers
9. **Island Gem & Jewelry** - Traditional and contemporary jewelry with local gems

## 🔧 Flash Feather Development Patterns

This project demonstrates several Flash Feather framework capabilities:

### 1. Environment-Aware Configuration
```python
# Automatic development/production path handling
DATABASE_PATH = get_database_path()  # Flash Feather utility
UPLOAD_PATH = get_uploads_path()     # Environment-aware storage
```

### 2. UID Component Isolation
```javascript
// cc15-product-gallery component
class ProductGallery extends LitElement {
  render() {
    return html`
      <div class="cc15-gallery">
        <img class="cc15-main-image" />
        <div class="cc15-thumbnails"></div>
      </div>
      <style>
        .cc15-gallery { background: var(--bg); }
        .cc15-main-image { border-radius: var(--radius-md); }
      </style>
    `;
  }
}
```

### 3. Schema-Free API Design
```python
# Direct request handling without separate schemas
@router.post("/products")
async def create_product(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    # Direct validation and processing
```

### 4. CSS Variables Theming
```css
:root {
  /* Flash Feather + Ceylon Handicrafts theme */
  --primary: #3E2723;
  --accent: #FFD700;
  --bg: var(--primary);
  --text: #FFFFFF;
}
```

## 🤝 Contributing

This project serves as a comprehensive example of Flash Feather framework capabilities. Contributions welcome for:

- **Flash Feather Enhancements**: Improvements to the framework patterns
- **Component Library**: Additional UID-based components
- **Performance Optimizations**: Flash Feather-specific optimizations
- **Documentation**: Framework usage examples and best practices

## 📄 License

MIT License - feel free to use this project as a reference for Flash Feather development.

## 🎯 Framework Showcase

This project demonstrates:

- **Full E-commerce Implementation** using Flash Feather
- **AI Integration** with LLM-friendly patterns
- **Component Architecture** with UID isolation system
- **Production Deployment** with environment-aware configuration
- **Complex State Management** using Flash Feather patterns

---

*A portfolio demonstration of the Flash Feather framework's capabilities for building modern web applications with AI assistance.*
