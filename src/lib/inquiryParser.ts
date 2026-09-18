import { ContactInquiry, PrescriptionData, CustomLensSelection } from '../types/database';

export interface ParsedInquiryDetails {
  productName: string;
  variantName: string;
  variantSku: string;
  lensName: string;
  lensCategory: string;
  selectedOptions: Record<string, string>;
  totalPrice: string;
  isUploadMode: boolean;
  prescriptionFileUrl?: string;
  prescriptionFileName?: string;
  prescription: PrescriptionData;
  clientNotes?: string;
}

export function getParsedInquiryData(inquiry: ContactInquiry): ParsedInquiryDetails {
  const customData: CustomLensSelection | null | undefined = inquiry.custom_lens_data;
  const msg = inquiry.message || '';

  // 1. Frame / Product Name
  let productName = inquiry.product_name || '';
  if (!productName) {
    const pMatch = msg.match(/Pesanan Custom Lensa:\s*([^\n(]+)/i) || msg.match(/Product:\s*([^\n]+)/i);
    if (pMatch) productName = pMatch[1].trim();
  }
  if (!productName) productName = 'Frame Custom JEM LUIQA';

  // 2. Variant Name
  let variantName = inquiry.variant_name || '';
  if (!variantName) {
    const vMatch = msg.match(/Pesanan Custom Lensa:[^(]+\(([^)]+)\)/i);
    if (vMatch) variantName = vMatch[1].trim();
  }
  if (!variantName || variantName === 'Standard') variantName = 'Standard';

  // 3. Variant SKU
  const variantSku = inquiry.variant_sku || '-';

  // 4. Lens Package
  let lensName = customData?.lensService?.name || '';
  if (!lensName) {
    const lMatch = msg.match(/(?:^|\n)\s*Lensa:\s*([^\n]+)/i);
    if (lMatch) lensName = lMatch[1].trim();
  }
  if (!lensName) lensName = 'Custom Prescription Lens';

  // 5. Lens Category / Vision Type
  let lensCategory = customData?.lensService?.category || customData?.visionType || '';
  if (!lensCategory) {
    const cMatch = msg.match(/Kebutuhan:\s*Prescription\s*\(([^)]+)\)/i);
    if (cMatch) lensCategory = cMatch[1].trim();
  }
  if (!lensCategory) lensCategory = 'Single Vision';

  // 6. Selected Options
  let selectedOptions: Record<string, string> = customData?.selectedOptions || {};
  if (Object.keys(selectedOptions).length === 0) {
    const optMatch = msg.match(/(?:^|\n)\s*Opsi:\s*([^\n]+)/i);
    if (optMatch) {
      const parts = optMatch[1].split(',');
      parts.forEach((part) => {
        const [k, v] = part.split(':');
        if (k && v) {
          selectedOptions[k.trim()] = v.trim();
        }
      });
    }
  }

  // 7. Total Price
  let totalPrice = inquiry.total_price || customData?.estimatedTotalPrice || '';
  if (!totalPrice) {
    const tMatch = msg.match(/(?:^|\n)\s*Estimasi Total:\s*([^\n]+)/i) || msg.match(/(?:^|\n)\s*Total:\s*([^\n]+)/i);
    if (tMatch) totalPrice = tMatch[1].trim();
  }
  if (!totalPrice) totalPrice = 'Menunggu Konfirmasi';

  // 8. Upload Mode & Files
  let prescriptionFileUrl = inquiry.prescription_file_url || customData?.prescription?.prescription_file_url;
  let prescriptionFileName = inquiry.prescription_file_name || customData?.prescription?.prescription_file_name;

  if (!prescriptionFileUrl) {
    const pfMatch = msg.match(/Prescription File:\s*([^\n]+)/i);
    if (pfMatch && pfMatch[1].trim() !== '-') {
      prescriptionFileUrl = pfMatch[1].trim();
    }
  }

  const isUploadMode =
    customData?.prescription?.prescription_mode === 'upload' ||
    Boolean(prescriptionFileUrl) ||
    msg.includes('Resep: Upload Foto/PDF');

  // 9. Prescription Matrix (OD / OS / PD / ADD / CC)
  const rawRx = customData?.prescription;
  const prescription: PrescriptionData = {
    od: {
      sph: rawRx?.od?.sph || '',
      cyl: rawRx?.od?.cyl || '',
      axis: rawRx?.od?.axis || '',
    },
    os: {
      sph: rawRx?.os?.sph || '',
      cyl: rawRx?.os?.cyl || '',
      axis: rawRx?.os?.axis || '',
    },
    pd: rawRx?.pd || '',
    add: rawRx?.add || '',
    cc: rawRx?.cc || '',
    unsure: Boolean(rawRx?.unsure),
    notes: rawRx?.notes || '',
    prescription_mode: isUploadMode ? 'upload' : 'manual',
    prescription_file_url: prescriptionFileUrl,
    prescription_file_name: prescriptionFileName,
  };

  // If OD/OS are empty, parse from message
  if (!prescription.od.sph && !prescription.od.cyl) {
    const odMatch = msg.match(/OD:\s*SPH\s*([^\s,]+),\s*CYL\s*([^\s,]+)(?:,\s*AXIS\s*([^\n,]+))?/i);
    if (odMatch) {
      prescription.od.sph = odMatch[1] === '-' ? '0.00' : odMatch[1];
      prescription.od.cyl = odMatch[2] === '-' ? '0.00' : odMatch[2];
      prescription.od.axis = odMatch[3] && odMatch[3].trim() !== '-' ? odMatch[3].trim() : '';
    }
  }

  if (!prescription.os.sph && !prescription.os.cyl) {
    const osMatch = msg.match(/OS:\s*SPH\s*([^\s,]+),\s*CYL\s*([^\s,]+)(?:,\s*AXIS\s*([^\n,]+))?/i);
    if (osMatch) {
      prescription.os.sph = osMatch[1] === '-' ? '0.00' : osMatch[1];
      prescription.os.cyl = osMatch[2] === '-' ? '0.00' : osMatch[2];
      prescription.os.axis = osMatch[3] && osMatch[3].trim() !== '-' ? osMatch[3].trim() : '';
    }
  }

  if (!prescription.pd) {
    const pdMatch = msg.match(/\bPD:\s*([^\n]+)/i);
    if (pdMatch && pdMatch[1].trim() !== '-') prescription.pd = pdMatch[1].trim();
  }

  if (!prescription.add) {
    const addMatch = msg.match(/\bADD:\s*([^\n]+)/i);
    if (addMatch && addMatch[1].trim() !== '-') prescription.add = addMatch[1].trim();
  }

  if (!prescription.cc) {
    const ccMatch = msg.match(/\bCC:\s*([^\n]+)/i);
    if (ccMatch && ccMatch[1].trim() !== '-') prescription.cc = ccMatch[1].trim();
  }

  // Clean customer notes to remove auto-generated boilerplate and "Prescription File:"
  let clientNotes = '';
  if (customData?.prescription?.notes) {
    clientNotes = customData.prescription.notes.trim();
  } else if (inquiry.message) {
    const textBeforeDetails = inquiry.message.split(/\[Order Details\]/i)[0];
    const filteredLines = textBeforeDetails
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => {
        if (!l) return false;
        if (/^Prescription File:/i.test(l)) return false;
        if (/^Pesanan Custom Lensa:/i.test(l)) return false;
        if (/^Kebutuhan:/i.test(l)) return false;
        if (/^OD:/i.test(l)) return false;
        if (/^OS:/i.test(l)) return false;
        if (/^PD:/i.test(l)) return false;
        if (/^ADD:/i.test(l)) return false;
        if (/^CC:/i.test(l)) return false;
        if (/^Lensa:/i.test(l)) return false;
        if (/^Opsi:/i.test(l)) return false;
        if (/^Estimasi Total:/i.test(l)) return false;
        if (/^Resep:/i.test(l)) return false;
        return true;
      })
      .map((l) => l.replace(/^Catatan:\s*/i, ''));
    clientNotes = filteredLines.join('\n').trim();
  }

  return {
    productName,
    variantName,
    variantSku,
    lensName,
    lensCategory,
    selectedOptions,
    totalPrice,
    isUploadMode,
    prescriptionFileUrl,
    prescriptionFileName,
    prescription,
    clientNotes: clientNotes || undefined,
  };
}
