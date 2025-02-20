import React from "react";
import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/Navbar/Navbar";
// import Footer from "../../components/Footer/Footer";
// import Navbar from "../../components/Navbar/Navbar";
import "./AboutUs.scss";

const AboutUs = () => {
    return (
      <>
        {/* About Us Section */}
        <section className="about-section">
          <div className="image-container">
            <img src="./src/assets/images/yaksi.webp" alt="Yak in the mountains" />
          </div>
          <h1>ABOUT US</h1>
          <div className="diagonal-cut"></div>
        </section>
  
        {/* Story Section */}
        <section className="story-section">
          <h2 className="story-title">STORY</h2>
          <div className="story-content">
            <div className="story-row">
              <img src="./src/assets/images/sadhu.jpg" />
              <p>
                From bustling city streets to serene mountain trails, our journey has been guided by a love for exploration 
                and the belief that every traveler deserves a story worth sharing. With every booking and every adventure, 
                we strive to connect people with the culture, history, and magic of their destinations.
              </p>
            </div>
            <div className="story-row reverse">
              <p>
                It started with a simple idea—to explore beyond the obvious and truly experience the soul of a destination. 
                As avid travelers, we often found ourselves longing for more than just maps and itineraries. We craved stories, 
                hidden gems, and authentic connections with the places we visited.
                <br /><br />
                That’s when the vision for this platform was born—a space where adventurers and passionate local guides 
                could come together to create unforgettable experiences.
              </p>
              <img src="./src/assets/images/monk.jpg" />
            </div>
          </div>
        </section>
      </>
    );
  };
  
  

export default AboutUs;
