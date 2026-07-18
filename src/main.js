import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const projectsData = {
  1: { title: "Театр Света", desc: "Световая инсталляция в виде мужского причендала.", link: "/project-1.html" },
  2: { title: "Павильон 'Красота'", desc: "Временная выставочная конструкция из перерабатываемых материалов.", link: "/project-2.html" },
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
const threeCanvas = document.getElementById('threeCanvas');

const categoryNodes = document.querySelectorAll('.category-node');
const categoriesLinesCanvas = document.getElementById('categoriesLinesCanvas');

const sliderTrack = document.getElementById('sliderTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// --- 1. НАСТРОЙКА THREE.JS И ИНВЕРСНОЙ АНИМАЦИИ ОБЕИХ РУК ---
let scene, camera, renderer, model;

// Кости для управления левой и правой стороной
let boneShoulderR, boneHandR, boneShoulderL, boneHandL;

// Таргеты углов для сглаживания вращений
let targetRot = {
  shoulderRX: 0, shoulderRZ: 0, handRX: 0, handRZ: 0,
  shoulderLX: 0, shoulderLZ: 0, handLX: 0, handLZ: 0
};

if (centerModel && threeCanvas) {
  scene = new THREE.Scene();

  // Придвинули камеру ближе (z = 4.0 вместо 5) чтобы моделька визуально казалась больше
  camera = new THREE.PerspectiveCamera(42, centerModel.clientWidth / centerModel.clientHeight, 0.1, 100);
  camera.position.set(0, 0.2, 4.0);

  renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, antialias: true, alpha: true });
  renderer.setSize(centerModel.clientWidth, centerModel.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(2, 3, 4);
  scene.add(directionalLight);

  const loader = new GLTFLoader();
  loader.load(
    '/spider-man.glb',
    (gltf) => {
      model = gltf.scene;
      
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x += (model.position.x - center.x);
      model.position.y += (model.position.y - center.y) - 0.2; // Немного опустили для идеальной центровки
      
      // Увеличили масштаб самой 3D-модели
      model.scale.set(1.25, 1.25, 1.25);
      scene.add(model);

      // Инициализируем плечевые суставы и предплечья для обеих рук
      boneShoulderR = model.getObjectByName('shoulderR') || model.getObjectByName('upperarmR') || model.getObjectByName('armR_1');
      boneHandR = model.getObjectByName('handR_7') || model.getObjectByName('forearmR') || model.getObjectByName('armR_2');
      
      boneShoulderL = model.getObjectByName('shoulderL') || model.getObjectByName('upperarmL') || model.getObjectByName('armL_1');
      boneHandL = model.getObjectByName('handL_7') || model.getObjectByName('forearmL') || model.getObjectByName('armL_2');
    },
    undefined,
    (error) => console.error('Ошибка загрузки модели:', error)
  );

  function animate() {
    requestAnimationFrame(animate);
    
    // КРУЧЕНИЕ МОДЕЛИ ПОЛНОСТЬЮ УБРАНО! Она стоит ровно.

    // Плавное интерполированное движение для правой руки
    if (boneShoulderR) {
      boneShoulderR.rotation.x += (targetRot.shoulderRX - boneShoulderR.rotation.x) * 0.1;
      boneShoulderR.rotation.z += (targetRot.shoulderRZ - boneShoulderR.rotation.z) * 0.1;
    }
    if (boneHandR) {
      boneHandR.rotation.x += (targetRot.handRX - boneHandR.rotation.x) * 0.1;
      boneHandR.rotation.z += (targetRot.handRZ - boneHandR.rotation.z) * 0.1;
    }

    // Плавное интерполированное движение для левой руки
    if (boneShoulderL) {
      boneShoulderL.rotation.x += (targetRot.shoulderLX - boneShoulderL.rotation.x) * 0.1;
      boneShoulderL.rotation.z += (targetRot.shoulderLZ - boneShoulderL.rotation.z) * 0.1;
    }
    if (boneHandL) {
      boneHandL.rotation.x += (targetRot.handLX - boneHandL.rotation.x) * 0.1;
      boneHandL.rotation.z += (targetRot.handLZ - boneHandL.rotation.z) * 0.1;
    }

    renderer.render(scene, camera);
  }
  animate();
}

// --- 2. СВЯЗУЮЩИЕ ЛИНИИ СЛОЯ 2 (УЛЬТРАТОНКИЕ НАПРОТИВ КРАЯ) ---
function drawLayer2Lines() {
  if (!canvas || !centerModel) return;

  canvas.innerHTML = '';
  const canvasRect = canvas.getBoundingClientRect();
  const modelRect = centerModel.getBoundingClientRect();

  const centerX = (modelRect.left + modelRect.width / 2) - canvasRect.left;
  // Линия выходит красивой анатомической точкой из верхней части груди
  const centerY = (modelRect.top + modelRect.height / 2) - canvasRect.top - 60; 

  projectNodes.forEach(node => {
    const nodeRect = node.getBoundingClientRect();
    const imgWrap = node.querySelector('.node-img-wrap');
    const imgRect = imgWrap.getBoundingClientRect();
    const projectId = node.getAttribute('data-project');

    const isLeftColumn = (nodeRect.left - canvasRect.left) < canvasRect.width / 2;
    
    let nodeTargetX = 0;
    if (isLeftColumn) {
      nodeTargetX = imgRect.right - canvasRect.left + 5; 
    } else {
      nodeTargetX = imgRect.left - canvasRect.left - 5;  
    }
    const nodeTargetY = (imgRect.top + imgRect.height / 2) - canvasRect.top;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centerX);
    line.setAttribute('y1', centerY);
    line.setAttribute('x2', nodeTargetX);
    line.setAttribute('y2', nodeTargetY);
    line.setAttribute('class', 'project-line');
    line.setAttribute('id', `line-${projectId}`);
    canvas.appendChild(line);

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', nodeTargetX);
    dot.setAttribute('cy', nodeTargetY);
    dot.setAttribute('r', '1.8'); // Точка сделана еще меньше и деликатнее
    dot.setAttribute('class', 'line-dot');
    dot.setAttribute('id', `dot-${projectId}`);
    canvas.appendChild(dot);
  });
}

