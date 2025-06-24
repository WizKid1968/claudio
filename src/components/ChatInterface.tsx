import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Send, Bot, User } from 'lucide-react';
import { chatService } from '../services/chatService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(input.trim(), messages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-center py-6 px-6 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-medium text-gray-900">Claudio</h1>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        <ScrollArea className="h-full px-6 py-8" ref={scrollAreaRef}>
          <div className="space-y-1">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-medium text-gray-900 mb-3">Hello! I'm Claudio</h2>
                <p className="text-gray-600 text-lg max-w-md mx-auto">I'm an AI assistant ready to help you. How can I assist you today?</p>
              </div>
            )}
            
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isLoading && <LoadingMessage />}
            
            {error && (
              <div className="text-center py-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 p-6 bg-white">
        <form onSubmit={handleSubmit} className="flex items-end space-x-4">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Claudio..."
              className="min-h-[52px] max-h-32 resize-none border-gray-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl text-base placeholder:text-gray-500"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-12 w-12 bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 rounded-xl shadow-sm transition-all duration-200"
            size="icon"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Claudio can make mistakes. Please double-check responses.
        </div>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[75%] ${isUser ? 'flex-row-reverse space-x-reverse space-x-3' : 'flex-row space-x-3'}`}>
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8">
            <AvatarFallback className={isUser ? 'bg-blue-500 text-white' : 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'}>
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className={`px-4 py-3 rounded-2xl chat-message ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
          <div className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-gray-900'}`}>
            {message.content.split('\n').map((line, index) => (
              <p key={index} className={`${index === 0 ? 'mt-0' : ''} ${index === message.content.split('\n').length - 1 ? 'mb-0' : ''}`}>
                {line || '\u00A0'}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingMessage: React.FC = () => {
  return (
    <div className="flex justify-start mb-6">
      <div className="flex max-w-[75%] space-x-3">
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
              <Bot className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="px-4 py-3 rounded-2xl chat-bubble-assistant">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px] bg-gray-200" />
            <Skeleton className="h-4 w-[160px] bg-gray-200" />
            <Skeleton className="h-4 w-[120px] bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
