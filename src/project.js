document.addEventListener('DOMContentLoaded', () => {
  function initCarousel(trackId, prevBtnId, nextBtnId, isSingle = false) {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);

    if (!track || !prevBtn || !nextBtn) return;

    let currentIndex = 0;

    function getVisibleSlides() {
      if (isSingle) return 1;
      return window.innerWidth <= 670 ? 2 : 3;
    }

    function updateCarousel() {
      const slides = track.children;
      if (slides.length === 0) return;
      
      const slideStyle = window.getComputedStyle(track);
      const gap = parseFloat(slideStyle.gap) || 12;
      const slideWidth = slides[0].getBoundingClientRect().width + gap;
      
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }

    nextBtn.addEventListener('click', () => {
      const slides = track.children;
      const visible = getVisibleSlides();
      const maxIndex = Math.max(0, slides.length - visible);
      
      if (currentIndex < maxIndex) {
        currentIndex++;
      } else {
        currentIndex = 0; // Зацикливание
      }
      updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
      const slides = track.children;
      const visible = getVisibleSlides();
      const maxIndex = Math.max(0, slides.length - visible);
      
      if (currentIndex > 0) {
        currentIndex--;
      } else {
        currentIndex = maxIndex;
      }
      updateCarousel();
    });

    window.addEventListener('resize', updateCarousel);
  }

  // Инициализация первой карусели (3 карточки)
  initCarousel('pCarouselTrack', 'pPrevBtn', 'pNextBtn');
  
  // Инициализация второй карусели (одиночная)
  initCarousel('pCarouselTrack2', 'pPrevBtn2', 'pNextBtn2', true);

  // Инициализация третьей карусели (3 карточки)
  initCarousel('pCarouselTrack3', 'pPrevBtn3', 'pNextBtn3');
});