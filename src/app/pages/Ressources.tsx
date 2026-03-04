import React from 'react';
import { CheckSquare, CircleDot, Camera, Download } from 'lucide-react';

interface PdfDoc {
    title: string;
    file: string;
}

interface Category {
    title: string;
    description: string;
    icon: React.ReactNode;
    accentColor: string;
    bgColor: string;
    hoverBg: string;
    hoverBorder: string;
    hoverText: string;
    docs: PdfDoc[];
}

const categories: Category[] = [
    {
        title: "Avant la mission",
        description: "Préparez votre mission avec méthode. Chaque étape compte pour maximiser votre impact.",
        icon: <CheckSquare className="w-6 h-6" />,
        accentColor: "text-blue-600",
        bgColor: "bg-blue-50 text-blue-600",
        hoverBg: "hover:bg-blue-50",
        hoverBorder: "hover:border-blue-100",
        hoverText: "group-hover:text-blue-700",
        docs: [
            { title: "Prendre contact avec une structure", file: "Playlife_Connect_Comment_prendre_contact_structure_avant_1.pdf" },
            { title: "Préparer un pack Playlife", file: "Playlife_Connect_Comment_preparer_un_pack_Playlife_avant_2.pdf" },
            { title: "Communiquer sur sa mission", file: "Playlife_Connect_Comment_communiquer_sur_sa_mission_avant_3.pdf" },
        ]
    },
    {
        title: "Pendant la mission",
        description: "Vivez la mission pleinement.\nRemettez le pack et créez un moment de partage.",
        icon: <CircleDot className="w-6 h-6" />,
        accentColor: "text-purple-600",
        bgColor: "bg-purple-50 text-purple-600",
        hoverBg: "hover:bg-purple-50",
        hoverBorder: "hover:border-purple-100",
        hoverText: "group-hover:text-purple-700",
        docs: [
            { title: "Courrier remis aux structures", file: "Playlife_Connect_Courrier_structure_pendant_1.pdf" },
            { title: "Remettre le pack Playlife", file: "Playlife_Connect_Comment_remettre_le_pack_et_creer_des_liens_pendant_2.pdf" },
            { title: "Exemple de certificat de transport", file: "Playlife_Connect_Certificat_transport_materiel_pendant_3.pdf" },
        ]
    },
    {
        title: "Après la mission",
        description: "Prolongez l'impact.\nPartagez votre expérience et inspirez d'autres engagements.",
        icon: <Camera className="w-6 h-6" />,
        accentColor: "text-orange-600",
        bgColor: "bg-orange-50 text-orange-600",
        hoverBg: "hover:bg-orange-50",
        hoverBorder: "hover:border-orange-100",
        hoverText: "group-hover:text-orange-700",
        docs: [
            { title: "Souvenirs et compte-rendu de mission", file: "Playlife_Connect_Souvenirs_et_compte_rendu_de_mission_apres_1.pdf" },
            { title: "Aller plus loin avec Playlife", file: "Playlife_Connect_Devenez_benevole_apres_2.pdf" },
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
                        <div className={`w-14 h-14 rounded-2xl ${cat.bgColor} flex items-center justify-center mb-6`} aria-hidden="true">
                            {cat.icon}
                        </div>
                        <h2 className="text-2xl font-black mb-3">{cat.title}</h2>
                        <p className="text-gray-500 font-medium mb-8 flex-1 whitespace-pre-line">{cat.description}</p>

                        <ul className="space-y-3" aria-label={`Documents — ${cat.title}`}>
                            {cat.docs.map((doc, i) => (
                                <li key={i}>
                                    <a
                                        href={`/ressources/${doc.file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`group flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent ${cat.hoverBg} ${cat.hoverBorder} transition-all`}
                                        aria-label={`Ouvrir le document : ${doc.title}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${cat.accentColor} shadow-sm flex-shrink-0`}>
                                            <Download className="w-5 h-5" aria-hidden="true" />
                                        </div>
                                        <span className={`font-bold text-gray-700 ${cat.hoverText} transition-colors text-sm`}>
                                            {doc.title}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
