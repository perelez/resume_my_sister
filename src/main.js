import './style.css';

// Данные для наших проектов (позже мы будем забирать это из базы данных Java!)
const projectsData = {
  1: {
    title: "Театр Света",
    desc: "Световая инсталляция в виде мужского причендала.",
    link: "/project-1.html"
  },
  2: {
    title: "Павильон 'ойойой что за красота'",
    desc: "Временная выставочная конструкция из перерабатываемых материалов для арт-фестиваля.",
    link: "/project-2.html"
  },
  3: {
    title: "52 регион",
    desc: "это мой город в котором я живу 52 еу",
    link: "/project-3.html"
  },
  4: {
    title: "Жук навозник",
    desc: "Концепт жилой застройки средней этажности с акцентом на зеленые зоны и общественные пространства.",
    link: "/project-4.html"
  },
  5: {
    title: "Музей Современного Искусства",
    desc: "Пространство с уникальной геометрией потолков, потолки выполнены в стиле хрущевки с оттенком борокко",
    link: "/project-5.html"
  },
  6: {
    title: "Сценография 'Урбан'",
    desc: "Разработка сценического пространства для масштабного мультимедийного шоу уральские пельмени.",
    link: "/project-6.html"
  },
  7: {
    title: "Арт-Объект 'Портал'",
    desc: "Интерактивная зеркальная арка, реагирующая на приближение людей изменением подсветки. Портал в эндермир из майнкрафт 1.15",
    link: "/project-7.html"
  },
  8: {
    title: "Лофт",
    desc: "просто очень очень крутое слово которое звучит как то, что нужно для этого сайта.",
    link: "/project-8.html"
  }
};

// Находим нужные элементы на странице
const projectNodes = document.querySelectorAll('.project-node');
const tooltip = document.getElementById('projectTooltip');
const tooltipTitle = tooltip.querySelector('.tooltip-title');
const tooltipDesc = tooltip.querySelector('.tooltip-desc');
const tooltipBtn = tooltip.querySelector('.tooltip-btn');
const tooltipClose = tooltip.querySelector('.tooltip-close');

// Функция для показа сноски рядом с кликнутой картинкой
projectNodes.forEach(node => {
  node.addEventListener('click', (event) => {
    // Останавливаем всплытие события, чтобы клик по карточке не закрывал сам себя
    event.stopPropagation();

    const projectId = node.getAttribute('data-project');
    const project = projectsData[projectId];

    if (project) {
      // 1. Наполняем сноску контентом
      tooltipTitle.textContent = project.title;
      tooltipDesc.textContent = project.desc;
      tooltipBtn.href = project.link;

      // 2. Показываем сноску
      tooltip.style.display = 'flex';

      // 3. Высчитываем координаты кликнутой карточки, чтобы привязать к ней окошко
      const rect = node.getBoundingClientRect();
      const parentRect = node.parentElement.getBoundingClientRect();

      // Находим положение карточки относительно родительского контейнера
      const relativeTop = rect.top - parentRect.top;
      const relativeLeft = rect.left - parentRect.left;

      // Размещаем сноску чуть правее или левее карточки (в зависимости от того, с какой стороны экрана она находится)
      if (relativeLeft > parentRect.width / 2) {
        // Если карточка справа — сноску сдвигаем левее карточки
        tooltip.style.left = `${relativeLeft - 300}px`; 
      } else {
        // Если слева — сноску сдвигаем правее карточки
        tooltip.style.left = `${relativeLeft + 120}px`;
      }
      
      tooltip.style.top = `${relativeTop}px`;
    }
    
  });
});

// Код для динамической отрисовки линий
const canvas = document.getElementById('linesCanvas');
const centerModel = document.getElementById('centerModel');

function drawLines() {
  // Очищаем старые линии перед перерисовкой
  canvas.innerHTML = '';

  // Получаем размеры и координаты центрального элемента (модели)
  const canvasRect = canvas.getBoundingClientRect();
  const modelRect = centerModel.getBoundingClientRect();

  // Находим точную центральную точку модели относительно SVG холста
  const centerX = (modelRect.left + modelRect.width / 2) - canvasRect.left;
  const centerY = (modelRect.top + modelRect.height / 2) - canvasRect.top;

  projectNodes.forEach(node => {
    const nodeRect = node.getBoundingClientRect();
    const projectId = node.getAttribute('data-project');

    // Находим центр каждой карточки проекта относительно SVG холста
    const nodeCenterX = (nodeRect.left + nodeRect.width / 2) - canvasRect.left;
    const nodeCenterY = (nodeRect.top + nodeRect.height / 2) - canvasRect.top;

    // Создаем SVG элемент линии <line>
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centerX);
    line.setAttribute('y1', centerY);
    line.setAttribute('x2', nodeCenterX);
    line.setAttribute('y2', nodeCenterY);
    line.setAttribute('class', 'project-line');
    line.setAttribute('id', `line-${projectId}`);

    canvas.appendChild(line);
  });
}

// Запускаем отрисовку линий при загрузке страницы
// Небольшая задержка, чтобы браузер успел отрендерить элементы и посчитать их размеры
setTimeout(drawLines, 100);

// Перерисовываем линии при изменении размеров окна, чтобы они не ломались
window.addEventListener('resize', drawLines);

// Закрытие сноски при клике на крестик
tooltipClose.addEventListener('click', (event) => {
  event.stopPropagation();
  tooltip.style.display = 'none';
});

// Закрытие сноски при клике в любое пустое место на сайте
document.addEventListener('click', () => {
  tooltip.style.display = 'none';
});