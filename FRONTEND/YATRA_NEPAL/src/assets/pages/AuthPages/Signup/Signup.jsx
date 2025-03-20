import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import "font-awesome/css/font-awesome.min.css";
import { Row, Col } from "react-bootstrap";
import Select from "react-select";
import countryList from "react-select-country-list";
import "./signup.scss";
import axios from "axios";
import Navbar from "../../../components/Navbar/Navbar";

export const Signup = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Tourist");
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    nationality: "",
    user_type: "Tourist",
    is_admin: 0,
    is_verified: 0,
    guide_type: null
  });

  const countries = useMemo(() => countryList().getData(), []);

  const guideTypes = [
    { value: "trekking", label: "Trekking Guide" },
    { value: "cultural", label: "Cultural Guide" },
    { value: "adventure", label: "Adventure Guide" },
    { value: "nature", label: "Nature Guide" }
  ];

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setValues((prev) => ({
      ...prev,
      user_type: tab === "Tour Guide" ? "Guide" : "Tourist",
      guide_type: tab === "Tourist" ? null : prev.guide_type
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (values.password !== values.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!values.name || !values.email || !values.password || !values.phone_number) {
      alert("Please fill in all required fields");
      return;
    }

    if (activeTab === "Tour Guide" && !values.guide_type) {
      alert("Please select a guide type");
      return;
    }

    try {
      const signupData = {
        name: values.name,
        email: values.email,
        password: values.password,
        phone_number: values.phone_number,
        nationality: values.nationality || null,
        user_type: activeTab === "Tour Guide" ? "Guide" : "Tourist",
        guide_type: activeTab === "Tour Guide" ? values.guide_type : null,
        is_admin: 0,
        is_verified: 0
      };

      const response = await axios.post("http://localhost:3002/auth/signup", signupData);
      
      if (response.data && response.data.userId) {
        if (activeTab === "Tour Guide") {
          localStorage.setItem('tempGuideId', response.data.userId.toString());
          navigate("/guide/validation");
        } else {
          alert("Registration successful! Please login to continue.");
          navigate("/login");
        }
      } else {
        throw new Error('No user ID received from server');
      }
    } catch (error) {
      console.error('Signup error:', error.response || error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      alert(errorMessage);
    }
  };

  const handleGuideTypeChange = (selectedOption) => {
    console.log("Selected guide type:", selectedOption.value);
    setValues({
      ...values,
      guide_type: selectedOption.value
    });
  };

  return (
    <>
      <Navbar />
      <div className="signup-container">
        <div className="signup-form">
          <h1>Create an Account</h1>

          {/* Toggle Buttons */}
          <div className="toggle-container">
            <div className={`toggle-button ${activeTab === "Tourist" ? "active" : ""}`}>
              <button onClick={() => handleTabChange("Tourist")}>Tourist</button>
            </div>
            <div className={`toggle-button ${activeTab === "Tour Guide" ? "active" : ""}`}>
              <button onClick={() => handleTabChange("Tour Guide")}>Tour Guide</button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Left Column */}
              <div className="left-column">
                <div className="form-group">
                  <input type="text" name="name" placeholder="Full Name" onChange={handleChanges} required />
                </div>
                <div className="form-group">
                  <input type="email" name="email" placeholder="Email" onChange={handleChanges} required />
                </div>
                <div className="form-group">
                  <input type="password" name="password" placeholder="Password" onChange={handleChanges} required />
                </div>
              </div>

              {/* Right Column */}
              <div className="right-column">
                <div className="form-group">
                  <input type="tel" name="phone_number" placeholder="Contact Number" onChange={handleChanges} required />
                </div>
                <div className="form-group">
                  <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChanges} required />
                </div>
                {activeTab === "Tour Guide" ? (
                  <div className="form-group">
                    <Select
                      options={guideTypes}
                      placeholder="Select Tour Guide Type"
                      onChange={handleGuideTypeChange}
                      value={guideTypes.find((option) => option.value === values.guide_type)}
                      className="guide-type-select"
                      classNamePrefix="select"
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <Select
                      options={countries}
                      placeholder="Select Nationality"
                      onChange={(option) => setValues((prev) => ({ ...prev, nationality: option.value }))}
                      className="nationality-select"
                      classNamePrefix="select"
                    />
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="signup-btn">
              Signup
            </button>

            <div className="divider">Or</div>

            <button type="button" className="google-signup">
              <img src="/google-icon.png" alt="G" /> Signup with Google
            </button>

            <p className="login-link">
              Already Registered? <Link to="/login">Log In</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;