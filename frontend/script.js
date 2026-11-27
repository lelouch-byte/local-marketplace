// Обновленные тестовые данные (добавили описание, дату и ссылку на ВК)
const adsData = [
    { 
        id: 1, title: "Конспекты по матанализу (1 семестр)", price: 500, category: "study", 
        status: "used", statusText: "Б/У", dealType: "sale", date: "11.10.2023", 
        description: "Подробные конспекты, все лекции и семинары. Писала сама, почерк разборчивый.", 
        vkLink: "https://vk.com/id1" 
    },
    { 
        id: 2, title: "Микроволновка в общагу", price: 1500, category: "dorm", 
        status: "used", statusText: "Б/У", dealType: "sale", date: "10.10.2023", 
        description: "Работает исправно. Продаю, так как переезжаю. Самовывоз из 8 общаги.", 
        vkLink: "https://vk.com/id2" 
    },
    { 
        id: 3, title: "Халат белый лабораторный (56 размер)", price: 0, category: "clothes", 
        status: "new", statusText: "Новое", dealType: "free", date: "09.10.2023", 
        description: "Куплен, но не подошел размер. Отдам даром первокурсникам.", 
        vkLink: "https://vk.com/id3" 
    }
];

const grid = document.getElementById('adsGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

// --- ОТРИСОВКА КАРТОЧЕК ---
function renderAds(ads) {
    grid.innerHTML = ''; 
    if (ads.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center text-muted mt-5"><h4>Ничего не найдено</h4></div>';
        return;
    }
    ads.forEach(ad => {
        const badgeColor = ad.status === 'new' ? 'bg-success' : 'bg-warning text-dark';
        
        // Добавили класс ad-card и data-id для перехвата клика
        const cardHTML = `
            <div class="col">
                <div class="card h-100 shadow-sm ad-card" data-id="${ad.id}" style="cursor: pointer;">
                    <img src="https://via.placeholder.com/300x200?text=Фото+товара" class="card-img-top" alt="${ad.title}">
                    <div class="card-body d-flex flex-column">
                        <span class="badge ${badgeColor} align-self-start mb-2">${ad.statusText}</span>
                        <h5 class="card-title">${ad.title}</h5>
                        <p class="card-text fw-bold fs-5 text-primary mb-1">${ad.price > 0 ? ad.price.toLocaleString('ru-RU') + ' ₽' : 'Бесплатно'}</p>
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
    const map = { 'study': 'Учеба', 'tech': 'Техника', 'dorm': 'Для общаги', 'clothes': 'Одежда' };
    return map[cat] || cat;
}

// --- ФИЛЬТРАЦИЯ ---
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

// --- ЛОГИКА МОДАЛЬНОГО ОКНА ДЕТАЛЬНОГО ПРОСМОТРА (Задача #8) ---
const adDetailModalElement = document.getElementById('adDetailModal');
const adDetailModal = new bootstrap.Modal(adDetailModalElement);

// Делегирование событий: ловим клик по любой карточке
grid.addEventListener('click', function(event) {
    const card = event.target.closest('.ad-card');
    if (!card) return;

    const adId = parseInt(card.dataset.id);
    const ad = adsData.find(item => item.id === adId);
    if (!ad) return;

    // Заполняем модалку данными
    document.getElementById('detailTitle').textContent = ad.title;
    document.getElementById('detailImage').src = "https://via.placeholder.com/800x400?text=Фото+товара";
    document.getElementById('detailPrice').textContent = ad.price > 0 ? ad.price.toLocaleString('ru-RU') + ' ₽' : 'Бесплатно';
    document.getElementById('detailDate').textContent = 'Опубликовано: ' + (ad.date || 'Недавно');
    document.getElementById('detailDescription').textContent = ad.description || 'Описание отсутствует.';
    
    // Бейдж категории
    document.getElementById('detailCategoryBadge').textContent = getCategoryName(ad.category);
    
    // Бейдж типа сделки (настраиваем цвет)
    const dealBadge = document.getElementById('detailDealBadge');
    dealBadge.textContent = getDealTypeName(ad.dealType);
    if (ad.dealType === 'free') dealBadge.className = 'badge bg-success';
    else if (ad.dealType === 'exchange') dealBadge.className = 'badge bg-info text-dark';
    else dealBadge.className = 'badge bg-primary';

    // Ссылка на ВК
    document.getElementById('detailVkLink').href = ad.vkLink || '#';

    // Открываем окно
    adDetailModal.show();
});

function getDealTypeName(type) {
    if (type === 'free') return 'Отдам бесплатно';
    if (type === 'exchange') return 'Обмен';
    return 'Продажа';
}

// --- ЛОГИКА ДЛЯ ФОРМЫ СОЗДАНИЯ (Задача #7) ---
const createAdForm = document.getElementById('createAdForm');
const formError = document.getElementById('formError');
const createAdModal = new bootstrap.Modal(document.getElementById('createAdModal'));

createAdForm.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (!createAdForm.checkValidity()) {
        createAdForm.classList.add('was-validated');
        return;
    }

    // Добавляем новую карточку прямо на страницу
    const formData = {
        id: Date.now(),
        title: document.getElementById('adTitle').value,
        category: document.getElementById('adCategory').value,
        dealType: document.getElementById('adDealType').value,
        price: Number(document.getElementById('adPrice').value),
        vkLink: document.getElementById('adVk').value,
        description: document.getElementById('adDescription').value,
        date: new Date().toLocaleDateString('ru-RU'),
        status: 'new',
        statusText: 'Новое'
    };

    adsData.unshift(formData);
    renderAds(adsData);

    createAdModal.hide();
    createAdForm.reset();
    createAdForm.classList.remove('was-validated');
});

// Запуск
renderAds(adsData);