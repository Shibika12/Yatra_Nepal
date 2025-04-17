import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { FaStar, FaMapMarkerAlt, FaClock, FaSearch, FaLanguage } from 'react-icons/fa';
import './HireGuide.scss';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HireGuide = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guide types
  const guideTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'trekking', label: 'Trekking Guide' },
    { value: 'cultural', label: 'Cultural Guide' },
    { value: 'adventure', label: 'Adventure Guide' },
    { value: 'wildlife', label: 'Wildlife Guide' },
    { value: 'nature', label: 'Nature Guide' }
  ];

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3002/api/guides/all-guides');
      
      // Create a Map to store unique guides by user_id
      const uniqueGuidesMap = new Map();
      
      // Transform and filter the data to keep only unique guides
      response.data.forEach(guide => {
        if (!uniqueGuidesMap.has(guide.user_id)) {
          uniqueGuidesMap.set(guide.user_id, {
            id: guide.user_id,
            name: guide.name,
            image: guide.profile_pic ? `http://localhost:3002/${guide.profile_pic}` : 'https://via.placeholder.com/150',
            experience: guide.years_of_experience ? `${guide.years_of_experience} years` : 'Not specified',
            location: guide.nationality || 'Nepal',
            languages: guide.languages || 'English',
            type: guide.guide_type?.toLowerCase() || 'trekking',
            about: guide.about || '',
            specialization: guide.specialization || ''
          });
        }
      });

      // Convert Map values to array
      const transformedGuides = Array.from(uniqueGuidesMap.values());

      setGuides(transformedGuides);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError('Failed to load guides. Please try again later.');
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  if (loading) return <div className="loading">Loading guides...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="hire-guide-page">
      <Navbar />
      
      <div className="hero-section">
        <div className="hero-content">
          <h1>Find Your Perfect Guide</h1>
          <p>Explore Nepal with experienced local guides</p>
          
          <div className="search-filters">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search guides by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {guideTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <section className="why-hire-section">
        <h2>Why Hire Our Guides?</h2>
        <div className="benefits">
          <div className="benefit-card">
            <i className="fas fa-map-marked-alt"></i>
            <h3>Local Expertise</h3>
            <p>Deep knowledge of local culture and hidden gems</p>
          </div>
          <div className="benefit-card">
            <i className="fas fa-shield-alt"></i>
            <h3>Verified Guides</h3>
            <p>All guides are verified and certified</p>
          </div>
          <div className="benefit-card">
            <i className="fas fa-award"></i>
            <h3>Experienced</h3>
            <p>Years of experience in guiding tours</p>
          </div>
        </div>
      </section>

      <div className="guide-review-container">
        <h1>Our Expert Local Guides</h1>
        <div className="guides-list">
          {guides
            .filter(guide => {
              const matchesSearch = 
                guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                guide.location.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesType = selectedType === 'all' || guide.type === selectedType;
              return matchesSearch && matchesType;
            })
            .map(guide => (
              <div 
                key={guide.id} 
                className="guide-profile"
                onClick={() => navigate(`/guide/${guide.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="guide-image">
                  <img src={guide.image} alt={guide.name} />
                </div>
                <div className="guide-details">
                  <h2>{guide.name}</h2>
                  <div className="guide-type">
                    {guideTypes.find(t => t.value === guide.type)?.label || 'Guide'}
                  </div>
                  <div className="info-row">
                    <p>
                      <FaMapMarkerAlt />
                      {guide.location}
                    </p>
                  </div>
                  <div className="info-row">
                    <p>
                      <FaClock />
                      {guide.experience}
                    </p>
                  </div>
                  <div className="info-row">
                    <p>
                      <FaLanguage />
                      {guide.languages}
                    </p>
                  </div>
                  <div className="rating-row">
                    <div className="stars">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          className="star"
                          color={index < 5 ? "#FFD700" : "#e4e5e9"}
                        />
                      ))}
                    </div>
                    <span className="reviews">(New Guide)</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <section className="booking-process">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Choose Guide</h3>
            <p>Select from our professional guides</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Book Tour</h3>
            <p>Schedule your preferred date</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Enjoy Trip</h3>
            <p>Experience Nepal with your guide</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HireGuide; 