import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// API base URL
const API_BASE = window.PORTFOLIO_API_URL || '/api';

// Unsplash architectural images for projects
const PROJECT_IMAGES = {
  1: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
  2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  3: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80',
  4: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
  5: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=80',
  6: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'
};

// 3D Models configuration - using free sample models
const MODELS_3D = [
  {
    id: 'modern-house',
    name: 'Modern House',
    description: 'Residential',
    // Using a procedural model since we can't load external GLTF without CORS
    type: 'procedural'
  },
  {
    id: 'office-tower',
    name: 'Office Tower',
    description: 'Commercial',
    type: 'procedural'
  },
  {
    id: 'pavilion',
    name: 'Garden Pavilion',
    description: 'Public Space',
    type: 'procedural'
  }
];

// DOM Elements
const bioText = document.getElementById('bio-text');
const locationText = document.getElementById('location-text');
const educationList = document.getElementById('education-list');
const skillsGrid = document.getElementById('skills-grid');
const filterButtons = document.getElementById('filter-buttons');
const projectsGrid = document.getElementById('projects-grid');
const contactEmail = document.getElementById('contact-email');
const modal = document.getElementById('project-modal');
const modalClose = document.querySelector('.modal-close');
const loader = document.getElementById('loader');

// State
let allProjects = [];
let profile = null;
let modelViewer = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize 3D scenes
  init3DScene();
  initModelViewer();

  // Load content
  await Promise.all([loadProfile(), loadProjects()]);

  // Setup interactions
  setupEventListeners();
  setupScrollAnimations();

  // Hide loader
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 1000);
});

// ============================================
// HERO 3D BUILDING
// ============================================
function init3DScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

  renderer.setSize(500, 500);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const buildingGroup = new THREE.Group();

  // Materials
  const glassMaterial = new THREE.MeshPhongMaterial({
    color: 0x88ccff, transparent: true, opacity: 0.7, shininess: 100
  });
  const concreteMaterial = new THREE.MeshPhongMaterial({
    color: 0x8b7355, flatShading: true
  });
  const accentMaterial = new THREE.MeshPhongMaterial({
    color: 0xc9a86c, shininess: 80
  });

  // Main tower
  const tower = new THREE.Mesh(new THREE.BoxGeometry(2, 5, 2), glassMaterial);
  tower.position.y = 2.5;
  buildingGroup.add(tower);

  // Secondary tower
  const tower2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.5, 1.5), concreteMaterial);
  tower2.position.set(1.8, 1.75, 0);
  buildingGroup.add(tower2);

  // Base platform
  const base = new THREE.Mesh(new THREE.BoxGeometry(5, 0.3, 4), accentMaterial);
  base.position.y = -0.15;
  buildingGroup.add(base);

  // Canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 2.5), accentMaterial);
  canopy.position.set(0, 1.5, 1.5);
  buildingGroup.add(canopy);

  // Details
  for (let i = 0; i < 5; i++) {
    const detail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), accentMaterial);
    detail.position.set(-0.9 + i * 0.45, 3 + Math.sin(i) * 0.3, 1.05);
    buildingGroup.add(detail);
  }

  // Wireframe
  const wireframe = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 5.1, 2.1),
    new THREE.MeshBasicMaterial({ color: 0xc9a86c, wireframe: true, transparent: true, opacity: 0.3 })
  );
  wireframe.position.y = 2.5;
  buildingGroup.add(wireframe);

  scene.add(buildingGroup);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);
  const pointLight = new THREE.PointLight(0xc9a86c, 0.5);
  pointLight.position.set(-5, 5, 5);
  scene.add(pointLight);

  camera.position.set(4, 3, 6);
  camera.lookAt(0, 2, 0);

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  function animate() {
    requestAnimationFrame(animate);
    buildingGroup.rotation.y += (mouseX * 0.3 - buildingGroup.rotation.y) * 0.05;
    buildingGroup.rotation.x += (mouseY * 0.1 - buildingGroup.rotation.x) * 0.05;
    buildingGroup.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const size = Math.min(500, window.innerWidth - 48);
    renderer.setSize(size, size);
  });
}

