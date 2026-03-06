import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY  = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const TO_EMAIL   = 'missions@playlife.today';
const FROM_EMAIL = 'noreply@playlife.today';

const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

serve(async (req) => {
    // Preflight CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // 1. Vérifier la méthode HTTP
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    // 2. Vérifier la présence du JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const jwt = authHeader.replace('Bearer ', '');

    // 3. Valider le JWT et récupérer l'utilisateur
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        // 4. Valider le payload
        const body = await req.json();
        const { missionTitle, missionId } = body;

        if (!missionTitle || typeof missionTitle !== 'string' || !missionTitle.trim()) {
            return new Response(JSON.stringify({ error: 'missionTitle est requis' }), { status: 400 });
        }
        if (!missionId || typeof missionId !== 'string') {
            return new Response(JSON.stringify({ error: 'missionId est requis' }), { status: 400 });
        }

        // 5. Vérifier que la mission appartient bien à l'appelant
        const { data: mission, error: missionError } = await supabase
            .from('missions')
            .select('created_by')
            .eq('id', missionId)
            .single();

        if (missionError || !mission) {
            return new Response(JSON.stringify({ error: 'Mission introuvable' }), { status: 404 });
        }
        if (mission.created_by !== user.id) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }

        // 6. Envoyer l'email de notification
        if (!RESEND_API_KEY) {
            console.warn('RESEND_API_KEY non configurée — email non envoyé');
            return new Response(JSON.stringify({ sent: false, reason: 'no_api_key' }), { status: 200 });
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: TO_EMAIL,
                subject: `[Playlife] Nouvelle mission à modérer : ${missionTitle}`,
                html: `
                    <h2>Nouvelle mission en attente de modération</h2>
                    <p><strong>Titre :</strong> ${missionTitle}</p>
                    <p><strong>ID :</strong> ${missionId}</p>
                    <p><strong>Créateur :</strong> ${user.email ?? user.id}</p>
                    <p>Connectez-vous à l'administration Playlife pour valider ou refuser cette mission.</p>
                    <p><a href="https://playlife.today/settings">Accéder à l'administration</a></p>
                `,
            }),
        });

        if (!res.ok) {
            const bodyText = await res.text();
            console.error('Resend error:', bodyText);
            return new Response(JSON.stringify({ sent: false, error: bodyText }), { status: 500 });
        }

        return new Response(JSON.stringify({ sent: true }), { status: 200 });

    } catch (err) {
        console.error('Edge function error:', err);
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
    }
});

