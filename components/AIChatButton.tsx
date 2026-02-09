'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Loader2, Copy, Check } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/context/ChatContext';

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

const MAX_HISTORY_MESSAGES = 8;
const MAX_MESSAGE_CHARS = 1200;

function trimMessage(text: string): string {
  if (text.length <= MAX_MESSAGE_CHARS) return text;
  // Keep the most recent part of the message, which is usually most relevant.
  return text.slice(-MAX_MESSAGE_CHARS);
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^[\s]*[-*]\s+/gm, '• ')
    .trim();
}

const WELCOME =
  "Hi! I'm the Mendora Box AI. I can help you write notices (e.g. holiday notices, announcements), emails, and letters. Tell me what you need—e.g. '3 days holidays for this class', an announcement, or a leave letter—and I'll ask for the details and generate it. What would you like to write?";

export function AIChatButton() {
  const { suggestedName } = useChatContext();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rateLimitCooldown <= 0) return;
    const t = setInterval(() => {
      setRateLimitCooldown((c) => {
        const next = c - 1;
        if (next <= 0) clearInterval(t);
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [rateLimitCooldown]);

  const copyToClipboard = useCallback(async (id: string, text: string) => {
    const plain = stripMarkdown(text);
    await navigator.clipboard.writeText(plain);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  useEffect(() => {
    fetch('/api/chat/status')
      .then((res) => res.json())
      .then((data) => setAllowed(data.allowed === true))
      .catch(() => setAllowed(false));
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: WELCOME,
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading || rateLimitCooldown > 0) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const fullHistory = [...messages, userMsg]
        .filter((m) => m.id !== 'welcome' || m.role === 'model')
        .map((m) => ({
          role: m.role as 'user' | 'model',
          parts: [{ text: trimMessage(m.text) }],
        }));

      const history =
        fullHistory.length > MAX_HISTORY_MESSAGES
          ? fullHistory.slice(-MAX_HISTORY_MESSAGES)
          : fullHistory;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          context: suggestedName ? { suggestedName } : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const is429 = res.status === 429;
        if (is429) setRateLimitCooldown(15);
        const serverMessage = typeof data?.error === 'string' ? data.error : null;
        const friendly = is429
          ? 'Rate limit reached. You can try again in 15 seconds.'
          : serverMessage || 'Something went wrong. Please try again.';
        setMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: 'model', text: friendly },
        ]);
        return;
      }

      const contentType = res.headers.get('Content-Type') ?? '';
      if (contentType.includes('ndjson') && res.body) {
        const modelId = `model-${Date.now()}`;
        setMessages((prev) => [...prev, { id: modelId, role: 'model', text: '' }]);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const obj = JSON.parse(line) as { text?: string; error?: string };
                if (obj.error) {
                  setMessages((prev) =>
                    prev.map((m) => (m.id === modelId ? { ...m, text: obj.error! } : m))
                  );
                  return;
                }
                if (obj.text) {
                  fullText += obj.text;
                  setMessages((prev) =>
                    prev.map((m) => (m.id === modelId ? { ...m, text: fullText } : m))
                  );
                }
              } catch {
                // skip malformed line
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          { id: `model-${Date.now()}`, role: 'model', text: data.text ?? '' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (allowed !== true) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all',
          'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
        aria-label="Open AI chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex h-full max-h-dvh w-full max-w-md flex-col gap-0 overflow-hidden border-l border-border bg-background p-0 sm:max-w-md"
        >
          <SheetHeader className="shrink-0 border-b border-border bg-background px-4 py-3">
            <SheetTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <MessageCircle className="h-5 w-5 text-primary" />
              Mendora Box AI
            </SheetTitle>
          </SheetHeader>

          <div className="h-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3">
            <div className="flex flex-col gap-3 pb-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  ref={scrollRef}
                  className={cn(
                    'max-w-[85%] shrink-0 rounded-2xl px-4 py-2.5 text-sm',
                    m.role === 'user'
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {m.role === 'model' ? stripMarkdown(m.text) : m.text}
                  </p>
                  {m.role === 'model' && m.text && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => copyToClipboard(m.id, m.text)}
                      aria-label="Copy"
                    >
                      {copiedId === m.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copiedId === m.id ? 'Copied' : 'Copy'}
                    </Button>
                  )}
                </div>
              ))}
              {loading && (
                <div
                  ref={scrollRef}
                  className="flex max-w-[85%] shrink-0 items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm text-foreground"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Thinking…</span>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-border bg-background p-3">
            {rateLimitCooldown > 0 && (
              <p className="mb-2 text-center text-xs text-muted-foreground">
                Rate limited. Try again in {rateLimitCooldown}s.
              </p>
            )}
            <div className="flex items-end gap-2">
              <Textarea
                placeholder={
                  rateLimitCooldown > 0
                    ? `Wait ${rateLimitCooldown}s to send…`
                    : 'Ask for a notice, email, or letter…'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={2}
                className="min-h-[52px] max-h-32 flex-1 resize-none py-3"
                disabled={loading || rateLimitCooldown > 0}
              />
              <Button
                type="button"
                onClick={handleSend}
                disabled={loading || !input.trim() || rateLimitCooldown > 0}
                className="h-[52px] w-[52px] shrink-0 rounded-lg"
                aria-label="Send"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
