import React from 'react';
import { ShoppingBag, X, MessageSquare, ArrowRight, Trash2, Shield } from 'lucide-react';
import { CartItem, Category } from '../types';
import { createOrderWhatsAppMessage, formatWhatsAppLink } from '../utils/whatsapp';
import { DrawerShell } from './ui/ModalShell';
import { Button, IconButton } from './ui/Button';
import { useI18n } from '../i18n';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
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
  const { t, tData, formatPrice } = useI18n();
  const i18nBundle = useI18n();

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.watch.price * item.quantity), 0);

  const handleWhatsAppCheckout = () => {
    const message = createOrderWhatsAppMessage(
      i18nBundle,
      cartItems.map((i) => ({
        watchName: i.watch.name,
        price: i.watch.price,
        referenceNumber: i.watch.referenceNumber,
        quantity: i.quantity,
        selectedPhotoNumber: i.selectedPhotoNumber,
        engravingText: i.engravingText,
        giftWrapping: i.giftWrapping,
      })),
      totalAmount
    );
    window.open(formatWhatsAppLink(message), '_blank');
    onClearCart();
    onClose();
  };

  return (
    <DrawerShell
      open={isOpen}
      onClose={onClose}
      title={t('cart.title')}
      subtitle={t('cart.itemsCount', { count: cartItems.length })}
      icon={<ShoppingBag className="w-5 h-5 text-[#B8934A]" />}
    >
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pb-20">
            <div className="w-16 h-16 rounded-full bg-[#F5F2EC] flex items-center justify-center mb-2">
              <ShoppingBag className="w-6 h-6 text-[#D8CBB5]" />
            </div>
            <h3 className="font-serif-luxury text-xl text-[#221F1B]">{t('cart.emptyTitle')}</h3>
            <p className="text-sm text-[#8C8275] max-w-[200px]">{t('cart.emptyBody')}</p>
            <div className="pt-4 grid grid-cols-2 gap-3 w-full">
              <Button variant="secondary" onClick={() => { onSelectCategory('men'); onClose(); }}>
                {t('cart.menButton')}
              </Button>
              <Button variant="secondary" onClick={() => { onSelectCategory('women'); onClose(); }}>
                {t('cart.womenButton')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            {cartItems.map((item) => {
              const watch = item.watch;
              const photoIdx = (item.selectedPhotoNumber || 1) - 1;
              const imgSrc = watch.images[photoIdx] || watch.images[0];
              const fallbackSrc = watch.imageFallbacks[photoIdx] || watch.imageFallbacks[0];

              return (
                <div key={item.id} className="surface-card p-3 relative flex gap-3 sm:gap-4">
                  <div className="w-20 sm:w-24 aspect-[3/4] rounded-lg overflow-hidden img-frame photo-drop shrink-0 bg-[#F5F2EC]">
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

                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div className="pe-6">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-mono text-[9px] text-[#8C8275] force-ltr">{watch.referenceNumber}</span>
                        <span className="text-[9px] uppercase font-semibold text-[#B8934A] bg-[#FAF5EB] px-1.5 py-0.5 rounded border border-[#E5DBCA]">
                          {t('cart.photoBadge', { number: item.selectedPhotoNumber || 1 })}
                        </span>
                      </div>
                      <h4 className="font-serif-luxury text-sm sm:text-base text-[#221F1B] truncate">{watch.name}</h4>
                      <div className="text-[10px] text-[#8C8275] mt-0.5 space-y-0.5">
                        <p>{watch.brand} · {tData('subCollection', watch.subCollection)}</p>
                        {item.engravingText && (
                          <p className="text-[#B8934A] flex items-center gap-1">
                            <span className="font-semibold">{t('cart.engraving')}:</span> {item.engravingText}
                          </p>
                        )}
                        {item.giftWrapping && (
                          <p className="text-[#B8934A] flex items-center gap-1">
                            <span className="font-semibold">{t('cart.giftYes')}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                      <div className="font-serif-luxury text-sm font-semibold text-[#221F1B] force-ltr">
                        {formatPrice(watch.price)}
                      </div>
                      <div className="flex items-center bg-[#FCFBF9] border border-[#E8E2D5] rounded-full overflow-hidden force-ltr">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-6 h-6 flex items-center justify-center text-[#8C8275] hover:bg-[#F5F2EC] disabled:opacity-30 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 5}
                          className="w-6 h-6 flex items-center justify-center text-[#8C8275] hover:bg-[#F5F2EC] disabled:opacity-30 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-2 end-2">
                    <IconButton
                      label={t('cart.removeItem')}
                      icon={<X className="w-3.5 h-3.5" />}
                      onClick={() => onRemoveItem(item.id)}
                      variant="ghost"
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="p-4 sm:p-6 bg-[#FCFBF9] border-t border-[#E8E2D5] space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#8C8275]">
              <span>{t('cart.subtotal')}</span>
              <span className="force-ltr inline-block">{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#8C8275]">
              <span>{t('cart.deliveryDetails')}</span>
              <span className="text-[#B8934A] font-semibold">{'Free'}</span>
            </div>
            <div className="flex justify-between text-base font-serif-luxury text-[#221F1B] font-semibold pt-2 border-t border-[#E8E2D5]">
              <span>{t('cart.total')}</span>
              <span className="force-ltr inline-block">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="whatsapp"
              size="lg"
              block
              icon={<MessageSquare className="w-4 h-4 fill-white" />}
              onClick={handleWhatsAppCheckout}
            >
              {t('cart.checkout')}
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-wider text-[#8C8275] mt-1">
              <Shield className="w-3 h-3 text-[#B8934A]" />
              <span>{t('common.cashOnDelivery')}</span>
            </div>
          </div>
        </div>
      )}
    </DrawerShell>
  );
};
