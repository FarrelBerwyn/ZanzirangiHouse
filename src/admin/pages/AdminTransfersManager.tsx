import React, { useState, useEffect } from 'react';
import {
  Car,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Layers,
  MessageCircle,
} from 'lucide-react';
import { contentApi, ChauffeurConfigModel, TransferSpecItemModel } from '../../services/contentApi';
import { AdminImageInput } from '../components/AdminImageInput';

type TextFieldKey =
  | 'eyebrow'
  | 'heading'
  | 'subhead'
  | 'vehicleImage'
  | 'vehicleImageAlt'
  | 'routeLabel'
  | 'routeTitle'
  | 'specsEyebrow'
  | 'cardTitle'
  | 'airportTitle'
  | 'airportDesc'
  | 'shuttleTitle'
  | 'shuttleDesc'
  | 'vehicleTypeTitle'
  | 'vehicleTypeDesc'
  | 'vehicleSubline'
  | 'passengerLuggageTitle'
  | 'passengerLuggageDesc'
  | 'passengerSubline'
  | 'amenitiesNote'
  | 'ctaRequestLabel'
  | 'ctaAddBookingLabel'
  | 'whatsappMessage';

// Every field this editor owns. Only these (plus `visible` and `specItems`) are sent on save.
const EDITABLE_FIELDS: TextFieldKey[] = [
  'eyebrow',
  'heading',
  'subhead',
  'vehicleImage',
  'vehicleImageAlt',
  'routeLabel',
  'routeTitle',
  'specsEyebrow',
  'cardTitle',
  'airportTitle',
  'airportDesc',
  'shuttleTitle',
  'shuttleDesc',
  'vehicleTypeTitle',
  'vehicleTypeDesc',
  'vehicleSubline',
  'passengerLuggageTitle',
  'passengerLuggageDesc',
  'passengerSubline',
  'amenitiesNote',
  'ctaRequestLabel',
  'ctaAddBookingLabel',
  'whatsappMessage',
];

interface SpecBoxDef {
  type: string;
  label: string;
  hint: string;
  icon: string;
  titleField: TextFieldKey;
  descField: TextFieldKey;
  sublineField?: TextFieldKey;
}

// The public section has exactly four fixed boxes; each maps to its own record fields.
// specItems[] mirrors them (kept in sync on save) and stores each box's show/hide state.
const SPEC_BOXES: SpecBoxDef[] = [
  {
    type: 'airport',
    label: 'Box 1 — Airport transfer',
    hint: 'Wide row with the plane icon.',
    icon: 'Plane',
    titleField: 'airportTitle',
    descField: 'airportDesc',
  },
  {
    type: 'shuttle',
    label: 'Box 2 — Private shuttle',
    hint: 'Wide row with the car icon.',
    icon: 'Car',
    titleField: 'shuttleTitle',
    descField: 'shuttleDesc',
  },
  {
    type: 'vehicle_type',
    label: 'Box 3 — Vehicle type',
    hint: 'Small box (left).',
    icon: 'Car',
    titleField: 'vehicleTypeTitle',
    descField: 'vehicleTypeDesc',
    sublineField: 'vehicleSubline',
  },
  {
    type: 'passenger_luggage',
    label: 'Box 4 — Passenger & luggage',
    hint: 'Small box (right).',
    icon: 'Users',
    titleField: 'passengerLuggageTitle',
    descField: 'passengerLuggageDesc',
    sublineField: 'passengerSubline',
  },
];

const inputClass =
  'w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none';
const boxInputClass =
  'w-full px-2.5 py-1.5 bg-adm-surface border border-adm-line rounded text-xs text-adm-text focus:border-adm-accent outline-none';

const readText = (config: ChauffeurConfigModel, field: TextFieldKey): string => {
  const value = config[field];
  return typeof value === 'string' ? value : '';
};

const isBoxVisible = (config: ChauffeurConfigModel, type: string): boolean =>
  !(config.specItems || []).some((item) => item.type === type && item.visible === false);

/** Rebuild specItems so the four fixed boxes always mirror the record fields. Custom items are kept. */
const buildSpecItems = (config: ChauffeurConfigModel): TransferSpecItemModel[] => {
  const existing = Array.isArray(config.specItems) ? config.specItems : [];
  const boxTypes = new Set(SPEC_BOXES.map((b) => b.type));
  const boxes = SPEC_BOXES.map((box, idx) => {
    const found = existing.find((item) => item.type === box.type);
    return {
      id: found?.id || `spec-${box.type}`,
      type: box.type,
      title: readText(config, box.titleField),
      description: readText(config, box.descField),
      icon: found?.icon || box.icon,
      order: idx + 1,
      visible: found ? found.visible !== false : true,
    };
  });
  const others = existing.filter((item) => !boxTypes.has(item.type));
  return [...boxes, ...others];
};

