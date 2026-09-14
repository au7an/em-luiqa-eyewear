import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  MessageCircle,
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
import { useSettingsStore } from '../../store/useSettingsStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { parsePriceToNumber, formatRupiahDisplay } from '../../lib/currency';
import { generateCustomLensOrderWALink } from '../../lib/whatsapp';

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

const PD_OPTIONS = (() => {
  const opts: string[] = [];
  for (let val = 54; val <= 74; val += 1) {
    opts.push(val.toString());
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
  const { settings } = useSettingsStore();
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
    pd: '62',
    unsure: false,
    notes: '',
  });

  const [selectedLensId, setSelectedLensId] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({}); // optionId -> choiceLabel

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

  // WhatsApp payload
  const waSelection: CustomLensSelection = {
    requirement,
    visionType: isNonPrescription ? undefined : visionType,
    prescription: isNonPrescription ? undefined : prescription,
    lensService: selectedLens,
    selectedOptions,
    estimatedTotalPrice: priceBreakdown.canCalculate ? priceBreakdown.totalFormatted : 'Price to be confirmed',
  };

  const whatsappOrderUrl = generateCustomLensOrderWALink({
    product,
    variant,
    selection: waSelection,
    phone: settings.whatsapp_number,
  });

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
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
              aria-label="Close customizer"
            >
              <X size={20} />
            </button>
          </div>

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
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            
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

                {/* Alternative Quick Option: Unsure / Send Photo */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <HelpCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                        {t('lens_wizard.unsure_help_title', 'Need help reading your prescription?')}
                      </h4>
                      <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                        {t('lens_wizard.unsure_help_desc', 'Don’t worry! You can skip entering numbers manually and simply send a photo of your doctor’s prescription slip via WhatsApp.')}
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-amber-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prescription.unsure}
                      onChange={(e) =>
                        setPrescription((prev) => ({ ...prev, unsure: e.target.checked }))
                      }
                      className="rounded border-amber-300 text-neutral-900 focus:ring-neutral-900 h-4 w-4"
                    />
                    <span>{t('lens_wizard.unsure_checkbox', 'I’m not sure / I will send a photo of my prescription on WhatsApp')}</span>
                  </label>
                </div>

                {!prescription.unsure && (
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
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                          {t('lens_wizard.pd_title', 'Pupillary Distance (PD)')}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {t('lens_wizard.pd_desc', 'Distance between your pupils in millimeters (typically 58 - 66mm).')}
                        </span>
                      </div>

                      <div className="w-28 shrink-0">
                        <select
                          value={prescription.pd}
                          onChange={(e) =>
                            setPrescription((prev) => ({ ...prev, pd: e.target.value }))
                          }
                          className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-neutral-900"
                        >
                          {PD_OPTIONS.map((val) => (
                            <option key={val} value={val}>
                              {val} mm
                            </option>
                          ))}
                        </select>
                      </div>
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
                      {prescription.unsure ? (
                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                          <HelpCircle size={14} className="shrink-0 text-amber-700" />
                          <span>{t('lens_wizard.photo_verification_notice', 'Akan diverifikasi melalui foto resep via chat WhatsApp.')}</span>
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
                          <div className="col-span-2 pt-1 border-t border-neutral-100 text-neutral-700">
                            PD: <strong>{prescription.pd} mm</strong>
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
                  <div className="flex items-baseline justify-between pt-1">
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
                </div>

                {/* Consultation & Assurance Callout */}
                <div className="p-4 rounded-xl bg-neutral-900 text-white flex items-start gap-3 shadow-sm">
                  <MessageCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed space-y-1">
                    <p className="font-semibold text-white">
                      {t('lens_wizard.concierge_title', 'Order via JEM LUIQA Concierge')}
                    </p>
                    <p className="text-neutral-300 text-[11px]">
                      {t('lens_wizard.concierge_desc')}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Navigation & CTA Actions */}
          <div className="px-6 py-4 border-t border-neutral-100 bg-white flex items-center justify-between gap-3 shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-3 rounded-full border border-neutral-200 text-neutral-700 hover:text-black hover:border-black font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>{t('lens_wizard.back', 'Back')}</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && !requirement}
                className="ml-auto px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{t('lens_wizard.continue', 'Continue')}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-auto flex-1 max-w-xs py-3.5 px-6 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
              >
                <MessageCircle size={16} />
                <span>{t('lens_wizard.continue_wa', 'Continue on WhatsApp')}</span>
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
