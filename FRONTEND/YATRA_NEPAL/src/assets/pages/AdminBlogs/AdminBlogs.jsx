import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import { Modal, Button, Form } from 'react-bootstrap';
import './AdminBlogs.scss';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState('');
    const [selectedBlog, setSelectedBlog] = useState(null);

    const fetchBlogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3002/api/blogs/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
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

            const response = await axios.get('http://localhost:3002/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const unreadBlogNotifications = response.data.filter(
                notif => notif.type === 'blog' && !notif.is_read
            );

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

    const handleDelete = (blog) => {
        setSelectedBlog(blog);
        setShowDeleteModal(true);
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
        setDeleteMessage('');
        setSelectedBlog(null);
    };

    const confirmDelete = async () => {
        if (!selectedBlog || !deleteMessage.trim()) {
            toast.error('Please provide a reason for deletion');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication required');
                return;
            }

            // Delete the blog
            await axios.delete(`http://localhost:3002/api/admin/blogs/${selectedBlog.blog_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Create notification for the blog author
            await axios.post(
                'http://localhost:3002/api/notifications',
                {
                    user_id: selectedBlog.user_id,
                    type: 'blog_deletion',
                    content: `Your blog post has been deleted by admin. Reason: ${deleteMessage}`,
                    reference_id: selectedBlog.blog_id
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            toast.success('Blog deleted successfully');
            handleCloseModal();
            fetchBlogs(); // Refresh the list
        } catch (error) {
            console.error('Error deleting blog:', error);
            toast.error(error.response?.data?.message || 'Failed to delete blog');
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
                                            onClick={() => handleDelete(blog)}
                                        >
                                            <FaTrash /> Delete Blog
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <Modal show={showDeleteModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Blog Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label>Please provide a reason for deletion:</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={deleteMessage}
                                    onChange={(e) => setDeleteMessage(e.target.value)}
                                    placeholder="Enter reason for deletion..."
                                    required
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button 
                                variant="danger" 
                                onClick={confirmDelete}
                                disabled={!deleteMessage.trim()}
                            >
                                Delete Blog
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default AdminBlogs; 