import React from 'react'
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import './Home.scss';
export const Home = () => {
    const destinations = [
        { src: "./src/assets/images/sway.jpg", title: "Swayambhunath Temple", location: "Kathmandu", className: "large" },
        { src: "./src/assets/images/redpanda.jpeg", title: "Beautiful Village", location: "Kathmandu", className: "small" },
        { src: "./src/assets/images/village.jpg", title: "Wildlife", location: "Kathmandu", className: "small" },
        
        { src: "./src/assets/images/rhino.jpg", title: "Snowy Peaks", location: "Kathmandu", className: "wide" }
      ];
      
    return (
        <>
          <Navbar />
          <section className="hero">
            <div className="hero-content">
              <h1>
                Explore Nepal Your Way with Local Experts <br />
                <p>
                Explore Nepal's beauty with local guides for peaks, culture, and hidden gems.
              </p>
              </h1>
              
              <button className="bookButton">Book Now</button>
            </div>
            <div className="navigation">
              <button className="nav-btn left">&#8592;</button>
              <button className="nav-btn right">&#8594;</button>
            </div>
          </section>

          {/* services sections below */}
          <section className="services">
      <h2>TOP SERVICES FOR YOU
      <p>Benefit from our services</p></h2>
    
      <div className="service-container">
        <div className="service-card">
          <img src="/src/assets/images/plane.jpg" alt="Airport Pickup" />
          <h3>Airport Pickup</h3>
          <p>We provide escort from the airport to your destination</p>
        </div>
        <div className="service-card">
          <img src="/src/assets/images/booking.jpg" alt="Booking" />
          <h3>Booking</h3>
          <p>We provide easy booking for your travel plans</p>
        </div>
        <div className="service-card">
          <img src="/src/assets/images/guide.jpg" alt="Best Guides" />
          <h3>Best Guides</h3>
          <p>Explore Nepal with experienced local guides</p>
        </div>
      </div>
    </section>
    {/* Destination Section Starts */}

    <section className='destination-Section'>
    <h2 >Travel With Yatra Nepal To</h2>
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
      <img src="./src/assets/images/travel.jpg" alt="Hiker in nature"/>
      <button className="read-more">READ MORE →</button>
    </div>
  </div>
</section>
<section className="guides-container">
  <h2 className="guides-title">MEET OUR GUIDES</h2>

  <div className="guides-wrapper">
    <div className="guide">
      <img src="./src/assets/images/1.jpg" alt="Guide 1"/>
      <div className="guide-info">
        <h3>Emma Johnson</h3>
        <p>Expert in mountain trekking</p>
      </div>
    </div>
    <div className="guide">
      <img src="./src/assets/images/2.jpeg" alt="Guide 2"/>
      <div className="guide-info">
        <h3>Daniel Smith</h3>
        <p>Wildlife and nature specialist</p>
      </div>
    </div>
    <div className="guide ">
      <img src="./src/assets/images/3.jpeg" alt="Guide 3"/>
      <div className="guide-info">
        <h3>Michael Lee</h3>
        <p>Adventure sports expert</p>
      </div>
    </div>
    <div className="guide">
      <img src="./src/assets/images/4.avif" alt="Guide 4"/>
      <div className="guide-info">
        <h3>Sophia Williams</h3>
        <p>History and culture guide</p>
      </div>
    </div>
  </div>
  <button className="chat-btn">💬 Chat</button>
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
            <div className="subs">
              <button className="subscription-button">See More Highlights</button>
            </div>
</section>
<Footer/>
        </>
      );
      
}

export default Home