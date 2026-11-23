from sqlalchemy.orm import Session
from app.models.category import Category  # Импортируйте вашу модель Category

DEFAULT_CATEGORIES = [
    {"name": "Еда и напитки", "slug": "food-and-drinks"},
    {"name": "Транспорт", "slug": "transport"},
    {"name": "Жилье", "slug": "housing"},
    {"name": "Развлечения", "slug": "entertainment"},
    {"name": "Здоровье", "slug": "health"},
]


def init_categories(db: Session) -> None:
    if db.query(Category).first() is None:
        categories = [Category(**data) for data in DEFAULT_CATEGORIES]
        db.add_all(categories)
        db.commit()
