import { Package, Heart, Send, CheckCircle, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    { icon: Package, label: 'Create a mission' },
    { icon: Heart, label: 'Launch a fundraising campaign' },
    { icon: Package, label: 'Purchase equipment' },
    { icon: Send, label: 'Deliver the pack' },
    { icon: CheckCircle, label: 'Share a mission report' },
  ];
  
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-[#22081c] text-center mb-16">Comment ça marche</h2>
        
        <div className="flex flex-wrap items-start justify-center gap-10 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center gap-4 max-w-[140px]">
              <div className="w-20 h-20 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-md">
                <step.icon className="w-9 h-9 text-[#e6244d]" />
              </div>
              <div className="w-10 h-10 bg-[#22081c] text-white rounded-full flex items-center justify-center shadow-md">
                {index + 1}
              </div>
              <p className="text-center text-gray-700 text-sm">{step.label}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button className="inline-flex items-center gap-2 text-[#e6244d] hover:text-[#d11d42] transition-colors">
            <span>En savoir plus</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}