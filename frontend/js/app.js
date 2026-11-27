const API_URL = '/api/v1/ads'; // Базовый URL к API бэкенда

// Элементы DOM
const grid = document.getElementById('adsGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const loadingSpinner = document.getElementById('loadingSpinner');
const networkError = document.getElementById('networkError');

let adsData = []; // Здесь будем хранить данные с сервера

// --- 1. ЗАГРУЗКА ДАННЫХ (GET) ---
async function fetchAds() {
    // Показываем спиннер, прячем ошибки и старую сетку
    grid.innerHTML = '';
    networkError.classList.add('d-none');
    loadingSpinner.classList.remove('d-none');

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Ошибка сервера: ' + response.status);
        }

        adsData = await response.json(); // Получаем массив объявлений
        
        // Обработка пустых данных
        if (adsData.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center text-muted mt-5"><h4>Пока нет объявлений. Станьте первым!</h4></div>';
        } else {
            renderAds(adsData);
        }

    } catch (error) {
        console.error('Ошибка загрузки:', error);
        networkError.classList.remove('d-none'); // Показываем оповещение об ошибке
    } finally {
        loadingSpinner.classList.add('d-none'); // Прячем спиннер в любом случае
    }
}

// --- 2. ОТРИСОВКА КАРТОЧЕК ---
function renderAds(ads) {
    grid.innerHTML = ''; 
    if (ads.length === 0) return;

    ads.forEach(ad => {
        // Бэкенд может отдавать статус как boolean или строку. Подстраиваемся.
        const isNew = ad.is_new || ad.status === 'new'; 
        const badgeColor = isNew ? 'bg-success' : 'bg-warning text-dark';
        const statusText = isNew ? 'Новое' : 'Б/У';

        const cardHTML = `
            <div class="col">
                <div class="card h-100 shadow-sm ad-card" data-id="${ad.id}" style="cursor: pointer;">
                    <img src="${ad.image_url || 'https://via.placeholder.com/300x200?text=Фото+товара'}" class="card-img-top" alt="${ad.title}">
                    <div class="card-body d-flex flex-column">
                        <span class="badge ${badgeColor} align-self-start mb-2">${statusText}</span>
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
    return map[cat] || cat || 'Разное';
}

// --- 3. ФИЛЬТРАЦИЯ (Клиентская) ---
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

// --- 4. МОДАЛЬНОЕ ОКНО ДЕТАЛЕЙ ---
const adDetailModal = new bootstrap.Modal(document.getElementById('adDetailModal'));

grid.addEventListener('click', function(event) {
    const card = event.target.closest('.ad-card');
    if (!card) return;

    const adId = parseInt(card.dataset.id);
    // Ищем объявление в локальном массиве (чтобы не делать лишний GET запрос)
    const ad = adsData.find(item => item.id === adId);
    if (!ad) return;

    document.getElementById('detailTitle').textContent = ad.title;
    document.getElementById('detailImage').src = ad.image_url || "https://via.placeholder.com/800x400?text=Фото+товара";
    document.getElementById('detailPrice').textContent = ad.price > 0 ? ad.price.toLocaleString('ru-RU') + ' ₽' : 'Бесплатно';
    document.getElementById('detailDate').textContent = 'Опубликовано: ' + (ad.created_at ? new Date(ad.created_at).toLocaleDateString('ru-RU') : 'Недавно');
    document.getElementById('detailDescription').textContent = ad.description || 'Описание отсутствует.';
    document.getElementById('detailCategoryBadge').textContent = getCategoryName(ad.category);
    
    const dealBadge = document.getElementById('detailDealBadge');
    dealBadge.textContent = getDealTypeName(ad.deal_type);
    dealBadge.className = ad.deal_type === 'free' ? 'badge bg-success' : (ad.deal_type === 'exchange' ? 'badge bg-info text-dark' : 'badge bg-primary');

    document.getElementById('detailVkLink').href = ad.vk_link || '#';

    adDetailModal.show();
});

function getDealTypeName(type) {
    if (type === 'free') return 'Отдам бесплатно';
    if (type === 'exchange') return 'Обмен';
    return 'Продажа';
}

// --- 5. ОТПРАВКА ФОРМЫ (POST) ---
const createAdForm = document.getElementById('createAdForm');
const formError = document.getElementById('formError');
const createAdModal = new bootstrap.Modal(document.getElementById('createAdModal'));

createAdForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    event.stopPropagation();
    formError.classList.add('d-none');

    if (!createAdForm.checkValidity()) {
        createAdForm.classList.add('was-validated');
        return;
    }

    // Собираем данные в формате JSON (ключи должны совпадать с тем, что ждет бэкенд)
    const payload = {
        title: document.getElementById('adTitle').value,
        category: document.getElementById('adCategory').value,
        deal_type: document.getElementById('adDealType').value,
        price: Number(document.getElementById('adPrice').value),
        vk_link: document.getElementById('adVk').value,
        description: document.getElementById('adDescription').value
    };

    // Блокируем кнопку отправки, чтобы не было двойных кликов
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // Если сервер ответил 201 Created (успех)
        if (response.status === 201) {
            createAdModal.hide();
            createAdForm.reset();
            createAdForm.classList.remove('was-validated');
            
            // Обновляем витрину (перезапрашиваем данные с сервера)
            fetchAds(); 
        } else {
            throw new Error('Ошибка при создании: ' + response.status);
        }
    } catch (error) {
        console.error('Ошибка отправки:', error);
        formError.classList.remove('d-none'); // Показываем ошибку в модалке
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Опубликовать';
    }
});

// ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', fetchAds);