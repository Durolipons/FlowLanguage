import type { TravPhraseInput } from '../traveller/types';

/**
 * Czech (cs) curated traveller phrases — offline phrasebook + translate lookup.
 * `text` = Czech side, `source` = English query it answers. The `cs` pack code
 * matches the existing Czech language pack (`src/content/cs.ts`).
 * Hints are curated Czech pronunciation glosses, never machine-generated.
 * To extend: copy an entry, give it a unique `cs-...` id, and append it here.
 */
export const csTravellerPhrases: TravPhraseInput[] = [
  // Transport
  { id: 'cs-taxi', text: 'Potřebuji taxi.', source: 'I need a taxi.', category: 'transport', hint: 'pot-rzhe-BOO-yi TAK-si' },
  { id: 'cs-letiste', text: 'Kde je letiště?', source: 'Where is the airport?', category: 'transport', hint: 'gdeh yeh LEH-tishtyeh' },
  { id: 'cs-odbaveni', text: 'Kde je přepážka odbavení?', source: 'Where is the check-in desk?', category: 'transport' },
  { id: 'cs-let', text: 'V kolik hodin odlétá moje letadlo?', source: 'What time does my flight leave?', category: 'transport' },
  { id: 'cs-jizdenka', text: 'Jízdenku do centra.', source: 'A ticket to the city centre.', category: 'transport' },
  { id: 'cs-vlak', text: 'V kolik hodin odjíždí vlak?', source: 'What time does the train leave?', category: 'transport' },
  { id: 'cs-nadrazi', text: 'Kde je nádraží?', source: 'Where is the station?', category: 'transport', hint: 'gdeh yeh NAH-dra-zhee' },
  { id: 'cs-autobus', text: 'Autobus na nádraží, prosím.', source: 'A bus to the station, please.', category: 'transport' },
  { id: 'cs-pruvodce', text: 'Kde najdu průvodce?', source: 'Where can I find a guide?', category: 'transport' },
  { id: 'cs-adresa', text: 'Adresu, prosím.', source: 'An address, please.', category: 'transport' },
  // Hotel
  { id: 'cs-hotel', text: 'Chtěl bych pokoj v hotelu.', source: 'I would like a hotel room.', category: 'hotel', hint: 'khtyel bikh PO-koy v ho-TE-loo' },
  { id: 'cs-pokoj', text: 'Pokoj s budíkem.', source: 'A room with an alarm clock.', category: 'hotel' },
  { id: 'cs-rezervace', text: 'Rezervace na jméno.', source: 'A reservation under my name.', category: 'hotel' },
  { id: 'cs-klic', text: 'Kde je klíč?', source: 'Where is the key?', category: 'hotel', hint: 'gdeh yeh kleech' },
  { id: 'cs-recepce', text: 'Mluvím s recepcí.', source: 'I am speaking with the reception.', category: 'hotel' },
  { id: 'cs-snidane', text: 'Je snídaně v ceně?', source: 'Is breakfast included?', category: 'hotel' },
  { id: 'cs-vecere', text: 'V kolik hodin podáváte večeři?', source: 'What time do you serve dinner?', category: 'hotel' },
  // Restaurant
  { id: 'cs-restaurace', text: 'Restauraci, prosím.', source: 'A restaurant, please.', category: 'restaurant' },
  { id: 'cs-menu', text: 'Jídelní lístek, prosím.', source: 'The menu, please.', category: 'restaurant', hint: 'yee-DEL-nyee LEES-tek' },
  { id: 'cs-ucet', text: 'Účet, prosím.', source: 'The bill, please.', category: 'restaurant', hint: 'OO-chet' },
  { id: 'cs-voda', text: 'Sklenici vody, prosím.', source: 'A glass of water, please.', category: 'restaurant' },
  { id: 'cs-pivo', text: 'Jedno pivo, prosím.', source: 'One beer, please.', category: 'restaurant' },
  { id: 'cs-bez', text: 'Bez […], prosím.', source: 'No […], please.', category: 'restaurant' },
  { id: 'cs-vegetarian', text: 'Jsem vegetarián.', source: 'I am vegetarian.', category: 'restaurant' },
  // Shopping
  { id: 'cs-obchod', text: 'Kde je obchod?', source: 'Where is the shop?', category: 'shopping' },
  { id: 'cs-cena', text: 'Kolik to stojí?', source: 'How much does it cost?', category: 'shopping', hint: 'KO-lik to STO-yee' },
  { id: 'cs-karta', text: 'Mohu platit kartou?', source: 'Can I pay by card?', category: 'shopping' },
  { id: 'cs-sleva', text: 'Máte slevu?', source: 'Do you have a discount?', category: 'shopping' },
  // Emergency
  { id: 'cs-pomoc', text: 'Pomoc!', source: 'Help!', category: 'emergency', hint: 'PO-mots' },
  { id: 'cs-nemocnice', text: 'Kde je nemocnice?', source: 'Where is the hospital?', category: 'emergency' },
  { id: 'cs-doktor', text: 'Potřebuji doktora.', source: 'I need a doctor.', category: 'emergency' },
  { id: 'cs-lekarna', text: 'Kde je lékárna?', source: 'Where is the pharmacy?', category: 'emergency' },
  { id: 'cs-policie', text: 'Zavolejte policii!', source: 'Call the police!', category: 'emergency' },
  // Custom
  { id: 'cs-ano', text: 'Ano.', source: 'Yes.', category: 'custom' },
  { id: 'cs-ne', text: 'Ne.', source: 'No.', category: 'custom' },
  { id: 'cs-dekuji', text: 'Děkuji.', source: 'Thank you.', category: 'custom', hint: 'DYEH-koo-yi' },
  { id: 'cs-prosim', text: 'Prosím.', source: 'Please. / You are welcome.', category: 'custom', hint: 'pro-SEEM' },
  { id: 'cs-prominte', text: 'Promiňte.', source: 'Excuse me. / Sorry.', category: 'custom' },
  { id: 'cs-dobry-den', text: 'Dobrý den.', source: 'Hello. (formal)', category: 'custom' },
  { id: 'cs-ahoj', text: 'Ahoj.', source: 'Hi. (informal)', category: 'custom', hint: 'a-HOY' },
  { id: 'cs-na-shledanou', text: 'Na shledanou.', source: 'Goodbye.', category: 'custom' },
  { id: 'cs-jak-se-mate', text: 'Jak se máte?', source: 'How are you? (formal)', category: 'custom' },
  { id: 'cs-dobre', text: 'Dobře, děkuji.', source: 'Fine, thank you.', category: 'custom' },
  { id: 'cs-nerozumim', text: 'Nerozumím.', source: "I don't understand.", category: 'custom' },
  { id: 'cs-anglicky', text: 'Mluvíte anglicky?', source: 'Do you speak English?', category: 'custom' },
  { id: 'cs-cesky-ne', text: 'Nemluvím česky.', source: "I don't speak Czech.", category: 'custom' },
];