export const AdminTransfersManager: React.FC = () => {
  const [config, setConfig] = useState<ChauffeurConfigModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageBroken, setImageBroken] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await contentApi.getAdminChauffeur();
      if (!data) throw new Error('The server returned no transfer configuration.');
      setConfig(data);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load the transfer configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setImageBroken(false);
  }, [config?.vehicleImage]);

  const setField = (field: TextFieldKey, value: string) => {
    setConfig((prev) => (prev ? { ...prev, [field]: value } : prev));
    setSuccess(null);
  };

  const toggleBox = (type: string) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const items = buildSpecItems(prev).map((item) =>
        item.type === type ? { ...item, visible: item.visible === false } : item
      );
      return { ...prev, specItems: items };
    });
    setSuccess(null);
  };

  const handleSave = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!config) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload: Partial<ChauffeurConfigModel> = {
        visible: config.visible !== false,
        specItems: buildSpecItems(config),
      };
      EDITABLE_FIELDS.forEach((field) => {
        payload[field] = readText(config, field);
      });
      const updated = await contentApi.updateAdminChauffeur(payload);
      if (updated) setConfig(updated);
      setSuccess('Transfer section saved. The website now shows these values.');
    } catch (err: any) {
      setError(err?.message || 'Failed to save the transfer configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="p-12 text-center text-adm-muted font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-adm-accent" />
        Loading transfer settings...
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono space-y-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{loadError || 'The transfer configuration could not be loaded.'}</span>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-adm-raised border border-adm-line-strong text-adm-text hover:bg-adm-line cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const renderInput = (field: TextFieldKey, label: string, help?: string, extraClass = '') => (
    <div>
      <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">{label}</label>
      <input
        type="text"
        value={readText(config, field)}
        onChange={(e) => setField(field, e.target.value)}
        className={`${inputClass} ${extraClass}`}
      />
      {help && <span className="text-[10px] text-adm-faint block mt-1">{help}</span>}
    </div>
  );

  const renderTextarea = (field: TextFieldKey, label: string, help?: string, rows = 3) => (
    <div>
      <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">{label}</label>
      <textarea
        rows={rows}
        value={readText(config, field)}
        onChange={(e) => setField(field, e.target.value)}
        className={inputClass}
      />
      {help && <span className="text-[10px] text-adm-faint block mt-1">{help}</span>}
    </div>
  );

  const sectionVisible = config.visible !== false;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-adm-line pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-adm-accent mb-1">
            <Car className="w-4 h-4" />
            <span>VIP MOBILITY & TRANSFERS</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text">Chauffeur & Transfers Editor</h1>
          <p className="text-xs sm:text-sm text-adm-muted mt-1">
            Edit every text, image and button of the "Arrive. Relax." transfer section on the homepage.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => {
              setConfig({ ...config, visible: !sectionVisible });
              setSuccess(null);
            }}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
              sectionVisible
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
            title="Show or hide the whole transfer section on the website"
          >
            {sectionVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{sectionVisible ? 'Section Visible' : 'Section Hidden'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold uppercase transition-colors shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Guide */}
      <div className="p-4 rounded-xl bg-adm-surface border border-adm-accent/30 flex items-start space-x-3 text-xs">
        <Car className="w-5 h-5 text-adm-accent shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-adm-text block mb-0.5">📍 Where this appears on the website:</span>
          <p className="text-adm-muted leading-relaxed">
            The <strong>VIP Chauffeur & Transfers</strong> section on the homepage. While a field still holds its
            original default text, visitors see the built-in translation for their language; once you change it,
            your text is shown in every language (translate it in Admin → Translations if needed). Empty fields
            fall back to the built-in text.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 01: Header */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent border-b border-adm-line pb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>01 — Section Header</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput('eyebrow', 'Eyebrow Label', 'Small label above the heading.')}
            {renderInput('heading', 'Heading', 'The large section heading.', 'font-serif')}
          </div>

          {renderTextarea('subhead', 'Intro Text', 'Paragraph below the heading.')}
        </div>

        {/* Section 02: Vehicle image & route overlay */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent border-b border-adm-line pb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>02 — Vehicle Photo & Route Overlay</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <AdminImageInput
                value={config.vehicleImage}
                onChange={(url) => setField('vehicleImage', url)}
                label="Foto Kendaraan (Vehicle Image)"
                hint="Masukkan URL foto atau langsung upload file gambar dari komputer (JPG, PNG, WebP)."
                altText={config.vehicleImageAlt}
                onAltTextChange={(alt) => setField('vehicleImageAlt', alt)}
                previewHeight="h-56"
              />
            </div>

            <div className="space-y-4">
              {renderInput('routeLabel', 'Route Label', 'Teks kecil di atas overlay foto, contoh: ABEID AMANI KARUME INT\'L (ZNZ) → ZANZIRANGI HOUSE')}
              {renderInput('routeTitle', 'Route Title', 'Teks judul miring di bawah route label, contoh: Private Coastal Chauffeur Service')}

              {/* Overlay preview indicator */}
              <div className="p-3.5 rounded-lg bg-adm-bg border border-adm-line text-xs space-y-1.5">
                <span className="text-[10px] font-mono text-adm-accent uppercase block">Tampilan Overlay di Website:</span>
                <p className="font-mono text-[11px] text-[#FAF8F5] uppercase tracking-wider">
                  {config.routeLabel || '(Route label belum diisi)'}
                </p>
                <p className="font-serif italic text-[#D8CCB8]">
                  {config.routeTitle || '(Route title belum diisi)'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 03: Specification card */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent border-b border-adm-line pb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>03 — Transfer Specification Card</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput('specsEyebrow', 'Card Eyebrow', 'Small label at the top of the card.')}
            {renderInput('cardTitle', 'Card Title', 'Serif title of the card.', 'font-serif')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPEC_BOXES.map((box) => {
              const visible = isBoxVisible(config, box.type);
              return (
                <div
                  key={box.type}
                  className={`p-4 rounded-lg bg-adm-bg border border-adm-line space-y-2 ${visible ? '' : 'opacity-60'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-adm-accent block">{box.label}</span>
                      <span className="text-[10px] text-adm-faint">{box.hint}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleBox(box.type)}
                      className={`p-1 rounded border text-xs cursor-pointer ${
                        visible
                          ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                      }`}
                      title={visible ? 'Box visible — click to hide' : 'Box hidden — click to show'}
                    >
                      {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <label className="block text-[10px] font-mono text-adm-muted uppercase">Title</label>
                  <input
                    type="text"
                    value={readText(config, box.titleField)}
                    onChange={(e) => setField(box.titleField, e.target.value)}
                    className={boxInputClass}
                  />
                  <label className="block text-[10px] font-mono text-adm-muted uppercase">
                    {box.sublineField ? 'Value' : 'Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={readText(config, box.descField)}
                    onChange={(e) => setField(box.descField, e.target.value)}
                    className={boxInputClass}
                  />
                  {box.sublineField && (
                    <>
                      <label className="block text-[10px] font-mono text-adm-muted uppercase">Small note below the value</label>
                      <input
                        type="text"
                        value={readText(config, box.sublineField)}
                        onChange={(e) => setField(box.sublineField as TextFieldKey, e.target.value)}
                        className={boxInputClass}
                      />
                      <span className="text-[10px] text-adm-faint block">
                        Empty = built-in translated note "(Details available on request)".
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {renderTextarea('amenitiesNote', 'In-Car Amenities Note', 'Highlighted note under the boxes.', 2)}
        </div>

        {/* Section 04: CTAs */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent border-b border-adm-line pb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>04 — Buttons</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput('ctaRequestLabel', 'WhatsApp Request Button', 'Dark button; opens WhatsApp with the message below.')}
            {renderInput('ctaAddBookingLabel', 'Add to Booking Button', 'Outline button; opens the booking request form.')}
          </div>

          <div>
            <label className="flex items-center space-x-1.5 text-xs font-mono text-adm-text-2 uppercase mb-1">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Pre-filled Message</span>
            </label>
            <textarea
              rows={2}
              value={readText(config, 'whatsappMessage')}
              onChange={(e) => setField('whatsappMessage', e.target.value)}
              className={inputClass}
            />
            <span className="text-[10px] text-adm-faint block mt-1">
              Text the guest's WhatsApp opens with. Empty = built-in message in the visitor's language.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
