import type { TravPhraseInput } from '@/traveller/types';

/**
 * Polish (pl) curated traveller phrases — offline phrasebook + translate lookup.
 * `text` = Polish side, `source` = English query it answers. The `pl` pack code
 * matches the existing Polish language pack (`src/content/pl.ts`).
 * To extend: copy an entry, give it a unique `pl-...` id, and append it here.
 */
export const plTravellerPhrases: TravPhraseInput[] = [
  // Transport
  { id: 'pl-taxi', text: 'Potrzebuję taksówki.', source: 'I need a taxi.', category: 'transport', hint: 'po-trshe-BOO-yeh tak-SOOF-kee' },
  { id: 'pl-lotnisko', text: 'Gdzie jest lotnisko?', source: 'Where is the airport?', category: 'transport', hint: 'gjyeh yest lot-NEES-ko' },
  { id: 'pl-odprawa', text: 'Gdzie jest stanowisko odprawy?', source: 'Where is the check-in desk?', category: 'transport' },
  { id: 'pl-lot', text: 'O której godzinie odlatuje mój samolot?', source: 'What time does my flight leave?', category: 'transport' },
  { id: 'pl-bilet', text: 'Bilet do centrum.', source: 'A ticket to the city centre.', category: 'transport' },
  { id: 'pl-pociag', text: 'O której godzinie odjeżdża pociąg?', source: 'What time does the train leave?', category: 'transport' },
  { id: 'pl-dworzec', text: 'Gdzie jest dworzec?', source: 'Where is the station?', category: 'transport', hint: 'gjyeh yest DVO-zhets' },
  { id: 'pl-autobus', text: 'Autobus na dworzec, proszę.', source: 'A bus to the station, please.', category: 'transport' },
  { id: 'pl-przewodnik', text: 'Gdzie mogę znaleźć przewodnika?', source: 'Where can I find a guide?', category: 'transport' },
  { id: 'pl-adres', text: 'Adres, proszę.', source: 'An address, please.', category: 'transport' },
  // Hotel
  { id: 'pl-hotel', text: 'Chciałbym pokój w hotelu.', source: 'I would like a hotel room.', category: 'hotel', hint: 'HCHAW-bim PO-kooj v ho-TE-loo' },
  { id: 'pl-pokoj', text: 'Pokój z budzikiem.', source: 'A room with an alarm clock.', category: 'hotel' },
  { id: 'pl-rezerwacja', text: 'Rezerwacja na nazwisko.', source: 'A reservation under my name.', category: 'hotel' },
  { id: 'pl-klucz', text: 'Gdzie jest klucz?', source: 'Where is the key?', category: 'hotel', hint: 'gjyeh yest klooch' },
  { id: 'pl-recepcja', text: 'Jestem przy recepcji.', source: 'I am at the reception.', category: 'hotel' },
  { id: 'pl-sniadanie', text: 'Czy śniadanie jest wliczone?', source: 'Is breakfast included?', category: 'hotel' },
  { id: 'pl-kolacja', text: 'O której godzinie serwujecie kolację?', source: 'What time do you serve dinner?', category: 'hotel' },
  // Restaurant
  { id: 'pl-restauracja', text: 'Restauracja, proszę.', source: 'A restaurant, please.', category: 'restaurant' },
  { id: 'pl-menu', text: 'Menu, proszę.', source: 'The menu, please.', category: 'restaurant' },
  { id: 'pl-rachunek', text: 'Rachunek, proszę.', source: 'The bill, please.', category: 'restaurant', hint: 'ra-HOO-nek PRO-sheh' },
  { id: 'pl-woda', text: 'Szklanka wody, proszę.', source: 'A glass of water, please.', category: 'restaurant' },
  { id: 'pl-piwo', text: 'Piwo, proszę.', source: 'A beer, please.', category: 'restaurant' },
  { id: 'pl-bez', text: 'Bez tego, proszę.', source: 'Without this, please.', category: 'restaurant' },
  { id: 'pl-stolik', text: 'Stolik dla dwóch osób, proszę.', source: 'A table for two, please.', category: 'restaurant' },
  // Shopping
  { id: 'pl-sklep', text: 'Gdzie jest sklep?', source: 'Where is the shop?', category: 'shopping', hint: 'gjyeh yest sklep' },
  { id: 'pl-cena', text: 'Ile to kosztuje?', source: 'How much is it?', category: 'shopping', hint: 'EE-leh to kosh-TOO-yeh' },
  { id: 'pl-karta', text: 'Czy akceptujecie karty?', source: 'Do you accept cards?', category: 'shopping' },
  { id: 'pl-reszta', text: 'Czy mogę prosić o resztę?', source: 'Can I have change, please?', category: 'shopping' },
  // Emergency
  { id: 'pl-pomoc', text: 'Pomocy!', source: 'Help!', category: 'emergency', hint: 'po-MO-tsi' },
  { id: 'pl-policja', text: 'Wezwijcie policję.', source: 'Call the police.', category: 'emergency' },
  { id: 'pl-lekarz', text: 'Potrzebuję lekarza.', source: 'I need a doctor.', category: 'emergency', hint: 'po-trshe-BOO-yeh le-KA-zha' },
  { id: 'pl-apteka', text: 'Gdzie jest apteka?', source: 'Where is the pharmacy?', category: 'emergency', hint: 'gjyeh yest ap-TE-ka' },
  { id: 'pl-karetka', text: 'Wezwijcie karetkę.', source: 'Call an ambulance.', category: 'emergency' },
  // Custom
  { id: 'pl-czesc', text: 'Cześć.', source: 'Hello.', category: 'custom', hint: 'cheshch' },
  { id: 'pl-dowidzenia', text: 'Do widzenia.', source: 'Goodbye.', category: 'custom' },
  { id: 'pl-dziekuje', text: 'Dziękuję.', source: 'Thank you.', category: 'custom', hint: 'jen-KOO-yeh' },
  { id: 'pl-prosze', text: 'Proszę.', source: 'Please.', category: 'custom', hint: 'PRO-sheh' },
  { id: 'pl-przepraszam', text: 'Przepraszam.', source: 'Sorry.', category: 'custom', hint: 'pshe-PRA-sham' },
  { id: 'pl-tak', text: 'Tak.', source: 'Yes.', category: 'custom' },
  { id: 'pl-nie', text: 'Nie.', source: 'No.', category: 'custom' },
  { id: 'pl-milo', text: 'Miło mi.', source: 'Nice to meet you.', category: 'custom' },
  { id: 'pl-pomoz', text: 'Czy może mi Pan pomóc?', source: 'Can you help me, please?', category: 'custom' },
  { id: 'pl-angielski', text: 'Czy mówi Pan po angielsku?', source: 'Do you speak English?', category: 'custom', hint: 'chi MOO-vee pan po an-GYEL-skoo' },
  { id: 'pl-wolniej', text: 'Czy może Pan mówić wolniej?', source: 'Can you speak more slowly?', category: 'custom' },
  { id: 'pl-skad', text: 'Skąd Pan jest?', source: 'Where are you from?', category: 'custom' },
];
