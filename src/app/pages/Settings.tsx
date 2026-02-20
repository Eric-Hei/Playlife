import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/types/database.types';
import { Shield, CheckCircle, XCircle, Building2, Target, Edit2, Save, TrendingUp, Send } from 'lucide-react';
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
                .single();

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

    async function handleEditMission(mission: any) {
        setSelectedMission(mission);
        setShowMissionForm(true);
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
