import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { categories } from '@/lib/products';

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations('footer');
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-simba-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-white">Simba</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('tagline')}
            </p>
            <div className="mt-4 space-y-1 text-sm">
              <p>📞 +250 788 000 000</p>
              <p>📧 hello@simbasupermarket.rw</p>
              <p>📍 Kigali, Rwanda</p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('categories')}</h3>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <Link href={`/${locale}/category/${cat.slug}`} className="hover:text-simba-orange-light transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More categories */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('more')}</h3>
            <ul className="space-y-2 text-sm">
              {categories.slice(5).map(cat => (
                <li key={cat.id}>
                  <Link href={`/${locale}/category/${cat.slug}`} className="hover:text-simba-orange-light transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('information')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-simba-orange-light transition-colors">{t('about')}</a></li>
              <li><a href="#" className="hover:text-simba-orange-light transition-colors">{t('deliveryPolicy')}</a></li>
              <li><a href="#" className="hover:text-simba-orange-light transition-colors">{t('privacyPolicy')}</a></li>
              <li><a href="#" className="hover:text-simba-orange-light transition-colors">{t('terms')}</a></li>
              <li><a href="#" className="hover:text-simba-orange-light transition-colors">{t('contact')}</a></li>
              <li><Link href={`/${locale}/branch-dashboard`} className="hover:text-simba-orange-light transition-colors">{t('branchDashboard')}</Link></li>
              <li><Link href={`/${locale}/branch-reviews`} className="hover:text-simba-orange-light transition-colors">{t('branchReviews')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>{t('copyright')}</p>
          <div className="flex items-center gap-4">
            <span>🇷🇼 {t('madeInRwanda')}</span>
            <span>{t('prices')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
