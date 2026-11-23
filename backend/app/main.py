from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import engine, SessionLocal
from app.db.base import Base  # Базовый класс declarative_base(), где импортированы все модели
from app.db.init_db import init_categories


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Создание всех таблиц в БД при старте
    Base.metadata.create_all(bind=engine)

    # Заполнение базовых категорий, если таблица пуста
    db = SessionLocal()
    try:
        init_categories(db)
    finally:
        db.close()

    yield


app = FastAPI(title="Backend API", lifespan=lifespan)

# Настройка CORS для локальной разработки (React, Vite, Vue, Next.js)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
