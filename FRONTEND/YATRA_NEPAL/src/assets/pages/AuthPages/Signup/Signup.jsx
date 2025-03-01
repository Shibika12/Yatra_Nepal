import React, { useState } from "react";
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
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    nationality: "",
    user_type: "Tourist",
  });

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting values:', values);

    try {
      const response = await axios.post("http://localhost:3002/auth/signup", values);
      console.log('Response:', response);
      if(response.status === 200){
        navigate("/login");
      }
    } catch(error) {
      console.log('Error details:', error.response);
      console.log(error);
    }
  };

  const [country, setCountry] = useState(null);
  const options = countryList().getData();

  const handleCountryChange = (selectedOption) => {
    setCountry(selectedOption);
  };

  const [activeTab, setActiveTab] = useState("tourist");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <Navbar/>
   
    <div className="signup-container">
    <div className="signup-page">
      <div className="logo">Yatra Nepal</div>
      <div className="tagline">Travel Beyond the Ordinary.</div>
      <div className="title">
        <span>Create an Account</span>
      </div>

      {/* Tab Toggle */}
      <div className="tab-toggle">
        <button
          onClick={() => handleTabClick("tourist")}
          className={activeTab === "tourist" ? "active" : ""}
        >
          Tourist
        </button>
        <button
          onClick={() => handleTabClick("guide")}
          className={activeTab === "guide" ? "active" : ""}
        >
          Tour Guide
        </button>
      </div>

      {/* Tourist Form */}
      {activeTab === "tourist" && (
        <>
          <Row>
            <Col xs={12} md={6}>
              <div className="form-group">
                <input type="text" placeholder="Full Name" name="name" onChange={handleChanges} />
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="form-group">
                <input type="text" placeholder="Contact Number" name="phone_number" onChange={handleChanges} />
              </div>
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={6}>
              <div className="form-group">
                <input type="email" placeholder="Email" name="email" onChange={handleChanges} />
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="form-group">
                <input type="password" placeholder="Password" name="password" onChange={handleChanges} />
              </div>
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={6}>
              <div className="form-group">
                <Select
                  options={options}
                  value={country}
                  onChange={handleCountryChange}
                  placeholder="Select Nationality"
                  classNamePrefix="custom-select"
                />
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="form-group">
                <input type="password" placeholder="Confirm Password" name="confirm_password" onChange={handleChanges} />
              </div>
            </Col>
          </Row>
        </>
      )}

      {/* Guide Form */}
      {activeTab === "guide" && (
        <>
          <Row>
            <Col xs={12} md={6}>
              <div className="form-group">
                <input type="text" placeholder="Full Name" name="name" onChange={handleChanges} />
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="form-group">
                <input type="text" placeholder="Contact Number" name="phone_number" onChange={handleChanges} />
              </div>
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={6}>
              <div className="form-group">
                <input type="email" placeholder="Email" name="email" onChange={handleChanges} />
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="form-group">
                <select name="user_type" onChange={handleChanges}>
                  <option value="" disabled selected>
                    Select Tour Guide Type
                  </option>
                  <option value="option1">Mountain Trekking</option>
                  <option value="option2">Hilly Landscape</option>
                  <option value="option3">Terai</option>
                  <option value="option4">Local Popular Sites</option>
                  <option value="option5">Historical Sites</option>
                </select>
              </div>
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={6}>
              <div className="form-group">
                <input type="password" placeholder="Password" name="password" onChange={handleChanges} />
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="form-group">
                <input type="password" placeholder="Confirm Password" name="confirm_password" onChange={handleChanges} />
              </div>
            </Col>
          </Row>
        </>
      )}

<button
  className="SignupButton"
  onClick={() => {
    if (activeTab === "guide") {
      navigate("/guide-validation");
    } else {
      // Handle signup for tourist (e.g., call a function or show a message)
      console.log("Tourist signup logic here");
    }
  }}
>
  Signup
</button>


      <div className="or">Or</div>

      <div className="google-login-signup">
        <i className="bi bi-google"></i>
        <span>Signup with Google</span>
      </div>

      <div className="signup">
        Already Registered? <Link to="/login">Log In</Link>
      </div>
    </div>
    </div>
    </div>
  );
};

export default Signup;
