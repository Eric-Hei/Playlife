import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/types/database.types';
import { Shield, CheckCircle, XCircle, Building2, Target, Edit2, TrendingUp, Send, Trash2, Plus, Image as ImageIcon, Upload, X, ChevronDown, Save, BadgeCheck, Eye, EyeOff, MapPin, Calendar } from 'lucide-react';
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
            await fetchAllStructures();
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
    const [expandedStructureId, setExpandedStructureId] = useState<string | null>(null);
    const [editingStructureId, setEditingStructureId] = useState<string | null>(null);
    const [editStructureData, setEditStructureData] = useState<any>(null);
    const [structuresPage, setStructuresPage] = useState(1);
    const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
    const [missionsPage, setMissionsPage] = useState(1);

    async function handleEditMission(mission: any) {
        setSelectedMission(mission);
        setShowMissionForm(true);
    }

    async function handleDeleteMission(missionId: string) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette mission ? Cette action est irréversible.')) return;
        const { error } = await (supabase.from('missions') as any).delete().eq('id', missionId);
        if (error) { alert(`Erreur: ${error.message}`); return; }
        await fetchAllMissions();
    }

    async function handleToggleMissionVisibility(missionId: string, currentVisible: boolean) {
        const { error } = await (supabase.from('missions') as any)
            .update({ visible: !currentVisible })
            .eq('id', missionId);
        if (error) { alert(`Erreur: ${error.message}`); return; }
        await fetchAllMissions();
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

    async function handleToggleValidatedByPlaylife(structureId: string, current: boolean) {
        const { error } = await (supabase.from('structures') as any)
            .update({ validated_by_playlife: !current })
            .eq('id', structureId);
        if (error) { alert(`Erreur: ${error.message}`); return; }
        await fetchAllStructures();
    }

    async function handleSaveStructure() {
        if (!editingStructureId || !editStructureData) return;
        const { error } = await (supabase.from('structures') as any)
            .update(editStructureData)
            .eq('id', editingStructureId);
        if (error) { alert(`Erreur: ${error.message}`); return; }
        setEditingStructureId(null);
        setEditStructureData(null);
        await fetchAllStructures();
    }

    function startEditingStructure(structure: any) {
        setEditingStructureId(structure.id);
        setEditStructureData({
            name: structure.name || '',
            description: structure.description || '',
            type: structure.type || '',
            address: structure.address || '',
            city: structure.city || '',
            country: structure.country || '',
            contact_name: structure.contact_name || '',
            contact_email: structure.contact_email || '',
            contact_phone: structure.contact_phone || '',
            website_url: structure.website_url || '',
            status: structure.status || 'à valider playlife',
            validated_by_playlife: structure.validated_by_playlife || false
        });
        setExpandedStructureId(structure.id);
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

    const STRUCTURES_PER_PAGE = 10;
    const totalStructurePages = Math.ceil(allStructures.length / STRUCTURES_PER_PAGE);
    const paginatedStructures = allStructures.slice(
        (structuresPage - 1) * STRUCTURES_PER_PAGE,
        structuresPage * STRUCTURES_PER_PAGE
    );

    const MISSIONS_PER_PAGE = 10;
    const totalMissionPages = Math.ceil(allMissions.length / MISSIONS_PER_PAGE);
    const paginatedMissions = allMissions.slice(
        (missionsPage - 1) * MISSIONS_PER_PAGE,
        missionsPage * MISSIONS_PER_PAGE
    );

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
                        <>
                            {allStructures.length > STRUCTURES_PER_PAGE && (
                                <p className="text-xs text-gray-500 mb-3">
                                    Page {structuresPage} / {totalStructurePages} — {allStructures.length} structure{allStructures.length > 1 ? 's' : ''}
                                </p>
                            )}
                            <div className="grid grid-cols-1 gap-3" role="list" aria-label="Liste de toutes les structures">
                                {paginatedStructures.map((structure) => {
                                    const isExpanded = expandedStructureId === structure.id;
                                    const isEditing = editingStructureId === structure.id;
                                    return (
                                        <div key={structure.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden" role="listitem">
                                            {/* Ligne de résumé */}
                                            <div className="p-4 flex items-center justify-between gap-4">
                                                <button
                                                    onClick={() => setExpandedStructureId(isExpanded ? null : structure.id)}
                                                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                                    aria-expanded={isExpanded}
                                                    aria-controls={`structure-details-${structure.id}`}
                                                >
                                                    <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-bold text-[#22081c] truncate">{structure.name}</span>
                                                            {getStatusBadge(structure.status)}
                                                            {structure.type && <span className="text-xs text-gray-500">{structure.type}</span>}
                                                            {(structure as any).validated_by_playlife && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full border border-orange-200">
                                                                    <BadgeCheck className="w-3 h-3" aria-hidden="true" />
                                                                    Validée par Playlife
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5">{structure.city}{structure.city && structure.country ? ', ' : ''}{structure.country}</p>
                                                    </div>
                                                </button>
                                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                    {structure.status !== 'validée' && (
                                                        <button onClick={() => handleValidateStructure(structure.id, 'validée')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors" aria-label={`Valider ${structure.name}`}>
                                                            <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                                            Valider
                                                        </button>
                                                    )}
                                                    {structure.status !== 'refusée' && (
                                                        <button onClick={() => handleValidateStructure(structure.id, 'refusée')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors" aria-label={`Refuser ${structure.name}`}>
                                                            <XCircle className="w-4 h-4" aria-hidden="true" />
                                                            Refuser
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => structure.status === 'validée' && handleToggleValidatedByPlaylife(structure.id, !!(structure as any).validated_by_playlife)}
                                                        disabled={structure.status !== 'validée'}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${structure.status !== 'validée' ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                                                        aria-pressed={!!(structure as any).validated_by_playlife}
                                                        aria-disabled={structure.status !== 'validée'}
                                                        title={structure.status !== 'validée' ? 'La structure doit être validée pour activer ce label' : undefined}
                                                    >
                                                        <BadgeCheck className="w-4 h-4" aria-hidden="true" />
                                                        {(structure as any).validated_by_playlife ? 'Validée par Playlife' : 'Valider par Playlife'}
                                                    </button>
                                                    <button onClick={() => startEditingStructure(structure)} className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-[#e6244d] rounded-lg text-sm font-medium hover:bg-pink-100 transition-colors" aria-label={`Modifier ${structure.name}`}>
                                                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                                                        Modifier
                                                    </button>
                                                    <button onClick={() => handleDeleteStructure(structure.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors" aria-label={`Supprimer ${structure.name}`}>
                                                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Panneau dépliable */}
                                            {isExpanded && (
                                                <div
                                                    id={`structure-details-${structure.id}`}
                                                    className="border-t border-gray-100 p-4 bg-gray-50"
                                                >
                                                    {isEditing ? (
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Modifier la structure</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                                <div className="md:col-span-2">
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor={`edit-name-${structure.id}`}>Nom *</label>
                                                                    <input id={`edit-name-${structure.id}`} type="text" value={editStructureData.name} onChange={e => setEditStructureData((d: any) => ({ ...d, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none bg-white" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor={`edit-type-${structure.id}`}>Type</label>
                                                                    <input id={`edit-type-${structure.id}`} type="text" value={editStructureData.type} onChange={e => setEditStructureData((d: any) => ({ ...d, type: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none bg-white" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor={`edit-status-${structure.id}`}>Statut</label>
                                                                    <select id={`edit-status-${structure.id}`} value={editStructureData.status} onChange={e => setEditStructureData((d: any) => ({ ...d, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none bg-white">
                                                                        <option value="à valider playlife">En attente</option>
                                                                        <option value="validée">Validée</option>
                                                                        <option value="refusée">Refusée</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor={`edit-city-${structure.id}`}>Ville</label>
                                                                    <input id={`edit-city-${structure.id}`} type="text" value={editStructureData.city} onChange={e => setEditStructureData((d: any) => ({ ...d, city: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none bg-white" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor={`edit-country-${structure.id}`}>Pays</label>
                                                                    <input id={`edit-country-${structure.id}`} type="text" value={editStructureData.country} onChange={e => setEditStructureData((d: any) => ({ ...d, country: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none bg-white" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor={`edit-contact-${structure.id}`}>Contact</label>
                                                                    <input id={`edit-contact-${structure.id}`} type="text" value={editStructureData.contact_name} onChange={e => setEditStructureData((d: any) => ({ ...d, contact_name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none bg-white" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor={`edit-email-${structure.id}`}>Email</label>
                                                                    <input id={`edit-email-${structure.id}`} type="email" value={editStructureData.contact_email} onChange={e => setEditStructureData((d: any) => ({ ...d, contact_email: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none bg-white" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor={`edit-phone-${structure.id}`}>Téléphone</label>
                                                                    <input id={`edit-phone-${structure.id}`} type="text" value={editStructureData.contact_phone} onChange={e => setEditStructureData((d: any) => ({ ...d, contact_phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none bg-white" />
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor={`edit-address-${structure.id}`}>Adresse</label>
                                                                    <input id={`edit-address-${structure.id}`} type="text" value={editStructureData.address} onChange={e => setEditStructureData((d: any) => ({ ...d, address: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none bg-white" />
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor={`edit-website-${structure.id}`}>Site web</label>
                                                                    <input id={`edit-website-${structure.id}`} type="url" value={editStructureData.website_url} onChange={e => setEditStructureData((d: any) => ({ ...d, website_url: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none bg-white" />
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor={`edit-desc-${structure.id}`}>Description</label>
                                                                    <textarea id={`edit-desc-${structure.id}`} value={editStructureData.description} onChange={e => setEditStructureData((d: any) => ({ ...d, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#e6244d]/20 outline-none bg-white" rows={2} />
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <button onClick={handleSaveStructure} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                                                                    <Save className="w-4 h-4" aria-hidden="true" />
                                                                    Enregistrer
                                                                </button>
                                                                <button onClick={() => { setEditingStructureId(null); setEditStructureData(null); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                                                                    Annuler
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
                                                                {structure.description && (
                                                                    <div className="md:col-span-2">
                                                                        <span className="text-gray-500">Description :</span>
                                                                        <p className="text-gray-700 mt-0.5">{structure.description}</p>
                                                                    </div>
                                                                )}
                                                                {structure.contact_name && <div><span className="text-gray-500">Contact :</span> <span className="font-medium ml-1">{structure.contact_name}</span></div>}
                                                                {structure.contact_email && <div><span className="text-gray-500">Email :</span> <span className="font-medium ml-1">{structure.contact_email}</span></div>}
                                                                {structure.contact_phone && <div><span className="text-gray-500">Téléphone :</span> <span className="font-medium ml-1">{structure.contact_phone}</span></div>}
                                                                {structure.address && <div><span className="text-gray-500">Adresse :</span> <span className="font-medium ml-1">{structure.address}</span></div>}
                                                                {structure.website_url && (
                                                                    <div className="md:col-span-2">
                                                                        <span className="text-gray-500">Site web :</span>
                                                                        <a href={structure.website_url} target="_blank" rel="noopener noreferrer" className="ml-1 text-[#e6244d] hover:underline">{structure.website_url}</a>
                                                                    </div>
                                                                )}
                                                                <div><span className="text-gray-500">Créée le :</span> <span className="font-medium ml-1">{new Date(structure.created_at).toLocaleDateString('fr-FR')}</span></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Pagination */}
                            {totalStructurePages > 1 && (
                                <nav className="flex items-center justify-center gap-2 mt-4" aria-label="Navigation des pages de structures">
                                    <button
                                        onClick={() => { setStructuresPage(p => Math.max(1, p - 1)); setExpandedStructureId(null); }}
                                        disabled={structuresPage === 1}
                                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Page précédente"
                                    >
                                        ←
                                    </button>
                                    {Array.from({ length: totalStructurePages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => { setStructuresPage(page); setExpandedStructureId(null); }}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === structuresPage ? 'bg-[#22081c] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                            aria-label={`Page ${page}`}
                                            aria-current={page === structuresPage ? 'page' : undefined}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => { setStructuresPage(p => Math.min(totalStructurePages, p + 1)); setExpandedStructureId(null); }}
                                        disabled={structuresPage === totalStructurePages}
                                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Page suivante"
                                    >
                                        →
                                    </button>
                                </nav>
                            )}
                        </>
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
                        <>
                            {allMissions.length > MISSIONS_PER_PAGE && (
                                <p className="text-xs text-gray-500 mb-3">
                                    Page {missionsPage} / {totalMissionPages} — {allMissions.length} mission{allMissions.length > 1 ? 's' : ''}
                                </p>
                            )}
                            <div className="grid grid-cols-1 gap-3" role="list" aria-label="Liste de toutes les missions">
                                {paginatedMissions.map((mission) => {
                                    const isExpanded = expandedMissionId === mission.id;
                                    const isVisible = mission.visible === true;
                                    return (
                                        <div key={mission.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden" role="listitem">
                                            {/* Ligne de résumé */}
                                            <div className="p-4 flex items-center justify-between gap-4">
                                                <button
                                                    onClick={() => setExpandedMissionId(isExpanded ? null : mission.id)}
                                                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                                    aria-expanded={isExpanded}
                                                    aria-controls={`mission-details-${mission.id}`}
                                                >
                                                    <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-bold text-[#22081c] truncate">{mission.title}</span>
                                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${mission.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {mission.status === 'completed' ? 'Terminée' : 'En cours'}
                                                            </span>
                                                            {isVisible ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                                                                    <Eye className="w-3 h-3" aria-hidden="true" />
                                                                    Visible
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full border border-gray-200">
                                                                    <EyeOff className="w-3 h-3" aria-hidden="true" />
                                                                    Masquée
                                                                </span>
                                                            )}
                                                            {mission.mission_type && <span className="text-xs text-gray-500">{mission.mission_type === 'voyageur' ? '✈️ Voyageur' : '🎓 Animateur'}</span>}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {mission.city}{mission.city && mission.country ? ', ' : ''}{mission.country}
                                                        </p>
                                                    </div>
                                                </button>
                                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleToggleMissionVisibility(mission.id, isVisible)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isVisible ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'}`}
                                                        aria-pressed={isVisible}
                                                        aria-label={isVisible ? `Masquer la mission ${mission.title}` : `Rendre visible la mission ${mission.title}`}
                                                    >
                                                        {isVisible ? <Eye className="w-4 h-4" aria-hidden="true" /> : <EyeOff className="w-4 h-4" aria-hidden="true" />}
                                                        {isVisible ? 'Visible' : 'Masquée'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditMission(mission)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-[#e6244d] rounded-lg text-sm font-medium hover:bg-pink-100 transition-colors"
                                                        aria-label={`Modifier la mission ${mission.title}`}
                                                    >
                                                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMission(mission.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                                                        aria-label={`Supprimer la mission ${mission.title}`}
                                                    >
                                                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Panneau dépliable */}
                                            {isExpanded && (
                                                <div
                                                    id={`mission-details-${mission.id}`}
                                                    className="border-t border-gray-100 p-4 bg-gray-50"
                                                >
                                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Détails de la mission</p>
                                                    {mission.description && (
                                                        <p className="text-sm text-gray-700 mb-3">{mission.description}</p>
                                                    )}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                        {mission.mission_type && <div><span className="text-gray-500">Type :</span> <span className="font-medium ml-1">{mission.mission_type === 'voyageur' ? '✈️ Voyageur solidaire' : '🎓 Animateur / Enseignant'}</span></div>}
                                                        {(mission.city || mission.country) && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                                                                <span className="text-gray-500">Lieu :</span>
                                                                <span className="font-medium ml-1">{[mission.city, mission.country].filter(Boolean).join(', ')}</span>
                                                            </div>
                                                        )}
                                                        {mission.location && <div><span className="text-gray-500">Localisation :</span> <span className="font-medium ml-1">{mission.location}</span></div>}
                                                        {(mission.start_date || mission.end_date) && (
                                                            <div className="flex items-center gap-1 md:col-span-2">
                                                                <Calendar className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                                                                <span className="text-gray-500">Dates :</span>
                                                                <span className="font-medium ml-1">
                                                                    {mission.start_date ? new Date(mission.start_date).toLocaleDateString('fr-FR') : '?'}
                                                                    {' → '}
                                                                    {mission.end_date ? new Date(mission.end_date).toLocaleDateString('fr-FR') : '?'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {mission.fundraising_url && (
                                                            <div className="md:col-span-2">
                                                                <span className="text-gray-500">Cagnotte :</span>
                                                                <a href={mission.fundraising_url} target="_blank" rel="noopener noreferrer" className="ml-1 text-[#e6244d] hover:underline break-all">{mission.fundraising_url}</a>
                                                            </div>
                                                        )}
                                                        <div><span className="text-gray-500">Créée le :</span> <span className="font-medium ml-1">{new Date(mission.created_at).toLocaleDateString('fr-FR')}</span></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Pagination */}
                            {totalMissionPages > 1 && (
                                <nav className="flex items-center justify-center gap-2 mt-4" aria-label="Navigation des pages de missions">
                                    <button
                                        onClick={() => { setMissionsPage(p => Math.max(1, p - 1)); setExpandedMissionId(null); }}
                                        disabled={missionsPage === 1}
                                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Page précédente"
                                    >
                                        ←
                                    </button>
                                    {Array.from({ length: totalMissionPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => { setMissionsPage(page); setExpandedMissionId(null); }}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === missionsPage ? 'bg-[#22081c] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                            aria-label={`Page ${page}`}
                                            aria-current={page === missionsPage ? 'page' : undefined}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => { setMissionsPage(p => Math.min(totalMissionPages, p + 1)); setExpandedMissionId(null); }}
                                        disabled={missionsPage === totalMissionPages}
                                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Page suivante"
                                    >
                                        →
                                    </button>
                                </nav>
                            )}
                        </>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
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
