import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { Plus, AlertCircle, Loader2, MapPin, Calendar, Users, Heart, Globe } from 'lucide-react';
import { MissionForm } from '../components/MissionForm';
import { useAuth } from '@/contexts/AuthContext';

type Mission = Database['public']['Tables']['missions']['Row'];

export default function Missions() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Prevent multiple simultaneous fetches
    const isFetching = useRef(false);

    const fetchMissions = useCallback(async () => {
        if (isFetching.current) return;

        console.log('[Missions] fetchMissions started');
        isFetching.current = true;
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('missions')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('[Missions] Supabase error:', fetchError);
                setError(fetchError.message);
            } else {
                console.log('[Missions] Missions loaded:', data?.length);
                setMissions(data || []);
            }
        } catch (err: any) {
            console.error('[Missions] Exception:', err);
            setError(err.message || 'Erreur lors du chargement des missions');
        } finally {
            setLoading(false);
            isFetching.current = false;
            console.log('[Missions] fetchMissions finished');
        }
    }, []);

    useEffect(() => {
        fetchMissions();
    }, [fetchMissions]);

    return (
        <main className="p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#22081c] tracking-tight">Missions</h1>
                    <p className="text-gray-500 mt-2 text-lg">Découvrez et organisez vos futures missions humanitaires.</p>
                </div>
                {user && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center justify-center gap-2 bg-[#e6244d] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#c91d41] transition-all shadow-xl shadow-[#e6244d]/25 active:scale-95 hover:-translate-y-0.5"
                    >
                        <Plus className="w-6 h-6" />
                        Créer une mission
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-10 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 shadow-sm">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-bold">Oups ! Une erreur est survenue</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                    <button
                        onClick={() => fetchMissions()}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            )}

            {isFormOpen && (
                <MissionForm
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={fetchMissions}
                />
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-100 border-t-[#e6244d] rounded-full animate-spin"></div>
                        <Heart className="w-6 h-6 text-[#e6244d] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-[#22081c]">Chargement des missions</p>
                        <p className="text-gray-400">Nous préparons les meilleures opportunités pour vous...</p>
                    </div>
                </div>
            ) : missions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {missions.map((mission) => (
                        <div key={mission.id} className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-[#e6244d]/10 transition-all duration-300 flex flex-col hover:-translate-y-1">
                            {mission.image_url ? (
                                <div className="h-56 relative overflow-hidden">
                                    <img src={mission.image_url} alt={mission.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-4 right-4 h-8 px-3 bg-white/95 backdrop-blur rounded-full flex items-center shadow-sm">
                                        <span className="text-xs font-bold text-[#e6244d] uppercase tracking-wider">{mission.status || 'Active'}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-56 bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                    <Globe className="w-12 h-12 text-gray-200" />
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-[#22081c] mb-3 group-hover:text-[#e6244d] transition-colors">{mission.title}</h3>
                                <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">{mission.description}</p>

                                <div className="space-y-3 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                        <MapPin className="w-4 h-4 text-[#e6244d]" />
                                        <span>{mission.city && mission.country ? `${mission.city}, ${mission.country}` : mission.location}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-[#e6244d]" />
                                        </div>
                                        Du {mission.start_date ? new Date(mission.start_date).toLocaleDateString() : '?'} au {mission.end_date ? new Date(mission.end_date).toLocaleDateString() : '?'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-20 rounded-[40px] shadow-sm border border-gray-100 text-center max-w-2xl mx-auto mt-12">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#22081c] mb-2">Aucune mission pour le moment</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Toutes les missions humanitaires sont actuellement pourvues. Revenez prochainement ou créez votre propre mission !</p>
                    {user ? (
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="bg-[#e6244d] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#c91d41] transition-all"
                        >
                            Créer la première mission
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/register')}
                            className="text-[#e6244d] font-bold hover:underline"
                        >
                            Inscrivez-vous pour créer une mission
                        </button>
                    )}
                </div>
            )}
        </main>
    );
}
