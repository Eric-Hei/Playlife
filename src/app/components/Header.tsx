import { User } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="px-4 md:px-8 h-[95px] flex items-center justify-end">
        <div className="flex items-center gap-2 md:gap-3">
          <button className="px-3 md:px-5 py-2 bg-white text-[#22081c] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm font-medium">
            S'inscrire
          </button>
          <button className="px-3 md:px-5 py-2 bg-[#e6244d] text-white rounded-lg hover:bg-[#d11d42] transition-colors text-xs md:text-sm font-medium">
            Se connecter
          </button>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full ml-1 md:ml-2 flex items-center justify-center">
            <User className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
}