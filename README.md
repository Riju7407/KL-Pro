# KLPro Pvt Ltd - MERN Stack

A modern home services booking platform built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **User Authentication**: Register and login with email/password
- **Service Browsing**: Browse various home services by category
- **Professional Directory**: Find and view professional profiles
- **Booking System**: Book services with professionals
- **User Profiles**: Manage personal information and booking history
- **Rating & Reviews**: Rate and review services and professionals
- **Multiple User Types**: Support for customers, professionals, and admins

## Project Structure

```
KL-pro/
├── Client/                 # React Frontend
│   ├── public/            # Static files and favicon
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── Server/                 # Node.js/Express Backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── controllers/       # Business logic
│   ├── server.js          # Entry point
│   └── package.json
│
└── kl.png                 # Logo and favicon
```

## Tech Stack

### Frontend

- React 18
- React Router DOM
- Axios (API calls)
- CSS3

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (Authentication)
- Bcrypt (Password hashing)

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Install Backend Dependencies**

   ```bash
   cd Server
   npm install
   ```

2. **Install Frontend Dependencies**

   ```bash
   cd ../Client
   npm install
   ```

3. **Configure Environment Variables**
   - In `Server/`, copy `.env.example` to `.env` and update values:
   ```env
   MONGODB_URI=mongodb://localhost:27017/kl-services
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

## Running the Application

### Development

**Terminal 1 - Start Backend:**

```bash
cd Server
npm run dev
```

The server will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**

```bash
cd Client
npm start
```

The app will run on `http://localhost:3000`

### Production

**Build Frontend:**

```bash
cd Client
npm run build
```

**Start Backend:**

```bash
cd Server
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin)

### Services

- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (admin)
- `PUT /api/services/:id` - Update service (admin)
- `DELETE /api/services/:id` - Delete service (admin)

### Professionals

- `GET /api/professionals` - Get all professionals
- `GET /api/professionals/:id` - Get professional by ID
- `POST /api/professionals` - Create professional profile
- `PUT /api/professionals/:id` - Update professional profile

### Bookings

- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking status
- `POST /api/bookings/:id/cancel` - Cancel booking

## Features to Implement

- [ ] Payment integration (Razorpay/Stripe)
- [ ] Real-time notifications (Socket.io)
- [ ] Admin dashboard
- [ ] Professional verification system
- [ ] Image upload (Cloudinary)
- [ ] Search and filtering
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Maps integration
- [ ] Analytics dashboard

## Logo & Favicon

The `kl.png` file is used as:

- Website logo (top-left header)
- Favicon (browser tab icon)

## License

MIT License

## Support

For issues and feature requests, create an issue in the repository.

## Author

KLPro Pvt Ltd Team
