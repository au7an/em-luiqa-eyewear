import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { AuditLogEntry } from '../../types/database';
import { AuditActionBadge } from './AuditActionBadge';

interface AuditDetailDrawerProps {
  entry: AuditLogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditDetailDrawer: React.FC<AuditDetailDrawerProps> = ({
  entry,
  isOpen,
  onClose,
}) => {
  const [showRawBefore, setShowRawBefore] = useState(false);
  const [showRawAfter, setShowRawAfter] = useState(false);
  const [showRawMeta, setShowRawMeta] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!entry) return null;

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object') return JSON.stringify(val, null, 1);
    return String(val);
  };

  // Compute field diffs for updates
  const computeDiffs = () => {
    if (!entry.before_data || !entry.after_data) return [];
    const before = entry.before_data;
    const after = entry.after_data;
    const allKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

    const diffs: { key: string; before: any; after: any }[] = [];
    for (const k of allKeys) {
      if (k === 'updated_at' || k === 'created_at') continue;
      const b = before[k];
      const a = after[k];
      if (JSON.stringify(b) !== JSON.stringify(a)) {
        diffs.push({ key: k, before: b, after: a });
      }
    }
    return diffs;
  };

  const diffs = computeDiffs();
  const isUpdateLike =
    entry.action === 'UPDATE' ||
    entry.action === 'PUBLISH' ||
    entry.action === 'UNPUBLISH' ||
    entry.action === 'ACTIVATE' ||
    entry.action === 'DEACTIVATE';

  const formatKeyName = (k: string) => {
    return k.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col border-l border-neutral-200 select-text"
          >
            {/* Header */}
            <div className="p-5 border-b border-neutral-200 bg-neutral-50/75 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <AuditActionBadge action={entry.action} size="md" />
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                    Audit Log Detail
                  </h2>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    ID: {entry.id.slice(0, 18)}...
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
                title="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Target Entity Card */}
              <div className="p-4 rounded-xl bg-neutral-900 text-white space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400">
                    Target Resource
                  </span>
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-neutral-300">
                    {entry.entity_type}
                  </span>
                </div>
                <div className="text-base font-bold tracking-tight text-white">
                  {entry.entity_label || entry.entity_id || 'Untitled Resource'}
                </div>
                {entry.entity_id && (
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-[11px] font-mono text-neutral-400">
                    <span>ID: {entry.entity_id}</span>
                    <button
                      onClick={() => handleCopy(entry.entity_id || '', 'entity_id')}
                      className="hover:text-white transition-colors flex items-center gap-1"
                      title="Copy ID"
                    >
                      {copiedKey === 'entity_id' ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>{copiedKey === 'entity_id' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50">
                  <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                    <Clock size={13} />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">
                      Timestamp
                    </span>
                  </div>
                  <div className="font-semibold text-neutral-900">
                    {new Date(entry.created_at).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50">
                  <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                    <User size={13} />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">
                      Admin Email
                    </span>
                  </div>
                  <div className="font-semibold text-neutral-900 truncate" title={entry.actor_email || 'System'}>
                    {entry.actor_email || 'System / Service'}
                  </div>
                </div>
              </div>

              {/* Diffs / Changed Fields Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    {isUpdateLike ? 'Changed Fields' : entry.action === 'CREATE' ? 'Created Fields' : 'Deleted Data'}
                  </h3>
                  {isUpdateLike && (
                    <span className="text-[11px] text-neutral-400 font-medium">
                      {diffs.length} {diffs.length === 1 ? 'field modified' : 'fields modified'}
                    </span>
                  )}
                </div>

                {isUpdateLike ? (
                  diffs.length === 0 ? (
                    <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 text-xs text-center">
                      No field changes detected outside timestamps.
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 overflow-hidden bg-white">
                      {diffs.map((d) => (
                        <div key={d.key} className="p-3 text-xs space-y-1.5">
                          <div className="font-semibold text-[11px] tracking-wider text-neutral-500">
                            {formatKeyName(d.key)}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                            {/* Old Value */}
                            <div className="p-2 rounded bg-rose-50/70 border border-rose-200/70 text-rose-900 font-mono text-[11px] break-all">
                              <span className="text-[9px] uppercase font-bold text-rose-500 block mb-0.5">
                                Before
                              </span>
                              {formatValue(d.before)}
                            </div>

                            {/* New Value */}
                            <div className="p-2 rounded bg-emerald-50/70 border border-emerald-200/70 text-emerald-900 font-mono text-[11px] break-all">
                              <span className="text-[9px] uppercase font-bold text-emerald-500 block mb-0.5">
                                After
                              </span>
                              {formatValue(d.after)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : entry.action === 'CREATE' ? (
                  <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 overflow-hidden bg-white max-h-80 overflow-y-auto">
                    {entry.after_data &&
                      Object.entries(entry.after_data)
                        .filter(([k]) => k !== 'created_at' && k !== 'updated_at')
                        .map(([k, v]) => (
                          <div key={k} className="p-2.5 flex items-start justify-between gap-4 text-xs">
                            <span className="font-medium text-neutral-500 text-[11px]">
                              {formatKeyName(k)}
                            </span>
                            <span className="font-mono text-neutral-900 text-[11px] text-right break-all">
                              {formatValue(v)}
                            </span>
                          </div>
                        ))}
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 overflow-hidden bg-white max-h-80 overflow-y-auto">
                    {entry.before_data &&
                      Object.entries(entry.before_data).map(([k, v]) => (
                        <div key={k} className="p-2.5 flex items-start justify-between gap-4 text-xs">
                          <span className="font-medium text-neutral-500 text-[11px]">
                            {formatKeyName(k)}
                          </span>
                          <span className="font-mono text-neutral-900 text-[11px] text-right break-all">
                            {formatValue(v)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Collapsible Raw JSON Section */}
              <div className="space-y-2 pt-2 border-t border-neutral-200">
                <div className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                  Raw JSON Payloads
                </div>

                {/* Before Data Accordion */}
                {entry.before_data && (
                  <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setShowRawBefore(!showRawBefore)}
                      className="w-full p-2.5 bg-neutral-50 hover:bg-neutral-100 text-left flex items-center justify-between text-xs font-semibold text-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        {showRawBefore ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span>before_data JSON</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {Object.keys(entry.before_data).length} keys
                      </span>
                    </button>
                    {showRawBefore && (
                      <div className="relative p-3 bg-neutral-900 text-neutral-100 font-mono text-[11px] max-h-60 overflow-y-auto">
                        <button
                          onClick={() => handleCopy(JSON.stringify(entry.before_data, null, 2), 'raw_before')}
                          className="absolute top-2 right-2 p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                          title="Copy JSON"
                        >
                          {copiedKey === 'raw_before' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                        <pre>{JSON.stringify(entry.before_data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* After Data Accordion */}
                {entry.after_data && (
                  <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setShowRawAfter(!showRawAfter)}
                      className="w-full p-2.5 bg-neutral-50 hover:bg-neutral-100 text-left flex items-center justify-between text-xs font-semibold text-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        {showRawAfter ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span>after_data JSON</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {Object.keys(entry.after_data).length} keys
                      </span>
                    </button>
                    {showRawAfter && (
                      <div className="relative p-3 bg-neutral-900 text-neutral-100 font-mono text-[11px] max-h-60 overflow-y-auto">
                        <button
                          onClick={() => handleCopy(JSON.stringify(entry.after_data, null, 2), 'raw_after')}
                          className="absolute top-2 right-2 p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                          title="Copy JSON"
                        >
                          {copiedKey === 'raw_after' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                        <pre>{JSON.stringify(entry.after_data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Metadata Accordion */}
                {entry.metadata && (
                  <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setShowRawMeta(!showRawMeta)}
                      className="w-full p-2.5 bg-neutral-50 hover:bg-neutral-100 text-left flex items-center justify-between text-xs font-semibold text-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        {showRawMeta ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span>metadata JSON</span>
                      </div>
                    </button>
                    {showRawMeta && (
                      <div className="p-3 bg-neutral-900 text-neutral-100 font-mono text-[11px] max-h-40 overflow-y-auto">
                        <pre>{JSON.stringify(entry.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50/75 flex justify-end shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                Close Details
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
