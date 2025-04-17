import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import "font-awesome/css/font-awesome.min.css";
import { Row, Col } from "react-bootstrap";
import Select from "react-select";
import countryList from "react-select-country-list";
import "./Signup.scss";
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
    { value: "wildlife", label: "Wildlife Guide" },
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
      // Log the current state before creating signupData
      console.log('Current form values:', values);
      console.log('Active tab:', activeTab);

      const signupData = {
        name: values.name,
        email: values.email,
        password: values.password,
        phone_number: values.phone_number,
        nationality: values.nationality || "Nepali",
        user_type: activeTab === "Tour Guide" ? "Guide" : "Tourist",
        guide_type: activeTab === "Tour Guide" ? values.guide_type : null,
        is_admin: 0,
        is_verified: activeTab === "Tourist" ? 1 : 0
      };

      console.log('Sending signup data:', signupData);

      const response = await axios.post(
        "http://localhost:3002/api/auth/signup",
        signupData
      );
      
      console.log('Server response:', response.data);

      if (response.data && response.data.userId) {
        if (activeTab === "Tour Guide") {
          localStorage.setItem('tempGuideId', response.data.userId.toString());
          localStorage.setItem('tempGuideEmail', values.email);
          localStorage.setItem('tempGuideName', values.name);
          localStorage.setItem('tempGuidePhone', values.phone_number);
          localStorage.setItem('tempGuideType', values.guide_type);
          
          navigate("/guide/validation");
        } else {
          alert("Registration successful! Please login to continue.");
          navigate("/login");
        }
      } else {
        throw new Error('No user ID received from server');
      }
    } catch (error) {
      console.error('Detailed signup error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      
      if (error.response?.status === 409) {
        alert("This email is already registered. Please use a different email or login.");
      } else if (error.response?.status === 400) {
        alert(error.response.data?.message || "Please check your input data.");
      } else if (error.response?.status === 500) {
        alert("Server error. Please try again later.");
      } else {
        alert("Registration failed. Please try again.");
      }
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
                      onChange={(option) => {
                        console.log('Selected nationality:', option);
                        setValues((prev) => ({
                          ...prev,
                          nationality: option.label
                        }));
                      }}
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