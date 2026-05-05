'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Shield, User, Paperclip, Sparkles, Trash2, Plus } from 'lucide-react';
import { generateId } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_ACTIONS = [
  { icon: '🔗', label: 'Analyze a URL' },
  { icon: '📄', label: 'Explain a scan result' },
  { icon: '❓', label: 'Am I being scammed?' },
  { icon: '🛡️', label: 'How do I protect myself?' },
  { icon: '📰', label: 'Explain this news' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content?: string) => {
    const text = content || input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Message = {
      id: generateId(), role: 'user', content: text,
      timestamp: new Date().toISOString(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        id: generateId(), role: 'assistant',
        content: data.content || data.error || 'Sorry, I could not respond.',
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, assistantMsg]);
    } catch {
      setMessages([...newMessages, {
        id: generateId(), role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-page">
      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-section">
            <div className="welcome-icon animate-float">
              <Shield size={48} />
            </div>
            <h2>CyberShield AI Assistant</h2>
            <p>I&apos;m your personal cybersecurity advisor. Ask me anything about online safety, threats, or how to protect yourself.</p>
            <div className="quick-actions">
              {QUICK_ACTIONS.map((action) => (
                <button key={action.label} className="quick-action glass-card" onClick={() => sendMessage(action.label)}>
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="msg-avatar">
              {msg.role === 'assistant' ? <Shield size={18} /> : <User size={18} />}
            </div>
            <div className="msg-bubble">
              <div className="msg-content" dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br/>')
                  .replace(/- (.*?)(<br\/>|$)/g, '• $1$2')
              }} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="msg-avatar"><Shield size={18} /></div>
            <div className="msg-bubble">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="chat-input-bar glass-card">
        <button className="input-action" title="Attach file"><Paperclip size={18} /></button>
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Ask about cybersecurity, paste a URL, or describe a suspicious situation..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <span className="char-count">{input.length}/2000</span>
        <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
          <Send size={18} />
        </button>
      </div>

      {/* Chat Controls */}
      <div className="chat-controls">
        <button className="control-btn" onClick={() => setMessages([])}><Trash2 size={14} /> Clear Chat</button>
        <button className="control-btn"><Plus size={14} /> New Chat</button>
        <span className="powered-by"><Sparkles size={12} /> Powered by DeepSeek V4 Pro</span>
      </div>

      <style jsx>{`
        .chat-page { display: flex; flex-direction: column; height: calc(100vh - 140px); max-width: 900px; margin: 0 auto; }

        .chat-messages { flex: 1; overflow-y: auto; padding: 20px 0; display: flex; flex-direction: column; gap: 16px; }

        .welcome-section { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 20px; gap: 16px; flex: 1; }
        .welcome-icon { width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(0,255,136,0.15), rgba(59,143,255,0.15)); border-radius: 20px; color: var(--accent-green); }
        .welcome-section h2 { font-size: 24px; font-weight: 700; }
        .welcome-section p { color: var(--text-secondary); font-size: 14px; max-width: 500px; line-height: 1.6; }
        .quick-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 8px; }
        .quick-action { display: flex; align-items: center; gap: 6px; padding: 8px 16px; cursor: pointer; font-size: 13px; color: var(--text-secondary); transition: all 0.2s; border: none; font-family: var(--font-ui); }
        .quick-action:hover { color: var(--accent-green); border-color: var(--accent-green) !important; }

        .message { display: flex; gap: 12px; max-width: 85%; animation: slide-in-up 0.3s ease-out; }
        .message.user { align-self: flex-end; flex-direction: row-reverse; }
        .message.assistant { align-self: flex-start; }

        .msg-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .message.assistant .msg-avatar { background: linear-gradient(135deg, rgba(0,255,136,0.2), rgba(59,143,255,0.2)); color: var(--accent-green); }
        .message.user .msg-avatar { background: rgba(255,255,255,0.1); color: var(--text-primary); }

        .msg-bubble { padding: 12px 16px; border-radius: 16px; max-width: 100%; }
        .message.user .msg-bubble { background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.15); border-bottom-right-radius: 4px; }
        .message.assistant .msg-bubble { background: var(--bg-card); border: 1px solid var(--border); border-bottom-left-radius: 4px; }

        .msg-content { font-size: 14px; line-height: 1.7; color: var(--text-primary); word-break: break-word; }

        .typing-indicator { display: flex; gap: 4px; padding: 4px 0; }
        .typing-indicator span { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-green); opacity: 0.4; animation: typing 1.4s infinite ease-in-out; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .chat-input-bar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; margin-top: 12px; }
        .input-action { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; border-radius: 6px; transition: all 0.2s; }
        .input-action:hover { color: var(--accent-green); background: rgba(0,255,136,0.05); }
        .chat-input { flex: 1; background: none; border: none; color: var(--text-primary); font-size: 14px; font-family: var(--font-ui); outline: none; resize: none; max-height: 120px; padding: 8px 0; }
        .chat-input::placeholder { color: var(--text-muted); }
        .char-count { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); white-space: nowrap; }
        .send-btn { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-green), var(--accent-green-dim)); color: #0A0E1A; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .send-btn:hover { transform: scale(1.05); box-shadow: var(--glow-green); }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }

        .chat-controls { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
        .control-btn { display: flex; align-items: center; gap: 4px; padding: 6px 12px; background: none; border: 1px solid var(--border); border-radius: 6px; color: var(--text-muted); font-size: 12px; cursor: pointer; transition: all 0.2s; font-family: var(--font-ui); }
        .control-btn:hover { border-color: var(--accent-green); color: var(--accent-green); }
        .powered-by { margin-left: auto; display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
