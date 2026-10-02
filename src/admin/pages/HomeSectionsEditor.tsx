import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Plus, Trash2, RotateCcw, Copy, Image as ImageIcon, Languages } from 'lucide-react';
import { HomeSectionsContent } from '../../data/homeSectionsCms';
import { TRANSLATIONS } from '../../data/translations';
import { PROPERTY_EXPERIENCE_TRANSLATIONS, CONCIERGE_TRANSLATIONS } from '../../data/serviceTranslations';
import { EXPLORE_UI_TRANSLATIONS, getLocalizedZanzibarDestinations } from '../../data/destinationTranslations';
import { ITINERARY_UI_TRANSLATIONS, getLocalizedSampleItinerary } from '../../data/itineraryTranslations';
import { REVIEWS_UI_TRANSLATIONS } from '../../data/reviewsTranslations';
import { GALLERY_TRANSLATIONS } from '../../data/galleryTranslations';
import { FACET_KEYS, FACET_IMAGES } from '../../components/PropertyExperienceSection';
import { OTA_DEFAULT_CHANNELS, OTA_DEFAULT_TEXT } from '../../components/OtaChannelsSection';
import { MAP_DEFAULTS } from '../../components/MapSection';
import { FINAL_CTA_DEFAULTS } from '../../components/FinalCtaSection';

// ---------------------------------------------------------------------------
// Schema: every editable homepage section, its fields and (English) built-in
// defaults. Defaults are shown as placeholders; an empty field keeps the
// built-in multilingual text on the live website.
// ---------------------------------------------------------------------------

type FieldType = 'text' | 'textarea' | 'image' | 'url';

interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
}

interface ListDef {
  key: string;
  label: string;
  itemName: string;
  fields: FieldDef[];
  /** Built-in items (English) used to pre-fill the list when the admin starts customizing it. */
  defaults: () => any[];
  /** Optional nested list inside each item (e.g. itinerary activities). */
  nested?: ListDef;
}

interface SectionDef {
  id: string;
  label: string;
  hint: string;
  fields: FieldDef[];
  lists?: ListDef[];
}

const en = TRANSLATIONS.en as any;
const expEn = PROPERTY_EXPERIENCE_TRANSLATIONS.en;
const conEn = CONCIERGE_TRANSLATIONS.en;
const exploreEn = EXPLORE_UI_TRANSLATIONS.en;
const itinEn = ITINERARY_UI_TRANSLATIONS.en;
const reviewsEn = REVIEWS_UI_TRANSLATIONS.en;

const headingFields = (eyebrow: string, heading: string, subhead: string): FieldDef[] => [
  { key: 'eyebrow', label: 'Eyebrow (small label above the heading)', placeholder: eyebrow },
  { key: 'heading', label: 'Section Heading', placeholder: heading },
  { key: 'subhead', label: 'Description / Subheading', type: 'textarea', placeholder: subhead },
];

