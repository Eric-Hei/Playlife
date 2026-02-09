import { MapPin } from 'lucide-react';

export function Partners() {
  const partners = [
    { name: 'Centre Sportif Espoir', location: 'Dakar, Sénégal' },
    { name: 'Association Sport & Jeunesse', location: 'Lomé, Togo' },
    { name: 'Éducation Par Le Sport', location: 'Antananarivo, Madagascar' },
    { name: 'Kids Football Academy', location: 'Nairobi, Kenya' },
  ];
  
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-[#22081c] text-center mb-14">Structures partenaires</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {partners.map((partner, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#e6244d] transition-colors shadow-md hover:shadow-lg">
              <h4 className="text-[#22081c] mb-3">{partner.name}</h4>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4 text-[#e6244d]" />
                <span className="text-sm">{partner.location}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <button className="px-8 py-3.5 bg-[#e6244d] text-white rounded-full hover:bg-[#d11d42] transition-colors shadow-md">
            Accéder à l'annuaire
          </button>
          <button className="px-8 py-3.5 bg-white text-[#22081c] border-2 border-gray-300 rounded-full hover:border-[#e6244d] transition-colors shadow-sm">
            Soumettre une structure
          </button>
        </div>
      </div>
    </section>
  );
}