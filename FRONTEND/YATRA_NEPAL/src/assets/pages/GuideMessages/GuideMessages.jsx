import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import './GuideMessages.scss';
import GuideNavbar from '../../components/GuideNavbar/GuideNavbar';

const GuideMessages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.user_id) {
          throw new Error('User data not found');
        }

        const response = await axios.get(`http://localhost:3002/guide/messages/${user.user_id}`);
        setMessages(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.post(`http://localhost:3002/guide/messages`, {
        guide_id: user.user_id,
        tourist_id: selectedChat.tourist_id,
        message: newMessage,
      });

      // Update messages in the UI
      setMessages(prev => {
        const updatedMessages = [...prev];
        const chatIndex = updatedMessages.findIndex(
          chat => chat.tourist_id === selectedChat.tourist_id
        );
        if (chatIndex !== -1) {
          updatedMessages[chatIndex].messages.push({
            sender_id: user.user_id,
            message: newMessage,
            created_at: new Date().toISOString(),
          });
        }
        return updatedMessages;
      });

      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="guide-messages-container">
      <GuideNavbar />
      <div className="guide-messages-content">
        <Container>
          <h1>Messages</h1>
          
          <div className="messages-interface">
            <Card className="chats-list">
              <Card.Body>
                <h3>Conversations</h3>
                {messages.length === 0 ? (
                  <p className="no-messages">No messages yet.</p>
                ) : (
                  messages.map((chat) => (
                    <div
                      key={chat.tourist_id}
                      className={`chat-item ${selectedChat?.tourist_id === chat.tourist_id ? 'active' : ''}`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <h4>{chat.tourist_name}</h4>
                      <p className="last-message">
                        {chat.messages[chat.messages.length - 1]?.message.substring(0, 30)}...
                      </p>
                      <span className="message-time">
                        {new Date(chat.messages[chat.messages.length - 1]?.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </Card.Body>
            </Card>

            <Card className="chat-window">
              <Card.Body>
                {selectedChat ? (
                  <>
                    <div className="chat-header">
                      <h3>{selectedChat.tourist_name}</h3>
                    </div>
                    <div className="messages-container">
                      {selectedChat.messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`message ${msg.sender_id === JSON.parse(localStorage.getItem('user')).user_id ? 'sent' : 'received'}`}
                        >
                          <div className="message-content">
                            <p>{msg.message}</p>
                            <span className="message-time">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Form onSubmit={handleSendMessage} className="message-input">
                      <Form.Control
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <Button type="submit" disabled={!newMessage.trim()}>
                        Send
                      </Button>
                    </Form>
                  </>
                ) : (
                  <div className="no-chat-selected">
                    <p>Select a conversation to start messaging</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default GuideMessages; 