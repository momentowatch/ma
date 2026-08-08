export const WHATSAPP_NUMBER = "212652297244";

export const formatWhatsAppLink = (message: string) => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const createOrderWhatsAppMessage = (
  items: Array<{ watchName: string; price: number; referenceNumber: string; quantity: number; selectedPhotoNumber?: number; engravingText?: string; giftWrapping?: boolean }>,
  subtotalPrice: number,
  clientInfo?: { fullName?: string; phone?: string; address?: string; city?: string; shippingFee?: number }
) => {
  let msg = `🛒 *NEW TIMEPIECE ORDER*\n`;
  msg += `----------------------------------\n`;
  
  items.forEach((item, index) => {
    msg += `*${index + 1}. ${item.watchName} (${item.referenceNumber}) x${item.quantity} — ${item.price} dh*\n`;
    msg += `   • Selected Watch Photo: #${item.selectedPhotoNumber || 1}\n`;
    if (item.engravingText) {
      msg += `   • Engraving: "${item.engravingText}"\n`;
    }
    if (item.giftWrapping) {
      msg += `   • Gift Package: Yes\n`;
    }
  });

  const shipping = clientInfo?.shippingFee ?? 0;
  const finalTotal = subtotalPrice + shipping;

  msg += `----------------------------------\n`;
  msg += `*Subtotal: ${subtotalPrice} dh*\n`;
  if (clientInfo?.city && shipping > 0) {
    msg += `*Livraison (${clientInfo.city}): ${shipping} dh*\n`;
  }
  msg += `*Total: ${finalTotal} dh*\n`;

  if (clientInfo && (clientInfo.fullName || clientInfo.address || clientInfo.phone)) {
    msg += `\n*Delivery Info:*\n`;
    if (clientInfo.fullName) msg += `• Name: ${clientInfo.fullName}\n`;
    if (clientInfo.phone) msg += `• Phone: ${clientInfo.phone}\n`;
    if (clientInfo.address) msg += `• Address: ${clientInfo.address}\n`;
    if (clientInfo.city) msg += `• City: ${clientInfo.city}\n`;
  }

  return msg;
};

export const createMultiWatchWhatsAppMessage = (
  items: Array<{ name: string; price: number; sku?: string; referenceNumber?: string; quantity: number; selectedPhotoNumber?: number; engravingText?: string; giftWrapping?: boolean }>,
  subtotalPrice: number,
  clientInfo?: { fullName?: string; phone?: string; address?: string; city?: string; shippingFee?: number }
) => {
  return createOrderWhatsAppMessage(
    items.map(i => ({
      watchName: i.name,
      price: i.price,
      referenceNumber: i.referenceNumber || i.sku || 'CW-REF',
      quantity: i.quantity,
      selectedPhotoNumber: i.selectedPhotoNumber || 1,
      engravingText: i.engravingText,
      giftWrapping: i.giftWrapping
    })),
    subtotalPrice,
    clientInfo
  );
};

export const createSingleWatchWhatsAppMessage = (
  watchName: string,
  price: number,
  referenceNumber: string,
  engravingText?: string,
  giftWrapping?: boolean,
  selectedPhotoNumber?: number
) => {
  let msg = `Bonjour! I would like to order the following timepiece:\n\n`;
  msg += `⌚ *${watchName} (${referenceNumber}) x1 — ${price} dh*\n`;
  msg += `• Selected Watch Photo: #${selectedPhotoNumber || 1}\n`;
  if (engravingText) {
    msg += `• Engraving: "${engravingText}"\n`;
  }
  if (giftWrapping) {
    msg += `• Signature Gift Box: Yes\n`;
  }
  msg += `\nPlease confirm availability and delivery details. Thank you!`;
  return msg;
};

export const createConciergeWhatsAppMessage = (info: {
  watchName?: string;
  watchReference?: string;
  selectedPhotoNumber?: number;
  clientName: string;
  clientCity: string;
  notes?: string;
}) => {
  let msg = `💬 *WATCH SPECIALIST INQUIRY*\n`;
  msg += `----------------------------------\n`;
  if (info.watchName) {
    msg += `• Timepiece: *${info.watchName}* (${info.watchReference || 'Reference Code'})\n`;
    msg += `• Selected Watch Photo: #${info.selectedPhotoNumber || 1}\n`;
  }
  msg += `• Client: ${info.clientName}\n`;
  msg += `• City: ${info.clientCity}\n`;
  if (info.notes) {
    msg += `• Message: ${info.notes}\n`;
  }
  msg += `----------------------------------\n`;
  msg += `Please confirm details & availability. Merci!`;
  return msg;
};
