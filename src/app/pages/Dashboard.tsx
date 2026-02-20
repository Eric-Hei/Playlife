import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Target, Users, Calendar, MapPin, ArrowRight, User, Upload, Edit2, Trash2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { MissionForm } from '../components/MissionForm';

type Mission = Database['public']['Tables']['missions']['Row'];

export default function Dashboard() {
    const { user, profile, loading: authLoading, refreshProfile } = useAuth();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [editingMission, setEditingMission] = useState<any>(null);
    const [showMediaUpload, setShowMediaUpload] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState({
        full_name: '',
        avatar_url: '',
        user_type: ''
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
                                            {profile?.role || (user ? "Profil manquant" : 'Membre')}
                                        </span>
                                        {profile?.user_type && (
                                            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                                                {profile.user_type === 'voyageur' ? '✈️ Voyageur' : '🎓 Enseignant'}
                                            </span>
                                        )}
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
                                className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all group relative"
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
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-bold text-[#22081c] line-clamp-1 flex-1">{mission.title}</h3>
                                        {mission.status === 'completed' && (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full shrink-0">
                                                TERMINÉE
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{mission.description}</p>
                                    <div className="flex flex-col gap-2 mb-3">
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

                                    {/* Action buttons */}
                                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                                        <button
                                            onClick={() => setEditingMission(mission)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                                            title="Modifier"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            <span>Modifier</span>
                                        </button>
                                        {mission.status !== 'completed' && (
                                            <button
                                                onClick={() => handleCompleteMission(mission.id)}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                                                title="Marquer comme terminée"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                <span>Terminée</span>
                                            </button>
                                        )}
                                        {mission.status === 'completed' && (
                                            <button
                                                onClick={() => setShowMediaUpload(mission.id)}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                                                title="Ajouter des photos/vidéos"
                                            >
                                                <ImageIcon className="w-3.5 h-3.5" />
                                                <span>Médias</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteMission(mission.id)}
                                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
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
                    onClose={() => setShowMediaUpload(null)}
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
