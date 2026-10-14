import type { TravPhraseInput } from '../traveller/types';

/**
 * Curated Arabic (Modern Standard Arabic) travel phrases. Offline phrasebook
 * (no free MT). `text` is Arabic (rendered RTL by the UI), `source` is the
 * English query it answers, and `hint` is a Latin transliteration so beginners
 * can pronounce it without reading Arabic script.
 */
export const arTravellerPhrases: TravPhraseInput[] = [
  // ---- transport ----
  { id: 'ar-taxi', text: 'أحتاج سيارة أجرة.', source: 'I need a taxi.', hint: 'aḥtāju sayyārat ujra', category: 'transport' },
  { id: 'ar-bus', text: 'حافلة إلى الشارع المركزي.', source: 'A bus to Central Street.', hint: 'ḥāfila ilā ash-shāriʿ al-markazī', category: 'transport' },
  { id: 'ar-train', text: 'متى يغادر القطار؟', source: 'When does the train leave?', hint: 'matā yughādir al-qiṭār?', category: 'transport' },
  { id: 'ar-station', text: 'أين المحطة؟', source: 'Where is the station?', hint: 'ayna al-maḥaṭṭa?', category: 'transport' },
  { id: 'ar-ticket', text: 'تذكرة، من فضلك.', source: 'A ticket, please.', hint: 'tadhkara, min faḍlik', category: 'transport' },
  // ---- airport ----
  { id: 'ar-airport', text: 'أين المطار؟', source: 'Where is the airport?', hint: 'ayna al-maṭār?', category: 'airport' },
  { id: 'ar-checkin', text: 'أين كاونتر تسجيل الوصول؟', source: 'Where is the check-in desk?', hint: 'ayna kāwntar tasjīl al-wuṣūl?', category: 'airport' },
  { id: 'ar-flight', text: 'متى تقلع رحلتي؟', source: 'What time does my flight leave?', hint: 'matā tuqliʿu riḥlatī?', category: 'airport' },
  { id: 'ar-gate', text: 'أين البوابة؟', source: 'Where is the gate?', hint: 'ayna al-bawwāba?', category: 'airport' },
  { id: 'ar-luggage', text: 'أين استلام الأمتعة؟', source: 'Where is baggage claim?', hint: 'ayna istilām al-amtiʿa?', category: 'airport' },
  // ---- hotel ----
  { id: 'ar-hotel', text: 'أريد فندقا.', source: 'I would like a hotel.', hint: 'urīd funduqan', category: 'hotel' },
  { id: 'ar-room', text: 'غرفة، من فضلك.', source: 'A room, please.', hint: 'ghurfa, min faḍlik', category: 'hotel' },
  { id: 'ar-reservation', text: 'لدي حجز.', source: 'I have a reservation.', hint: 'ladayya ḥajz', category: 'hotel' },
  { id: 'ar-key', text: 'أين المفتاح؟', source: 'Where is the key?', hint: 'ayna al-miftāḥ?', category: 'hotel' },
  { id: 'ar-breakfast', text: 'هل الفطور مشمول؟', source: 'Is breakfast included?', hint: 'hal al-fuṭūr mashmūl?', category: 'hotel' },
  { id: 'ar-reception', text: 'أريد التحدث إلى الاستقبال.', source: 'I want to speak to the reception.', hint: 'urīd at-taḥadduth ilā al-istiqbāl', category: 'hotel' },
  // ---- restaurant ----
  { id: 'ar-restaurant', text: 'مطعم، من فضلك.', source: 'A restaurant, please.', hint: 'maṭʿam, min faḍlik', category: 'restaurant' },
  { id: 'ar-menu', text: 'القائمة، من فضلك.', source: 'The menu, please.', hint: 'al-qāʾima, min faḍlik', category: 'restaurant' },
  { id: 'ar-bill', text: 'الحساب، من فضلك.', source: 'The bill, please.', hint: 'al-ḥisāb, min faḍlik', category: 'restaurant' },
  { id: 'ar-water', text: 'كوب ماء، من فضلك.', source: 'A glass of water, please.', hint: 'kūb māʾ, min faḍlik', category: 'restaurant' },
  { id: 'ar-coffee', text: 'قهوة، من فضلك.', source: 'A coffee, please.', hint: 'qahwa, min faḍlik', category: 'restaurant' },
  { id: 'ar-delicious', text: 'هذا لذيذ.', source: 'This is delicious.', hint: 'hādhā ladhdhīdh', category: 'restaurant' },
  // ---- shopping ----
  { id: 'ar-shop', text: 'أين المتجر؟', source: 'Where is the shop?', hint: 'ayna al-matjar?', category: 'shopping' },
  { id: 'ar-price', text: 'بكم هذا؟', source: 'How much is this?', hint: 'bi-kam hādhā?', category: 'shopping' },
  { id: 'ar-card', text: 'هل تقبلون البطاقات؟', source: 'Do you accept cards?', hint: 'hal taqbalūn al-biṭāqāt?', category: 'shopping' },
  { id: 'ar-expensive', text: 'هذا غالٍ جدا.', source: 'This is too expensive.', hint: 'hādhā ghālin jiddan', category: 'shopping' },
  { id: 'ar-change', text: 'هل لديك فكة؟', source: 'Do you have change?', hint: 'hal ladayka fakka?', category: 'shopping' },
  // ---- emergency ----
  { id: 'ar-help', text: 'النجدة!', source: 'Help!', hint: 'an-najda!', category: 'emergency' },
  { id: 'ar-police', text: 'اتصلوا بالشرطة.', source: 'Call the police.', hint: 'ittaṣilū bish-shurṭa', category: 'emergency' },
  { id: 'ar-doctor', text: 'أحتاج طبيبا.', source: 'I need a doctor.', hint: 'aḥtāju ṭabīban', category: 'emergency' },
  { id: 'ar-pharmacy', text: 'أين الصيدلية؟', source: 'Where is the pharmacy?', hint: 'ayna aṣ-ṣaydaliyya?', category: 'emergency' },
  { id: 'ar-hospital', text: 'أين المستشفى؟', source: 'Where is the hospital?', hint: 'ayna al-mustashfā?', category: 'emergency' },
  // ---- polite / custom ----
  { id: 'ar-hello', text: 'مرحبا.', source: 'Hello.', hint: 'marhaban', category: 'custom' },
  { id: 'ar-goodbye', text: 'مع السلامة.', source: 'Goodbye.', hint: 'maʿa as-salāma', category: 'custom' },
  { id: 'ar-thanks', text: 'شكرا.', source: 'Thank you.', hint: 'shukran', category: 'custom' },
  { id: 'ar-please', text: 'من فضلك.', source: 'Please.', hint: 'min faḍlik', category: 'custom' },
  { id: 'ar-sorry', text: 'آسف.', source: 'I am sorry.', hint: 'āsif', category: 'custom' },
  { id: 'ar-yes', text: 'نعم.', source: 'Yes.', hint: 'naʿam', category: 'custom' },
  { id: 'ar-no', text: 'لا.', source: 'No.', hint: 'lā', category: 'custom' },
  { id: 'ar-excuse', text: 'المعذرة.', source: 'Excuse me.', hint: 'al-maʿdhira', category: 'custom' },
  { id: 'ar-nice-meet', text: 'تشرفنا.', source: 'Nice to meet you.', hint: 'tasharrafnā', category: 'custom' },
  { id: 'ar-help-me', text: 'هل يمكنك مساعدتي؟', source: 'Can you help me, please?', hint: 'hal yumkinuk musāʿadatī?', category: 'custom' },
  { id: 'ar-english', text: 'هل تتكلم الإنجليزية؟', source: 'Do you speak English?', hint: 'hal tatakallam al-inglīziyya?', category: 'custom' },
  { id: 'ar-slowly', text: 'هل يمكنك التحدث ببطء؟', source: 'Can you speak more slowly?', hint: 'hal yumkinuk at-taḥadduth bi-buṭʾ?', category: 'custom' },
  { id: 'ar-from-where', text: 'من أين أنت؟', source: 'Where are you from?', hint: 'min ayna anta?', category: 'custom' },
];