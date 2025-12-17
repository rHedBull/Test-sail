// API base URL - set this to your Render backend URL after deployment
// Example: 'https://architecture-portfolio-api.onrender.com/api'
// Leave as '/api' for local development, or null to use static data only
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

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize 3D scene
  init3DScene();

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
// THREE.JS 3D BUILDING
// ============================================
function init3DScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });

  renderer.setSize(500, 500);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Create modern building group
  const buildingGroup = new THREE.Group();

  // Materials
  const glassMaterial = new THREE.MeshPhongMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.7,
    shininess: 100
  });

  const concreteMaterial = new THREE.MeshPhongMaterial({
    color: 0x8b7355,
    flatShading: true
  });

  const accentMaterial = new THREE.MeshPhongMaterial({
    color: 0xc9a86c,
    shininess: 80
  });

  // Main tower
  const towerGeometry = new THREE.BoxGeometry(2, 5, 2);
  const tower = new THREE.Mesh(towerGeometry, glassMaterial);
  tower.position.y = 2.5;
  buildingGroup.add(tower);

  // Secondary tower
  const tower2Geometry = new THREE.BoxGeometry(1.5, 3.5, 1.5);
  const tower2 = new THREE.Mesh(tower2Geometry, concreteMaterial);
  tower2.position.set(1.8, 1.75, 0);
  buildingGroup.add(tower2);

  // Base platform
  const baseGeometry = new THREE.BoxGeometry(5, 0.3, 4);
  const base = new THREE.Mesh(baseGeometry, accentMaterial);
  base.position.y = -0.15;
  buildingGroup.add(base);

  // Canopy/overhang
  const canopyGeometry = new THREE.BoxGeometry(3, 0.1, 2.5);
  const canopy = new THREE.Mesh(canopyGeometry, accentMaterial);
  canopy.position.set(0, 1.5, 1.5);
  buildingGroup.add(canopy);

  // Floating elements (architectural details)
  for (let i = 0; i < 5; i++) {
    const detailGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const detail = new THREE.Mesh(detailGeometry, accentMaterial);
    detail.position.set(-0.9 + i * 0.45, 3 + Math.sin(i) * 0.3, 1.05);
    buildingGroup.add(detail);
  }

  // Add wireframe outline for modern look
  const wireframeGeometry = new THREE.BoxGeometry(2.1, 5.1, 2.1);
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xc9a86c,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
  wireframe.position.y = 2.5;
  buildingGroup.add(wireframe);

  scene.add(buildingGroup);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xc9a86c, 0.5);
  pointLight.position.set(-5, 5, 5);
  scene.add(pointLight);

  // Camera position
  camera.position.set(4, 3, 6);
  camera.lookAt(0, 2, 0);

  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Smooth rotation based on mouse
    targetRotationY = mouseX * 0.3;
    targetRotationX = mouseY * 0.1;

    buildingGroup.rotation.y += (targetRotationY - buildingGroup.rotation.y) * 0.05;
    buildingGroup.rotation.x += (targetRotationX - buildingGroup.rotation.x) * 0.05;

    // Subtle floating animation
    buildingGroup.position.y = Math.sin(Date.now() * 0.001) * 0.1;

    renderer.render(scene, camera);
  }

  animate();

  // Handle resize
  function handleResize() {
    const size = Math.min(500, window.innerWidth - 48);
    renderer.setSize(size, size);
  }

  window.addEventListener('resize', handleResize);
  handleResize();
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
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe all scroll-fade elements
  document.querySelectorAll('.scroll-fade').forEach(el => {
    observer.observe(el);
  });

  // Add scroll-fade to about content
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
    console.error('Error loading profile:', error);
    renderFallbackProfile();
  }
}

function renderProfile() {
  if (!profile) return;

  bioText.textContent = profile.bio;
  locationText.textContent = profile.location;

  educationList.innerHTML = profile.education
    .map(edu => `<li>${edu}</li>`)
    .join('');

  skillsGrid.innerHTML = profile.skills
    .map(skill => `<span class="skill-tag">${skill}</span>`)
    .join('');

  contactEmail.href = `mailto:${profile.email}`;
}

