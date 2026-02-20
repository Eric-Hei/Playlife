import React from 'react';
import {
    CheckSquare, BookOpen, FileText,
    ArrowRight, Lightbulb, ShieldCheck,
    Plane, Heart, Briefcase, Download
} from 'lucide-react';

const categories = [
    {
        title: "Checklists",
        description: "Assurez-vous de ne rien oublier à chaque étape de votre mission.",
        icon: <CheckSquare className="w-6 h-6" />,
        color: "bg-blue-50 text-blue-600",
        items: [
            { id: 1, title: "Avant le départ", tasks: ["Valider la structure locale", "Préparer le pack matériel", "Organiser la logistique"] },
            { id: 2, title: "Sur place", tasks: ["Prendre des photos/vidéos", "Remettre le pack en mains propres", "Recueillir un témoignage"] },
            { id: 3, title: "Au retour", tasks: ["Partager le compte-rendu", "Éditer l'attestation de mission", "Remercier les donateurs"] }
        ]
    },
    {
        title: "Guides Pratiques",
        description: "Des conseils pour optimiser votre impact et votre organisation.",
        icon: <BookOpen className="w-6 h-6" />,
        color: "bg-purple-50 text-purple-600",
        resources: [
            { title: "Comment choisir sa structure ?", time: "5 min", type: "Guide" },
            { title: "Réussir sa collecte de matériel", time: "10 min", type: "Best Practices" },
            { title: "Communiquer sur son projet", time: "8 min", type: "Tuto" }
        ]
    },
    {
        title: "Documents Utiles",
        description: "Téléchargez les documents officiels Playlife pour vos démarches.",
        icon: <FileText className="w-6 h-6" />,
        color: "bg-orange-50 text-orange-600",
        docs: [
            { title: "Lettre de recommandation", format: "PDF" },
            { title: "Attestation de don matériel", format: "PDF" },
            { title: "Charte du voyageur solidaire", format: "PDF" }
        ]
    }
];

export default function Ressources() {
    return (
        <div className="px-4 md:px-8 py-4 md:py-6 border-t border-gray-100 space-y-10 pb-20 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="relative rounded-[2.5rem] bg-[#22081c] p-10 overflow-hidden text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#e6244d] opacity-10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 opacity-10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-4 py-1.5 bg-[#e6244d] rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-[#e6244d]/20">
                            Boîte à outils
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                        Tout pour réussir votre <span className="text-[#e6244d]">mission solidaire</span>
                    </h1>
                    <p className="text-xl text-white/70 leading-relaxed font-medium">
                        Retrouvez nos guides, checklists et documents officiels pour vous accompagner pas à pas.
                    </p>
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#22081c]">
                {categories.map((cat, idx) => (
                    <div key={idx} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-6`}>
                            {cat.icon}
                        </div>
                        <h2 className="text-2xl font-black mb-3">{cat.title}</h2>
                        <p className="text-gray-500 font-medium mb-8 flex-1">{cat.description}</p>

                        <div className="space-y-4">
                            {cat.items && cat.items.map(item => (
                                <div key={item.id} className="p-4 bg-gray-50 rounded-2xl group hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-100">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-700 group-hover:text-blue-700 transition-colors">{item.title}</span>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-all translate-x-0 group-hover:translate-x-1" />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest">
                                        {item.tasks.length} tâches à cocher
                                    </p>
                                </div>
                            ))}

                            {cat.resources && cat.resources.map((res, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-2xl group hover:bg-purple-50 transition-colors cursor-pointer border border-transparent hover:border-purple-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm">
                                        <Lightbulb className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block font-bold text-gray-700 group-hover:text-purple-700 transition-colors text-sm">{res.title}</span>
                                        <span className="text-[10px] text-gray-400 font-black tracking-tighter uppercase">{res.type} • {res.time}</span>
                                    </div>
                                </div>
                            ))}

                            {cat.docs && cat.docs.map((doc, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-2xl group hover:bg-orange-50 transition-colors cursor-pointer border border-transparent hover:border-orange-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm">
                                            <Download className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-gray-700 group-hover:text-orange-700 transition-colors text-sm">{doc.title}</span>
                                    </div>
                                    <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-black italic">{doc.format}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>



            {/* Quick Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4 p-6 bg-green-50 rounded-3xl border border-green-100">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                    <p className="text-sm font-bold text-green-800">Assurance voyage solidaire incluse</p>
                </div>
                <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                    <Plane className="w-8 h-8 text-blue-600" />
                    <p className="text-sm font-bold text-blue-800">Partenariats douaniers simplifiés</p>
                </div>
                <div className="flex items-center gap-4 p-6 bg-pink-50 rounded-3xl border border-pink-100">
                    <Heart className="w-8 h-8 text-pink-600" />
                    <p className="text-sm font-bold text-pink-800">Impact social certifié par Playlife</p>
                </div>
            </div>
        </div>
    );
}
