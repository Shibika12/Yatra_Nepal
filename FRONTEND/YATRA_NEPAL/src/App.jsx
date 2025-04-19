import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Payment from './assets/pages/Payment/Payment';
import AuthRoute from './utils/AuthRoute';
import TouristMessages from './assets/pages/TouristMessages/TouristMessages';
import PaymentSuccess from './assets/pages/Payment/PaymentSuccess';
import GuideBookings from './assets/pages/GuideBookings/GuideBookings';

// Page imports
import Home from "./assets/pages/Home/Home";
import Login from "./assets/pages/AuthPages/Login/Login";
import Signup from "./assets/pages/AuthPages/Signup/Signup";
import AboutUs from "./assets/pages/AboutUs/AboutUs";
import HireGuide from "./assets/pages/HireGuide/HireGuide";
import Profile from "./assets/pages/Profile/profile";
import AdminDashboard from "./assets/pages/AdminDashboard/AdminDashboard";
import { GuideValidationForm } from "./assets/pages/GuideValidation/GuideValidationForm";
import GuideDetails from "./assets/pages/GuideDetails/GuideDetails";
import AdminOverview from "./assets/pages/AdminOverview/AdminOverview";
import AdminSidebar from "./assets/components/AdminSidebar/AdminSidebar";
import AdminUsers from "./assets/pages/AdminUsers/AdminUsers";
import AdminBlogs from "./assets/pages/AdminBlogs/AdminBlogs";
import AdminReviews from "./assets/pages/AdminReviews/AdminReviews";
import AdminSettings from "./assets/pages/AdminSettings/AdminSettings";
import Blogs from './assets/pages/Blogs/Blogs';
import GuideProfile from './assets/pages/GuideProfile/GuideProfile';
import GuideDashboard from './assets/pages/GuideDashboard/GuideDashboard';
import GuideReviews from './assets/pages/GuideReviews/GuideReviews';
import GuideMessages from './assets/pages/GuideMessages/GuideMessages';
import AllBlogs from './assets/pages/AllBlogs/AllBlogs';
import AdminPayments from './assets/pages/AdminPages/AdminPayments/AdminPayments';

// Route protection components
const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  
  if (isAuthenticated) {
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else if (userRole === 'guide') {
      return <Navigate to="/guide/dashboard" />;
    }
  }
  
  return children;
};

const TouristRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");
  const userRole = (localStorage.getItem("userRole") || '').toLowerCase();
  const userData = JSON.parse(localStorage.getItem("user") || '{}');
  const userType = (userData.user_type || userData.role || '').toLowerCase();

  // Check if user is authenticated and is a tourist
  if (!isAuthenticated || (userRole !== 'tourist' && userType !== 'tourist')) {
    console.log('Tourist access denied:', { isAuthenticated, userRole, userType });
    return <Navigate to="/login" />;
  }

  return children;
};

const SemiPublicRoute = ({ children }) => {
  const userRole = localStorage.getItem("userRole");
  
  if (userRole === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  } else if (userRole === 'guide') {
    return <Navigate to="/guide/dashboard" />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!isAuthenticated || userRole !== 'admin') {
    return <Navigate to="/login" />;
  }

  return children;
};

const GuideRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = (user.role || user.user_type || '').toLowerCase();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      console.error('No token found');
      navigate('/login');
      return;
    }

    if (userRole !== 'guide') {
      console.error('Access denied: User is not a guide');
      setError('Access denied: Only guides can access this page');
      return;
    }
  }, [token, userRole]);

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        margin: '2rem auto',
        maxWidth: '600px',
        background: '#fff3f3',
        border: '1px solid #ffcdd2',
        borderRadius: '8px',
        color: '#d32f2f',
        fontSize: '1.1rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        {error}
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Semi-Public Routes - accessible to visitors and regular users, but not admins or guides */}
        <Route path="/home" element={
          <SemiPublicRoute>
            <Home />
          </SemiPublicRoute>
        } />
        <Route path="/aboutus" element={
          <SemiPublicRoute>
            <AboutUs />
          </SemiPublicRoute>
        } />
        <Route path="/hireguide" element={
          <SemiPublicRoute>
            <HireGuide />
          </SemiPublicRoute>
        } />
        <Route path="/hire-guide" element={
          <SemiPublicRoute>
            <HireGuide />
          </SemiPublicRoute>
        } />
        <Route path="/" element={<Navigate to="/home" />} />

        {/* Auth Routes - Prevent access when logged in */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />

        {/* Protected User Routes */}
        <Route path="/profile" element={
          <TouristRoute>
            <Profile />
          </TouristRoute>
        } />

        {/* Protected Guide Routes */}
        <Route path="/guide/validation" element={<GuideValidationForm />} />
        
        {/* Guide Routes */}
        <Route path="/guide/dashboard" element={
          <GuideRoute>
            <GuideDashboard />
          </GuideRoute>
        } />
        <Route path="/guide/reviews" element={
          <GuideRoute>
            <GuideReviews />
          </GuideRoute>
        } />
        <Route path="/guide/messages" element={
          <GuideRoute>
            <GuideMessages />
          </GuideRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        <Route path="/admin/guide/:guideId" element={
          <AdminRoute>
            <GuideDetails />
          </AdminRoute>
        } />

        <Route path="/admin/overview" element={
          <AdminRoute>
            <AdminOverview />
          </AdminRoute>
        } />

        <Route path="/admin/settings" element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        } />

        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        } />

        <Route path="/admin/blogs" element={
          <AdminRoute>
            <AdminBlogs />
          </AdminRoute>
        } />

        <Route path="/admin/reviews" element={
          <AdminRoute>
            <AdminReviews />
          </AdminRoute>
        } />

        <Route path="/blogs" element={<Blogs />} />

        <Route 
          path="/guide/:id" 
          element={
            <AuthRoute>
              <GuideProfile />
            </AuthRoute>
          } 
        />

        <Route 
          path="/payment" 
          element={
            <AuthRoute>
              <Payment />
            </AuthRoute>
          } 
        />

        <Route 
          path="/messages" 
          element={
            <AuthRoute>
              <TouristMessages />
            </AuthRoute>
          } 
        />

        <Route path="/payment/:guideId" element={<Payment />} />
        
        {/* Add the missing route for /tourist/messages */}
        <Route 
          path="/tourist/messages" 
          element={
            <AuthRoute>
              <TouristMessages />
            </AuthRoute>
          } 
        />

        <Route 
          path="/guide/bookings" 
          element={
            <GuideRoute>
              <GuideBookings />
            </GuideRoute>
          } 
        />

        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/admin/payments" element={
          <AdminRoute>
            <div style={{ display: 'flex' }}>
              <AdminSidebar />
              <div style={{ flexGrow: 1 }}>
                <AdminPayments />
              </div>
            </div>
          </AdminRoute>
        } />
        <Route path="/payment-failure" element={<Navigate to="/payment" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;