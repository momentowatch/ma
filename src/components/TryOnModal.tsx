import React, { useState } from 'react';
import { Smartphone, Sparkles } from 'lucide-react';
import { Watch } from '../types';
import { ModalShell } from './ui/ModalShell';
import { Button } from './ui/Button';
import { useI18n } from '../i18n';

interface TryOnModalProps {
  isOpen: boolean;
  watch: Watch | null;
  onClose: () => void;
}

export const TryOnModal: React.FC<TryOnModalProps> = ({
  isOpen,
  watch,
  onClose,
}) => {
  const { t, formatMeasure } = useI18n();
  const [wristSize, setWristSize] = useState<number>(16.5); // cm

  if (!watch) return null;

  // Scale simulation based on watch diameter vs wrist size
  const diameterMm = parseFloat(watch.specs.diameter) || 40;
  const wristMm = wristSize * 10;
  const scale = Math.min(1.3, Math.max(0.7, (diameterMm / wristMm) * 3.8));

  const formattedDiameter = formatMeasure(watch.specs.diameter);

  return (
    <ModalShell
      open={isOpen}
      onClose={onClose}
      title={t('tryon.title')}
      subtitle={watch.name}
      icon={<Smartphone className="w-5 h-5 text-[#B8934A]" />}
      maxWidthClass="max-w-xl"
    >
      <div className="p-4 sm:p-6 space-y-6 font-sans">
        {/* Visual Wrist Stage */}
        <div className="aspect-[4/3] bg-[#F5F2EC] rounded-2xl border border-[#E8E2D5] relative overflow-hidden flex items-center justify-center p-6 shadow-inner">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#221F1B_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Simulated Wrist Contour */}
          <div
            className="w-48 h-64 bg-[#EAE2D5] rounded-full border-2 border-[#D8CEBE] absolute flex items-center justify-center shadow-md"
            style={{ width: `${wristSize * 14}px` }}
          >
            {/* Watch Overlay */}
            <div
              className="relative transition-all duration-300 transform"
              style={{ transform: `scale(${scale})` }}
            >
              <img
                src={watch.images[0]}
                alt={watch.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (watch.imageFallbacks[0] && e.currentTarget.src !== watch.imageFallbacks[0]) {
                    e.currentTarget.src = watch.imageFallbacks[0];
                  }
                }}
                className="w-36 h-36 object-cover mix-blend-multiply drop-shadow-xl"
              />
            </div>
          </div>

          <div className="absolute bottom-3 start-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold text-[#8C8275] border border-[#E8E2D5] force-ltr">
            Ref: {watch.referenceNumber} · {formattedDiameter}
          </div>
        </div>

        {/* Wrist Size Slider Controls */}
        <div className="space-y-3 surface-card p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#221F1B]">{t('tryon.adjust')}</span>
            <span className="font-mono font-bold text-[#B8934A]">
              {formatMeasure(`${wristSize} cm`)} ({ (wristSize / 2.54).toFixed(1) }")
            </span>
          </div>

          <input
            type="range"
            min={13}
            max={22}
            step={0.5}
            value={wristSize}
            onChange={(e) => setWristSize(parseFloat(e.target.value))}
            className="w-full accent-[#B8934A] cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] text-[#8C8275]">
            <span>{t('tryon.sizePetite')}</span>
            <span>{t('tryon.sizeStandard')}</span>
            <span>{t('tryon.sizeLarge')}</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-[#8C8275]">{t('tryon.presets')}:</span>
          {[14, 16.5, 19, 21].map((size) => (
            <Button
              key={size}
              variant={wristSize === size ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setWristSize(size)}
            >
              {formatMeasure(`${size} cm`)}
            </Button>
          ))}
        </div>

        <div className="text-center text-xs text-[#736B60] flex items-center justify-center gap-1.5 pt-2">
          <Sparkles className="w-4 h-4 text-[#B8934A]" />
          <span>{t('tryon.disclaimer')}</span>
        </div>
      </div>
    </ModalShell>
  );
};
