import './css/styles.css';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import ImagesApiService from './ApiService';


const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};


refs.form.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoad);

const imagesApiService = new ImagesApiService();
let gallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});
let countImages = 0;
function onSearch(e) {
  e.preventDefault();
  clearGallery();
  refs.loadMoreBtn.classList.add('is-hidden');

  imagesApiService.query = e.currentTarget.elements.searchQuery.value.trim();
  countImages = 0;

  imagesApiService.resetPage();

  if (!imagesApiService.query) {
    Notify.info('Enter data to search!');
    return;
  }
  fetchGallery();
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function onLoad(e) {
  fetchGallery();
}
async function fetchGallery() {
  try {
    const data = await imagesApiService.fetchGallery();
    refs.loadMoreBtn.classList.remove('is-hidden');
    imagesApiService.incrementPage();
    countImages += data.hits.length;
    if (!data.hits.length) {
      refs.loadMoreBtn.classList.add('is-hidden');
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    renderGalery(data.hits);
    gallery.refresh();
    if (
      imagesApiService.page ===
      Math.ceil(data.totalHits / imagesApiService.per_page)
    ) {
      Notify.info(
        `We are sorry, but you have reached the end of search results.`
      );
      refs.loadMoreBtn.classList.add('is-hidden');
    }

    if (countImages === data.hits.length) {
      Notify.success(`"Hooray! We found ${data.totalHits} images."`);
    }
    if (countImages > data.hits.length) {
      smoothScroll();
    }
  } catch (error) {
    console.log('Error');
  }
}
function smoothScroll() {
  const { height: cardHeight } =
    refe.gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function createMarkupGallery(arrImages) {
  return arrImages
    .map(
      ({
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        largeImageURL,
      }) => `<div class="photo-card"><a class="photo-card__item" href="${largeImageURL}">
  <img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes <span>${likes}</span></b>
    </p>
    <p class="info-item">
      <b>Views <span>${views}</span></b>
    </p>
    <p class="info-item">
      <b>Comments <span>${comments}</span></b>
    </p>
    <p class="info-item">
      <b>Downloads <span>${downloads}</span></b>
    </p>
  </div> 
</div>`
    )
    .join('');
}

export default function renderGalery(arrImages) {
  refs.gallery.insertAdjacentHTML(
    'beforeend',
    createMarkupGallery(arrImages)
  );
}