// ============================================
// 3D MODEL VIEWER
// ============================================
function initModelViewer() {
  const canvas = document.getElementById('model-viewer');
  const viewerLoading = document.getElementById('viewer-loading');
  const thumbnailsContainer = document.getElementById('model-thumbnails');

  if (!canvas) return;

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(8, 6, 8);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3;
  controls.maxDistance = 20;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1);
  mainLight.position.set(10, 20, 10);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xc9a86c, 0.3);
  fillLight.position.set(-10, 5, -10);
  scene.add(fillLight);

  // Ground plane
  const groundGeometry = new THREE.PlaneGeometry(30, 30);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x16213e,
    roughness: 0.8
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid helper
  const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x333333);
  gridHelper.position.y = 0;
  scene.add(gridHelper);

  // Current model group
  let currentModel = null;
  let isWireframe = false;

  // Store viewer state
  modelViewer = { scene, camera, renderer, controls, currentModel };

  // Create procedural architectural models
  function createModernHouse() {
    const group = new THREE.Group();

    // Main building
    const mainMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccee, transparent: true, opacity: 0.6, metalness: 0.9 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.7 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.2 });

    // Base structure
    const base = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 4), mainMat);
    base.position.set(0, 1.5, 0);
    base.castShadow = true;
    group.add(base);

    // Second floor - offset
    const floor2 = new THREE.Mesh(new THREE.BoxGeometry(5, 2.5, 5), mainMat);
    floor2.position.set(0.5, 4.25, 0.5);
    floor2.castShadow = true;
    group.add(floor2);

    // Glass windows - front
    const windowFront = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 0.1), glassMat);
    windowFront.position.set(0, 1.5, 2.05);
    group.add(windowFront);

    // Glass windows - side
    const windowSide = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2, 2.5), glassMat);
    windowSide.position.set(3.05, 1.5, 0);
    group.add(windowSide);

    // Roof deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 3), woodMat);
    deck.position.set(-1, 5.55, -1);
    group.add(deck);

    // Railing
    for (let i = 0; i < 4; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), accentMat);
      post.position.set(-3 + i * 1.3, 6, -2.4);
      group.add(post);
    }

    // Canopy
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 2), accentMat);
    canopy.position.set(0, 3.1, 3);
    canopy.castShadow = true;
    group.add(canopy);

    // Support columns
    const col1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3), accentMat);
    col1.position.set(-1, 1.5, 3.8);
    group.add(col1);
    const col2 = col1.clone();
    col2.position.x = 1;
    group.add(col2);

    return group;
  }

  function createOfficeTower() {
    const group = new THREE.Group();

    const glassMat = new THREE.MeshStandardMaterial({ color: 0x6699cc, transparent: true, opacity: 0.7, metalness: 0.8 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xc9a86c, roughness: 0.3 });

    // Main tower
    const tower = new THREE.Mesh(new THREE.BoxGeometry(4, 12, 4), glassMat);
    tower.position.y = 6;
    tower.castShadow = true;
    group.add(tower);

    // Horizontal frames
    for (let i = 0; i < 6; i++) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 4.2), frameMat);
      frame.position.y = i * 2 + 1;
      group.add(frame);
    }

    // Vertical frames
    for (let x = -1; x <= 1; x += 2) {
      for (let z = -1; z <= 1; z += 2) {
        const vFrame = new THREE.Mesh(new THREE.BoxGeometry(0.15, 12, 0.15), frameMat);
        vFrame.position.set(x * 1.9, 6, z * 1.9);
        group.add(vFrame);
      }
    }

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(6, 1, 6), accentMat);
    base.position.y = 0.5;
    base.castShadow = true;
    group.add(base);

    // Top accent
    const top = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 3), accentMat);
    top.position.y = 12.25;
    group.add(top);

    // Entrance canopy
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(5, 0.2, 3), frameMat);
    canopy.position.set(0, 3.5, 3);
    canopy.castShadow = true;
    group.add(canopy);

    return group;
  }

  function createPavilion() {
    const group = new THREE.Group();

    const woodMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.6 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.4 });

    // Platform
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(5, 5.2, 0.4, 8), stoneMat);
    platform.position.y = 0.2;
    platform.receiveShadow = true;
    group.add(platform);

    // Columns
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 4;
      const z = Math.sin(angle) * 4;

      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 4, 8), woodMat);
      column.position.set(x, 2.4, z);
      column.castShadow = true;
      group.add(column);
    }

    // Roof
    const roofGeometry = new THREE.ConeGeometry(5.5, 2, 8);
    const roof = new THREE.Mesh(roofGeometry, roofMat);
    roof.position.y = 5.4;
    roof.castShadow = true;
    group.add(roof);

    // Inner roof
    const innerRoof = new THREE.Mesh(new THREE.ConeGeometry(3, 1, 8), woodMat);
    innerRoof.position.y = 4.9;
    group.add(innerRoof);

    // Benches
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const x = Math.cos(angle) * 2.5;
      const z = Math.sin(angle) * 2.5;

      const bench = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.5), woodMat);
      bench.position.set(x, 0.6, z);
      bench.rotation.y = angle;
      group.add(bench);

      const benchLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.4), woodMat);
      benchLeg1.position.set(x - Math.cos(angle) * 0.5, 0.35, z - Math.sin(angle) * 0.5);
      group.add(benchLeg1);
    }

    // Center piece
    const center = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1, 8), stoneMat);
    center.position.y = 0.9;
    group.add(center);

    return group;
  }

  // Load model function
  function loadModel(modelId) {
    viewerLoading.classList.remove('hidden');

    // Remove current model
    if (currentModel) {
      scene.remove(currentModel);
      currentModel = null;
    }

    // Create procedural model based on ID
    setTimeout(() => {
      let model;
      switch (modelId) {
        case 'modern-house':
          model = createModernHouse();
          break;
        case 'office-tower':
          model = createOfficeTower();
          camera.position.set(12, 10, 12);
          break;
        case 'pavilion':
          model = createPavilion();
          camera.position.set(10, 6, 10);
          break;
        default:
          model = createModernHouse();
      }

      scene.add(model);
      currentModel = model;
      modelViewer.currentModel = model;

      // Reset view
      controls.target.set(0, 2, 0);
      controls.update();

      viewerLoading.classList.add('hidden');
    }, 500);
  }

  // Render model thumbnails
  function renderThumbnails() {
    thumbnailsContainer.innerHTML = MODELS_3D.map((model, index) => `
      <div class="model-thumb ${index === 0 ? 'active' : ''}" data-model="${model.id}">
        <div class="model-thumb-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="model-thumb-info">
          <h5>${model.name}</h5>
          <span>${model.description}</span>
        </div>
      </div>
    `).join('');

    // Add click handlers
    thumbnailsContainer.querySelectorAll('.model-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbnailsContainer.querySelectorAll('.model-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        loadModel(thumb.dataset.model);
      });
    });
  }

  // Control buttons
  document.getElementById('reset-view')?.addEventListener('click', () => {
    camera.position.set(8, 6, 8);
    controls.target.set(0, 2, 0);
    controls.update();
  });

  document.getElementById('toggle-rotate')?.addEventListener('click', (e) => {
    controls.autoRotate = !controls.autoRotate;
    e.currentTarget.classList.toggle('active', controls.autoRotate);
  });

  document.getElementById('toggle-wireframe')?.addEventListener('click', (e) => {
    isWireframe = !isWireframe;
    e.currentTarget.classList.toggle('active', isWireframe);

    if (currentModel) {
      currentModel.traverse((child) => {
        if (child.isMesh) {
          child.material.wireframe = isWireframe;
        }
      });
    }
  });

  // Initialize
  renderThumbnails();
  loadModel('modern-house');

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Handle resize
  const resizeObserver = new ResizeObserver(() => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  });
  resizeObserver.observe(canvas.parentElement);
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.scroll-fade').forEach(el => observer.observe(el));
  document.querySelectorAll('.about-text, .skills-section').forEach(el => {
    el.classList.add('scroll-fade');
    observer.observe(el);
  });
}

