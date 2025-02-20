import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Navbar from "../../components/Navbar/Navbar";
import "./GuideValidationForm.scss";

export const GuideValidationForm = () => {
  const [citizenshipPhoto, setCitizenshipPhoto] = useState(null);
  const [licensePhoto, setLicensePhoto] = useState(null);
  const [experience, setExperience] = useState("");

  // const handleFileUpload = (e, setFile) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const previewUrl = URL.createObjectURL(file);
  //     setFile({
  //       file: file,
  //       preview: previewUrl,
  //     });
  //   }
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (will add later with backend)
    console.log("Form submitted:", { citizenshipPhoto, licensePhoto, experience });
  };

  return (
    <div>
    <Navbar/>
    <div className="guide-container">
    <Container>
      <Row>
        <Col>
          <div className="validation-form">
            <h2>Tour Guide Validation</h2>
            <p className="info-text">
              Please provide the following documents for verification
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  className="form-control"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Upload Citizenship Document</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setCitizenshipPhoto)}
                  required
                />
                {citizenshipPhoto && (
                  <div className="preview-container">
                    <img
                      src={citizenshipPhoto.preview}
                      alt="Citizenship Preview"
                      className="preview-image"
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Upload Guide License</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setLicensePhoto)}
                  required
                />
                {licensePhoto && (
                  <div className="preview-container">
                    <img
                      src={licensePhoto.preview}
                      alt="License Preview"
                      className="preview-image"
                    />
                  </div>
                )}
              </div>

              <div className="alert alert-info">
                Your documents will be reviewed by our admin team. You will be
                notified once your account is verified.
              </div>

              <button type="submit" className="btn btn-primary">
                Submit for Verification
              </button>
            </form>
          </div>
        </Col>
      </Row>
    </Container>
    </div>
    </div>
  );
};

export default GuideValidationForm;