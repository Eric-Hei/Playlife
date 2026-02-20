import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { UserPlus, Mail, Lock, User, Loader2, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'voyageur' as 'voyageur' | 'animateur'
    });
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign Up User
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                // 2. Create Profile in public.profiles
                // Note: Using any here temporarily to bypass the transition state of types
                const { error: profileError } = await (supabase
                    .from('profiles') as any)
                    .insert({
                        id: data.user.id,
                        full_name: formData.fullName,
                        email: formData.email,
                        role: formData.role,
                    });

                if (profileError) throw profileError;
            }

            const createParam = searchParams.get('create');
            navigate(createParam === 'true' ? '/missions?create=true' : '/missions');
        } catch (error: any) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center bg-gray-50 px-4 md:px-8 py-4 md:py-6 border-t border-gray-100">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e6244d] rounded-2xl mb-4 shadow-lg shadow-[#e6244d]/20">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#22081c]">Rejoignez Playlife</h1>
                    <p className="text-gray-500 mt-2">Commencez votre aventure solidaire</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'voyageur' }))}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'voyageur'
                                ? 'border-[#e6244d] bg-[#e6244d]/5'
                                : 'border-gray-100 bg-white hover:border-gray-200'
                                }`}
                        >
                            <Globe className={`w-6 h-6 ${formData.role === 'voyageur' ? 'text-[#e6244d]' : 'text-gray-400'}`} />
                            <span className={`text-xs font-bold ${formData.role === 'voyageur' ? 'text-[#e6244d]' : 'text-gray-500'}`}>Voyageur</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'animateur' }))}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'animateur'
                                ? 'border-[#e6244d] bg-[#e6244d]/5'
                                : 'border-gray-100 bg-white hover:border-gray-200'
                                }`}
                        >
                            <User className={`w-6 h-6 ${formData.role === 'animateur' ? 'text-[#e6244d]' : 'text-gray-400'}`} />
                            <span className={`text-xs font-bold ${formData.role === 'animateur' ? 'text-[#e6244d]' : 'text-gray-500'}`}>Animateur</span>
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                required
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e6244d]/20 focus:border-[#e6244d] transition-all"
                                placeholder="Jean Dupont"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e6244d]/20 focus:border-[#e6244d] transition-all"
                                placeholder="jean.dupont@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                required
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e6244d]/20 focus:border-[#e6244d] transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#e6244d] text-white font-bold rounded-xl hover:bg-[#c91d41] transition-all shadow-lg shadow-[#e6244d]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "S'inscrire"}
                    </button>
                </form>

                <p className="text-center text-gray-500 mt-6 text-sm">
                    Déjà un compte ?{" "}
                    <button onClick={() => navigate('/login')} className="text-[#e6244d] font-bold hover:underline">
                        Se connecter
                    </button>
                </p>
            </div>
        </div>
    );
}
