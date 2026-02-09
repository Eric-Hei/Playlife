import logo from 'figma:asset/607d96d5ec1407ca9d7c48136af0000f79b8c292.png';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-20">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Playlife" className="h-8 opacity-60" />
          </div>
          
          <div className="flex flex-wrap items-center gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-[#e6244d] transition-colors">
              Mentions légales
            </a>
            <a href="#" className="hover:text-[#e6244d] transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-[#e6244d] transition-colors">
              Site Playlife
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}