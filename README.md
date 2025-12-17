# Architecture Portfolio Website

A modern portfolio website designed for architecture students, featuring a FastAPI backend and a Vite-powered frontend.

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

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dynamic Content**: Projects and profile loaded from FastAPI backend
- **Project Filtering**: Filter projects by category (Residential, Cultural, etc.)
- **Modal Details**: Click on projects to see detailed information
- **Smooth Animations**: Subtle animations for enhanced user experience
- **Modern Aesthetic**: Clean, minimalist design suited for architecture portfolios

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
| `/api/profile` | GET | Get portfolio owner's profile |
| `/api/projects` | GET | Get all projects (optional `?category=` filter) |
| `/api/projects/{id}` | GET | Get specific project by ID |
| `/api/categories` | GET | Get all project categories |

## Customization

### Updating Profile
Edit the `PROFILE` object in `backend/main.py` to update:
- Name and title
- Bio description
- Email and location
- Education history
- Skills list

### Adding Projects
Add new `Project` objects to the `PROJECTS` list in `backend/main.py`:
```python
Project(
    id=7,
    title="Your Project Title",
    description="Brief description",
    category="Category Name",
    year=2024,
    image="/images/project7.jpg",
    details="Extended project details..."
)
```

### Styling
Modify CSS variables in `frontend/src/style.css`:
```css
:root {
  --color-primary: #2d2d2d;
  --color-secondary: #8b7355;
  --color-accent: #c9a86c;
  /* ... */
}
```

## Tech Stack

- **Backend**: FastAPI, Uvicorn, Pydantic
- **Frontend**: Vite, Vanilla JavaScript, CSS3
- **Fonts**: Playfair Display, Inter (Google Fonts)

## License

MIT License
