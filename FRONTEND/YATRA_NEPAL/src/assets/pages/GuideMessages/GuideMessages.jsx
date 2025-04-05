import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaUser, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import GuideNavbar from '../../components/GuideNavbar/GuideNavbar';
import './GuideMessages.scss';

const GuideMessages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const [guideId, setGuideId] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Get guide ID from token
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setGuideId(payload.userId);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, [token]);

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations...');
      console.log('Token:', token ? 'Token present' : 'No token');
      
      // Use the authenticated route
      const response = await axios.get('http://localhost:3002/api/chat/guide/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Conversations response:', response.data);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');
      toast.error('Failed to load conversations');
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`http://localhost:3002/api/chat/conversation/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation) {
      try {
        const response = await axios.post('http://localhost:3002/api/chat/message', 
          {
            conversationId: selectedConversation.id,
            message: newMessage
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setMessages([...messages, response.data]);
        setNewMessage('');
        
        // Update the last message in conversations list
        setConversations(conversations.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              last_message: newMessage,
              last_message_time: new Date().toISOString()
            };
          }
          return conv;
        }));
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      }
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.tourist_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="guide-messages-container">
      <GuideNavbar />
      <div className="messages-content">
        <div className="messages-sidebar">
          <div className="search-section">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="conversations-list">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''} ${conv.unread_count > 0 ? 'unread' : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="tourist-avatar">
                  <FaUser />
                </div>
                <div className="conversation-info">
                  <div className="tourist-name">{conv.tourist_name}</div>
                  <div className="last-message">{conv.last_message}</div>
                  <div className="message-meta">
                    <span className="date">{formatDate(conv.last_message_time)}</span>
                    <span className="time">
                      {new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                {conv.unread_count > 0 && <div className="unread-badge" />}
              </div>
            ))}
          </div>
        </div>

        <div className="conversation-detail">
          {selectedConversation ? (
            <>
              <div className="conversation-header">
                <div className="tourist-info">
                  <div className="tourist-avatar">
                    <FaUser />
                  </div>
                  <div>
                    <h3>{selectedConversation.tourist_name}</h3>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.map((msg) => (
                  <div
                    key={msg.message_id}
                    className={`message ${msg.sender_id === guideId ? 'sent' : 'received'}`}
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

              <form onSubmit={handleSendMessage} className="message-input">
                <input
                  type="text"
                  placeholder="Type your message..."
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
              <FaUser className="icon" />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideMessages; 