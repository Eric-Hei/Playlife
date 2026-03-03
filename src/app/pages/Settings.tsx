import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/types/database.types';
import { Shield, CheckCircle, XCircle, Building2, Target, Edit2, TrendingUp, Send, Trash2, Plus, Image as ImageIcon, Upload, X } from 'lucide-react';
import packageJson from '../../../package.json';
import { MissionForm } from '@/app/components/MissionForm';

type Structure = Database['public']['Tables']['structures']['Row'];
type Mission = Database['public']['Tables']['missions']['Row'];

export default function Settings() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [pendingStructures, setPendingStructures] = useState<any[]>([]);
    const [allMissions, setAllMissions] = useState<any[]>([]);
    const [impactMetrics, setImpactMetrics] = useState({
        value1: '23',
        label1: 'structures aidées',
        value2: '580',
        label2: 'enfants aidés'
    });
    const [savingImpact, setSavingImpact] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingMission, setEditingMission] = useState<string | null>(null);
    const [fundraisingUrl, setFundraisingUrl] = useState('');

    // Rediriger si pas super admin
    useEffect(() => {
        if (!profile) return;

        if (!profile.is_super_admin) {
            alert('Accès refusé : vous devez être super administrateur.');
            navigate('/');
        }
    }, [profile, navigate]);

    useEffect(() => {
        if (profile?.is_super_admin) {
            fetchPendingStructures();
            fetchAllMissions();
            fetchImpactMetrics();
        }
    }, [profile]);

    async function fetchImpactMetrics() {
        try {
            const { data, error } = await supabase
                .from('site_config')
                .select('value')
                .eq('key', 'impact_metrics')
                .maybeSingle();

            if (data) {
                setImpactMetrics((data as any).value);
            }
        } catch (error) {
            console.error('Error fetching impact metrics:', error);
        }
    }

    async function handleSaveImpact() {
        setSavingImpact(true);
        try {
            const { error } = await (supabase
                .from('site_config') as any)
                .upsert({
                    key: 'impact_metrics',
                    value: impactMetrics,
                    updated_by: profile?.id
                });

            if (error) throw error;
            alert('Chiffres clés mis à jour avec succès !');
        } catch (error: any) {
            console.error('Error saving impact metrics:', error);
            alert(`Erreur lors de la sauvegarde: ${error.message}`);
        } finally {
            setSavingImpact(false);
        }
    }

    async function fetchPendingStructures() {
        const { data, error } = await supabase
            .from('structures')
            .select('*')
            .eq('status', 'à valider playlife')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pending structures:', error);
        } else {
            setPendingStructures(data || []);
        }
        setLoading(false);
    }

    async function fetchAllMissions() {
        const { data, error } = await supabase
            .from('missions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching missions:', error);
        } else {
            setAllMissions(data || []);
        }
    }

    async function handleValidateStructure(structureId: string, newStatus: 'validée' | 'refusée') {
        try {
            const { error } = await (supabase
                .from('structures') as any)
                .update({ status: newStatus })
                .eq('id', structureId);

            if (error) throw error;

            alert(`Structure ${newStatus === 'validée' ? 'validée' : 'refusée'} avec succès !`);
            await fetchPendingStructures();
        } catch (error: any) {
            console.error('Error updating structure:', error);
            alert(`Erreur: ${error.message}`);
        }
    }

    const [showMissionForm, setShowMissionForm] = useState(false);
    const [selectedMission, setSelectedMission] = useState<any>(null);
    const [allStructures, setAllStructures] = useState<any[]>([]);
    const [showAddStructureForm, setShowAddStructureForm] = useState(false);
    const [slideshowPhotos, setSlideshowPhotos] = useState<string[]>([]);
    const [uploadingSlideshow, setUploadingSlideshow] = useState(false);
    const slideshowInputRef = useRef<HTMLInputElement>(null);
    const [newStructure, setNewStructure] = useState({
        name: '', description: '', type: '', address: '', city: '', country: '',
        contact_name: '', contact_email: '', contact_phone: '', website_url: ''
    });

    async function handleEditMission(mission: any) {
        setSelectedMission(mission);
        setShowMissionForm(true);
    }

    useEffect(() => {
        if (profile?.is_super_admin) {
            fetchAllStructures();
            fetchSlideshowPhotos();
        }
    }, [profile]);

    async function fetchAllStructures() {
        const { data, error } = await supabase
            .from('structures')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error) setAllStructures(data || []);
    }

    async function fetchSlideshowPhotos() {
        const { data } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'slideshow_photos')
            .maybeSingle();
        if (data) setSlideshowPhotos((data as any).value || []);
    }

    async function handleDeleteStructure(structureId: string) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette structure ? Cette action est irréversible.')) return;
        const { error } = await (supabase.from('structures') as any).delete().eq('id', structureId);
        if (error) { alert(`Erreur: ${error.message}`); return; }
        await fetchAllStructures();
        await fetchPendingStructures();
    }

    async function handleAddStructure() {
        if (!newStructure.name.trim()) { alert('Le nom de la structure est requis.'); return; }
        const { error } = await (supabase.from('structures') as any).insert({
            ...newStructure,
            status: 'validée',
            created_by: profile?.id
        });
        if (error) { alert(`Erreur: ${error.message}`); return; }
        setNewStructure({ name: '', description: '', type: '', address: '', city: '', country: '', contact_name: '', contact_email: '', contact_phone: '', website_url: '' });
        setShowAddStructureForm(false);
        await fetchAllStructures();
    }

    async function handleSlideshowUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert('Veuillez sélectionner une image.'); return; }
        setUploadingSlideshow(true);
        try {
            const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            const { error: uploadError } = await supabase.storage.from('slideshow').upload(fileName, file, { upsert: false });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('slideshow').getPublicUrl(fileName);
            const updatedPhotos = [...slideshowPhotos, publicUrl];
            await (supabase.from('site_config') as any).upsert({ key: 'slideshow_photos', value: updatedPhotos, updated_by: profile?.id });
            setSlideshowPhotos(updatedPhotos);
        } catch (err: any) {
            alert(`Erreur upload: ${err.message}`);
        } finally {
            setUploadingSlideshow(false);
            if (slideshowInputRef.current) slideshowInputRef.current.value = '';
        }
    }

    async function handleDeleteSlideshowPhoto(photoUrl: string) {
        if (!confirm('Supprimer cette photo du diaporama ?')) return;
        const fileName = photoUrl.split('/').pop();
        if (fileName) await supabase.storage.from('slideshow').remove([fileName]);
        const updatedPhotos = slideshowPhotos.filter(p => p !== photoUrl);
        await (supabase.from('site_config') as any).upsert({ key: 'slideshow_photos', value: updatedPhotos, updated_by: profile?.id });
        setSlideshowPhotos(updatedPhotos);
    }

    function getStatusBadge(status: string | null) {
        switch (status) {
            case 'validée': return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Validée</span>;
            case 'refusée': return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">Refusée</span>;
            default: return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">En attente</span>;
        }
    }

    if (!profile?.is_super_admin) {
        return null;
    }

    return (
        <>
            <main className="px-4 md:px-8 py-4 md:py-6 border-t border-gray-100">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#22081c]">Paramètres Super Admin</h1>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded-full border border-gray-200">
                            v{packageJson.version}
                        </span>
                    </div>

                </div>



                {/* Section Structures en attente */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 className="w-5 h-5 text-[#e6244d]" />
                        <h2 className="text-xl font-bold text-[#22081c]">Structures en attente de validation</h2>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                            {pendingStructures.length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e6244d]"></div>
                        </div>
                    ) : pendingStructures.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {pendingStructures.map((structure) => (
                                <div key={structure.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-[#22081c] mb-4">{structure.name}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
                                                <div>
                                                    <span className="text-gray-500">Contact:</span>
                                                    <span className="ml-2 font-bold text-[#22081c]">{structure.contact_name}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Email:</span>
                                                    <span className="ml-2 font-medium">{structure.contact_email}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Téléphone:</span>
                                                    <span className="ml-2 font-medium">{structure.contact_phone}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Localisation:</span>
                                                    <span className="ml-2 font-medium">
                                                        {(structure as any).address && `${(structure as any).address}, `}
                                                        {(structure as any).postal_code && `${(structure as any).postal_code} `}
                                                        {structure.city}, {structure.country}
                                                    </span>
                                                </div>
                                                {structure.website_url && (
                                                    <div className="md:col-span-2">
                                                        <span className="text-gray-500">Site Web:</span>
                                                        <a href={structure.website_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#e6244d] hover:underline font-medium">
                                                            {structure.website_url}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            {structure.origin_info && (
                                                <div className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                                                    <span className="text-gray-500 block mb-1">Origine :</span>
                                                    <p className="text-gray-700 italic">{structure.origin_info}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-row md:flex-col gap-2 shrink-0">
                                            <button
                                                onClick={() => handleValidateStructure(structure.id, 'validée')}
                                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                                                title="Valider"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Valider
                                            </button>
                                            <button
                                                onClick={() => handleValidateStructure(structure.id, 'refusée')}
                                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                                title="Refuser"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Refuser
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                            <p className="text-gray-600">Aucune structure en attente de validation.</p>
                        </div>
                    )}
                </section>

                {/* Section Toutes les structures */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[#22081c]" />
                            <h2 className="text-xl font-bold text-[#22081c]">Toutes les structures</h2>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{allStructures.length}</span>
                        </div>
                        <button
                            onClick={() => setShowAddStructureForm(v => !v)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#22081c] text-white rounded-xl text-sm font-medium hover:bg-[#1a0616] transition-colors"
                        >
                            <Plus className="w-4 h-4" aria-hidden="true" />
                            Ajouter une structure
                        </button>
                    </div>

                    {/* Formulaire d'ajout inline */}
                    {showAddStructureForm && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 shadow-sm">
                            <h3 className="font-bold text-[#22081c] mb-4">Nouvelle structure (validée directement)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor="struct-name">Nom *</label>
                                    <input id="struct-name" type="text" value={newStructure.name} onChange={e => setNewStructure(s => ({ ...s, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none" placeholder="Nom de la structure" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor="struct-type">Type</label>
                                    <input id="struct-type" type="text" value={newStructure.type} onChange={e => setNewStructure(s => ({ ...s, type: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none" placeholder="Ex: école, association..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor="struct-city">Ville</label>
                                    <input id="struct-city" type="text" value={newStructure.city} onChange={e => setNewStructure(s => ({ ...s, city: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none" placeholder="Ville" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor="struct-country">Pays</label>
                                    <input id="struct-country" type="text" value={newStructure.country} onChange={e => setNewStructure(s => ({ ...s, country: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none" placeholder="Pays" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor="struct-contact">Contact</label>
                                    <input id="struct-contact" type="text" value={newStructure.contact_name} onChange={e => setNewStructure(s => ({ ...s, contact_name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none" placeholder="Nom du contact" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor="struct-email">Email</label>
                                    <input id="struct-email" type="email" value={newStructure.contact_email} onChange={e => setNewStructure(s => ({ ...s, contact_email: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none" placeholder="email@exemple.com" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor="struct-desc">Description</label>
                                    <textarea id="struct-desc" value={newStructure.description} onChange={e => setNewStructure(s => ({ ...s, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none" rows={2} placeholder="Description de la structure" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button onClick={handleAddStructure} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                    Créer la structure
                                </button>
                                <button onClick={() => setShowAddStructureForm(false)} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}

                    {allStructures.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {allStructures.map((structure) => (
                                <div key={structure.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-[#22081c] truncate">{structure.name}</span>
                                            {getStatusBadge(structure.status)}
                                            {structure.type && <span className="text-xs text-gray-500">{structure.type}</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{structure.city}{structure.city && structure.country ? ', ' : ''}{structure.country}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {structure.status !== 'validée' && (
                                            <button onClick={() => handleValidateStructure(structure.id, 'validée')} className="p-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors" title="Valider" aria-label={`Valider ${structure.name}`}>
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        {structure.status !== 'refusée' && (
                                            <button onClick={() => handleValidateStructure(structure.id, 'refusée')} className="p-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors" title="Refuser" aria-label={`Refuser ${structure.name}`}>
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteStructure(structure.id)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors" title="Supprimer" aria-label={`Supprimer ${structure.name}`}>
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                            <p className="text-gray-500">Aucune structure enregistrée.</p>
                        </div>
                    )}
                </section>

                {/* Section Missions */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-[#e6244d]" />
                        <h2 className="text-xl font-bold text-[#22081c]">Toutes les missions</h2>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            {allMissions.length}
                        </span>
                    </div>

                    {allMissions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {allMissions.map((mission) => (
                                <div key={mission.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-lg text-[#22081c]">{mission.title}</h3>
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${mission.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {mission.status === 'completed' ? 'TERMINÉE' : 'EN COURS'}
                                                </span>
                                            </div>
                                            <div className="text-sm space-y-1">
                                                <p className="text-gray-600">{mission.description}</p>
                                                <p className="text-gray-500">
                                                    <span className="font-medium">Type:</span> {mission.mission_type}
                                                </p>
                                                {mission.fundraising_url && (
                                                    <p className="text-gray-500">
                                                        <span className="font-medium">Cagnotte:</span>{' '}
                                                        <a
                                                            href={mission.fundraising_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[#e6244d] hover:underline"
                                                        >
                                                            {mission.fundraising_url}
                                                        </a>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-50">
                                            <button
                                                onClick={() => handleEditMission(mission)}
                                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-pink-50 text-[#e6244d] rounded-lg text-sm font-medium hover:bg-pink-100 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Modifier la mission
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                            <p className="text-gray-600">Aucune mission trouvée.</p>
                        </div>
                    )}
                </section>

                {/* Section Gestion des chiffres de l'accueil */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-[#e6244d]" />
                        <h2 className="text-xl font-bold text-[#22081c]">Gestion des chiffres de l'accueil</h2>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Chiffre Clé 1</p>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Valeur (ex: 23)</label>
                                        <input
                                            type="text"
                                            value={impactMetrics.value1}
                                            onChange={(e) => setImpactMetrics({ ...impactMetrics, value1: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e6244d]/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Libellé (ex: structures aidées)</label>
                                        <input
                                            type="text"
                                            value={impactMetrics.label1}
                                            onChange={(e) => setImpactMetrics({ ...impactMetrics, label1: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e6244d]/20 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Chiffre Clé 2</p>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Valeur (ex: 580)</label>
                                        <input
                                            type="text"
                                            value={impactMetrics.value2}
                                            onChange={(e) => setImpactMetrics({ ...impactMetrics, value2: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e6244d]/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Libellé (ex: enfants aidés)</label>
                                        <input
                                            type="text"
                                            value={impactMetrics.label2}
                                            onChange={(e) => setImpactMetrics({ ...impactMetrics, label2: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e6244d]/20 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50">
                            <button
                                onClick={handleSaveImpact}
                                disabled={savingImpact}
                                className="flex items-center gap-2 px-6 py-3 bg-[#22081c] text-white rounded-xl font-bold hover:bg-[#1a0616] transition-all disabled:opacity-50"
                            >
                                {savingImpact ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                Enregistrer les chiffres clés
                            </button>
                        </div>
                    </div>
                </section>

                {/* Section Gestion du diaporama */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <ImageIcon className="w-5 h-5 text-[#e6244d]" aria-hidden="true" />
                        <h2 className="text-xl font-bold text-[#22081c]">Photos du diaporama</h2>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{slideshowPhotos.length}</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        {/* Grille des photos existantes */}
                        {slideshowPhotos.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                                {slideshowPhotos.map((url, idx) => (
                                    <div key={url} className="relative group rounded-xl overflow-hidden border border-gray-100 aspect-video">
                                        <img src={url} alt={`Photo diaporama ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => handleDeleteSlideshowPhoto(url)}
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-red-700"
                                            aria-label={`Supprimer la photo ${idx + 1}`}
                                        >
                                            <X className="w-4 h-4" aria-hidden="true" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm mb-6">Aucune photo dans le diaporama. Les photos par défaut sont affichées.</p>
                        )}
                        {/* Bouton d'upload */}
                        <input ref={slideshowInputRef} type="file" accept="image/*" className="hidden" id="slideshow-upload" onChange={handleSlideshowUpload} aria-label="Ajouter une photo au diaporama" />
                        <label htmlFor="slideshow-upload" className={`inline-flex items-center gap-2 px-5 py-2.5 bg-[#e6244d] text-white rounded-xl font-medium cursor-pointer hover:bg-[#d11d42] transition-colors text-sm ${uploadingSlideshow ? 'opacity-50 pointer-events-none' : ''}`}>
                            {uploadingSlideshow ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                            ) : (
                                <Upload className="w-4 h-4" aria-hidden="true" />
                            )}
                            {uploadingSlideshow ? 'Envoi en cours...' : 'Ajouter une photo'}
                        </label>
                    </div>
                </section>
            </main >

            {showMissionForm && (
                <MissionForm
                    onClose={() => {
                        setShowMissionForm(false);
                        setSelectedMission(null);
                    }}
                    onSuccess={() => {
                        fetchAllMissions();
                        setShowMissionForm(false);
                        setSelectedMission(null);
                    }}
                    initialData={selectedMission}
                />
            )}
        </>
    );
}
