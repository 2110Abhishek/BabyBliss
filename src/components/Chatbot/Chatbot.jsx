import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Hi there! 👋 I am the BlissBloomly Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const suggestedQuestions = [
        "What is your return policy?",
        "How do you handle shipping?",
        "How sizing works?",
        "Do you have discount codes?",
        "How can I contact support?",
        "Where is my order?",
        "What payment methods do you accept?",
        "Can I cancel my order?",
        "Do you offer gift wrapping?",
        "Can you suggest a toy?"
    ];

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e?.preventDefault();

        sendMessage(input);
    };

    const sendMessage = async (textToProcess) => {
        if (!textToProcess.trim()) return;

        const userMessage = { id: Date.now(), sender: 'user', text: textToProcess.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await axios.post('https://blissbloomlybackend.onrender.com/api/chatbot', { message: userMessage.text });

            const botMessage = {
                id: Date.now() + 1,
                sender: 'bot',
                text: res.data.response
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot API Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: "I'm having trouble connecting right now. Please try again later."
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="chatbot-wrapper">
            {/* Chat Bubble Toggle Button */}
            {!isOpen && (
                <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
                    <FiMessageCircle size={24} />
                    <span className="tooltip-text">Ask BlissBloomly Assistant</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="header-info">
                            <span className="assistant-avatar">🤖</span>
                            <div>
                                <h3>BlissBloomly Assistant</h3>
                                <p className="status">Online 🟢</p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                                <p>{msg.text.split('\n').map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}</p>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="message-bubble bot typing">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-suggestions">
                        {suggestedQuestions.map((q, idx) => (
                            <button
                                key={idx}
                                className="suggestion-chip"
                                onClick={() => sendMessage(q)}
                                disabled={isTyping}
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    <form className="chatbot-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" disabled={!input.trim() || isTyping}>
                            <FiSend size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
