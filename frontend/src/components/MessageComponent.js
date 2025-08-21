import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { FaPaperPlane, FaEnvelope, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MessageComponent = ({ orderId, productOwnerId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [orderId]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/messages/order/${orderId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const messageType = user._id === productOwnerId ? 'owner_to_buyer' : 'buyer_to_owner';
      
      await api.post('/api/messages', {
        orderId,
        message: newMessage.trim(),
        messageType
      });

      setNewMessage('');
      await fetchMessages(); // Refresh messages
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FaEnvelope className="mr-2 text-primary-600" />
          Order Communication
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Communicate with {user._id === productOwnerId ? 'the buyer' : 'the product owner'} about this order
        </p>
      </div>

      {/* Messages Display */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FaEnvelope className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  message.sender._id === user._id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <FaUser className="h-3 w-3" />
                  <span className="text-xs font-medium">
                    {message.sender.name}
                    {message.messageType === 'system' && ' (System)'}
                  </span>
                </div>
                <p className="text-sm">{message.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FaPaperPlane className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageComponent;
