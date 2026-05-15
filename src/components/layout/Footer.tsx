import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { categories } from '@/lib/products';
import NewsletterForm from './NewsletterForm';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations('footer');

  const socials = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 mt-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 pr-0 lg:pr-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-simba-orange rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                <span className="text-white font-black text-xl">S</span>
              </div>
              <span className="font-black text-2xl text-white tracking-tight">SIMBA</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-sm">
              {t('tagline')} Rwanda&apos;s leading supermarket chain, now at your fingertips. Freshness guaranteed.
            </p>

            <div className="flex items-center gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:bg-simba-orange hover:text-white hover:border-simba-orange transition-all group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">{t('categories')}</h3>
            <ul className="space-y-3 text-sm">
              {categories.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <Link href={`/${locale}/category/${cat.slug}`} className="hover:text-simba-orange transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">{t('information')}</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-simba-orange transition-colors">{t('about')}</a></li>
              <li><a href="#" className="hover:text-simba-orange transition-colors">{t('deliveryPolicy')}</a></li>
              <li><Link href={`/${locale}/branch-dashboard`} className="hover:text-simba-orange transition-colors">{t('branchDashboard')}</Link></li>
              <li><Link href={`/${locale}/branch-reviews`} className="hover:text-simba-orange transition-colors">{t('branchReviews')}</Link></li>
              <li><a href="#" className="hover:text-simba-orange transition-colors">{t('contact')}</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-slate-900 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <p className="text-center sm:text-left">{t('copyright')}</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">🇷🇼 {t('madeInRwanda')}</span>
            <span className="text-simba-orange">{t('prices')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
