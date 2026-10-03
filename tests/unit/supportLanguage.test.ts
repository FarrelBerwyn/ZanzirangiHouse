import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { supportAiEngine } from '../../server/services/supportAiEngine.ts';

describe('Customer Support Multi-Language Purity & Integrity', () => {
  it('answers "How much cost the villa with ocean view" strictly in English when English is picked', async () => {
    const res = await supportAiEngine.evaluateQuery(
      'How much cost the villa with ocean view',
      'en',
      '/',
      'Elena'
    );

    // English response assertion
    assert.match(res.replyText, /sanctuaries|villas|luxury|suites|breakfast/i);
    // Never mix Indonesian
    assert.doesNotMatch(res.replyText, /Setiap villa|kolam renang|kami memiliki|pantai Kizimkazi/i);
    // Never mix other languages
    assert.doesNotMatch(res.replyText, /Chacune de nos|Każda z naszych/i);
    // Action label must be in English
    assert.match(res.action?.label || '', /Book a Villa|View Private Villas/);
    assert.notEqual(res.action?.label, 'Lihat Private Villa');
  });

  it('answers strictly in Polish when Polish is picked', async () => {
    const res = await supportAiEngine.evaluateQuery(
      'Ile kosztuje willa z widokiem na ocean?',
      'pl',
      '/',
      'Elena'
    );

    assert.match(res.replyText, /willi|luksusowych|śniadanie|prywatnymi basenami/i);
    assert.doesNotMatch(res.replyText, /Every single one|Setiap villa/i);
    assert.match(res.action?.label || '', /Zarezerwuj Willę|Zobacz Prywatne Wille/);
  });

  it('answers strictly in French when French is picked', async () => {
    const res = await supportAiEngine.evaluateQuery(
      'Quel est le prix de la villa avec vue sur la mer ?',
      'fr',
      '/',
      'Elena'
    );

    assert.match(res.replyText, /villas de luxe|piscines|majordome/i);
    assert.doesNotMatch(res.replyText, /Every single one|Setiap villa/i);
    assert.match(res.action?.label || '', /Réserver une villa|Voir les Villas Privées/);
  });

  it('answers strictly in Swahili when Swahili is picked', async () => {
    const res = await supportAiEngine.evaluateQuery(
      'Bei ya villa na mtazamo wa bahari ni ngapi?',
      'sw',
      '/',
      'Elena'
    );

    assert.match(res.replyText, /villa|mabwawa binafsi|kifungua kinywa/i);
    assert.doesNotMatch(res.replyText, /Every single one|Setiap villa/i);
    assert.match(res.action?.label || '', /Weka Villa Sasa|Angalia Villa Binafsi/);
  });

  it('answers strictly in Spanish when Spanish is picked', async () => {
    const res = await supportAiEngine.evaluateQuery(
      '¿Cuánto cuesta la villa con vista al mar?',
      'es',
      '/',
      'Elena'
    );

    assert.match(res.replyText, /villas|piscina|desayuno gourmet/i);
    assert.doesNotMatch(res.replyText, /Every single one|Setiap villa/i);
    assert.match(res.action?.label || '', /Reservar Villa|Ver Villas Privadas/);
  });

  it('answers strictly in Italian when Italian is picked', async () => {
    const res = await supportAiEngine.evaluateQuery(
      'Quanto costa la villa con vista sull’oceano?',
      'it',
      '/',
      'Elena'
    );

    assert.match(res.replyText, /ville|piscina|colazione gourmet/i);
    assert.doesNotMatch(res.replyText, /Every single one|Setiap villa/i);
    assert.match(res.action?.label || '', /Prenota una Villa|Visualizza Ville Private/);
  });

  it('answers strictly in Arabic when Arabic is picked', async () => {
    const res = await supportAiEngine.evaluateQuery(
      'كم تكلفة الفيلا المطلة على المحيط؟',
      'ar',
      '/',
      'Elena'
    );

    assert.match(res.replyText, /فلل|مسابح|الإفطار/i);
    assert.doesNotMatch(res.replyText, /Every single one|Setiap villa/i);
    assert.match(res.action?.label || '', /احجز فيلا الآن|عرض الفلل الخاصة/);
  });

  it('answers strictly in Chinese when Chinese is picked', async () => {
    const res = await supportAiEngine.evaluateQuery(
      '海景别墅价格是多少？',
      'zh',
      '/',
      'Elena'
    );

    assert.match(res.replyText, /别墅|私人泳池|早餐/i);
    assert.doesNotMatch(res.replyText, /Every single one|Setiap villa/i);
    assert.match(res.action?.label || '', /立即预订别墅|查看私人独立别墅/);
  });

  it('answers in Indonesian only when Indonesian is explicitly picked', async () => {
    const res = await supportAiEngine.evaluateQuery(
      'Berapa harga sewa villa ocean view?',
      'id',
      '/',
      'Elena'
    );

    assert.match(res.replyText, /sanctuary|villa|ketersediaan/i);
    assert.match(res.action?.label || '', /Reservasi Villa|Lihat Private Villa/);
  });

  it('routes human requests strictly in the picked language without mixing', async () => {
    const resEn = await supportAiEngine.evaluateQuery('Can I talk to human admin please?', 'en');
    assert.equal(resEn.decision, 'HANDOFF_TO_HUMAN');
    assert.match(resEn.replyText, /forwarded directly to our Zanzirangi House Admin team/i);
    assert.doesNotMatch(resEn.replyText, /Tentu! Pesan Anda/);

    const resPl = await supportAiEngine.evaluateQuery('Chcę porozmawiać z człowiekiem', 'pl');
    assert.equal(resPl.decision, 'HANDOFF_TO_HUMAN');
    assert.match(resPl.replyText, /przekazana bezpośrednio do naszego zespołu administracyjnego/i);
    assert.doesNotMatch(resPl.replyText, /forwarded directly/i);

    const resId = await supportAiEngine.evaluateQuery('Bisa bicara dengan admin?', 'id');
    assert.equal(resId.decision, 'HANDOFF_TO_HUMAN');
    assert.match(resId.replyText, /Tentu! Pesan Anda telah kami teruskan langsung ke Admin/);
  });
});
