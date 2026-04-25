import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingToggle from './components/FloatingToggle';
import ProfessionalRequestAlert from './components/ProfessionalRequestAlert';
import Home from './pages/Home';
import Services from './pages/Services';
import Professionals from './pages/Professionals';
import ProfessionalDetails from './pages/ProfessionalDetails';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import { CallProvider } from './context/CallContext';

function App() {
  return (
    <Router>
      <CallProvider>
        <div className="App">
          <Routes>
            {/* Admin Routes */}
<Route path="/admin/login" element={<AdminLogin />} />
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
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/professionals" element={<Professionals />} />
                      <Route path="/professionals/:id" element={<ProfessionalDetails />} />
                      <Route path="/bookings" element={<Bookings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
                    </Routes>
                  </main>
                  <Footer />
                  <FloatingToggle />
                  <ProfessionalRequestAlert />
                </>
              }
            />
          </Routes>
        </div>
      </CallProvider>
    </Router>
  );
}

export default App;
