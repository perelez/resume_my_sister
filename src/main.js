import './style.css';

const projectsData = {
  1: { title: "Театр Света", desc: "Световая инсталляция в виде мужского причендала.", link: "/project-1.html" },
  2: { title: "Павильон 'ойойой что за красота'", desc: "Временная выставочная конструкция из перерабатываемых материалов.", link: "/project-2.html" },
  3: { title: "52 регион", desc: "это мой город в котором я живу 52 еу", link: "/project-3.html" },
  4: { title: "Жук навозник", desc: "Концепт жилой застройки средней этажности с акцентом на зеленые зоны.", link: "/project-4.html" },
  5: { title: "Музей Современного Искусства", desc: "Пространство с уникальной геометрией потолков.", link: "/project-5.html" },
  6: { title: "Сценография 'Урбан'", desc: "Разработка сценического пространства для масштабного мультимедийного шоу.", link: "/project-6.html" },
  7: { title: "Арт-Объект 'Портал'", desc: "Интерактивная зеркальная арка, реагирующая на приближение людей.", link: "/project-7.html" },
  8: { title: "Лофт", desc: "Просто очень очень крутое слово которое звучит как надо.", link: "/project-8.html" }
};

const projectNodes = document.querySelectorAll('.project-node');
const tooltip = document.getElementById('projectTooltip');
const tooltipTitle = tooltip.querySelector('.tooltip-title');
const tooltipDesc = tooltip.querySelector('.tooltip-desc');
const tooltipBtn = tooltip.querySelector('.tooltip-btn');
const tooltipClose = tooltip.querySelector('.tooltip-close');
const canvas = document.getElementById('linesCanvas');
const centerModel = document.getElementById('centerModel');

// --- 1. ОТРИСОВКА СВЯЗУЮЩИХ ЛИНИЙ ---
function drawLines() {
  if (!canvas || !centerModel) return;

  // Очищаем предыдущие SVG-линии
  canvas.innerHTML = '';
  
  const canvasRect = canvas.getBoundingClientRect();
  const modelRect = centerModel.getBoundingClientRect();

  // Находим точный центр модели
  const centerX = (modelRect.left + modelRect.width / 2) - canvasRect.left;
  const centerY = (modelRect.top + modelRect.height / 2) - canvasRect.top;

  projectNodes.forEach(node => {
    const nodeRect = node.getBoundingClientRect();
    const projectId = node.getAttribute('data-project');

    // Находим точный центр карточки
    const nodeCenterX = (nodeRect.left + nodeRect.width / 2) - canvasRect.left;
    const nodeCenterY = (nodeRect.top + nodeRect.height / 2) - canvasRect.top;

    // Создаем SVG-линию
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

// Запуск отрисовки линий при загрузке и ресайзе
setTimeout(drawLines, 150);
window.addEventListener('resize', drawLines);

// --- 2. ЛОГИКА ВСПЛЫВАЮЩЕЙ СНОСКИ ---
projectNodes.forEach(node => {
  node.addEventListener('click', (event) => {
    event.stopPropagation();

    const projectId = node.getAttribute('data-project');
    const project = projectsData[projectId];

    if (project) {
      tooltipTitle.textContent = project.title;
      tooltipDesc.textContent = project.desc;
      tooltipBtn.href = project.link;
      tooltip.style.display = 'flex';

      // Позиционируем сноску только на десктопах (на мобилках она снизу в виде фиксированной шторки)
      if (window.innerWidth > 768) {
        const rect = node.getBoundingClientRect();
        const parentRect = node.parentElement.getBoundingClientRect();

        const relativeTop = rect.top - parentRect.top;
        const relativeLeft = rect.left - parentRect.left;

        // Позиционируем слева или справа, чтобы не вылезала за экран
        if (relativeLeft > parentRect.width / 2) {
          tooltip.style.left = `${relativeLeft - 300}px`; 
        } else {
          tooltip.style.left = `${relativeLeft + rect.width + 20}px`;
        }
        tooltip.style.top = `${relativeTop}px`;
      }

      // Подсвечиваем линию нажатого проекта
      document.querySelectorAll('.project-line').forEach(l => l.classList.remove('active'));
      const activeLine = document.getElementById(`line-${projectId}`);
      if (activeLine) activeLine.classList.add('active');

      // подсветка карточкиа гасим все старые активные карточки
      projectNodes.forEach(n => n.classList.remove('active'));
      // Зажигаем текущую кликнутую карточку
      node.classList.add('active');
    }
  });
});

// Закрытие сноски
const closeTooltip = () => {
  tooltip.style.display = 'none';
  document.querySelectorAll('.project-line').forEach(l => l.classList.remove('active'));
  projectNodes.forEach(n => n.classList.remove('active'));
};

tooltipClose.addEventListener('click', (e) => {
  e.stopPropagation();
  closeTooltip();
});
document.addEventListener('click', closeTooltip);