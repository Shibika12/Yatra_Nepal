import React from 'react'
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import './Home.scss';
import { FaStar, FaUserTie, FaHotel, FaCheckCircle, FaMapMarkedAlt, FaShieldAlt, FaUserCog } from 'react-icons/fa';

export const Home = () => {
  const navigate = useNavigate();
    const destinations = [
        { src: "./src/assets/images/sway.jpg", title: "Swayambhunath Temple", location: "Kathmandu", className: "large" },
        { src: "./src/assets/images/redpanda.jpeg", title: "Beautiful Wildlife", location: "Nepal", className: "small" },
        { src: "./src/assets/images/village.jpg", title: "Amazing Village", location: "Hills", className: "small" },
        
        { src: "./src/assets/images/rhino.jpg", title: "Rare Wildlife", location: "Chitwan", className: "wide" }
      ];
      
    const services = [
      {
        id: 1,
        title: "Rating the Guides",
        description: "Rate and review your experience with our professional guides",
        icon: <FaStar />,
        path: "/guide-review"
      },
      {
        id: 2,
        title: "Hire Guide",
        description: "Find and hire experienced guides for your journey",
        icon: <FaUserTie />,
        path: "/hire-guide"
      },
      {
        id: 3,
        title: "Book Hotel",
        description: "Book comfortable stays at the best hotels",
        icon: <FaHotel />,
        path: "/book-hotel"
      }
    ];

    return (
        <>
          <Navbar />
          <section className="hero">
      <div className="hero-image-container">
      </div>
      <div className="hero-content">
        <h1>
          Explore Nepal Your Way with Local Experts <br />
          <p>Explore Nepal's beauty with local guides for peaks, culture, and hidden gems.</p>
        </h1>
        <button 
          className="book-now-btn"
          onClick={() => navigate('/hire-guide')}
        >
          Book Now
        </button>
      </div>
      
    </section>

          {/* services sections below */}
          <section className="services">
      <h2>TOP SERVICES FOR YOU
      <p>Benefit from our services</p></h2>
    
      <div className="service-container">
        <div className="service-card">
          <img src="/src/assets/images/reviews.avif" alt="Rate the Guides" />
          <h3>Rate the Guides</h3>
          <p>We provide a platform to rate and review your experience with our guides</p>
        </div>
        <div className="service-card">
          <img src="/src/assets/images/booking.jpg" alt="Booking" />
          <h3>Booking</h3>
          <p>We provide easy booking by chatting and planning your travel with our guides</p>
        </div>
        <div className="service-card">
          <img src="/src/assets/images/guide.jpg" alt="Best Guides" />
          <h3>Best Guides</h3>
          <p>Explore Nepal with experienced and verified local guides</p>
        </div>
      </div>
    </section>
    {/* Destination Section Starts */}

    <section className='destination-Section'>
    <h2 >Travel With Yatra Nepal</h2>
      <p>To our beautiful destinations</p>
    <div className="destination-grid">
        {destinations.map((item, index) => (
          <div key={index} className={`destination-card ${item.className}`}>
            <img src={item.src} alt={item.title} className="destination-img" />
            <div className="destination-info">
              <h3>{item.title}</h3>
              <p>{item.location}</p>
            </div>
          </div>
        ))}
      </div>
      </section>
      <section className="blog-container">
  <h2 className="blog-title">OUR BLOG</h2>
  <div className="blog-section">
    <div className="blog-content">
      <h3>Experience the Thrill of a New Adventure</h3>
      <p>
        Travel with confidence and explore like a local. Our platform connects you with trusted guides, ensures seamless planning, and brings unforgettable experiences to life.
      </p>
      <p>
        Discover hidden gems, immerse yourself in diverse cultures, and create memories that last a lifetime.
      </p>
      <p>
        With a focus on safety, authenticity, and convenience, we make exploring new destinations stress-free and enjoyable.
      </p>
      <p>
        Embrace the joy of traveling with personalized experiences tailored just for you. Let our platform be your companion in crafting journeys that inspire, connect, and leave a lasting impact on your heart and soul.
      </p>
      
    </div>
    <div className="blog-image">
      <img src="./src/assets/images/pexels-sarojgajurel7-1392099.jpg" alt="Hiker in nature"/>
      <button 
        className="read-more-btn"
        onClick={() => navigate('/blogs')}
      >
        Read More
      </button>
    </div>
  </div>
</section>
<section className="guides-container">
  <h2 className="guides-title">WHY CHOOSE OUR GUIDES</h2>

  <div className="guides-wrapper">
    <div className="guide-feature">
      <div className="feature-icon">
        <FaCheckCircle className="icon" />
      </div>
      <div className="feature-info">
        <h3>Verified Professionals</h3>
        <p>All our guides are thoroughly vetted and certified</p>
      </div>
    </div>
    <div className="guide-feature">
      <div className="feature-icon">
        <FaMapMarkedAlt className="icon" />
      </div>
      <div className="feature-info">
        <h3>Local Expertise</h3>
        <p>Deep knowledge of Nepal's culture and terrain</p>
      </div>
    </div>
    <div className="guide-feature">
      <div className="feature-icon">
        <FaShieldAlt className="icon" />
      </div>
      <div className="feature-info">
        <h3>Safety First</h3>
        <p>Trained in safety protocols and emergency response</p>
      </div>
    </div>
    <div className="guide-feature">
      <div className="feature-icon">
        <FaUserCog className="icon" />
      </div>
      <div className="feature-info">
        <h3>Personalized Tours</h3>
        <p>Customized experiences based on your interests</p>
      </div>
    </div>
  </div>
  <button onClick={() => navigate("/hire-guide")} className="book-now-btn">Find Your Guide</button>
</section>

<section className="subscription">
    <div className="subscription-content">
        <h1>
            Explore Nepal Your Way with Local Experts <br />
            <p>
                Explore Nepal's beauty with local guides for peaks, culture, and hidden gems.
            </p>
        </h1>
    </div>
</section>
<Footer/>
        </>
      );
}

export default Home