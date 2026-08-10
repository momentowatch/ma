import type { TranslationKey, TranslationVars } from '../i18n';

export const WHATSAPP_NUMBER = '212652297244';

export const formatWhatsAppLink = (message: string) => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export type WaI18n = {
  t: (key: TranslationKey, vars?: TranslationVars) => string;
  formatPrice: (amount: number) => string;
  tData: (kind: 'city', value: string) => string;
};

export const createOrderWhatsAppMessage = (
  i18n: WaI18n,
  items: Array<{
    watchName: string;
    price: number;
    referenceNumber: string;
    quantity: number;
    selectedPhotoNumber?: number;
    engravingText?: string;
    giftWrapping?: boolean;
  }>,
  totalPrice: number,
  clientInfo?: { fullName?: string; phone?: string; address?: string; city?: string },
) => {
  let msg = `${i18n.t('wa.orderHeader')}\n`;
  msg += `----------------------------------\n`;

  items.forEach((item, index) => {
    msg += `• ${index + 1}. *${item.watchName}* (${item.referenceNumber}) x${item.quantity} — ${i18n.formatPrice(item.price)}\n`;
    msg += `   ${i18n.t('wa.photoLine', { index: item.selectedPhotoNumber || 1 })}\n`;
    if (item.engravingText) {
      msg += `   ${i18n.t('wa.engravingLine', { text: item.engravingText })}\n`;
    }
    if (item.giftWrapping) {
      msg += `   ${i18n.t('wa.giftBoxLine')}\n`;
    }
  });

  msg += `----------------------------------\n`;
  msg += `${i18n.t('wa.totalLine', { total: i18n.formatPrice(totalPrice) })}\n`;

  if (clientInfo && (clientInfo.fullName || clientInfo.address || clientInfo.phone)) {
    msg += `\n${i18n.t('wa.deliveryHeader')}\n`;
    if (clientInfo.fullName) msg += `${i18n.t('wa.nameLine', { value: clientInfo.fullName })}\n`;
    if (clientInfo.phone) msg += `${i18n.t('wa.phoneLine', { value: clientInfo.phone })}\n`;
    if (clientInfo.address) msg += `${i18n.t('wa.addressLine', { value: clientInfo.address })}\n`;
    if (clientInfo.city) msg += `${i18n.t('wa.cityLine', { value: clientInfo.city })}\n`;
  }

  return msg;
};

export const createMultiWatchWhatsAppMessage = (
  i18n: WaI18n,
  items: Array<{
    name: string;
    price: number;
    sku?: string;
    referenceNumber?: string;
    quantity: number;
    selectedPhotoNumber?: number;
    engravingText?: string;
    giftWrapping?: boolean;
  }>,
  totalPrice: number,
  clientInfo?: { fullName?: string; phone?: string; address?: string; city?: string },
) => {
  return createOrderWhatsAppMessage(
    i18n,
    items.map((i) => ({
      watchName: i.name,
      price: i.price,
      referenceNumber: i.referenceNumber || i.sku || 'CW-REF',
      quantity: i.quantity,
      selectedPhotoNumber: i.selectedPhotoNumber || 1,
      engravingText: i.engravingText,
      giftWrapping: i.giftWrapping,
    })),
    totalPrice,
    clientInfo,
  );
};

export const createSingleWatchWhatsAppMessage = (
  i18n: WaI18n,
  watchName: string,
  price: number,
  referenceNumber: string,
  engravingText?: string,
  giftWrapping?: boolean,
  selectedPhotoNumber?: number,
) => {
  let msg = `${i18n.t('wa.singleIntro')}\n\n`;
  msg += `• *${watchName}* (${referenceNumber}) — ${i18n.formatPrice(price)}\n`;
  msg += `${i18n.t('wa.photoLine', { index: selectedPhotoNumber || 1 })}\n`;
  if (engravingText) {
    msg += `${i18n.t('wa.engravingLine', { text: engravingText })}\n`;
  }
  if (giftWrapping) {
    msg += `${i18n.t('wa.giftBoxLine')}\n`;
  }
  msg += `\n${i18n.t('wa.orderFooter')}`;
  return msg;
};

export const createConciergeWhatsAppMessage = (
  i18n: WaI18n,
  info: {
    watchName?: string;
    watchReference?: string;
    selectedPhotoNumber?: number;
    clientName: string;
    clientCity: string;
    notes?: string;
  },
) => {
  let msg = `${i18n.t('wa.conciergeHeader')}\n`;
  msg += `----------------------------------\n`;
  if (info.watchName) {
    msg += `${i18n.t('wa.watchLine', {
      name: info.watchName,
      reference: info.watchReference || 'Reference Code',
    })}\n`;
    msg += `${i18n.t('wa.photoLine', { index: info.selectedPhotoNumber || 1 })}\n`;
  }
  msg += `${i18n.t('wa.clientLine', { value: info.clientName })}\n`;
  msg += `${i18n.t('wa.cityInquiryLine', { value: info.clientCity })}\n`;
  if (info.notes) {
    msg += `${i18n.t('wa.messageLine', { value: info.notes })}\n`;
  }
  msg += `----------------------------------\n`;
  msg += i18n.t('wa.conciergeFooter');
  return msg;
};
