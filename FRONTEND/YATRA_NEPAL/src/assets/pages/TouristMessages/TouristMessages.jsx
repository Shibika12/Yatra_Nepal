import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { FaSearch, FaUser, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import Navbar from '../../components/Navbar/Navbar';
import { toast } from 'react-toastify';
import './TouristMessages.scss';

const TouristMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [touristId, setTouristId] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const location = useLocation();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    // Get tourist ID from token
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setTouristId(payload.userId);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, [token]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:3002', {
      auth: { token }
    });

    // Listen for new messages
    socketRef.current.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    // Clean up socket connection
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    fetchConversations();
    
    // Check for conversation ID in URL params
    const params = new URLSearchParams(location.search);
    const conversationId = params.get('conversation');
    if (conversationId) {
      console.log('Conversation ID from URL:', conversationId);
      // Wait for conversations to be loaded before selecting
      const checkAndSelectConversation = () => {
        if (conversations.length > 0) {
          const conversation = conversations.find(conv => conv.id === parseInt(conversationId));
          if (conversation) {
            console.log('Found conversation:', conversation);
            setSelectedConversation(conversation);
            handleConversationSelect(parseInt(conversationId));
          } else {
            console.error('Conversation not found:', conversationId);
          }
        }
      };
      
      if (conversations.length > 0) {
        checkAndSelectConversation();
      } else {
        // If conversations aren't loaded yet, wait for them
        const interval = setInterval(() => {
          if (conversations.length > 0) {
            checkAndSelectConversation();
            clearInterval(interval);
          }
        }, 100);
        
        return () => clearInterval(interval);
      }
    }
  }, [location, conversations]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3002/api/chat/tourist/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
      setLoading(false);
    }
  };

  const handleConversationSelect = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3002/api/chat/conversation/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedConversation(conversations.find(conv => conv.id === conversationId));
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3002/api/chat/message', {
        conversationId: selectedConversation.id,
        message: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Emit message through socket
      socketRef.current.emit('send_message', {
        conversationId: selectedConversation.id,
        message: newMessage,
        senderId: touristId,
        receiverId: selectedConversation.guide_id
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.guide_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBackToGuideProfile = () => {
    // If we have a selected conversation, navigate back to that guide's profile
    if (selectedConversation) {
      navigate(`/guide/${selectedConversation.guide_id}`);
    } else {
      // Otherwise go back to the previous page
      navigate(-1);
    }
  };

  return (
    <div className="tourist-messages-container">
      <Navbar />
      <div className="messages-content">
        <div className="messages-sidebar">
          <div className="search-section">
            <button className="back-button" onClick={handleBackToGuideProfile}>
              <FaArrowLeft />
            </button>
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="conversations-list">
            {loading ? (
              <div className="loading">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="no-conversations">No conversations found</div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''} ${conv.unread_count > 0 ? 'unread' : ''}`}
                  onClick={() => handleConversationSelect(conv.id)}
                >
                  <div className="guide-avatar">
                    {conv.profile_picture ? (
                      <img src={conv.profile_picture} alt={conv.guide_name} />
                    ) : (
                      <FaUser />
                    )}
                  </div>
                  <div className="conversation-info">
                    <div className="guide-name">{conv.guide_name}</div>
                    <div className="last-message">{conv.last_message}</div>
                    <div className="message-meta">
                      <span>{new Date(conv.last_message_time).toLocaleDateString()}</span>
                      {conv.unread_count > 0 && (
                        <span className="unread-count">{conv.unread_count}</span>
                      )}
                    </div>
                  </div>
                  {conv.unread_count > 0 && <div className="unread-badge" />}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="conversation-detail">
          {selectedConversation ? (
            <>
              <div className="conversation-header">
                <div className="header-left">
                  <div className="guide-info">
                    <div className="guide-avatar">
                      {selectedConversation.profile_picture ? (
                        <img src={selectedConversation.profile_picture} alt={selectedConversation.guide_name} />
                      ) : (
                        <FaUser />
                      )}
                    </div>
                    <div>
                      <h3>{selectedConversation.guide_name}</h3>
                      <p>{selectedConversation.guide_type}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender_id === touristId ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{msg.message}</p>
                      <span className="message-time">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit">
                  <FaPaperPlane />
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation">
              <div className="icon">
                <FaUser />
              </div>
              <h3>Select a conversation</h3>
              <p>Choose a guide from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TouristMessages; 