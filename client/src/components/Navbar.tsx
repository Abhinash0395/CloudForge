import { Search, Bell, Menu, X, MapPin } from 'lucide-react';
import { AIStatus } from '../types';
import { useLocationContext } from '../context/LocationContext';

interface NavbarProps {
  isNavigationOpen?: boolean;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  aiStatus: AIStatus | null;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isNavigationOpen = false,
  onToggleSidebar,
  onOpenSearch,
  onOpenNotifications,
  onOpenSettings,
  aiStatus,
  unreadCount = 3,
}) => {
  const { selectedLocation, locationMode } = useLocationContext();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-[#06111F]/65 backdrop-blur-2xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Visible Hamburger Button (☰ / ✕) & Global Search Input */}
      <div className="flex items-center gap-3.5 flex-1 max-w-xl">
        {/* Hamburger Menu Button (Always visible on Desktop & Mobile) */}
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl bg-[#081B30] hover:bg-[#0B223D] border border-white/10 hover:border-brand-primary/40 text-white transition-all flex items-center justify-center flex-shrink-0 shadow-sm"
          aria-label={isNavigationOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
          title={isNavigationOpen ? 'Close menu (Esc)' : 'Open menu (☰)'}
        >
          {isNavigationOpen ? (
            <X className="w-5 h-5 text-brand-accent transition-transform duration-200 rotate-90" />
          ) : (
            <Menu className="w-5 h-5 text-slate-200 hover:text-white" />
          )}
        </button>

        {/* Global Search Bar */}
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-[#081B30] border border-white/10 hover:border-brand-primary/40 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-brand-accent transition-colors" />
            <span className="truncate">Search analyses, scenarios, insights...</span>
          </div>
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#06111F] text-[10px] font-mono text-slate-400 border border-white/10">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Notifications, Active Location, Live Data Status, AI Status, Avatar */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Active Location Pill */}
        <div
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-200 text-xs font-medium"
          title={`Active Location: ${selectedLocation.formattedName || selectedLocation.name}`}
        >
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="max-w-[120px] truncate">{selectedLocation.name}</span>
        </div>

        {/* Notification Bell with Badge */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Live Data Connection Pill */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
          title="Open Data Provider Registry (Open-Meteo & Copernicus)"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="hidden lg:inline">Live Data Connected</span>
          <span className="lg:hidden">Live</span>
        </button>

        {/* AI Online Status Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">AI Online</span>
        </div>

        {/* User Profile Avatar with Real Image */}
        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full overflow-hidden border border-cyan-500/40 hover:ring-2 hover:ring-cyan-400 transition-all flex-shrink-0 ml-1"
          title="Open Settings"
        >
          <img
            src="/images/avatar_abhinash.jpg"
            alt="Abhinash Rai"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};
