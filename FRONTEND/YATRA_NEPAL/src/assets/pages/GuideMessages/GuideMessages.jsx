import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaUser, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import GuideNavbar from '../../components/GuideNavbar/GuideNavbar';
import './GuideMessages.scss';
import io from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';

const GuideMessages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const [guideId, setGuideId] = useState(null);
  const socketRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // Check for conversation ID in URL params after conversations are loaded
    if (conversations.length > 0) {
      const params = new URLSearchParams(location.search);
      const conversationId = params.get('conversation');
      if (conversationId) {
        const conversation = conversations.find(conv => conv.id === parseInt(conversationId));
        if (conversation) {
          setSelectedConversation(conversation);
          handleConversationSelect(parseInt(conversationId));
        }
      }
    }
  }, [conversations, location]);

  useEffect(() => {
    // Initialize socket connection
    if (token) {
      socketRef.current = io('http://localhost:3002', {
        auth: { token }
      });

      // Listen for new messages
      socketRef.current.on('receive_message', (message) => {
        console.log('Received message in GuideMessages:', message);
        
        // Update messages if the conversation is selected
        if (selectedConversation?.id === message.conversation_id) {
          setMessages(prev => {
            const messageExists = prev.some(msg => 
              msg.message_id === message.message_id || 
              (msg.message === message.message && 
               msg.sender_id === message.sender_id && 
               msg.created_at === message.created_at)
            );
            
            if (!messageExists) {
              return [...prev, message];
            }
            return prev;
          });
        }

        // Update conversation list to show new unread count
        setConversations(prev => prev.map(conv => {
          if (conv.id === message.conversation_id) {
            // Only increment unread count if this conversation isn't currently selected
            const newUnreadCount = selectedConversation?.id === conv.id 
              ? 0 
              : (conv.unread_count || 0) + 1;
            
            return {
              ...conv,
              last_message: message.message,
              last_message_time: message.created_at,
              unread_count: newUnreadCount
            };
          }
          return conv;
        }));

        scrollToBottom();
      });

      // Clean up socket connection
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [token]);

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations...');
      console.log('Token:', token ? 'Token present' : 'No token');
      
      const response = await axios.get('http://localhost:3002/api/chat/guide/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Conversations response:', response.data);
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');
      toast.error('Failed to load conversations');
      setLoading(false);
    }
  };

  const handleConversationSelect = async (conversationId) => {
    try {
      console.log('Selecting conversation:', conversationId);
      const response = await axios.get(`http://localhost:3002/api/chat/conversation/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fetched messages:', response.data);
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        setMessages(response.data || []);
        scrollToBottom();
        
        // Emit mark_read socket event
        if (socketRef.current) {
          socketRef.current.emit('mark_read', { conversationId });
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
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
        senderId: guideId,
        receiverId: selectedConversation.tourist_id
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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
                onClick={() => {
                  setSelectedConversation(conv);
                  handleConversationSelect(conv.id);
                }}
              >
                <div className="tourist-avatar">
                  <FaUser />
                </div>
                <div className="conversation-info">
                  <div className="tourist-name">
                    {conv.tourist_name}
                    {conv.unread_count > 0 && (
                      <span className="unread-count">{conv.unread_count}</span>
                    )}
                  </div>
                  <div className="last-message">{conv.last_message}</div>
                  <div className="message-meta">
                    <span className="date">{formatDate(conv.last_message_time)}</span>
                    <span className="time">
                      {new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
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