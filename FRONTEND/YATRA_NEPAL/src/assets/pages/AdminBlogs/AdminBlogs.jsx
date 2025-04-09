import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import './AdminBlogs.scss';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBlogs = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/blogs/all');
            setBlogs(response.data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast.error('Failed to fetch blogs');
        } finally {
            setLoading(false);
        }
    };

    const markBlogNotificationsAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Get all unread blog notifications
            const response = await axios.get('http://localhost:3002/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const unreadBlogNotifications = response.data.filter(
                notif => notif.type === 'blog' && !notif.is_read
            );

            // Mark each notification as read
            for (const notification of unreadBlogNotifications) {
                await axios.put(
                    `http://localhost:3002/api/notifications/${notification.id}/read`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    useEffect(() => {
        fetchBlogs();
        markBlogNotificationsAsRead();
    }, []);

    const handleDelete = async (blogId) => {
        if (window.confirm('Are you sure you want to delete this blog?')) {
            try {
                await axios.delete(`http://localhost:3002/api/admin/blogs/${blogId}`);
                toast.success('Blog deleted successfully');
                fetchBlogs(); // Refresh the list
            } catch (error) {
                console.error('Error deleting blog:', error);
                toast.error('Failed to delete blog');
            }
        }
    };

    if (loading) {
        return (
            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-main">
                    <div className="admin-blogs-container">
                        <div className="loading">Loading blogs...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-main">
                <div className="admin-blogs-container">
                    <div className="dashboard-header">
                        <h1>Manage Blog Posts</h1>
                        <p>Total Blogs: {blogs.length}</p>
                    </div>

                    {blogs.length === 0 ? (
                        <div className="no-blogs">
                            <p>No blogs found</p>
                        </div>
                    ) : (
                        <div className="blogs-grid">
                            {blogs.map((blog) => (
                                <div key={blog.blog_id} className="blog-card">
                                    <div className="blog-images">
                                        {blog.images && blog.images.length > 0 ? (
                                            <div className="image-gallery">
                                                {blog.images.map((image, index) => (
                                                    <img
                                                        key={index}
                                                        src={`http://localhost:3002${image}`}
                                                        alt={`Blog ${blog.blog_id} image ${index + 1}`}
                                                        className="blog-image"
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-image">No images</div>
                                        )}
                                    </div>
                                    <div className="blog-content">
                                        <div className="blog-info">
                                            <p className="author">Author: {blog.author_name}</p>
                                            <p className="date">
                                                Posted: {format(new Date(blog.created_at), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <p className="content">{blog.content}</p>
                                        <div className="blog-stats">
                                            <span>Likes: {blog.likes_count}</span>
                                        </div>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDelete(blog.blog_id)}
                                        >
                                            <FaTrash /> Delete Blog
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminBlogs; 