import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Redirect if already logged in - using useEffect to avoid setstate-in-render warning
    useEffect(() => {
        if (!authLoading && user) {
            console.log('[Login] User found, redirecting to missions...');
            const createParam = searchParams.get('create');
            navigate(createParam === 'true' ? '/missions?create=true' : '/missions');
        }
    }, [authLoading, user, navigate, searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (loginError) {
                setError(loginError.message);
                setLoading(false);
            } else {
                console.log('[Login] Login successful, redirecting...');
                const createParam = searchParams.get('create');
                navigate(createParam === 'true' ? '/missions?create=true' : '/missions');
            }
        } catch (err: any) {
            setError(err.message || 'Erreur de connexion');
            setLoading(false);
        }
    };

    if (authLoading || user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#e6244d]" />
                    <p className="text-sm text-gray-500">Vérification de votre session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e6244d] rounded-2xl mb-4 shadow-lg shadow-[#e6244d]/20">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#22081c]">Heureux de vous revoir</h1>
                    <p className="text-gray-500 mt-2">Connectez-vous à votre espace Playlife</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se connecter"}
                    </button>
                </form>

                <p className="text-center text-gray-500 mt-6 text-sm">
                    Pas encore de compte ?{" "}
                    <button onClick={() => navigate('/register')} className="text-[#e6244d] font-bold hover:underline">
                        S'inscrire
                    </button>
                </p>
            </div>
        </div>
    );
}
