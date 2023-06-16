const consoleText = document.querySelector('.console-text');
const messages = [
  // Nivel 1
  [
    '¡Hola! Soy una IA amigable.',
    'Estoy aquí para alegrarte el día.',
    'Recuerda que eres increíble.',
    'Siempre hay una razón para sonreír.',
    'Tú puedes lograrlo, ¡confía en ti!'
  ],
  // Nivel 2
  [
    'Hoy es un buen día para aprender algo nuevo.',
    'No importa cuántas veces caigas, levántate una vez más.',
    'Aprender de los errores es la clave del éxito.',
    'El esfuerzo constante te llevará lejos.',
    'Tu determinación no tiene límites.'
  ],
  // Nivel 3
  [
    'El éxito no es el final, el fracaso no es fatal: lo que cuenta es el coraje para seguir adelante.',
    'La única forma de hacer un gran trabajo es amar lo que haces.',
    'La creatividad es la inteligencia divirtiéndose.',
    'El verdadero valor está en ser diferente y atreverse a destacar.',
    'No sueñes tu vida, vive tu sueño.'
  ]
];

let messageCount = 0;
let charIndex = 0;

function displayMessage() {
  if (messageCount >= 40) {
    // Se han mostrado los 40 mensajes
    return;
  }

  const levelIndex = Math.floor(messageCount / 10);
  const levelMessages = messages[levelIndex];

  if (!levelMessages || !levelMessages.length) {
    // Verificar si hay mensajes en el nivel actual
    messageCount = 40; // Detener el bucle si no hay más mensajes
    return;
  }

  const messageIndex = messageCount % levelMessages.length;
  const message = levelMessages[messageIndex];

  if (charIndex < message.length) {
    consoleText.textContent += message[charIndex];
    charIndex++;
    setTimeout(displayMessage, 100); // Intervalo de 0.1 segundos (100 milisegundos)
  } else {
    setTimeout(() => {
      consoleText.textContent = '';
      charIndex = 0;
      messageCount++;
      displayMessage();
    }, 1000); // Esperar 1 segundo antes de iniciar el siguiente mensaje
  }
}

setTimeout(displayMessage, 1000); // Esperar 1 segundo antes de iniciar la visualización de mensajes
