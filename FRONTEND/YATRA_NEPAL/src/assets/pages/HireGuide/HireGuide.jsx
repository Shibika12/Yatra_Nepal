import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HireGuide.scss';
import { FaStar, FaMapMarkerAlt, FaLanguage, FaSearch, FaFilter } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';

const HireGuide = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Dummy data - replace with your API call
  const guides = [
    {
      id: 1,
      name: "Ram Gurung",
      type: "Trekking",
      image: "/src/assets/images/guide1.jpg",
      rating: 4.8,
      reviews: 124,
      experience: "5 years",
      languages: ["English", "Nepali", "Hindi"],
      location: "Pokhara",
      specialization: "Annapurna Circuit",
      verified: true,
      price: "50"
    },
    // Add more guide data here
  ];

  const handleGuideClick = (guideId) => {
    navigate(`/guide/${guideId}`);
  };

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || guide.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="hire-guide-container">
      <div className="search-section">
        <h1>Find Your Perfect Guide in Nepal</h1>
        <p>Discover experienced guides for your next adventure</p>
        
        <div className="search-filters">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, location, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-options">
            <FaFilter className="filter-icon" />
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Trekking">Trekking</option>
              <option value="Cultural">Cultural</option>
              <option value="Adventure">Adventure</option>
              <option value="Nature">Nature</option>
            </select>
          </div>
        </div>
      </div>

      <div className="guides-grid">
        {filteredGuides.map(guide => (
          <div 
            key={guide.id} 
            className="guide-card"
            onClick={() => handleGuideClick(guide.id)}
          >
            <div className="guide-image">
              <img src={guide.image} alt={guide.name} />
              {guide.verified && (
                <div className="verified-badge">
                  <MdVerified /> Verified
                </div>
              )}
            </div>

            <div className="guide-info">
              <div className="guide-header">
                <h3>{guide.name}</h3>
                <div className="guide-type">{guide.type} Guide</div>
              </div>

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

              <div className="guide-specialization">
                <strong>Specialization:</strong> {guide.specialization}
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
  );
};

export default HireGuide; 