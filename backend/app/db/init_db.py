from sqlalchemy.orm import Session
from app.models.category import Category  # Импортируйте вашу модель Category

DEFAULT_CATEGORIES = [
    {"name": "Бытовая электроника", "slug": "consumer-electronic"},
    {"name": "Смарт-устройства", "slug": "computers"},
    {"name": "Учебные пособия", "slug": "study-guides"},
    {"name": "Канцелярия", "slug": "chancellery"},
    {"name": "Литература", "slug": "literature"},
    {"name": "Посуда", "slug": "dishes"},
    {"name": "Одежда", "slug": "clothes"}
]


def init_categories(db: Session) -> None:
    if db.query(Category).first() is None:
        categories = [Category(**data) for data in DEFAULT_CATEGORIES]
        db.add_all(categories)
        db.commit()
