import React, { useState } from 'react';
import { MessageSquare, Shield, Clock, MapPin } from 'lucide-react';
import { Watch } from '../types';
import { createConciergeWhatsAppMessage, formatWhatsAppLink } from '../utils/whatsapp';
import { ModalShell } from './ui/ModalShell';
import { Button } from './ui/Button';

interface ConciergeModalProps {
  isOpen: boolean;
  watch: Watch | null;
  selectedPhotoNumber?: number;
  onClose: () => void;
}

export const ConciergeModal: React.FC<ConciergeModalProps> = ({
  isOpen,
  watch,
  selectedPhotoNumber = 1,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [notes, setNotes] = useState('');

  const photoIdx = (selectedPhotoNumber || 1) - 1;
  const imgSrc = watch?.images[photoIdx] || watch?.images[0];
  const fallbackSrc = watch?.imageFallbacks[photoIdx] || watch?.imageFallbacks[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = createConciergeWhatsAppMessage({
      watchName: watch?.name,
      watchReference: watch?.referenceNumber,
      selectedPhotoNumber: selectedPhotoNumber || 1,
      clientName: name,
      clientCity: city,
      notes,
    });
    window.open(formatWhatsAppLink(message), '_blank');
    onClose();
  };

  return (
    <ModalShell
      open={isOpen}
      onClose={onClose}
      title="Watch Specialist Concierge"
      subtitle="Personal consultation & order inquiries"
      icon={<MessageSquare className="w-5 h-5 text-[#B8934A]" />}
      maxWidthClass="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 font-sans">
        {watch && (
          <div className="surface-card p-3 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden img-frame photo-drop shrink-0">
              <img
                src={imgSrc}
                alt={watch.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
                    e.currentTarget.src = fallbackSrc;
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-[#8C8275]">{watch.referenceNumber}</span>
                <span className="text-[10px] uppercase font-semibold text-[#B8934A] bg-[#FAF5EB] px-2 py-0.5 rounded border border-[#E5DBCA]">
                  Photo #{selectedPhotoNumber || 1}
                </span>
              </div>
              <h4 className="font-serif-luxury text-base text-[#221F1B] truncate">{watch.name}</h4>
              <span className="font-serif-luxury text-xs font-semibold text-[#B8934A]">{watch.formattedPrice}</span>
            </div>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#221F1B] block mb-1">Your Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Karim Bennani"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#E8E2D5] focus:border-[#B8934A] rounded-xl p-3 text-[#221F1B] outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-[#221F1B] block mb-1">City in Morocco</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-white border border-[#E8E2D5] focus:border-[#B8934A] rounded-xl p-3 text-[#221F1B] outline-none"
            >
              <option value="Casablanca">Casablanca</option>
              <option value="Rabat">Rabat</option>
              <option value="Marrakech">Marrakech</option>
              <option value="Tanger">Tanger</option>
              <option value="Agadir">Agadir</option>
              <option value="Fès">Fès</option>
              <option value="Other Morocco City">Other City in Morocco</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-[#221F1B] block mb-1">Inquiry / Special Request (Optional)</label>
            <textarea
              rows={3}
              placeholder="Ask about availability, delivery time, custom engraving, or real store photos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-[#E8E2D5] focus:border-[#B8934A] rounded-xl p-3 text-[#221F1B] outline-none resize-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="whatsapp"
            size="lg"
            block
            icon={<MessageSquare className="w-4 h-4 fill-white" />}
          >
            Connect via WhatsApp · 0652297244
          </Button>
        </div>

        <div className="pt-2 border-t border-[#E8E2D5] grid grid-cols-3 gap-2 text-center text-[10px] text-[#8C8275]">
          <div className="flex flex-col items-center gap-1">
            <Clock className="w-4 h-4 text-[#B8934A]" />
            <span>Fast Response</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Shield className="w-4 h-4 text-[#B8934A]" />
            <span>Cash on Delivery</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MapPin className="w-4 h-4 text-[#B8934A]" />
            <span>Boutique Support</span>
          </div>
        </div>
      </form>
    </ModalShell>
  );
};
