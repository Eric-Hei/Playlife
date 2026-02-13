import { Package, Plane, GraduationCap, Target, DollarSign, Heart, CheckCircle, Users, FileText, TrendingUp, ArrowRight } from 'lucide-react';

export default function Impact() {
    return (
        <div className="px-4 md:px-8 py-4 md:py-6 border-t border-gray-100">
            {/* Header */}
            <div className="mb-8 md:mb-12">
                <h1 className="text-3xl md:text-5xl font-bold text-[#22081c] leading-tight mb-3 md:mb-4">
                    Parcours Playlife
                </h1>
                <p className="text-base md:text-xl text-gray-600 max-w-4xl">
                    Playlife Connect vous permet de mener une action concrète pour les enfants du monde entier.
                </p>
            </div>

            {/* Bloc 1: Qu'est-ce qu'un pack Playlife ? */}
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm hover:shadow-md transition-shadow border border-gray-100 mb-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-7 h-7 text-[#e6244d]" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#22081c] mb-2">Qu'est-ce qu'un pack Playlife ?</h2>
                        <div className="w-16 h-1 bg-[#e6244d] rounded-full"></div>
                    </div>
                </div>

                <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p className="text-base md:text-lg">
                        Un pack Playlife, c'est du matériel sportif simple, durable et immédiatement utilisable pour permettre à des enfants de jouer, s'entraîner et partager des moments collectifs.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-6 my-6">
                        <h3 className="font-bold text-[#22081c] mb-4 text-lg">En général, un pack comprend :</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-[#e6244d] rounded-full mt-2 flex-shrink-0"></span>
                                <span><strong>8 à 12 ballons</strong> (football, basketball, volleyball… selon les besoins locaux)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-[#e6244d] rounded-full mt-2 flex-shrink-0"></span>
                                <span><strong>Des chasubles</strong> pour organiser des équipes</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-[#e6244d] rounded-full mt-2 flex-shrink-0"></span>
                                <span><strong>Des plots</strong> pour structurer les ateliers et les exercices</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-[#e6244d] rounded-full mt-2 flex-shrink-0"></span>
                                <span><strong>Des pompes et aiguilles</strong> pour garantir l'autonomie et la durabilité du matériel</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-pink-50 rounded-xl p-6 border-l-4 border-[#e6244d]">
                        <p className="font-semibold text-[#22081c] mb-2">💰 Valeur estimée</p>
                        <p className="text-gray-700">Environ <strong>250€ de matériel</strong> + <strong>50€ de livraison</strong> (ou bagage supplémentaire)</p>
                    </div>

                    <p className="text-base md:text-lg font-medium text-[#22081c] pt-4">
                        🎯 <strong>L'objectif :</strong> permettre à une structure locale (école, association, centre…) d'organiser des séances sportives complètes dès la réception du pack.
                    </p>
                </div>
            </div>

            {/* Bloc 2: Voyageur solidaire */}
            <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-6 md:p-10 shadow-sm hover:shadow-md transition-shadow border border-pink-100 mb-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 bg-[#e6244d] rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Plane className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#22081c] mb-2">Voyageur solidaire</h2>
                        <p className="text-lg text-gray-600 italic">Transforme ton déplacement en action utile</p>
                        <div className="w-16 h-1 bg-[#e6244d] rounded-full mt-3"></div>
                    </div>
                </div>

                <p className="text-base md:text-lg text-gray-700 mb-6">
                    Tu pars à l'étranger pour le travail ou les vacances ? En quelques étapes, tu peux créer une mission Playlife.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Step 1 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="w-10 h-10 bg-[#e6244d] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">1</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Crée ton compte</h3>
                        <p className="text-sm text-gray-600">Ton espace personnel en 2 minutes.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="w-10 h-10 bg-[#e6244d] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">2</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Déclare ta mission</h3>
                        <p className="text-sm text-gray-600">Pays, date, structure bénéficiaire (ou tu en proposes une), type de pack.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="w-10 h-10 bg-[#e6244d] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">3</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Lance ta cagnotte sur Leetchi.org</h3>
                        <p className="text-sm text-gray-600 mb-3">Tu crées une cagnotte dédiée à ton projet : <a href="https://www.leetchi.org/project/playlife" target="_blank" rel="noopener noreferrer" className="text-[#e6244d] hover:underline">leetchi.org/project/playlife</a></p>
                        <p className="text-xs text-gray-500 italic">et Renseigne le lien généré dans Playlife Connect. Ta mission est officiellement référencée.</p>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="w-10 h-10 bg-[#e6244d] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">4</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Mobilise ton entourage</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Un lien à partager.</li>
                            <li>• Un objectif clair.</li>
                            <li>• Un impact mesurable.</li>
                        </ul>
                    </div>

                    {/* Step 5 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="w-10 h-10 bg-[#e6244d] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">5</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Objectif atteint ? On passe à l'action.</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Le matériel est acheté et envoyé à ton adresse.</li>
                            <li>• Tu reçois les consignes et documents administratifs.</li>
                        </ul>
                    </div>

                    {/* Step 6 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="w-10 h-10 bg-[#e6244d] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">6</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Remise du pack à la structure locale</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Organisation avec la structure de la rencontre (date et lieu précis)</li>
                            <li>• Rencontre et remise</li>
                        </ul>
                    </div>

                    {/* Step 7 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="w-10 h-10 bg-[#e6244d] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">7</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Inspire les autres</h3>
                        <p className="text-sm text-gray-600">Photos. Témoignages. Émotions.<br />Tu deviens un Playlife Player.</p>
                    </div>
                </div>
            </div>

            {/* Bloc 3: Enseignant / Animateur */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-10 shadow-sm hover:shadow-md transition-shadow border border-gray-200 mb-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 bg-[#22081c] rounded-2xl flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#22081c] mb-2">Enseignant / Animateur</h2>
                        <p className="text-lg text-gray-600 italic">Fais vivre la solidarité à ton groupe</p>
                        <div className="w-16 h-1 bg-[#22081c] rounded-full mt-3"></div>
                    </div>
                </div>

                <p className="text-base md:text-lg text-gray-700 mb-6">
                    Tu encadres des enfants ou des adolescents ? Transforme ton projet pédagogique en mission solidaire concrète.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Step 1 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-[#22081c] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">1</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Crée ton compte</h3>
                        <p className="text-sm text-gray-600">Ton espace personnel en 2 minutes.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-[#22081c] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">2</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Création de mission</h3>
                        <p className="text-sm text-gray-600">Pays, date, structure bénéficiaire (ou tu en proposes une), type de pack.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-[#22081c] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">3</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Création de la cagnotte sur Leetchi.org</h3>
                        <p className="text-sm text-gray-600 mb-3">La cagnotte est créée au nom du projet solidaire, rattachée à Playlife : <a href="https://www.leetchi.org/project/playlife" target="_blank" rel="noopener noreferrer" className="text-[#e6244d] hover:underline">leetchi.org/project/playlife</a></p>
                        <p className="text-xs text-gray-500 italic">et Ajout du lien dans Playlife Connect. Le lien doit être intégré dans la mission pour assurer la traçabilité.</p>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-[#22081c] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">4</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Mobilisation pédagogique</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Implication des élèves</li>
                            <li>• Communication aux familles</li>
                            <li>• Sensibilisation à la solidarité</li>
                        </ul>
                    </div>

                    {/* Step 5 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-[#22081c] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">5</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Objectif atteint → commande et envoi</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Achat du matériel et envoyé au responsable de la mission</li>
                            <li>• Création du pack avec les élèves (+ messages et autres dons supplémentaires)</li>
                            <li>• Organisation logistique</li>
                            <li>• Génération des documents nécessaires</li>
                        </ul>
                    </div>

                    {/* Step 6 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-[#22081c] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">6</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Envoi du pack à la structure choisie</h3>
                        <p className="text-sm text-gray-600">Le pack est envoyé directement à la structure bénéficiaire.</p>
                    </div>

                    {/* Step 7 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-[#22081c] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">7</div>
                        <h3 className="font-bold text-[#22081c] mb-2">Retour d'impact</h3>
                        <p className="text-sm text-gray-600">Les élèves visualisent concrètement le résultat de leur engagement.</p>
                    </div>
                </div>
            </div>

            {/* Bloc 4: Une cagnotte simple. Un impact transparent. */}
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm hover:shadow-md transition-shadow border border-gray-100 mb-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#22081c] mb-2">Une cagnotte simple. Un impact transparent.</h2>
                        <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
                    </div>
                </div>

                <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p className="text-base md:text-lg">
                        Chaque porteur de mission crée sa cagnotte sur <a href="https://www.leetchi.org/project/playlife" target="_blank" rel="noopener noreferrer" className="text-[#e6244d] hover:underline font-semibold">Leetchi.org</a>.
                    </p>

                    <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="font-bold text-[#22081c] mb-4">Le lien est intégré dans Playlife Connect pour garantir :</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span><strong>La traçabilité</strong></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span><strong>La cohérence avec la mission</strong></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span><strong>L'utilisation conforme des fonds</strong></span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bloc 5: Des dons déductibles des impôts */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 md:p-10 shadow-sm hover:shadow-md transition-shadow border border-green-100 mb-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#22081c] mb-2">Des dons déductibles des impôts</h2>
                        <div className="w-16 h-1 bg-green-600 rounded-full"></div>
                    </div>
                </div>

                <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p className="text-base md:text-lg font-semibold text-green-800">
                        Playlife dispose d'un rescrit fiscal.
                    </p>

                    <div className="bg-white rounded-xl p-6 border-2 border-green-200">
                        <h3 className="font-bold text-[#22081c] mb-4">Les donateurs bénéficient :</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                                <span>d'une <strong>réduction d'impôt de 66 %</strong> (60% pour les entreprises)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                                <span>dans la limite légale de <strong>20 % du revenu imposable</strong></span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-green-100 rounded-xl p-6 border-l-4 border-green-600">
                        <p className="font-semibold text-green-900 mb-2">💡 Exemple concret</p>
                        <p className="text-gray-800">Un don de <strong>100 €</strong> revient en réalité à <strong>34 €</strong> après déduction.</p>
                    </div>

                    <p className="text-sm text-gray-600 italic">
                        Les reçus fiscaux sont émis dans le respect du cadre réglementaire.
                    </p>
                </div>
            </div>

            {/* Bloc 6: Pourquoi Playlife Connect ? */}
            <div className="bg-gradient-to-br from-[#22081c] to-[#3a1530] rounded-2xl p-6 md:p-10 shadow-xl text-white mb-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 bg-[#e6244d] rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Heart className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">Pourquoi Playlife Connect ?</h2>
                        <div className="w-16 h-1 bg-[#e6244d] rounded-full"></div>
                    </div>
                </div>

                <div className="space-y-6">
                    <p className="text-lg md:text-xl text-white/90 font-medium">Parce que :</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                            <Plane className="w-8 h-8 text-[#e6244d] mb-3" />
                            <p className="text-white font-medium">Un voyage peut devenir une action solidaire</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                            <GraduationCap className="w-8 h-8 text-[#e6244d] mb-3" />
                            <p className="text-white font-medium">Un projet scolaire peut changer des vies</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                            <Users className="w-8 h-8 text-[#e6244d] mb-3" />
                            <p className="text-white font-medium">Un simple partage peut financer un pack sportif</p>
                        </div>
                    </div>

                    <div className="bg-[#e6244d]/20 backdrop-blur rounded-xl p-6 md:p-8 border border-[#e6244d]/30 mt-8">
                        <p className="text-xl md:text-2xl font-bold text-white mb-3">
                            Playlife Connect, c'est une plateforme pour agir.
                        </p>
                        <p className="text-lg text-white/90">
                            Simplement. Concrètement. Ensemble.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

