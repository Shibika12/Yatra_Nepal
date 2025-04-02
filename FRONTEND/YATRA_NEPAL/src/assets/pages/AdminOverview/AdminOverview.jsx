import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './AdminOverview.scss';
import { 
  FaUsers, FaUserTie, FaBlog, FaStar, 
  FaGlobeAsia, FaChartLine, FaCalendarCheck,
  FaMapMarkedAlt
} from 'react-icons/fa';

const AdminOverview = () => {
  const [touristCount, setTouristCount] = useState(0);
  const [verifiedGuidesCount, setVerifiedGuidesCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [guideDistribution, setGuideDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTouristCount = async () => {
    try {
      console.log('Fetching tourist count...');
      const response = await axios.get('http://localhost:3002/api/admin/tourists/count');
      console.log('Tourist count response:', response.data);
      setTouristCount(response.data.count);
    } catch (error) {
      console.error('Error fetching tourist count:', error.response || error);
      setError('Failed to fetch tourist count. Please try again later.');
    }
  };

  const fetchVerifiedGuidesCount = async () => {
    try {
      console.log('Fetching verified guides count...');
      const response = await axios.get('http://localhost:3002/api/admin/guides/verified-count');
      console.log('Verified guides count response:', response.data);
      setVerifiedGuidesCount(response.data.count);
    } catch (error) {
      console.error('Error fetching verified guides count:', error.response || error);
      setError('Failed to fetch verified guides count. Please try again later.');
    }
  };

  const fetchReviewsCount = async () => {
    try {
      console.log('Fetching reviews count...');
      const response = await axios.get('http://localhost:3002/api/admin/reviews/count');
      console.log('Reviews count response:', response.data);
      setReviewsCount(response.data.count);
    } catch (error) {
      console.error('Error fetching reviews count:', error.response || error);
      setError('Failed to fetch reviews count. Please try again later.');
    }
  };

  const fetchGuideDistribution = async () => {
    try {
      console.log('Fetching guide distribution...');
      const response = await axios.get('http://localhost:3002/api/admin/guides/distribution');
      console.log('Guide distribution response:', response.data);
      setGuideDistribution(response.data);
    } catch (error) {
      console.error('Error fetching guide distribution:', error.response || error);
      setError('Failed to fetch guide distribution. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchTouristCount(),
          fetchVerifiedGuidesCount(),
          fetchReviewsCount(),
          fetchGuideDistribution()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="overview-container">
          <div className="overview-header">
            <h1>Welcome to Yatra Nepal Dashboard</h1>
            <p>Monitor and manage your travel platform's performance</p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-info">
                <h3>Active Tourists</h3>
                <p className="count">{touristCount}</p>
                <span className="trend">Registered users</span>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">
                <FaUserTie />
              </div>
              <div className="stat-info">
                <h3>Verified Guides</h3>
                <p className="count">{verifiedGuidesCount}</p>
                <span className="trend">Approved guides</span>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">
                <FaCalendarCheck />
              </div>
              <div className="stat-info">
                <h3>Tour Bookings</h3>
                <p>128</p>
                <span className="trend positive">↑ 8% this month</span>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">
                <FaStar />
              </div>
              <div className="stat-info">
                <h3>Guide Reviews</h3>
                <p className="count">{reviewsCount}</p>
                <span className="trend">Total reviews</span>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card popular-destinations">
              <h3><FaGlobeAsia /> Popular Destinations</h3>
              <div className="destination-list">
                <div className="destination-item">
                  <img src="/src/assets/images/everest.jpg" alt="Mount Everest" />
                  <div className="destination-info">
                    <h4>Mount Everest</h4>
                    <p>42 active tours</p>
                  </div>
                  <span className="booking-count">156 bookings</span>
                </div>
                <div className="destination-item">
                  <img src="/src/assets/images/annapurna.jpg" alt="Annapurna" />
                  <div className="destination-info">
                    <h4>Annapurna Circuit</h4>
                    <p>38 active tours</p>
                  </div>
                  <span className="booking-count">132 bookings</span>
                </div>
                <div className="destination-item">
                  <img src="/src/assets/images/pokhara.jpg" alt="Pokhara" />
                  <div className="destination-info">
                    <h4>Pokhara</h4>
                    <p>25 active tours</p>
                  </div>
                  <span className="booking-count">98 bookings</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card recent-activities">
              <h3><FaChartLine /> Recent Activities</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon guide">
                    <FaUserTie />
                  </div>
                  <div className="activity-info">
                    <h4>New Guide Application</h4>
                    <p>Ram Sharma applied as Trekking Guide</p>
                    <span className="time">2 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon booking">
                    <FaCalendarCheck />
                  </div>
                  <div className="activity-info">
                    <h4>New Booking</h4>
                    <p>Everest Base Camp Trek booked</p>
                    <span className="time">5 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon review">
                    <FaStar />
                  </div>
                  <div className="activity-info">
                    <h4>New Review</h4>
                    <p>5-star review for Annapurna Circuit</p>
                    <span className="time">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-card guide-distribution">
              <h3><FaMapMarkedAlt /> Guide Distribution</h3>
              <div className="guide-types">
                {guideDistribution.map((type, index) => (
                  <div className="guide-type" key={index}>
                    <div className="type-info">
                      <span className="type-name">{type.guide_type || 'Unspecified'} Guides</span>
                      <span className="type-count">{type.count}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress" 
                        style={{ width: `${type.percentage}%` }}
                        title={`${type.percentage}%`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview; 