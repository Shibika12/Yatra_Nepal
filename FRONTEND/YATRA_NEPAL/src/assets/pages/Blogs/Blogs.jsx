import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { FiMoreVertical, FiHeart, FiArrowLeft } from 'react-icons/fi';
import "./Blogs.scss";

export const Blogs = () => {
  const navigate = useNavigate();
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  
  // Dummy data - replace with your actual data
  const [blogs, setBlogs] = useState([
    {
      id: 1,
      userId: "user1",
      userName: "John Doe",
      location: "Everest Base Camp",
      content: "An amazing journey through the Himalayas. The views were breathtaking and the local people were incredibly welcoming...",
      images: ["https://via.placeholder.com/400x300"],
      likes: 24,
      date: "2024-03-15"
    },
    {
      id: 2,
      userId: "user2",
      userName: "Jane Smith",
      location: "Pokhara",
      content: "Paragliding over Phewa Lake was an unforgettable experience. The Annapurna range in the background made it even more special...",
      images: ["https://via.placeholder.com/400x300"],
      likes: 31,
      date: "2024-03-14"
    },
    // Add more dummy blogs as needed
  ]);

  const currentUserId = "user1"; // This should come from your auth system

  const handleLike = (blogId) => {
    setBlogs(prevBlogs =>
      prevBlogs.map(blog =>
        blog.id === blogId
          ? { ...blog, likes: blog.likes + 1 }
          : blog
      )
    );
  };

  const handleBack = () => {
    navigate(-1); // This will go back to the previous page
  };

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
            <div key={blog.id} className="blog-card">
              <div className="blog-header">
                <div className="blog-info">
                  <h2>{blog.userName}</h2>
                  <p className="location">📍 {blog.location}</p>
                  <p className="date">{new Date(blog.date).toLocaleDateString()}</p>
                </div>
                {blog.userId === currentUserId && (
                  <div className="more-options">
                    <button 
                      onClick={() => setShowDeleteMenu(blog.id)} 
                      className="more-btn"
                    >
                      <FiMoreVertical />
                    </button>
                    {showDeleteMenu === blog.id && (
                      <div className="delete-menu">
                        <button onClick={() => {
                          setBlogs(blogs.filter(b => b.id !== blog.id));
                          setShowDeleteMenu(null);
                        }}>
                          Delete Blog
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="blog-images">
                {blog.images.map((img, index) => (
                  <img key={index} src={img} alt={`Travel ${index + 1}`} />
                ))}
              </div>
              
              <p className="blog-content">{blog.content}</p>
              
              <div className="blog-actions">
                <button 
                  className={`like-btn ${blog.liked ? 'liked' : ''}`}
                  onClick={() => handleLike(blog.id)}
                >
                  <FiHeart className="heart-icon" />
                  <span>{blog.likes}</span>
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