function renderFallbackProfile() {
  const fallback = {
    bio: "Passionate architecture student with a focus on sustainable design and urban planning. I believe in creating spaces that harmonize with nature while serving human needs. Currently pursuing my Master's in Architecture with a specialization in eco-friendly residential design.",
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
    // Add images to projects
    allProjects = allProjects.map(p => ({
      ...p,
      image: PROJECT_IMAGES[p.id] || PROJECT_IMAGES[1]
    }));
    renderProjects(allProjects);
    await loadCategories();
  } catch (error) {
    console.error('Error loading projects:', error);
    renderFallbackProjects();
  }
}

async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    const data = await response.json();
    renderFilterButtons(data.categories);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

function renderFilterButtons(categories) {
  filterButtons.innerHTML = `
    <button class="filter-btn active" data-category="all">All</button>
    ${categories.map(cat => `
      <button class="filter-btn" data-category="${cat.toLowerCase()}">${cat}</button>
    `).join('')}
  `;
}

// ============================================
// RENDER PROJECTS WITH IMAGES
// ============================================
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

  // Add click handlers
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openProjectModal(parseInt(card.dataset.id)));
  });

  // Re-observe for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.project-card').forEach((el, index) => {
    el.style.animationDelay = `${index * 0.1}s`;
    observer.observe(el);
  });
}

// Fallback projects with images
function renderFallbackProjects() {
  allProjects = [
    {
      id: 1,
      title: "Urban Eco-Housing Complex",
      description: "A sustainable residential complex designed with green roofs, solar panels, and rainwater harvesting systems.",
      category: "Residential",
      year: 2024,
      image: PROJECT_IMAGES[1],
      details: "This 50-unit housing complex integrates passive solar design, vertical gardens, and community spaces to create a sustainable urban living environment."
    },
    {
      id: 2,
      title: "Cultural Arts Center",
      description: "A community arts center featuring flexible exhibition spaces and an outdoor amphitheater.",
      category: "Cultural",
      year: 2023,
      image: PROJECT_IMAGES[2],
      details: "Designed to serve as a cultural hub, this center includes galleries, workshop spaces, a 200-seat theater, and landscaped public plazas."
    },
    {
      id: 3,
      title: "Waterfront Pavilion",
      description: "A minimalist pavilion design for waterfront relaxation and community gatherings.",
      category: "Public Space",
      year: 2023,
      image: PROJECT_IMAGES[3],
      details: "This floating pavilion uses recycled materials and features a retractable canopy system that responds to weather conditions."
    },
    {
      id: 4,
      title: "Mountain Retreat Cabin",
      description: "A modern cabin design that blends with the natural mountain landscape.",
      category: "Residential",
      year: 2024,
      image: PROJECT_IMAGES[4],
      details: "Built with locally-sourced timber, this cabin features floor-to-ceiling windows and a cantilevered deck overlooking the valley."
    },
    {
      id: 5,
      title: "Urban Library Renovation",
      description: "Transformation of a historic building into a modern public library.",
      category: "Cultural",
      year: 2022,
      image: PROJECT_IMAGES[5],
      details: "This adaptive reuse project preserves the original facade while creating contemporary reading spaces and a rooftop garden."
    },
    {
      id: 6,
      title: "Sustainable Office Tower",
      description: "A net-zero energy office building with innovative facade design.",
      category: "Commercial",
      year: 2024,
      image: PROJECT_IMAGES[6],
      details: "The tower features a dynamic shading system, integrated wind turbines, and a biophilic interior design approach."
    }
  ];
  renderProjects(allProjects);
  renderFilterButtons(["Residential", "Cultural", "Public Space", "Commercial"]);
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
  // Filter buttons
  filterButtons.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      const category = e.target.dataset.category;
      if (category === 'all') {
        renderProjects(allProjects);
      } else {
        const filtered = allProjects.filter(p => p.category.toLowerCase() === category);
        renderProjects(filtered);
      }
    }
  });

  // Modal close
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  menuToggle.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Parallax effect on scroll
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
