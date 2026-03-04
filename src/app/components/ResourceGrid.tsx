import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, Send, CheckCircle, Target, DollarSign, Plane, GraduationCap, Package } from 'lucide-react';
import photo1 from '@/assets/f399f68985e7900257d342fc0c1a4ab4f702eefe.png';
import photo2 from '@/assets/4e531e27501e1b1580ce8c44771efd6b2cf317e3.png';
import photo3 from '@/assets/91b18a520ccc545782d867796a103855745c2162.png';
import { AuthCard } from './AuthCard';
import { MissionForm } from './MissionForm';
import { useAuth } from '@/contexts/AuthContext';

export function ResourceGrid() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [slideshowPhotos, setSlideshowPhotos] = useState<string[]>([]);
  const [impactMetrics, setImpactMetrics] = useState({
    value1: '23',
    label1: 'structures aidées',
    value2: '580',
    label2: 'enfants aidés'
  });

  useEffect(() => {
    fetchImpactMetrics();
    fetchSlideshowPhotos();
  }, []);

  const fetchSlideshowPhotos = async () => {
    try {
      const { data } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'slideshow_photos')
        .maybeSingle();
      if (data && Array.isArray((data as any).value) && (data as any).value.length > 0) {
        setSlideshowPhotos((data as any).value);
      }
    } catch {
      // Utilise les photos par défaut si pas de config
    }
  };

  const fetchImpactMetrics = async () => {
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
  };

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => {
      clearInterval(interval);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const photos = slideshowPhotos.length > 0 ? slideshowPhotos : [photo1, photo2, photo3];

  return (
    <>
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

          {/* Carousel - Large */}
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            role="region"
            aria-label="Diaporama des missions Playlife"
          >
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex" aria-live="polite" aria-atomic="true">
                {photos.map((photo, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0" aria-hidden={index !== selectedIndex}>
                    <img
                      src={photo}
                      alt={`Photo de mission Playlife ${index + 1} sur ${photos.length}`}
                      className="w-full h-[250px] md:h-[400px] object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 md:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-1 bg-[#e6244d] rounded-full mb-3 md:mb-4" aria-hidden="true"></div>
                  <h3 className="text-base md:text-lg font-semibold text-[#22081c] mb-1 md:mb-2">Nos missions en images</h3>
                  <p className="text-xs md:text-sm text-gray-600">Découvrez l'impact de vos actions</p>
                </div>
                <div className="flex gap-2" role="tablist" aria-label="Navigation du diaporama">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      role="tab"
                      aria-selected={index === selectedIndex}
                      aria-label={`Diapositive ${index + 1} sur ${photos.length}`}
                      className={`w-2 h-2 rounded-full transition-all ${index === selectedIndex ? 'bg-[#e6244d] w-8' : 'bg-gray-300'
                        }`}
                      onClick={() => emblaApi?.scrollTo(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Two Cards Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Card - Voyageurs solidaires */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-[#22081c]">Voyageurs solidaires</h3>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
              </div>

              <div className="w-12 h-1 bg-[#e6244d] rounded-full mb-4 md:mb-6" aria-hidden="true"></div>

              <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#e6244d] rounded-full mt-1.5 flex-shrink-0" aria-hidden="true"></span>
                  <span>Vous voyagez (perso ou pro)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#e6244d] rounded-full mt-1.5 flex-shrink-0" aria-hidden="true"></span>
                  <span>Vous transportez un pack Playlife</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#e6244d] rounded-full mt-1.5 flex-shrink-0" aria-hidden="true"></span>
                  <span>Vous le livrez localement</span>
                </li>
              </ul>

              <div className="bg-pink-50 rounded-xl p-6 flex items-center justify-center h-20 md:h-24" aria-hidden="true">
                <Plane className="w-10 h-10 md:w-12 md:h-12 text-[#e6244d]" />
              </div>

              <button
                onClick={() => user ? setShowMissionForm(true) : navigate('/login?create=true')}
                className="w-full mt-4 md:mt-6 px-6 py-2.5 md:py-3 bg-[#e6244d] text-white rounded-lg hover:bg-[#d11d42] transition-colors text-sm font-medium text-center"
              >
                Créer une mission
              </button>
            </div>

            {/* Card - Animateurs */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-[#22081c]">Animateurs / Enseignants</h3>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
              </div>

              <div className="w-12 h-1 bg-[#22081c] rounded-full mb-4 md:mb-6" aria-hidden="true"></div>

              <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#22081c] rounded-full mt-1.5 flex-shrink-0" aria-hidden="true"></span>
                  <span>Vous encadrez un groupe d'enfants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#22081c] rounded-full mt-1.5 flex-shrink-0" aria-hidden="true"></span>
                  <span>Vous créez des packs sportifs avec eux</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#22081c] rounded-full mt-1.5 flex-shrink-0" aria-hidden="true"></span>
                  <span>Livraison via une structure partenaire</span>
                </li>
              </ul>

              <div className="bg-gray-100 rounded-xl p-6 flex items-center justify-center h-20 md:h-24" aria-hidden="true">
                <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-[#22081c]" />
              </div>

              <button
                onClick={() => user ? setShowMissionForm(true) : navigate('/login?create=true')}
                className="w-full mt-4 md:mt-6 px-6 py-2.5 md:py-3 bg-[#22081c] text-white rounded-lg hover:bg-[#1a0616] transition-colors text-sm font-medium text-center"
              >
                Créer une mission
              </button>
            </div>
          </div>

          {/* Comment ça marche - Full width with all info */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-start justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-[#22081c] mb-2">Comment ça marche</h3>
                <p className="text-xs md:text-sm text-gray-600 italic">Participez à ces étapes avec l'accompagnement de Playlife.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
            </div>

            <div className="w-12 h-1 bg-[#e6244d] rounded-full mb-6 md:mb-8" aria-hidden="true"></div>

            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 list-none">
              <li className="text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4" aria-hidden="true">
                  <Target className="w-7 h-7 md:w-8 md:h-8 text-[#e6244d]" />
                </div>
                <div className="w-10 h-10 bg-[#e6244d] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold" aria-hidden="true">1</div>
                <h4 className="font-semibold text-[#22081c] mb-2 text-sm">Créer une mission</h4>
                <p className="text-xs text-gray-600">Définissez votre projet et vos objectifs</p>
              </li>

              <li className="text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4" aria-hidden="true">
                  <DollarSign className="w-7 h-7 md:w-8 md:h-8 text-[#e6244d]" />
                </div>
                <div className="w-10 h-10 bg-[#e6244d] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold" aria-hidden="true">2</div>
                <h4 className="font-semibold text-[#22081c] mb-2 text-sm">Lancer une collecte</h4>
                <p className="text-xs text-gray-600">Financez l'achat du matériel sportif</p>
              </li>

              <li className="text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4" aria-hidden="true">
                  <Package className="w-7 h-7 md:w-8 md:h-8 text-[#e6244d]" />
                </div>
                <div className="w-10 h-10 bg-[#e6244d] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold" aria-hidden="true">3</div>
                <h4 className="font-semibold text-[#22081c] mb-2 text-sm">Constituer le pack</h4>
                <p className="text-xs text-gray-600">à partir du matériel reçu</p>
              </li>

              <li className="text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4" aria-hidden="true">
                  <Send className="w-7 h-7 md:w-8 md:h-8 text-[#e6244d]" />
                </div>
                <div className="w-10 h-10 bg-[#e6244d] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold" aria-hidden="true">4</div>
                <h4 className="font-semibold text-[#22081c] mb-2 text-sm">Livrer/envoyer le pack</h4>
                <p className="text-xs text-gray-600">Remettez-le à une structure locale</p>
              </li>

              <li className="text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4" aria-hidden="true">
                  <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-[#e6244d]" />
                </div>
                <div className="w-10 h-10 bg-[#e6244d] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold" aria-hidden="true">5</div>
                <h4 className="font-semibold text-[#22081c] mb-2 text-sm">Partager les souvenirs</h4>
                <p className="text-xs text-gray-600">Montrez l'impact de votre mission</p>
              </li>
            </ol>

            <div className="mt-6 md:mt-8 pt-6 border-t border-gray-100">
              <Link to="/impact" className="text-[#e6244d] hover:text-[#d11d42] transition-colors text-sm font-medium inline-flex items-center gap-2">
                En savoir plus sur le processus
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column - Impact Stats (dark) - 1/3 width on desktop */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-6 space-y-6">
            {/* Auth Card - Desktop only (mobile at top) */}
            {!user && (
              <div className="hidden lg:block">
                <AuthCard />
              </div>
            )}

            {/* Impact Card */}
            <div className="bg-[#22081c] rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow text-white">
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold">Impact</h3>
                <ArrowRight className="w-5 h-5 text-white/60" aria-hidden="true" />
              </div>

              <div className="w-12 h-1 bg-[#e6244d] rounded-full mb-6 md:mb-8"></div>

              <div className="space-y-6 md:space-y-8">
                <div>
                  <div className="text-4xl md:text-6xl font-bold mb-2">{impactMetrics.value1}</div>
                  <p className="text-white/70 text-sm md:text-base">{impactMetrics.label1}</p>
                </div>

                <div>
                  <div className="text-4xl md:text-6xl font-bold mb-2">{impactMetrics.value2}</div>
                  <p className="text-white/70 text-sm md:text-base">{impactMetrics.label2}</p>
                </div>
              </div>

              <div className="mt-8 md:mt-12 bg-white/10 rounded-xl p-4 md:p-6">
                <Link
                  to="/missions"
                  className="w-full px-6 py-2.5 md:py-3 bg-[#e6244d] text-white rounded-lg hover:bg-[#d11d42] transition-colors text-sm font-medium text-center block"
                >
                  Voir les missions
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    {showMissionForm && (
      <MissionForm
        onClose={() => setShowMissionForm(false)}
        onSuccess={() => {
          setShowMissionForm(false);
          navigate('/dashboard');
        }}
      />
    )}
  </>
  );
}
