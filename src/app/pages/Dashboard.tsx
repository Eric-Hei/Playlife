import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Target, Users, Calendar, MapPin, ArrowRight, User } from 'lucide-react';
import { MissionForm } from '../components/MissionForm';

type Mission = Database['public']['Tables']['missions']['Row'];

export default function Dashboard() {
    const { user, profile, loading: authLoading, refreshProfile } = useAuth();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editFormData, setEditFormData] = useState({
        full_name: '',
        avatar_url: ''
    });

    const fetchUserMissions = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('missions')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user missions:', error);
        } else {
            setMissions(data || []);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchUserMissions();
        }
    }, [user, fetchUserMissions]);

    useEffect(() => {
        if (profile) {
            setEditFormData({
                full_name: profile.full_name || '',
                avatar_url: profile.avatar_url || ''
            });
        }
    }, [profile]);

    const handleProfileSave = async () => {
        if (!user) return;

        try {
            const { error } = await (supabase
                .from('profiles') as any)
                .update({
                    full_name: editFormData.full_name,
                    avatar_url: editFormData.avatar_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            await refreshProfile();
            setIsEditingProfile(false);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(`Erreur lors de la mise à jour du profil: ${error.message}`);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e6244d]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-br from-[#22081c] to-[#3d1232] rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 overflow-hidden shrink-0 group relative">
                            {profile?.avatar_url || (isEditingProfile && editFormData.avatar_url) ? (
                                <img src={isEditingProfile ? editFormData.avatar_url : profile?.avatar_url as string} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-white/70" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            {isEditingProfile ? (
                                <div className="space-y-3 max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Nom complet"
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e6244d] text-white placeholder-white/40"
                                        value={editFormData.full_name}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                    />
                                    <input
                                        type="text"
                                        placeholder="URL de l'avatar"
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e6244d] text-white placeholder-white/40 text-sm"
                                        value={editFormData.avatar_url}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                                    />
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={handleProfileSave}
                                            className="px-4 py-1.5 bg-[#e6244d] rounded-lg text-sm font-bold hover:bg-[#c91d41] transition-colors"
                                        >
                                            Enregistrer
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingProfile(false);
                                                if (profile) {
                                                    setEditFormData({
                                                        full_name: profile.full_name || '',
                                                        avatar_url: profile.avatar_url || ''
                                                    });
                                                }
                                            }}
                                            className="px-4 py-1.5 bg-white/10 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-white/60 text-sm mb-1">Bienvenue,</p>
                                    <h1 className="text-3xl font-bold mb-2 truncate">
                                        {profile?.full_name || (user ? "Utilisateur non trouvé" : 'Utilisateur')}
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-[#e6244d] rounded-full text-xs font-semibold uppercase tracking-wide">
                                            {profile?.role || (user ? "Profil manquant" : 'Membre')}
                                        </span>
                                        <button
                                            onClick={() => setIsEditingProfile(true)}
                                            className="text-white/60 hover:text-white transition-colors text-xs font-medium flex items-center gap-1"
                                        >
                                            Modifier le profil
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex md:flex-col gap-3 shrink-0">
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-[#22081c] px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:bg-gray-100 active:scale-95"
                            >
                                <Plus className="w-5 h-5 text-[#e6244d]" />
                                Nouvelle mission
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-pink-50 rounded-xl flex items-center justify-center">
                            <Target className="w-7 h-7 text-[#e6244d]" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Mes missions</p>
                            <p className="text-3xl font-bold text-[#22081c]">{missions.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                            <Users className="w-7 h-7 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Enfants aidés</p>
                            <p className="text-3xl font-bold text-[#22081c]">-</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                            <Calendar className="w-7 h-7 text-green-500" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">En cours</p>
                            <p className="text-3xl font-bold text-[#22081c]">
                                {missions.filter(m => m.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Missions Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#22081c]">Mes Missions</h2>
                        <p className="text-gray-500 text-sm mt-1">Gérez et suivez vos missions humanitaires</p>
                    </div>
                    <Link
                        to="/missions"
                        className="text-[#e6244d] hover:text-[#c91d41] text-sm font-medium flex items-center gap-1"
                    >
                        Voir toutes <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e6244d]"></div>
                    </div>
                ) : missions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {missions.slice(0, 6).map((mission) => (
                            <div
                                key={mission.id}
                                className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all group"
                            >
                                {mission.image_url && (
                                    <div className="h-36 overflow-hidden">
                                        <img
                                            src={mission.image_url}
                                            alt={mission.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="p-4">
                                    <h3 className="font-bold text-[#22081c] mb-2 line-clamp-1">{mission.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{mission.description}</p>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                <MapPin className="w-3.5 h-3.5 text-[#e6244d]" />
                                                <span className="truncate">{mission.city && mission.country ? `${mission.city}, ${mission.country}` : mission.location}</span>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-300 shrink-0">
                                                {mission.mission_type === 'voyageur' ? 'Voyageur' : 'Animateur'}
                                            </span>
                                        </div>
                                        {(mission.start_date || mission.end_date) && (
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>
                                                    Du {mission.start_date ? new Date(mission.start_date).toLocaleDateString() : '?'} au {mission.end_date ? new Date(mission.end_date).toLocaleDateString() : '?'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#22081c] mb-2">Aucune mission</h3>
                        <p className="text-gray-500 mb-6">Vous n'avez pas encore créé de mission.</p>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="inline-flex items-center gap-2 bg-[#e6244d] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#c91d41] transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Créer ma première mission
                        </button>
                    </div>
                )}
            </div>

            {/* Mission Form Modal */}
            {isFormOpen && (
                <MissionForm
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={fetchUserMissions}
                />
            )}
        </div>
    );
}
