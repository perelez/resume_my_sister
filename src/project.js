document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('pCarouselTrack');
  const prevBtn = document.getElementById('pPrevBtn');
  const nextBtn = document.getElementById('pNextBtn');

  if (!track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;

  function getVisibleSlides() {
    return window.innerWidth <= 670 ? 2 : 3;
  }

  function updateCarousel() {
    const slides = track.children;
    if (slides.length === 0) return;
    
    const slideWidth = slides[0].getBoundingClientRect().width + 12; // 12px gap
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  }

  nextBtn.addEventListener('click', () => {
    const slides = track.children;
    const maxIndex = slides.length - getVisibleSlides();
    if (currentIndex < maxIndex) {
      currentIndex++;
    } else {
      currentIndex = 0; // Зацикливание
    }
    updateCarousel();
  });

  prevBtn.addEventListener('click', () => {
    const slides = track.children;
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = slides.length - getVisibleSlides();
    }
    updateCarousel();
  });

  window.addEventListener('resize', updateCarousel);
});