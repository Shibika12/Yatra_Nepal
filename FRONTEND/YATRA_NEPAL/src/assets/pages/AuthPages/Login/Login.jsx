import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../../components/Navbar/Navbar';
import "./Login.scss";

export const Login = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3002/api/auth/login', {
        email: values.email,
        password: values.password,
      });
  
      if (response.data.token) {
        // Store token
        localStorage.setItem('token', response.data.token);
        
        // Ensure consistent case for role/user_type
        const userRole = (response.data.role || response.data.user_type || '').toLowerCase();
        localStorage.setItem('userRole', userRole);
        
        // Store full user data
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Redirect based on role
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'guide') {
          navigate('/guide/dashboard');
        } else {
          // Default to tourist role
          navigate('/home');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Invalid credentials');
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div>
      <Navbar />
      <div className="container-body">
        <div className="login-page">
          <div className="container-login">
            <div className="logo-Login">Yatra Nepal</div>
            <div className="tagline-Login">Enter Credentials to Login</div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group-login">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email" 
                  value={values.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-login">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password" 
                  value={values.password}
                  onChange={handleChange}
                  required
                />
                <span 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                </span>
              </div>

              <div className="forgot-password">
                <span onClick={handleForgotPassword}>Forgot Password?</span>
              </div>

              <button type="submit">Login</button>
            </form>

            <div className="signup">
              Not Registered yet? <Link to="/signup">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;