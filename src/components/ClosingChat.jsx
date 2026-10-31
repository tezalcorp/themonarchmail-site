import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

const FALLBACK_EMAIL = "contact@themonarchmail.com";
const GREETING = {
  role: "assistant",
  content:
    "Hi! I can answer questions about our closing: dates, mail and packages, mailbox keys, and where to get services next. What can I help with?",
};

export default function ClosingChat({ open, onOpenChange }) {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  async function send(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // Send only the conversation, not the greeting we display.
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        res.ok && data.reply
          ? data.reply
          : data.error || `Sorry, something went wrong. Please email ${FALLBACK_EMAIL}.`;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I can't reach the assistant right now. Please email ${FALLBACK_EMAIL}.` },
      ]);
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="fixed bottom-5 right-5 z-[9998] flex items-center gap-2 rounded-full bg-blue-900 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-800"
        aria-label="Open closing FAQ assistant"
      >
        <MessageCircle className="h-5 w-5" />
        Ask about the closing
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-[9998] flex h-[70vh] w-full flex-col bg-white shadow-2xl sm:bottom-5 sm:right-5 sm:h-[480px] sm:w-[360px] sm:rounded-2xl">
      <div className="flex items-center justify-between rounded-t-2xl bg-blue-900 px-4 py-3 text-white">
        <span className="font-semibold">Monarch Mail Assistant</span>
        <button type="button" onClick={() => onOpenChange(false)} aria-label="Close assistant" className="hover:text-gray-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 ${
                m.role === "user" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && <p className="text-xs text-gray-500">Typing…</p>}
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-gray-200 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder="Type your question"
          aria-label="Your question"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send"
          className="rounded-lg bg-orange-500 px-3 py-2 text-white hover:bg-orange-600 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
