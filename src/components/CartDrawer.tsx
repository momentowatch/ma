import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, MapPin, User, Phone, Home, Truck } from 'lucide-react';
import { CartItem, Category } from '../types';
import { createMultiWatchWhatsAppMessage, formatWhatsAppLink } from '../utils/whatsapp';
import { shippingData, getShippingPrice } from '../data/shippingData';
import { ShippingTariffsModal } from './ShippingTariffsModal';
import { ModalShell } from './ui/ModalShell';
import { Button, IconButton } from './ui/Button';

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
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [address, setAddress] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [showTariffsModal, setShowTariffsModal] = useState(false);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.watch.price * item.quantity, 0);
  const shippingFee = getShippingPrice(city);
  const grandTotal = totalPrice + shippingFee;

  const isFormValid = fullName.trim() !== '' && phone.trim() !== '' && city !== '' && address.trim() !== '';

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    if (!isFormValid) {
      setShowErrors(true);
      return;
    }
    const msg = createMultiWatchWhatsAppMessage(
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
        city,
        address,
        shippingFee,
      }
    );
    window.open(formatWhatsAppLink(msg), '_blank');
  };

  const itemCountLabel = `${cartItems.length} item${cartItems.length === 1 ? '' : 's'}`;

  return (
    <ModalShell
      open={isOpen}
      onClose={onClose}
      layout="drawer"
      title="Shopping Cart"
      subtitle={itemCountLabel}
      icon={<ShoppingBag className="w-5 h-5 text-[#B8934A]" />}
      footer={
        cartItems.length > 0 ? (
          <div className="space-y-3 font-sans">
            <div className="space-y-1.5 pt-1 border-t border-[#E8E2D5] text-xs">
              <div className="flex items-center justify-between text-[#736B60]">
                <span>Subtotal</span>
                <span className="font-medium text-[#221F1B]">{totalPrice} dh</span>
              </div>
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
              <p className="text-xs text-[#A33A2B] bg-[#FFF8F7] border border-[#A33A2B]/20 p-2 rounded-lg font-medium text-center">
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
        ) : null
      }
    >
      <div className="p-4 sm:p-6 font-sans w-full max-w-full overflow-x-hidden">
        {cartItems.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <ShoppingBag className="w-12 h-12 text-[#D8CBB5] mx-auto" />
            <div>
              <h3 className="font-serif-luxury text-xl text-[#221F1B]">Your cart is empty</h3>
              <p className="text-xs text-[#736B60] mt-1">Discover our luxury timepieces collection.</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="primary" size="sm" onClick={() => { onClose(); onSelectCategory('men'); }}>
                Men's Collection
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { onClose(); onSelectCategory('women'); }}>
                Women's Collection
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
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
                        <span className="text-[10px] uppercase font-semibold text-[#B8934A] bg-[#FAF5EB] px-2 py-0.5 rounded border border-[#E5DBCA]">
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
                    <select
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-[#E8E2D5] focus:border-[#B8934A] rounded-xl py-2.5 px-3 text-[#221F1B] outline-none text-xs"
                    >
                      {shippingData.map((loc) => (
                        <option key={loc.name} value={loc.name}>
                          {loc.name} ({loc.price} dh)
                        </option>
                      ))}
                    </select>
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