const SECTION_SCHEMAS: SectionDef[] = [
  {
    id: 'quickBooking',
    label: 'Availability Search Bar',
    hint: 'Quick check-in / check-out form right below the hero banner.',
    fields: [
      { key: 'title', label: 'Title (mobile view)', placeholder: en.quickBooking.title },
      { key: 'checkInLabel', label: 'Check-in Label', placeholder: en.quickBooking.checkIn },
      { key: 'checkOutLabel', label: 'Check-out Label', placeholder: en.quickBooking.checkOut },
      { key: 'guestsLabel', label: 'Guests Label', placeholder: en.quickBooking.guests },
      { key: 'villaLabel', label: 'Villa Choice Label', placeholder: en.quickBooking.villaChoice },
      { key: 'allVillasLabel', label: '"All Villas" Option', placeholder: en.quickBooking.allVillas },
      { key: 'buttonLabel', label: 'Button Text', placeholder: en.quickBooking.checkAvailability },
    ],
  },
  {
    id: 'villas',
    label: 'Stay Your Way (Villa)',
    hint: 'Heading of the villa list. Villa cards are edited under Rooms & Villas.',
    fields: headingFields(en.villas?.featuredTag || 'Sanctuary Accommodations', en.villas?.heading || 'STAY YOUR WAY', en.villas?.subhead || ''),
  },
  {
    id: 'experience',
    label: 'Discover the Retreat',
    hint: 'Interactive showcase of 8 property spaces (villas, pool, lounge, garden, etc.).',
    fields: headingFields(expEn.eyebrow, expEn.heading, expEn.subhead),
    lists: [
      {
        key: 'facets',
        label: 'Property Spaces',
        itemName: 'Space',
        fields: [
          { key: 'title', label: 'Title' },
          { key: 'subtitle', label: 'Subtitle' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'image', label: 'Image (URL)', type: 'image' },
        ],
        defaults: () =>
          FACET_KEYS.map((key) => ({
            key,
            title: expEn.facets[key]?.title || key,
            subtitle: expEn.facets[key]?.subtitle || '',
            description: expEn.facets[key]?.description || '',
            image: FACET_IMAGES[key],
          })),
      },
    ],
  },
  {
    id: 'explore',
    label: 'Explore Zanzibar',
    hint: 'Destination cards (Stone Town, Mnemba, Spice Farm, etc.). The button opens WhatsApp.',
    fields: [
      ...headingFields(exploreEn.eyebrow, exploreEn.heading, exploreEn.subhead),
      { key: 'whatsappPrompt', label: 'WhatsApp Message Prefix', placeholder: exploreEn.whatsappPrompt },
    ],
    lists: [
      {
        key: 'destinations',
        label: 'Destination Cards',
        itemName: 'Destination',
        fields: [
          { key: 'name', label: 'Destination Name' },
          { key: 'theme', label: 'Theme / Category' },
          { key: 'location', label: 'Location' },
          { key: 'shortDescription', label: 'Short Description', type: 'textarea' },
          { key: 'highlights', label: 'Highlights (comma separated)' },
          { key: 'ctaLabel', label: 'Button Text' },
          { key: 'image', label: 'Image (URL)', type: 'image' },
        ],
        defaults: () =>
          getLocalizedZanzibarDestinations('en').map((d) => ({
            id: d.id,
            name: d.name,
            theme: d.theme,
            location: d.location,
            shortDescription: d.shortDescription,
            highlights: d.highlights.join(', '),
            ctaLabel: d.ctaLabel,
            image: d.image,
          })),
      },
    ],
  },
  {
    id: 'itinerary',
    label: 'Build Your Journey (Itinerary)',
    hint: 'Sample day-by-day itinerary guests can customize and send to the concierge.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow (small label above the heading)', placeholder: itinEn.eyebrow },
      { key: 'heading', label: 'Section Heading', placeholder: itinEn.heading },
      { key: 'badge', label: 'Quote', placeholder: itinEn.badge },
      { key: 'subhead', label: 'Description', type: 'textarea', placeholder: itinEn.subhead },
      { key: 'customizeCta', label: 'Send Button Text', placeholder: itinEn.customizeCta },
    ],
    lists: [
      {
        key: 'days',
        label: 'Itinerary Days',
        itemName: 'Day',
        fields: [
          { key: 'dayNumber', label: 'Day Label (e.g. DAY 01)' },
          { key: 'dayTitle', label: 'Day Title' },
          { key: 'location', label: 'Location' },
        ],
        defaults: () =>
          getLocalizedSampleItinerary('en').map((day) => ({
            dayNumber: day.dayNumber,
            dayTitle: day.dayTitle,
            location: day.location,
            activities: day.activities.map((a) => ({
              id: a.id,
              time: a.time,
              title: a.title,
              description: a.description,
              includedByDefault: a.includedByDefault,
            })),
          })),
        nested: {
          key: 'activities',
          label: 'Activities',
          itemName: 'Activity',
          fields: [
            { key: 'time', label: 'Time' },
            { key: 'title', label: 'Activity Title' },
            { key: 'description', label: 'Description', type: 'textarea' },
          ],
          defaults: () => [],
        },
      },
    ],
  },
  {
    id: 'concierge',
    label: 'Personal Concierge',
    hint: 'Concierge services list and the 24/7 support banner.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow (small label above the heading)', placeholder: conEn.eyebrow },
      { key: 'heading', label: 'Section Heading', placeholder: conEn.heading },
      { key: 'quote', label: 'Quote', type: 'textarea', placeholder: conEn.quote },
      { key: 'subhead', label: 'Description', type: 'textarea', placeholder: conEn.subhead },
      { key: 'availableLabel', label: 'Availability Label', placeholder: conEn.availableLabel },
      { key: 'inquireLabel', label: 'Inquiry Link Text', placeholder: conEn.inquireLabel },
      { key: 'bannerEyebrow', label: 'Banner – Label', placeholder: conEn.bannerEyebrow },
      { key: 'bannerTitle', label: 'Banner – Title', placeholder: conEn.bannerTitle },
      { key: 'bannerDesc', label: 'Banner – Description', type: 'textarea', placeholder: conEn.bannerDesc },
      { key: 'supportBtn', label: 'Banner – Button Text', placeholder: conEn.supportBtn },
    ],
    lists: [
      {
        key: 'services',
        label: 'Concierge Services',
        itemName: 'Service',
        fields: [
          { key: 'title', label: 'Service Name' },
          { key: 'desc', label: 'Description', type: 'textarea' },
        ],
        defaults: () => conEn.services.map((s) => ({ title: s.title, desc: s.desc })),
      },
    ],
  },
  {
    id: 'video',
    label: 'Promotional Film',
    hint: 'Video section heading. The video and scenes are edited under Video Reel 4K.',
    fields: headingFields('Cinematic Brand Reel', en.video.heading, en.video.subhead),
  },
  {
    id: 'facilities',
    label: 'Facilities & Amenities',
    hint: 'Facilities section heading. Facility cards are edited under Facilities & Spa.',
    fields: headingFields('Curated Estate Amenities', en.facilities.heading, en.facilities.subhead),
  },
  {
    id: 'gallery',
    label: 'Photo Gallery',
    hint: 'Gallery section heading. Photos are edited under Photo Gallery.',
    fields: headingFields(GALLERY_TRANSLATIONS.en.eyebrow, en.gallery.heading, en.gallery.subhead),
  },
  {
    id: 'reviews',
    label: 'Guest Reviews',
    hint: 'Reviews section heading. Reviews are edited under Guest Reviews.',
    fields: headingFields(reviewsEn.eyebrow, reviewsEn.heading, reviewsEn.subhead),
  },
  {
    id: 'otaChannels',
    label: 'OTA Channels (Booking.com, etc.)',
    hint: 'Online booking partners and the book-direct benefits banner.',
    fields: [
      ...headingFields(OTA_DEFAULT_TEXT.eyebrow, en.ota.heading, en.ota.subhead),
      { key: 'bannerTitle', label: 'Banner – Title', placeholder: OTA_DEFAULT_TEXT.bannerTitle },
      { key: 'bannerText', label: 'Banner – Benefits', placeholder: OTA_DEFAULT_TEXT.bannerText },
      { key: 'badge', label: 'Banner – Badge', placeholder: OTA_DEFAULT_TEXT.badge },
      { key: 'notice', label: 'Footnote', placeholder: en.ota.notice },
    ],
    lists: [
      {
        key: 'channels',
        label: 'Partner Channels',
        itemName: 'Channel',
        fields: [
          { key: 'name', label: 'Name (e.g. Booking.com)' },
          { key: 'tag', label: 'Tag (e.g. Preferred Partner)' },
          { key: 'url', label: 'Listing URL (optional)', type: 'url' },
        ],
        defaults: () => OTA_DEFAULT_CHANNELS.map((c) => ({ ...c })),
      },
    ],
  },
  {
    id: 'map',
    label: 'Location & Map',
    hint: 'Address, phone and email come from the Contact tab of this editor.',
    fields: [
      ...headingFields(MAP_DEFAULTS.eyebrow, en.map.heading, en.map.subhead),
      { key: 'badge', label: 'Map Badge', placeholder: MAP_DEFAULTS.badge },
      { key: 'directionsLabel', label: 'Directions Button Text', placeholder: en.map.getDirections },
      { key: 'directionsUrl', label: 'Google Maps Link', type: 'url', placeholder: MAP_DEFAULTS.directionsUrl },
      { key: 'copyLabel', label: 'Copy Address Button Text', placeholder: MAP_DEFAULTS.copyLabel },
      { key: 'copiedLabel', label: 'Copied Confirmation Text', placeholder: MAP_DEFAULTS.copiedLabel },
      { key: 'embedUrl', label: 'Google Maps embed URL', type: 'url', placeholder: MAP_DEFAULTS.embedUrl },
    ],
    lists: [
      {
        key: 'travel',
        label: 'Travel Times',
        itemName: 'Destination',
        fields: [
          { key: 'label', label: 'Destination' },
          { key: 'value', label: 'Time / Note' },
        ],
        defaults: () => MAP_DEFAULTS.travel.map((t) => ({ ...t })),
      },
    ],
  },
  {
    id: 'finalCta',
    label: 'Closing Call to Action',
    hint: 'Closing section above the footer with booking and contact buttons.',
    fields: [
      ...headingFields(FINAL_CTA_DEFAULTS.eyebrow, en.finalCta.heading, en.finalCta.subhead),
      { key: 'bookLabel', label: 'Book Button Text', placeholder: en.finalCta.bookStay },
      { key: 'contactLabel', label: 'Contact Button Text', placeholder: en.finalCta.contactUs },
      { key: 'backgroundImage', label: 'Background Image (URL)', type: 'image', placeholder: FINAL_CTA_DEFAULTS.backgroundImage },
    ],
  },
];

