import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './AdminOverview.scss';
import { 
  FaUsers, 
  FaUserTie, 
  FaStar, 
  FaMapMarkedAlt,
  FaChartLine 
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminOverview = () => {
  const [touristCount, setTouristCount] = useState(0);
  const [verifiedGuidesCount, setVerifiedGuidesCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [guideDistribution, setGuideDistribution] = useState([]);
  const [transactionData, setTransactionData] = useState({
    labels: [],
    amounts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTouristCount = async () => {
    try {
      console.log('Fetching tourist count...');
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3002/api/admin/tourists/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
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
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3002/api/admin/guides/verified-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
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
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3002/api/admin/reviews/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
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
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3002/api/admin/guides/distribution', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Guide distribution response:', response.data);
      setGuideDistribution(response.data);
    } catch (error) {
      console.error('Error fetching guide distribution:', error.response || error);
      setError('Failed to fetch guide distribution. Please try again later.');
    }
  };

  const fetchTransactionData = async () => {
    try {
      console.log('Fetching transaction data...');
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3002/api/admin/transactions/graph', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Transaction data response:', response.data);
      
      // Format the data for the chart
      setTransactionData({
        labels: response.data.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          });
        }),
        amounts: response.data.map(item => parseFloat(item.total_amount) || 0)
      });
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setError('Failed to fetch transaction data. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Debug token
        const token = localStorage.getItem('token');
        console.log('Current token:', token);
        if (token) {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', tokenPayload);
        }

        await Promise.all([
          fetchTouristCount(),
          fetchVerifiedGuidesCount(),
          fetchReviewsCount(),
          fetchGuideDistribution(),
          fetchTransactionData()
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

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Transaction Trends (Last 30 Days)',
        color: '#2c3e50',
        font: {
          size: 16,
          weight: 'normal'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `NPR ${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `NPR ${value.toLocaleString()}`
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const chartData = {
    labels: transactionData.labels,
    datasets: [
      {
        label: 'Daily Transaction Amount',
        data: transactionData.amounts,
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

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
            <div className="transaction-graph-container">
              <div className="dashboard-card transaction-graph">
                <h3><FaChartLine /> Transaction Analysis</h3>
                <div className="graph-container">
                  <Line options={chartOptions} data={chartData} />
                </div>
              </div>
            </div>

            <div className="guide-distribution-container">
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
                          style={{ 
                            width: `${type.percentage}%`,
                            backgroundColor: `var(--color-${index % 4})`
                          }}
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
    </div>
  );
};

export default AdminOverview; 