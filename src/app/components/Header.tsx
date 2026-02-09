import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="px-4 md:px-8 h-[95px] flex items-center justify-end">
        <div className="flex items-center gap-2 md:gap-3">
          {!user ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="px-3 md:px-5 py-2 bg-white text-[#22081c] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm font-medium"
              >
                S'inscrire
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-3 md:px-5 py-2 bg-[#e6244d] text-white rounded-lg hover:bg-[#d11d42] transition-colors text-xs md:text-sm font-medium"
              >
                Se connecter
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 relative z-50">
              <span className="text-sm font-semibold text-[#22081c] hidden sm:block">
                {profile?.full_name || user.email}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  signOut();
                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full ml-1 md:ml-2 flex items-center justify-center overflow-hidden border border-gray-100">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}