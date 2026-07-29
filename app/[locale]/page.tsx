import { useTranslations } from 'next-intl';
import { getLocale } from 'next-intl/server';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import QuickExit from '../../components/QuickExit';
import HotlineFinder from '../../components/HotlineFinder';
import SafetyPlanBuilder from '../../components/SafetyPlanBuilder';
import DarkModeToggle from '../../components/DarkModeToggle';
import MobileNav from '../../components/MobileNav';

function ShieldIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

export default async function HomePage() {
  const locale = await getLocale();
  return <HomePageContent locale={locale} />;
}

function HomePageContent({ locale }: { locale: string }) {
  const t = useTranslations();

  const navLinks = [
    { key: 'emergency', href: '#emergency' },
    { key: 'hotlines', href: '#hotlines' },
    { key: 'resources', href: '#resources' },
    { key: 'safety', href: '#safety' },
    { key: 'safety_plan', href: '#safety-plan' },
    { key: 'legal', href: '#legal' },
    { key: 'community', href: '#community' },
  ] as const;

  const mobileNavLinks = navLinks.map(({ key, href }) => ({ label: t(`nav.${key}`), href }));

  const resources = [
    { icon: '🏠', title: t('resources.domestic_violence'), desc: t('resources.domestic_violence_desc'), accent: 'rose' },
    { icon: '💜', title: t('resources.sexual_assault'), desc: t('resources.sexual_assault_desc'), accent: 'purple' },
    { icon: '🧠', title: t('resources.mental_health'), desc: t('resources.mental_health_desc'), accent: 'blue' },
    { icon: '⚖️', title: t('resources.legal_aid'), desc: t('resources.legal_aid_desc'), accent: 'amber' },
    { icon: '🏡', title: t('resources.shelter'), desc: t('resources.shelter_desc'), accent: 'green' },
    { icon: '💪', title: t('resources.economic'), desc: t('resources.economic_desc'), accent: 'teal' },
  ];

  const digitalTips = [
    t('safety.digital_1'), t('safety.digital_2'), t('safety.digital_3'),
    t('safety.digital_4'), t('safety.digital_5'), t('safety.digital_6'),
  ];

  const physicalTips = [
    t('safety.physical_1'), t('safety.physical_2'), t('safety.physical_3'),
    t('safety.physical_4'), t('safety.physical_5'), t('safety.physical_6'),
  ];

  const legalCards = [
    { icon: '🛡️', title: t('legal.protection_orders'), desc: t('legal.protection_orders_desc') },
    { icon: '💼', title: t('legal.workplace'), desc: t('legal.workplace_desc') },
    { icon: '✈️', title: t('legal.immigration'), desc: t('legal.immigration_desc') },
    { icon: '👩‍👧', title: t('legal.child_custody'), desc: t('legal.child_custody_desc') },
  ];

  const communityCards = [
    { icon: '💬', title: t('community.forum'), desc: t('community.forum_desc') },
    { icon: '🌟', title: t('community.stories'), desc: t('community.stories_desc') },
    { icon: '🤝', title: t('community.volunteer'), desc: t('community.volunteer_desc') },
    { icon: '❤️', title: t('community.donate'), desc: t('community.donate_desc') },
  ];

  return (
    <div className="min-h-screen bg-page text-body">
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        {t('a11y.skip_to_content')}
      </a>

      <QuickExit />

      {/* Emergency Banner */}
      <div className="bg-red-600 text-white py-2.5 px-4 text-center" role="alert" aria-live="polite">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
          <span className="font-semibold text-sm">🚨 {t('emergency.banner')}</span>
          <a
            href="tel:112"
            className="bg-white text-red-600 font-bold px-4 py-1 rounded-full text-xs hover:bg-red-50 transition-colors"
            aria-label="Call international emergency number 112"
          >
            📞 {t('emergency.international')}
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-purple-700 shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center ring-1 ring-white/20" aria-hidden="true">
              <ShieldIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-xl leading-none tracking-tight">{t('site.name')}</span>
              <p className="text-purple-300 text-xs hidden sm:block mt-0.5">{t('site.tagline')}</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                className="text-purple-200 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                {t(`nav.${key}`)}
              </a>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <DarkModeToggle />
            <LanguageSwitcher currentLocale={locale} />
            <MobileNav
              links={mobileNavLinks}
              menuLabel={t('a11y.menu_open')}
              closeLabel={t('a11y.menu_close')}
            />
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section
          className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-700 to-rose-600 text-white py-24 px-4"
          aria-labelledby="hero-heading"
        >
          {/* Decorative blobs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-purple-200 mb-6 animate-fade-up">
              <span aria-hidden="true">🌍</span>
              {t('hero.stat_3_value')} {t('hero.stat_3_label')}
            </div>

            <h1 id="hero-heading" className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight animate-fade-up animate-delay-100">
              {t('hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-purple-100 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up animate-delay-200">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up animate-delay-300">
              <a
                href="#emergency"
                className="bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-300 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 focus:outline-none"
              >
                🆘 {t('hero.cta_emergency')}
              </a>
              <a
                href="#resources"
                className="bg-white/10 hover:bg-white/20 focus:ring-4 focus:ring-white/30 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all hover:-translate-y-0.5 focus:outline-none"
              >
                {t('hero.cta_resources')}
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto" aria-label="Key statistics">
              {[
                { value: t('hero.stat_1_value'), label: t('hero.stat_1_label') },
                { value: t('hero.stat_2_value'), label: t('hero.stat_2_label') },
                { value: t('hero.stat_3_value'), label: t('hero.stat_3_label') },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-purple-300 text-xs sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Section */}
        <section id="emergency" className="py-16 px-4 bg-red-soft" aria-labelledby="emergency-heading">
          <div className="max-w-4xl mx-auto text-center">
            <h2 id="emergency-heading" className="text-3xl font-bold text-red-600 mb-3">{t('emergency.title')}</h2>
            <p className="text-muted mb-10 max-w-xl mx-auto">{t('emergency.subtitle')}</p>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {
                  icon: '📞',
                  title: t('emergency.international'),
                  cta: <a href="tel:112" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors focus:ring-4 focus:ring-red-300 focus:outline-none text-sm" aria-label="Call 112">Call 112</a>,
                },
                {
                  icon: '🆘',
                  title: t('emergency.crisis_line'),
                  cta: <p className="text-muted text-sm">24/7 — find your country below</p>,
                },
                {
                  icon: '🔒',
                  title: t('emergency.safe_word'),
                  cta: <p className="text-muted text-sm">{t('emergency.safe_word_desc')}</p>,
                },
              ].map((card) => (
                <div key={card.title} className="bg-card border border-theme rounded-2xl p-6 shadow-sm card-hover">
                  <div className="text-4xl mb-3" aria-hidden="true">{card.icon}</div>
                  <h3 className="font-bold text-body text-base mb-3">{card.title}</h3>
                  {card.cta}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hotlines */}
        <section id="hotlines" className="py-16 px-4 bg-page" aria-labelledby="hotlines-heading">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 id="hotlines-heading" className="text-3xl font-bold text-body mb-3">{t('hotlines.title')}</h2>
              <p className="text-muted">{t('hotlines.subtitle')}</p>
            </div>
            <HotlineFinder />
          </div>
        </section>

        {/* Resources */}
        <section id="resources" className="py-16 px-4 bg-subtle" aria-labelledby="resources-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 id="resources-heading" className="text-3xl font-bold text-body mb-3">{t('resources.title')}</h2>
              <p className="text-muted">{t('resources.subtitle')}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((r) => (
                <div
                  key={r.title}
                  className="bg-card border border-theme rounded-2xl p-6 card-hover"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 bg-subtle" aria-hidden="true">
                    {r.icon}
                  </div>
                  <h3 className="font-bold text-body text-lg mb-2">{r.title}</h3>
                  <p className="text-muted text-sm mb-4 leading-relaxed">{r.desc}</p>
                  <span className="text-purple-600 font-semibold text-sm">
                    {t('resources.learn_more')} →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Tips */}
        <section id="safety" className="py-16 px-4 bg-purple-soft" aria-labelledby="safety-heading">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 id="safety-heading" className="text-3xl font-bold text-body mb-3">{t('safety.title')}</h2>
              <p className="text-muted">{t('safety.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: '💻', title: t('safety.digital_title'), tips: digitalTips },
                { icon: '🛡️', title: t('safety.physical_title'), tips: physicalTips },
              ].map(({ icon, title, tips }) => (
                <div key={title} className="bg-card border border-theme rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl" aria-hidden="true">{icon}</span>
                    <h3 className="text-xl font-bold text-body">{title}</h3>
                  </div>
                  <ul className="space-y-3" role="list">
                    {tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 text-muted text-sm">
                        <span className="text-purple-500 mt-0.5 flex-shrink-0 font-bold" aria-hidden="true">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Plan Builder */}
        <section id="safety-plan" className="py-16 px-4 bg-page" aria-labelledby="plan-heading">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 id="plan-heading" className="text-3xl font-bold text-body mb-3">{t('safety_plan.title')}</h2>
              <p className="text-muted max-w-xl mx-auto">{t('safety_plan.subtitle')}</p>
            </div>
            <SafetyPlanBuilder />
          </div>
        </section>

        {/* Legal Rights */}
        <section id="legal" className="py-16 px-4 bg-subtle" aria-labelledby="legal-heading">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 id="legal-heading" className="text-3xl font-bold text-body mb-3">{t('legal.title')}</h2>
              <p className="text-muted">{t('legal.subtitle')}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              {legalCards.map((card) => (
                <div key={card.title} className="bg-card border border-theme rounded-2xl p-6 card-hover">
                  <div className="text-3xl mb-3" aria-hidden="true">{card.icon}</div>
                  <h3 className="font-bold text-body text-lg mb-2">{card.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 text-white font-semibold px-6 py-3 rounded-xl transition-colors focus:outline-none">
                {t('legal.find_lawyer')}
              </button>
              <button className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-4 focus:ring-purple-300 font-semibold px-6 py-3 rounded-xl transition-colors focus:outline-none">
                {t('legal.un_rights')}
              </button>
            </div>
          </div>
        </section>

        {/* Community */}
        <section
          id="community"
          className="py-16 px-4 bg-gradient-to-br from-purple-800 to-rose-600 text-white"
          aria-labelledby="community-heading"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 id="community-heading" className="text-3xl font-bold mb-3">{t('community.title')}</h2>
              <p className="text-purple-200">{t('community.subtitle')}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {communityCards.map((card) => (
                <div
                  key={card.title}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 card-hover"
                >
                  <div className="text-3xl mb-3" aria-hidden="true">{card.icon}</div>
                  <h3 className="font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-purple-200 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button className="bg-white text-purple-700 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-purple-50 focus:ring-4 focus:ring-white/50 transition-all shadow-xl hover:-translate-y-0.5 focus:outline-none">
                {t('community.join')}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                  <ShieldIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">{t('site.name')}</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">{t('footer.mission')}</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h3>
              <ul className="space-y-2 text-sm">
                {navLinks.map(({ key, href }) => (
                  <li key={key}>
                    <a href={href} className="hover:text-white transition-colors">{t(`nav.${key}`)}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-red-400 font-medium" role="alert">🚨 {t('footer.crisis')}</p>
            <p className="text-xs text-gray-600">© 2025 {t('site.name')}. {t('footer.rights')}.</p>
          </div>
          <p className="text-center text-xs text-gray-700 mt-4">{t('footer.escape_tip')}</p>
        </div>
      </footer>
    </div>
  );
}
