import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '34970421-6bdd1eba94b69d9d707497ac2';
const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const lightbox = new SimpleLightbox('.gallery a');

let searchQuery = '';
let page = 1;
let totalHits = 0;

async function fetchImages() {
  try {
    const { data } = await axios.get(
      `https://pixabay.com/api/?key=${API_KEY}&q=${searchQuery}&page=${page}&per_page=12`
    );
    return data;
  } catch (error) {
    console.log(error);
  }
}

function clearGallery() {
  gallery.innerHTML = '';
}

function createImageCardMarkup({
  webformatURL,
  likes,
  views,
  comments,
  downloads,
  largeImageURL,
}) {
  return (
    <div class="photo-card">
      {' '}
      <a href="${largeImageURL}">
        {' '}
        <img src="${webformatURL}" alt="" loading="lazy" />{' '}
      </a>{' '}
      <div class="info">
        {' '}
        <p class="info-item">
          {' '}
          <b>Likes:</b> ${likes}{' '}
        </p>{' '}
        <p class="info-item">
          {' '}
          <b>Views:</b> ${views}{' '}
        </p>{' '}
        <p class="info-item">
          {' '}
          <b>Comments:</b> ${comments}{' '}
        </p>{' '}
        <p class="info-item">
          {' '}
          <b>Downloads:</b> ${downloads}{' '}
        </p>{' '}
      </div>{' '}
    </div>
  );
}

function renderImageCards(images) {
  const imageCardsMarkup = images.reduce((markup, image) => {
    markup += createImageCardMarkup(image);
    return markup;
  }, '');
  gallery.insertAdjacentHTML('beforeend', imageCardsMarkup);
  lightbox.refresh();
}

async function handleSearchFormSubmit(event) {
  event.preventDefault();
  searchQuery = event.currentTarget.elements.searchQuery.value.trim();
  if (!searchQuery) {
    return;
  }
  page = 1;
  clearGallery();
  try {
    const { hits, totalHits: total } = await fetchImages();
    totalHits = total;
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    if (hits.length === 0) {
      Notiflix.Notify.warning(
        "Sorry, we didn't find any images matching your search."
      );
      return;
    }
    renderImageCards(hits);
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure(
      'Oops! Something went wrong. Please try again later.'
    );
  }
}

async function handleWindowScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (
    scrollTop + clientHeight >= scrollHeight - 5 &&
    gallery.children.length < totalHits
  ) {
    page += 1;
    try {
      const { hits } = await fetchImages();
      if (hits.length === 0) {
        Notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
      renderImageCards(hits);
      setTimeout(() => {
        window.scrollBy({
          top: clientHeight - 50,
          behavior: 'smooth',
        });
      }, 500);
    } catch (error) {
      console.log(error);
      Notiflix.Notify.failure(
        'Oops! Something went wrong. Please try again later.'
      );
    }
  }
}
