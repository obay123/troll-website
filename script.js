const ctaBtn = document.getElementById('ctaBtn');
const closeBtn = document.getElementById('closeBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const videoModal = document.getElementById('videoModal');
const carouselTrack = document.getElementById('carouselTrack');
const carouselDots = document.getElementById('carouselDots');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselViewport = document.querySelector('.carousel-viewport');

const videos = Array.from(document.querySelectorAll('.meme-video'));
const totalSlides = videos.length;
let currentSlide = 0;
let touchStartX = 0;
let touchCurrentX = 0;
let isDragging = false;

function pauseAllVideos() {
  videos.forEach((video) => {
    const wrap = video.closest('.video-wrap');
    video.pause();
    video.currentTime = 0;
    wrap?.classList.remove('playing');
  });
}

function playCurrentVideo() {
  const video = videos[currentSlide];
  if (!video) return;
  video.play().catch(() => {});
}

function updateCarousel(animate = true) {
  carouselTrack.style.transition = animate ? 'transform 0.35s ease' : 'none';
  carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

  carouselDots.querySelectorAll('.carousel-dot').forEach((dot, index) => {
    const isActive = index === currentSlide;
    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-selected', String(isActive));
  });

  carouselPrev.disabled = currentSlide === 0;
  carouselNext.disabled = currentSlide === totalSlides - 1;
}

function goToSlide(index) {
  if (index < 0 || index >= totalSlides || index === currentSlide) return;
  pauseAllVideos();
  currentSlide = index;
  updateCarousel();
  playCurrentVideo();
}

function openModal() {
  videoModal.classList.remove('hidden');
  videoModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  currentSlide = 0;
  updateCarousel(false);
  playCurrentVideo();
}

function closeModal() {
  videoModal.classList.add('hidden');
  videoModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  pauseAllVideos();
  currentSlide = 0;
  updateCarousel(false);
}

function handleTouchStart(event) {
  if (event.touches.length !== 1) return;
  isDragging = true;
  touchStartX = event.touches[0].clientX;
  touchCurrentX = touchStartX;
  carouselTrack.style.transition = 'none';
}

function handleTouchMove(event) {
  if (!isDragging) return;
  touchCurrentX = event.touches[0].clientX;
  const deltaX = touchCurrentX - touchStartX;
  const offset = -currentSlide * 100 + (deltaX / carouselViewport.offsetWidth) * 100;
  carouselTrack.style.transform = `translateX(${offset}%)`;
}

function handleTouchEnd() {
  if (!isDragging) return;
  isDragging = false;

  const deltaX = touchCurrentX - touchStartX;
  const threshold = carouselViewport.offsetWidth * 0.18;

  if (deltaX < -threshold && currentSlide < totalSlides - 1) {
    goToSlide(currentSlide + 1);
  } else if (deltaX > threshold && currentSlide > 0) {
    goToSlide(currentSlide - 1);
  } else {
    updateCarousel();
  }
}

ctaBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

carouselPrev.addEventListener('click', () => goToSlide(currentSlide - 1));
carouselNext.addEventListener('click', () => goToSlide(currentSlide + 1));

carouselDots.addEventListener('click', (event) => {
  const dot = event.target.closest('.carousel-dot');
  if (!dot) return;
  goToSlide(Number(dot.dataset.slide));
});

carouselViewport.addEventListener('touchstart', handleTouchStart, { passive: true });
carouselViewport.addEventListener('touchmove', handleTouchMove, { passive: true });
carouselViewport.addEventListener('touchend', handleTouchEnd);
carouselViewport.addEventListener('touchcancel', handleTouchEnd);

document.addEventListener('keydown', (event) => {
  if (videoModal.classList.contains('hidden')) return;

  if (event.key === 'Escape') {
    closeModal();
  } else if (event.key === 'ArrowLeft') {
    goToSlide(currentSlide - 1);
  } else if (event.key === 'ArrowRight') {
    goToSlide(currentSlide + 1);
  }
});

videos.forEach((video) => {
  const wrap = video.closest('.video-wrap');

  video.addEventListener('play', () => {
    videos.forEach((other) => {
      if (other !== video) {
        other.pause();
        other.closest('.video-wrap')?.classList.remove('playing');
      }
    });
    wrap?.classList.add('playing');
  });

  video.addEventListener('pause', () => {
    wrap?.classList.remove('playing');
  });

  video.addEventListener('ended', () => {
    wrap?.classList.remove('playing');
  });
});

updateCarousel(false);
