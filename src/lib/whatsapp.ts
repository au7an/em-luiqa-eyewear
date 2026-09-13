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

/**
 * Generate contextual WhatsApp order link for custom lens wizard flow
 */
export function generateCustomLensOrderWALink({
  product,
  variant,
  selection,
  phone = DEFAULT_BRAND_PHONE,
}: {
  product: Product;
  variant?: import('../types/database').ProductVariant;
  selection: import('../types/database').CustomLensSelection;
  phone?: string;
}): string {
  const p = cleanPhoneNumber(phone);
  
  const frameName = product.name;
  const colorName = variant?.color_name || product.color || 'Standard';
  const sku = variant?.sku || product.sku;

  let msg = `Halo JEM LUIQA, saya ingin memesan kustomisasi kacamata:\n\n`;
  msg += `Frame: *${frameName}*\n`;
  msg += `Color: ${colorName}${sku ? ` (${sku})` : ''}\n\n`;

  if (selection.requirement === 'non-prescription') {
    msg += `Kebutuhan Lensa: Non-Prescription (Plano / Lensa Normal)\n`;
  } else {
    msg += `Kebutuhan Lensa: Prescription (Resep Dokter)\n`;
    if (selection.visionType) {
      msg += `Tipe Penglihatan: ${selection.visionType}\n`;
    }
    
    msg += `\n`;
    if (selection.prescription?.unsure) {
      msg += `Detail Resep:\n(Saya butuh bantuan baca resep / akan verifikasi melalui foto resep via chat ini)\n`;
    } else if (selection.prescription) {
      const { od, os, pd } = selection.prescription;
      msg += `Mata Kanan / OD:\n• SPH: ${od.sph || '0.00'}\n• CYL: ${od.cyl || '0.00'}\n• AXIS: ${od.axis ? `${od.axis}°` : '-'}\n\n`;
      msg += `Mata Kiri / OS:\n• SPH: ${os.sph || '0.00'}\n• CYL: ${os.cyl || '0.00'}\n• AXIS: ${os.axis ? `${os.axis}°` : '-'}\n\n`;
      if (pd) {
        msg += `PD (Pupillary Distance): ${pd} mm\n`;
      }
    }
  }

  if (selection.lensService) {
    msg += `\nLensa:\n*${selection.lensService.name}*\n`;
    if (selection.selectedOptions && Object.keys(selection.selectedOptions).length > 0) {
      const optionLines = Object.entries(selection.selectedOptions)
        .map(([optName, choiceLabel]) => `• ${optName}: ${choiceLabel}`)
        .join('\n');
      msg += `${optionLines}\n`;
    }
  }

  if (selection.estimatedTotalPrice) {
    msg += `\nEstimasi Total:\n*${selection.estimatedTotalPrice}*\n`;
  } else {
    msg += `\nEstimasi Total:\n*(Menunggu konfirmasi concierge)*\n`;
  }

  msg += `\nMohon bantu verifikasi pesanan dan detail kustomisasi ini. Terima kasih!`;

  return `https://wa.me/${p}?text=${encodeURIComponent(msg)}`;
}

