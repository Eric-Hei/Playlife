import { Mail, Phone, MapPin, Building2, FileText, ArrowRight } from 'lucide-react';
import { AuthCard } from '../components/AuthCard';

export default function Contact() {
    return (
        <div className="px-4 md:px-8 py-4 md:py-6 border-t border-gray-100">
            {/* Header with title */}
            <div className="mb-6 md:mb-10">
                <h1 className="text-2xl md:text-4xl font-bold text-[#22081c] leading-tight max-w-3xl mb-2 md:mb-3">
                    Organisez une mission Playlife simplement.
                </h1>
                <p className="text-sm md:text-base text-gray-600 italic">
                    Deux façons d'aider les enfants grâce au sport en tant que voyageurs ou animateurs/instituteurs.
                </p>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Auth Card - Mobile top */}
                <div className="lg:hidden">
                    <AuthCard />
                </div>

                {/* Left Column - 2/3 width on desktop */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Contact Information Card - Full width */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                        <div className="flex items-start justify-between mb-4 md:mb-6">
                            <div>
                                <h3 className="text-xl md:text-2xl font-semibold text-[#22081c] mb-2">Rentrons en contact</h3>
                                <p className="text-xs md:text-sm text-gray-600 italic">N'hésitez pas à me contacter pour toute précision ou renseignement</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>

                        <div className="w-12 h-1 bg-[#e6244d] rounded-full mb-6 md:mb-8"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Contact Person */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#e6244d] shrink-0">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Contact</p>
                                    <p className="font-bold text-[#22081c]">Christophe Grassi</p>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Adresse</p>
                                    <p className="font-bold text-[#22081c]">151 rue de la Fouillade</p>
                                    <p className="font-bold text-[#22081c]">34820 Teyran</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Téléphone</p>
                                    <a href="tel:+33663070435" className="font-bold text-[#22081c] hover:text-[#e6244d] transition-colors">
                                        +33 6 63 07 04 35
                                    </a>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#e6244d] shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Email</p>
                                    <a
                                        href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#112;&#108;&#97;&#121;&#108;&#105;&#102;&#101;&#45;&#99;&#111;&#110;&#110;&#101;&#99;&#116;&#64;&#112;&#108;&#97;&#121;&#108;&#105;&#102;&#101;&#46;&#116;&#111;&#100;&#97;&#121;"
                                        className="font-bold text-[#22081c] hover:text-[#e6244d] transition-colors"
                                    >
                                        playlife-connect@playlife.today
                                    </a>
                                </div>
                            </div>

                            {/* Legal Info */}
                            <div className="md:col-span-2 flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 shrink-0">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Informations légales</p>
                                    <p className="font-bold text-[#22081c]">Association loi 1901</p>
                                    <p className="text-sm text-gray-600">Siret : 99125290900015</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column - Impact Stats (dark) - 1/3 width on desktop */}
                <div className="lg:col-span-4">
                    <div className="lg:sticky lg:top-6 space-y-6">
                        {/* Auth Card - Desktop only (mobile at top) */}
                        <div className="hidden lg:block">
                            <AuthCard />
                        </div>

                        {/* Impact Card */}
                        <div className="bg-[#22081c] rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow text-white">
                            <div className="flex items-start justify-between mb-4 md:mb-6">
                                <h3 className="text-lg md:text-xl font-semibold">Impact</h3>
                                <ArrowRight className="w-5 h-5 text-white/60" />
                            </div>

                            <div className="w-12 h-1 bg-[#e6244d] rounded-full mb-6 md:mb-8"></div>

                            <div className="space-y-6 md:space-y-8">
                                <div>
                                    <div className="text-4xl md:text-6xl font-bold mb-2">23</div>
                                    <p className="text-white/70 text-sm md:text-base">structures aidées</p>
                                </div>

                                <div>
                                    <div className="text-4xl md:text-6xl font-bold mb-2">580</div>
                                    <p className="text-white/70 text-sm md:text-base">enfants aidés</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
