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

// ==============================================================
// ОТРИСОВКА ЛИНИЙ ДЛЯ 3-ГО СЛАЙДА (MINDMAP)
// ==============================================================
function drawMindmapLines() {
  const svg = document.getElementById('mindmapLines');
  const container = document.getElementById('nodesContainer');
  
  if (!svg || !container) return;

  const edges = [
    ['node-creative', 'node-forums'],
    ['node-creative', 'node-arch'],
    ['node-forums', 'node-concepts'],
    ['node-arch', 'node-concepts'],
    ['node-concepts', 'node-pub'],
    ['node-pub', 'node-contacts']
  ];

  svg.innerHTML = '';
  const containerRect = container.getBoundingClientRect();

  // 1. Отрисовка соединительных линий
  edges.forEach(edge => {
    const el1 = document.getElementById(edge[0]);
    const el2 = document.getElementById(edge[1]);
    if (!el1 || !el2) return;

    const wrap1 = el1.querySelector('.mm-img-wrap');
    const wrap2 = el2.querySelector('.mm-img-wrap');
    
    const rect1 = wrap1.getBoundingClientRect();
    const rect2 = wrap2.getBoundingClientRect();

    const x1 = (rect1.left + rect1.width / 2) - containerRect.left;
    const y1 = (rect1.top + rect1.height / 2) - containerRect.top;
    
    const x2 = (rect2.left + rect2.width / 2) - containerRect.left;
    const y2 = (rect2.top + rect2.height / 2) - containerRect.top;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', 'rgba(255, 255, 255, 0.7)');
    line.setAttribute('stroke-width', '1');
    
    svg.appendChild(line);
  });

  // 2. Отрисовка белых точек поверх фотографий
  // Собираем все уникальные узлы, чтобы не рисовать точку дважды
  const uniqueNodes = new Set(edges.flat());
  
  uniqueNodes.forEach(nodeId => {
    const el = document.getElementById(nodeId);
    if (!el) return;
    
    const wrap = el.querySelector('.mm-img-wrap');
    const rect = wrap.getBoundingClientRect();
    
    const cx = (rect.left + rect.width / 2) - containerRect.left;
    const cy = (rect.top + rect.height / 2) - containerRect.top;

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', cy);
    dot.setAttribute('r', '2.5'); // Размер точки
    dot.setAttribute('fill', '#ffffff'); // Цвет точки
    
    svg.appendChild(dot);
  });
}

// Запускаем расчет при загрузке картинок и при любом ресайзе окна
window.addEventListener('load', drawMindmapLines);
window.addEventListener('resize', drawMindmapLines);
// На всякий случай запускаем сразу после готовности DOM
document.addEventListener('DOMContentLoaded', drawMindmapLines);

 /* -------------------------------------------------------------
   * 3. CAROUSEL & LIGHTBOX
   * ------------------------------------------------------------- */
function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const container = document.querySelector('.carousel-track-container');
  
  if (!track || !container) return;

  // 1. Генерируем 20 слайдов (PNG вместо JPG)
  for (let i = 1; i <= 20; i++) {
    const numStr = i < 10 ? `0${i}` : `${i}`;
    const slideDiv = document.createElement('div');
    slideDiv.className = 'carousel-slide'; 
    
    const img = document.createElement('img');
    // Исправлено расширение на .png как в файловой системе
    img.src = `/carousel/carousel-${numStr}.png`; 
    img.alt = `Project ${numStr}`;
    
    img.onerror = () => {
      img.src = `/projects/p1.jfif`; // Заглушка
    };

    slideDiv.appendChild(img);
    track.appendChild(slideDiv);
  }

  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  let currentIndex = Math.floor(slides.length / 2); // Старт с середины

  // 2. Логика позиционирования
  function updateCarousel() {
    // Раздаем классы
    slides.forEach((slide, index) => {
      if (index === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // 3. Считаем отступы для центрирования
    const activeSlide = slides[currentIndex];
    const containerWidth = container.clientWidth;
    
    // Получаем координаты центра активного слайда относительно начала трека
    const slideCenter = activeSlide.offsetLeft + (activeSlide.offsetWidth / 2);
    // Считаем на сколько пикселей нужно сдвинуть трек
    const targetX = (containerWidth / 2) - slideCenter;
    
    track.style.transform = `translateX(${targetX}px)`;
  }

  // 4. Слушатели кликов
  nextBtn.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) {
      currentIndex++;
      updateCarousel();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  slides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
      currentIndex = index;
      updateCarousel();
    });
  });

  // Пересчет при изменении размера окна
  window.addEventListener('resize', updateCarousel);
  
  // Даем браузеру время отрендерить картинки, чтобы правильно посчитать их ширину
  setTimeout(updateCarousel, 150);
}
initCarousel();
});