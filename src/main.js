document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------------------
   * 1. NAVIGATION & HAMBURGER MENU
   * ------------------------------------------------------------- */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const siteMenu = document.getElementById('siteMenu');
  const menuList = document.getElementById('menuList');
  const menuArrow = document.getElementById('menuArrow');

  function hideArrow() {
    if (menuArrow) menuArrow.style.opacity = '0';
  }

  function moveArrow(e) {
    const link = e.currentTarget;
    if (!menuArrow || !link) return;
    menuArrow.style.top = `${link.offsetTop}px`;
    menuArrow.style.left = `${link.offsetLeft + link.offsetWidth + 10}px`;
    menuArrow.style.opacity = '1';
  }

  function toggleMenu() {
    const isOpen = siteMenu.classList.toggle('open');
    hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (!isOpen) hideArrow();
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMenu);
  }

  if (menuList) {
    menuList.addEventListener('mouseleave', hideArrow);
    
    const menuLinks = menuList.querySelectorAll('a');
    menuLinks.forEach((link) => {
      link.addEventListener('mouseenter', moveArrow);
      link.addEventListener('focus', moveArrow);
      link.addEventListener('click', () => {
        siteMenu.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hideArrow();
      });
    });
  }

/* -------------------------------------------------------------
   * 2. DIAGRAM SVG CONNECTING LINES
   * ------------------------------------------------------------- */
  const wrap = document.getElementById('diagramWrap');
  const svg = document.getElementById('linesSvg');

  function drawLines() {
    if (!wrap || !svg) return;
    const wrapRect = wrap.getBoundingClientRect();
    if (wrapRect.width < 1 || wrapRect.height < 1) return;

    const W = wrapRect.width;
    const H = wrapRect.height;
    const chestX = W / 2;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const favItems = wrap.querySelectorAll('.fav-item');
    favItems.forEach((item) => {
      const img = item.querySelector('img');
      if (!img) return;

      const r = img.getBoundingClientRect();
      const side = item.dataset.side === '-1' ? -1 : 1;
      const numEl = item.querySelector('.num');
      const num = numEl ? numEl.textContent.trim() : '';

      // Точка привязки к внутреннему краю фотографии
      const edgeX = (side < 0 ? r.right : r.left) - wrapRect.left;
      const edgeY = (r.top + r.height / 2) - wrapRect.top;

      let points = [];

      switch (num) {
        case '001':
          // Диагональ вниз-вправо, затем горизонтальный вход в шею
          points = [
            [edgeX, edgeY],
            [chestX - W * 0.11, edgeY + H * 0.09],
            [chestX - W * 0.03, edgeY + H * 0.09]
          ];
          break;

        case '002':
          // Строгая горизонталь от фото прямо в верхнюю часть груди
          points = [
            [edgeX, edgeY],
            [chestX - W * 0.03, edgeY]
          ];
          break;

        case '003':
          // Диагональ вверх-вправо, затем горизонтальный вход в талию
          points = [
            [edgeX, edgeY],
            [chestX - W * 0.10, edgeY - H * 0.04],
            [chestX - W * 0.03, edgeY - H * 0.04]
          ];
          break;

        case '004':
          // Прямая диагональ вверх-вправо в область бедер
          points = [
            [edgeX, edgeY],
            [chestX - W * 0.02, H * 0.63]
          ];
          break;

        case '005':
          // Прямая диагональ вниз-влево в область плеча
          points = [
            [edgeX, edgeY],
            [chestX + W * 0.03, H * 0.28]
          ];
          break;

        case '006':
          // Горизонталь под 005 -> ступенчатый спуск вниз -> горизонталь в грудь
          points = [
            [edgeX, edgeY],
            [chestX + W * 0.12, edgeY],
            [chestX + W * 0.12, H * 0.36],
            [chestX + W * 0.04, H * 0.36]
          ];
          break;

        case '007':
          // Горизонталь влево -> спуск ступеней -> горизонталь в талию
          points = [
            [edgeX, edgeY],
            [chestX + W * 0.10, edgeY],
            [chestX + W * 0.10, edgeY + H * 0.08],
            [chestX + W * 0.03, edgeY + H * 0.08]
          ];
          break;

        case '008':
          // Прямая диагональ вверх-влево в основание модели
          points = [
            [edgeX, edgeY],
            [chestX + W * 0.02, H * 0.70]
          ];
          break;

        default:
          points = [
            [edgeX, edgeY],
            [chestX, edgeY]
          ];
          break;
      }

      const polyPoints = points.map((p) => `${p[0]},${p[1]}`).join(' ');
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      poly.setAttribute('points', polyPoints);
      svg.appendChild(poly);
    });
  }

  let resizeTimer;
  function scheduleDraw() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawLines, 80);
  }

  window.addEventListener('load', drawLines);
  window.addEventListener('resize', scheduleDraw);

  if (wrap) {
    wrap.querySelectorAll('.fav-item img').forEach((img) => {
      if (img.complete) {
        drawLines();
      } else {
        img.addEventListener('load', scheduleDraw);
      }
    });
  }

  setTimeout(drawLines, 50);
  setTimeout(drawLines, 400);

  /* -------------------------------------------------------------
   * 3. CAROUSEL & LIGHTBOX
   * ------------------------------------------------------------- */
  const carousel = document.getElementById('carousel');
  const carPrev = document.getElementById('carPrev');
  const carNext = document.getElementById('carNext');
  const carImgs = Array.from(document.querySelectorAll('#carousel .car-img'));

  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const lbClose = document.getElementById('lbClose');
  let lbIndex = 0;

  if (carPrev && carousel) {
    carPrev.addEventListener('click', () => carousel.scrollBy({ left: -340, behavior: 'smooth' }));
  }
  if (carNext && carousel) {
    carNext.addEventListener('click', () => carousel.scrollBy({ left: 340, behavior: 'smooth' }));
  }

  function showLightboxImage(i) {
    if (!carImgs.length) return;
    lbIndex = (i + carImgs.length) % carImgs.length;
    lbImg.src = carImgs[lbIndex].src;
    lbImg.alt = carImgs[lbIndex].alt;
  }

  function openLightbox(i) {
    showLightboxImage(i);
    if (lightbox) lightbox.classList.add('open');
  }

  function closeLightbox() {
    if (lightbox) lightbox.classList.remove('open');
  }

  carImgs.forEach((img, index) => {
    img.addEventListener('click', () => openLightbox(index));
  });

  if (lbPrev) lbPrev.addEventListener('click', () => showLightboxImage(lbIndex - 1));
  if (lbNext) lbNext.addEventListener('click', () => showLightboxImage(lbIndex + 1));
  if (lbClose) lbClose.addEventListener('click', closeLightbox);

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightboxImage(lbIndex - 1);
    if (e.key === 'ArrowRight') showLightboxImage(lbIndex + 1);
  });
});