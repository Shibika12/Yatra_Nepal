import React from "react";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/Navbar/Navbar";
import { Container, Row, Col } from "react-bootstrap";

// import Footer from "../../components/Footer/Footer";
// import Navbar from "../../components/Navbar/Navbar";
import "./AboutUs.scss";

const teamMembers = [
  {
    name: "Jimmy Miller",
    role: "Moutain Expert",
    img: "./src/assets/images/ankiy.jpg",
  },
  {
    name: "Sujan Thapa",
    role: "Cultural GUIDE",
    img: "./src/assets/images/male.jpg",
  },
  {
    name: "Ankit Basnet",
    role: "Terai GUIDE",
    img: "./src/assets/images/sujan.jpg",
  },
  {
    name: "New Member",
    role: "TOUR GUIDE",
    img: "./src/assets/images/1.jpg",
  },
  {
    name: "New Member",
    role: "Mountaineer ",
    img: "./src/assets/images/2.jpeg",
  },
  {
    name: "New Member",
    role: "TOUR GUIDE",
    img: "./src/assets/images/3.jpeg",
  },
  {
    name: "New Member",
    role: "TOUR GUIDE",
    img: "./src/assets/images/4.avif",
  },
];
const galleryImages = [
  "./src/assets/images/chum.jpg",
  "./src/assets/images/phok.jpeg",
  "./src/assets/images/tt.jpg",
];
const AboutUs = () => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleMembers = 3; // Show 3 members at a time

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1) % teamMembers.length);
  };

  const prevSlide = () => {
    setStartIndex((prev) =>
      prev === 0 ? teamMembers.length - 1 : prev - 1
    );
  };
    return (
      <>
<Navbar/>
        <section className="about-section">
          <div className="image-container">
            <img src="./src/assets/images/yaks.jpg" alt="Yak in the mountains" />
          </div>
          <h1>ABOUT US</h1>
          <div className="dia gonal-cut"></div>
        </section>
  
        <section className="story-section">
      <h2 className="story-title">STORY</h2>
      <div className="story-content">
        <div className="story-row">
          <img src="./src/assets/images/sadhu.jpg" alt="Sadhu" />
          <p>
            From bustling city streets to serene mountain trails, our journey has been guided by a love for exploration 
            and the belief that every traveler deserves a story worth sharing. With every booking and every adventure, 
            we strive to connect people with the culture, history, and magic of their destinations.
          </p>
        </div>
        <div className="story-row reverse">
          
          <img src="./src/assets/images/sadhu.jpg" alt="Monk walking in the forest" />
          <p>
            It started with a simple idea—to explore beyond the obvious and truly experience the soul of a destination. 
            As avid travelers, we often found ourselves longing for more than just maps and itineraries. We craved stories, 
            hidden gems, and authentic connections with the places we visited.
            
          </p>
        </div>
      </div>
    </section>
    <section className="about-Section">
    <h1>Our Team</h1>
    <div className="underline"></div>
      <div className="image-Container">
        <img src="./src/assets/images/kanchan.jpg" alt="Yak in the mountains" />
      </div>
      
      <div className="diagonal-Cut"></div>

      {/* Team Members */}
      <Container className="team-container">
        <FaChevronLeft className="arrow left-arrow" onClick={prevSlide} />
        <Row className="justify-content-center">
          {teamMembers.slice(startIndex, startIndex + visibleMembers).map((member, index) => (
            <Col key={index} md={4} sm={6} xs={12} className="team-member">
              <img src={member.img} alt={member.name} />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </Col>
          ))}
        </Row>
        <FaChevronRight className="arrow right-arrow" onClick={nextSlide} />
        
      </Container>
    </section>
    <section className="gallery-section">
      <h2>GALLERY</h2>
      <div className="underline"></div>
      <Container className="gallery-container">
        <Row className="justify-content-center">
          {galleryImages.map((image, index) => (
            <Col key={index} md={5} sm={6} xs={12} className="gallery-item">
              <img src={image} alt={`Gallery ${index + 1}`} />
            </Col>
          ))}
        </Row>
      </Container>
      <button className="all-photos-btn">ALL PHOTOS</button>
    </section>
    <Footer/>
  
      </>
    );
  };
  
  

export default AboutUs;