// ============================================
// DATA LOADING
// ============================================
async function loadProfile() {
  try {
    const response = await fetch(`${API_BASE}/profile`);
    profile = await response.json();
    renderProfile();
  } catch (error) {
    renderFallbackProfile();
  }
}

function renderProfile() {
  if (!profile) return;
  bioText.textContent = profile.bio;
  locationText.textContent = profile.location;
  educationList.innerHTML = profile.education.map(edu => `<li>${edu}</li>`).join('');
  skillsGrid.innerHTML = profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
  contactEmail.href = `mailto:${profile.email}`;
}

function renderFallbackProfile() {
  const fallback = {
    bio: "Passionate architecture student with a focus on sustainable design and urban planning. I believe in creating spaces that harmonize with nature while serving human needs.",
    location: "New York, NY",
    email: "alexandra.chen@example.com",
    education: ["M.Arch - Columbia University (2024)", "B.Arch - Cornell University (2022)"],
    skills: ["AutoCAD", "Revit", "SketchUp", "Rhino 3D", "Adobe Creative Suite", "Sustainable Design", "3D Modeling", "Hand Sketching"]
  };
  bioText.textContent = fallback.bio;
  locationText.textContent = fallback.location;
  educationList.innerHTML = fallback.education.map(edu => `<li>${edu}</li>`).join('');
  skillsGrid.innerHTML = fallback.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
  contactEmail.href = `mailto:${fallback.email}`;
}

