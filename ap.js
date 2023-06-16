const questionList = document.getElementById("question-list");
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const searchInput = document.getElementById("search-input");
let idCounter = 1;
let data;
let currentCategory = "exposicionefectiva";

let databaseLoaded = false;
const dropdownMenuItems = document.querySelectorAll(".dropdown-item");

export class MessageService {
  // ... lógica y métodos de la clase MessageService ...

  sendMessage(message, category) {
    const messageID = generateID();
    const messageContainer = createMessageContainer();
    const userQuestionElement = createQuestionElement(messageID, message);
    messageContainer.appendChild(userQuestionElement);
    chatMessages.appendChild(messageContainer);

    const similarQuestion = findSimilarQuestion(message, category);

    if (similarQuestion) {
      const { respuesta, codigo, videos } = similarQuestion;
      const videoURL = videos && videos.length > 0 ? videos : null;

      if (videoURL) {
        const answerElement = createAnswerElement(respuesta, codigo, videoURL);
        messageContainer.appendChild(answerElement);
      } else {
        const answerElement = createAnswerElement(respuesta, codigo);
        messageContainer.appendChild(answerElement);
      }
    } else {
      const noAnswerElement = document.createElement("div");
      noAnswerElement.classList.add("response", "message-answer");
      noAnswerElement.textContent =
        "No encontré una respuesta para tu pregunta. Por favor, intenta con otra.";
      messageContainer.appendChild(noAnswerElement);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

let messageService = new MessageService();

// Función para generar un ID único para cada mensaje
function generateID() {
  return `ID (#${idCounter++})`;
}

// Función para crear el contenedor del mensaje
function createMessageContainer() {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");
  return messageContainer;
}

// Función para crear el elemento de pregunta
function createQuestionElement(messageID, message) {
  const messageContainer = createMessageContainer();
  const questionElement = document.createElement("div");
  questionElement.classList.add("message-question-container");
  questionElement.textContent = `Pregunta: ${message}`;

  const idElement = document.createElement("div");
  idElement.classList.add("message-id");
  idElement.textContent = `${messageID}`;

  messageContainer.appendChild(idElement);
  messageContainer.appendChild(questionElement);

  return messageContainer;
}

function createAnswerElement(response, codigo, videos) {
  const answerElement = document.createElement("div");
  answerElement.classList.add("response", "message-answer");

  const dotsElement = document.createElement("span");
  dotsElement.textContent = "...";
  answerElement.appendChild(dotsElement);

  const interval = setInterval(() => {
    dotsElement.textContent =
      dotsElement.textContent.length < 3 ? dotsElement.textContent + "." : ".";
  }, 500);

  setTimeout(() => {
    clearInterval(interval);
    answerElement.textContent = response;

    if (currentCategory === "Mundo de Código") {
      const codeElement = document.createElement("code");
      codeElement.textContent = codigo;
      codeElement.classList.add("language-javascript");

      const preElement = document.createElement("pre");
      preElement.appendChild(codeElement);

      const codeContainer = document.createElement("div");
      codeContainer.classList.add("code-container");
      codeContainer.appendChild(preElement);

      answerElement.appendChild(codeContainer);

      Prism.highlightElement(codeElement);
    }

    if (currentCategory === "Construye tu Interfaz" && videos) {
      const videoContainer = document.createElement("div");
      videoContainer.classList.add("video-container");

      videos.forEach((videoURL) => {
        const videoItem = document.createElement("div");
        videoItem.classList.add("video-item");

        const videoElement = document.createElement("video");
        videoElement.src = `files/videos/${videoURL}`;
        videoElement.controls = false;
        videoElement.autoplay = true;
        videoElement.muted = true;
        videoElement.loop = true;
        videoItem.appendChild(videoElement);

        // Agregar puntero encima del video
        videoItem.style.position = "relative";

        const getCodeTextElement = document.createElement("div");
        getCodeTextElement.textContent = "Obtener código";
        getCodeTextElement.classList.add("code-text");
        videoItem.appendChild(getCodeTextElement);

        videoItem.addEventListener("mouseenter", () => {
          getCodeTextElement.style.opacity = "1"; // Cambiar la opacidad para mostrar el texto
        });

        videoItem.addEventListener("mouseleave", () => {
          getCodeTextElement.style.opacity = "0"; // Cambiar la opacidad para ocultar el texto
        });

        videoContainer.appendChild(videoItem);
      });

      answerElement.appendChild(videoContainer);
    }
  }, 3000);

  return answerElement;
}

// Función para normalizar una pregunta
function normalizeQuestion(question) {
  return removeAccents(question.toLowerCase().trim());
}

// Función para remover los acentos de una cadena de texto
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Función para calcular la distancia de Levenshtein entre dos cadenas
function calculateLevenshteinDistance(a, b) {
  const distanceMatrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    distanceMatrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    distanceMatrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      distanceMatrix[j][i] = Math.min(
        distanceMatrix[j][i - 1] + 1, // Deletion
        distanceMatrix[j - 1][i] + 1, // Insertion
        distanceMatrix[j - 1][i - 1] + indicator // Substitution
      );
    }
  }

  return distanceMatrix[b.length][a.length];
}

// Función para encontrar una pregunta similar en la base de datos
function findSimilarQuestion(question, category) {
  let currentData;

  switch (category) {
    case "mundodecodigo":
      currentData = dataDesarrollo;
      break;
    case "construyetuinterfaz":
      currentData = dataPresentacion;
      break;
    case "disenobrillante":
      currentData = dataDisenio;
      break;
    case "creacionmagica":
      currentData = dataConstruccion;
      break;
    case "exposicionefectiva":
      currentData = dataEducacion;
      break;
    default:
      currentData = data;
  }

  const tolerance = 3; // Número máximo de cambios permitidos en la pregunta
  const normalizedQuestion = normalizeQuestion(question);

  for (let i = 0; i < currentData.preguntas.length; i++) {
    const currentQuestion = currentData.preguntas[i];
    const currentNormalizedQuestion = normalizeQuestion(currentQuestion.texto);
    const distance = calculateLevenshteinDistance(
      normalizedQuestion,
      currentNormalizedQuestion
    );

    if (distance <= tolerance) {
      return currentQuestion;
    }
  }

  return null;
}

// Función para mostrar las preguntas en el panel
function showQuestions(questions) {
  questionList.innerHTML = "";

  questions.forEach((question) => {
    const questionLink = document.createElement("a");
    questionLink.classList.add("panel-block");
    questionLink.innerText = question.texto;
    questionLink.addEventListener("click", () => {
      userInput.value = question.texto;
      messageService.sendMessage(question.texto, question.categoria);
    });
    questionList.appendChild(questionLink);
  });
}

// Función para filtrar las preguntas según un término de búsqueda
function filterQuestions(searchTerm) {
  const normalizedSearchTerm = normalizeString(searchTerm);
  const filteredQuestions = data.preguntas.filter((question) => {
    const normalizedQuestion = normalizeString(question.texto);
    return normalizedQuestion.includes(normalizedSearchTerm);
  });
  showQuestions(filteredQuestions);
}

// Función para normalizar una cadena de texto
function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Evento para filtrar las preguntas al ingresar texto en el campo de búsqueda
searchInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value.toLowerCase();
  filterQuestions(searchTerm);
});

