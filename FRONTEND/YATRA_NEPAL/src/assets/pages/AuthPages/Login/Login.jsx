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
      console.log('Attempting login with:', { email: values.email });
      
      const response = await axios.post('http://localhost:3002/auth/login', {
        email: values.email,
        password: values.password,
      });
  
      console.log('Login response:', {
        success: response.data.success,
        role: response.data.role,
        token: response.data.token ? 'Present' : 'Missing'
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.role.toLowerCase());
        localStorage.setItem('user', JSON.stringify(response.data));
        
        console.log('Stored in localStorage:', {
          token: localStorage.getItem('token') ? 'Present' : 'Missing',
          userRole: localStorage.getItem('userRole'),
          user: localStorage.getItem('user') ? 'Present' : 'Missing'
        });
        
        // Redirect based on role
        const userRole = response.data.role.toLowerCase();
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'guide') {
          navigate('/guide/dashboard');
        } else {
          navigate('/home');
        }
      }
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || 'Invalid credentials');
    }
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

              <div className="forgot-password">Forgot Password?</div>

              <button type="submit">Login</button>
            </form>

            <div className="or">Or</div>

            <div className="google-login">
              <i className="bi bi-google"></i>
              <span>Login with Google</span>
            </div>

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