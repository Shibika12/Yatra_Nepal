import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../../components/Navbar/Navbar';
import './ForgotPassword.scss';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(60);
  const [isOtpSent, setIsOtpSent] = useState(false);

  useEffect(() => {
    let interval;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsOtpSent(false);
    }
    return () => clearInterval(interval);
  }, [timer, isOtpSent]);

  const handleSendOTP = async () => {
    try {
      const response = await axios.post('http://localhost:3002/api/auth/send-otp', { email });
      setSuccess('OTP sent successfully! Please check your email.');
      setIsOtpSent(true);
      setTimer(60);
      setStep(2);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post('http://localhost:3002/api/auth/verify-otp', { email, otp });
      setSuccess('OTP verified successfully!');
      setStep(3);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3002/api/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      setSuccess('Password reset successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container-body">
        <div className="forgot-password-page">
          <div className="container-forgot-password">
            <div className="logo-forgot">Yatra Nepal</div>
            <div className="tagline-forgot">Reset Your Password</div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {step === 1 && (
              <div className="form-group-forgot">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button onClick={handleSendOTP}>Send OTP</button>
              </div>
            )}

            {step === 2 && (
              <div className="form-group-forgot">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <div className="timer">OTP expires in: {timer} seconds</div>
                <button onClick={handleVerifyOTP}>Verify OTP</button>
                {timer === 0 && (
                  <button className="resend-btn" onClick={handleSendOTP}>
                    Resend OTP
                  </button>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="form-group-forgot">
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button onClick={handleResetPassword}>Reset Password</button>
              </div>
            )}

            <div className="back-to-login">
              <span onClick={() => navigate('/login')}>Back to Login</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 