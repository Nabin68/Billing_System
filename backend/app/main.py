
from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from app.core.database import Base, engine
from app.routes import items, purchases, sales, reports
from fastapi.staticfiles import StaticFiles # type: ignore
from fastapi.responses import FileResponse # type: ignore
import os
from app.routes import credits


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bibek & Nabin Traders Billing System")

# 🔴 ADD THIS CORS MIDDLEWARE BLOCK
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

# Routers
app.include_router(items.router)
app.include_router(purchases.router)
app.include_router(sales.router)
app.include_router(reports.router)
app.include_router(credits.router)

@app.get("/")
def serve_frontend():
    return FileResponse("static/index.html")

@app.get("/health")
def root():
    return {"status": "Backend is running"}
