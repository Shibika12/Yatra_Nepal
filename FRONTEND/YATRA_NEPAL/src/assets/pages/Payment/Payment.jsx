import React from 'react';
import './Payment.scss';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
// Temporarily use a placeholder image URL until you add a QR code image to your project
const dummyQRCode = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png";

const Payment = () => {
  return (
    <div className="payment-wrapper">
      <Navbar />
      <div className="payment-page">
        <div className="payment-container">
          <h1>Payment Details</h1>
          <div className="payment-form">
            <div className="booking-summary">
              <h2>Booking Summary</h2>
              <div className="summary-details">
                <div className="summary-item">
                  <span>Guide Name:</span>
                  <span>John Doe</span>
                </div>
                <div className="summary-item">
                  <span>Duration:</span>
                  <span>5 Days</span>
                </div>
                <div className="summary-item">
                  <span>Total Amount:</span>
                  <span>NPR 15,000</span>
                </div>
              </div>
            </div>
            <div className="payment-methods">
              <h2>Payment Options</h2>
              <div className="qr-section">
                <div className="qr-container">
                  <img src={dummyQRCode} alt="Payment QR Code" className="qr-code" />
                  <div className="qr-instructions">
                    <h3>Scan QR to Pay</h3>
                    <p>1. Open your mobile banking app</p>
                    <p>2. Scan this QR code</p>
                    <p>3. Confirm the amount and pay</p>
                  </div>
                </div>
                <div className="payment-apps">
                  <p>Supported Payment Apps:</p>
                  <div className="app-icons">
                    <span>eSewa</span>
                    <span>Khalti</span>
                    <span>IME Pay</span>
                  </div>
                </div>
              </div>
              <div className="or-divider">
                <span>OR</span>
              </div>
              <div className="card-payment">
                <h3>Pay with Card</h3>
                <form>
                  <div className="form-group">
                    <label>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input type="text" placeholder="MM/YY" />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input type="text" placeholder="123" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input type="text" placeholder="Full Name" />
                  </div>
                  <button type="submit" className="pay-now-btn">
                    Pay Now
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payment; 