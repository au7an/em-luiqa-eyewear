import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, Send, CheckCircle2, ExternalLink, Instagram, Loader2 } from 'lucide-react';
import { useInquiryStore } from '../store/useInquiryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { generateConsultationWALink, cleanPhoneNumber } from '../lib/whatsapp';

export const ContactPage: React.FC = () => {
  const { submitInquiry } = useInquiryStore();
  const { settings, loadSettings } = useSettingsStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Lens Consultation',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await submitInquiry(formData);
    setIsSubmitting(false);

    if (res.success) {
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Lens Consultation',
        message: '',
      });
    } else {
      setErrorMessage(res.error || 'Failed to submit message. Please try again.');
    }
  };

  const phoneDigits = cleanPhoneNumber(settings.whatsapp_number);

  return (
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 block mb-2">
          Client Concierge
        </span>
        <h1 className="editorial-title text-4xl sm:text-5xl lg:text-6xl text-neutral-900 uppercase mb-4">
          Get in Touch
        </h1>
        <p className="text-sm text-neutral-500 font-light leading-relaxed">
          For bespoke lens prescriptions, private studio fitting appointments, or frame inquiries, our concierge is at your service.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Flagship Store Card */}
          <div className="bg-neutral-50 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-200/70">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 block mb-1">
                  Flagship Studio
                </span>
                <h2 className="editorial-title text-xl text-neutral-900 uppercase">
                  Bandung Flagship Space
                </h2>
              </div>

              {settings.google_maps_url && (
                <a
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-neutral-800 hover:text-black hover:underline"
                >
                  <span>Get Directions</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-neutral-600 mb-6">
              <div className="flex items-start gap-3">
                <MapPin size={17} className="text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block font-semibold mb-0.5">
                    Address
                  </strong>
                  <p className="leading-relaxed">
                    {settings.address ||
                      'Jl. Cikutra Baru Raya No.1, Neglasari, Cibeunying Kaler, Kota Bandung, Jawa Barat 40123'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={17} className="text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block font-semibold mb-0.5">
                    Opening Hours
                  </strong>
                  <p className="leading-relaxed">
                    {settings.operational_hours || 'Monday – Sunday: 09:00 – 20:00 WIB'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={generateConsultationWALink('Contact Page Concierge Inquiry', phoneDigits)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                <Phone size={14} />
                <span>Chat via WhatsApp</span>
              </a>

              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-neutral-800 hover:text-black border border-neutral-200 hover:border-neutral-400 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  <Instagram size={14} />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs">
            <h3 className="editorial-title text-xl text-neutral-900 uppercase mb-1">
              Send an Inquiry
            </h3>
            <p className="text-xs text-neutral-500 mb-6 font-light">
              Our studio concierge typically replies within 2–4 business hours.
            </p>

            {isSubmitted ? (
              <div className="text-center py-10 px-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <CheckCircle2 size={44} className="text-emerald-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-neutral-900 mb-1">
                  Inquiry Received Successfully
                </h4>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto mb-5 font-light">
                  Thank you for contacting JEM LUIQA Eyewear. A dedicated client concierge will review your message and reach out shortly.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2 rounded-full bg-neutral-900 text-white text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-700 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Amanda Valerie"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-black focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="name@example.com"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-black focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-700 mb-1.5">
                      WhatsApp / Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+62 812..."
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-black focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-700 mb-1.5">
                      Inquiry Topic
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-black focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="Lens Consultation">Custom Lens Consultation</option>
                      <option value="Fitting Appointment">Studio Fitting Appointment</option>
                      <option value="Product Availability">Product Stock Inquiry</option>
                      <option value="Warranty & Care">Warranty & Care Assistance</option>
                      <option value="Other">Other Concierge Matter</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-700 mb-1.5">
                    Message Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Tell us about your frame preference, prescription needs, or appointment request..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-black focus:bg-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3.5 px-6 rounded-full font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Studio Space Imagery (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg bg-neutral-900">
            <img
              src="/assets/images/lookbook1.jpg"
              alt="Jem Luiqa Flagship Space"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-400">
                Atelier
              </span>
              <h4 className="editorial-title text-xl uppercase text-white">
                Bandung Studio
              </h4>
              <p className="text-xs text-neutral-300 font-light">
                Experience tactile acetate finishing and private frame fitting consultations in person.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