// --- 3. СВЯЗУЮЩИЕ ЛИНИИ СЛОЯ 3 ---
function drawLayer3Lines() {
  if (!categoriesLinesCanvas || categoryNodes.length === 0) return;
  if (window.innerWidth <= 576) {
    categoriesLinesCanvas.innerHTML = '';
    return;
  }
  categoriesLinesCanvas.innerHTML = '';
  const canvasRect = categoriesLinesCanvas.getBoundingClientRect();
  const connections = [[0, 1], [1, 4], [4, 5], [5, 3], [3, 2], [2, 0], [0, 3], [1, 3], [4, 3], [1, 2]];

  connections.forEach(([fromIndex, toIndex]) => {
    const fromNode = categoryNodes[fromIndex];
    const toNode = categoryNodes[toIndex];
    if (!fromNode || !toNode) return;

    const fromRect = fromNode.querySelector('img').getBoundingClientRect();
    const toRect = toNode.querySelector('img').getBoundingClientRect();

    const x1 = (fromRect.left + fromRect.width / 2) - canvasRect.left;
    const y1 = (fromRect.top + fromRect.height / 2) - canvasRect.top;
    const x2 = (toRect.left + toRect.width / 2) - canvasRect.left;
    const y2 = (toRect.top + toRect.height / 2) - canvasRect.top;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('class', 'project-line');
    categoriesLinesCanvas.appendChild(line);
  });
}

const resizeObserver = new ResizeObserver(() => {
  if (camera && renderer && centerModel) {
    camera.aspect = centerModel.clientWidth / centerModel.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(centerModel.clientWidth, centerModel.clientHeight);
  }
  drawLayer2Lines();
  drawLayer3Lines();
});
if (centerModel) resizeObserver.observe(centerModel.parentElement);

