# 🚀 KLPro Pvt Ltd - Quick Start Guide

## Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **MongoDB** (Local or MongoDB Atlas) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional) - [Download](https://git-scm.com/)

---

## 🔧 Installation & Setup

### Option 1: Automated Setup (Windows)

1. Navigate to the project root
2. Double-click `setup.bat`
3. Wait for all dependencies to install

### Option 2: Automated Setup (Mac/Linux)

1. Open terminal in project root
2. Run `chmod +x setup.sh && ./setup.sh`
3. Wait for all dependencies to install

### Option 3: Manual Setup

```bash
# Install root dependencies
npm install

# Install Server dependencies
cd Server
npm install

# Install Client dependencies
cd Client
npm install
cd ..
```

---

## 🏃 Running the Application

### Option 1: Development Mode (Two Terminals Required)

**Terminal 1 - Start Backend:**

```bash
cd Server
npm run dev
```

Backend runs on: `http://localhost:5000`

**Terminal 2 - Start Frontend:**

```bash
cd Client
npm start
```

Frontend runs on: `http://localhost:3000`

### Option 2: Using Concurrently (Single Terminal)

```bash
npm run dev
```

Both frontend and backend will start in one terminal.

### Option 3: Production Mode (Server Only)

```bash
cd Server
npm start
```

---

## 🐳 Docker Setup

### Prerequisites for Docker

- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)

### Run with Docker

```bash
docker-compose up --build
```

Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

To stop: `docker-compose down`

---

## 📋 Project Structure

```
KL-pro/
├── Client/                          # React Frontend
│   ├── public/
│   │   ├── index.html              # Main HTML (favicon reference)
│   │   └── kl.png                  # Logo & Favicon
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js           # Axios config with interceptors
│   │   │   └── services.js        # API call functions
│   │   ├── components/            # Reusable components
│   │   │   ├── Header.js
│   │   │   ├── Header.css
│   │   │   ├── Footer.js
│   │   │   └── Footer.css
│   │   ├── pages/                 # Page components
│   │   │   ├── Home.js & Home.css
│   │   │   ├── Services.js & Services.css
│   │   │   ├── Professionals.js & Professionals.css
│   │   │   ├── Bookings.js & Bookings.css
│   │   │   └── Profile.js & Profile.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── .env                       # Environment variables
│   ├── .gitignore
│   ├── Dockerfile                 # Docker config
│   └── package.json
│
├── Server/                          # Node.js/Express Backend
│   ├── models/                     # MongoDB Schemas
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Professional.js
│   │   └── Booking.js
│   ├── routes/                     # API Routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── services.js
│   │   ├── professionals.js
│   │   └── bookings.js
│   ├── middleware/                 # Custom Middleware
│   │   └── auth.js                # JWT authentication
│   ├── server.js                   # Main server file
│   ├── .env                        # Environment variables
│   ├── .gitignore
│   ├── Dockerfile                  # Docker config
│   └── package.json
│
├── kl.png                          # Logo & Favicon
├── README.md                        # Project documentation
├── package.json                     # Root package.json
├── docker-compose.yml              # Docker compose config
├── setup.bat                        # Windows setup script
├── setup.sh                         # Mac/Linux setup script
└── QUICKSTART.md                    # This file

```

---

## 🔐 Environment Variables

### Server (.env)

```env
MONGODB_URI=mongodb://localhost:27017/kl-services
JWT_SECRET=kl_services_secret_key_2024
PORT=5000
NODE_ENV=development
```

### Client (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints Reference

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Services

- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (admin)
- `PUT /api/services/:id` - Update service (admin)
- `DELETE /api/services/:id` - Delete service (admin)

### Professionals

- `GET /api/professionals` - Get all professionals
- `GET /api/professionals/:id` - Get professional details
- `POST /api/professionals` - Create professional profile
- `PUT /api/professionals/:id` - Update professional profile

### Bookings

- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking status
- `POST /api/bookings/:id/cancel` - Cancel booking

---

## 📁 Frontend Pages

1. **Home** (`/`) - Landing page with features and statistics
2. **Services** (`/services`) - Browse and filter services
3. **Professionals** (`/professionals`) - View professional profiles
4. **Bookings** (`/bookings`) - Manage user bookings
5. **Profile** (`/profile`) - User profile and settings

---

## 🎨 Logo & Favicon

The `kl.png` file is used as:

- **Logo**: Top-left header in navigation
- **Favicon**: Browser tab icon
- **Apple Touch Icon**: Mobile bookmark icon

---

## 🚨 Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running: `mongod` (Windows) or check services
- Verify connection string in `.env`
- For MongoDB Atlas, use connection string: `mongodb+srv://username:password@cluster.mongodb.net/kl-services`

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues

- Ensure frontend URL is correct in backend CORS config
- Check `http://localhost:3000` is not blocked

---

## 🎯 Next Steps

1. Start the application using one of the methods above
2. Open browser to `http://localhost:3000`
3. Register a new account
4. Explore services and bookings
5. Refer to API endpoints for backend integration

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Authentication](https://jwt.io/)

---

## 💡 Features to Add

- [ ] Payment gateway integration
- [ ] Real-time notifications (Socket.io)
- [ ] Admin dashboard
- [ ] Professional verification
- [ ] Image upload (Cloudinary)
- [ ] Email notifications
- [ ] Maps integration
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Feel free to fork, create issues, and submit pull requests!

---

## 📄 License

MIT License - Free to use for personal and commercial projects

---

Enjoy building with KLPro Pvt Ltd! 🎉
