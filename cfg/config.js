function selectOption(option) {
  var dropdown = document.getElementById("dropdown");
  if (!dropdown) {
    return; // El elemento con el ID "dropdown" no se encuentra
  }

  var button = dropdown.querySelector("#droppear");
  if (!button) {
    return; // No se encontró el botón dentro del dropdown
  }

  var selectedOption = dropdown.querySelector(".dropdown-item.is-active");
  if (selectedOption) {
    selectedOption.classList.remove("is-active");
  }

  if (option.classList.contains("dropdown-divider")) {
    return; // La opción es un separador, no se debe agregar la clase "is-active"
  }

  option.classList.add("is-active");
  button.getElementsByTagName("span")[0].innerText = option.innerText;

  dropdown.classList.remove("is-active");

  const selectedOptionText = option.innerText.toLowerCase(); // Convertir a minúsculas

  const normalizedCategory = normalizeText(selectedOptionText);
  const jsonFile = `databases/${normalizedCategory}.json`.replace(/\s/g, ""); // Eliminar espacios en la ruta
  loadQuestions(jsonFile);
}

// Función para normalizar el texto removiendo las tildes y la "ñ"
function normalizeText(text) {
  const accents = "ÁÉÍÓÚáéíóúÑñ";
  const normalized = "AEIOUaeiouNn";
  return text.replace(
    new RegExp(`[${accents}]`, "g"),
    (match) => normalized[accents.indexOf(match)]
  );
}

// Obtener la referencia al elemento del panel donde se mostrarán las preguntas
const questionList = document.getElementById("question-list");

const userInput = document.getElementById("user-input");

// Función para cargar las preguntas desde un archivo JSON
function loadQuestions(jsonFile) {
  const decodedJsonFile = decodeURI(jsonFile);

  fetch(decodedJsonFile)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error al cargar el archivo JSON");
      }
    })
    .then((data) => {
      const questions = data.preguntas;
      showQuestions(questions);
    })
    .catch((error) => console.error("Error al cargar las preguntas:", error));
}

import { MessageService } from "../ap.js";
const messageService = new MessageService();

function showQuestions(questions) {
  // Limpiar el panel de preguntas
  questionList.innerHTML = "";

  // Iterar sobre cada pregunta y crear un elemento de enlace para mostrarla
  questions.forEach((question) => {
    const questionLink = document.createElement("a");
    questionLink.classList.add("panel-block");
    questionLink.innerText = question.texto;
    questionLink.addEventListener("click", () => {
      userInput.value = question.texto;
      messageService.sendMessage(question.texto, question.categoria);
      userInput.value = "";
    });
    questionList.appendChild(questionLink);
  });
}

function toggleDropdown() {
  var dropdown = document.getElementById("dropdown");
  dropdown.classList.toggle("is-active");
}

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const body = document.body;

  menuToggle.addEventListener("click", () => {
    body.classList.toggle("menu-open");
    menuToggle.disabled = true; // Deshabilitar el botón después del primer clic
    setTimeout(() => {
      menuToggle.disabled = false; // Habilitar el botón después de un retraso
    }, 300); // Ajusta el tiempo de retraso según tus necesidades
  });

  const dropdownButton = document.getElementById("droppear");
  dropdownButton.addEventListener("click", toggleDropdown);

  document.addEventListener("click", (event) => {
    const menu = document.querySelector(".menu-options");
    const target = event.target;

    // Verificar si el clic se realizó fuera del menú
    if (!menu.contains(target) && !menuToggle.contains(target)) {
      body.classList.remove("menu-open");
    }
  });

  function loadOptionsAndQuestions() {
    const dropdownContent = document.getElementById("dropdown-content");

    fetch("cfg/configs.json")
      .then((response) => response.json())
      .then((data) => {
        const options = data.opciones;

        options.forEach((option, index) => {
          const dropdownItem = dropdownContent.children[index];
          dropdownItem.textContent = option;
          dropdownItem.addEventListener("click", function (event) {
            selectOption(this);
          });
        });
      })
      .catch((error) => console.error("Error al cargar las opciones:", error));
  }

  // Llamada a la función para cargar las opciones y preguntas
  loadOptionsAndQuestions();
  const jsonFile = "databases/exposicionefectiva.json"; // Cambia el valor del archivo JSON según tus necesidades
  loadQuestions(jsonFile);
});
