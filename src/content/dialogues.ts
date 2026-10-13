import type { Dialogue } from './schema';

/**
 * Sample dialogues for listening/speaking practice. Add more here; the app
 * picks them up automatically. Generate expressive audio per speaker with
 * Chatterbox (see scripts/tts/generate_dialogues.py).
 */
export const dialogues: Dialogue[] = [
  {
    id: 'es-cafe',
    title: 'En el café',
    language: 'es',
    emoji: '☕',
    speakers: ['ana', 'luis'],
    turns: [
      { speaker: 'ana', text: '¡Hola! Buenos días.', translation: 'Hi! Good morning.' },
      { speaker: 'luis', text: 'Buenos días. Un café, por favor.', translation: 'Good morning. A coffee, please.' },
      { speaker: 'ana', text: '¿Algo más?', translation: 'Anything else?' },
      { speaker: 'luis', text: 'Sí, un vaso de agua, por favor.', translation: 'Yes, a glass of water, please.' },
      { speaker: 'ana', text: 'Son cinco euros.', translation: "That's five euros." },
      { speaker: 'luis', text: 'Muchas gracias.', translation: 'Thank you very much.' },
      { speaker: 'ana', text: 'De nada. ¡Buenas tardes!', translation: "You're welcome. Have a good afternoon!" },
    ],
  },
  {
    id: 'es-presentaciones',
    title: 'Mucho gusto',
    language: 'es',
    emoji: '🤝',
    speakers: ['ana', 'luis'],
    turns: [
      { speaker: 'ana', text: 'Hola, me llamo Ana. ¿Y tú?', translation: "Hi, my name is Ana. And you?" },
      { speaker: 'luis', text: 'Me llamo Luis. Mucho gusto.', translation: 'My name is Luis. Nice to meet you.' },
      { speaker: 'ana', text: 'Encantada. ¿De dónde eres?', translation: 'Delighted. Where are you from?' },
      { speaker: 'luis', text: 'Soy de España. ¿Hablas inglés?', translation: "I'm from Spain. Do you speak English?" },
      { speaker: 'ana', text: 'Sí, un poco. ¿Cómo estás?', translation: 'Yes, a little. How are you?' },
      { speaker: 'luis', text: 'Muy bien, gracias.', translation: 'Very well, thank you.' },
    ],
  },
  {
    id: 'fr-cafe',
    title: 'Au café',
    language: 'fr',
    emoji: '🥐',
    speakers: ['marie', 'pierre'],
    turns: [
      { speaker: 'marie', text: 'Bonjour ! Bienvenue.', translation: 'Hello! Welcome.' },
      { speaker: 'pierre', text: 'Bonjour. Un café, s\'il vous plaît.', translation: 'Hello. A coffee, please.' },
      { speaker: 'marie', text: 'Autre chose ?', translation: 'Anything else?' },
      { speaker: 'pierre', text: 'Non, merci. C\'est combien ?', translation: 'No, thank you. How much is it?' },
      { speaker: 'marie', text: 'Trois euros, s\'il vous plaît.', translation: 'Three euros, please.' },
      { speaker: 'pierre', text: 'Merci, au revoir !', translation: 'Thank you, goodbye!' },
    ],
  },
];
