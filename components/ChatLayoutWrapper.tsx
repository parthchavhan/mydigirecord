'use client';

import { ChatProvider } from '@/context/ChatContext';
import { AIChatButton } from '@/components/AIChatButton';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export function ChatLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <AIChatButton />
      <Toaster position="top-right" />
    </ChatProvider>
  );
}
