# Ceylon Handicrafts Online Marketplace

A specialized e-commerce platform connecting Sri Lankan artisans with global consumers, offering authentic handcrafted products through an immersive digital experience that celebrates the rich heritage of Ceylon's traditional craftsmanship.

**Live Site**: [ceylonhandicraft.com](http://ceylonhandicraft.com)  
**Author**: Gimhan Ramanayake

## 🎯 Project Vision

Ceylon Handicrafts transcends the traditional marketplace model by creating an immersive digital environment that captures the essence of Sri Lankan craftsmanship while leveraging modern technology to enhance user experience. Unlike conventional marketplaces, our platform offers a cultural journey through thoughtful design, interactive AI assistance, and direct connections between craftspeople and buyers.

## ✨ Key Features

### 🛍️ Marketplace Functionality
- **Dual Sales Models**: Both direct sales and auction-based purchasing
- **Product Categories**: Wood carvings, Sri Lankan masks, textiles, metalwork, pottery, lacquerware, and more
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
- **Secure Transactions**: JWT-based authentication with no expiration
- **Order Management**: Complete order tracking and management system

## 🏗️ Technology Stack

### Backend
- **Framework**: Python FastAPI with Flash Feather architecture
- **Database**: SQLAlchemy ORM with SQLite/PostgreSQL support
- **Authentication**: JWT tokens with secure user management
- **Validation**: Pydantic for request/response validation
- **File Handling**: Image upload and management system

### Frontend
- **Components**: Lit.js web components without Shadow DOM
- **Templating**: Jinja2 for page structure
- **Styling**: Custom CSS with responsive design
- **State Management**: URL-based state persistence
- **API Communication**: Native fetch with error handling

### AI Integration
- **LLM**: Google Gemini Flash 2 for Vishva AI assistant
- **Knowledge Base**: Specialized PDF library (vishva-library)
- **Context Awareness**: Cultural and product-specific information

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip package manager
- Virtual environment (recommended)

### Local Development Setup

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run Application**
   ```bash
   cd ceylon-handicrafts
   python -m app.main
   ```

4. **Access Application**
   - Frontend: http://localhost:8000

## 🎨 Design System

### Color Palette
- **Primary**: Dark Brown (#3E2723) - Warm, authentic ambiance
- **Secondary**: Medium Brown (#5D4037) - Gradients and variations
- **Accent**: Bright Yellow (#FFD700) - Call-to-action elements
- **Text**: White (#FFFFFF) - Primary text color
- **Secondary Text**: Light Grey (#E0E0E0) - Subtle information

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Hierarchy**: Clear heading structure with consistent sizing

### Component Architecture
- **Reusable Components**: Global product cards, form elements
- **Page-Specific Components**: Category headers, product galleries
- **Utility Components**: Loading states, error handling

## 🔧 Development Guidelines

### Flash Feather Principles
1. **Minimalism**: Keep code simple and avoid unnecessary abstractions
2. **Clean Structure**: Organized project layout with clear separation of concerns
3. **Direct Approach**: Avoid over-engineering and unnecessary layers
4. **LLM-Friendly**: Code patterns that work well with AI assistance

### Code Standards
- **Database Operations**: Use SQLAlchemy directly in routes for simple operations
- **Service Layer**: Only for complex multi-step business logic
- **Component Structure**: Lit.js components without Shadow DOM
- **API Design**: RESTful endpoints with consistent naming
- **Error Handling**: Comprehensive error states and user feedback

### File Organization
- Components grouped by functionality (global, landing, category, product)
- API routes organized by domain area
- Utility functions separated by purpose
- Templates follow page hierarchy

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

## 🤝 Contributing

We welcome contributions from developers, designers, and cultural enthusiasts who share our vision of preserving and promoting Sri Lankan handicrafts.

### Development Process
1. Fork the repository and create a feature branch
2. Follow the established code standards and architecture patterns
3. Test your changes thoroughly across different devices
4. Submit detailed pull requests with clear descriptions
5. Participate in code reviews and address feedback

### Areas of Contribution
- **Frontend Development**: New components and user interface improvements
- **Backend Development**: API enhancements and performance optimizations
- **Cultural Content**: Expanding the Vishva AI knowledge base
- **Testing**: Automated testing and quality assurance
- **Documentation**: Improving guides and API documentation

## 📄 License

This project is proprietary software. All rights reserved by the author and contributors. Unauthorized copying, distribution, or modification is strictly prohibited.

## 🎯 Future Roadmap

### Phase 1: Core Enhancement
- Advanced search and filtering capabilities
- Enhanced auction features with real-time bidding
- Mobile application development
- Payment gateway integration

### Phase 2: Community Features
- Artisan community forums
- Customer review and rating system
- Social sharing and wishlists
- Newsletter and notification system

### Phase 3: Global Expansion
- Multi-language support
- International shipping integration
- Regional payment methods
- Cultural exchange programs

## 📞 Contact & Support

For questions, feedback, or collaboration opportunities:

**Author**: Gimhan Ramanayake  
**Project**: Ceylon Handicrafts Online Marketplace  
**Website**: [ceylonhandicraft.com](http://ceylonhandicraft.com)

---

*Celebrating the timeless artistry of Sri Lankan handicrafts through modern digital innovation.*