import type { TravPhraseInput } from '../traveller/types';

/** Curated French travel phrases. Offline phrasebook (no free MT). */
export const frTravellerPhrases: TravPhraseInput[] = [
  // ---- transport ----
  { id: 'fr-taxi', text: 'J\'ai besoin d\'un taxi.', source: 'I need a taxi.', category: 'transport' },
  { id: 'fr-aeroport', text: 'Où est l\'aéroport?', source: 'Where is the airport?', category: 'airport' },
  { id: 'fr-checkin', text: 'Où est la réception ?', source: 'Where is the check-in desk?', category: 'airport' },
  { id: 'fr-vol', text: 'À quelle heure part mon vol?', source: 'What time does my flight leave?', category: 'airport' },
  { id: 'fr-bus', text: 'Un billet jusqu\'au centre.', source: 'A ticket to the city centre.', category: 'transport' },
  { id: 'fr-train', text: 'À quelle heure part le train?', source: 'What time does the train leave?', category: 'transport' },
  { id: 'fr-gare', text: 'Où est la gare?', source: 'Where is the station?', category: 'transport' },
  { id: 'fr-autobus', text: 'Un bus pour la gare, s\'il vous plaît.', source: 'A bus to the station, please.', category: 'transport' },
  { id: 'fr-guide', text: 'Où puis-je trouver un guide?', source: 'Where can I find a guide?', category: 'transport' },
  { id: 'fr-adresse', text: 'Une adresse, s\'il vous plaît.', source: 'An address, please.', category: 'transport' },
  // ---- hotel ----
  { id: 'fr-hotel', text: 'Je voudrais un hôtel.', source: 'I would like a hotel.', category: 'hotel' },
  { id: 'fr-chambre', text: 'Une chambre avec réveil.', source: 'A room with a light.', category: 'hotel' },
  { id: 'fr-reservation', text: 'Une réservation au nom de...', source: 'A reservation under the name of...', category: 'hotel' },
  { id: 'fr-cle', text: 'Où est la clé?', source: 'Where is the key?', category: 'hotel' },
  { id: 'fr-reception', text: 'Je suis à la réception.', source: 'I am at the reception.', category: 'hotel' },
  { id: 'fr-breakfast', text: 'Le petit-déjeuner est-il inclus?', source: 'Is breakfast included?', category: 'hotel' },
  { id: 'fr-dinner', text: 'À quelle heure dîne-t-on?', source: 'What time do you serve dinner?', category: 'hotel' },
  // ---- restaurant ----
  { id: 'fr-restaurant', text: 'Un restaurant, s\'il vous plaît.', source: 'A restaurant, please.', category: 'restaurant' },
  { id: 'fr-menu', text: 'Le menu, s\'il vous plaît.', source: 'The menu, please.', category: 'restaurant' },
  { id: 'fr-prix', text: 'L\'addition, s\'il vous plaît.', source: 'The bill, please.', category: 'restaurant' },
  { id: 'fr-eau', text: 'Un verre d\'eau, s\'il vous plaît.', source: 'A glass of water, please.', category: 'restaurant' },
  { id: 'fr-biere', text: 'Une bière, s\'il vous plaît.', source: 'A beer, please.', category: 'restaurant' },
  { id: 'fr-sans', text: 'Sans [...], s\'il vous plaît.', source: 'No [...], please.', category: 'restaurant' },
  { id: 'fr-service-table', text: 'Y a-t-il un service à table?', source: 'Do you have table service?', category: 'restaurant' },
  // ---- shopping ----
  { id: 'fr-marchandise', text: 'Où est la boutique?', source: 'Where is the shop?', category: 'shopping' },
  { id: 'fr-combien', text: 'Combien ça coûte?', source: 'How much is it?', category: 'shopping' },
  { id: 'fr-carte', text: 'Acceptez-vous les cartes?', source: 'Do you accept cards?', category: 'shopping' },
  { id: 'fr-monnaie', text: 'De la monnaie, s\'il vous plaît.', source: 'Can I have change, please?', category: 'shopping' },
  // ---- emergency ----
  { id: 'fr-aide', text: 'Au secours!', source: 'Help!', category: 'emergency' },
  { id: 'fr-police', text: 'Appelez la police.', source: 'Call the police.', category: 'emergency' },
  { id: 'fr-medecin', text: 'J\'ai besoin d\'un médecin.', source: 'I need a doctor.', category: 'emergency' },
  { id: 'fr-pharmacie', text: 'Où est la pharmacie?', source: 'Where is the pharmacy?', category: 'emergency' },
  { id: 'fr-ambulance', text: 'Appelez une ambulance.', source: 'Call an ambulance.', category: 'emergency' },
  // ---- polite / custom ----
  { id: 'fr-salut', text: 'Salut.', source: 'Hello.', category: 'custom' },
  { id: 'fr-aurevoir', text: 'Au revoir.', source: 'Goodbye.', category: 'custom' },
  { id: 'fr-merci', text: 'Merci.', source: 'Thank you.', category: 'custom' },
  { id: 'fr-sil-vous-plait', text: 'S\'il vous plaît.', source: 'Please.', category: 'custom' },
  { id: 'fr-pardon', text: 'Pardon.', source: 'Sorry.', category: 'custom' },
  { id: 'fr-oui', text: 'Oui.', source: 'Yes.', category: 'custom' },
  { id: 'fr-non', text: 'Non.', source: 'No.', category: 'custom' },
  { id: 'fr-excuse', text: 'Excusez-moi.', source: 'Excuse me.', category: 'custom' },
  { id: 'fr-enchante', text: 'Enchanté.', source: 'Nice to meet you.', category: 'custom' },
  { id: 'fr-pouvez', text: 'Pouvez-vous m\'aider ?', source: 'Can you help me, please?', category: 'custom' },
  { id: 'fr-anglais', text: 'Parlez-vous anglais ?', source: 'Do you speak English?', category: 'custom' },
  { id: 'fr-plus-lent', text: 'Pouvez-vous parler plus lentement ?', source: 'Can you speak more slowly?', category: 'custom' },
  { id: 'fr-dou', text: 'D\'où venez-vous ?', source: 'Where are you from?', category: 'custom' },
];
