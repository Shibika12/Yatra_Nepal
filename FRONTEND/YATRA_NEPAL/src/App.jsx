import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Reviews } from "./assets/pages/Reviews/Reviews";

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


// Protected Route Components
const ProtectedRoute = ({ children, allowedRoles = [], restrictedRoles = [] }) => {
  const isAuthenticated = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user's role is restricted from this route
  if (restrictedRoles.includes(userRole)) {
    return <Navigate to="/admin/dashboard" />;
  }

  // Check if route requires specific roles
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return userRole === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/home" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  
  if (isAuthenticated && userRole === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }
  
  return children;
};

// Modified SemiPublicRoute to handle both logged-in and non-logged-in users
const SemiPublicRoute = ({ children }) => {
  const userRole = localStorage.getItem("userRole");
  
  if (userRole === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Semi-Public Routes - accessible to visitors and regular users, but not admins */}
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
        <Route path="/hire-guide" element={<HireGuide />} />
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

        {/* Protected Guide Routes */}
        <Route path="/guide/validation" element={<GuideValidationForm />} />
        
        {/* Protected User Routes - Explicitly restrict admin access */}
        <Route path="/profile" element={
          <ProtectedRoute restrictedRoles={['admin']}>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/guide/:guideId" element={<GuideDetails />} />

        <Route path="/admin/overview" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminOverview />
          </ProtectedRoute>
        } />

       <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSettings />
          </ProtectedRoute>
        } />


        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        } />

        <Route path="/admin/blogs" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminBlogs />
          </ProtectedRoute>
        } />

        <Route path="/admin/reviews" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminReviews />
          </ProtectedRoute>
        } />

        <Route path="/blogs" element={<Blogs />} />

        <Route path="/reviews" element={<Reviews />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;