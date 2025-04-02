import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { FiMoreVertical, FiHeart, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import "./Blogs.scss";

export const Blogs = () => {
  const navigate = useNavigate();
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view blogs');
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:3002/api/blogs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setBlogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError(error.response?.data?.message || 'Failed to load blogs');
      setLoading(false);
    }
  };

  const handleLike = async (blogId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to like blogs');
        navigate('/login');
        return;
      }

      await axios.post(`http://localhost:3002/api/blogs/${blogId}/like`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchBlogs(); // Refresh blogs to update like count
    } catch (error) {
      console.error('Error liking blog:', error);
      setError('Failed to like blog');
    }
  };

  const handleDelete = async (blogId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to delete blogs');
        navigate('/login');
        return;
      }

      await axios.delete(`http://localhost:3002/api/blogs/${blogId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchBlogs(); // Refresh blogs after deletion
      setShowDeleteMenu(null);
    } catch (error) {
      console.error('Error deleting blog:', error);
      setError('Failed to delete blog');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="blogs-page">
        <Navbar />
        <div className="blogs-content">
          <div className="loading">Loading blogs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blogs-page">
        <Navbar />
        <div className="blogs-content">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="blogs-page">
      <Navbar />
      
      <main className="blogs-content">
        <div className="blogs-header">
          <button 
            className="back-button"
            onClick={handleBack}
          >
            <FiArrowLeft />
          </button>
          <h1>Travel Stories</h1>
        </div>

        <div className="blogs-grid">
          {blogs.map(blog => (
            <div key={blog.blog_id} className="blog-card">
              <div className="blog-header">
                <div className="blog-info">
                  <h2>{blog.author_name}</h2>
                  <p className="date">{new Date(blog.created_at).toLocaleDateString()}</p>
                </div>
                {blog.user_id === JSON.parse(localStorage.getItem('user'))?.user_id && (
                  <div className="more-options">
                    <button 
                      onClick={() => setShowDeleteMenu(blog.blog_id)} 
                      className="more-btn"
                    >
                      <FiMoreVertical />
                    </button>
                    {showDeleteMenu === blog.blog_id && (
                      <div className="delete-menu">
                        <button onClick={() => handleDelete(blog.blog_id)}>
                          Delete Blog
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="blog-images">
                {blog.images && blog.images.map((image, index) => (
                  <img 
                    key={index} 
                    src={`http://localhost:3002${image}`} 
                    alt={`Blog ${index + 1}`} 
                  />
                ))}
              </div>
              
              <p className="blog-content">{blog.content}</p>
              
              <div className="blog-actions">
                <button 
                  className={`like-btn ${blog.is_liked ? 'liked' : ''}`}
                  onClick={() => handleLike(blog.blog_id)}
                >
                  <FiHeart className={blog.is_liked ? 'filled' : ''} />
                  <span>{blog.likes_count}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blogs; 