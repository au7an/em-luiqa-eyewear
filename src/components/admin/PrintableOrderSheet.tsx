import React from 'react';
import { ContactInquiry } from '../../types/database';
import { getParsedInquiryData } from '../../lib/inquiryParser';

interface PrintableOrderSheetProps {
  inquiry: ContactInquiry;
  mode?: 'internal' | 'vendor';
}

export const PrintableOrderSheet: React.FC<PrintableOrderSheetProps> = ({
  inquiry,
  mode = 'internal',
}) => {
  const parsed = getParsedInquiryData(inquiry);
  const rx = parsed.prescription;
  const isVendor = mode === 'vendor';

  const orderRef = inquiry.id.startsWith('inq-')
    ? `JL-${inquiry.id.replace('inq-', '').slice(-6).toUpperCase()}`
    : `JL-${inquiry.id.slice(-6).toUpperCase()}`;

  const formattedDate = new Date(inquiry.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id="printable-order-sheet"
      className="w-full bg-white text-neutral-900 font-sans p-4 text-[11px] leading-tight"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-2.5 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-serif font-black tracking-wider uppercase text-neutral-900">
              JEM LUIQA
            </h1>
            <span
              className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                isVendor
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-200 text-neutral-800'
              }`}
            >
              {isVendor ? 'VENDOR / LAB PRODUCTION SHEET' : 'INTERNAL CLIENT ORDER'}
            </span>
          </div>
          <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-medium mt-0.5">
            Haute Lunetterie Atelier • {isVendor ? 'Optical Lab Manufacturing Sheet' : 'Workshop Dispensing Sheet'}
          </p>
        </div>

        <div className="text-right">
          <div className="inline-block border border-neutral-900 px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider uppercase">
            REF #{orderRef}
          </div>
          <div className="text-[9px] text-neutral-500 font-mono mt-0.5">
            Date: {formattedDate}
          </div>
          <div className="text-[9px] font-bold text-neutral-800 uppercase mt-0.5">
            Status: {inquiry.status}
          </div>
        </div>
      </div>

      {/* Grid: Client & Frame Info */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Client Profile / Vendor Reference */}
        <div className="border border-neutral-300 rounded p-2.5 bg-neutral-50/50">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 border-b border-neutral-200 pb-1 mb-1.5">
            {isVendor ? '1. Order Reference & Confidentiality' : '1. Client Information'}
          </h2>
          <div className="space-y-1 text-[11px]">
            <div className="flex">
              <span className="w-24 font-semibold text-neutral-500">
                {isVendor ? 'Client Code:' : 'Name:'}
              </span>
              <span className="font-bold text-neutral-900">
                {isVendor ? `CLIENT REF #${orderRef} (CONFIDENTIAL)` : inquiry.name}
              </span>
            </div>
            <div className="flex">
              <span className="w-24 font-semibold text-neutral-500">
                {isVendor ? 'Routing:' : 'WhatsApp / Tel:'}
              </span>
              <span className="font-mono text-neutral-900">
                {isVendor ? 'Via JEM LUIQA Atelier Concierge' : inquiry.phone || '-'}
              </span>
            </div>
            <div className="flex">
              <span className="w-24 font-semibold text-neutral-500">
                {isVendor ? 'Lab Support:' : 'Email:'}
              </span>
              <span className="text-neutral-700">
                {isVendor ? 'atelier-workshop@jemluiqa.com' : inquiry.email || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Frame & Model */}
        <div className="border border-neutral-300 rounded p-2.5 bg-neutral-50/50">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 border-b border-neutral-200 pb-1 mb-1.5">
            2. Selected Eyewear Frame
          </h2>
          <div className="space-y-1 text-[11px]">
            <div className="flex">
              <span className="w-24 font-semibold text-neutral-500">Model Name:</span>
              <span className="font-bold text-neutral-900">{parsed.productName}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-semibold text-neutral-500">Colorway:</span>
              <span className="text-neutral-800">{parsed.variantName}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-semibold text-neutral-500">SKU / Code:</span>
              <span className="font-mono text-neutral-700">{parsed.variantSku}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lens Specification */}
      <div className="border border-neutral-300 rounded p-2.5 mb-3">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 border-b border-neutral-200 pb-1 mb-1.5">
          3. Lens Specification & Treatments
        </h2>
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <div className="text-[9px] uppercase font-semibold text-neutral-500 mb-0.5">
              Package & Optical Category
            </div>
            <div className="font-bold text-neutral-900 text-xs">{parsed.lensName}</div>
            <div className="text-neutral-600 text-[10px] mt-0.5">
              Category: {parsed.lensCategory}
            </div>
          </div>

          <div>
            <div className="text-[9px] uppercase font-semibold text-neutral-500 mb-0.5">
              Add-ons / Coating / Tint
            </div>
            {parsed.selectedOptions && Object.keys(parsed.selectedOptions).length > 0 ? (
              <ul className="list-disc list-inside space-y-0.5 text-neutral-800">
                {Object.entries(parsed.selectedOptions).map(([key, val]) => (
                  <li key={key}>
                    <span className="capitalize">{key}</span>: <span className="font-medium">{val}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-neutral-500 italic">Standard Premium Anti-Reflective</span>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Matrix or Upload Slip */}
      <div className="border border-neutral-300 rounded p-2.5 mb-3">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-1 mb-2">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
            4. Prescription Data (Rx Matrix)
          </h2>
          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-200 text-neutral-800">
            {parsed.isUploadMode ? 'Doctor / Optical Slip Upload' : 'Manual Diopter Entry'}
          </span>
        </div>

        {parsed.isUploadMode ? (
          <div className="space-y-2">
            {parsed.prescriptionFileUrl ? (
              <div className="text-center p-1.5 border border-dashed border-neutral-300 rounded">
                <img
                  src={parsed.prescriptionFileUrl}
                  alt="Dokumen Resep Terlampir"
                  className="max-h-56 mx-auto object-contain border border-neutral-200 rounded"
                />
              </div>
            ) : (
              <div className="text-[11px] text-neutral-700 bg-neutral-50 border border-neutral-200 p-2 rounded">
                <span className="font-semibold">Slip Resep Dokter / Dokumen Optik Resmi Terlampir</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <table className="w-full text-[11px] text-left border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100 text-neutral-700 uppercase text-[9px] tracking-wider">
                  <th className="border border-neutral-300 p-1.5 text-center w-28">Eye</th>
                  <th className="border border-neutral-300 p-1.5 text-center">SPH (Sphere)</th>
                  <th className="border border-neutral-300 p-1.5 text-center">CYL (Cylinder)</th>
                  <th className="border border-neutral-300 p-1.5 text-center">AXIS</th>
                  <th className="border border-neutral-300 p-1.5 text-center">ADD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-neutral-300 p-1.5 font-bold text-center bg-neutral-50">
                    OD (Right Eye)
                  </td>
                  <td className="border border-neutral-300 p-1.5 text-center font-mono font-medium">
                    {rx.od.sph || '0.00'}
                  </td>
                  <td className="border border-neutral-300 p-1.5 text-center font-mono font-medium">
                    {rx.od.cyl || '0.00'}
                  </td>
                  <td className="border border-neutral-300 p-1.5 text-center font-mono font-medium">
                    {rx.od.axis ? `${rx.od.axis}°` : '-'}
                  </td>
                  <td
                    className="border border-neutral-300 p-1.5 text-center font-mono font-medium"
                    rowSpan={2}
                  >
                    {rx.add ? (rx.add.startsWith('+') ? rx.add : `+${rx.add}`) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-neutral-300 p-1.5 font-bold text-center bg-neutral-50">
                    OS (Left Eye)
                  </td>
                  <td className="border border-neutral-300 p-1.5 text-center font-mono font-medium">
                    {rx.os.sph || '0.00'}
                  </td>
                  <td className="border border-neutral-300 p-1.5 text-center font-mono font-medium">
                    {rx.os.cyl || '0.00'}
                  </td>
                  <td className="border border-neutral-300 p-1.5 text-center font-mono font-medium">
                    {rx.os.axis ? `${rx.os.axis}°` : '-'}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-1.5 bg-neutral-50 border border-neutral-200 rounded flex items-center justify-between">
                <span className="font-semibold text-neutral-500 text-[10px] uppercase">
                  Pupillary Distance (PD):
                </span>
                <span className="font-bold text-neutral-900 font-mono">
                  {rx.pd ? `${rx.pd} mm` : '-'}
                </span>
              </div>

              <div className="p-1.5 bg-neutral-50 border border-neutral-200 rounded flex items-center justify-between">
                <span className="font-semibold text-neutral-500 text-[10px] uppercase">
                  Chief Complaint / CC:
                </span>
                <span className="font-medium text-neutral-900 truncate max-w-[180px]">
                  {rx.cc || '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Special Instructions (Sanitized for vendor if applicable) */}
        {parsed.clientNotes && !isVendor && (
          <div className="mt-2 pt-1.5 border-t border-neutral-200 text-[10px]">
            <span className="font-semibold text-neutral-600 block uppercase mb-0.5">
              Client Consultation Notes:
            </span>
            <p className="text-neutral-800 bg-neutral-50 p-1.5 rounded whitespace-pre-wrap">
              {parsed.clientNotes}
            </p>
          </div>
        )}
      </div>

      {/* Commercial / Price Summary */}
      <div className="flex justify-end mb-3">
        <div className="w-72 border border-neutral-300 rounded p-2 bg-neutral-50 text-right">
          <span className="text-[9px] uppercase font-semibold text-neutral-500 block mb-0.5">
            {isVendor ? 'Production Billing Terms:' : 'Total Price Quote:'}
          </span>
          <span className="text-sm font-bold text-neutral-900 font-mono">
            {isVendor ? 'B2B CONTRACT (COMMERCIAL CONFIDENTIAL)' : parsed.totalPrice}
          </span>
        </div>
      </div>

      {/* Workshop & Optician QA Sign-off */}
      <div className="border-t-2 border-neutral-900 pt-2.5 mb-3" style={{ breakInside: 'avoid' }}>
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-2">
          5. Optical Workshop Sign-off & Quality Assurance
        </h2>

        <div className="grid grid-cols-4 gap-2 text-[9px] text-neutral-600 mb-3">
          <div className="flex items-center gap-1.5 border border-neutral-200 p-1.5 rounded">
            <input type="checkbox" className="w-3 h-3" readOnly />
            <span>Axis & Optical Center</span>
          </div>
          <div className="flex items-center gap-1.5 border border-neutral-200 p-1.5 rounded">
            <input type="checkbox" className="w-3 h-3" readOnly />
            <span>Lensmeter Reading</span>
          </div>
          <div className="flex items-center gap-1.5 border border-neutral-200 p-1.5 rounded">
            <input type="checkbox" className="w-3 h-3" readOnly />
            <span>Bevel Edging Fit</span>
          </div>
          <div className="flex items-center gap-1.5 border border-neutral-200 p-1.5 rounded">
            <input type="checkbox" className="w-3 h-3" readOnly />
            <span>Anti-Glare Clean</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-2">
          <div className="border-b border-neutral-400 pb-7">
            <span className="text-[9px] uppercase font-semibold text-neutral-500 block">
              {isVendor ? 'Lab Edging Technician Sign-off:' : 'Optician / Lens Edger Signature:'}
            </span>
          </div>
          <div className="border-b border-neutral-400 pb-7">
            <span className="text-[9px] uppercase font-semibold text-neutral-500 block">
              Studio Quality Assurance Lead:
            </span>
          </div>
        </div>
      </div>

      {/* Document Footer */}
      <div className="text-center text-[8px] text-neutral-400 uppercase tracking-widest pt-1 border-t border-neutral-100">
        JEM LUIQA Atelier Eyewear • Jakarta Flagship • {isVendor ? 'Vendor Optical Manufacturing Document' : 'Confidential Client Optical Prescription Sheet'}
      </div>
    </div>
  );
};