// --- 4. ИНТЕЛЛЕКТУАЛЬНАЯ РАБОТА РУК ПРИ КЛИКАХ ---
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

      const canvasRect = canvas.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      
      // Вычисляем, с какой стороны находится карточка
      const isLeftColumn = (nodeRect.left - canvasRect.left) < canvasRect.width / 2;
      
      // Рассчитываем динамический угол наклона в радианах
      const modelRect = centerModel.getBoundingClientRect();
      const deltaX = (nodeRect.left + nodeRect.width / 2) - (modelRect.left + modelRect.width / 2);
      const deltaY = (nodeRect.top + nodeRect.height / 2) - (modelRect.top + modelRect.height / 2);
      const angle = Math.atan2(deltaY, deltaX);

      if (isLeftColumn) {
        // ЛЕВАЯ СТОРОНА: Тянемся левой рукой, правую опускаем в дефолт
        targetRot.shoulderLX = 0.4;
        targetRot.shoulderLZ = angle - Math.PI; // Коррекция вектора левой стороны
        targetRot.handLX = 0.3;
        targetRot.handLZ = 0.2;

        // Сброс правой руки по шву
        targetRot.shoulderRX = 0; targetRot.shoulderRZ = 0;
        targetRot.handRX = 0; targetRot.handRZ = 0;
      } else {
        // ПРАВАЯ СТОРОНА: Тянемся правой рукой, левую расслабляем
        targetRot.shoulderRX = 0.4;
        targetRot.shoulderRZ = angle; 
        targetRot.handRX = 0.3;
        targetRot.handRZ = 0.2;

        // Сброс левой руки по шву
        targetRot.shoulderLX = 0; targetRot.shoulderLZ = 0;
        targetRot.handLX = 0; targetRot.handLZ = 0;
      }

      // Позиционирование всплывающего окна
      if (window.innerWidth > 768) {
        const rect = node.getBoundingClientRect();
        const parentRect = node.parentElement.getBoundingClientRect();
        const relativeTop = rect.top - parentRect.top;
        const relativeLeft = rect.left - parentRect.left;

        if (relativeLeft > parentRect.width / 2) {
          tooltip.style.left = `${relativeLeft - 280}px`; 
        } else {
          tooltip.style.left = `${relativeLeft + rect.width + 15}px`;
        }
        tooltip.style.top = `${relativeTop}px`;
      }

      // Менеджмент классов стилей
      document.querySelectorAll('#linesCanvas .project-line').forEach(l => l.classList.remove('active'));
      const activeLine = document.getElementById(`line-${projectId}`);
      if (activeLine) activeLine.classList.add('active');

      document.querySelectorAll('#linesCanvas .line-dot').forEach(d => d.classList.remove('active'));
      const activeDot = document.getElementById(`dot-${projectId}`);
      if (activeDot) activeDot.classList.add('active');

      projectNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
    }
  });
});

const closeTooltip = () => {
  tooltip.style.display = 'none';
  document.querySelectorAll('#linesCanvas .project-line').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('#linesCanvas .line-dot').forEach(d => d.classList.remove('active'));
  projectNodes.forEach(n => n.classList.remove('active'));
  
  // Возвращаем обе руки в спокойное положение
  targetRot = {
    shoulderRX: 0, shoulderRZ: 0, handRX: 0, handRZ: 0,
    shoulderLX: 0, shoulderLZ: 0, handLX: 0, handLZ: 0
  };
};
tooltipClose.addEventListener('click', (e) => { e.stopPropagation(); closeTooltip(); });
document.addEventListener('click', closeTooltip);

// --- 5. КЛИКИ ПО КАТЕГОРИЯМ СЛОЯ 3 ---
categoryNodes.forEach(node => {
  node.addEventListener('click', () => {
    const targetLink = node.getAttribute('data-link');
    if (targetLink) window.open(targetLink, '_blank');
  });
});

// --- 6. БЕСКОНЕЧНЫЙ СЛАЙДЕР СЛОЯ 4 ---
if (sliderTrack) {
  let currentIndex = 0;
  const slides = sliderTrack.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let slidesPerView = window.innerWidth <= 768 ? 2 : 5;
  let maxIndex = Math.max(0, totalSlides - slidesPerView);
  let autoScrollInterval;

  const updateSliderPosition = () => {
    if(slides.length === 0) return;
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = 20;
    const offset = currentIndex * (slideWidth + gap);
    sliderTrack.style.transform = `translateX(-${offset}px)`;
  };

  const moveNext = () => {
    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    updateSliderPosition();
  };
  const movePrev = () => {
    currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
    updateSliderPosition();
  };

  if (nextBtn) nextBtn.addEventListener('click', () => { moveNext(); startAutoPlay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { movePrev(); startAutoPlay(); });

  const startAutoPlay = () => { stopAutoPlay(); autoScrollInterval = setInterval(moveNext, 4000); };
  const stopAutoPlay = () => { if (autoScrollInterval) clearInterval(autoScrollInterval); };

  sliderTrack.addEventListener('mouseenter', stopAutoPlay);
  sliderTrack.addEventListener('mouseleave', startAutoPlay);
  window.addEventListener('resize', () => {
    slidesPerView = window.innerWidth <= 768 ? 2 : 5;
    maxIndex = Math.max(0, totalSlides - slidesPerView);
    updateSliderPosition();
  });

  setTimeout(() => { updateSliderPosition(); startAutoPlay(); }, 300);
}