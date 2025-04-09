import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiImage, FiMoreVertical, FiHeart } from 'react-icons/fi';
import axios from 'axios';
import "./BlogWriting.scss";

export const BlogWriting = () => {
  const navigate = useNavigate();
  const [blogData, setBlogData] = useState({
    content: "",
    images: [],
    imageFiles: [] // To store actual file objects
  });

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'Present' : 'Missing');
      
      if (!token) {
        setError('Please log in to view blogs');
        navigate('/login');
        return;
      }

      console.log('Making request to fetch blogs...');
      const response = await axios.get('http://localhost:3002/api/blogs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Blogs response:', response.data);
      setBlogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || 'Failed to load blogs');
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setBlogData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls],
      imageFiles: [...prev.imageFiles, ...files]
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to create a blog post');
        navigate('/login');
        return;
      }

      console.log('Creating blog post with content:', blogData.content);
      console.log('Number of images:', blogData.imageFiles.length);

      const formData = new FormData();
      formData.append('content', blogData.content);
      blogData.imageFiles.forEach((file, index) => {
        console.log(`Adding image ${index + 1}:`, file.name);
        formData.append('images', file);
      });

      console.log('Making request to create blog post...');
      const response = await axios.post('http://localhost:3002/api/blogs', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Blog post created successfully:', response.data);

      // Clear form and refresh blogs
      setBlogData({
        content: "",
        images: [],
        imageFiles: []
      });
      fetchBlogs();
    } catch (error) {
      console.error('Error creating blog post:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || 'Failed to create blog post');
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

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await axios.post(`http://localhost:3002/api/blogs/${blogId}/like`);
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

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await axios.delete(`http://localhost:3002/api/blogs/${blogId}`);
      fetchBlogs(); // Refresh blogs after deletion
      setShowDeleteMenu(null);
    } catch (error) {
      console.error('Error deleting blog:', error);
      setError('Failed to delete blog');
    }
  };

  if (loading) {
    return <div className="blog-container">Loading...</div>;
  }

  if (error) {
    return <div className="blog-container error">{error}</div>;
  }

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
            <button 
              className="post-btn" 
              onClick={handleSubmit}
              disabled={!blogData.content.trim()}
            >
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
          {blogs.slice(0, 1).map((blog) => (
            <div key={blog.blog_id} className="blog-post">
              <div className="post-header">
                <div className="post-info">
                  <h3>{blog.author_name}</h3>
                  <p className="post-date">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </p>
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
              <p className="post-content">{blog.content}</p>
              {blog.images.length > 0 && (
                <div className="post-images">
                  {blog.images.map((image, index) => (
                    <img 
                      key={index} 
                      src={`http://localhost:3002${image}`} 
                      alt={`Blog ${index + 1}`} 
                    />
                  ))}
                </div>
              )}
              <div className="post-actions">
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
