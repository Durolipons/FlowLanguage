import type { TravPhraseInput } from '../traveller/types';

/** Curated Spanish travel phrases. Offline phrasebook (no free MT). */
export const esTravellerPhrases: TravPhraseInput[] = [
  // ---- transport ----
  { id: 'es-taxi', text: 'Necesito un taxi.', source: 'I need a taxi.', category: 'transport' },
  { id: 'es-aeropuerto', text: '¿Dónde está el aeropuerto?', source: 'Where is the airport?', category: 'airport' },
  { id: 'es-checkin', text: '¿Dónde está la sala de check-in?', source: 'Where is the check-in desk?', category: 'airport' },
  { id: 'es-vuelo', text: '¿A qué hora sale mi vuelo?', source: 'What time does my flight leave?', category: 'airport' },
  { id: 'es-bus', text: 'Un billete a la calle Central.', source: 'A ticket to Central Street.', category: 'transport' },
  { id: 'es-tren', text: '¿A qué hora sale el tren?', source: 'What time does the train leave?', category: 'transport' },
  { id: 'es-estacion', text: '¿Dónde está la estación?', source: 'Where is the station?', category: 'transport' },
  { id: 'es-autobus', text: 'Un autobús a la estación, por favor.', source: 'A bus to the station, please.', category: 'transport' },
  { id: 'es-guia', text: '¿Dónde puedo encontrar una guía?', source: 'Where can I find a guide?', category: 'transport' },
  { id: 'es-direcciones', text: 'Una dirección, por favor.', source: 'An address, please.', category: 'transport' },
  // ---- hotel ----
  { id: 'es-hotel', text: 'Quisiera un hotel.', source: 'I would like a hotel.', category: 'hotel' },
  { id: 'es-habitacion', text: 'Una habitación con despertador.', source: 'A room with a light.', category: 'hotel' },
  { id: 'es-reserva', text: 'Una reserva a nombre de...', source: 'A reservation under the name of...', category: 'hotel' },
  { id: 'es-llave', text: '¿Dónde está la llave?', source: 'Where is the key?', category: 'hotel' },
  { id: 'es-recepcion', text: 'Hablo con la recepción.', source: 'I am speaking with the reception.', category: 'hotel' },
  { id: 'es-desayuno', text: '¿El desayuno está incluido?', source: 'Is breakfast included?', category: 'hotel' },
  { id: 'es-cena', text: '¿A qué hora sirven la cena?', source: 'What time do you serve dinner?', category: 'hotel' },
  // ---- restaurant ----
  { id: 'es-restaurante', text: 'Un restaurante, por favor.', source: 'A restaurant, please.', category: 'restaurant' },
  { id: 'es-menu', text: 'El menú, por favor.', source: 'The menu, please.', category: 'restaurant' },
  { id: 'es-pago', text: 'La cuenta, por favor.', source: 'The bill, please.', category: 'restaurant' },
  { id: 'es-agua', text: 'Una copa de agua, por favor.', source: 'A glass of water, please.', category: 'restaurant' },
  { id: 'es-cerveza', text: 'Una cerveza, por favor.', source: 'A beer, please.', category: 'restaurant' },
  { id: 'es-sin', text: 'Sin [...], por favor.', source: 'No [...], please.', category: 'restaurant' },
  { id: 'es-servicio-mostrador', text: '¿Tienen servicio en el mostrador?', source: 'Do you have counter service?', category: 'restaurant' },
  // ---- shopping ----
  { id: 'es-tienda', text: '¿Dónde está la tienda?', source: 'Where is the shop?', category: 'shopping' },
  { id: 'es-precio', text: '¿Cuánto cuesta?', source: 'How much is it?', category: 'shopping' },
  { id: 'es-tarjeta', text: '¿Aceptan tarjeta?', source: 'Do you accept cards?', category: 'shopping' },
  { id: 'es-cambio', text: '¿Me da cambio, por favor?', source: 'Can I have change, please?', category: 'shopping' },
  // ---- emergency ----
  { id: 'es-ayuda', text: '¡Ayuda!', source: 'Help!', category: 'emergency' },
  { id: 'es-policia', text: 'Llamen a la policía.', source: 'Call the police.', category: 'emergency' },
  { id: 'es-medico', text: 'Necesito un médico.', source: 'I need a doctor.', category: 'emergency' },
  { id: 'es-farmacia', text: '¿Dónde está la farmacia?', source: 'Where is the pharmacy?', category: 'emergency' },
  // ---- polite / custom ----
  { id: 'es-hola', text: 'Hola.', source: 'Hello.', category: 'custom' },
  { id: 'es-adios', text: 'Adiós.', source: 'Goodbye.', category: 'custom' },
  { id: 'es-gracias', text: 'Gracias.', source: 'Thank you.', category: 'custom' },
  { id: 'es-por-favor', text: 'Por favor.', source: 'Please.', category: 'custom' },
  { id: 'es-lo-siento', text: 'Lo siento.', source: 'I am sorry.', category: 'custom' },
  { id: 'es-si', text: 'Sí.', source: 'Yes.', category: 'custom' },
  { id: 'es-no', text: 'No.', source: 'No.', category: 'custom' },
  { id: 'es-perdon', text: 'Perdón.', source: 'Sorry.', category: 'custom' },
  { id: 'es-mucho-gusto', text: 'Mucho gusto.', source: 'Nice to meet you.', category: 'custom' },
  { id: 'es-turista', text: '¿Me puede ayudar, por favor?', source: 'Can you help me, please?', category: 'custom' },
  { id: 'es-hablas-ingles', text: '¿Habla inglés?', source: 'Do you speak English?', category: 'custom' },
  { id: 'es-mas-despacio', text: '¿Puede hablar más despacio?', source: 'Can you speak more slowly?', category: 'custom' },
  { id: 'es-de-donde', text: '¿De dónde es usted?', source: 'Where are you from?', category: 'custom' },
];
