import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_PROMPTS = [
  'Why am I struggling with BST deletion?',
  'Explain AVL rotations based on my performance',
  'What should I focus on next?',
  'How can I improve my BST mastery?',
];

function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center px-4 py-3">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-2 h-2 inline-block bg-[#94a3b8] opacity-60" />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  const chatBubbleClass = isUser
    ? 'border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF]/85 dark:bg-[#0F1D3D]/80 backdrop-blur-md text-[#011A53] dark:text-[#8BB8FF]'
    : 'border border-[#E6F0FF] dark:border-[#1C2A4A] bg-white/85 dark:bg-[#0F1525]/75 backdrop-blur-md text-black dark:text-[#F3F4F6] shadow-sm';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed rounded-2xl whitespace-pre-wrap ${chatBubbleClass}`}>
        {msg.content}
      </div>
    </div>
  );
}

export default function AiTutor() {
  const { authHeader, API, user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name?.split(' ')[0] || 'there'} — I'm your PARAKH AI tutor. I have access to your real mastery data and recent performance — ask me anything about the concepts you're working on.`,
    },
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/tutor/ask`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      const reply = res.ok ? data.reply : (data.message || 'Sorry, something went wrong. Please try again.');
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error — is the backend running?',
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
      <div className="mb-4">
        <h1>AI Tutor</h1>
        <p className="text-sm mt-1 text-[#64748B] dark:text-[#94A3B8]">
          Grounded in your real mastery data — not generic textbook answers
        </p>
      </div>

      {messages.length === 1 && !loading && (
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTED_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => setInput(p)}
              className="text-xs px-3 py-1.5 border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#E6F0FF] dark:bg-[#0F1D3D] text-[#011A53] dark:text-[#8BB8FF] hover:border-[#004CE5] dark:hover:border-[#004CE5] hover:bg-[#F8FAFF] dark:hover:bg-[#15244D] hover:text-[#004CE5] dark:hover:text-[#004CE5] transition-all duration-150 cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="border border-[#E6F0FF] dark:border-[#1C2A4A] bg-white/85 dark:bg-[#0F1525]/75 backdrop-blur-md rounded-2xl">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3 pt-3 border-t border-[#E6F0FF] dark:border-t-[#1C2A4A]">
        <textarea
          ref={inputRef}
          id="tutor-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about any concept you're struggling with..."
          rows={1}
          className="input flex-1 resize-none"
          style={{ minHeight: 44, maxHeight: 120 }}
        />
        <button
          id="tutor-send"
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="btn-primary px-5 shrink-0"
        >
          Send
        </button>
      </div>
      <p className="text-xs mt-2 text-center text-[#64748B] dark:text-[#94A3B8]">
        Press Enter to send &middot; Shift+Enter for new line
      </p>
    </div>
  );
}
