import type { LanguagePack } from './schema';

export const esPack: LanguagePack = {
  code: 'es',
  name: 'Español',
  englishName: 'Spanish',
  flag: '🇪🇸',
  speechLocale: 'es-ES',
  ttsLanguage: 'es-ES',
  items: {
    // Greetings
    'es-hola': { id: 'es-hola', text: 'hola', translation: 'hello', emoji: '👋' },
    'es-buenos-dias': { id: 'es-buenos-dias', text: 'buenos días', translation: 'good morning', emoji: '🌅' },
    'es-buenas-noches': { id: 'es-buenas-noches', text: 'buenas noches', translation: 'good night', emoji: '🌙' },
    'es-adios': { id: 'es-adios', text: 'adiós', translation: 'goodbye', emoji: '🚪' },
    'es-hasta-luego': { id: 'es-hasta-luego', text: 'hasta luego', translation: 'see you later', emoji: '✋' },
    // Polite words
    'es-gracias': { id: 'es-gracias', text: 'gracias', translation: 'thank you', emoji: '🙏' },
    'es-por-favor': { id: 'es-por-favor', text: 'por favor', translation: 'please', emoji: '🤲' },
    'es-de-nada': { id: 'es-de-nada', text: 'de nada', translation: "you're welcome", emoji: '😊' },
    'es-perdon': { id: 'es-perdon', text: 'perdón', translation: 'sorry', emoji: '🙇' },
    'es-si': { id: 'es-si', text: 'sí', translation: 'yes', emoji: '✅' },
    'es-no': { id: 'es-no', text: 'no', translation: 'no', emoji: '❌' },
    // Introductions
    'es-como-estas': { id: 'es-como-estas', text: '¿cómo estás?', translation: 'how are you?', emoji: '🙂' },
    'es-me-llamo': { id: 'es-me-llamo', text: 'me llamo Ana', translation: 'my name is Ana', emoji: '📛' },
    'es-mucho-gusto': { id: 'es-mucho-gusto', text: 'mucho gusto', translation: 'nice to meet you', emoji: '🤝' },
    'es-y-tu': { id: 'es-y-tu', text: '¿y tú?', translation: 'and you?', emoji: '👉' },
    'es-bien': { id: 'es-bien', text: 'bien', translation: 'well / good', emoji: '👍' },
    // Numbers
    'es-uno': { id: 'es-uno', text: 'uno', translation: 'one', emoji: '1️⃣' },
    'es-dos': { id: 'es-dos', text: 'dos', translation: 'two', emoji: '2️⃣' },
    'es-tres': { id: 'es-tres', text: 'tres', translation: 'three', emoji: '3️⃣' },
    'es-cuatro': { id: 'es-cuatro', text: 'cuatro', translation: 'four', emoji: '4️⃣' },
    'es-cinco': { id: 'es-cinco', text: 'cinco', translation: 'five', emoji: '5️⃣' },
    // Colors
    'es-rojo': { id: 'es-rojo', text: 'rojo', translation: 'red', emoji: '🟥' },
    'es-azul': { id: 'es-azul', text: 'azul', translation: 'blue', emoji: '🟦' },
    'es-verde': { id: 'es-verde', text: 'verde', translation: 'green', emoji: '🟩' },
    'es-amarillo': { id: 'es-amarillo', text: 'amarillo', translation: 'yellow', emoji: '🟨' },
    'es-blanco': { id: 'es-blanco', text: 'blanco', translation: 'white', emoji: '⬜' },
    'es-negro': { id: 'es-negro', text: 'negro', translation: 'black', emoji: '⬛' },
    // Food & drink
    'es-agua': { id: 'es-agua', text: 'agua', translation: 'water', emoji: '💧' },
    'es-pan': { id: 'es-pan', text: 'pan', translation: 'bread', emoji: '🍞' },
    'es-cafe': { id: 'es-cafe', text: 'café', translation: 'coffee', emoji: '☕' },
    'es-leche': { id: 'es-leche', text: 'leche', translation: 'milk', emoji: '🥛' },
    'es-manzana': { id: 'es-manzana', text: 'manzana', translation: 'apple', emoji: '🍎' },
  },
  units: [
    {
      id: 'es-unit-1',
      title: 'Greetings',
      subtitle: 'Say hello and goodbye',
      emoji: '👋',
      lessons: [
        { id: 'es-l1', title: 'Hello & Goodbye', itemIds: ['es-hola', 'es-buenos-dias', 'es-buenas-noches', 'es-adios', 'es-hasta-luego'] },
      ],
    },
    {
      id: 'es-unit-2',
      title: 'Polite Words',
      subtitle: 'Please, thanks, and more',
      emoji: '💬',
      lessons: [
        { id: 'es-l2', title: 'Please & Thanks', itemIds: ['es-gracias', 'es-por-favor', 'es-de-nada', 'es-perdon', 'es-si', 'es-no'] },
      ],
    },
    {
      id: 'es-unit-3',
      title: 'Introductions',
      subtitle: 'Introduce yourself',
      emoji: '🙋',
      lessons: [
        { id: 'es-l3', title: 'About You', itemIds: ['es-como-estas', 'es-me-llamo', 'es-mucho-gusto', 'es-y-tu', 'es-bien'] },
      ],
    },
    {
      id: 'es-unit-4',
      title: 'Numbers',
      subtitle: 'Count from one to five',
      emoji: '🔢',
      lessons: [
        { id: 'es-l4', title: 'One to Five', itemIds: ['es-uno', 'es-dos', 'es-tres', 'es-cuatro', 'es-cinco'] },
      ],
    },
    {
      id: 'es-unit-5',
      title: 'Colors',
      subtitle: 'Name the colors',
      emoji: '🎨',
      lessons: [
        { id: 'es-l5', title: 'Basic Colors', itemIds: ['es-rojo', 'es-azul', 'es-verde', 'es-amarillo', 'es-blanco', 'es-negro'] },
      ],
    },
    {
      id: 'es-unit-6',
      title: 'Food & Drink',
      subtitle: 'Everyday essentials',
      emoji: '🍎',
      lessons: [
        { id: 'es-l6', title: 'At the Table', itemIds: ['es-agua', 'es-pan', 'es-cafe', 'es-leche', 'es-manzana'] },
      ],
    },
  ],
};
