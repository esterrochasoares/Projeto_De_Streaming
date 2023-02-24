const root = document.querySelector(":root");
const body = document.querySelector("body");

const header = document.querySelector(".header");
const input = document.querySelector(".input");
const btnTheme = document.querySelector(".btn-theme");

const btnPrev = document.querySelector(".btn-prev");
const container = document.querySelector(".movies");
const btnNext = document.querySelector(".btn-next");

const highLightContainer = document.querySelector(".highlight");
const highlightTitle = document.querySelector(".highlight__title");
const highlightVideo = document.querySelector(".highlight__video");
const highlightVideoLink = document.querySelector(".highlight__video-link");
const highlightRating = document.querySelector(".highlight__rating");
const highlightGenres = document.querySelector(".highlight__genres");
const highlightLaunch = document.querySelector(".highlight__launch");
const highlightDescription = document.querySelector(".highlight__description");

const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".modal__close");
const modalGenres = document.querySelector(".modal__genres");
const modalTitle = document.querySelector(".modal__title");
const modalImg = document.querySelector(".modal__img");
const modalDescription = document.querySelector(".modal__description");
const modalAverage = document.querySelector(".modal__average");

let page = 0;
let query;
movieOfTheDay();
fillMovieCards();

input.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    if (!input.value) {
      query = "";
      fillMovieCards();
    } else {
      page = 0;
      query = input.value;
      fillMovieCards(query);
      input.value = "";
    }
  }
  console.log(query);
});

btnNext.addEventListener("click", () => {
  if (page == 2) {
    page = 0;
    fillMovieCards(query);
  } else {
    page++;
    fillMovieCards(query);
  }
});

btnPrev.addEventListener("click", () => {
  if (page == 0) {
    page = 2;
    fillMovieCards(query);
  } else {
    page--;
    fillMovieCards(query);
  }
});

highlightTitle.addEventListener("click", async () => {
  createModal1();
  modal.classList.remove("hidden");
});

modalClose.addEventListener("click", async () => {
  modal.classList.add("hidden");
});

btnTheme.addEventListener("click", (event) => {
  if (btnTheme.src == "http://127.0.0.1:5500/assets/light-mode.svg") {
    btnTheme.src = "http://127.0.0.1:5500/assets/dark-mode.svg";
    btnNext.src = "http://127.0.0.1:5500/assets/arrow-right-light.svg";
    btnPrev.src = "http://127.0.0.1:5500/assets/arrow-left-light.svg";

    modalClose.src = "http://127.0.0.1:5500/assets/close.svg";
  } else {
    btnTheme.src = "http://127.0.0.1:5500/assets/light-mode.svg";
    btnNext.src = "http://127.0.0.1:5500/assets/arrow-right-dark.svg";
    btnPrev.src = "http://127.0.0.1:5500/assets/arrow-left-dark.svg";
    modalClose.src = "http://127.0.0.1:5500/assets/close-dark.svg";
  }
  body.classList.toggle("dark");
});

async function getMovies(input) {
  try {
    if (!input) {
      return await api.get(
        "/3/discover/movie?language=pt-BR&include_adult=false"
      );
    } else {
      return await api.get(
        `/3/search/movie?language=pt-BR&include_adult=false&query=${input}`
      );
    }
  } catch (error) {
    console.log(error);
  }
}

async function createMovieCard(input) {
  const {
    data: { results },
  } = await getMovies(input);
  const list = [];
  for (const movie of results) {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie");
    movieCard.addEventListener("click", async () => {
      modal.classList.remove("hidden");
      const {
        data: { genres },
      } = await api.get(`/3/movie/${movie.id}?language=pt-BR`);

      modalGenres.innerHTML = "";

      for (let genre of genres) {
        const modalSpan = document.createElement("span");
        modalSpan.classList.add("modal__genre");
        modalSpan.textContent = genre.name;
        modalGenres.appendChild(modalSpan);
      }

      const modalTitle = document.querySelector(".modal__title");
      const modalImg = document.querySelector(".modal__img");
      const modalDescription = document.querySelector(".modal__description");
      const modalAverage = document.querySelector(".modal__average");

      modalTitle.textContent = movie.title;
      modalImg.src = movie.backdrop_path;
      modalDescription.textContent = movie.overview;
      modalAverage.textContent = movie.vote_average;
    });

    const movieInfo = document.createElement("div");
    movieInfo.classList.add("movie__info");
    movieCard.appendChild(movieInfo);
    movieCard.style.backgroundImage = `URL(${movie.poster_path})`;

    const movieTitle = document.createElement("span");
    movieInfo.appendChild(movieTitle);
    movieTitle.classList.add("movie__title");
    movieTitle.textContent = `${movie.title}`;

    const movieRating = document.createElement("span");
    movieInfo.appendChild(movieRating);
    movieRating.classList.add("movie__rating");
    movieRating.textContent = `${movie.vote_average}`;

    const movieStars = document.createElement("img");
    movieRating.appendChild(movieStars);
    movieStars.src = "./assets/estrela.svg";
    movieStars.alt = "Estrela";

    list.push(movieCard);
  }
  return list;
}

async function fillMovieCards(input) {
  const allMovies = await createMovieCard(input);
  const movies = [];

  movies.push(allMovies.slice(0, 6));
  movies.push(allMovies.slice(6, 12));
  movies.push(allMovies.slice(12, 18));

  if (container.children.length > 0) {
    for (let i = 0; i < 6; i++) {
      container.removeChild(container.children[0]);
    }
  }

  for (let movie of movies[page]) {
    container.appendChild(movie);
  }
}

async function movieOfTheDay() {
  const movieGenres = [];
  const {
    data: { results },
  } = await getMovies();
  const {
    data: { results: trailerResults },
  } = await api.get(`3/movie/${results[0].id}/videos?language=pt-BR`);
  const {
    data: { genres },
  } = await api.get(`/3/movie/${results[0].id}?language=pt-BR`);

  for (let genre of genres) {
    movieGenres.push(genre.name);
  }

  highlightVideo.style.backgroundImage = `URL(${results[0].backdrop_path})`;
  highlightVideoLink.href = `https://www.youtube.com/watch?v=${trailerResults[0].key}`;
  highlightTitle.textContent = results[0].title;
  highlightRating.textContent = results[0].vote_average;
  highlightGenres.textContent = movieGenres.join(", ");
  highlightLaunch.textContent = results[0].release_date;
  highlightDescription.textContent = results[0].overview;

  highlightTitle.style.cursor = "pointer";

  return [movieGenres, results];
}

async function createModal1() {
  modalGenres.innerHTML = "";
  const [movieGenres, results] = await movieOfTheDay();
  for (let genre of movieGenres) {
    const modalSpan = document.createElement("span");
    modalSpan.classList.add("modal__genre");
    modalSpan.textContent = genre;
    modalGenres.appendChild(modalSpan);
  }

  modalTitle.textContent = results[0].title;
  modalImg.src = results[0].backdrop_path;
  modalDescription.textContent = results[0].overview;
  modalAverage.textContent = results[0].vote_average;
}
