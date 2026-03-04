import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const TO_EMAIL = 'missions@playlife.today';
const FROM_EMAIL = 'noreply@playlife.today';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    try {
        const { missionTitle, missionId } = await req.json();

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
                    <p>Connectez-vous à l'administration Playlife pour valider ou refuser cette mission.</p>
                    <p><a href="https://playlife.today/settings">Accéder à l'administration</a></p>
                `,
            }),
        });

        if (!res.ok) {
            const body = await res.text();
            console.error('Resend error:', body);
            return new Response(JSON.stringify({ sent: false, error: body }), { status: 500 });
        }

        return new Response(JSON.stringify({ sent: true }), { status: 200 });
    } catch (err) {
        console.error('Edge function error:', err);
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
    }
});

