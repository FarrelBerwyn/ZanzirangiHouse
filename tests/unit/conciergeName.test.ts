import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatWelcomeMessage } from '../../src/data/chatTranslations.ts';
import { supportAiEngine } from '../../server/services/supportAiEngine.ts';

describe('Concierge Name Dynamic Formatting & Resolution', () => {
  it('formats welcomeMessage using default name (Elena) when not specified', () => {
    const en = formatWelcomeMessage('en');
    assert.match(en, /My name is Elena/);

    const fr = formatWelcomeMessage('fr');
    assert.match(fr, /Je m'appelle Elena/);

    const sw = formatWelcomeMessage('sw');
    assert.match(sw, /Naitwa Elena/);

    const es = formatWelcomeMessage('es');
    assert.match(es, /Mi nombre es Elena/);

    const itMsg = formatWelcomeMessage('it');
    assert.match(itMsg, /Mi chiamo Elena/);

    const pl = formatWelcomeMessage('pl');
    assert.match(pl, /Nazywam się Elena/);
  });

  it('formats welcomeMessage with custom recent name when changed by admin', () => {
    const customName = 'Amina';
    const en = formatWelcomeMessage('en', customName);
    assert.match(en, /My name is Amina/);
    assert.doesNotMatch(en, /Juma/);
    assert.doesNotMatch(en, /Elena/);

    const sw = formatWelcomeMessage('sw', customName);
    assert.match(sw, /Naitwa Amina/);

    const fr = formatWelcomeMessage('fr', 'Juma');
    assert.match(fr, /Je m'appelle Juma/);
  });

  it('evaluates identity query (siapa kamu / who are you) with dynamic recent concierge name', async () => {
    // Default name
    const defaultRes = await supportAiEngine.evaluateQuery('siapa kamu', 'id', '/', 'Elena');
    assert.match(defaultRes.replyText, /(?:Saya|I am)\s+Elena/);

    // Custom changed name
    const customRes = await supportAiEngine.evaluateQuery('siapa kamu', 'id', '/', 'Farrel');
    assert.match(customRes.replyText, /(?:Saya|I am)\s+Farrel/);
    assert.doesNotMatch(customRes.replyText, /Elena/);

    // English identity inquiry
    const enRes = await supportAiEngine.evaluateQuery('who are you', 'en', '/', 'Amina');
    assert.match(enRes.replyText, /(?:Saya|I am)\s+Amina/);
  });

  it('evaluates greeting with dynamic recent concierge name', async () => {
    const resMalam = await supportAiEngine.evaluateQuery('selamat malam', 'id', '/', 'Khadija');
    assert.match(resMalam.replyText, /Khadija/);

    const resPagi = await supportAiEngine.evaluateQuery('good morning', 'en', '/', 'Baraka');
    assert.match(resPagi.replyText, /(?:I am|My name is)\s+Baraka/);

    const resHello = await supportAiEngine.evaluateQuery('hello', 'en', '/', 'Sarah');
    assert.match(resHello.replyText, /Sarah/);
    assert.doesNotMatch(resHello.replyText, /Elena/);

    const resHalo = await supportAiEngine.evaluateQuery('halo', 'id', '/', 'Zainab');
    assert.match(resHalo.replyText, /Zainab/);
  });
});
