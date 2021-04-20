const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIE_PER_PAGE = 12;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#pagination");
const displayMode = document.querySelector("#dataPanel-display-mode");

let movies = [];
let filteredMovies = []; //Because this variable will be used in more than one function, it should be set in global section.
let nowPage = 1;
let mode = "card";

function renderMoviesByCard(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id
      }">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
              </div>
            
          </div>
        </div>
    </div>`
  });

  dataPanel.innerHTML = rawHTML;
}

function renderMoviesByList(data) {
  let listDisplayHTML = `<ul class="list-group flex-fill">`;
  data.forEach((item) => {
    listDisplayHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
    ${item.title}
       <span>
         <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
         <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
       </span>
      </li>`
  });
  listDisplayHTML += `</ul>`;

  dataPanel.innerHTML = listDisplayHTML;
}

function displayMovies(data) {
  if (mode === "card") {
    renderMoviesByCard(data);
  } else if (mode === "list") {
    renderMoviesByList(data);
  }
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE);

  rawHTML = ``;
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`;
  }

  paginator.innerHTML = rawHTML;
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIE_PER_PAGE;

  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date" + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt = "movie-poster" class = "img-fluid">`;
  });
}

function addFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中!");
  }
  // If the alert showes, programming stops runnung. As a result, movie data will not be added in the array "list".
  list.push(movie);

  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addFavorite(Number(event.target.dataset.id));
  }
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  nowPage = Number(event.target.dataset.page);
  displayMovies(getMoviesByPage(nowPage));
});

displayMode.addEventListener("click", function ondisplayModeClicked(event) {
  if (event.target.matches(".show-card")) {
    mode = "card";
  } else if (event.target.matches(".show-list")) {
    mode = "list";
  }
  displayMovies(getMoviesByPage(nowPage))
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  let keyword = searchInput.value.trim().toLowerCase();

  //let filteredMovies = []
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字 : ${keyword} 沒有符合條件的電影`);
  }
  renderPaginator(filteredMovies.length);
  displayMovies(getMoviesByPage(1));
});

axios.get("https://movie-list.alphacamp.io/api/v1/movies/").then((response) => {
  movies.push(...response.data.results);
  renderPaginator(movies.length);
  displayMovies(getMoviesByPage(1));
})
  .catch((err) => {
    console.log(err);
  });
