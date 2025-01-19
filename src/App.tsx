import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { getMessages, saveMessage, checkConnection } from './lib/db';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  created_at: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isBot: true,
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const initDb = async () => {
      const connected = await checkConnection();
      setDbStatus(connected ? 'connected' : 'error');
      if (connected) {
        await createMessagesTable();
        await loadMessages();
      }
    };
    initDb();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    const loadedMessages = await getMessages();
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const savedUserMessage = await saveMessage({ text: userMessage, isBot: false });
    if (savedUserMessage) {
      setMessages(prev => [...prev, savedUserMessage]);
    }
    
    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: userMessage,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const botResponse = response.data.choices[0].message.content;
      const savedBotMessage = await saveMessage({ text: botResponse, isBot: true });
      if (savedBotMessage) {
        setMessages(prev => [...prev, savedBotMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      const savedErrorMessage = await saveMessage({ text: errorMessage, isBot: true });
      if (savedErrorMessage) {
        setMessages(prev => [...prev, savedErrorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-yellow-50">
      <div className="container mx-auto max-w-4xl h-screen py-8 px-4">
        <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-pink-100">
            <h1 className="text-2xl font-semibold text-pink-900">
              AI Chat Assistant
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-yellow-700">Ask me anything!</p>
              <span className={`inline-block w-2 h-2 rounded-full ${
                dbStatus === 'connected' ? 'bg-green-500' :
                dbStatus === 'connecting' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-sm text-gray-500">
                {dbStatus === 'connected' ? 'Database Connected' :
                 dbStatus === 'connecting' ? 'Connecting to Database...' :
                 'Database Error'}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                isBot={message.isBot}
              />
            ))}
            {isLoading && (
              <div className="flex items-center justify-center text-pink-600">
                <div className="animate-pulse">Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-6 border-t border-pink-100 bg-white rounded-b-xl"
          >
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                disabled={isLoading || dbStatus !== 'connected'}
              />
              <button
                type="submit"
                disabled={isLoading || dbStatus !== 'connected'}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-yellow-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;