import { Product } from '../types/database';

export const DEFAULT_BRAND_PHONE = '6281234567890';

/**
 * Clean phone number to digits only (e.g., 6281234567890)
 */
export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return DEFAULT_BRAND_PHONE;
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Generate contextual WhatsApp link for custom lens consultation on a product
 */
export function generateLensConsultationWALink(
  product: Product,
  phone = DEFAULT_BRAND_PHONE,
  lensName?: string
): string {
  const p = cleanPhoneNumber(phone);
  let message = `Halo JEM LUIQA Concierge,\n\nSaya tertarik dengan produk:\n• Frame: *${product.name}*`;
  
  if (product.color) {
    message += `\n• Color: ${product.color}`;
  }
  if (product.edition) {
    message += `\n• Edition: ${product.edition}`;
  }
  if (lensName) {
    message += `\n• Lensa: *${lensName}*`;
  }
  
  message += `\n\nSaya ingin berkonsultasi mengenai pemasangan custom lensa resep / opsi lensa untuk frame ini.\n\nMohon dibantu. Terima kasih!`;
  
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate WhatsApp inquiry link for general concierge / consultation
 */
export function generateConsultationWALink(
  topic = 'Konsultasi Eyewear & Custom Lens',
  phone = DEFAULT_BRAND_PHONE
): string {
  const p = cleanPhoneNumber(phone);
  const message = `Halo JEM LUIQA Concierge,\n\nSaya ingin berkonsultasi mengenai ${topic}.\n\nBisa dibantu? Terima kasih.`;
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
}
