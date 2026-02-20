import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { StructureForm } from '@/app/components/StructureForm';
import { Plus } from 'lucide-react';

type Structure = Database['public']['Tables']['structures']['Row'];

export default function Structures() {
    const [structures, setStructures] = useState<Structure[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        fetchStructures();
    }, []);

    async function fetchStructures() {
        const { data, error } = await supabase
            .from('structures')
            .select('*')
            .eq('status', 'validée')
            .order('name');

        if (error) {
            console.error('Error fetching structures:', error);
        } else {
            setStructures(data || []);
        }
        setLoading(false);
    }

    return (
        <main className="px-4 md:px-8 py-4 md:py-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-[#22081c]">Structures Partenaires</h1>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-[#e6244d] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#c91d41] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Proposer une structure
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e6244d]"></div>
                </div>
            ) : structures.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {structures.map((structure) => (
                        <div key={structure.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 mb-4">
                                {structure.image_url ? (
                                    <img src={structure.image_url} alt={structure.name} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 bg-[#e6244d]/10 rounded-full flex items-center justify-center text-[#e6244d] font-bold">
                                        {structure.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-[#22081c]">{structure.name}</h3>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{structure.type}</span>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm flex-1 mb-4">{structure.description}</p>
                            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                                <div className="space-y-1">
                                    {(structure as any).address && (
                                        <p className="text-xs text-gray-500">📍 {(structure as any).address}</p>
                                    )}
                                    {((structure as any).postal_code || structure.city || structure.country) && (
                                        <p className="text-xs text-gray-500 ml-4">
                                            {(structure as any).postal_code} {structure.city}{structure.city && structure.country ? ', ' : ''}{structure.country}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1 pt-2">
                                    {structure.contact_name && (
                                        <p className="text-xs text-gray-600 font-bold">👤 {structure.contact_name}</p>
                                    )}
                                    {structure.contact_email && (
                                        <p className="text-xs text-gray-500">📧 {structure.contact_email}</p>
                                    )}
                                    {(structure as any).contact_phone && (
                                        <p className="text-xs text-gray-500">📞 {(structure as any).contact_phone}</p>
                                    )}
                                </div>

                                {structure.website_url && (
                                    <a href={structure.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#e6244d] hover:underline font-bold mt-1 inline-flex items-center gap-1">
                                        Visiter le site web →
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-600 mb-4">Aucune structure partenaire n'a été trouvée.</p>
                    <p className="text-sm text-gray-400">Ajoutez-les directement depuis votre tableau de bord Supabase.</p>
                </div>
            )}

            {/* Modal de formulaire */}
            {isFormOpen && (
                <StructureForm
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={fetchStructures}
                />
            )}
        </main>
    );
}
