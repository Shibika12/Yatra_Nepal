import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Payment from './assets/pages/Payment/Payment';
import AuthRoute from './utils/AuthRoute';

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

// Route protection components
const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  
  if (isAuthenticated && userRole === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }
  
  return children;
};

const SemiPublicRoute = ({ children }) => {
  const userRole = localStorage.getItem("userRole");
  
  if (userRole === 'admin') {
    return <Navigate to="/admin/dashboard" />;
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
        
        {/* Protected User Routes */}
        <Route path="/profile" element={
          <AuthRoute>
            <Profile />
          </AuthRoute>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;