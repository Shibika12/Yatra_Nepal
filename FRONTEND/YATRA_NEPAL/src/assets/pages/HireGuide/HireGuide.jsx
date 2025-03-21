import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './HireGuide.scss';
import { FaStar, FaMapMarkerAlt, FaLanguage, FaSearch } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';

const HireGuide = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Guide types
  const guideTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'trekking', label: 'Trekking Guide' },
    { value: 'cultural', label: 'Cultural Guide' },
    { value: 'adventure', label: 'Adventure Guide' },
    { value: 'wildlife', label: 'Wildlife Guide' },
    { value: 'photography', label: 'Nature Guide' }
  ];

  // Dummy data for guides with Nepal-specific content
  const guides = [
    {
      id: 1,
      name: "Ram Gurung",
      image: "/src/assets/images/guide1.jpg", // Replace with actual Nepal guide image
      rating: 4.8,
      reviews: 124,
      location: "Pokhara",
      type: "trekking",
      languages: ["English", "Nepali"],
      specialization: "Annapurna Circuit Expert",
      experience: "7 years",
      price: "50",
      verified: true
    },
    {
      id: 2,
      name: "Sita Thapa",
      image: "/src/assets/images/guide2.jpg", // Replace with actual Nepal guide image
      rating: 4.9,
      reviews: 98,
      location: "Kathmandu",
      type: "cultural",
      languages: ["English", "Nepali", "Japanese"],
      specialization: "Cultural Heritage Tours",
      experience: "5 years",
      price: "45",
      verified: true
    },
    {
      id: 3,
      name: "Pemba Sherpa",
      image: "/src/assets/images/guide3.jpg", // Replace with actual Nepal guide image
      rating: 4.7,
      reviews: 156,
      location: "Solukhumbu",
      type: "trekking",
      languages: ["English", "Nepali", "Korean"],
      specialization: "Everest Base Camp",
      experience: "10 years",
      price: "60",
      verified: true
    },
    {
      id: 4,
      name: "Krishna Tamang",
      image: "/src/assets/images/guide4.jpg", // Replace with actual Nepal guide image
      rating: 4.6,
      reviews: 89,
      location: "Chitwan",
      type: "wildlife",
      languages: ["English", "Nepali", "Hindi"],
      specialization: "Chitwan Safari Expert",
      experience: "6 years",
      price: "40",
      verified: true
    }
  ];

  return (
    <div className="hire-guide-page">
      <Navbar />
      
      <div className="hero-section">
        <div className="hero-content">
          <h1>Discover Local Guides in Nepal</h1>
          <p>Find expert guides for trekking, cultural tours, wildlife safaris, and more</p>
          
          <div className="search-filters">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search guides by name or specialization..."
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

      <div className="guides-section">
        <div className="section-header">
          <h2>Our Expert Local Guides</h2>
          <p>Experienced guides for every type of adventure in Nepal</p>
        </div>

        <div className="guides-grid">
          {guides
            .filter(guide => {
              const matchesSearch = 
                guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                guide.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                guide.type.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesType = selectedType === 'all' || guide.type === selectedType;
              return matchesSearch && matchesType;
            })
            .map(guide => (
              <div key={guide.id} className="guide-card">
                <div className="guide-image">
                  <img src={guide.image} alt={guide.name} />
                  {guide.verified && (
                    <div className="verified-badge">
                      <MdVerified /> Verified
                    </div>
                  )}
                </div>
                
                <div className="guide-info">
                  <h3>{guide.name}</h3>
                  <div className="guide-type">{guideTypes.find(t => t.value === guide.type)?.label}</div>
                  
                  <div className="guide-rating">
                    <div className="stars">
                      <FaStar />
                      <span>{guide.rating}</span>
                    </div>
                    <span className="reviews">({guide.reviews} reviews)</span>
                  </div>

                  <div className="guide-details">
                    <div className="detail-item">
                      <FaMapMarkerAlt />
                      <span>{guide.location}</span>
                    </div>
                    <div className="detail-item">
                      <FaLanguage />
                      <span>{guide.languages.join(', ')}</span>
                    </div>
                  </div>

                  <div className="specialization">
                    <strong>Specialization:</strong> {guide.specialization}
                  </div>

                  <div className="experience">
                    <strong>Experience:</strong> {guide.experience}
                  </div>

                  <div className="guide-footer">
                    <div className="price">
                      <span className="amount">${guide.price}</span>
                      <span className="period">/day</span>
                    </div>
                    <button className="view-profile">View Profile</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HireGuide; 