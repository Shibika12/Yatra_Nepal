import React, { useState } from 'react';
import { FaSearch, FaUser, FaPaperPlane } from 'react-icons/fa';
import GuideNavbar from '../../components/GuideNavbar/GuideNavbar';
import './GuideMessages.scss';

const GuideMessages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Sample data - replace with actual API calls
  const [conversations] = useState([
    {
      id: 1,
      tourist: {
        name: 'John Smith',
        avatar: '/default-avatar.png',
        email: 'john@example.com'
      },
      lastMessage: 'Hi, I\'m interested in booking a trek to Everest Base Camp.',
      timestamp: '2024-03-20T10:30:00',
      unread: true,
      messages: [
        { text: 'Hi, I\'m interested in booking a trek to Everest Base Camp.', sender: 'tourist', time: '10:30 AM' },
        { text: 'Hello John! I\'d be happy to help you with the Everest Base Camp trek. When are you planning to go?', sender: 'guide', time: '10:32 AM' }
      ]
    },
    {
      id: 2,
      tourist: {
        name: 'Sarah Johnson',
        avatar: '/default-avatar.png',
        email: 'sarah@example.com'
      },
      lastMessage: 'Could you tell me more about the Annapurna Circuit trek?',
      timestamp: '2024-03-19T09:15:00',
      unread: false,
      messages: [
        { text: 'Could you tell me more about the Annapurna Circuit trek?', sender: 'tourist', time: '9:15 AM' }
      ]
    },
    {
      id: 3,
      tourist: {
        name: 'Michael Brown',
        avatar: '/default-avatar.png',
        email: 'michael@example.com'
      },
      lastMessage: 'Thank you for the great experience last week!',
      timestamp: '2024-03-18T15:45:00',
      unread: true,
      messages: [
        { text: 'Thank you for the great experience last week!', sender: 'tourist', time: 'Yesterday' }
      ]
    }
  ]);

  const filteredConversations = conversations.filter(conv => 
    conv.tourist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.tourist.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation) {
      // Here you would typically send the message to your backend
      const updatedConversations = conversations.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: [
              ...conv.messages,
              { 
                text: newMessage, 
                sender: 'guide', 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ],
            lastMessage: newMessage,
            timestamp: new Date().toISOString()
          };
        }
        return conv;
      });
      setNewMessage('');
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
                className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''} ${conv.unread ? 'unread' : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="tourist-avatar">
                  <FaUser />
                </div>
                <div className="conversation-info">
                  <div className="tourist-name">{conv.tourist.name}</div>
                  <div className="last-message">{conv.lastMessage}</div>
                  <div className="message-meta">
                    <span className="date">{formatDate(conv.timestamp)}</span>
                    <span className="time">
                      {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                {conv.unread && <div className="unread-badge" />}
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
                    <h3>{selectedConversation.tourist.name}</h3>
                    <p>{selectedConversation.tourist.email}</p>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {selectedConversation.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sender === 'guide' ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{msg.text}</p>
                      <span className="message-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
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