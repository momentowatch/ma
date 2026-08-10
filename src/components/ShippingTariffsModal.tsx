import React, { useState, useMemo } from 'react';
import { Truck, Search, MapPin, Check } from 'lucide-react';
import { shippingData } from '../data/shippingData';
import { ModalShell } from './ui/ModalShell';
import { Button } from './ui/Button';
import { useI18n } from '../i18n';

interface ShippingTariffsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity?: (cityName: string) => void;
  selectedCity?: string;
}

export const ShippingTariffsModal: React.FC<ShippingTariffsModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  selectedCity,
}) => {
  const { t, tData, formatPrice } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const regions = useMemo(() => {
    const set = new Set<string>();
    shippingData.forEach((s) => {
      if (s.region) set.add(s.region);
    });
    return Array.from(set).sort();
  }, []);

  const filteredLocations = useMemo(() => {
    return shippingData.filter((loc) => {
      const localizedName = tData('city', loc.name);
      const matchesSearch =
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        localizedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.region.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion =
        selectedRegion === 'all' || loc.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, selectedRegion, tData]);

  return (
    <ModalShell
      open={isOpen}
      onClose={onClose}
      layout="center"
      title={t('shipping.title')}
      subtitle={t('shipping.subtitle')}
      icon={<Truck className="w-5 h-5 text-[#B8934A]" />}
    >
      <div className="p-4 sm:p-6 font-sans space-y-4 max-w-full">
        {/* Search & Filter bar */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C8275] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t('shipping.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E8E2D5] focus:border-[#B8934A] rounded-xl py-2.5 pl-9 pr-3 text-[#221F1B] outline-none text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedRegion('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedRegion === 'all'
                  ? 'bg-[#221F1B] text-white'
                  : 'bg-[#F5F2EB] text-[#736B60] hover:bg-[#E8E2D5]'
              }`}
            >
              {t('shipping.allRegions', { count: shippingData.length })}
            </button>
            {regions.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                  selectedRegion === region
                    ? 'bg-[#221F1B] text-white'
                    : 'bg-[#F5F2EB] text-[#736B60] hover:bg-[#E8E2D5]'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Tariffs List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-[#E8E2D5] border border-[#E8E2D5] rounded-xl bg-white">
          {filteredLocations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8C8275]">
              {t('shipping.noCityFound', { query: searchTerm })}
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const isSelected = selectedCity?.toLowerCase() === loc.name.toLowerCase();
              const cityName = tData('city', loc.name);
              return (
                <div
                  key={loc.name}
                  className={`p-3 flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-[#FAF6EE]' : 'hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-[#B8934A] shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-[#221F1B] truncate flex items-center gap-1.5">
                        {cityName}
                        {isSelected && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] bg-[#B8934A] text-white px-1.5 py-0.2 rounded font-normal">
                            <Check className="w-2.5 h-2.5" /> {t('shipping.selected')}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#8C8275] truncate">{loc.region}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-serif-luxury font-bold text-sm text-[#221F1B]">
                      {formatPrice(loc.price)}
                    </span>
                    {onSelectCity && (
                      <Button
                        variant={isSelected ? 'gold' : 'secondary'}
                        size="sm"
                        onClick={() => {
                          onSelectCity(loc.name);
                          onClose();
                        }}
                      >
                        {isSelected ? t('shipping.chosen') : t('shipping.choose')}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="text-[11px] text-[#8C8275] bg-[#F9F7F2] p-3 rounded-xl border border-[#E8E2D5] flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#B8934A] shrink-0" />
          <span>{t('shipping.guaranteeNote')}</span>
        </div>
      </div>
    </ModalShell>
  );
};
