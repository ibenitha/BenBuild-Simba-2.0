'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { simbaBranches, Branch } from '@/lib/branches';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation, Search, Globe, ChevronRight, Map as MapIcon } from 'lucide-react';
import { useState, useRef } from 'react';

interface LocationsPageContentProps {
  locale: string;
}

export default function LocationsPageContent({ locale }: LocationsPageContentProps) {
  const tNav = useTranslations('nav');
  const t = useTranslations('locationsPage');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(simbaBranches[0]);
  const mapRef = useRef<HTMLDivElement>(null);

  const filteredBranches = simbaBranches.filter(branch => 
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewOnMap = (branch: Branch) => {
    setSelectedBranch(branch);
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // OSM Bounding box calculation for the iframe
  const getOSMUrl = (lat: number, lng: number) => {
    const delta = 0.005;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta},${lat - delta},${lng + delta},${lat + delta}&layer=mapnik&marker=${lat},${lng}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-simba-orange rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-600 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-3 py-1 bg-simba-orange/20 text-simba-orange text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4 border border-simba-orange/30">
              {t('eyebrow')}
            </span>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">
              {t('title')}
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              {t('subtitle')}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-10 max-w-xl mx-auto relative"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-simba-orange focus:border-transparent backdrop-blur-md transition-all"
            />
          </motion.div>
        </div>
      </div>

      {/* Map Section */}
      <div ref={mapRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="relative h-[400px] md:h-[500px] w-full rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-800">
            {selectedBranch ? (
              <iframe
                title={selectedBranch.name}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={getOSMUrl(selectedBranch.lat, selectedBranch.lng)}
                className="grayscale dark:invert contrast-125 opacity-90 hover:opacity-100 transition-opacity"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>{t('selectBranchMap')}</p>
              </div>
            )}
            
            {selectedBranch && (
              <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-white dark:border-slate-800 shadow-xl z-10">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">
                  {selectedBranch.name.replace('Simba Supermarket ', '')}
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-simba-orange flex-shrink-0 mt-0.5" />
                    {selectedBranch.address}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-simba-orange flex-shrink-0" />
                    {t('openHours', { hours: selectedBranch.hours })}
                  </p>
                </div>
                <a
                  href={selectedBranch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-simba-orange text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-200 dark:shadow-none"
                >
                  <Navigation className="h-4 w-4" />
                  {t('getDirections')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredBranches.length > 0 ? (
                filteredBranches.map((branch) => (
                  <motion.div
                    key={branch.id}
                    variants={itemVariants}
                    className={`bg-white dark:bg-slate-900 rounded-[2rem] p-6 border transition-all group flex flex-col h-full ${
                      selectedBranch?.id === branch.id 
                        ? 'border-simba-orange ring-1 ring-simba-orange shadow-xl' 
                        : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-simba-orange/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                        selectedBranch?.id === branch.id ? 'bg-simba-orange text-white' : 'bg-orange-50 dark:bg-orange-900/20 text-simba-orange group-hover:bg-simba-orange group-hover:text-white'
                      }`}>
                        <MapPin className="h-6 w-6" />
                      </div>
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                        {branch.district}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 group-hover:text-simba-orange transition-colors">
                      {branch.name.replace('Simba Supermarket ', '')}
                    </h3>

                    <div className="space-y-3 mb-8 flex-1">
                      <div className="flex items-start gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <Navigation className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span>{t('openHours', { hours: branch.hours })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span>{branch.phone}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleViewOnMap(branch)}
                        className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${
                          selectedBranch?.id === branch.id
                            ? 'bg-simba-orange text-white'
                            : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-simba-orange dark:hover:bg-simba-orange dark:hover:text-white'
                        }`}
                      >
                        <MapIcon className="h-4 w-4" />
                        {t('viewMap')}
                      </button>
                      <Link
                        href={`/${locale}/branch-reviews?branch=${branch.id}`}
                        className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                      >
                        {tNav('reviews')}
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                   <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-slate-300" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('noBranchesFound')}</h3>
                   <p className="text-slate-500 text-sm mt-1">{t('noBranchesDesc')}</p>
                   <button 
                     onClick={() => setSearchQuery('')}
                     className="mt-6 text-simba-orange font-bold text-sm uppercase tracking-widest"
                   >
                     {t('clearSearch')}
                   </button>
                </div>
              )}
            </motion.div>
          </div>

          <div className="w-full lg:w-80">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">{t('expressTitle')}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  {t('expressDesc')}
                </p>
                <Link 
                  href={`/${locale}/products`}
                  className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group transition-all"
                >
                  <span className="text-xs font-bold uppercase tracking-widest group-hover:text-simba-orange">{t('startShopping')}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-simba-orange" />
                </Link>
              </div>

              <div className="bg-simba-orange rounded-3xl p-6 text-white shadow-xl shadow-orange-200/50 dark:shadow-none">
                <h4 className="font-black uppercase tracking-tight mb-2">{t('customerServiceTitle')}</h4>
                <p className="text-xs text-orange-50 leading-relaxed mb-4">
                  {t('customerServiceDesc')}
                </p>
                <a 
                  href="tel:+250788000000"
                  className="flex items-center gap-3 font-black text-lg mb-2"
                >
                  <Phone className="h-5 w-5" />
                  +250 788 000 000
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
