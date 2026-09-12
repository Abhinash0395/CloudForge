import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { CommandPalette } from '../components/CommandPalette';
import { NotificationDrawer } from '../components/NotificationDrawer';
import { JudgeDemoModal } from '../components/JudgeDemoModal';
import { SettingsModal } from '../components/SettingsModal';
import { ParticleBackground } from '../components/ParticleBackground';
import { ChatbotDrawer } from '../components/ChatbotDrawer';
import { api } from '../services/api';
import { AIStatus, NotificationItem } from '../types';

export const AppLayout: React.FC = () => {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [judgeDemoOpen, setJudgeDemoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const location = useLocation();
  const isLandingPage = location.pathname === '/landing';

  // Fetch initial AI status and notifications
  useEffect(() => {
    const init = async () => {
      try {
        const [statusData, notifData] = await Promise.all([
          api.getAIStatus().catch(() => ({
            mode: 'DEMO_INTELLIGENCE' as const,
            provider: 'RiskLens Autonomous Decision Engine',
            model: 'RiskLens-MFAE-v4 (Deterministic)',
            isFallback: true,
            geminiConfigured: false,
          })),
          api.getNotifications().catch(() => []),
        ]);
        setAiStatus(statusData);
        setNotifications(notifData);
      } catch (e) {
        console.warn('Layout data load warning:', e);
      }
    };
    init();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.warn('Mark read warning:', e);
    }
  };

  // Global keyboard shortcuts (Ctrl+K / Cmd+K for Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;


  if (isLandingPage) {
    return (
      <div className="relative min-h-screen text-slate-100 flex flex-col selection:bg-brand-primary/30 selection:text-brand-accent">
        <ParticleBackground />
        <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        <JudgeDemoModal isOpen={judgeDemoOpen} onClose={() => setJudgeDemoOpen(false)} />
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <NotificationDrawer
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
        />
        <main className="flex-1 relative z-10">
          <Outlet context={{ onOpenJudgeDemo: () => setJudgeDemoOpen(true) }} />
        </main>
        {/* Global Grounded AI Copilot Drawer */}
        <ChatbotDrawer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-brand-primary/30 selection:text-brand-accent">
      <ParticleBackground />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Global Notifications Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* Interactive Judge Demo Guided Tour */}
      <JudgeDemoModal isOpen={judgeDemoOpen} onClose={() => setJudgeDemoOpen(false)} />

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Grounded AI Copilot Drawer */}
      <ChatbotDrawer />

      {/* Overlay Navigation Drawer (Slides in on ☰ click, auto-closes on item click / ESC / outside click) */}
      <Sidebar
        isOpen={isNavigationOpen}
        onClose={() => setIsNavigationOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Full-Width Application Container (No permanent sidebar margin) */}
      <div className="flex flex-col min-h-screen relative z-10 w-full">
        <Navbar
          isNavigationOpen={isNavigationOpen}
          onToggleSidebar={() => setIsNavigationOpen((prev) => !prev)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          aiStatus={aiStatus}
          unreadCount={unreadCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 w-full">
          <Outlet context={{ onOpenJudgeDemo: () => setJudgeDemoOpen(true) }} />
        </main>

        {/* Global Enterprise Footer */}
        <footer className="border-t border-white/10 py-4 px-4 sm:px-6 lg:px-8 xl:px-10 text-center text-xs text-slate-400 bg-[#06111F]/70 backdrop-blur-xl">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="text-white font-semibold">RISKLENS AI</span> — Track 01 • PS 05: AI for Prediction & Decision Support
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Deterministic Scoring + Google Gemini 2.5 / 2.0 Reasoning Layer
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
