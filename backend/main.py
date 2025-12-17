from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Architecture Portfolio API")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Data models
class Project(BaseModel):
    id: int
    title: str
    description: str
    category: str
    year: int
    image: str
    details: Optional[str] = None


class Profile(BaseModel):
    name: str
    title: str
    bio: str
    email: str
    location: str
    education: List[str]
    skills: List[str]


# Sample data for architecture portfolio
PROFILE = Profile(
    name="Alexandra Chen",
    title="Architecture Student & Designer",
    bio="Passionate architecture student with a focus on sustainable design and urban planning. I believe in creating spaces that harmonize with nature while serving human needs. Currently pursuing my Master's in Architecture with a specialization in eco-friendly residential design.",
    email="alexandra.chen@example.com",
    location="New York, NY",
    education=[
        "M.Arch - Columbia University (2024)",
        "B.Arch - Cornell University (2022)"
    ],
    skills=[
        "AutoCAD",
        "Revit",
        "SketchUp",
        "Rhino 3D",
        "Adobe Creative Suite",
        "Sustainable Design",
        "3D Modeling",
        "Hand Sketching"
    ]
)

PROJECTS = [
    Project(
        id=1,
        title="Urban Eco-Housing Complex",
        description="A sustainable residential complex designed with green roofs, solar panels, and rainwater harvesting systems.",
        category="Residential",
        year=2024,
        image="/images/project1.jpg",
        details="This 50-unit housing complex integrates passive solar design, vertical gardens, and community spaces to create a sustainable urban living environment."
    ),
    Project(
        id=2,
        title="Cultural Arts Center",
        description="A community arts center featuring flexible exhibition spaces and an outdoor amphitheater.",
        category="Cultural",
        year=2023,
        image="/images/project2.jpg",
        details="Designed to serve as a cultural hub, this center includes galleries, workshop spaces, a 200-seat theater, and landscaped public plazas."
    ),
    Project(
        id=3,
        title="Waterfront Pavilion",
        description="A minimalist pavilion design for waterfront relaxation and community gatherings.",
        category="Public Space",
        year=2023,
        image="/images/project3.jpg",
        details="This floating pavilion uses recycled materials and features a retractable canopy system that responds to weather conditions."
    ),
    Project(
        id=4,
        title="Mountain Retreat Cabin",
        description="A modern cabin design that blends with the natural mountain landscape.",
        category="Residential",
        year=2024,
        image="/images/project4.jpg",
        details="Built with locally-sourced timber, this cabin features floor-to-ceiling windows and a cantilevered deck overlooking the valley."
    ),
    Project(
        id=5,
        title="Urban Library Renovation",
        description="Transformation of a historic building into a modern public library.",
        category="Cultural",
        year=2022,
        image="/images/project5.jpg",
        details="This adaptive reuse project preserves the original facade while creating contemporary reading spaces and a rooftop garden."
    ),
    Project(
        id=6,
        title="Sustainable Office Tower",
        description="A net-zero energy office building with innovative facade design.",
        category="Commercial",
        year=2024,
        image="/images/project6.jpg",
        details="The tower features a dynamic shading system, integrated wind turbines, and a biophilic interior design approach."
    )
]


@app.get("/")
async def root():
    return {"message": "Architecture Portfolio API", "version": "1.0.0"}


@app.get("/api/profile", response_model=Profile)
async def get_profile():
    """Get the portfolio owner's profile information."""
    return PROFILE


@app.get("/api/projects", response_model=List[Project])
async def get_projects(category: Optional[str] = None):
    """Get all projects, optionally filtered by category."""
    if category:
        return [p for p in PROJECTS if p.category.lower() == category.lower()]
    return PROJECTS


@app.get("/api/projects/{project_id}", response_model=Project)
async def get_project(project_id: int):
    """Get a specific project by ID."""
    for project in PROJECTS:
        if project.id == project_id:
            return project
    return {"error": "Project not found"}


@app.get("/api/categories")
async def get_categories():
    """Get all unique project categories."""
    categories = list(set(p.category for p in PROJECTS))
    return {"categories": sorted(categories)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
