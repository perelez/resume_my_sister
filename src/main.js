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
    
    // Собираем все слои (секции) в массив, чтобы знать их порядковый номер
    const panels = Array.from(document.querySelectorAll('.stack-panel'));
    
    menuLinks.forEach((link) => {
      link.addEventListener('mouseenter', moveArrow);
      link.addEventListener('focus', moveArrow);
      
      link.addEventListener('click', (e) => {
        e.preventDefault(); // Строго отключаем стандартный сломанный скролл браузера

        const href = link.getAttribute('href');
        let targetSelector = href === '#contact' ? '#about' : href;
        const targetEl = document.querySelector(targetSelector);

        if (targetEl && panels.length > 0) {
          // Ищем индекс нужного слайда (0, 1, 2 или 3)
          const targetIndex = panels.indexOf(targetEl);
          
          if (targetIndex !== -1) {
            // Вычисляем точную высоту одного слайда (100dvh в пикселях)
            const panelHeight = panels[0].offsetHeight; 
            
            // Умножаем высоту слайда на его номер, получаем железобетонную координату
            const scrollPos = targetIndex * panelHeight;
            
            window.scrollTo({
              top: scrollPos,
              behavior: 'smooth'
            });
          }
        }

        // Закрываем меню после клика
        siteMenu.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hideArrow();
      });
    });
  }

  /* -------------------------------------------------------------
   * 2. DIAGRAM SVG CONNECTING LINES (PARTICLE FLOW)
   * ------------------------------------------------------------- */
  const wrap = document.getElementById('diagramWrap');
  const svg = document.getElementById('linesSvg');
  let lineAnimators = [];

  function clearLineAnimators() {
    lineAnimators.forEach((anim) => anim.destroy());
    lineAnimators = [];
  }

  function drawLines() {
    clearLineAnimators();
    if (!wrap || !svg) return;
    const wrapRect = wrap.getBoundingClientRect();
    if (wrapRect.width < 1 || wrapRect.height < 1) return;

    const W = wrapRect.width;
    const H = wrapRect.height;
    const chestX = W / 2;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const favItems = Array.from(wrap.querySelectorAll('.fav-item'));

    // Реальные позиции всех фото каждой колонки, отсортированные по высоте —
    // нужны, чтобы находить "соседа" и строить изгиб линии в реальном
    // зазоре между фото, а не в фиксированной точке (которая могла
    // случайно совпасть с собственным положением фото — изгиб пропадал).
    function colItems(side) {
      return favItems
        .filter(it => (it.dataset.side === '-1' ? -1 : 1) === side)
        .map(it => {
          const img = it.querySelector('img');
          const r = img.getBoundingClientRect();
          return { item: it, edgeY: (r.top + r.height / 2) - wrapRect.top };
        })
        .sort((a, b) => a.edgeY - b.edgeY);
    }
    const leftSorted = colItems(-1);
    const rightSorted = colItems(1);

    favItems.forEach((item) => {
      const img = item.querySelector('img');
      if (!img) return;

      const r = img.getBoundingClientRect();
      const side = item.dataset.side === '-1' ? -1 : 1;

      // Точка привязки к внутреннему краю фотографии
      const edgeX = (side < 0 ? r.right : r.left) - wrapRect.left;
      const edgeY = (r.top + r.height / 2) - wrapRect.top;

      // Как на референсе: горизонталь от фото почти до центра → вертикальная
      // "ступенька" рядом с фигурой → короткая горизонталь в саму фигуру.
      // Поворот НЕ у фото, а ближе к центру — именно так выглядит образец.
      let fiNum = 1;
      if (item.classList.contains('fi-2')) fiNum = 2;
      else if (item.classList.contains('fi-3')) fiNum = 3;
      else if (item.classList.contains('fi-4')) fiNum = 4;

      // Свой X-коридор (где именно происходит "ступенька") под каждую линию —
      // чтобы вертикальные участки восьми линий не совпадали друг с другом
      const CORRIDOR_OFFSETS = { 1: 0.06, 2: 0.11, 3: 0.16, 4: 0.21 }; // доля W от chestX
      // ВАЖНО: знак "+" — коридор должен быть МЕЖДУ фото и центром фигуры.
      // С "-" линия сначала перелетала ЗА центр (на противоположную половину),
      // а затем возвращалась назад — это и создавало "перехлёст"/кашу из линий.
      const corridorX = chestX + side * W * CORRIDOR_OFFSETS[fiNum];

      // Своя Y-полоса схождения — разная у left/right, чтобы линии не
      // сливались в одну сплошную горизонталь через всю фигуру
      const TARGET_Y_BANDS_LEFT  = { 1: 0.30, 2: 0.42, 3: 0.54, 4: 0.66 };
      const TARGET_Y_BANDS_RIGHT = { 1: 0.36, 2: 0.48, 3: 0.60, 4: 0.72 };
      const bands = side < 0 ? TARGET_Y_BANDS_LEFT : TARGET_Y_BANDS_RIGHT;
      let targetY = H * bands[fiNum];

      // Гарантия видимого излома: если полоса случайно оказалась слишком
      // близко к высоте самого фото, принудительно отодвигаем её
      const MIN_BEND = Math.max(H * 0.10, 50);
      if (Math.abs(targetY - edgeY) < MIN_BEND) {
        targetY = edgeY + (targetY >= edgeY ? MIN_BEND : -MIN_BEND);
      }

      // Горизонталь от фото до коридора → вертикальная ступенька →
      // горизонталь в фигуру (2 чётких поворота под 90°, как на референсе)
      const points = [
        [edgeX, edgeY],
        [corridorX, edgeY],
        [corridorX, targetY],
        [chestX, targetY]
      ];

      const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

      // 1. Основная фоновая линия (провод)
      const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      mainPath.setAttribute('d', pathD);
      mainPath.setAttribute('fill', 'none');
      mainPath.setAttribute('stroke', '#dadada');
      mainPath.setAttribute('stroke-width', '0.8');
      svg.appendChild(mainPath);

      const totalLen = mainPath.getTotalLength();

      // 2. Цвета частиц под 3D-модель
      const PARTICLE_COLORS = ['#a5a2a2', '#2b2a2a', '#de9e76', '#eabca8', '#3a3a3a'];
      let colorIndex = 0;
      let activeParticles = [];
      let spawnInterval = null;
      let animFrame = null;
      let isHovered = false;

      // Создание частицы у модельки
      function createParticle() {
        if (!isHovered) return;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const color = PARTICLE_COLORS[colorIndex % PARTICLE_COLORS.length];
        colorIndex++;

        const radius = 0.8 + Math.random() * 0.6; 
        const speed = 2.0 + Math.random() * 1.8;

        circle.setAttribute('r', radius);
        circle.setAttribute('fill', color);
        circle.classList.add('flow-particle');
        

        const startPt = mainPath.getPointAtLength(totalLen);
        circle.setAttribute('cx', startPt.x);
        circle.setAttribute('cy', startPt.y);

        svg.appendChild(circle);

        activeParticles.push({
          el: circle,
          dist: totalLen,
          speed: speed
        });

        if (!animFrame) {
          animFrame = requestAnimationFrame(updateParticles);
        }
      }

      // Цикл полета к фото
      function updateParticles() {
        for (let i = activeParticles.length - 1; i >= 0; i--) {
          const p = activeParticles[i];
          p.dist -= p.speed;

          if (p.dist <= 0) {
            if (p.el.parentNode) p.el.parentNode.removeChild(p.el);
            activeParticles.splice(i, 1);
          } else {
            const pt = mainPath.getPointAtLength(p.dist);
            p.el.setAttribute('cx', pt.x);
            p.el.setAttribute('cy', pt.y);
          }
        }

        if (activeParticles.length > 0) {
          animFrame = requestAnimationFrame(updateParticles);
        } else {
          animFrame = null;
        }
      }

      // Слушатели ховера
      const onMouseEnter = () => {
        isHovered = true;
        // сразу несколько частиц с небольшим сдвигом по дистанции — плотный поток с первого кадра
        for (let k = 0; k < 4; k++) {
          setTimeout(createParticle, k * 60);
        }
        spawnInterval = setInterval(createParticle, 110); // было 400 — теперь точек заметно больше
      };

      const onMouseLeave = () => {
        isHovered = false;
        if (spawnInterval) {
          clearInterval(spawnInterval);
          spawnInterval = null;
        }
      };

      item.addEventListener('mouseenter', onMouseEnter);
      item.addEventListener('mouseleave', onMouseLeave);

      lineAnimators.push({
        destroy() {
          item.removeEventListener('mouseenter', onMouseEnter);
          item.removeEventListener('mouseleave', onMouseLeave);
          if (spawnInterval) clearInterval(spawnInterval);
          activeParticles.forEach(p => { if (p.el.parentNode) p.el.parentNode.removeChild(p.el); });
          activeParticles = [];
          if (animFrame) cancelAnimationFrame(animFrame);
        }
      });
    });
  }

  /* -------------------------------------------------------------
   * НОВОЕ: точный расчёт размеров .diagram-wrap через JS.
   * Меряем реальную высоту, занятую заголовком [favorite] +
   * "избранные проекты", и вписываем рамку 2.5:1 в то, что
   * осталось — по принципу object-fit: contain, без обрезаний.
   * ------------------------------------------------------------- */
  function sizeDiagramWrap() {
    const favSection = document.getElementById('favorites');
    const wrap = document.getElementById('diagramWrap');
    if (!favSection || !wrap) return;

    const label = favSection.querySelector('.label');
    const title = favSection.querySelector('h2');

    const favRect = favSection.getBoundingClientRect();
    const favStyle = getComputedStyle(favSection);
    const padTop = parseFloat(favStyle.paddingTop) || 0;
    const padBottom = parseFloat(favStyle.paddingBottom) || 0;

    // сколько места реально занял заголовочный блок (label + h2)
    let headerHeight = 0;
    if (label && title) {
      headerHeight = title.getBoundingClientRect().bottom - label.getBoundingClientRect().top;
    }

    const gapAfterHeader = 24; // небольшой зазор перед рамкой
    const availableHeight = favRect.height - padTop - padBottom - headerHeight - gapAfterHeader;
    const availableWidth = Math.min(window.innerWidth * 0.96, favRect.width);

    const RATIO = 2.5; // ширина к высоте — рамка с фото свободно сжимается, без минимума
    let w = availableWidth;
    let h = w / RATIO;

    if (h > availableHeight) {
      h = Math.max(availableHeight, 0);
      w = h * RATIO;
    }

    wrap.style.width = w + 'px';
    wrap.style.height = h + 'px';

    // размер и позицию фигуры считаем отдельно — у неё свой минимум
    sizeFigureCanvas(wrap);

    // после изменения размеров пересчитываем соединительные линии
    drawLines();
  }

  /* -------------------------------------------------------------
   * НОВОЕ: у фигуры (canvas) собственный минимальный размер,
   * независимый от рамки с фото. Рамка и фото продолжают свободно
   * сжиматься, а фигура при этом не мельчает ниже читаемого размера —
   * если места не хватает, она просто выходит за пределы рамки
   * (центрированно), а не ужимается вместе с ней.
   * ------------------------------------------------------------- */
  function sizeFigureCanvas(wrap) {
    const figureWrap = wrap.querySelector('.figure-canvas-wrap');
    const favSection = document.getElementById('favorites');
    if (!figureWrap) return;

    const wrapW = wrap.clientWidth;
    const wrapH = wrap.clientHeight;

    // естественные пропорции фигуры — портретные (уже, чем сама рамка)
    const FIGURE_ASPECT = 0.5; // ширина / высота
    const MIN_FIGURE_HEIGHT = 500;
    const MIN_FIGURE_WIDTH = MIN_FIGURE_HEIGHT * FIGURE_ASPECT;

    // по умолчанию фигура вписана в высоту рамки, ширина — по пропорции
    let figH = wrapH;
    let figW = wrapH * FIGURE_ASPECT;

    let overflowed = false;
    if (figH < MIN_FIGURE_HEIGHT) {
      figH = MIN_FIGURE_HEIGHT;
      figW = MIN_FIGURE_WIDTH;
      overflowed = true;
    }

    figureWrap.style.width = figW + 'px';
    figureWrap.style.height = figH + 'px';
    figureWrap.style.left = '50%';
    figureWrap.style.top = '50%';
    figureWrap.style.transform = 'translate(-50%, -50%)';
    figureWrap.style.right = 'auto';
    figureWrap.style.bottom = 'auto';

    // если фигура вышла за пределы рамки — снимаем overflow:hidden,
    // чтобы она не обрезалась сверху/снизу
    favSection.style.overflow = overflowed ? 'visible' : '';

    // сразу пересчитываем сам canvas фигуры под новый размер контейнера
    if (typeof window.resizeFigureCanvas === 'function') {
      window.resizeFigureCanvas();
    }
  }

  window.addEventListener('load', sizeDiagramWrap);
  window.addEventListener('resize', sizeDiagramWrap);
  setTimeout(sizeDiagramWrap, 50);
  setTimeout(sizeDiagramWrap, 400);

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
   * 3. MINDMAP LINES
   * ------------------------------------------------------------- */
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
      dot.setAttribute('r', '2.5');
      dot.setAttribute('fill', '#ffffff');
      
      svg.appendChild(dot);
    });
  }

  window.addEventListener('load', drawMindmapLines);
  window.addEventListener('resize', drawMindmapLines);
  drawMindmapLines();

  /* -------------------------------------------------------------
   * 4. CAROUSEL & LIGHTBOX (INFINITE LOOP)
   * ------------------------------------------------------------- */
  function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const container = document.querySelector('.carousel-track-container');
    
    if (!track || !container) return;

    const TOTAL_ITEMS = 20;

    function createSlide(i) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const slideDiv = document.createElement('div');
      slideDiv.className = 'carousel-slide'; 
      
      const img = document.createElement('img');
      img.src = `/carousel/carousel-${numStr}.png`; 
      img.alt = `Project ${numStr}`;
      
      img.onerror = () => {
        img.src = `/projects/p1.jfif`;
      };

      slideDiv.appendChild(img);
      return slideDiv;
    }

    for (let i = 1; i <= TOTAL_ITEMS; i++) track.appendChild(createSlide(i));
    for (let i = 1; i <= TOTAL_ITEMS; i++) track.appendChild(createSlide(i));
    for (let i = 1; i <= TOTAL_ITEMS; i++) track.appendChild(createSlide(i));

    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    let currentIndex = TOTAL_ITEMS + Math.floor(TOTAL_ITEMS / 2);
    let isTransitioning = false;

    function updateCarousel(animated = true) {
      slides.forEach((slide, index) => {
        if (index === currentIndex) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      const activeSlide = slides[currentIndex];
      if (!activeSlide) return;

      const containerWidth = container.clientWidth;
      const slideCenter = activeSlide.offsetLeft + (activeSlide.offsetWidth / 2);
      const targetX = (containerWidth / 2) - slideCenter;

      if (animated) {
        track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        isTransitioning = true;
      } else {
        track.style.transition = 'none';
      }

      track.style.transform = `translateX(${targetX}px)`;
    }

    track.addEventListener('transitionend', () => {
      isTransitioning = false;
      if (currentIndex >= TOTAL_ITEMS * 2) {
        currentIndex -= TOTAL_ITEMS;
        updateCarousel(false);
      } else if (currentIndex < TOTAL_ITEMS) {
        currentIndex += TOTAL_ITEMS;
        updateCarousel(false);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (isTransitioning) return;
      currentIndex++;
      updateCarousel(true);
    });

    prevBtn.addEventListener('click', () => {
      if (isTransitioning) return;
      currentIndex--;
      updateCarousel(true);
    });

    slides.forEach((slide, index) => {
      slide.addEventListener('click', () => {
        if (isTransitioning) return;
        currentIndex = index;
        updateCarousel(true);
      });
    });

    window.addEventListener('resize', () => updateCarousel(false));
    setTimeout(() => updateCarousel(false), 150);
  }
  initCarousel();

  /* -------------------------------------------------------------
   * 5. DYNAMIC MENU COLOR (STICKY LAYERS)
   * ------------------------------------------------------------- */
  const favSection = document.getElementById('favorites');
  const mindmapSection = document.getElementById('mindmap');
  
  function updateMenuColor() {
    if (!favSection || !mindmapSection || !hamburgerBtn || !menuList) return;
    
    const favTop = favSection.getBoundingClientRect().top;
    const mindmapTop = mindmapSection.getBoundingClientRect().top;
    
    if (favTop <= 40 && mindmapTop > 40) {
      hamburgerBtn.classList.add('dark-mode');
      menuList.classList.add('dark-mode');
    } else {
      hamburgerBtn.classList.remove('dark-mode');
      menuList.classList.remove('dark-mode');
    }
  }

  window.addEventListener('scroll', updateMenuColor);
  window.addEventListener('resize', updateMenuColor);
  updateMenuColor();

});