import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  MessageCircle,
  ChevronDown,
  Upload,
  FileText,
  CheckCircle2,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  Product,
  ProductVariant,
  VisionType,
  LensRequirement,
  PrescriptionData,
  CustomLensSelection,
} from '../../types/database';
import { useLensStore } from '../../store/useLensStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useInquiryStore } from '../../store/useInquiryStore';
import { uploadMediaToStorage } from '../../lib/storage';
import { validatePrescriptionFile, compressImage } from '../../lib/imageCompressor';
import { parsePriceToNumber, formatRupiahDisplay } from '../../lib/currency';
import { AnimatedButton } from '../common/AnimatedButton';

interface LensCustomizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  variant?: ProductVariant;
}

// Generate stepped diopter values for optical precision
const SPH_OPTIONS = (() => {
  const opts: string[] = [];
  // +6.00 down to +0.25
  for (let val = 6.0; val >= 0.25; val -= 0.25) {
    opts.push(`+${val.toFixed(2)}`);
  }
  // 0.00
  opts.push('0.00 (Plano)');
  // -0.25 down to -10.00
  for (let val = -0.25; val >= -10.0; val -= 0.25) {
    opts.push(val.toFixed(2));
  }
  return opts;
})();

const CYL_OPTIONS = (() => {
  const opts: string[] = ['0.00 (None)'];
  for (let val = -0.25; val >= -4.0; val -= 0.25) {
    opts.push(val.toFixed(2));
  }
  return opts;
})();



