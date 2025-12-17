// API base URL - set this to your Render backend URL after deployment
// Example: 'https://architecture-portfolio-api.onrender.com/api'
// Leave as '/api' for local development, or null to use static data only
const API_BASE = window.PORTFOLIO_API_URL || '/api';

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

// State
let allProjects = [];
let profile = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadProfile(), loadProjects()]);
  setupEventListeners();
});

// Load profile data
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

// Render profile
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
  document.querySelector('.hero-title').innerHTML = `Creating Spaces<br>That Inspire`;
}

// Fallback profile for when API is not available (static deployment)
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

// Load projects
async function loadProjects() {
  try {
    const response = await fetch(`${API_BASE}/projects`);
    allProjects = await response.json();
    renderProjects(allProjects);
    await loadCategories();
  } catch (error) {
    console.error('Error loading projects:', error);
    renderFallbackProjects();
  }
}

// Load categories
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    const data = await response.json();
    renderFilterButtons(data.categories);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

// Render filter buttons
function renderFilterButtons(categories) {
  filterButtons.innerHTML = `
    <button class="filter-btn active" data-category="all">All</button>
    ${categories.map(cat => `
      <button class="filter-btn" data-category="${cat.toLowerCase()}">${cat}</button>
    `).join('')}
  `;
}

// Render projects
function renderProjects(projects) {
  projectsGrid.innerHTML = projects.map(project => `
    <div class="project-card" data-id="${project.id}">
      <div class="project-image">
        <div class="project-placeholder ${getCategoryClass(project.category)}">
          ${getProjectInitials(project.title)}
        </div>
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
}

// Fallback projects (static deployment - full portfolio data)
function renderFallbackProjects() {
  allProjects = [
    {
      id: 1,
      title: "Urban Eco-Housing Complex",
      description: "A sustainable residential complex designed with green roofs, solar panels, and rainwater harvesting systems.",
      category: "Residential",
      year: 2024,
      details: "This 50-unit housing complex integrates passive solar design, vertical gardens, and community spaces to create a sustainable urban living environment."
    },
    {
      id: 2,
      title: "Cultural Arts Center",
      description: "A community arts center featuring flexible exhibition spaces and an outdoor amphitheater.",
      category: "Cultural",
      year: 2023,
      details: "Designed to serve as a cultural hub, this center includes galleries, workshop spaces, a 200-seat theater, and landscaped public plazas."
    },
    {
      id: 3,
      title: "Waterfront Pavilion",
      description: "A minimalist pavilion design for waterfront relaxation and community gatherings.",
      category: "Public Space",
      year: 2023,
      details: "This floating pavilion uses recycled materials and features a retractable canopy system that responds to weather conditions."
    },
    {
      id: 4,
      title: "Mountain Retreat Cabin",
      description: "A modern cabin design that blends with the natural mountain landscape.",
      category: "Residential",
      year: 2024,
      details: "Built with locally-sourced timber, this cabin features floor-to-ceiling windows and a cantilevered deck overlooking the valley."
    },
    {
      id: 5,
      title: "Urban Library Renovation",
      description: "Transformation of a historic building into a modern public library.",
      category: "Cultural",
      year: 2022,
      details: "This adaptive reuse project preserves the original facade while creating contemporary reading spaces and a rooftop garden."
    },
    {
      id: 6,
      title: "Sustainable Office Tower",
      description: "A net-zero energy office building with innovative facade design.",
      category: "Commercial",
      year: 2024,
      details: "The tower features a dynamic shading system, integrated wind turbines, and a biophilic interior design approach."
    }
  ];
  renderProjects(allProjects);
  renderFilterButtons(["Residential", "Cultural", "Public Space", "Commercial"]);
}

// Get category CSS class
function getCategoryClass(category) {
  const classes = {
    'residential': 'residential',
    'cultural': 'cultural',
    'public space': 'public-space',
    'commercial': 'commercial'
  };
  return classes[category.toLowerCase()] || 'residential';
}

// Get project initials for placeholder
function getProjectInitials(title) {
  return title.split(' ').slice(0, 2).map(word => word[0]).join('');
}

// Setup event listeners
function setupEventListeners() {
  // Filter buttons
  filterButtons.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      // Update active state
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      // Filter projects
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
}

// Open project modal
function openProjectModal(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;

  document.getElementById('modal-category').textContent = project.category;
  document.getElementById('modal-title').textContent = project.title;
  document.getElementById('modal-description').textContent = project.description;
  document.getElementById('modal-details').textContent = project.details || '';
  document.getElementById('modal-year').textContent = `Year: ${project.year}`;

  const placeholder = document.getElementById('modal-placeholder');
  placeholder.className = `project-placeholder ${getCategoryClass(project.category)}`;
  placeholder.textContent = getProjectInitials(project.title);

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}