// Evento para cambiar la categoría de la base de datos al hacer clic en un elemento del menú desplegable
dropdownMenuItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    if (event.target.classList.contains("dropdown-item")) {
      const spanName = event.target.innerText;
      currentCategory = spanName;
      loadJSONData(spanName);
      questionList.innerHTML = "";
      console.log(currentCategory);
    }
  });
});

function removeAccentsFromFileName(fileName) {
  const accentsMap = {
    á: "a",
    é: "e",
    í: "i",
    ó: "o",
    ú: "u",
    ñ: "n",
    Á: "A",
    É: "E",
    Í: "I",
    Ó: "O",
    Ú: "U",
    Ñ: "N",
  };

  return fileName.replace(/[áéíóúñÁÉÍÓÚÑ]/g, (match) => accentsMap[match]);
}

function loadJSONData(category) {
  const normalizedCategory = normalizeString(category);
  const normalizedFileName = removeAccentsFromFileName(normalizedCategory);
  const fileName = `databases/${normalizedFileName.replace(/\s/g, "")}.json`;

  loadJSON(function (response) {
    try {
      data = response;
      console.log(
        `Datos cargados correctamente desde el archivo JSON (${fileName}).`
      );
      showQuestions(data.preguntas.map((question) => question.texto));

      databaseLoaded = true;
    } catch (error) {
      console.error(
        `Error al cargar los datos del archivo JSON (${fileName}):`,
        error
      );
      databaseLoaded = false;
    }
  }, fileName);

  console.log(`Cargando base de datos para la categoría ${category}...`);
}

function loadJSON(callback, file) {
  const xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open("GET", file, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          callback(JSON.parse(xhr.responseText));
        } catch (error) {
          console.error(`Error al analizar el archivo JSON (${file}):`, error);
        }
      } else {
        console.error(`Error al cargar el archivo JSON (${file}):`, xhr.status);
      }
    }
  };
  xhr.send(null);
}

loadJSONData(currentCategory);
Prism.highlightAll();
