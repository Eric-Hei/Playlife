import { Mail } from 'lucide-react';

export function Contact() {
  return (
    <section className="py-20 bg-pink-50">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h3 className="text-[#22081c] mb-6">Une question ?</h3>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-[#e6244d]" />
          <a href="mailto:contact@playlife.today" className="text-[#e6244d] hover:text-[#d11d42] transition-colors">
            contact@playlife.today
          </a>
        </div>
        
        <p className="text-gray-600 text-lg">
          Nous sommes là pour t'aider à lancer ta mission.
        </p>
      </div>
    </section>
  );
}