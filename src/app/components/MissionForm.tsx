import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    X, Calendar, MapPin, Type, AlignLeft, Send,
    Plane, GraduationCap, ArrowRight, ArrowLeft,
    CheckCircle2, Globe, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MissionFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function MissionForm({ onClose, onSuccess }: MissionFormProps) {
    useEffect(() => {
        console.log('[MissionForm] Mounted');
        return () => console.log('[MissionForm] Unmounted');
    }, []);

    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        country: '',
        city: '',
        start_date: '',
        end_date: '',
        image_url: '',
        mission_type: '' // 'voyageur' or 'animateur'
    });

    const totalSteps = 4;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < totalSteps) {
            setStep(step + 1);
            return;
        }

        setLoading(true);

        try {
            const { error } = await (supabase
                .from('missions') as any)
                .insert({
                    ...formData,
                    created_by: user?.id,
                    status: 'active'
                });

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error creating mission:', error);
            alert(`Erreur lors de la création de la mission: ${error.message || 'Erreur inconnue'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const validateStep = () => {
        if (step === 1) return formData.mission_type !== '';
        if (step === 2) return formData.title !== '' && formData.country !== '' && formData.city !== '';
        if (step === 3) return formData.description !== '';
        return true;
    };

    const progress = (step / totalSteps) * 100;

    return (
        <div className="fixed inset-0 bg-[#22081c]/60 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20 animate-in fade-in zoom-in duration-300">

                {/* Progress Bar & Header */}
                <div className="relative pt-8 px-8 flex flex-col items-center">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-[#e6244d]"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
                        <div
                            className="h-full bg-gradient-to-r from-[#e6244d] to-[#ff4d71] transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <p className="text-[#e6244d] font-bold text-xs uppercase tracking-[0.2em] mb-2">
                        Étape {step} sur {totalSteps}
                    </p>
                    <h2 className="text-2xl font-black text-[#22081c] mb-8 text-center">
                        {step === 1 && "Quel est votre profil ?"}
                        {step === 2 && "Où et quand partez-vous ?"}
                        {step === 3 && "Parlez-nous du projet"}
                        {step === 4 && "Prêt à lancer l'impact ?"}
                    </h2>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    {step === 1 && (
                        <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, mission_type: 'voyageur' }))}
                                className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${formData.mission_type === 'voyageur'
                                    ? 'border-[#e6244d] bg-[#e6244d]/5 ring-4 ring-[#e6244d]/10'
                                    : 'border-gray-100 hover:border-gray-200 bg-white'
                                    }`}
                            >
                                <div className={`p-3 rounded-2xl ${formData.mission_type === 'voyageur' ? 'bg-[#e6244d] text-white' : 'bg-gray-50 text-gray-400'}`}>
                                    <Plane className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[#22081c]">Voyageur Solidaire</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">Je pars en voyage et je souhaite remettre un pack de matériel sportif.</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, mission_type: 'animateur' }))}
                                className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${formData.mission_type === 'animateur'
                                    ? 'border-[#e6244d] bg-[#e6244d]/5 ring-4 ring-[#e6244d]/10'
                                    : 'border-gray-100 hover:border-gray-200 bg-white'
                                    }`}
                            >
                                <div className={`p-3 rounded-2xl ${formData.mission_type === 'animateur' ? 'bg-[#e6244d] text-white' : 'bg-gray-50 text-gray-400'}`}>
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[#22081c]">Animateur / Éducateur</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">J'encadre des enfants et je souhaite les faire participer à une action solidaire.</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Titre de votre mission</label>
                                <div className="relative group">
                                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#e6244d] transition-colors" />
                                    <input
                                        required
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Ex: Foot pour tous au Sénégal"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e6244d]/10 focus:border-[#e6244d] font-medium transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Pays</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#e6244d] transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            placeholder="Sénégal"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e6244d]/10 focus:border-[#e6244d] font-medium transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Ville</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#e6244d] transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="Dakar"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e6244d]/10 focus:border-[#e6244d] font-medium transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Dates de départ et de retour</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#e6244d] transition-colors" />
                                        <input
                                            required
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e6244d]/10 focus:border-[#e6244d] font-medium transition-all"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#e6244d] transition-colors" />
                                        <input
                                            required
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e6244d]/10 focus:border-[#e6244d] font-medium transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Description du projet</label>
                                <div className="relative group">
                                    <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-[#e6244d] transition-colors" />
                                    <textarea
                                        required
                                        name="description"
                                        rows={5}
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Quels sont vos objectifs ? Quelles structures allez-vous aider ?"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e6244d]/10 focus:border-[#e6244d] font-medium transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Image de couverture (URL)</label>
                                <div className="relative group">
                                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#e6244d] transition-colors" />
                                    <input
                                        type="url"
                                        name="image_url"
                                        value={formData.image_url}
                                        onChange={handleChange}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e6244d]/10 focus:border-[#e6244d] font-medium transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="bg-gray-50 rounded-[2rem] p-6 space-y-4 border border-gray-100">
                                <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#e6244d]">
                                        {formData.mission_type === 'voyageur' ? <Plane className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Type de Mission</p>
                                        <p className="font-bold text-[#22081c]">
                                            {formData.mission_type === 'voyageur' ? 'Voyageur Solidaire' : 'Animateur / Éducateur'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Détails de la mission</p>
                                    <h4 className="text-xl font-bold text-[#22081c]">{formData.title}</h4>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-[#e6244d]" />
                                            {formData.city}, {formData.country}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-[#e6244d]" />
                                            Du {new Date(formData.start_date).toLocaleDateString()} au {new Date(formData.end_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Description</p>
                                    <p className="text-sm text-gray-600 leading-relaxed italic">
                                        "{formData.description}"
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-3xl text-sm font-medium border border-green-100">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                Votre mission respecte la charte de solidarité PlayLife.
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-4">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex items-center gap-2 py-4 px-6 rounded-[1.2rem] border border-gray-200 text-gray-600 font-bold hover:bg-white transition-all active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Précédent</span>
                        </button>
                    ) : (
                        <div />
                    )}

                    <button
                        type="button"
                        onClick={step === totalSteps ? handleSubmit : nextStep}
                        disabled={loading || !validateStep()}
                        className="flex-1 max-w-[240px] py-4 px-8 rounded-[1.2rem] bg-[#e6244d] text-white font-bold hover:bg-[#c91d41] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-[#e6244d]/20 active:scale-95 translate-y-0 group"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {step === totalSteps ? (
                                    <>
                                        <span>Lancer la mission</span>
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                ) : (
                                    <>
                                        <span>Continuer</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
