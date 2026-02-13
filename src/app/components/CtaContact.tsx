import React from 'react';
import { Link } from 'react-router-dom';

export function CtaContact() {
    return (
        <div className="bg-gradient-to-br from-[#e6244d] to-[#ff4d71] rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white shadow-xl shadow-[#e6244d]/20 overflow-hidden relative my-10">
            <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
                <h3 className="text-3xl font-black mb-3">Besoin d'un accompagnement sur mesure ?</h3>
                <p className="text-white/80 font-medium text-lg max-w-xl leading-relaxed">
                    Notre équipe est disponible pour vous aider à organiser votre mission et valider votre pack matériel.
                </p>
            </div>
            <Link
                to="/contact"
                className="relative z-10 px-8 py-4 bg-white text-[#e6244d] rounded-2xl font-black hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
                Contacter Playlife
            </Link>
        </div>
    );
}
