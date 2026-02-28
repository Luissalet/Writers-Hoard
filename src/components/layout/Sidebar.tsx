import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  PenLine,
  BookOpen,
  Clock,
  Map,
  Network,
  Image,
  Link2,
  ChevronLeft,
  ChevronRight,
  Feather,
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const mainNav = [
  { path: '/', icon: Home, label: 'Home' },
];

const projectNav = [
  { path: 'writings', icon: PenLine, label: 'Writings' },
  { path: 'codex', icon: BookOpen, label: 'Codex' },
  { path: 'timeline', icon: Clock, label: 'Timeline' },
  { path: 'maps', icon: Map, label: 'Maps' },
  { path: 'yarn', icon: Network, label: 'Yarn Board' },
  { path: 'gallery', icon: Image, label: 'Gallery' },
  { path: 'links', icon: Link2, label: 'Links' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: projectId } = useParams();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.includes(path);
  };

  return (
    <motion.aside
      className="h-full bg-surface border-r border-border flex flex-col overflow-hidden"
      animate={{ width: sidebarOpen ? 220 : 60 }}
      transition={{ duration: 0.2 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-accent-gold/20 flex items-center justify-center flex-shrink-0">
          <Feather size={18} className="text-accent-gold" />
        </div>
        {sidebarOpen && (
          <motion.span
            className="font-serif font-bold text-accent-gold text-sm whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Writer's Hoard
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {mainNav.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm ${
              isActive(item.path)
                ? 'bg-accent-gold/15 text-accent-gold'
                : 'text-text-muted hover:text-text-primary hover:bg-elevated'
            }`}
          >
            <item.icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
          </button>
        ))}

        {projectId && (
          <>
            <div className="pt-3 pb-1 px-3">
              {sidebarOpen && (
                <span className="text-xs font-semibold text-text-dim uppercase tracking-wider">
                  Project
                </span>
              )}
              {!sidebarOpen && <div className="border-t border-border" />}
            </div>
            {projectNav.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(`/project/${projectId}/${item.path}`)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm ${
                  isActive(item.path)
                    ? 'bg-accent-gold/15 text-accent-gold'
                    : 'text-text-muted hover:text-text-primary hover:bg-elevated'
                }`}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center py-3 border-t border-border text-text-muted hover:text-text-primary transition"
      >
        {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </motion.aside>
  );
}
