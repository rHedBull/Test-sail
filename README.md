# Paula Keßler Real Estate Portfolio

A premium real estate portfolio website showcasing exceptional properties with interactive 3D tours, featuring a FastAPI backend and a Vite-powered frontend with Three.js 3D visualizations.

## Project Structure

```
├── backend/                # FastAPI backend server
│   ├── main.py            # API endpoints and data models
│   └── requirements.txt   # Python dependencies
├── frontend/              # Vite frontend application
│   ├── index.html         # Main HTML file
│   ├── package.json       # npm dependencies
│   ├── vite.config.js     # Vite configuration
│   └── src/
│       ├── main.js        # JavaScript logic
│       └── style.css      # Styling
└── README.md
```

## Features

- **Interactive 3D Property Tours**: Explore properties with immersive Three.js 3D models
- **Orange-to-Green Gradient Design**: Modern, vibrant color scheme
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dynamic Content**: Property listings and profile loaded from FastAPI backend
- **Property Filtering**: Filter properties by category (Residential, Luxury, Commercial, etc.)
- **Modal Details**: Click on properties to see detailed information with pricing
- **Smooth Animations**: Professional animations for enhanced user experience
- **Modern Aesthetic**: Clean, elegant design perfect for premium real estate

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/api/profile` | GET | Get real estate agent's profile |
| `/api/projects` | GET | Get all properties (optional `?category=` filter) |
| `/api/projects/{id}` | GET | Get specific property by ID |
| `/api/categories` | GET | Get all property categories |

## Customization

### Adding Paula's Profile Picture

To add Paula's LinkedIn profile photo:

1. **Download the photo from LinkedIn:**
   - Visit [Paula's LinkedIn profile](https://www.linkedin.com/in/paula-marie-ke%C3%9Fler-b5bb3b272)
   - Right-click on her profile picture and save it

2. **Add to the project:**
   - Save the image as `paula-profile.jpg` in the `frontend/public/` directory
   - Or update the image path in `frontend/index.html` (line 60):
     ```html
     <img id="profile-photo" src="/your-image-name.jpg" alt="Paula Keßler">
     ```

3. **Alternative - Use a direct URL:**
   - If you have a direct image URL, update line 60 in `frontend/index.html`:
     ```html
     <img id="profile-photo" src="https://your-image-url.com/photo.jpg" alt="Paula Keßler">
     ```

The photo will display with an orange-to-green gradient border matching the site theme.

### Updating Profile Information
Edit the fallback profile in `frontend/src/main.js` (lines 573-586) to update:
- Agent name and bio
- Contact email and location
- Professional credentials
- Skills and expertise

### Adding Properties
Add new property listings to the `renderFallbackProjects()` function in `frontend/src/main.js`:
```javascript
{
  id: 7,
  title: "Your Property Title",
  description: "Brief description",
  category: "Category",
  year: 2024,
  image: PROJECT_IMAGES[1],
  details: "Full details with pricing..."
}
```

### Styling
The site features an orange-to-green gradient theme. Modify CSS variables in `frontend/src/style.css`:
```css
:root {
  --color-primary: #2d2d2d;
  --color-secondary: #ff6b35;  /* Orange */
  --color-accent: #4ecb71;     /* Green */
  --gradient-main: linear-gradient(135deg, #ff6b35 0%, #ff8c42 25%, #ffa500 50%, #95d5b2 75%, #52b788 100%);
  /* ... */
}
```

## Free Deployment (Render)

Deploy this portfolio for free using Render's one-click deploy:

### Option 1: Static Site Only (Easiest)

The frontend works standalone with built-in portfolio data - no backend needed!

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **New** → **Static Site**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Click **Create Static Site**

Your site will be live at `https://your-site-name.onrender.com`

### Option 2: Full Stack Deploy (One-Click)

Deploy both frontend and backend using the included `render.yaml`:

1. Go to [render.com](https://render.com) and sign up
2. Click **New** → **Blueprint**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and deploy both services

Note: Free tier backend sleeps after 15 minutes of inactivity (~30s wake time).

### Vercel Deployment (Recommended)

**One-Click Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rHedBull/Test-sail&project-name=paula-kessler-real-estate&repository-name=paula-kessler-real-estate&root-directory=frontend)

**Or Manual Deploy:**

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project" and import your GitHub repository
3. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click "Deploy"

Your site will be live at `https://your-project-name.vercel.app`

**Important:** After deploying, add Paula's profile picture:
1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab or add the image to `frontend/public/`
3. Redeploy if needed

## Tech Stack

- **Backend**: FastAPI, Uvicorn, Pydantic
- **Frontend**: Vite, Vanilla JavaScript, CSS3
- **3D Graphics**: Three.js, OrbitControls
- **Fonts**: Playfair Display, Inter (Google Fonts)
- **Deployment**: Vercel (frontend), Render (optional backend)

## License

MIT License
