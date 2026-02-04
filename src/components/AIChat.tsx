import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Copy, Check } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: number;
}

interface AIChatProps {
    currentTheme: 'light' | 'dark';
    userName: string;
    userRole: string;
}

const AIChat: React.FC<AIChatProps> = ({ currentTheme, userName, userRole }) => {
    // Theme-based colors for bot avatar background
    const botAvatarBg = currentTheme === 'dark' ? 'bg-green-600' : 'bg-green-600';

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: 'Hello! I am your AI assistant. How can I help you today? \n\nمرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟',
            sender: 'bot',
            timestamp: Date.now()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        try {
            const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

            if (!webhookUrl) {
                throw new Error('Webhook URL not configured');
            }

            const payload = {
                user: userName,
                message: userMessage.text,
                role: userRole,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString()
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Try to parse if it's JSON
                try {
                    const errorJson = JSON.parse(errorText);
                    console.error('Webhook error details:', errorJson);
                    throw new Error(errorJson.message || errorText || 'Failed to send message');
                } catch (e) {
                    console.error('Webhook error text:', errorText);
                    throw new Error(errorText || 'Failed to send message');
                }
            }

            const data = await response.json();

            // Handle various n8n response formats
            let responseText = "Message received";

            // If response is an array (common in n8n), take the first item
            const responseData = Array.isArray(data) && data.length > 0 ? data[0] : data;

            if (typeof responseData === 'string') {
                responseText = responseData;
            } else if (typeof responseData === 'object' && responseData !== null) {
                responseText = responseData.output || responseData.message || responseData.text || responseData.response || responseData.answer || responseData.content || JSON.stringify(responseData);
                // If it's a complex object and we stringified it, maybe try to be cleaner if it has a specific structure
                if (typeof responseText === 'object') responseText = JSON.stringify(responseText);
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: String(responseText),
                sender: 'bot',
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message to webhook:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I couldn't connect to the server. Please try again later.\n\nعذراً، لم أتمكن من الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً.",
                sender: 'bot',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const clearChat = () => {
        if (confirm('Are you sure you want to clear the chat history?')) {
            setMessages([]);
        }
    };

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm relative">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full text-blue-600 dark:text-blue-400 ${currentTheme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                        <Bot size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">AI Assistant</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
                        </div>
                    </div>
                </div>

                {messages.length > 0 && (
                    <button
                        onClick={clearChat}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        title="Clear Chat"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 opacity-50">
                        <Bot size={64} className="mb-4" />
                        <p className="text-lg font-medium">Start a conversation</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : `${botAvatarBg} text-white`
                                }`}>
                                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>

                            {/* Message Bubble */}
                            <div className="group relative">
                                <div
                                    className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-none'
                                        }`}
                                    dir="auto"
                                >
                                    {msg.text}
                                </div>

                                {/* Message Meta */}
                                <div className={`flex items-center gap-2 mt-1 px-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                                    }`}>
                                    <span className="text-[10px] text-gray-400">
                                        {formatTime(msg.timestamp)}
                                    </span>

                                    {/* Copy Button (only for bot messages or on hover) */}
                                    <button
                                        onClick={() => copyToClipboard(msg.text, msg.id)}
                                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ${copiedId === msg.id ? 'text-green-500' : ''
                                            }`}
                                        title="Copy text"
                                    >
                                        {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex w-full justify-start">
                        <div className="flex max-w-[85%] gap-3 flex-row">
                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${botAvatarBg
                                } text-white`}>
                                <Bot size={16} />
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="flex gap-1.5 h-6 items-center">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 z-10">
                <form
                    onSubmit={handleSend}
                    className="relative flex items-center items-end bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all dark:focus-within:border-blue-500"
                >
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type your message... (Send: Enter, New line: Shift+Enter)"
                        className="w-full bg-transparent border-none focus:ring-0 p-4 max-h-32 min-h-[56px] resize-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        rows={1}
                        dir="auto"
                        style={{ overflow: 'hidden' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isTyping}
                        className="p-2 m-2 mr-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        title="Send Message"
                    >
                        <Send size={20} />
                    </button>
                </form>
                <div className="text-center mt-2 text-xs text-gray-400 dark:text-gray-500">
                    AI can make mistakes. Consider checking important information.
                </div>
            </div>
        </div>
    );
};

export default AIChat;
