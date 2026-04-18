import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingToggle from './components/FloatingToggle';
import Home from './pages/Home';
import Services from './pages/Services';
import Professionals from './pages/Professionals';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* User Routes */}
          <Route
            path="/*"
            element={
              <>
                <Header />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/professionals" element={<Professionals />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </main>
                <Footer />
                <FloatingToggle />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
