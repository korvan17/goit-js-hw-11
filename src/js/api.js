import axios from 'axios';
import Notiflix from 'notiflix';

const API_KEY = '34970421-6bdd1eba94b69d9d707497ac2';
const BASE_URL = 'https://pixabay.com/api/';
const PER_PAGE = 40;

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let searchQuery = '';
let page = 1;
let totalHits = 0;

searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  searchQuery = e.target.elements.searchQuery.value.trim();
  page = 1;
  totalHits = 0;
  gallery.innerHTML = '';

  try {
    const { data } = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&per_page=${PER_PAGE}&page=${page}`
    );

    if (data.hits.length === 0) {
      Notiflix.Notify.warning('No images found for your search query');
      return;
    }

    totalHits = data.totalHits;

    gallery.insertAdjacentHTML('beforeend', createGalleryMarkup(data.hits));
    loadMoreBtn.style.display = 'block';

    if (data.hits.length < PER_PAGE) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    Notiflix.Notify.failure('Oops! Something went wrong');
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;

  try {
    const { data } = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&per_page=${PER_PAGE}&page=${page}`
    );

    gallery.insertAdjacentHTML('beforeend', createGalleryMarkup(data.hits));

    if (gallery.querySelectorAll('.photo-card').length === totalHits) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    Notiflix.Notify.failure('Oops! Something went wrong');
  }
});

// const BASE_URL = 'https://pixabay.com/api/';

// const template = `<div class="photo-card">
//   <img src="" alt="" loading="lazy" />
//   <div class="info">
//     <p class="info-item">
//       <b>Likes</b>
//     </p>
//     <p class="info-item">
//       <b>Views</b>
//     </p>
//     <p class="info-item">
//       <b>Comments</b>
//     </p>
//     <p class="info-item">
//       <b>Downloads</b>
//     </p>
//   </div>
// </div>`;

// const API_KEY = '34970421-6bdd1eba94b69d9d707497ac2';
// const URL = BASE_URL + API_KEY + '&q=' + encodeURIComponent('red roses');
// $.getJSON(URL, function (data) {
//   if (parseInt(data.totalHits) > 0)
//     $.each(data.hits, function (i, hit) {
//       console.log(hit.pageURL);
//     });
//   else console.log('No hits');
// });
