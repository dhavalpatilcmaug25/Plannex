import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import chatService from '../../services/chatService';

const VendorChat = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State from navigation (if any)
    const initialRecipientId = location.state?.recipientId || null;
    const initialRecipientName = location.state?.recipientName || null;

    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(initialRecipientId ? { id: initialRecipientId, name: initialRecipientName } : null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        loadConversations();
        const interval = setInterval(loadConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedChat) {
            loadMessages(selectedChat.id);
            const interval = setInterval(() => loadMessages(selectedChat.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedChat]);

    const loadConversations = async () => {
        try {
            const data = await chatService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error("Failed to load conversations", error);
        }
    };

    const loadMessages = async (otherUserId) => {
        try {
            const data = await chatService.getMessages(otherUserId);
            const user = JSON.parse(localStorage.getItem('user'));
            const myId = user?.id;

            const formattedMessages = data.map(m => ({
                id: m.id,
                sender: m.sender?.id === myId ? (user.username || 'You') : (selectedChat?.name || 'Client'),
                text: m.content,
                time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: m.sender?.id === myId
            }));

            setMessages(formattedMessages);
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        try {
            await chatService.sendMessage({
                receiverId: selectedChat.id,
                content: newMessage
            });
            setNewMessage('');
            loadMessages(selectedChat.id);
            loadConversations();
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    return (
        <div className="animate-fade-in">
            <Button variant="link" className="text-muted ps-0 mb-3 text-decoration-none" onClick={() => navigate(-1)}>
                &larr; Back
            </Button>
            <h2 className="fw-bold mb-4">Client Messages</h2>
            <Row>
                <Col md={4}>
                    <Card className="card-modern h-100">
                        <Card.Header className="bg-white fw-bold">Active Chats</Card.Header>
                        <div className="list-group list-group-flush">
                            {/* If selected chat is not in history (new chat), show it first */}
                            {selectedChat && !conversations.find(c => c.id === selectedChat.id) && (
                                <button className="list-group-item list-group-item-action active">
                                    <div className="d-flex w-100 justify-content-between">
                                        <h6 className="mb-1">{selectedChat.name}</h6>
                                        <small>New</small>
                                    </div>
                                    <small>Start a conversation...</small>
                                </button>
                            )}

                            {conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    className={`list-group-item list-group-item-action ${selectedChat?.id === conv.id ? 'active' : ''}`}
                                    onClick={() => setSelectedChat({ id: conv.id, name: conv.name })}
                                >
                                    <div className="d-flex w-100 justify-content-between">
                                        <h6 className="mb-1">
                                            {conv.username}
                                            <small className="text-muted ms-1" style={{ fontSize: '0.8em' }}>
                                                ({conv.roles.map(r => r.name.replace('ROLE_', '')).join(', ')})
                                            </small>
                                        </h6>
                                    </div>
                                    <small className="text-muted">{conv.email}</small>
                                </button>
                            ))}
                            {conversations.length === 0 && !selectedChat && <p className="p-3 text-muted text-center">No active chats.</p>}
                        </div>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card className="card-modern h-100" style={{ minHeight: '500px' }}>
                        <Card.Body className="d-flex flex-column">
                            {selectedChat ? (
                                <>
                                    <div className="border-bottom pb-2 mb-3">
                                        <h5 className="mb-0">
                                            Chat with {selectedChat.name}
                                            {selectedChat.roles && (
                                                <small className="text-muted ms-2" style={{ fontSize: '0.6em' }}>
                                                    ({selectedChat.roles.map(r => r.name.replace('ROLE_', '')).join(', ')})
                                                </small>
                                            )}
                                        </h5>
                                    </div>
                                    <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: '400px' }}>
                                        {messages.length === 0 ? <p className="text-center text-muted mt-5">Say hello!</p> : messages.map(msg => (
                                            <div key={msg.id} className={`d-flex mb-3 ${msg.isMe ? 'justify-content-end' : ''}`}>
                                                <div className={`p-3 rounded-3 shadow-sm ${msg.isMe ? 'bg-primary text-white' : 'bg-light'}`} style={{ maxWidth: '70%' }}>
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <small className="fw-bold me-2">{msg.sender}</small>
                                                        <small style={{ fontSize: '0.7rem', opacity: 0.8 }}>{msg.time}</small>
                                                    </div>
                                                    <p className="mb-0">{msg.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Form onSubmit={handleSend} className="d-flex gap-2">
                                        <Form.Control
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="rounded-pill"
                                        />
                                        <Button type="submit" className="btn-primary rounded-pill px-4">Send</Button>
                                    </Form>
                                </>
                            ) : (
                                <div className="d-flex h-100 justify-content-center align-items-center text-muted">
                                    <p>Select a conversation to start chatting</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default VendorChat;
