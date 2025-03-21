import React, { useState } from "react";
import "./AccountSetting.scss"

export const AccountSetting = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zip: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Profile saved:", formData);
  };

  return (
    <div className="Profile-container">
      <h2>Edit Profile</h2>
      <div className="profile.Image">
        <img src="https://via.placeholder.com/100" alt="Profile" />
      </div>
      <form onSubmit={handleSubmit} className="tab-Form">
        <div className="tab-Row">
          <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} />
          <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} />
        </div>
        <div className="tab-Row">
          <input type="email" name="email" placeholder="Email" onChange={handleChange} />
          <input type="tel" name="phone" placeholder="Phone" onChange={handleChange} />
        </div>
        <div className="tab-Row">
        <input type="text" name="address" placeholder="Address" onChange={handleChange} />
        </div>
        <div className="tab-Row">
          <input type="text" name="country" placeholder="Country" onChange={handleChange} />
          <input type="text" name="state" placeholder="State/Province" onChange={handleChange} />
        </div>
       
        <div className="tab-Button">
          <button type="submit" className="tab-saveBtn">Save Profile</button>
          <button type="button" className="tab-cancelBtn">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AccountSetting;
