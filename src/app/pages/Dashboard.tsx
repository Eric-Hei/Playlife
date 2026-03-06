import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Target, Users, Calendar, MapPin, ArrowRight, User, Upload, Edit2, Trash2, CheckCircle, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { MissionForm } from '../components/MissionForm';

type Mission = Database['public']['Tables']['missions']['Row'];
type MissionMedia = Database['public']['Tables']['mission_media']['Row'];

export default function Dashboard() {
    const { user, profile, loading: authLoading, refreshProfile } = useAuth();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [editingMission, setEditingMission] = useState<any>(null);
    const [showMediaUpload, setShowMediaUpload] = useState<string | null>(null);
    const [missionMediaMap, setMissionMediaMap] = useState<Record<string, MissionMedia[]>>({});
    const [slideshowData, setSlideshowData] = useState<{ photos: MissionMedia[]; title: string } | null>(null);
    const [editFormData, setEditFormData] = useState({
        full_name: '',
        avatar_url: '',
        user_type: ''
    });

    const fetchMediaForMissions = useCallback(async (completedIds: string[]) => {
        if (completedIds.length === 0) {
            setMissionMediaMap({});
            return;
        }
        const { data, error } = await (supabase
            .from('mission_media') as any)
            .select('*')
            .in('mission_id', completedIds)
            .order('created_at', { ascending: true });

        if (!error && data) {
            const map: Record<string, MissionMedia[]> = {};
            (data as MissionMedia[]).forEach(media => {
                if (!map[media.mission_id]) map[media.mission_id] = [];
                map[media.mission_id].push(media);
            });
            setMissionMediaMap(map);
        }
    }, []);

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
            const ms: Mission[] = data || [];
            setMissions(ms);
            const completedIds = ms.filter(m => m.status === 'completed').map(m => m.id);
            await fetchMediaForMissions(completedIds);
        }
        setLoading(false);
    }, [user, fetchMediaForMissions]);

    useEffect(() => {
        if (user) {
            fetchUserMissions();
        }
    }, [user, fetchUserMissions]);

    useEffect(() => {
        if (profile) {
            setEditFormData({
                full_name: profile.full_name || '',
                avatar_url: profile.avatar_url || '',
                user_type: profile.user_type || ''
            });
        }
    }, [profile]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Vérifier la taille du fichier (5Mo max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('L\'avatar ne doit pas dépasser 5Mo');
            e.target.value = '';
            return;
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image');
            e.target.value = '';
            return;
        }

        setUploadingAvatar(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}/avatar.${fileExt}`;
            const filePath = fileName;

            // Supprimer l'ancien avatar s'il existe
            if (profile?.avatar_url) {
                const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
                await supabase.storage.from('avatars').remove([oldPath]);
            }

            // Upload vers Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Récupérer l'URL publique
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setEditFormData(prev => ({ ...prev, avatar_url: publicUrl }));
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            alert(`Erreur lors de l'upload de l'avatar: ${error.message || 'Erreur inconnue'}`);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleProfileSave = async () => {
        if (!user) return;

        try {
            const { error } = await (supabase
                .from('profiles') as any)
                .update({
                    full_name: editFormData.full_name,
                    avatar_url: editFormData.avatar_url,
                    user_type: editFormData.user_type,
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

    const handleDeleteMission = async (missionId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) return;

        try {
            const { error } = await (supabase
                .from('missions') as any)
                .delete()
                .eq('id', missionId);

            if (error) throw error;

            await fetchUserMissions();
        } catch (error: any) {
            console.error('Error deleting mission:', error);
            alert(`Erreur lors de la suppression: ${error.message}`);
        }
    };

    const handleCompleteMission = async (missionId: string, askForMedia: boolean = true) => {
        try {
            const { error } = await (supabase
                .from('missions') as any)
                .update({ status: 'completed' })
                .eq('id', missionId);

            if (error) throw error;

            await fetchUserMissions();

            if (askForMedia) {
                const addNow = confirm(
                    'Mission marquée comme terminée !\n\n' +
                    'Souhaitez-vous ajouter des photos ou vidéos maintenant ?\n\n' +
                    'Cliquez sur "OK" pour ajouter maintenant, ou "Annuler" pour le faire plus tard.'
                );

                if (addNow) {
                    setShowMediaUpload(missionId);
                }
            }
        } catch (error: any) {
            console.error('Error completing mission:', error);
            alert(`Erreur lors de la mise à jour: ${error.message}`);
        }
    };

    const handleDeletePhoto = async (photo: MissionMedia) => {
        if (!confirm('Supprimer cette photo définitivement ? Cette action est irréversible.')) return;
        try {
            const { error: dbError } = await (supabase.from('mission_media') as any)
                .delete()
                .eq('id', photo.id);
            if (dbError) throw dbError;

            // Suppression dans le storage
            try {
                const urlObj = new URL(photo.media_url);
                const storagePath = urlObj.pathname.split('/mission-media/')[1];
                if (storagePath) await supabase.storage.from('mission-media').remove([storagePath]);
            } catch (_) { /* URL invalide, on ignore */ }

            // Mise à jour du state local
            setMissionMediaMap(prev => {
                const newMap: Record<string, MissionMedia[]> = {};
                for (const key in prev) newMap[key] = prev[key].filter(p => p.id !== photo.id);
                return newMap;
            });
            setSlideshowData(prev => {
                if (!prev) return null;
                const newPhotos = prev.photos.filter(p => p.id !== photo.id);
                return newPhotos.length === 0 ? null : { ...prev, photos: newPhotos };
            });
        } catch (error: any) {
            alert(`Erreur lors de la suppression : ${error.message}`);
        }
    };

    // Missions triées : en cours d'abord, terminées ensuite
    const activeMissions = missions.filter(m => m.status !== 'completed');
    const completedMissions = missions.filter(m => m.status === 'completed');

    const renderMissionCard = (mission: Mission) => {
        const missionPhotos = (missionMediaMap[mission.id] || []).filter(m => m.media_type === 'photo');
        const isCompleted = mission.status === 'completed';
        return (
            <article key={mission.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all group">
                {mission.image_url && (
                    <div className="h-36 overflow-hidden">
                        <img
                            src={mission.image_url}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}
                <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-[#22081c] line-clamp-1 flex-1">{mission.title}</h4>
                        {isCompleted && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full shrink-0">
                                TERMINÉE
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{mission.description}</p>
                    <div className="flex flex-col gap-2 mb-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-[#e6244d]" aria-hidden="true" />
                                <span className="truncate">
                                    {mission.city && mission.country ? `${mission.city}, ${mission.country}` : mission.location}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-300 shrink-0">
                                {mission.mission_type === 'voyageur' ? 'Voyageur' : 'Animateur'}
                            </span>
                        </div>
                        {(mission.start_date || mission.end_date) && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>
                                    Du {mission.start_date ? new Date(mission.start_date).toLocaleDateString('fr-FR') : '?'} au {mission.end_date ? new Date(mission.end_date).toLocaleDateString('fr-FR') : '?'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <button
                            onClick={() => setEditingMission(mission)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                            aria-label={`Modifier la mission : ${mission.title}`}
                        >
                            <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Modifier</span>
                        </button>
                        {!isCompleted && (
                            <button
                                onClick={() => handleCompleteMission(mission.id)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                                aria-label={`Marquer la mission ${mission.title} comme terminée`}
                            >
                                <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Terminée</span>
                            </button>
                        )}
                        {isCompleted && (
                            <button
                                onClick={() => setShowMediaUpload(mission.id)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                                aria-label={`Ajouter des photos pour la mission : ${mission.title}`}
                            >
                                <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Médias</span>
                            </button>
                        )}
                        <button
                            onClick={() => handleDeleteMission(mission.id)}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                            aria-label={`Supprimer la mission : ${mission.title}`}
                        >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Galerie photos pour missions terminées */}
                    {isCompleted && missionPhotos.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex gap-1.5 mb-2 flex-wrap" aria-hidden="true">
                                {missionPhotos.slice(0, 3).map((photo) => (
                                    <div key={photo.id} className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                                        <img src={photo.media_url} alt="" className="w-full h-full object-cover" aria-hidden="true" />
                                    </div>
                                ))}
                                {missionPhotos.length > 3 && (
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium shrink-0">
                                        +{missionPhotos.length - 3}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setSlideshowData({ photos: missionPhotos, title: mission.title })}
                                className="text-xs text-[#e6244d] hover:underline font-medium flex items-center gap-1"
                                aria-label={`Voir le diaporama des ${missionPhotos.length} photo${missionPhotos.length > 1 ? 's' : ''} de la mission ${mission.title}`}
                            >
                                <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                                Consulter les {missionPhotos.length} photo{missionPhotos.length > 1 ? 's' : ''}
                            </button>
                        </div>
                    )}
                </div>
            </article>
        );
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e6244d]"></div>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-8 py-4 md:py-6 border-t border-gray-100 space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-br from-[#22081c] to-[#3d1232] rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 overflow-hidden shrink-0 group relative">
                            {(isEditingProfile ? editFormData.avatar_url : profile?.avatar_url) ? (
                                <img
                                    src={`${isEditingProfile ? editFormData.avatar_url : profile?.avatar_url}?t=${Date.now()}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-12 h-12 text-white/70" aria-hidden="true" />
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

                                    <div>
                                        <label className="block text-white/60 text-xs mb-2">Type de profil</label>
                                        <select
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e6244d] text-white"
                                            value={editFormData.user_type}
                                            onChange={(e) => setEditFormData(prev => ({ ...prev, user_type: e.target.value }))}
                                        >
                                            <option value="" className="bg-[#22081c]">Sélectionner un type</option>
                                            <option value="voyageur" className="bg-[#22081c]">Voyageur solidaire</option>
                                            <option value="animateur" className="bg-[#22081c]">Animateur / Enseignant</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-white/60 text-xs mb-2">Avatar (max 5Mo)</label>
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                            />
                                            <div className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                                                <Upload className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {uploadingAvatar ? 'Upload en cours...' : 'Parcourir et choisir une image'}
                                                </span>
                                            </div>
                                        </label>
                                        {editFormData.avatar_url && (
                                            <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                                                <CheckCircle className="w-3 h-3 text-green-400" />
                                                Avatar uploadé
                                            </div>
                                        )}
                                    </div>

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
                                                        avatar_url: profile.avatar_url || '',
                                                        user_type: profile.user_type || ''
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
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="px-3 py-1 bg-[#e6244d] rounded-full text-xs font-semibold uppercase tracking-wide">
                                            {profile?.user_type === 'voyageur'
                                                ? '✈️ Voyageur solidaire'
                                                : profile?.user_type === 'animateur'
                                                    ? '🎓 Animateur / Enseignant'
                                                    : 'Membre'}
                                        </span>
                                        <button
                                            onClick={() => setIsEditingProfile(true)}
                                            className="text-white/60 hover:text-white transition-colors text-xs font-medium flex items-center gap-1"
                                        >
                                            <Edit2 className="w-3 h-3" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                        <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-7 h-7 text-green-500" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Missions terminées</p>
                            <p className="text-3xl font-bold text-[#22081c]">
                                {missions.filter(m => m.status === 'completed').length}
                            </p>
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
                            <p className="text-3xl font-bold text-[#22081c]">
                                {missions.filter(m => m.status === 'completed').length * 20}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Calendar className="w-7 h-7 text-blue-500" />
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

            {/* Mes Missions */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#22081c]">Mes Missions</h2>
                        <p className="text-gray-500 text-sm mt-1">Gérez et suivez vos missions humanitaires</p>
                    </div>
                    <Link
                        to="/missions"
                        className="text-[#e6244d] hover:text-[#c91d41] text-sm font-medium flex items-center gap-1"
                        aria-label="Voir toutes les missions"
                    >
                        Voir toutes <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e6244d]" role="status" aria-label="Chargement des missions"></div>
                    </div>
                ) : missions.length > 0 ? (
                    <>
                        {/* Missions en cours */}
                        {activeMissions.length > 0 && (
                            <section aria-labelledby="active-missions-heading" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-5 border-b border-gray-100">
                                    <h3 id="active-missions-heading" className="text-base font-bold text-[#22081c] flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" aria-hidden="true"></span>
                                        Missions en cours
                                        <span className="text-sm font-normal text-gray-400">({activeMissions.length})</span>
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                    {activeMissions.map(mission => renderMissionCard(mission))}
                                </div>
                            </section>
                        )}

                        {/* Missions terminées */}
                        {completedMissions.length > 0 && (
                            <section aria-labelledby="completed-missions-heading" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-5 border-b border-gray-100">
                                    <h3 id="completed-missions-heading" className="text-base font-bold text-[#22081c] flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
                                        Missions terminées
                                        <span className="text-sm font-normal text-gray-400">({completedMissions.length})</span>
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                    {completedMissions.map(mission => renderMissionCard(mission))}
                                </div>
                            </section>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-8 h-8 text-gray-400" aria-hidden="true" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#22081c] mb-2">Aucune mission</h3>
                        <p className="text-gray-500 mb-6">Vous n'avez pas encore créé de mission.</p>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="inline-flex items-center gap-2 bg-[#e6244d] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#c91d41] transition-colors"
                        >
                            <Plus className="w-5 h-5" aria-hidden="true" />
                            Créer ma première mission
                        </button>
                    </div>
                )}
            </div>

            {/* Mission Form Modal - Create */}
            {isFormOpen && (
                <MissionForm
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={fetchUserMissions}
                />
            )}

            {/* Mission Form Modal - Edit */}
            {editingMission && (
                <MissionForm
                    onClose={() => setEditingMission(null)}
                    onSuccess={() => {
                        fetchUserMissions();
                        setEditingMission(null);
                    }}
                    initialData={editingMission}
                />
            )}

            {/* Media Upload Modal */}
            {showMediaUpload && (
                <MediaUploadModal
                    missionId={showMediaUpload}
                    onClose={() => {
                        setShowMediaUpload(null);
                        const completedIds = missions.filter(m => m.status === 'completed').map(m => m.id);
                        fetchMediaForMissions(completedIds);
                    }}
                />
            )}

            {/* Diaporama photos */}
            {slideshowData && (
                <PhotoSlideshowModal
                    photos={slideshowData.photos}
                    title={slideshowData.title}
                    onClose={() => setSlideshowData(null)}
                    onDelete={handleDeletePhoto}
                />
            )}
        </div>
    );
}

