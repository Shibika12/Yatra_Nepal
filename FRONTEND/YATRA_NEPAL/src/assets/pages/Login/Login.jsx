import React from 'react'
import { useNavigate,Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import "./Login.scss";
export const Login = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Navbar />
      <div className="container-body">
        <div className="login-page">
          <div className="container-login">
            <div className="logo-Login">Yatra Nepal</div>
            <div className="tagline-Login">Enter Credentials to Login</div>

            <div className="form-group-login">
              <input type="email" placeholder="Email" />
            </div>

            <div className="form-group-login">
              <input type="password" placeholder="Password" />
              <span className="toggle-password">
                <i className="bi bi-eye"></i>
              </span>
            </div>

            <div className="forgot-password">Forgot Password?</div>

            <button>Login</button>
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