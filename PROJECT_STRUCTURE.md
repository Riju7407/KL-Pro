# 🏠 KLPro Pvt Ltd - Home Services Booking Platform

A modern, full-stack home services booking platform built with the **MERN Stack** (MongoDB, Express.js, React, Node.js).

## 📌 Project Overview

KLPro Pvt Ltd connects customers with verified professionals for various home services including:

- 💇 Hair Services
- 💄 Salon Services
- 🧖 Spa & Wellness
- 💅 Makeup & Beauty
- 🪮 Grooming Services
- 💍 Pre-Bridal Packages

---

## ✨ Key Features

### For Customers

- ✅ Browse and search services by category
- ✅ View professional profiles with ratings
- ✅ Easy booking system with time slots
- ✅ Track booking history and status
- ✅ Rate and review professionals
- ✅ Secure user authentication
- ✅ Manage profile and preferences

### For Professionals

- ✅ Create and manage services
- ✅ Set pricing and availability
- ✅ Receive booking requests
- ✅ Manage bookings and schedules
- ✅ Build rating and reviews
- ✅ Earn through verified bookings

### For Admins

- ✅ Manage all users and professionals
- ✅ Verify professional credentials
- ✅ Manage services and categories
- ✅ Monitor bookings and transactions
- ✅ Analytics and reporting

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern UI library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Responsive styling
- **Modern ES6+** - JavaScript

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **npm** - Package management
- **Git** - Version control

---

## 📦 Project Structure

```
KL-pro/
│
├── 📁 Client/                    # React Frontend
│   ├── public/                   # Static files
│   │   ├── index.html
│   │   └── kl.png               # Logo & Favicon ⭐
│   ├── src/
│   │   ├── api/                 # API integration
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   └── App.js
│   ├── .env
│   ├── Dockerfile
│   └── package.json
│
├── 📁 Server/                    # Node.js/Express Backend
│   ├── models/                  # Database schemas
│   ├── routes/                  # API endpoints
│   ├── middleware/              # Custom middleware
│   ├── server.js               # Entry point
│   ├── .env
│   ├── Dockerfile
│   └── package.json
│
├── 📄 kl.png                    # Project Logo ⭐
├── 📄 README.md                # Main documentation
├── 📄 QUICKSTART.md            # Quick start guide
├── 📄 package.json             # Root package
├── 📄 docker-compose.yml       # Docker configuration
├── 🔧 setup.bat               # Windows setup script
├── 🔧 setup.sh                # Mac/Linux setup script
└── 📄 .gitignore              # Git ignore rules
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js v14+
- MongoDB
- npm or yarn

### Installation (Windows)

1. Navigate to project root
2. Double-click `setup.bat`
3. Wait for completion

### Installation (Mac/Linux)

```bash
chmod +x setup.sh && ./setup.sh
```

### Run Development

```bash
# Terminal 1: Start Backend
cd Server && npm run dev

# Terminal 2: Start Frontend
cd Client && npm start
```

Visit: `http://localhost:3000`

### Run with Docker

```bash
docker-compose up --build
```

---

## 📡 API Endpoints & Features

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Services Management

- `GET /api/services` - Browse all services
- `GET /api/services/:id` - Service details
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Professional Profiles

- `GET /api/professionals` - List professionals
- `GET /api/professionals/:id` - Professional details
- `POST /api/professionals` - Register as professional
- `PUT /api/professionals/:id` - Update profile

### Bookings

- `GET /api/bookings` - View user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking status
- `POST /api/bookings/:id/cancel` - Cancel booking

### User Profile

- `GET /api/users/profile` - Get user info
- `PUT /api/users/profile` - Update profile

---

## 🎨 UI Features

### Pages Included

1. **Home** - Landing page with hero, stats, and services overview
2. **Services** - Browse and filter services by category
3. **Professionals** - Discover verified professionals
4. **Bookings** - Manage all bookings with status tracking
5. **Profile** - User account management and statistics

### Design Features

- ✨ Gradient color scheme (Purple & Pink)
- 📱 Fully responsive design
- ♿ Accessible UI components
- 🎯 Intuitive navigation
- ⚡ Smooth animations and transitions
- 🌙 Clean modern interface

---

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with Bcrypt
- Protected API routes with middleware
- CORS protection
- Input validation
- Secure environment variables

---

## 📊 Database Schema

### User Collection

- Profile information
- Authentication credentials
- User type (customer/professional/admin)
- Rating and reviews
- Address and contact details

### Service Collection

- Service name and description
- Category and pricing
- Duration and ratings
- Active status

### Professional Collection

- Specializations and experience
- Service offerings
- Availability schedule
- Document management
- Rating and reviews

### Booking Collection

- Customer and professional details
- Service and scheduling info
- Payment status
- Rating and feedback

---

## 🌐 Logo & Branding

**File:** `kl.png`

- **Logo**: Used in header navigation
- **Favicon**: Browser tab icon
- **Format**: PNG with transparency
- **Dimensions**: Flexible/Scalable

---

## 🐳 Docker Support

### Using Docker Compose

```bash
docker-compose up --build
```

### Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Stop Services

```bash
docker-compose down
```

---

## 🎯 Future Enhancements

- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Real-time chat with Socket.io
- [ ] Admin analytics dashboard
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Google Maps integration
- [ ] Image uploads to cloud storage
- [ ] Professional certification system
- [ ] Mobile app (React Native)
- [ ] Advanced search and filtering
- [ ] Promotional codes and discounts
- [ ] Customer support system

---

## 🧪 Testing

### Run Frontend Tests

```bash
cd Client && npm test
```

### Run Backend Tests

```bash
cd Server && npm test
```

---

## 📚 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Complete setup and run guide
- [README.md](./README.md) - Project documentation
- [./Client/README](./Client/README.md) - Frontend guide (if available)
- [./Server](./Server) - Backend documentation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - Feel free to use for personal and commercial projects.

---

## 👥 Team & Support

For issues, questions, or suggestions:

- Create an issue in the repository
- Contact: support@klservices.com
- Website: https://klservices.example.com

---

## 🎉 Getting Started Today

1. **Setup**: Run `setup.bat` (Windows) or `./setup.sh` (Mac/Linux)
2. **Configure**: Update `.env` files with your settings
3. **Connect MongoDB**: Ensure MongoDB is running
4. **Start**: Run backend and frontend
5. **Explore**: Visit http://localhost:3000

---

**Happy coding! Build amazing home services with KLPro Pvt Ltd! 🚀**

---

_Last Updated: 2024_  
_Version: 1.0.0_
