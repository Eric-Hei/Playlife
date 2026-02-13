import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/types/database.types';
import { Shield, CheckCircle, XCircle, Building2, Target, Edit2, Save } from 'lucide-react';
import packageJson from '../../../package.json';

type Structure = Database['public']['Tables']['structures']['Row'];
type Mission = Database['public']['Tables']['missions']['Row'];

export default function Settings() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [pendingStructures, setPendingStructures] = useState<Structure[]>([]);
    const [allMissions, setAllMissions] = useState<Mission[]>([]);
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
        }
    }, [profile]);

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

    async function handleUpdateFundraisingUrl(missionId: string) {
        try {
            const { error } = await (supabase
                .from('missions') as any)
                .update({ fundraising_url: fundraisingUrl })
                .eq('id', missionId);

            if (error) throw error;

            alert('Lien de cagnotte mis à jour avec succès !');
            setEditingMission(null);
            setFundraisingUrl('');
            await fetchAllMissions();
        } catch (error: any) {
            console.error('Error updating mission:', error);
            alert(`Erreur: ${error.message}`);
        }
    }

    if (!profile?.is_super_admin) {
        return null;
    }

    return (
        <main className="p-8">
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
                <p className="text-gray-600">Gestion des structures et missions</p>
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
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-[#22081c] mb-2">{structure.name}</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-500">Contact:</span>
                                                <span className="ml-2 font-medium">{structure.contact_name}</span>
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
                                                <span className="ml-2 font-medium">{structure.city}, {structure.country}</span>
                                            </div>
                                            {structure.origin_info && (
                                                <div className="col-span-2">
                                                    <span className="text-gray-500">Origine:</span>
                                                    <p className="mt-1 text-gray-700 italic">{structure.origin_info}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleValidateStructure(structure.id, 'validée')}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                                            title="Valider"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Valider
                                        </button>
                                        <button
                                            onClick={() => handleValidateStructure(structure.id, 'refusée')}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
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
            <section>
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
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                                mission.status === 'completed'
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

                                        {/* Formulaire d'édition du lien de cagnotte */}
                                        {editingMission === mission.id && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Lien de la cagnotte
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        value={fundraisingUrl}
                                                        onChange={(e) => setFundraisingUrl(e.target.value)}
                                                        placeholder="https://..."
                                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e6244d] focus:border-transparent"
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateFundraisingUrl(mission.id)}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-[#e6244d] text-white rounded-lg text-sm font-medium hover:bg-[#c91d41] transition-colors"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        Enregistrer
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingMission(null);
                                                            setFundraisingUrl('');
                                                        }}
                                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {editingMission !== mission.id && (
                                        <button
                                            onClick={() => {
                                                setEditingMission(mission.id);
                                                setFundraisingUrl(mission.fundraising_url || '');
                                            }}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                            title="Modifier le lien de cagnotte"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Modifier cagnotte
                                        </button>
                                    )}
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
        </main>
    );
}


