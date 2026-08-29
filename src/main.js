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
          points = [
            [edgeX, edgeY],
            [chestX - W * 0.11, edgeY + H * 0.09],
            [chestX - W * 0.03, edgeY + H * 0.09]
          ];
          break;

        case '002':
          points = [
            [edgeX, edgeY],
            [chestX - W * 0.03, edgeY]
          ];
          break;

        case '003':
          const startY_003 = (r.top - wrapRect.top) + (r.height * 0.6);
          points = [
            [edgeX, startY_003],
            [chestX - W * 0.25, edgeY - H * 0.04],
            [chestX - W * 0.07, edgeY - H * 0.04]
          ];
          break;

        case '004':
          points = [
            [edgeX, edgeY],
            [chestX - W * 0.05, H * 0.70]
          ];
          break;

        case '005':
          const startY_005 = (r.top - wrapRect.top) + (r.height * 0.33);
          points = [
            [edgeX, startY_005],
            [chestX + W * 0.03, H * 0.28]
          ];
          break;

        case '006':
          const startY_006 = (r.top - wrapRect.top) + (r.height * 0.80);
          points = [
            [edgeX, startY_006],
            [chestX + W * 0.12, startY_006],
            [chestX + W * 0.12, H * 0.36],
            [chestX + W * 0.04, H * 0.36]
          ];
          break;

        case '007':
          points = [
            [edgeX, edgeY],
            [chestX + W * 0.12, edgeY],
            [chestX + W * 0.12, edgeY + H * 0.10],
            [chestX + W * 0.08, edgeY + H * 0.10],
            [chestX + W * 0.08, edgeY]
          ];
          break;

        case '008':
          const startY_008 = (r.top - wrapRect.top) + (r.height * 0.88);
          points = [
            [edgeX, startY_008],
            [chestX + W * 0.05, H * 0.67]
          ];
          break;

        default:
          points = [
            [edgeX, edgeY],
            [chestX, edgeY]
          ];
          break;
      }

      const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

      // 1. Основная фоновая линия (провод)
      const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      mainPath.setAttribute('d', pathD);
      mainPath.setAttribute('fill', 'none');
      mainPath.setAttribute('stroke', 'rgba(198, 198, 198, 0.25)');
      mainPath.setAttribute('stroke-width', '1.3');
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
        createParticle();
        spawnInterval = setInterval(createParticle, 400);
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