// Composant pour l'upload de médias
function MediaUploadModal({ missionId, onClose }: { missionId: string; onClose: () => void }) {
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        try {
            for (const file of Array.from(files)) {
                // Vérifier la taille (5Mo max)
                const maxSize = 5 * 1024 * 1024;
                if (file.size > maxSize) {
                    alert(`Le fichier ${file.name} dépasse 5Mo`);
                    continue;
                }

                // Vérifier le type
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');
                if (!isImage && !isVideo) {
                    alert(`Le fichier ${file.name} n'est ni une image ni une vidéo`);
                    continue;
                }

                const fileExt = file.name.split('.').pop();
                const fileName = `${missionId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                // Upload vers Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('mission-media')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                // Récupérer l'URL publique
                const { data: { publicUrl } } = supabase.storage
                    .from('mission-media')
                    .getPublicUrl(fileName);

                // Enregistrer dans la table mission_media
                const { error: dbError } = await (supabase
                    .from('mission_media') as any)
                    .insert({
                        mission_id: missionId,
                        media_url: publicUrl,
                        media_type: isImage ? 'photo' : 'video',
                        created_by: (await supabase.auth.getUser()).data.user?.id
                    });

                if (dbError) throw dbError;

                setUploadedFiles(prev => [...prev, file.name]);
            }

            alert('Médias uploadés avec succès !');
        } catch (error: any) {
            console.error('Error uploading media:', error);
            alert(`Erreur lors de l'upload: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#22081c]">Ajouter des photos/vidéos</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Texte de consentement */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4" role="note">
                        <p className="text-xs text-amber-800 leading-relaxed">
                            <strong>Engagement avant publication :</strong> En publiant ces photos, je confirme disposer des droits nécessaires et avoir l'accord des personnes photographiées lorsque cela est requis. Je m'engage à ne publier aucun contenu raciste, discriminatoire, violent, humiliant ou illégal. Les images doivent respecter la dignité des personnes, notamment des enfants. J'autorise Playlife à utiliser ces photos pour la communication de l'association.
                        </p>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-[#e6244d]/10 rounded-full flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-[#e6244d]" />
                                </div>
                                <div>
                                    <p className="font-medium text-[#22081c] mb-1">
                                        {uploading ? 'Upload en cours...' : 'Cliquez pour sélectionner des fichiers'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Photos ou vidéos (max 5Mo par fichier)
                                    </p>
                                </div>
                            </div>
                        </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="text-sm font-medium text-green-800 mb-2">
                                ✓ Fichiers uploadés ({uploadedFiles.length})
                            </p>
                            <ul className="text-xs text-green-700 space-y-1">
                                {uploadedFiles.map((name, i) => (
                                    <li key={i}>• {name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

// Composant diaporama photos de mission
function PhotoSlideshowModal({ photos, title, onClose, onDelete }: {
    photos: MissionMedia[];
    title: string;
    onClose: () => void;
    onDelete?: (photo: MissionMedia) => Promise<void>;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goNext = useCallback(() => setCurrentIndex(i => (i + 1) % photos.length), [photos.length]);
    const goPrev = useCallback(() => setCurrentIndex(i => (i - 1 + photos.length) % photos.length), [photos.length]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goNext();
            else if (e.key === 'ArrowLeft') goPrev();
            else if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [goNext, goPrev, onClose]);

    const current = photos[currentIndex];

    return (
        <div
            className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Diaporama photos – ${title}`}
        >
            {/* En-tête */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-4">
                <p className="text-white font-semibold text-lg truncate">{title}</p>
                <div className="flex items-center gap-3">
                    <span className="text-white/60 text-sm" aria-live="polite" aria-atomic="true">
                        {currentIndex + 1} / {photos.length}
                    </span>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(current)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                            aria-label="Supprimer cette photo"
                        >
                            <Trash2 className="w-5 h-5" aria-hidden="true" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Fermer le diaporama"
                    >
                        <X className="w-6 h-6" aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Image principale */}
            <div className="relative w-full max-w-4xl flex items-center justify-center">
                {photos.length > 1 && (
                    <button
                        onClick={goPrev}
                        className="absolute left-0 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Photo précédente"
                    >
                        <ChevronLeft className="w-6 h-6" aria-hidden="true" />
                    </button>
                )}

                <img
                    src={current.media_url}
                    alt={current.caption || `Photo ${currentIndex + 1} de la mission ${title}`}
                    className="max-h-[65vh] max-w-full object-contain rounded-lg"
                />

                {photos.length > 1 && (
                    <button
                        onClick={goNext}
                        className="absolute right-0 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Photo suivante"
                    >
                        <ChevronRight className="w-6 h-6" aria-hidden="true" />
                    </button>
                )}
            </div>

            {/* Légende */}
            {current.caption && (
                <p className="text-white/70 text-sm mt-3 text-center max-w-2xl">{current.caption}</p>
            )}

            {/* Navigation par points */}
            {photos.length > 1 && (
                <div className="flex gap-2 mt-4" role="tablist" aria-label="Navigation entre les photos">
                    {photos.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white ${i === currentIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/70 w-2'}`}
                            role="tab"
                            aria-selected={i === currentIndex}
                            aria-label={`Photo ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
