import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Phone, Send, X } from 'lucide-react';
import { siteConfig } from '../site.config';
import { useClinic } from '../context/ClinicContext';

interface ChatMsg {
  role: 'user' | 'assistant';
  text: string;
}

export function ChatWidget() {
  const { bootstrap, navigate } = useClinic();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showGreetingChip, setShowGreetingChip] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).slice(2, 10)}`);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      text: 'Welcome to Laurette Medical Center in Al Rigga, Dubai. I can assist with general clinic questions, open consultation times, or callback requests. Please do not share personal medical details here.',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!open && !dismissed) {
        setShowGreetingChip(true);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [open, dismissed]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  if (bootstrap && !bootstrap.settings.chatbotEnabled) return null;
  if (dismissed) return null;

  const quickChips = [
    'Book an appointment',
    'Location & directions',
    'Request an AED estimate',
    'Talk to reception',
  ];

  const sendMessage = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || sending) return;
    setInput('');
    const nextHistory = [...messages, { role: 'user' as const, text: clean }];
    setMessages(nextHistory);
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: clean,
          history: messages.slice(-10),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            data.reply ||
            'Please call or message our reception team on +971 58 573 3778 for immediate assistance.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Connection issue. Please call or WhatsApp +971 58 573 3778 directly.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Launcher (Positioned above mobile bottom bar on small screens) */}
      {!open && (
        <div className="fixed bottom-18 md:bottom-6 right-4 z-40 flex flex-col items-end gap-2">
          {showGreetingChip && (
            <div className="bg-white border border-[#EAE4D3] shadow-md rounded-lg px-3.5 py-2 text-xs text-[#36363A] flex items-center gap-2 max-w-[240px]">
              <button
                type="button"
                onClick={() => {
                  setOpen(true);
                  setShowGreetingChip(false);
                }}
                className="text-left hover:text-[#A68834] cursor-pointer"
              >
                Questions? I can help you book your visit.
              </button>
              <button
                type="button"
                aria-label="Dismiss greeting"
                onClick={() => setDismissed(true)}
                className="text-[#444448] hover:text-[#36363A] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setShowGreetingChip(false);
            }}
            aria-label="Open Laurette Reception Concierge"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#444448] text-white shadow-lg border border-[#C6A64B]/50 hover:bg-[#36363A] transition-colors min-h-[44px] cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#D4BC78]" />
            <span className="text-sm font-medium whitespace-nowrap">Clinic Concierge</span>
          </button>
        </div>
      )}

      {/* Chat Drawer / Full-screen mobile */}
      {open && (
        <div
          role="dialog"
          aria-label="Laurette Medical Center Concierge"
          className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[390px] md:h-[560px] z-50 bg-white md:rounded-lg border border-[#EAE4D3] shadow-2xl flex flex-col"
        >
          <div className="px-4 py-3.5 bg-[#444448] text-white md:rounded-t-lg flex items-center justify-between">
            <div>
              <p className="font-serif text-lg font-semibold leading-tight">Laurette Concierge</p>
              <p className="text-xs text-[#D4BC78]">Al Rigga, Dubai · General Assistance</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Minimize chat"
              className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F2]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#444448] text-white'
                      : 'bg-white text-[#36363A] border border-[#EAE4D3]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2 rounded-lg bg-white border border-[#EAE4D3] text-xs text-[#444448]">
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-3 py-2 bg-white border-t border-[#EAE4D3] flex flex-wrap gap-1.5">
            {quickChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  if (chip === 'Book an appointment') {
                    setOpen(false);
                    navigate('/book');
                    return;
                  }
                  sendMessage(chip);
                }}
                className="text-xs px-2.5 py-1.5 rounded border border-[#EAE4D3] text-[#444448] hover:border-[#C6A64B] hover:text-[#36363A] bg-[#FAF8F2] cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Direct Talk to Reception Strip */}
          <div className="px-3 py-2 bg-[#FAF8F2] border-t border-[#EAE4D3] flex items-center justify-between text-xs">
            <a
              href={siteConfig.phoneHref}
              className="inline-flex items-center gap-1.5 font-medium text-[#36363A] hover:text-[#C6A64B]"
            >
              <Phone className="w-3.5 h-3.5 text-[#C6A64B]" />
              <span>Call {siteConfig.phoneDisplay}</span>
            </a>
            <a
              href={siteConfig.getWhatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-[#A68834] hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 bg-white border-t border-[#EAE4D3] flex items-center gap-2 md:rounded-b-lg"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about booking or location..."
              aria-label="Message Laurette Concierge"
              className="flex-1 px-3 py-2 text-sm border border-[#EAE4D3] rounded-md focus:border-[#C6A64B] min-h-[40px]"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="w-10 h-10 rounded-md bg-[#C6A64B] text-white flex items-center justify-center hover:bg-[#A68834] disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
