'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type ChatContextValue = {
  suggestedName: string | null;
  setSuggestedName: (name: string | null) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [suggestedName, setSuggestedNameState] = useState<string | null>(null);
  const setSuggestedName = useCallback((name: string | null) => {
    setSuggestedNameState(name);
  }, []);

  return (
    <ChatContext.Provider value={{ suggestedName, setSuggestedName }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  return ctx ?? { suggestedName: null, setSuggestedName: () => {} };
}
