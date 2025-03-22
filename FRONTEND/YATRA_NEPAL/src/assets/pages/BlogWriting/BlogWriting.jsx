import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiImage, FiMoreVertical } from 'react-icons/fi'; // Only using image and more icons
import "./BlogWriting.scss";

export const BlogWriting = () => {
  const navigate = useNavigate();
  const [blogData, setBlogData] = useState({
    content: "",
    images: [],
  });

  const [showDeleteMenu, setShowDeleteMenu] = useState(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setBlogData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const handleSubmit = () => {
    console.log("Blog submitted:", blogData);
    // Add your API call here
  };

  const handleDelete = (blogId) => {
    console.log("Delete blog:", blogId);
    // Add your delete API call here
    setShowDeleteMenu(null);
  };

  return (
    <div className="blog-container">
      {/* Writing Section */}
      <div className="blog-writing-section">
        <div className="post-input-container">
          <textarea
            placeholder="Write a post about your travels!"
            value={blogData.content}
            onChange={(e) => setBlogData(prev => ({ ...prev, content: e.target.value }))}
          />
          
          <div className="post-actions">
            <label className="upload-btn">
              <FiImage />
              <span>Upload Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            <button className="post-btn" onClick={handleSubmit}>
              Share Your Story
            </button>
          </div>
        </div>

        {blogData.images.length > 0 && (
          <div className="image-preview">
            {blogData.images.map((img, index) => (
              <img key={index} src={img} alt={`Preview ${index + 1}`} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Blogs Section */}
      <div className="recent-blogs-section">
        <h2>Recent Blogs</h2>
        <div className="blogs-grid">
          {/* Example blog posts */}
          <div className="blog-post">
            <div className="post-header">
              <div className="post-info">
                <h3>John Doe</h3>
                <p className="location">Kathmandu, Nepal</p>
              </div>
              <div className="more-options">
                <button 
                  onClick={() => setShowDeleteMenu(1)} 
                  className="more-btn"
                >
                  <FiMoreVertical />
                </button>
                {showDeleteMenu === 1 && (
                  <div className="delete-menu">
                    <button onClick={() => handleDelete(1)}>
                      Delete Blog
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="post-content">
              As you approach to Pokhara, what you see is a beautiful city with a lot of greenery and a beautiful lake.
            </p>
            <div className="post-images">
              <img src="./src/assets/images/pokhara.jpg" alt="Post" />
            </div>
            <div className="post-actions">
              <button className="like-btn">❤️</button>
            </div>
          </div>
        </div>
        
        <button 
          className="see-all-btn"
          onClick={() => navigate('/blogs')}
        >
          SEE ALL
        </button>
      </div>
    </div>
  );
};

export default BlogWriting;
