import { Plane, GraduationCap } from 'lucide-react';

export function MissionCards() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1 - Voyageurs solidaires */}
          <div className="bg-white border border-gray-200 rounded-2xl p-10 hover:border-[#e6244d] transition-all shadow-md hover:shadow-xl">
            <div className="w-16 h-16 bg-pink-50 rounded-xl flex items-center justify-center mb-6">
              <Plane className="w-8 h-8 text-[#e6244d]" />
            </div>

            <h3 className="text-[#22081c] mb-6">Voyageurs solidaires</h3>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-3 text-gray-600">
                <span className="w-2 h-2 bg-[#e6244d] rounded-full mt-2 flex-shrink-0"></span>
                <span>You travel (personal or professional)</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <span className="w-2 h-2 bg-[#e6244d] rounded-full mt-2 flex-shrink-0"></span>
                <span>You carry a Playlife pack</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <span className="w-2 h-2 bg-[#e6244d] rounded-full mt-2 flex-shrink-0"></span>
                <span>You deliver it locally</span>
              </li>
            </ul>

            <button className="w-full px-6 py-3.5 bg-[#e6244d] text-white rounded-full hover:bg-[#d11d42] transition-colors shadow-md">
              Créer une mission
            </button>
          </div>

          {/* Card 2 - Animateurs / Instituteurs */}
          <div className="bg-white border border-gray-200 rounded-2xl p-10 hover:border-[#22081c] transition-all shadow-md hover:shadow-xl">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
              <GraduationCap className="w-8 h-8 text-[#22081c]" />
            </div>

            <h3 className="text-[#22081c] mb-6">Animateurs / Instituteurs</h3>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-3 text-gray-600">
                <span className="w-2 h-2 bg-[#22081c] rounded-full mt-2 flex-shrink-0"></span>
                <span>You manage a group of children</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <span className="w-2 h-2 bg-[#22081c] rounded-full mt-2 flex-shrink-0"></span>
                <span>You help them create sports packs</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <span className="w-2 h-2 bg-[#22081c] rounded-full mt-2 flex-shrink-0"></span>
                <span>Delivery via a partner organization</span>
              </li>
            </ul>

            <button className="w-full px-6 py-3.5 bg-[#22081c] text-white rounded-full hover:bg-[#1a0616] transition-colors shadow-md">
              Créer une mission
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}