async function loadProjects() {
  try {
    const response = await fetch(`${API_BASE}/projects`);
    allProjects = await response.json();
    allProjects = allProjects.map(p => ({ ...p, image: PROJECT_IMAGES[p.id] || PROJECT_IMAGES[1] }));
    renderProjects(allProjects);
    await loadCategories();
  } catch (error) {
    renderFallbackProjects();
  }
}

async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    const data = await response.json();
    renderFilterButtons(data.categories);
  } catch (error) {}
}

function renderFilterButtons(categories) {
  filterButtons.innerHTML = `
    <button class="filter-btn active" data-category="all">All</button>
    ${categories.map(cat => `<button class="filter-btn" data-category="${cat.toLowerCase()}">${cat}</button>`).join('')}
  `;
}

function renderProjects(projects) {
  projectsGrid.innerHTML = projects.map(project => `
    <div class="project-card scroll-fade" data-id="${project.id}">
      <div class="project-image">
        <img src="${project.image}" alt="${project.title}" loading="lazy" />
      </div>
      <div class="project-info">
        <span class="project-category">${project.category}</span>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openProjectModal(parseInt(card.dataset.id)));
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.project-card').forEach((el, index) => {
    el.style.animationDelay = `${index * 0.1}s`;
    observer.observe(el);
  });
}

function renderFallbackProjects() {
  allProjects = [
    { id: 1, title: "Urban Eco-Housing Complex", description: "A sustainable residential complex with green roofs and solar panels.", category: "Residential", year: 2024, image: PROJECT_IMAGES[1], details: "This 50-unit housing complex integrates passive solar design and vertical gardens." },
    { id: 2, title: "Cultural Arts Center", description: "A community arts center with flexible exhibition spaces.", category: "Cultural", year: 2023, image: PROJECT_IMAGES[2], details: "Includes galleries, workshop spaces, and a 200-seat theater." },
    { id: 3, title: "Waterfront Pavilion", description: "A minimalist pavilion design for waterfront relaxation.", category: "Public Space", year: 2023, image: PROJECT_IMAGES[3], details: "Uses recycled materials with a retractable canopy system." },
    { id: 4, title: "Mountain Retreat Cabin", description: "A modern cabin blending with the natural landscape.", category: "Residential", year: 2024, image: PROJECT_IMAGES[4], details: "Built with locally-sourced timber and floor-to-ceiling windows." },
    { id: 5, title: "Urban Library Renovation", description: "Historic building transformed into a modern library.", category: "Cultural", year: 2022, image: PROJECT_IMAGES[5], details: "Preserves the original facade with contemporary reading spaces." },
    { id: 6, title: "Sustainable Office Tower", description: "A net-zero energy office building.", category: "Commercial", year: 2024, image: PROJECT_IMAGES[6], details: "Features dynamic shading and integrated wind turbines." }
  ];
  renderProjects(allProjects);
  renderFilterButtons(["Residential", "Cultural", "Public Space", "Commercial"]);
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
  filterButtons.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      const category = e.target.dataset.category;
      renderProjects(category === 'all' ? allProjects : allProjects.filter(p => p.category.toLowerCase() === category));
    }
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuToggle.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual && scrolled < window.innerHeight) {
      heroVisual.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
  });
}

// ============================================
// MODAL
// ============================================
function openProjectModal(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;

  document.getElementById('modal-category').textContent = project.category;
  document.getElementById('modal-title').textContent = project.title;
  document.getElementById('modal-description').textContent = project.description;
  document.getElementById('modal-details').textContent = project.details || '';
  document.getElementById('modal-year').textContent = `Year: ${project.year}`;

  const modalImg = document.getElementById('modal-img');
  modalImg.src = project.image;
  modalImg.alt = project.title;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}