// ---------------------------------------------------------------------------

const inputClass =
  'w-full bg-adm-bg border border-adm-line focus:border-adm-accent focus:ring-1 focus:ring-adm-accent rounded-lg px-3 py-2 text-sm text-adm-text placeholder-adm-faint outline-none transition-all';

const countCustomized = (content: Record<string, any> | undefined): number => {
  if (!content) return 0;
  return Object.values(content).filter((v) =>
    Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim() !== '' : false
  ).length;
};

interface FieldInputProps {
  field: FieldDef;
  value: any;
  onChange: (value: string) => void;
}

const FieldInput: React.FC<FieldInputProps> = ({ field, value, onChange }) => {
  const strValue = typeof value === 'string' ? value : '';
  const previewSrc = strValue || field.placeholder;
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-adm-text-2 block">{field.label}</label>
      {field.type === 'textarea' ? (
        <textarea
          rows={3}
          value={strValue}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={strValue}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
          {field.type === 'image' && (
            <div className="w-14 h-10 shrink-0 rounded-md overflow-hidden border border-adm-line bg-adm-raised flex items-center justify-center">
              {previewSrc ? (
                <img src={previewSrc} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-4 h-4 text-adm-faint" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ListEditorProps {
  def: ListDef;
  items: any[] | undefined;
  onChange: (items: any[] | undefined) => void;
  depth?: number;
}

const ListEditor: React.FC<ListEditorProps> = ({ def, items, onChange, depth = 0 }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isCustom = Array.isArray(items) && items.length > 0;
  const builtInCount = def.defaults().length;

  const updateItem = (idx: number, patch: Record<string, any>) => {
    const next = [...(items || [])];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (!items || target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
    setOpenIndex(target);
  };

  const remove = (idx: number) => {
    const next = (items || []).filter((_, i) => i !== idx);
    onChange(next.length > 0 ? next : depth > 0 ? [] : undefined);
  };

  const add = () => {
    const blank: Record<string, any> = {};
    def.fields.forEach((f) => (blank[f.key] = ''));
    if (def.nested) blank[def.nested.key] = [];
    const next = [...(items || []), blank];
    onChange(next);
    setOpenIndex(next.length - 1);
  };

  const itemTitle = (item: any, idx: number) => {
    const first = def.fields.map((f) => item?.[f.key]).find((v) => typeof v === 'string' && v.trim());
    return first ? String(first) : `${def.itemName} ${idx + 1}`;
  };

  return (
    <div className={`rounded-xl border border-adm-line ${depth === 0 ? 'bg-adm-panel p-4' : 'bg-adm-bg/60 p-3'} space-y-3`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm text-adm-text">{def.label}</h4>
          <p className="text-[11px] text-adm-muted">
            {isCustom
              ? `${items!.length} custom ${def.itemName.toLowerCase()}(s) — shown the same in every language.`
              : depth === 0
                ? `Using ${builtInCount} built-in ${def.itemName.toLowerCase()}(s) (automatically multilingual).`
                : `No ${def.itemName.toLowerCase()} yet.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isCustom && depth === 0 && (
            <button
              type="button"
              onClick={() => {
                onChange(def.defaults());
                setOpenIndex(0);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-semibold cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Customize {def.itemName}s (copy built-in content)</span>
            </button>
          )}
          {isCustom && depth === 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Remove all customizations of ${def.label} and return to the built-in multilingual content?`)) {
                  onChange(undefined);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line text-adm-text-2 text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore built-in</span>
            </button>
          )}
          {(isCustom || depth > 0) && (
            <button
              type="button"
              onClick={add}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line text-adm-text text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-adm-accent" />
              <span>Add {def.itemName}</span>
            </button>
          )}
        </div>
      </div>

      {isCustom && (
        <div className="space-y-2">
          {items!.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="rounded-lg border border-adm-line bg-adm-surface">
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <span className="text-[10px] text-adm-accent font-semibold mr-2">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="text-sm text-adm-text truncate">{itemTitle(item, idx)}</span>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1.5 rounded text-adm-muted hover:text-adm-text hover:bg-adm-raised disabled:opacity-30 cursor-pointer" title="Move up">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => move(idx, 1)} disabled={idx === items!.length - 1} className="p-1.5 rounded text-adm-muted hover:text-adm-text hover:bg-adm-raised disabled:opacity-30 cursor-pointer" title="Move down">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => remove(idx)} className="p-1.5 rounded text-red-400 hover:bg-red-950/40 cursor-pointer" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div className="px-3 pb-3 pt-1 border-t border-adm-line space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {def.fields.map((f) => (
                        <div key={f.key} className={f.type === 'textarea' || f.type === 'image' ? 'md:col-span-2' : ''}>
                          <FieldInput field={f} value={item?.[f.key]} onChange={(v) => updateItem(idx, { [f.key]: v })} />
                        </div>
                      ))}
                    </div>
                    {def.nested && (
                      <ListEditor
                        def={def.nested}
                        items={item?.[def.nested.key] || []}
                        onChange={(nestedItems) => updateItem(idx, { [def.nested!.key]: nestedItems || [] })}
                        depth={depth + 1}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface HomeSectionsEditorProps {
  value: HomeSectionsContent;
  onChange: (next: HomeSectionsContent) => void;
}

export const HomeSectionsEditor: React.FC<HomeSectionsEditorProps> = ({ value, onChange }) => {
  const [activeId, setActiveId] = useState(SECTION_SCHEMAS[0].id);
  const section = SECTION_SCHEMAS.find((s) => s.id === activeId) || SECTION_SCHEMAS[0];
  const content = value[section.id] || {};

  const updateSection = (patch: Record<string, any>) => {
    const nextSection = { ...content, ...patch };
    Object.keys(nextSection).forEach((k) => {
      if (nextSection[k] === undefined) delete nextSection[k];
    });
    onChange({ ...value, [section.id]: nextSection });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Section Picker */}
      <div className="lg:col-span-4 space-y-1.5">
        <div className="p-3 rounded-xl bg-adm-accent/10 border border-adm-accent/25 flex items-start gap-2.5 mb-3">
          <Languages className="w-4 h-4 text-adm-accent shrink-0 mt-0.5" />
          <p className="text-[11px] text-adm-text-2 leading-relaxed">
            <b>Empty</b> fields use the built-in text, automatically translated into 8 languages. <b>Filled</b> fields are shown
            the same in every language. The grey placeholder text in each field is the current built-in text.
          </p>
        </div>
        {SECTION_SCHEMAS.map((s) => {
          const custom = countCustomized(value[s.id]);
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-[13px] transition-all cursor-pointer ${
                isActive
                  ? 'bg-adm-accent-fill text-adm-on-accent font-semibold'
                  : 'bg-adm-surface border border-adm-line text-adm-text-2 hover:text-adm-text hover:border-adm-line-strong'
              }`}
            >
              <span className="truncate">{s.label}</span>
              {custom > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-black/15' : 'bg-adm-accent/15 text-adm-accent'
                  }`}
                >
                  {custom} edited
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section Fields */}
      <div className="lg:col-span-8 space-y-4">
        <div className="p-5 rounded-xl bg-adm-surface border border-adm-line space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-adm-line">
            <div>
              <h3 className="text-lg text-adm-text">{section.label}</h3>
              <p className="text-xs text-adm-muted mt-0.5">{section.hint}</p>
            </div>
            {countCustomized(content) > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Clear all fields of "${section.label}" and return to the built-in text?`)) {
                    const next = { ...value };
                    delete next[section.id];
                    onChange(next);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line text-adm-text-2 text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset this section</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((f) => (
              <div key={f.key} className={f.type === 'textarea' || f.type === 'image' || f.type === 'url' ? 'md:col-span-2' : ''}>
                <FieldInput field={f} value={content[f.key]} onChange={(v) => updateSection({ [f.key]: v })} />
              </div>
            ))}
          </div>
        </div>

        {section.lists?.map((list) => (
          <ListEditor
            key={`${section.id}-${list.key}`}
            def={list}
            items={content[list.key]}
            onChange={(items) => updateSection({ [list.key]: items })}
          />
        ))}
      </div>
    </div>
  );
};
