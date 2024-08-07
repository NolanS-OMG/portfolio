const cancelPopUp = document.getElementById("cancel");
cancelPopUp.addEventListener("click", removePopUp);

const blackBg = document.getElementById("blackBg");
blackBg.addEventListener("click", removePopUp);

const projectsGrid = document.getElementById('projectsGrid');

const projectsOptions = [

  {
    title: "Maqueta Colegio",
    description: 'ON DEV STAGE. Project for Schools where they can have their landing page and administration functions, which includes students grades, reports, announcements, posts and fathers supervision. <br> <br> <a href="https://github.com/NolanS-OMG/colegios">Github Link</a> <br> <br> Technologies aplied: <strong>HTML, CSS, JavaScript, React, Tailwind</strong>',
    url: "https://lobby-portfolios.netlify.app/",
    image: "./assets/images/colegios.PNG",
    sliding: ["./assets/images/oscilations/oscilations.JPG"]
  },

  {
    title: "Portfolios project",
    description: "I make portfolios to different people, so I make a lobby page to show all portfolios I made (with the client consentment of course).",
    url: "https://lobby-portfolios.netlify.app/",
    image: "./assets/images/portadaProvisional.jpg",
    sliding: ["./assets/images/oscilations/oscilations.JPG"]
  },

  {
    title: "App ABCC/CRUD",
    description: "This page is a Full Stack CRUD (in Spanish ABCC) of different products, with dynamic forms and restrictions to it, API calls with Fecth, and a RESTful API made by me too. <br> <br> Technologies aplied: <strong>HTML, CSS, JavaScript, NodeJS, MongoDB</strong>",
    url: "https://aplicacionabcc.netlify.app/",
    image: "./assets/images/abcc.PNG",
    sliding: ["./assets/images/oscilations/oscilations.JPG"]
  },

  {
    title: "TacoNomiks 🌮",
    description: "This page shows all Tacos that has been consumed any day in all different Staes of Mexico (the data is not real, is generated). <br> <br> Technologies aplied: <strong>HTML, CSS, JavaScript, Leaflet</strong>",
    url: "https://taconomiks.netlify.app/",
    image: "./assets/images/taconomiks/taconomiks.PNG",
    sliding: ["./assets/images/oscilations/oscilations.JPG"]
  },

  {
    title: "Oscilations Simulator",
    description: "This page simulates different types of oscilations. <br> <br> Technologies aplied: <strong>HTML, CSS, JavaScript</strong>",
    url: "https://stoic-williams-c77a2f.netlify.app/",
    image: "./assets/images/oscilations/oscilations.JPG",
    sliding: ["./assets/images/oscilations/oscilations.JPG"]
  },

  {
    title: "Trivia",
    description: "It is a classical trivia game which calls a REST API with fetch. <br> <br> Technologies aplied: <strong>HTML, CSS, JavaScript</strong>",
    url: "https://ejercicio-api-trivia-b17j288we-nolans-omg.vercel.app/",
    image: "./assets/images/trivia/trivia.JPG",
    sliding: ["./assets/images/trivia/trivia.JPG"]
  },

  {
    title: "TicTacToe",
    description: "This page is the classical Tic Tac Toe game, has a local 2 players game and a vs Computer game. <br> <br> Technologies aplied: <strong>HTML, CSS, JavaScript</strong>",
    url: "https://keen-gecko-f5bd0e.netlify.app/",
    image: "./assets/images/tictactoe/tictactoe.JPG",
    sliding: ["./assets/images/tictactoe/tictactoe.JPG"]
  },

  {
    title: "Pókedex",
    description: "This page is a searcher of every Pokemon on its Universe, it has a login that works with <strong>React Redux</strong>, the user is saved by <strong>useContext</strong> and it search the pokemons by an <strong>REST API</strong> called by axios. <br> <br> Technologies aplied: <strong>HTML, CSS, JavaScript, React</strong>",
    url: "https://master.d3s75lfgemiapl.amplifyapp.com/#/login",
    image: "./assets/images/pokedex/pokedex.JPG",
    sliding: ["./assets/images/pokedex/pokedex.JPG"]
  },

  {
    title: "CRUD inception",
    description: "This page has some sort of options that lets you create a form, a form which you can create, read, update and delete its fields; and that form makes cards, cards that you can create, read, update and delete; son its a CRUD, that creates a CRUD. <br> <br> Technologies aplied: <strong>HTML, CSS, JavaScript</strong>",
    url: "https://endearing-horse-145e5d.netlify.app/",
    image: "./assets/images/crud/crud.JPG",
    sliding: ["./assets/images/crud/crud.JPG"]
  }

];

for (let i = 0; i < projectsOptions.length; i++) {
  const projectSquare = document.createElement('div');
  projectSquare.className = "project-container";

  const projectTitle = document.createElement('button');
  projectTitle.id = `project${i}`;
  projectTitle.innerText = projectsOptions[i].title;
  projectTitle.addEventListener("click", showPopUp);

  const projectImage = document.createElement("div");
  projectImage.className = "project-image";

  const image = document.createElement('img');
  image.src = projectsOptions[i].image;
  image.alt = projectsOptions[i].title;

  projectImage.appendChild(image);

  projectSquare.appendChild(projectImage);
  projectSquare.appendChild(projectTitle);

  projectsGrid.appendChild(projectSquare);
}

function showPopUp(event) {
  const button = event.target;

  let index = Number(button.id.replace("project", ""));

  const popUp = document.getElementById("popUp");
  popUp.className = "pop-up";

  const infoDiv = document.createElement("div");
  infoDiv.className = "info-pop-up";
  infoDiv.innerHTML = `<h4 class='font-size-large'>${projectsOptions[index].title}</h4>` +
    `<p class='font-size-small'>${projectsOptions[index].description}</p>` +
    `<a class="link" href=${projectsOptions[index].url} target="_blank">Go to Page</a>`

  const imageDiv = document.createElement("div");
  imageDiv.className = "img-pop-up";

  const image = document.createElement('img');
  image.src = projectsOptions[index].image;
  image.alt = projectsOptions[index].title;
  image.className = "position-absolute width-100 height-100 padding-25 object-fit-cover";

  imageDiv.appendChild(image);

  popUp.appendChild(infoDiv);
  popUp.appendChild(imageDiv);

  const popUpContainer = document.getElementById("popUpContainer");
  popUpContainer.classList.remove("display-none");
  popUpContainer.classList.add("display-flex");

}

function removePopUp(event) {
  const popUpContainer = document.getElementById("popUpContainer");
  popUpContainer.classList.remove("display-flex");
  popUpContainer.classList.add("display-none");

  const popUp = document.getElementById("popUp");
  popUp.innerHTML = '<button class="cancel-pop-up" id="cancel">' +
    '<img src="./assets/svg/icons8-cancel.svg" alt="cancel">' +
    '</button>';

  const cancelPopUp = document.getElementById("cancel");
  cancelPopUp.addEventListener("click", removePopUp);

}
