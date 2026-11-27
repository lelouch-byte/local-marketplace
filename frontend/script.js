const adsData = [
    { id: 1, title: "Конспекты по матанализу (1 семестр)", price: 500, category: "study", status: "used", statusText: "Б/У" },
    { id: 2, title: "Микроволновка в общагу", price: 1500, category: "dorm", status: "used", statusText: "Б/У" },
    { id: 3, title: "Халат белый лабораторный (56 размер)", price: 800, category: "clothes", status: "new", statusText: "Новое" },
    { id: 4, title: "Инженерный калькулятор", price: 2000, category: "study", status: "used", statusText: "Б/У" },
    { id: 5, title: "Худи с логотипом ТПУ", price: 2500, category: "clothes", status: "new", statusText: "Новое" },
    { id: 6, title: "Монитор 24 дюйма для учебы", price: 7000, category: "tech", status: "used", statusText: "Б/У" },
    { id: 7, title: "Учебник по физике Иродова", price: 400, category: "study", status: "used", statusText: "Б/У" },
    { id: 8, title: "Настольная лампа (общага)", price: 350, category: "dorm", status: "used", statusText: "Б/У" }
];

const grid = document.getElementById('adsGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

function renderAds(ads) {
    grid.innerHTML = ''; 
    if (ads.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center text-muted mt-5"><h4>Ничего не найдено</h4></div>';
        return;
    }
    ads.forEach(ad => {
        const badgeColor = ad.status === 'new' ? 'bg-success' : 'bg-warning text-dark';
        const cardHTML = `
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <img src="https://via.placeholder.com/300x200?text=Фото+товара" class="card-img-top" alt="${ad.title}">
                    <div class="card-body d-flex flex-column">
                        <span class="badge ${badgeColor} align-self-start mb-2">${ad.statusText}</span>
                        <h5 class="card-title">${ad.title}</h5>
                        <p class="card-text fw-bold fs-5 text-primary mb-1">${ad.price.toLocaleString('ru-RU')} ₽</p>
                        <p class="card-text text-muted small mb-3">Категория: ${getCategoryName(ad.category)}</p>
                        <button class="btn btn-outline-primary mt-auto w-100">Подробнее</button>
                    </div>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function getCategoryName(cat) {
    const map = {
        'study': 'Учеба',
        'tech': 'Техника',
        'dorm': 'Для общаги',
        'clothes': 'Одежда'
    };
    return map[cat] || cat;
}

function filterAds() {
    const query = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const filtered = adsData.filter(ad => {
        const matchesSearch = ad.title.toLowerCase().includes(query);
        const matchesCategory = category === 'all' || ad.category === category;
        return matchesSearch && matchesCategory;
    });
    renderAds(filtered);
}

searchInput.addEventListener('input', filterAds);
categoryFilter.addEventListener('change', filterAds);
renderAds(adsData);