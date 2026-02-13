import { Home, Users, Globe, Heart, BookOpen, FileText, Settings, Mail, ChevronLeft, ChevronRight, Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import logoFull from '@/assets/cfe6c33572ca278d588cf9370b7336e09b78c7ec.png';
import logoIcon from '@/assets/6ed5cc4ee5dcab2b9e20f6f579b50f5e14023d6a.png';

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileToggle: (open: boolean) => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileToggle }: SidebarProps) {
  const location = useLocation();
  const { profile, user, signOut } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: Globe, label: 'Missions', path: '/missions' },
    { icon: Users, label: 'Structures', path: '/structures' },
    { icon: Heart, label: 'Parcours Playlife', path: '/impact' },
    { icon: BookOpen, label: 'Ressources', path: '/ressources' },
  ];

  // Add dashboard for logged-in users
  const userMenuItems = user ? [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: FileText, label: 'Mon Tableau de Bord', path: '/dashboard' },
    { icon: Globe, label: 'Missions', path: '/missions' },
    { icon: Users, label: 'Structures', path: '/structures' },
    { icon: Heart, label: 'Parcours Playlife', path: '/impact' },
    { icon: BookOpen, label: 'Ressources', path: '/ressources' },
  ] : menuItems;

  // Add settings for super admins
  const finalMenuItems = profile?.is_super_admin
    ? [...userMenuItems, { icon: Settings, label: 'Paramètres', path: '/settings' }]
    : userMenuItems;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => onMobileToggle(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm"
      >
        {mobileOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => onMobileToggle(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 z-40 
        ${collapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-5 h-[95px] border-b border-gray-100 relative flex items-center">
          {collapsed ? (
            <div className="flex justify-center w-full">
              <img src={logoIcon} alt="Playlife" className="h-[60px] w-auto" />
            </div>
          ) : (
            <div className="w-full">
              <img src={logoFull} alt="Playlife Connect" className="w-full h-auto" />
            </div>
          )}

          <button
            onClick={() => onToggle(!collapsed)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors z-10"
          >
            {collapsed ? (
              <ChevronRight className="w-3 h-3 text-gray-600" />
            ) : (
              <ChevronLeft className="w-3 h-3 text-gray-600" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {finalMenuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={() => onMobileToggle(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                      ? 'bg-[#e6244d] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100 italic text-xs text-gray-400">
          {user && !collapsed && (
            <div className="px-4 py-3 mb-2 bg-gray-50 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#22081c] truncate">{profile?.full_name || "Utilisateur non trouvé"}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{profile?.role || "Profil manquant"}</p>
              </div>
            </div>
          )}

          <Link
            to="/contact"
            onClick={() => onMobileToggle(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/contact' ? 'bg-[#e6244d] text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            title={collapsed ? 'Contact' : undefined}
          >
            <Mail className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Contact</span>}
          </Link>
          {user ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                signOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors mt-2 font-medium cursor-pointer relative z-50"
              title={collapsed ? 'Déconnexion' : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Déconnexion</span>}
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => onMobileToggle(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#e6244d] hover:bg-[#e6244d]/5 transition-colors mt-2 font-medium"
              title={collapsed ? 'Connexion' : undefined}
            >
              <LogIn className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Connexion</span>}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
