import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, MapPin, User, Phone, Home, Truck, Package } from 'lucide-react';
import { CartItem, Category } from '../types';
import { createMultiWatchWhatsAppMessage, formatWhatsAppLink } from '../utils/whatsapp';
import { shippingData, getShippingPrice } from '../data/shippingData';
import { ShippingTariffsModal } from './ShippingTariffsModal';
import { ModalShell } from './ui/ModalShell';
import { Button, IconButton } from './ui/Button';
import { useI18n } from '../i18n';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onSelectCategory: (category: Category) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onSelectCategory,
  onClearCart,
}) => {
  const i18nBundle = useI18n();
  const { t, tData } = i18nBundle;
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [isCityFocused, setIsCityFocused] = useState(false);
  const [address, setAddress] = useState('');
  const [includeBox, setIncludeBox] = useState<boolean>(false);
  const [showErrors, setShowErrors] = useState(false);
  const [showTariffsModal, setShowTariffsModal] = useState(false);

  const matchingCities = city.trim()
    ? shippingData.filter((s) => s.name.toLowerCase().includes(city.trim().toLowerCase())).slice(0, 6)
    : shippingData.slice(0, 6);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.watch.price * item.quantity, 0);
  const shippingFee = getShippingPrice(city);
  const boxFee = includeBox ? 25 : 0;
  const grandTotal = totalPrice + shippingFee + boxFee;

  const isFormValid = fullName.trim() !== '' && phone.trim() !== '' && city !== '' && address.trim() !== '';

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    if (!isFormValid) {
      setShowErrors(true);
      return;
    }
    const msg = createMultiWatchWhatsAppMessage(
      i18nBundle,
      cartItems.map(item => ({
        name: item.watch.name,
        price: item.watch.price,
        sku: item.watch.sku,
        quantity: item.quantity,
        selectedPhotoNumber: item.selectedPhotoNumber || 1,
        engravingText: item.engravingText,
        giftWrapping: item.giftWrapping,
      })),
      totalPrice,
      {
        fullName,
        phone,
        city: tData('city', city),
        address,
      }
    );
    window.open(formatWhatsAppLink(msg), '_blank');
  };

  const itemCountLabel = t('cart.itemsCount', { count: cartItems.length });

  return (
    <ModalShell
      open={isOpen}
      onClose={onClose}
      layout="drawer"
      title={t('cart.title')}
      subtitle={itemCountLabel}
      icon={<ShoppingBag className="w-5 h-5 text-[#B8934A]" />}
    >
      <div className="p-4 sm:p-6 font-sans w-full max-w-full overflow-x-hidden">
        {cartItems.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <ShoppingBag className="w-12 h-12 text-[#D8CBB5] mx-auto" />
            <div>
              <h3 className="font-serif-luxury text-xl text-[#221F1B]">{t('cart.emptyTitle')}</h3>
              <p className="text-xs text-[#736B60] mt-1">{t('cart.emptyBody')}</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="primary" size="sm" onClick={() => { onClose(); onSelectCategory('men'); }}>
                {t('cart.menButton')}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { onClose(); onSelectCategory('women'); }}>
                {t('cart.womenButton')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items List */}
            <div className="divide-y divide-[#E8E2D5]">
              {cartItems.map((item) => {
                const photoIdx = (item.selectedPhotoNumber || 1) - 1;
                const imgSrc = item.watch.images[photoIdx] || item.watch.images[0];
                const fallbackSrc = item.watch.imageFallbacks[photoIdx] || item.watch.imageFallbacks[0];

                return (
                  <div key={item.id} className="py-3.5 first:pt-0 flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden img-frame photo-drop shrink-0">
                      <img
                        src={imgSrc}
                        alt={item.watch.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
                            e.currentTarget.src = fallbackSrc;
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] text-[#8C8275]">{item.watch.referenceNumber}</span>
                        <span className="hidden text-[10px] uppercase font-semibold text-[#B8934A] bg-[#FAF5EB] px-2 py-0.5 rounded border border-[#E5DBCA]">
                          Photo #{item.selectedPhotoNumber || 1}
                        </span>
                      </div>
                      <h4 className="font-serif-luxury text-base text-[#221F1B] truncate">{item.watch.name}</h4>
                      <div className="text-sm font-serif-luxury font-semibold text-[#221F1B]">
                        {item.watch.price * item.quantity} dh
                      </div>

                      {item.engravingText && (
                        <p className="text-[10px] text-[#B8934A]">Engraving: "{item.engravingText}"</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <IconButton
                        label="Remove item"
                        icon={<Trash2 className="w-4 h-4 text-[#A33A2B]" />}
                        onClick={() => onRemoveItem(item.id)}
                        variant="ghost"
                        size="sm"
                      />

                      <div className="flex items-center gap-1 bg-white border border-[#E8E2D5] rounded-full p-0.5">
                        <IconButton
                          label="Decrease quantity"
                          icon={<Minus className="w-3 h-3" />}
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          variant="ghost"
                          size="sm"
                        />
                        <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                        <IconButton
                          label="Increase quantity"
                          icon={<Plus className="w-3 h-3" />}
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          variant="ghost"
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Watch Box Option Question */}
            <div className="p-4 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#B8934A]" />
                  <h4 className="text-xs font-semibold text-[#221F1B]">
                    Avez-vous besoin du coffret de la montre ?
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-[#B8934A] bg-[#FAF5EB] px-2 py-0.5 rounded border border-[#E5DBCA]">
                  +25 dh
                </span>
              </div>
              <p className="text-[11px] text-[#736B60]">
                Coffret de présentation officiel & emballage cadeau.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIncludeBox(true)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    includeBox
                      ? 'bg-[#B8934A] text-white border-[#B8934A] shadow-sm font-semibold'
                      : 'bg-white text-[#736B60] border-[#E8E2D5] hover:border-[#B8934A]'
                  }`}
                >
                  <span>Oui (+25 dh)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIncludeBox(false)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    !includeBox
                      ? 'bg-[#221F1B] text-white border-[#221F1B] shadow-sm font-semibold'
                      : 'bg-white text-[#736B60] border-[#E8E2D5] hover:border-[#221F1B]'
                  }`}
                >
                  <span>Non (0 dh)</span>
                </button>
              </div>
            </div>

            {/* Delivery Details Section */}
            <div className="pt-4 border-t border-[#E8E2D5] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#B8934A]" />
                  <h4 className="text-xs font-semibold text-[#221F1B] uppercase tracking-wider">
                    Delivery Details
                  </h4>
                </div>
                <span className="text-[10px] text-[#A33A2B] font-medium">* Required fields</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-[#736B60] block mb-1">
                    Full Name <span className="text-[#A33A2B] font-bold">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[#8C8275] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Karim Bennani"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (showErrors && e.target.value.trim()) setShowErrors(false);
                      }}
                      className={`w-full bg-white border rounded-xl py-2.5 pl-9 pr-3 text-[#221F1B] outline-none text-xs transition-colors ${
                        showErrors && !fullName.trim()
                          ? 'border-[#A33A2B] ring-1 ring-[#A33A2B]/20 bg-[#FFF8F7]'
                          : 'border-[#E8E2D5] focus:border-[#B8934A]'
                      }`}
                    />
                  </div>
                  {showErrors && !fullName.trim() && (
                    <p className="text-[10px] text-[#A33A2B] mt-0.5 font-medium">Full Name is required</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-medium text-[#736B60] block mb-1">
                      Phone Number <span className="text-[#A33A2B] font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-[#8C8275] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        placeholder="06XX XX XX XX"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (showErrors && e.target.value.trim()) setShowErrors(false);
                        }}
                        className={`w-full bg-white border rounded-xl py-2.5 pl-9 pr-3 text-[#221F1B] outline-none text-xs transition-colors ${
                          showErrors && !phone.trim()
                            ? 'border-[#A33A2B] ring-1 ring-[#A33A2B]/20 bg-[#FFF8F7]'
                            : 'border-[#E8E2D5] focus:border-[#B8934A]'
                        }`}
                      />
                    </div>
                    {showErrors && !phone.trim() && (
                      <p className="text-[10px] text-[#A33A2B] mt-0.5 font-medium">Phone number is required</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-medium text-[#736B60] block">
                        City <span className="text-[#A33A2B] font-bold">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowTariffsModal(true)}
                        className="text-[10px] text-[#B8934A] hover:underline font-medium flex items-center gap-0.5"
                      >
                        <Truck className="w-3 h-3" /> Grille des tarifs
                      </button>
                    </div>

                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-[#8C8275] absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Tapez votre ville (ex. Casablanca, Rabat, Fès...)"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          setIsCityFocused(true);
                          if (showErrors && e.target.value.trim()) setShowErrors(false);
                        }}
                        onFocus={() => setIsCityFocused(true)}
                        onBlur={() => {
                          setTimeout(() => setIsCityFocused(false), 200);
                        }}
                        className={`w-full bg-white border rounded-xl py-2.5 pl-9 pr-24 text-[#221F1B] placeholder-[#A8A095] outline-none text-xs transition-colors ${
                          showErrors && !city.trim()
                            ? 'border-[#A33A2B]'
                            : 'border-[#E8E2D5] focus:border-[#B8934A]'
                        }`}
                      />

                      {/* Autocomplete Suggestions Dropdown */}
                      {isCityFocused && matchingCities.length > 0 && (
                        <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-[#E8E2D5] rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-[#F5F2EB]">
                          {matchingCities.map((loc) => (
                            <button
                              key={loc.name}
                              type="button"
                              onMouseDown={() => {
                                setCity(loc.name);
                                setIsCityFocused(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-[#FAF8F5] flex items-center justify-between text-xs transition-colors"
                            >
                              <div>
                                <span className="font-semibold text-[#221F1B]">{loc.name}</span>
                                {loc.region && <span className="text-[10px] text-[#8C8275] ml-1.5">({loc.region})</span>}
                              </div>
                              <span className="font-bold text-[#B8934A] text-xs">{loc.price} dh</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Active Tariff Badge Bar */}
                    <div className="mt-1.5 px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg flex items-center justify-between text-[11px]">
                      <span className="text-[#736B60] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#B8934A]" />
                        Tarif de livraison :
                      </span>
                      <span className="font-serif-luxury font-bold text-[#221F1B] text-xs">
                        {shippingFee} dh
                      </span>
                    </div>

                    {showErrors && !city.trim() && (
                      <p className="text-[10px] text-[#A33A2B] mt-0.5 font-medium">Veuillez indiquer votre ville</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-[#736B60] block mb-1">
                    Street Address / Location <span className="text-[#A33A2B] font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Home className="w-3.5 h-3.5 text-[#8C8275] absolute left-3 top-3 pointer-events-none" />
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Boulevard Anfa, Rue 12, Apt 4..."
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (showErrors && e.target.value.trim()) setShowErrors(false);
                      }}
                      className={`w-full bg-white border rounded-xl py-2 pl-9 pr-3 text-[#221F1B] outline-none text-xs resize-none transition-colors ${
                        showErrors && !address.trim()
                          ? 'border-[#A33A2B] ring-1 ring-[#A33A2B]/20 bg-[#FFF8F7]'
                          : 'border-[#E8E2D5] focus:border-[#B8934A]'
                      }`}
                    />
                  </div>
                  {showErrors && !address.trim() && (
                    <p className="text-[10px] text-[#A33A2B] mt-0.5 font-medium">Address is required</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary & Checkout Action - integrated inside the SAME scroll area */}
            <div className="pt-4 border-t border-[#E8E2D5] space-y-3 font-sans">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#736B60]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#221F1B]">{totalPrice} dh</span>
                </div>
                {includeBox && (
                  <div className="flex items-center justify-between text-[#736B60]">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-[#B8934A]" />
                      Coffret montre
                    </span>
                    <span className="font-medium text-[#221F1B]">+25 dh</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[#736B60]">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-[#B8934A]" />
                    Livraison ({city})
                  </span>
                  <span className="font-medium text-[#221F1B]">{shippingFee} dh</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#E8E2D5]/60 text-sm font-semibold">
                  <span className="text-[#221F1B] uppercase tracking-wider text-xs">Total</span>
                  <span className="font-serif-luxury text-2xl text-[#221F1B]">{grandTotal} dh</span>
                </div>
              </div>

              {showErrors && !isFormValid && (
                <p className="text-xs text-[#A33A2B] bg-[#FFF8F7] border border-[#A33A2B]/20 p-2.5 rounded-xl font-medium text-center">
                  Please fill in all mandatory delivery details (*) before proceeding.
                </p>
              )}

              <Button
                variant="primary"
                size="lg"
                block
                onClick={handleCheckout}
              >
                Checkout ({grandTotal} dh)
              </Button>

              <div className="flex items-center justify-between pt-1">
                <Button variant="danger" size="sm" onClick={onClearCart}>
                  Clear Cart
                </Button>
                <span className="text-[10px] text-[#8C8275] uppercase tracking-wider">Cash on delivery</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <ShippingTariffsModal
        isOpen={showTariffsModal}
        onClose={() => setShowTariffsModal(false)}
        selectedCity={city}
        onSelectCity={(newCity) => setCity(newCity)}
      />
    </ModalShell>
  );
};
