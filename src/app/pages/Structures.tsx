import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type Structure = Database['public']['Tables']['structures']['Row'];

export default function Structures() {
    const [structures, setStructures] = useState<Structure[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStructures() {
            const { data, error } = await supabase
                .from('structures')
                .select('*')
                .order('name');

            if (error) {
                console.error('Error fetching structures:', error);
            } else {
                setStructures(data || []);
            }
            setLoading(false);
        }

        fetchStructures();
    }, []);

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold text-[#22081c] mb-6">Structures Partenaires</h1>

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
                            <div className="pt-4 border-t border-gray-50 flex flex-col gap-2">
                                {structure.city && structure.country && (
                                    <p className="text-xs text-gray-500">📍 {structure.city}, {structure.country}</p>
                                )}
                                {structure.website_url && (
                                    <a href={structure.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#e6244d] hover:underline font-medium">
                                        Visiter le site web
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
        </main>
    );
}