export const LensCustomizationDrawer: React.FC<LensCustomizationDrawerProps> = ({
  isOpen,
  onClose,
  product,
  variant,
}) => {
  const { activeLenses, loadActiveLenses } = useLensStore();
  const { t, language } = useLanguageStore();

  useEffect(() => {
    loadActiveLenses();
  }, [loadActiveLenses]);

  // Drawer Configuration State
  const [currentStep, setCurrentStep] = useState(1);
  const [requirement, setRequirement] = useState<LensRequirement>('non-prescription');
  const [visionType, setVisionType] = useState<VisionType>('Single Vision');
  
  // Prescription State
  const [prescription, setPrescription] = useState<PrescriptionData>({
    od: { sph: '-2.00', cyl: '0.00', axis: '' },
    os: { sph: '-2.00', cyl: '0.00', axis: '' },
    pd: '',
    add: '',
    cc: '',
    unsure: false,
    notes: '',
  });

  const [selectedLensId, setSelectedLensId] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({}); // optionId -> choiceLabel

  // Inquiry & Prescription Upload State
  const { submitInquiry } = useInquiryStore();
  const [prescriptionMode, setPrescriptionMode] = useState<'manual' | 'upload'>('manual');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Customer Contact State
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Scroll Tracking for Step Indicators
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 30) {
      setShowScrollIndicator(false);
    } else {
      setShowScrollIndicator(true);
    }
  };

  useEffect(() => {
    // Reset scroll & indicator when step changes
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setShowScrollIndicator(true);
  }, [currentStep]);

  const handleScrollDownClick = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 340, behavior: 'smooth' });
    }
  };

  // Dynamic steps calculation
  // Non-Prescription:
  // 1: Requirement -> 2: Lens -> 3: Options (if any) -> 4: Summary
  // Prescription:
  // 1: Requirement -> 2: Vision Type -> 3: Prescription -> 4: Lens -> 5: Options (if any) -> 6: Summary
  const isNonPrescription = requirement === 'non-prescription';

  // Lenses filtered by compatibility
  const compatibleLenses = useMemo(() => {
    if (isNonPrescription) {
      return activeLenses.filter((l) => l.supports_non_prescription !== false);
    }
    return activeLenses.filter((l) => {
      if (!l.supported_vision_types || l.supported_vision_types.length === 0) {
        return l.category === visionType;
      }
      return l.supported_vision_types.includes(visionType);
    });
  }, [activeLenses, isNonPrescription, visionType]);

  // Auto-select first compatible lens if current selection is invalid
  useEffect(() => {
    if (compatibleLenses.length > 0) {
      const stillValid = compatibleLenses.some((l) => l.id === selectedLensId);
      if (!stillValid) {
        setSelectedLensId(compatibleLenses[0].id);
        setSelectedOptions({});
      }
    } else {
      setSelectedLensId('');
    }
  }, [compatibleLenses, selectedLensId]);

  const selectedLens = compatibleLenses.find((l) => l.id === selectedLensId);
  const hasLensOptions = Boolean(selectedLens?.lens_options && selectedLens.lens_options.length > 0);

  // Calculate dynamic steps
  const stepsList = useMemo(() => {
    if (isNonPrescription) {
      const steps = [
        { id: 'requirement', label: t('lens_wizard.step_requirement', 'Lens Need') },
        { id: 'lens', label: t('lens_wizard.step_lens', 'Lens Type') },
      ];
      if (hasLensOptions) {
        steps.push({ id: 'options', label: t('lens_wizard.step_options', 'Treatments') });
      }
      steps.push({ id: 'summary', label: t('lens_wizard.step_summary', 'Summary') });
      return steps;
    } else {
      const steps = [
        { id: 'requirement', label: t('lens_wizard.step_requirement', 'Lens Need') },
        { id: 'vision', label: t('lens_wizard.step_vision', 'Vision Type') },
        { id: 'prescription', label: t('lens_wizard.step_prescription', 'Prescription') },
        { id: 'lens', label: t('lens_wizard.step_lens', 'Lens Type') },
      ];
      if (hasLensOptions) {
        steps.push({ id: 'options', label: t('lens_wizard.step_options', 'Treatments') });
      }
      steps.push({ id: 'summary', label: t('lens_wizard.step_summary', 'Summary') });
      return steps;
    }
  }, [isNonPrescription, hasLensOptions, t]);

  const totalSteps = stepsList.length;

  // Reset or initialize options when lens changes
  useEffect(() => {
    if (selectedLens?.lens_options) {
      setSelectedOptions((prev) => {
        const next: Record<string, string> = {};
        selectedLens.lens_options?.forEach((opt) => {
          if (prev[opt.id] && opt.choices.some((c) => c.label === prev[opt.id])) {
            next[opt.id] = prev[opt.id];
          } else if (opt.choices.length > 0) {
            next[opt.id] = opt.choices[0].label;
          }
        });
        return next;
      });
    } else {
      setSelectedOptions({});
    }
  }, [selectedLens]);

  // Price Calculation
  const priceBreakdown = useMemo(() => {
    const framePriceStr = variant?.price || product.price;
    const frameNum = parsePriceToNumber(framePriceStr);
    const lensNum = parsePriceToNumber(selectedLens?.starting_price);

    let optionsNum = 0;
    if (selectedLens?.lens_options) {
      selectedLens.lens_options.forEach((opt) => {
        const chosenLabel = selectedOptions[opt.id];
        const choice = opt.choices.find((c) => c.label === chosenLabel);
        if (choice && choice.extra_price) {
          optionsNum += choice.extra_price;
        }
      });
    }

    const totalNum = frameNum + lensNum + optionsNum;

    return {
      frameNum,
      frameFormatted: formatRupiahDisplay(frameNum),
      lensNum,
      lensFormatted: selectedLens ? formatRupiahDisplay(lensNum) : 'Rp 0',
      optionsNum,
      optionsFormatted: formatRupiahDisplay(optionsNum),
      totalNum,
      totalFormatted: formatRupiahDisplay(totalNum),
      canCalculate: Boolean(frameNum > 0 && selectedLens),
    };
  }, [variant, product, selectedLens, selectedOptions]);

  // File upload handler
  const handleFileUpload = async (file: File) => {
    // 1. Validate file: must be image (jpg, jpeg, png, webp, heic) and <= 5MB
    const validation = validatePrescriptionFile(file, language);
    if (!validation.valid) {
      setUploadError(validation.error || 'File tidak valid.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploadingFile(true);
    setUploadError(null);
    setUploadedFileName(file.name);

    try {
      // 2. Compress image to optimized WebP (max 1600px, quality 0.82)
      const compressedFile = await compressImage(file, {
        maxDimension: 1600,
        quality: 0.82,
        targetType: 'image/webp',
      });

      const localUrl = URL.createObjectURL(compressedFile);
      setUploadedFileUrl(localUrl);

      // 3. Upload to storage
      const res = await uploadMediaToStorage({
        bucket: 'products',
        file: compressedFile,
        folder: 'prescriptions',
        maxSizeMB: 5,
      });

      if (res.url) {
        setUploadedFileUrl(res.url);
        setPrescription((p) => ({
          ...p,
          prescription_mode: 'upload',
          prescription_file_url: res.url,
          prescription_file_name: compressedFile.name,
          unsure: true,
        }));
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = reader.result as string;
          setUploadedFileUrl(b64);
          setPrescription((p) => ({
            ...p,
            prescription_mode: 'upload',
            prescription_file_url: b64,
            prescription_file_name: compressedFile.name,
            unsure: true,
          }));
        };
        reader.readAsDataURL(compressedFile);
      }
    } catch (err: any) {
      console.error('Prescription compression/upload exception:', err);
      // Fallback: try reading as data URL if storage upload failed
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = reader.result as string;
          setUploadedFileUrl(b64);
          setPrescription((p) => ({
            ...p,
            prescription_mode: 'upload',
            prescription_file_url: b64,
            prescription_file_name: file.name,
            unsure: true,
          }));
        };
        reader.readAsDataURL(file);
      } catch {
        setUploadError(
          language === 'id'
            ? 'Gagal memproses file resep. Pastikan file gambar tidak rusak.'
            : 'Failed to process prescription file. Please ensure file is not corrupted.'
        );
      }
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveUploadedFile = () => {
    setUploadedFileUrl('');
    setUploadedFileName('');
    setPrescription((p) => ({
      ...p,
      prescription_file_url: undefined,
      prescription_file_name: undefined,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleUploadChecklist = () => {
    if (prescriptionMode === 'upload') {
      // Switching back to manual: reset file and set to manual
      handleRemoveUploadedFile();
      setPrescriptionMode('manual');
      setPrescription((p) => ({ ...p, unsure: false, prescription_mode: 'manual' }));
    } else {
      // Switching to upload mode
      setPrescriptionMode('upload');
      setPrescription((p) => ({ ...p, unsure: true, prescription_mode: 'upload' }));
    }
  };

  const handleCloseDrawer = () => {
    setIsSubmittedSuccess(false);
    setCurrentStep(1);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setSubmitError(null);
    onClose();
  };

  const handleSubmitOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const selection: CustomLensSelection = {
        requirement,
        visionType: isNonPrescription ? undefined : visionType,
        prescription: isNonPrescription
          ? undefined
          : {
              ...prescription,
              prescription_mode: prescriptionMode,
              prescription_file_url: uploadedFileUrl || prescription.prescription_file_url,
              prescription_file_name: uploadedFileName || prescription.prescription_file_name,
              unsure: prescriptionMode === 'upload',
            },
        lensService: selectedLens,
        selectedOptions,
        estimatedTotalPrice: priceBreakdown.canCalculate ? priceBreakdown.totalFormatted : undefined,
      };

      let messageSummary = `Pesanan Custom Lensa: ${product.name} (${variant?.color_name || 'Standard'})\n`;
      messageSummary += `Kebutuhan: ${requirement === 'non-prescription' ? 'Non-Prescription (Plano)' : `Prescription (${visionType})`}\n`;

      if (!isNonPrescription) {
        if (prescriptionMode === 'upload') {
          messageSummary += `Resep: Upload Foto/PDF (${uploadedFileName || 'Dokumen terlampir'})\n`;
          if (prescription.notes) messageSummary += `Catatan: ${prescription.notes}\n`;
        } else {
          messageSummary += `OD: SPH ${prescription.od.sph}, CYL ${prescription.od.cyl}, AXIS ${prescription.od.axis || '-'}\n`;
          messageSummary += `OS: SPH ${prescription.os.sph}, CYL ${prescription.os.cyl}, AXIS ${prescription.os.axis || '-'}\n`;
          if (prescription.pd) messageSummary += `PD: ${prescription.pd}\n`;
          if (prescription.add) messageSummary += `ADD: ${prescription.add}\n`;
          if (prescription.cc) messageSummary += `CC: ${prescription.cc}\n`;
        }
      }

      if (selectedLens) {
        messageSummary += `Lensa: ${selectedLens.name}\n`;
        if (Object.keys(selectedOptions).length > 0) {
          messageSummary += `Opsi: ${Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
        }
      }

      messageSummary += `Estimasi Total: ${priceBreakdown.canCalculate ? priceBreakdown.totalFormatted : 'Menunggu Konfirmasi'}`;

      const res = await submitInquiry({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim() || undefined,
        subject: `Custom Lens — ${product.name}`,
        message: messageSummary,
        product_id: product.id,
        product_name: product.name,
        variant_name: variant?.color_name || 'Standard',
        variant_sku: variant?.sku || product.sku,
        variant_color_hex: variant?.color_hex,
        prescription_file_url: uploadedFileUrl || undefined,
        prescription_file_name: uploadedFileName || undefined,
        custom_lens_data: selection,
        total_price: priceBreakdown.canCalculate ? priceBreakdown.totalFormatted : undefined,
      });

      if (res.success) {
        setIsSubmittedSuccess(true);
      } else {
        setSubmitError(res.error || (language === 'id' ? 'Gagal mengirim pesanan. Silakan coba lagi.' : 'Failed to submit order. Please try again.'));
      }
    } catch (err: any) {
      setSubmitError(err.message || (language === 'id' ? 'Terjadi kesalahan sistem.' : 'A system error occurred.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation handlers
  const handleRequirementSelect = (req: LensRequirement) => {
    if (req !== requirement) {
      setRequirement(req);
      setCurrentStep(2); // advance to next step
    } else {
      setCurrentStep(2);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Dimmed Luxury Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-over Drawer Container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
        >
          {/* Drawer Top Header */}
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  {t('lens_wizard.atelier', 'Custom Lens Atelier')}
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span className="text-xs font-semibold text-neutral-900 truncate max-w-[200px]">
                  {product.name}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {t('lens_wizard.colorway', 'Colorway:')} <strong className="text-neutral-800">{variant?.color_name || 'Standard'}</strong>
              </p>
            </div>

            <button
              onClick={handleCloseDrawer}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
              aria-label="Close customizer"
            >
              <X size={20} />
            </button>
          </div>

          {isSubmittedSuccess ? (
            /* Luxury Success Confirmation Screen */
            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-center text-center space-y-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2 max-w-md">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  {t('lens_wizard.atelier', 'Custom Lens Atelier')}
                </span>
                <h3 className="editorial-title text-2xl uppercase tracking-tight text-neutral-900">
                  {t('lens_wizard.order_success_title', 'Pesanan Custom Lensa Berhasil Terkirim')}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed pt-1">
                  {t('lens_wizard.order_success_desc', 'Terima kasih telah mempercayakan kacamata Anda kepada JEM LUIQA. Konsultan atelier kami akan segera menghubungi nomor WhatsApp Anda untuk konfirmasi pesanan dan proses pembuatan.')}
                </p>
              </div>

              <div className="w-full max-w-sm p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-left space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                  <span className="text-neutral-500">Pemesan:</span>
                  <span className="font-semibold text-neutral-900">{customerName}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                  <span className="text-neutral-500">WhatsApp:</span>
                  <span className="font-semibold text-neutral-900">{customerPhone}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                  <span className="text-neutral-500">Frame:</span>
                  <span className="font-semibold text-neutral-900">{product.name} ({variant?.color_name || 'Standard'})</span>
                </div>
                {selectedLens && (
                  <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                    <span className="text-neutral-500">Lensa:</span>
                    <span className="font-semibold text-neutral-900">{selectedLens.name}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-500">Estimasi Total:</span>
                  <span className="font-bold text-neutral-900">{priceBreakdown.canCalculate ? priceBreakdown.totalFormatted : (language === 'id' ? 'Menunggu Konfirmasi' : 'To be confirmed')}</span>
                </div>
              </div>

              <AnimatedButton
                type="button"
                variant="dark"
                onClick={handleCloseDrawer}
                className="w-full max-w-sm py-3.5 rounded-full font-semibold text-xs tracking-wider uppercase shadow-sm"
              >
                <span>{t('lens_wizard.close', 'Tutup')}</span>
              </AnimatedButton>
            </div>
          ) : (
            <>
              {/* Stepper Progress Bar */}
          <div className="bg-neutral-50/80 px-6 py-3 border-b border-neutral-100 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                {language === 'id'
                  ? `Langkah ${currentStep} dari ${totalSteps}: ${stepsList[currentStep - 1]?.label}`
                  : `Step ${currentStep} of ${totalSteps}: ${stepsList[currentStep - 1]?.label}`}
              </span>
              <span className="text-[10px] font-semibold text-neutral-400">
                {Math.round((currentStep / totalSteps) * 100)}% {language === 'id' ? 'Selesai' : 'Complete'}
              </span>
            </div>
            {/* Progress line */}
            <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
              <div
                className="bg-neutral-900 h-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Interactive Step Content Area (Scrollable) */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
          >
            
            {/* STEP 1: LENS REQUIREMENT */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center sm:text-left">
                  <h3 className="editorial-title text-2xl uppercase tracking-tight text-neutral-900">
                    {t('lens_wizard.q_requirement', 'What kind of lenses do you need?')}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                    {t('lens_wizard.q_requirement_desc', 'Choose whether you require optical prescription diopters or non-prescription plano lenses.')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-2">
                  {/* Non-Prescription Option */}
                  <button
                    type="button"
                    onClick={() => handleRequirementSelect('non-prescription')}
                    className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      requirement === 'non-prescription'
                        ? 'border-neutral-900 bg-neutral-50 shadow-sm ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-400 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-200/60 text-[10px] uppercase font-bold tracking-wider text-neutral-700 mb-2">
                          {t('lens_wizard.non_prescription_tag', 'Plano / Normal')}
                        </div>
                        <h4 className="text-base font-bold text-neutral-900">
                          {t('lens_wizard.non_prescription_title', 'Non-Prescription Lenses')}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                          {t('lens_wizard.non_prescription_desc')}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                          requirement === 'non-prescription'
                            ? 'bg-neutral-900 border-neutral-900 text-white'
                            : 'border-neutral-300'
                        }`}
                      >
                        {requirement === 'non-prescription' && <Check size={14} />}
                      </div>
                    </div>
                  </button>

                  {/* Prescription Option */}
                  <button
                    type="button"
                    onClick={() => handleRequirementSelect('prescription')}
                    className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      requirement === 'prescription'
                        ? 'border-neutral-900 bg-neutral-50 shadow-sm ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-400 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900 text-[10px] uppercase font-bold tracking-wider text-white mb-2">
                          {t('lens_wizard.prescription_tag', 'Diopter Correction')}
                        </div>
                        <h4 className="text-base font-bold text-neutral-900">
                          {t('lens_wizard.prescription_title', 'Prescription Lenses')}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                          {t('lens_wizard.prescription_desc')}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                          requirement === 'prescription'
                            ? 'bg-neutral-900 border-neutral-900 text-white'
                            : 'border-neutral-300'
                        }`}
                      >
                        {requirement === 'prescription' && <Check size={14} />}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 (Prescription only): VISION TYPE */}
            {!isNonPrescription && currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="editorial-title text-2xl uppercase tracking-tight text-neutral-900">
                    {t('lens_wizard.q_vision', 'Select Vision Correction Type')}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                    {t('lens_wizard.q_vision_desc', 'Choose the optical geometry matching your prescription requirements.')}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {[
                    {
                      type: 'Single Vision' as VisionType,
                      title: t('lens_wizard.single_vision_title', 'Single Vision'),
                      tag: t('lens_wizard.single_vision_tag', 'Most Popular'),
                      desc: t('lens_wizard.single_vision_desc', 'Corrects one field of vision: distance, computer, or close-up reading.'),
                    },
                    {
                      type: 'Bifocal' as VisionType,
                      title: t('lens_wizard.bifocal_title', 'Bifocal'),
                      tag: t('lens_wizard.bifocal_tag', 'Dual Focus'),
                      desc: t('lens_wizard.bifocal_desc', 'Distinct segmented zones with visible reading line for dedicated distance + reading.'),
                    },
                    {
                      type: 'Progressive' as VisionType,
                      title: t('lens_wizard.progressive_title', 'Progressive Multifocal'),
                      tag: t('lens_wizard.progressive_tag', 'No Line'),
                      desc: t('lens_wizard.progressive_desc', 'Smooth, line-free gradual transition from distance, intermediate screen, to reading.'),
                    },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setVisionType(item.type)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        visionType === item.type
                          ? 'border-neutral-900 bg-neutral-50 shadow-xs ring-1 ring-neutral-900'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-neutral-900">{item.title}</h4>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-neutral-200/70 text-neutral-700">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">{item.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                          visionType === item.type
                            ? 'bg-neutral-900 border-neutral-900 text-white'
                            : 'border-neutral-300'
                        }`}
                      >
                        {visionType === item.type && <Check size={12} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3 (Prescription only): PRESCRIPTION INPUT */}
            {!isNonPrescription && currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="editorial-title text-2xl uppercase tracking-tight text-neutral-900">
                    {t('lens_wizard.q_prescription', 'Enter Prescription Values')}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                    {t('lens_wizard.q_prescription_desc', 'Select your diopter specifications for Right Eye (OD) and Left Eye (OS).')}
                  </p>
                </div>

                {/* Checklist Option: Upload Prescription Photo */}
                <div
                  onClick={handleToggleUploadChecklist}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                    prescriptionMode === 'upload'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                      : 'bg-neutral-50 hover:bg-neutral-100/90 border-neutral-200 text-neutral-900'
                  }`}
                  role="checkbox"
                  aria-checked={prescriptionMode === 'upload'}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      prescriptionMode === 'upload'
                        ? 'bg-white border-white text-neutral-900'
                        : 'border-neutral-400 bg-white text-transparent'
                    }`}
                  >
                    <Check
                      size={13}
                      strokeWidth={3}
                      className={prescriptionMode === 'upload' ? 'block' : 'hidden'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block leading-snug">
                      {t(
                        'lens_wizard.checkbox_upload_prescription',
                        'Punya foto resep dokter? Centang untuk langsung upload foto resep'
                      )}
                    </span>
                    <p
                      className={`text-[11px] mt-1 leading-relaxed ${
                        prescriptionMode === 'upload' ? 'text-neutral-300' : 'text-neutral-500'
                      }`}
                    >
                      {t(
                        'lens_wizard.checkbox_upload_prescription_desc',
                        'Anda tidak perlu mengisi angka manual. Cukup lampirkan foto resep, tim spesialis optik kami yang akan membacanya.'
                      )}
                    </p>
                  </div>
                </div>

                {/* Upload Mode Box */}
                {prescriptionMode === 'upload' && (
                  <div className="space-y-4 pt-1 animate-fadeIn">
                    <div className="bg-neutral-50 p-6 rounded-2xl border-2 border-dashed border-neutral-300 text-center relative hover:border-neutral-400 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileUpload(f);
                        }}
                        className="hidden"
                        id="prescription-file-upload"
                      />

                      {uploadedFileUrl ? (
                        <div className="space-y-3">
                          {uploadedFileName.toLowerCase().endsWith('.pdf') ? (
                            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-neutral-200 shadow-xs max-w-sm mx-auto">
                              <div className="flex items-center gap-2.5 truncate">
                                <FileText size={28} className="text-rose-600 shrink-0" />
                                <div className="text-left truncate">
                                  <span className="font-semibold text-xs text-neutral-900 block truncate max-w-[200px]">
                                    {uploadedFileName}
                                  </span>
                                  <span className="text-[10px] text-neutral-400">PDF Document</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={handleRemoveUploadedFile}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title={t('lens_wizard.remove_file', 'Hapus File')}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="relative inline-block rounded-xl overflow-hidden border border-neutral-200 shadow-sm max-h-56">
                                <img
                                  src={uploadedFileUrl}
                                  alt="Prescription preview"
                                  className="max-h-56 w-auto object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={handleRemoveUploadedFile}
                                  className="absolute top-2 right-2 bg-neutral-900/80 hover:bg-neutral-900 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors shadow-xs"
                                  title={t('lens_wizard.remove_file', 'Hapus File')}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <p className="text-[11px] text-neutral-500 font-medium truncate max-w-xs mx-auto">
                                {uploadedFileName}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-semibold">
                            <CheckCircle2 size={14} />
                            <span>{t('lens_wizard.upload_success', 'File resep berhasil diunggah')}</span>
                          </div>

                          <label
                            htmlFor="prescription-file-upload"
                            className="inline-block text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
                          >
                            Ganti file resep
                          </label>
                        </div>
                      ) : (
                        <label
                          htmlFor="prescription-file-upload"
                          className="cursor-pointer block py-4 space-y-2"
                        >
                          <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center mx-auto text-neutral-600 shadow-2xs">
                            {isUploadingFile ? (
                              <Loader2 size={20} className="animate-spin text-neutral-900" />
                            ) : (
                              <Upload size={20} />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-900 block">
                              {isUploadingFile
                                ? 'Sedang memproses file...'
                                : t('lens_wizard.upload_drop_text', 'Tarik & lepas file di sini, atau klik untuk memilih file')}
                            </span>
                            <span className="text-[11px] text-neutral-400 mt-1 block">
                              {t('lens_wizard.upload_prescription_desc', 'Ambil foto resep dokter Anda (format JPG, PNG, WebP, HEIC maks 5MB).')}
                            </span>
                          </div>
                        </label>
                      )}

                      {uploadError && (
                        <p className="text-xs text-rose-600 font-medium pt-2">{uploadError}</p>
                      )}
                    </div>

                    {/* Notes for Uploaded Prescription */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                        Catatan Dokter / Keluhan Penglihatan (Opsional)
                      </label>
                      <textarea
                        rows={2}
                        value={prescription.notes || ''}
                        onChange={(e) =>
                          setPrescription((prev) => ({ ...prev, notes: e.target.value }))
                        }
                        placeholder="Contoh: Resep baru dari optik/dokter, mohon rekomendasi coating anti-silau..."
                        className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 resize-none transition-all placeholder:text-neutral-400"
                      />
                    </div>
                  </div>
                )}

                {/* Manual Diopters Mode */}
                {prescriptionMode === 'manual' && (
                  <div className="space-y-5 pt-1">
                    {/* Right Eye (OD) */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                          {t('lens_wizard.od_title', 'Right Eye (OD - Oculus Dexter)')}
                        </span>
                        <span className="text-[10px] font-semibold text-neutral-400">Sphere / Cyl / Axis</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                            {t('lens_wizard.sph_label', 'SPH (Sphere)')}
                          </label>
                          <select
                            value={prescription.od.sph}
                            onChange={(e) =>
                              setPrescription((prev) => ({
                                ...prev,
                                od: { ...prev.od, sph: e.target.value },
                              }))
                            }
                            className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-neutral-900"
                          >
                            {SPH_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                            {t('lens_wizard.cyl_label', 'CYL (Cylinder)')}
                          </label>
                          <select
                            value={prescription.od.cyl}
                            onChange={(e) =>
                              setPrescription((prev) => ({
                                ...prev,
                                od: { ...prev.od, cyl: e.target.value },
                              }))
                            }
                            className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-neutral-900"
                          >
                            {CYL_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                            {t('lens_wizard.axis_label', 'AXIS (1-180°)')}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="180"
                            placeholder="e.g. 180"
                            disabled={prescription.od.cyl === '0.00 (None)'}
                            value={prescription.od.axis}
                            onChange={(e) =>
                              setPrescription((prev) => ({
                                ...prev,
                                od: { ...prev.od, axis: e.target.value },
                              }))
                            }
                            className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-neutral-900 disabled:bg-neutral-100 disabled:text-neutral-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Left Eye (OS) */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                          {t('lens_wizard.os_title', 'Left Eye (OS - Oculus Sinister)')}
                        </span>
                        <span className="text-[10px] font-semibold text-neutral-400">Sphere / Cyl / Axis</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                            {t('lens_wizard.sph_label', 'SPH (Sphere)')}
                          </label>
                          <select
                            value={prescription.os.sph}
                            onChange={(e) =>
                              setPrescription((prev) => ({
                                ...prev,
                                os: { ...prev.os, sph: e.target.value },
                              }))
                            }
                            className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-neutral-900"
                          >
                            {SPH_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                            {t('lens_wizard.cyl_label', 'CYL (Cylinder)')}
                          </label>
                          <select
                            value={prescription.os.cyl}
                            onChange={(e) =>
                              setPrescription((prev) => ({
                                ...prev,
                                os: { ...prev.os, cyl: e.target.value },
                              }))
                            }
                            className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-neutral-900"
                          >
                            {CYL_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                            {t('lens_wizard.axis_label', 'AXIS (1-180°)')}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="180"
                            placeholder="e.g. 175"
                            disabled={prescription.os.cyl === '0.00 (None)'}
                            value={prescription.os.axis}
                            onChange={(e) =>
                              setPrescription((prev) => ({
                                ...prev,
                                os: { ...prev.os, axis: e.target.value },
                              }))
                            }
                            className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-neutral-900 disabled:bg-neutral-100 disabled:text-neutral-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pupillary Distance (PD) */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 flex items-center justify-between gap-3">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                          {t('lens_wizard.pd_title', 'Pupillary Distance (PD)')}
                        </label>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {t('lens_wizard.pd_desc', 'Jarak antara pupil mata kanan dan kiri dalam milimeter (contoh: 62 mm, atau R: 31 / L: 31).')}
                        </p>
                      </div>

                      <div className="w-28 shrink-0">
                        <textarea
                          rows={1}
                          maxLength={10}
                          value={prescription.pd}
                          onChange={(e) =>
                            setPrescription((prev) => ({ ...prev, pd: e.target.value.slice(0, 10) }))
                          }
                          placeholder={t('lens_wizard.pd_placeholder', '62 mm')}
                          className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 resize-none transition-all placeholder:text-neutral-400 text-left h-[38px] overflow-hidden leading-tight"
                        />
                      </div>
                    </div>

                    {/* ADD (Reading Addition) */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                            {t('lens_wizard.add_title', 'ADD (Reading Addition / Baca Dekat)')}
                          </label>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {t('lens_wizard.add_desc', 'Ukuran plus tambahan untuk membaca dekat (khusus lensa progresif / bifokal, opsional).')}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-200/50 px-2 py-0.5 rounded shrink-0">
                          {language === 'id' ? 'Opsional' : 'Optional'}
                        </span>
                      </div>

                      <textarea
                        rows={2}
                        value={prescription.add || ''}
                        onChange={(e) =>
                          setPrescription((prev) => ({ ...prev, add: e.target.value }))
                        }
                        placeholder={t('lens_wizard.add_placeholder', 'Contoh: +1.50, Add +2.00 kedua mata, atau detail resep baca dekat...')}
                        className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 resize-none transition-all placeholder:text-neutral-400"
                      />
                    </div>

                    {/* CC (Chief Complaint & Catatan Khusus) */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                            {t('lens_wizard.cc_title', 'CC (Chief Complaint & Catatan Khusus)')}
                          </label>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {t('lens_wizard.cc_desc', 'Tuliskan keluhan penglihatan saat ini, kebiasaan kerja, atau catatan dokter khusus.')}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-200/50 px-2 py-0.5 rounded shrink-0">
                          {language === 'id' ? 'Opsional' : 'Optional'}
                        </span>
                      </div>

                      <textarea
                        rows={2}
                        value={prescription.cc || ''}
                        onChange={(e) =>
                          setPrescription((prev) => ({ ...prev, cc: e.target.value }))
                        }
                        placeholder={t('lens_wizard.cc_placeholder', 'Contoh: Sering lelah saat menatap layar 8 jam, silau saat berkendara malam, dll...')}
                        className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 resize-none transition-all placeholder:text-neutral-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP: LENS SELECTION (Step 2 for Non-Prescription, Step 4 for Prescription) */}
            {((isNonPrescription && currentStep === 2) || (!isNonPrescription && currentStep === 4)) && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="editorial-title text-2xl uppercase tracking-tight text-neutral-900">
                    {t('lens_wizard.q_lens', 'Select Lens Formulation')}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                    {t('lens_wizard.q_lens_desc', 'Precision optical coatings and filters curated for your silhouette.')}
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {compatibleLenses.map((lens) => {
                    const isSelected = selectedLensId === lens.id;
                    return (
                      <button
                        key={lens.id}
                        type="button"
                        onClick={() => setSelectedLensId(lens.id)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-50/70 shadow-xs ring-1 ring-neutral-900'
                            : 'border-neutral-200 hover:border-neutral-400 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-bold text-neutral-900">{lens.name}</h4>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                                {lens.category}
                              </span>
                            </div>

                            <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                              {lens.short_description || lens.description}
                            </p>

                            {/* Features pills */}
                            {lens.features && lens.features.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {lens.features.slice(0, 3).map((f, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] bg-white border border-neutral-200/80 px-2 py-0.5 rounded-md text-neutral-600 font-medium"
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                              {t('lens_wizard.starts_from', 'Starts from')}
                            </span>
                            <span className="text-sm font-bold text-neutral-900 block mt-0.5">
                              {lens.starting_price}
                            </span>
                            <div
                              className={`w-5 h-5 rounded-full border ml-auto mt-2 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-neutral-900 border-neutral-900 text-white'
                                  : 'border-neutral-300'
                              }`}
                            >
                              {isSelected && <Check size={12} />}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP: OPTIONAL TREATMENTS & OPTIONS (Step 3 for Non-Prescription, Step 5 for Prescription) */}
            {hasLensOptions &&
              ((isNonPrescription && currentStep === 3) || (!isNonPrescription && currentStep === 5)) && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h3 className="editorial-title text-2xl uppercase tracking-tight text-neutral-900">
                      {t('lens_wizard.q_options', 'Customize Lens Options')}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                      {t('lens_wizard.q_options_desc', 'Select specific tints, shades, or profile treatments for your lens.')}
                    </p>
                  </div>

                  <div className="space-y-6 pt-2">
                    {selectedLens?.lens_options?.map((option) => (
                      <div key={option.id} className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block">
                          {option.name}
                        </label>

                        <div className="grid grid-cols-1 gap-2.5">
                          {option.choices.map((choice) => {
                            const isChosen = selectedOptions[option.id] === choice.label;
                            return (
                              <button
                                key={choice.label}
                                type="button"
                                onClick={() =>
                                  setSelectedOptions((prev) => ({
                                    ...prev,
                                    [option.id]: choice.label,
                                  }))
                                }
                                className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                                  isChosen
                                    ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900 font-semibold'
                                    : 'border-neutral-200 hover:border-neutral-400 bg-white font-normal'
                                }`}
                              >
                                <span className="text-xs text-neutral-900">{choice.label}</span>
                                <div className="flex items-center gap-2">
                                  {choice.extra_price ? (
                                    <span className="text-[11px] font-bold text-neutral-900">
                                      +{formatRupiahDisplay(choice.extra_price)}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                                      {t('lens_wizard.included', 'Included')}
                                    </span>
                                  )}
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                      isChosen
                                        ? 'bg-neutral-900 border-neutral-900 text-white'
                                        : 'border-neutral-300'
                                    }`}
                                  >
                                    {isChosen && <Check size={10} />}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* STEP: ORDER SUMMARY & WHATSAPP CHECKOUT */}
            {currentStep === totalSteps && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="editorial-title text-2xl uppercase tracking-tight text-neutral-900">
                    {t('lens_wizard.summary_title', 'Configuration Summary')}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                    {t('lens_wizard.summary_desc', 'Review your eyewear silhouette, prescription details, and selected lens package.')}
                  </p>
                </div>

                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200/80 space-y-4">
                  {/* Frame Details */}
                  <div className="flex items-start justify-between pb-4 border-b border-neutral-200/60">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        {t('lens_wizard.frame_silhouette', 'Frame Silhouette')}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-900 uppercase mt-0.5">
                        {product.name}
                      </h4>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        {t('lens_wizard.colorway', 'Colorway:')} <span className="font-semibold text-neutral-800">{variant?.color_name || 'Standard'}</span>
                        {variant?.sku && <span className="text-neutral-400 text-[11px]"> ({variant.sku})</span>}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-neutral-900">
                      {priceBreakdown.frameFormatted}
                    </span>
                  </div>

                  {/* Lens Requirement & Vision */}
                  <div className="flex items-start justify-between pb-4 border-b border-neutral-200/60 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        {t('lens_wizard.lens_need', 'Lens Requirement')}
                      </span>
                      <span className="font-semibold text-neutral-800 block mt-0.5">
                        {isNonPrescription ? t('lens_wizard.non_prescription_title', 'Non-Prescription (Plano / Normal)') : t('lens_wizard.prescription_title', 'Prescription')}
                      </span>
                      {!isNonPrescription && (
                        <span className="text-neutral-500 text-[11px]">
                          {t('lens_wizard.step_vision', 'Vision Type')}: {visionType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Prescription Breakdown (if applicable) */}
                  {!isNonPrescription && (
                    <div className="pb-4 border-b border-neutral-200/60 text-xs space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        {t('lens_wizard.prescription_specs', 'Prescription Specifications')}
                      </span>
                      {prescriptionMode === 'upload' || uploadedFileName ? (
                        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2.5 truncate">
                            {uploadedFileName.toLowerCase().endsWith('.pdf') ? (
                              <FileText size={20} className="text-rose-600 shrink-0" />
                            ) : (
                              <Upload size={20} className="text-emerald-600 shrink-0" />
                            )}
                            <div className="truncate">
                              <span className="font-semibold text-neutral-900 block truncate max-w-[200px]">
                                {uploadedFileName || 'Dokumen Resep Terlampir'}
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                {prescription.notes ? `Catatan: ${prescription.notes}` : 'Resep dokter terlampir'}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                            Terlampir
                          </span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-lg border border-neutral-200/70">
                          <div>
                            <span className="font-bold text-neutral-900 block">{language === 'id' ? 'OD (Kanan):' : 'OD (Right):'}</span>
                            <span className="text-neutral-600">
                              SPH: {prescription.od.sph} | CYL: {prescription.od.cyl}{' '}
                              {prescription.od.axis ? `| AXIS: ${prescription.od.axis}°` : ''}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-neutral-900 block">{language === 'id' ? 'OS (Kiri):' : 'OS (Left):'}</span>
                            <span className="text-neutral-600">
                              SPH: {prescription.os.sph} | CYL: {prescription.os.cyl}{' '}
                              {prescription.os.axis ? `| AXIS: ${prescription.os.axis}°` : ''}
                            </span>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-neutral-100 space-y-1 text-neutral-700">
                            {prescription.pd && (
                              <div className="text-[11px]">
                                <span className="text-neutral-500">PD:</span> <strong>{prescription.pd}</strong>
                              </div>
                            )}
                            {prescription.add && (
                              <div className="text-[11px]">
                                <span className="text-neutral-500">ADD:</span> <strong>{prescription.add}</strong>
                              </div>
                            )}
                            {prescription.cc && (
                              <div className="text-[11px]">
                                <span className="text-neutral-500">CC:</span> <span className="font-medium text-neutral-800">{prescription.cc}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected Lens */}
                  {selectedLens && (
                    <div className="flex items-start justify-between pb-4 border-b border-neutral-200/60">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          {t('lens_wizard.selected_lens_package', 'Selected Lens Package')}
                        </span>
                        <h4 className="text-sm font-bold text-neutral-900 mt-0.5">
                          {selectedLens.name}
                        </h4>
                        {/* Options */}
                        {Object.entries(selectedOptions).map(([optName, choiceLabel]) => (
                          <p key={optName} className="text-xs text-neutral-600 mt-0.5">
                            • {choiceLabel}
                          </p>
                        ))}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-neutral-900 block">
                          {priceBreakdown.lensFormatted}
                        </span>
                        {priceBreakdown.optionsNum > 0 && (
                          <span className="text-[10px] text-neutral-500 block">
                            +{priceBreakdown.optionsFormatted}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Total Estimated Price */}
                  <div className="flex items-baseline justify-between pt-1 pb-2">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-neutral-500 block">
                        {t('lens_wizard.estimated_total', 'Estimated Total')}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {t('lens_wizard.estimated_total_note', 'Includes frame + custom lens service')}
                      </span>
                    </div>
                    <span className="text-xl font-bold text-neutral-900 tracking-tight">
                      {priceBreakdown.canCalculate ? priceBreakdown.totalFormatted : (language === 'id' ? 'Harga akan dikonfirmasi' : 'Price to be confirmed')}
                    </span>
                  </div>

                  {/* Client Contact Details Form */}
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                        {t('lens_wizard.contact_info_title', 'Data Pemesan')}
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {t('lens_wizard.contact_info_desc', 'Tim atelier optik kami akan menghubungi Anda melalui WhatsApp untuk konfirmasi pesanan.')}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                          {t('lens_wizard.customer_name', 'Nama Lengkap')} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder={t('lens_wizard.customer_name_placeholder', 'Masukkan nama Anda...')}
                          className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                          {t('lens_wizard.customer_phone', 'No. WhatsApp (Aktif)')} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder={t('lens_wizard.customer_phone_placeholder', 'Contoh: 081234567890')}
                          className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                          {t('lens_wizard.customer_email', 'Email (Opsional)')}
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder={t('lens_wizard.customer_email_placeholder', 'nama@email.com')}
                          className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-400"
                        />
                      </div>
                    </div>

                    {submitError && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                        {submitError}
                      </div>
                    )}
                  </div>

                  {/* Consultation & Assurance Callout */}
                  <div className="p-4 rounded-xl bg-neutral-900 text-white flex items-start gap-3 shadow-sm">
                    <MessageCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed space-y-1">
                      <p className="font-semibold text-white">
                        {t('lens_wizard.concierge_title', 'Konfirmasi Concierge JEM LUIQA')}
                      </p>
                      <p className="text-neutral-300 text-[11px]">
                        {t('lens_wizard.concierge_desc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Floating Scroll Down Indicator (Prescription Step 3) */}
          <AnimatePresence>
            {!isNonPrescription && currentStep === 3 && prescriptionMode === 'manual' && showScrollIndicator && (
              <div className="absolute bottom-[86px] inset-x-0 flex justify-center z-20 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-auto"
                >
                  <button
                    type="button"
                    onClick={handleScrollDownClick}
                    className="bg-white/95 hover:bg-neutral-50 backdrop-blur-md text-neutral-900 text-[11px] font-semibold px-4 py-1.5 rounded-full shadow-md border border-neutral-200/80 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
                  >
                    <span>{language === 'id' ? 'Scroll ke bawah' : 'Scroll down'}</span>
                    <ChevronDown size={13} className="text-neutral-700 group-hover:translate-y-0.5 transition-transform duration-200" />
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Bottom Navigation & CTA Actions */}
          <div className="px-6 py-4 border-t border-neutral-100 bg-white flex items-center justify-between gap-3 shrink-0">
            {currentStep > 1 ? (
              <AnimatedButton
                type="button"
                variant="outline-dark"
                onClick={handleBack}
                className="px-4 py-3 rounded-full font-semibold text-xs tracking-wider uppercase"
              >
                <ArrowLeft size={14} />
                <span>{t('lens_wizard.back', 'Back')}</span>
              </AnimatedButton>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <AnimatedButton
                type="button"
                variant="dark"
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !requirement) ||
                  (!isNonPrescription && currentStep === 3 && prescriptionMode === 'upload' && !uploadedFileUrl)
                }
                className="ml-auto px-6 py-3 rounded-full font-semibold text-xs tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{t('lens_wizard.continue', 'Continue')}</span>
                <ArrowRight size={14} />
              </AnimatedButton>
            ) : (
              <AnimatedButton
                type="button"
                variant="dark"
                onClick={handleSubmitOrder}
                disabled={!customerName.trim() || !customerPhone.trim() || isSubmitting}
                className="ml-auto flex-1 max-w-xs py-3.5 px-6 rounded-full font-semibold text-xs tracking-wider uppercase shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t('lens_wizard.submitting_order', 'Mengirim Pesanan...')}</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>{t('lens_wizard.submit_order', 'Kirim Pesanan Custom Lensa')}</span>
                  </>
                )}
              </AnimatedButton>
            )}
          </div>
        </>
      )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
