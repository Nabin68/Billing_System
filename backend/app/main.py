from fastapi import FastAPI
from app.core.database import Base, engine
from app.routes import items, purchases, sales, reports
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bibek & Nabin Traders Billing System")
app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")


app.include_router(items.router)
app.include_router(purchases.router)
app.include_router(sales.router)
app.include_router(reports.router)


@app.get("/")
def serve_frontend():
    return FileResponse("static/index.html")

@app.get("/")
def root():
    return {"status": "Backend is running"}
