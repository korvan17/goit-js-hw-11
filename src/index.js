import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const API_KEY = '34970421-6bdd1eba94b69d9d707497ac2';
const perPage = 40;

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

let currentPage = 1;
let searchQuery = '';
let isFetching = false;

const lightbox = new SimpleLightbox('.gallery a');

searchForm.addEventListener('submit', onSubmit);

async function onSubmit(event) {
  event.preventDefault();
  currentPage = 1;
  searchQuery = event.target.elements.searchQuery.value.trim();
  if (!searchQuery) {
    return;
  }

  clearGallery();

  try {
    const response = await fetchImages(searchQuery, currentPage);
    renderImages(response.data.hits);
    if (response.data.totalHits === 0) {
      Notiflix.Notify.info("Sorry, we didn't find any images for your search.");
    } else {
      Notiflix.Notify.success(
        `Hooray! We found ${response.data.totalHits} images.`
      );
    }
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure(
      'Oops, something went wrong. Please try again later.'
    );
  }
}

async function fetchImages(query, page) {
  isFetching = true;
  const response = await axios.get(
    `https://pixabay.com/api/?key=${API_KEY}&q=${query}&image_type=photo&page=${page}&per_page=${perPage}`
  );
  isFetching = false;
  return response;
}

function renderImages(images) {
  const galleryHTML = images
    .map(image => {
      return `
            <div class="photo-card">
              <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
              <div class="info">
                <p class="info-item">
                  <b>Likes:</b> ${image.likes}
                </p>
                <p class="info-item">
                  <b>Views:</b> ${image.views}
                </p>
                <p class="info-item">
                  <b>Comments:</b> ${image.comments}
                </p>
                <p class="info-item">
                  <b>Downloads:</b> ${image.downloads}
                </p>
              </div>
            </div>
          `;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', galleryHTML);
  lightbox.refresh();
}

function clearGallery() {
  gallery.innerHTML = '';
}

function fetchNextPage() {
  if (isFetching) {
    return;
  }
  currentPage += 1;
  fetchImages(searchQuery, currentPage)
    .then(response => {
      if (response.data.hits.length === 0) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
      renderImages(response.data.hits);
    })
    .catch(error => {
      console.log(error);
      Notiflix.Notify.failure(
        'Oops, something went wrong. Please try again later.'
      );
    });
}

window.addEventListener('scroll', () => {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    fetchNextPage();
  }
});
