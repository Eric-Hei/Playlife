-- Création de la table pour la configuration du site (bloc impact, etc)
CREATE TABLE IF NOT EXISTS public.site_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Activation de RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour tous
CREATE POLICY "Allow public read-only access" ON public.site_config
    FOR SELECT USING (true);

-- Politique d'écriture pour les super admins
-- On utilise la table profiles pour vérifier le rôle
CREATE POLICY "Allow super admin all access" ON public.site_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_super_admin = true
        )
    );

-- Insertion des valeurs par défaut pour l'impact
INSERT INTO public.site_config (key, value)
VALUES (
    'impact_metrics',
    JSONB_BUILD_OBJECT(
        'value1', '23',
        'label1', 'structures aidées',
        'value2', '580',
        'label2', 'enfants aidés'
    )
)
ON CONFLICT (key) DO NOTHING;
