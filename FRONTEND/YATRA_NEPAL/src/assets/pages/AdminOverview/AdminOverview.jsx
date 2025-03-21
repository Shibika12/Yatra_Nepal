import React from 'react';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './AdminOverview.scss';
import { 
  FaUsers, FaUserTie, FaBlog, FaStar, 
  FaGlobeAsia, FaChartLine, FaCalendarCheck,
  FaMapMarkedAlt
} from 'react-icons/fa';

const AdminOverview = () => {
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
                <p>250</p>
                <span className="trend positive">↑ 12% this month</span>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">
                <FaUserTie />
              </div>
              <div className="stat-info">
                <h3>Verified Guides</h3>
                <p>45</p>
                <span className="trend positive">↑ 5% this month</span>
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
                <p>320</p>
                <span className="trend positive">↑ 15% this month</span>
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
                <div className="guide-type">
                  <div className="type-info">
                    <span className="type-name">Trekking Guides</span>
                    <span className="type-count">25</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: '55%' }}></div>
                  </div>
                </div>
                <div className="guide-type">
                  <div className="type-info">
                    <span className="type-name">Cultural Guides</span>
                    <span className="type-count">15</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div className="guide-type">
                  <div className="type-info">
                    <span className="type-name">Adventure Guides</span>
                    <span className="type-count">12</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview; 