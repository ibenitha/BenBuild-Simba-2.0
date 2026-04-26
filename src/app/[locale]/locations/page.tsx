import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LocationsPageContent from '@/components/locations/LocationsPageContent';

interface LocationsPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: LocationsPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: `${t('locations')} | Simba Supermarket`,
  };
}

export default function LocationsPage({ params: { locale } }: LocationsPageProps) {
  return <LocationsPageContent locale={locale} />;
}
