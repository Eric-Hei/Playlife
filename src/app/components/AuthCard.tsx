export function AuthCard() {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
      <h3 className="text-base md:text-lg font-semibold text-[#22081c] mb-3 md:mb-4">Connexion / Inscription</h3>
      <div className="w-12 h-1 bg-[#e6244d] rounded-full mb-3 md:mb-4"></div>
      
      <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
        Connectez-vous ou créez un compte pour lancer une mission Playlife.
      </p>
      
      <div className="space-y-3">
        <button className="w-full px-6 py-2 md:py-2.5 bg-[#e6244d] text-white rounded-lg hover:bg-[#d11d42] transition-colors text-xs md:text-sm font-medium">
          Se connecter
        </button>
        <button className="w-full px-6 py-2 md:py-2.5 bg-white text-[#22081c] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm font-medium">
          S'inscrire
        </button>
      </div>
    </div>
  );
}