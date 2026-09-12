import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Mail,
  Phone,
  Trash2,
  X,
} from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { EmptyState } from '../../components/admin/EmptyState';
import { useToast } from '../../components/admin/Toast';
import { useInquiryStore } from '../../store/useInquiryStore';
import { ContactInquiry, InquiryStatus } from '../../types/database';
import { cleanPhoneNumber } from '../../lib/whatsapp';

export const AdminInquiriesPage: React.FC = () => {
  const { inquiries, isLoading, loadInquiries, updateStatus, deleteInquiry } = useInquiryStore();
  const { addToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [deletingInquiry, setDeletingInquiry] = useState<ContactInquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const filteredInquiries = useMemo(() => {
    if (statusFilter === 'all') return inquiries;
    return inquiries.filter((inq) => inq.status === statusFilter);
  }, [inquiries, statusFilter]);

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
      title: 'Status Updated',
      message: `Inquiry marked as ${newStatus}.`,
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
        title: 'Inquiry Deleted',
        message: 'Message removed.',
      });
      if (selectedInquiry?.id === deletingInquiry.id) {
        setSelectedInquiry(null);
      }
      setDeletingInquiry(null);
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: res.error || 'Failed to delete inquiry.',
      });
    }
  };

  const columns: Column<ContactInquiry>[] = [
    {
      header: 'Client / Contact',
      render: (inq) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">{inq.name}</span>
            {inq.status === 'New' && (
              <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
            )}
          </div>
          <div className="text-[11px] text-neutral-400 font-light flex items-center gap-2 mt-0.5">
            <span>{inq.email}</span>
            {inq.phone && <span>• {inq.phone}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Subject & Message',
      render: (inq) => (
        <div>
          <span className="font-medium text-neutral-800 block text-xs">
            {inq.subject || 'Eyewear Consultation'}
          </span>
          <p className="text-[11px] text-neutral-400 font-light line-clamp-1 mt-0.5">
            {inq.message}
          </p>
        </div>
      ),
    },
    {
      header: 'Date',
      className: 'w-32',
      render: (inq) => (
        <span className="text-[11px] text-neutral-500">
          {new Date(inq.created_at).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Status',
      className: 'w-24',
      render: (inq) => <StatusBadge status={inq.status} size="sm" />,
    },
    {
      header: 'Actions',
      align: 'right',
      className: 'w-24',
      render: (inq) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenDetail(inq)}
            className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 text-xs font-semibold"
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => setDeletingInquiry(inq)}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Delete inquiry"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Inquiries & Consultation Requests"
        description="Review incoming prescription lens customization questions, fitting requests, and studio inquiries."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Inquiries' },
        ]}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-neutral-200 w-fit overflow-x-auto shadow-2xs">
        {[
          { id: 'all', label: 'All Messages' },
          { id: 'New', label: 'New (Unread)' },
          { id: 'Read', label: 'Read' },
          { id: 'Replied', label: 'Replied' },
          { id: 'Closed', label: 'Closed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              statusFilter === tab.id
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredInquiries}
        keyExtractor={(inq) => inq.id}
        isLoading={isLoading}
        onRowClick={handleOpenDetail}
        emptyState={
          <EmptyState
            icon={MessageSquare}
            title="No Inquiries Found"
            description="No client messages match your current filter."
          />
        }
      />

      {/* Detail Slide-over / Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedInquiry(null)}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
          />

          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 z-10 space-y-6">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h3 className="text-base font-bold text-neutral-900">
                    {selectedInquiry.name}
                  </h3>
                  <StatusBadge status={selectedInquiry.status} size="sm" />
                </div>
                <span className="text-xs text-neutral-400">
                  Received {new Date(selectedInquiry.created_at).toLocaleString('id-ID')}
                </span>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-0.5">
                  Email
                </span>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="text-neutral-800 font-medium hover:underline flex items-center gap-1"
                >
                  <Mail size={13} />
                  <span>{selectedInquiry.email}</span>
                </a>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-0.5">
                  Phone / WhatsApp
                </span>
                {selectedInquiry.phone ? (
                  <a
                    href={`https://wa.me/${cleanPhoneNumber(selectedInquiry.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
                  >
                    <Phone size={13} />
                    <span>{selectedInquiry.phone}</span>
                  </a>
                ) : (
                  <span className="text-neutral-400">Not provided</span>
                )}
              </div>
            </div>

            {/* Inquiry Content */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                Subject: {selectedInquiry.subject || 'Eyewear Consultation'}
              </span>
              <div className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-100 text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Status updates & actions */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-700">
                  Mark Status:
                </span>
                <div className="flex gap-1.5">
                  {(['New', 'Read', 'Replied', 'Closed'] as InquiryStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        selectedInquiry.status === st
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Reply Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {selectedInquiry.phone && (
                  <a
                    href={`https://wa.me/${cleanPhoneNumber(selectedInquiry.phone)}?text=${encodeURIComponent(
                      `Halo ${selectedInquiry.name}, terima kasih telah menghubungi JEM LUIQA Eyewear Concierge mengenai "${selectedInquiry.subject}".`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleStatusChange('Replied')}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <Phone size={14} />
                    <span>Reply on WhatsApp</span>
                  </a>
                )}

                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(
                    selectedInquiry.subject || 'JEM LUIQA Inquiry'
                  )}`}
                  onClick={() => handleStatusChange('Replied')}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Mail size={14} />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingInquiry)}
        title="Delete Inquiry Message"
        message={`Are you sure you want to delete inquiry from "${deletingInquiry?.name}"?`}
        confirmText="Delete Message"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingInquiry(null)}
      />
    </div>
  );
};
