import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Phone,
  Trash2,
  X,
  Printer,
  Eye,
  FileText,
  Image as ImageIcon,
  Search,
  Send,
  Download,
} from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { EmptyState } from '../../components/admin/EmptyState';
import { useToast } from '../../components/admin/Toast';
import { useInquiryStore } from '../../store/useInquiryStore';
import { ContactInquiry, InquiryStatus } from '../../types/database';
import { PrintableOrderSheet } from '../../components/admin/PrintableOrderSheet';
import { getParsedInquiryData } from '../../lib/inquiryParser';

/**
 * Format phone number to international format for wa.me link
 */
function formatWhatsAppUrl(phone: string, text: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

export const AdminInquiriesPage: React.FC = () => {
  const { inquiries, isLoading, loadInquiries, updateStatus, deleteInquiry } = useInquiryStore();
  const { addToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [deletingInquiry, setDeletingInquiry] = useState<ContactInquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState<'internal' | 'vendor'>('internal');

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  // Status counts for quick dashboard badges
  const counts = useMemo(() => {
    const res = {
      all: inquiries.length,
      New: 0,
      Contacted: 0,
      'In Production': 0,
      Completed: 0,
      Canceled: 0,
    };
    inquiries.forEach((inq) => {
      if (inq.status in res) {
        res[inq.status as keyof typeof res]++;
      }
    });
    return res;
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        inq.name.toLowerCase().includes(q) ||
        (inq.phone && inq.phone.toLowerCase().includes(q)) ||
        (inq.email && inq.email.toLowerCase().includes(q)) ||
        (inq.product_name && inq.product_name.toLowerCase().includes(q)) ||
        (inq.variant_name && inq.variant_name.toLowerCase().includes(q)) ||
        (inq.subject && inq.subject.toLowerCase().includes(q)) ||
        (inq.message && inq.message.toLowerCase().includes(q))
      );
    });
  }, [inquiries, statusFilter, searchQuery]);

  const handleOpenDetail = (inq: ContactInquiry) => {
    setSelectedInquiry(inq);
    if (inq.status === 'New') {
      updateStatus(inq.id, 'Read');
    }
  };

  const handleStatusChange = async (newStatus: InquiryStatus) => {
    if (!selectedInquiry) return;
    await updateStatus(selectedInquiry.id, newStatus);
    setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    addToast({
      type: 'success',
      title: 'Status Diperbarui',
      message: `Pesanan ditandai sebagai "${newStatus}".`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingInquiry) return;
    setIsDeleting(true);
    const res = await deleteInquiry(deletingInquiry.id);
    setIsDeleting(false);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Pesanan Dihapus',
        message: 'Data pesanan custom telah dihapus dari sistem.',
      });
      if (selectedInquiry?.id === deletingInquiry.id) {
        setSelectedInquiry(null);
      }
      setDeletingInquiry(null);
    } else {
      addToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: res.error || 'Gagal menghapus pesanan.',
      });
    }
  };

  const handlePrint = (mode: 'internal' | 'vendor') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 60);
  };

  const selectedParsed = useMemo(() => {
    return selectedInquiry ? getParsedInquiryData(selectedInquiry) : null;
  }, [selectedInquiry]);

  const columns: Column<ContactInquiry>[] = [
    {
      header: 'Customer / Kontak WA',
      render: (inq) => {
        const isNew = inq.status === 'New';
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900 text-xs">{inq.name}</span>
              {isNew && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                  Baru
                </span>
              )}
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 font-mono">
              <Phone size={11} className="text-emerald-600 shrink-0" />
              <span className="text-neutral-700 font-medium">{inq.phone || '-'}</span>
              {inq.email && (
                <span className="text-neutral-400 truncate max-w-[140px] font-sans">
                  • {inq.email}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Frame & Varian',
      render: (inq) => {
        const parsed = getParsedInquiryData(inq);
        return (
          <div className="space-y-0.5">
            <span className="font-medium text-neutral-900 text-xs block truncate max-w-[180px]">
              {parsed.productName}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              {inq.variant_color_hex && (
                <span
                  className="w-2.5 h-2.5 rounded-full border border-neutral-300 shrink-0"
                  style={{ backgroundColor: inq.variant_color_hex }}
                />
              )}
              <span className="truncate max-w-[130px]">{parsed.variantName}</span>
              {parsed.variantSku !== '-' && (
                <span className="text-[10px] font-mono text-neutral-400">({parsed.variantSku})</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Resep Lensa',
      render: (inq) => {
        const parsed = getParsedInquiryData(inq);

        if (parsed.isUploadMode) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              <ImageIcon size={12} className="text-amber-600" />
              Upload Slip Resep
            </span>
          );
        }

        const rx = parsed.prescription;
        if (rx && (rx.od.sph !== '0.00' || rx.os.sph !== '0.00' || rx.pd)) {
          return (
            <div className="text-[11px] font-mono text-neutral-700">
              <div>R: {rx.od.sph || '0.00'} / {rx.od.cyl || '0.00'}</div>
              <div>L: {rx.os.sph || '0.00'} / {rx.os.cyl || '0.00'}</div>
            </div>
          );
        }

        return (
          <span className="text-[11px] text-neutral-400 italic">
            Non-Prescription / Plano
          </span>
        );
      },
    },
    {
      header: 'Paket & Total',
      render: (inq) => {
        const parsed = getParsedInquiryData(inq);
        return (
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-neutral-800 block truncate max-w-[160px]">
              {parsed.lensName}
            </span>
            <span className="text-[11px] font-bold font-mono text-neutral-900 block">
              {parsed.totalPrice}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Tanggal',
      className: 'w-28',
      render: (inq) => (
        <span className="text-[11px] text-neutral-500 block">
          {new Date(inq.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Status',
      className: 'w-28',
      render: (inq) => <StatusBadge status={inq.status} size="sm" />,
    },
    {
      header: 'Aksi',
      align: 'right',
      className: 'w-28',
      render: (inq) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenDetail(inq)}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <Eye size={12} />
            Detail
          </button>
          <button
            type="button"
            onClick={() => setDeletingInquiry(inq)}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Hapus pesanan"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Screen view content (hidden when printing) */}
      <div className="space-y-6 no-print">
        <PageHeader
          title="Pesanan Custom Lensa & Inquiries"
          description="Kelola pesanan kacamata custom dengan resep dokter, follow up customer melalui WhatsApp, dan cetak lembar workshop lab A4."
          breadcrumbs={[
            { label: 'Dashboard', path: '/admin' },
            { label: 'Custom Lens Inquiries' },
          ]}
        />

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-neutral-200 overflow-x-auto shadow-2xs max-w-full">
            {[
              { id: 'all', label: `Semua (${counts.all})` },
              { id: 'New', label: `Baru (${counts.New})` },
              { id: 'Contacted', label: `Dihubungi (${counts.Contacted})` },
              { id: 'In Production', label: `Lab (${counts['In Production']})` },
              { id: 'Completed', label: `Selesai (${counts.Completed})` },
              { id: 'Canceled', label: `Dibatalkan (${counts.Canceled})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, WA, frame..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-neutral-900 shadow-2xs"
            />
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredInquiries}
          keyExtractor={(inq) => inq.id}
          isLoading={isLoading}
          onRowClick={handleOpenDetail}
          emptyState={
            <EmptyState
              icon={MessageSquare}
              title="Belum Ada Pesanan Custom Lensa"
              description="Ketika customer menyelesaikan flow customisasi lensa di etalase, pesanan akan otomatis masuk ke sini."
            />
          }
        />
      </div>

      {/* Detail Slide-over / Modal (hidden on print) */}
      {selectedInquiry && selectedParsed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
          <div
            onClick={() => setSelectedInquiry(null)}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 z-10 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-xs font-mono font-bold bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded">
                    REF #{selectedInquiry.id.startsWith('inq-') ? selectedInquiry.id.replace('inq-', '').slice(-6).toUpperCase() : selectedInquiry.id.slice(-6).toUpperCase()}
                  </span>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {selectedInquiry.name}
                  </h3>
                  <StatusBadge status={selectedInquiry.status} size="sm" />
                </div>
                <span className="text-xs text-neutral-400">
                  Diterima: {new Date(selectedInquiry.created_at).toLocaleString('id-ID')}
                </span>
              </div>

              {/* Print Action Buttons (Internal & Vendor) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrint('internal')}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Cetak lembar pesanan internal lengkap dengan data customer"
                >
                  <Printer size={13} />
                  <span>Cetak Internal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint('vendor')}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Cetak lembar kerja vendor/lab (anonim, tanpa nama & nomor WhatsApp)"
                >
                  <FileText size={13} className="text-sky-700" />
                  <span>Cetak Vendor (Lab)</span>
                </button>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick WhatsApp Reachout Banner */}
            {selectedInquiry.phone && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950">
                      Reach Out ke Customer via WhatsApp
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      No. WhatsApp aktif: <span className="font-semibold font-mono">{selectedInquiry.phone}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={formatWhatsAppUrl(
                    selectedInquiry.phone,
                    `Halo Kak ${selectedInquiry.name},\n\nTerima kasih telah memesan custom lensa di JEM LUIQA Eyewear Atelier.\nKami telah menerima spesifikasi pesanan Kakak untuk frame *${selectedParsed.productName}*.\n\nKami ingin mengonfirmasi detail pesanan dan verifikasi resep sebelum diproses ke lab workshop. Apakah ada waktu luang untuk kami bantu cek kembali? Terima kasih.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleStatusChange('Contacted')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                >
                  <Send size={13} />
                  <span>Kirim Pesan WhatsApp</span>
                </a>
              </div>
            )}

            {/* 2-Column Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Info */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2.5">
                <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-500 block">
                  Informasi Customer
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Nama:</span>
                    <span className="font-semibold text-neutral-900">{selectedInquiry.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">No. WhatsApp:</span>
                    <span className="font-semibold text-emerald-700 font-mono">
                      {selectedInquiry.phone || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Email:</span>
                    <span className="text-neutral-800">{selectedInquiry.email || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Frame & Variant */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2.5">
                <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-500 block">
                  Frame yang Dipilih
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Model Frame:</span>
                    <span className="font-semibold text-neutral-900">
                      {selectedParsed.productName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Warna / Varian:</span>
                    <div className="flex items-center gap-1.5">
                      {selectedInquiry.variant_color_hex && (
                        <span
                          className="w-3 h-3 rounded-full border border-neutral-300"
                          style={{ backgroundColor: selectedInquiry.variant_color_hex }}
                        />
                      )}
                      <span className="font-semibold text-neutral-800">
                        {selectedParsed.variantName}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SKU Code:</span>
                    <span className="font-mono text-neutral-600">
                      {selectedParsed.variantSku}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prescription Section */}
            <div className="border border-neutral-200 rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-neutral-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Spesifikasi Resep (Prescription Data)
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-neutral-500">
                  {selectedParsed.isUploadMode ? 'Upload Slip Resep' : 'Manual Diopter Input'}
                </span>
              </div>

              {/* Uploaded Slip Mode */}
              {selectedParsed.isUploadMode ? (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <ImageIcon size={18} className="text-amber-700" />
                      <div>
                        <div className="text-xs font-semibold text-amber-950">
                          Foto / Dokumen Resep Dokter Terlampir
                        </div>
                        <div className="text-[10px] text-amber-700">
                          Customer mengunggah foto / dokumen resep resmi.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedParsed.prescriptionFileUrl && (
                        <>
                          <button
                            type="button"
                            onClick={() => setImagePreviewUrl(selectedParsed.prescriptionFileUrl!)}
                            className="px-2.5 py-1 text-xs font-medium bg-white text-neutral-800 rounded-md border border-neutral-200 hover:bg-neutral-50 shadow-2xs flex items-center gap-1"
                          >
                            <Eye size={12} />
                            Lihat Gambar
                          </button>
                          <a
                            href={selectedParsed.prescriptionFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 text-xs font-medium bg-white text-neutral-800 rounded-md border border-neutral-200 hover:bg-neutral-50 shadow-2xs flex items-center gap-1"
                          >
                            <Download size={12} />
                            Buka Asli
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Inline Thumbnail Preview */}
                  {selectedParsed.prescriptionFileUrl && (
                    <div
                      onClick={() => setImagePreviewUrl(selectedParsed.prescriptionFileUrl!)}
                      className="cursor-pointer group relative border border-neutral-200 rounded-lg overflow-hidden bg-neutral-900/5 max-h-56 flex items-center justify-center p-2"
                    >
                      <img
                        src={selectedParsed.prescriptionFileUrl}
                        alt="Prescription Attachment"
                        className="max-h-48 object-contain rounded transition-transform group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-neutral-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-2xs">
                        <Eye size={16} /> Klik untuk Perbesar Resep
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Manual Diopter Grid */
                <div className="space-y-3">
                  <table className="w-full text-xs text-left border-collapse border border-neutral-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-neutral-100 text-neutral-700 text-[10px] uppercase font-bold tracking-wider">
                        <th className="border border-neutral-200 p-2 text-center w-24">Mata</th>
                        <th className="border border-neutral-200 p-2 text-center">SPH</th>
                        <th className="border border-neutral-200 p-2 text-center">CYL</th>
                        <th className="border border-neutral-200 p-2 text-center">AXIS</th>
                        <th className="border border-neutral-200 p-2 text-center">ADD</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-neutral-200 p-2 font-bold text-center bg-neutral-50">
                          OD (Kanan)
                        </td>
                        <td className="border border-neutral-200 p-2 text-center font-mono font-medium">
                          {selectedParsed.prescription.od.sph || '0.00'}
                        </td>
                        <td className="border border-neutral-200 p-2 text-center font-mono font-medium">
                          {selectedParsed.prescription.od.cyl || '0.00'}
                        </td>
                        <td className="border border-neutral-200 p-2 text-center font-mono font-medium">
                          {selectedParsed.prescription.od.axis ? `${selectedParsed.prescription.od.axis}°` : '-'}
                        </td>
                        <td className="border border-neutral-200 p-2 text-center font-mono font-medium" rowSpan={2}>
                          {selectedParsed.prescription.add ? (selectedParsed.prescription.add.startsWith('+') ? selectedParsed.prescription.add : `+${selectedParsed.prescription.add}`) : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-neutral-200 p-2 font-bold text-center bg-neutral-50">
                          OS (Kiri)
                        </td>
                        <td className="border border-neutral-200 p-2 text-center font-mono font-medium">
                          {selectedParsed.prescription.os.sph || '0.00'}
                        </td>
                        <td className="border border-neutral-200 p-2 text-center font-mono font-medium">
                          {selectedParsed.prescription.os.cyl || '0.00'}
                        </td>
                        <td className="border border-neutral-200 p-2 text-center font-mono font-medium">
                          {selectedParsed.prescription.os.axis ? `${selectedParsed.prescription.os.axis}°` : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                        Pupillary Distance (PD)
                      </span>
                      <span className="font-bold text-neutral-900 text-sm font-mono">
                        {selectedParsed.prescription.pd ? `${selectedParsed.prescription.pd} mm` : '-'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                        Chief Complaint / Catatan (CC)
                      </span>
                      <span className="font-medium text-neutral-800">
                        {selectedParsed.prescription.cc || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Consultation Message (Only shown if customer wrote custom notes) */}
              {selectedParsed.clientNotes && (
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs text-neutral-700 whitespace-pre-wrap">
                  <span className="font-semibold text-neutral-500 block text-[10px] uppercase mb-1">
                    Catatan Khusus dari Customer:
                  </span>
                  {selectedParsed.clientNotes}
                </div>
              )}
            </div>

            {/* Lens Specification & Price Breakdown */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <div>
                  <div className="text-xs font-bold text-neutral-900">
                    {selectedParsed.lensName}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    JEM LUIQA Atelier • {selectedParsed.lensCategory}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                    Total Estimasi Pesanan
                  </span>
                  <span className="text-base font-bold font-mono text-neutral-900">
                    {selectedParsed.totalPrice}
                  </span>
                </div>
              </div>

              {selectedParsed.selectedOptions &&
                Object.keys(selectedParsed.selectedOptions).length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                      Opsi & Treatment Tambahan:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedParsed.selectedOptions).map(
                        ([optKey, optVal]) => (
                          <span
                            key={optKey}
                            className="inline-block px-2.5 py-1 text-xs rounded bg-white border border-neutral-200 text-neutral-700 font-medium"
                          >
                            <span className="capitalize text-neutral-400 font-normal">{optKey}:</span> {optVal}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Status Workflow Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <span className="text-xs font-semibold text-neutral-700 block">
                Ubah Status Pesanan:
              </span>
              <div className="flex flex-wrap gap-2">
                {(['New', 'Contacted', 'In Production', 'Completed', 'Canceled'] as InquiryStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedInquiry.status === st
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Prescription Image Preview (Highest Z-Index) */}
      {imagePreviewUrl && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md no-print"
          style={{ zIndex: 99999 }}
          onClick={() => setImagePreviewUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col items-center"
            style={{ zIndex: 100000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center pb-3 border-b border-neutral-200 mb-2">
              <span className="text-xs font-bold text-neutral-800">
                Pratinjau Resep Dokter / Optik (Resolusi Penuh)
              </span>
              <button
                type="button"
                onClick={() => setImagePreviewUrl(null)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] w-full flex items-center justify-center p-2 bg-neutral-50 rounded-xl">
              <img
                src={imagePreviewUrl}
                alt="Prescription Full Resolution"
                className="max-h-[70vh] object-contain rounded shadow-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingInquiry)}
        title="Hapus Pesanan Custom Lensa"
        message={`Apakah Anda yakin ingin menghapus data pesanan dari "${deletingInquiry?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Pesanan"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingInquiry(null)}
      />

      {/* Printable Sheet (Visible ONLY on window.print()) */}
      {selectedInquiry && (
        <PrintableOrderSheet inquiry={selectedInquiry} mode={printMode} />
      )}
    </div>
  );
};
