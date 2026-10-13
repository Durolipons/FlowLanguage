import type { LanguagePack } from './schema';

export const frPack: LanguagePack = {
  code: 'fr',
  name: 'Français',
  englishName: 'French',
  flag: '🇫🇷',
  speechLocale: 'fr-FR',
  ttsLanguage: 'fr-FR',
  items: {
    'fr-bonjour': { id: 'fr-bonjour', text: 'bonjour', translation: 'hello / good day', emoji: '👋' },
    'fr-salut': { id: 'fr-salut', text: 'salut', translation: 'hi', emoji: '😄' },
    'fr-au-revoir': { id: 'fr-au-revoir', text: 'au revoir', translation: 'goodbye', emoji: '🚪' },
    'fr-bonne-nuit': { id: 'fr-bonne-nuit', text: 'bonne nuit', translation: 'good night', emoji: '🌙' },
    'fr-merci': { id: 'fr-merci', text: 'merci', translation: 'thank you', emoji: '🙏' },
    'fr-sil-vous-plait': { id: 'fr-sil-vous-plait', text: "s'il vous plaît", translation: 'please', emoji: '🤲' },
    'fr-de-rien': { id: 'fr-de-rien', text: 'de rien', translation: "you're welcome", emoji: '😊' },
    'fr-oui': { id: 'fr-oui', text: 'oui', translation: 'yes', emoji: '✅' },
    'fr-non': { id: 'fr-non', text: 'non', translation: 'no', emoji: '❌' },
    'fr-un': { id: 'fr-un', text: 'un', translation: 'one', emoji: '1️⃣' },
    'fr-deux': { id: 'fr-deux', text: 'deux', translation: 'two', emoji: '2️⃣' },
    'fr-trois': { id: 'fr-trois', text: 'trois', translation: 'three', emoji: '3️⃣' },
    'fr-quatre': { id: 'fr-quatre', text: 'quatre', translation: 'four', emoji: '4️⃣' },
    'fr-cinq': { id: 'fr-cinq', text: 'cinq', translation: 'five', emoji: '5️⃣' },
  },
  units: [
    {
      id: 'fr-unit-1',
      title: 'Salutations',
      subtitle: 'Say hello and goodbye',
      emoji: '👋',
      lessons: [
        { id: 'fr-l1', title: 'Bonjour & Au Revoir', itemIds: ['fr-bonjour', 'fr-salut', 'fr-au-revoir', 'fr-bonne-nuit'] },
      ],
    },
    {
      id: 'fr-unit-2',
      title: 'Politesse',
      subtitle: 'Please, thanks, and more',
      emoji: '💬',
      lessons: [
        { id: 'fr-l2', title: 'Merci & Pardon', itemIds: ['fr-merci', 'fr-sil-vous-plait', 'fr-de-rien', 'fr-oui', 'fr-non'] },
      ],
    },
    {
      id: 'fr-unit-3',
      title: 'Les Nombres',
      subtitle: 'Count from one to five',
      emoji: '🔢',
      lessons: [
        { id: 'fr-l3', title: 'Un à Cinq', itemIds: ['fr-un', 'fr-deux', 'fr-trois', 'fr-quatre', 'fr-cinq'] },
      ],
    },
  ],
};
