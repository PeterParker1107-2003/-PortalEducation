/**
 * Каталог курсов на Vue 3
 * Фильтрация, сортировка, поиск
 */

const { createApp, ref, computed, onMounted, watch } = Vue;

const CoursesApp = {
  setup() {
    // ============================================================
    // ДАННЫЕ
    // ============================================================
    const courses = ref([]);
    const loading = ref(true);
    const showAllFilters = ref(false);
    const showMoreCategories = ref(false);
    
    // Активная категория
    const activeCategory = ref('typeProgramming');
    
    // Пагинация
    const perPage = ref(12);
    const currentPage = ref(1);
    
    // Поиск
    const searchQuery = ref('');
    
    // ============================================================
    // КАТЕГОРИИ (табы сверху)
    // ============================================================
    const mainCategories = [
      { id: 'all', label: 'Все курсы', file: 'all_courses_combined.json' },
      { id: 'top', label: 'Топ курсы', file: null, filter: 'top' },
      { id: 'typeProgramming', label: 'Программирование и IT', file: 'courses_adult_programming.json' },
      { id: 'typeDesign', label: 'Дизайн', file: 'courses_adult_design.json' },
      { id: 'typeMarketing', label: 'Маркетинг', file: 'courses_adult_marketing.json' },
      { id: 'typeManagement', label: 'Бизнес и управление', file: 'courses_adult_management.json' },
    ];
    
    const moreCategories = [
      { id: 'typeAnalytics', label: 'Аналитика', file: 'courses_adult_analytics.json' },
      { id: 'typeFinance', label: 'Финансы', file: 'courses_adult_finance.json' },
      { id: 'typeLanguage', label: 'Иностранные языки', file: 'courses_adult_language.json' },
      { id: 'typeNeuralNetworks', label: 'Нейросети', file: 'courses_adult_neuralnetworks.json' },
      { id: 'typeSoftSkills', label: 'Саморазвитие', file: 'courses_adult_softskills.json' },
      { id: 'typeCreativity', label: 'Творчество', file: 'courses_adult_creativity.json' },
      { id: 'typeBeauty', label: 'Красота и здоровье', file: 'courses_adult_beauty.json' },
      { id: 'typePsychology', label: 'Психология', file: 'courses_adult_psychology.json' },
      { id: 'typeSport', label: 'Спорт', file: 'courses_adult_sport.json' },
      { id: 'typePedagogy', label: 'Педагогика', file: 'courses_adult_pedagogy.json' },
    ];
    
    // Все категории вместе
    const allCategories = computed(() => [...mainCategories, ...moreCategories]);
    
    // Фильтры
    const filters = ref({
      categories: [],      // learning_type
      directions: [],      // directions (Python, JavaScript...)
      schools: [],         // school
      levels: [],          // levels (С нуля, С опытом)
      targets: [],         // course_targets (цели)
      priceRange: null,    // диапазон цены
      duration: null,      // срок обучения
      isTopSale: false,    // Лучшее
      isWowEffect: false,  // ВАУ курсы
      jobHelp: false,      // С трудоустройством
      freeOnly: false,     // Бесплатно
      hasInstallment: false, // С рассрочкой
    });
    
    // Сортировка
    const sortBy = ref('popular'); // popular, price_asc, price_desc, rating, newest
    
    // Выпадающие меню
    const openDropdown = ref(null);
    
    // ============================================================
    // КОНФИГУРАЦИЯ
    // ============================================================
    
    // Переключи на false для WordPress
    const IS_LOCAL = true;
    const DATA_PATH = IS_LOCAL 
      ? './data' 
      : '/wp-content/themes/flavor/courses-app/data';
    
    // Категории курсов
    const categoryOptions = [
      { value: 'typeProgramming', label: 'Программирование' },
      { value: 'typeDesign', label: 'Дизайн' },
      { value: 'typeMarketing', label: 'Маркетинг' },
      { value: 'typeAnalytics', label: 'Аналитика' },
      { value: 'typeManagement', label: 'Менеджмент' },
      { value: 'typeFinance', label: 'Финансы' },
      { value: 'typeLanguage', label: 'Иностранные языки' },
      { value: 'typeNeuralNetworks', label: 'Нейросети' },
      { value: 'typeSoftSkills', label: 'Саморазвитие' },
      { value: 'typeCreativity', label: 'Творчество' },
      { value: 'typeBeauty', label: 'Красота и здоровье' },
      { value: 'typePsychology', label: 'Психология' },
    ];
    
    // Уровни
    const levelOptions = [
      { value: 'beginner', label: 'С нуля' },
      { value: 'intermediate', label: 'С опытом' },
      { value: 'advanced', label: 'Продвинутый' },
    ];
    
    // Цели обучения
    const targetOptions = [
      { value: 'learnProfession', label: 'Освоить профессию с нуля' },
      { value: 'developSkills', label: 'Развить навыки' },
      { value: 'professionalRetraining', label: 'Профессиональная переподготовка' },
      { value: 'qualification', label: 'Повышение квалификации' },
      { value: 'hobby', label: 'Найти хобби или узнать новое' },
    ];
    
    // Диапазоны цен
    const priceRangeOptions = [
      { value: 'free', label: 'Бесплатно', min: 0, max: 0 },
      { value: '10-50', label: '10 000 ₽ – 50 000 ₽', min: 10000, max: 50000 },
      { value: '50-100', label: '50 000 ₽ – 100 000 ₽', min: 50000, max: 100000 },
      { value: '100-200', label: '100 000 ₽ – 200 000 ₽', min: 100000, max: 200000 },
      { value: '200+', label: 'от 200 000 ₽', min: 200000, max: Infinity },
    ];
    
    // Сроки обучения
    const durationOptions = [
      { value: 'less1', label: 'Меньше месяца', min: 0, max: 1 },
      { value: '1-3', label: '1 – 3 месяца', min: 1, max: 3 },
      { value: '3-6', label: '3 – 6 месяцев', min: 3, max: 6 },
      { value: '6-12', label: '6 – 12 месяцев', min: 6, max: 12 },
      { value: '12+', label: 'от 12 месяцев', min: 12, max: Infinity },
    ];
    
    // Сортировка
    const sortOptions = [
      { value: 'popular', label: 'По популярности' },
      { value: 'price_asc', label: 'Сначала дешевле' },
      { value: 'price_desc', label: 'Сначала дороже' },
      { value: 'rating', label: 'По рейтингу' },
      { value: 'duration_asc', label: 'По длительности' },
    ];
    
    // ============================================================
    // ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================
    
    // Уникальные школы из данных
    const schoolOptions = computed(() => {
      const schools = new Map();
      courses.value.forEach(c => {
        if (c.school && !schools.has(c.school)) {
          schools.set(c.school, {
            value: c.school,
            label: c.school,
            rating: c.school_rating || 0
          });
        }
      });
      return Array.from(schools.values())
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 30); // Топ-30 школ
    });
    
    // Уникальные направления из данных
    const directionOptions = computed(() => {
      const dirs = new Map();
      courses.value.forEach(c => {
        if (c.directions && Array.isArray(c.directions)) {
          c.directions.forEach(d => {
            if (!dirs.has(d)) {
              dirs.set(d, { value: d, label: d, count: 0 });
            }
            dirs.get(d).count++;
          });
        }
      });
      return Array.from(dirs.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Топ-20 направлений
    });
    
    // Фильтрованные курсы
    const filteredCourses = computed(() => {
      let result = [...courses.value];
      
      // Поиск
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        result = result.filter(c => 
          c.name?.toLowerCase().includes(query) ||
          c.school?.toLowerCase().includes(query) ||
          c.directions?.some(d => d.toLowerCase().includes(query))
        );
      }
      
      // Категории
      if (filters.value.categories.length > 0) {
        result = result.filter(c => 
          c.learning_type?.some(lt => filters.value.categories.includes(lt))
        );
      }
      
      // Направления
      if (filters.value.directions.length > 0) {
        result = result.filter(c => 
          c.directions?.some(d => filters.value.directions.includes(d))
        );
      }
      
      // Школы
      if (filters.value.schools.length > 0) {
        result = result.filter(c => filters.value.schools.includes(c.school));
      }
      
      // Уровни
      if (filters.value.levels.length > 0) {
        result = result.filter(c => 
          c.levels?.some(l => filters.value.levels.includes(l)) ||
          filters.value.levels.some(l => c.levels?.includes(l))
        );
      }
      
      // Цели
      if (filters.value.targets.length > 0) {
        result = result.filter(c => 
          c.course_targets?.some(t => filters.value.targets.includes(t))
        );
      }
      
      // Диапазон цены
      if (filters.value.priceRange) {
        const range = priceRangeOptions.find(p => p.value === filters.value.priceRange);
        if (range) {
          result = result.filter(c => {
            const price = c.price || 0;
            if (range.value === 'free') return price === 0;
            return price >= range.min && price <= range.max;
          });
        }
      }
      
      // Срок обучения
      if (filters.value.duration) {
        const range = durationOptions.find(d => d.value === filters.value.duration);
        if (range) {
          result = result.filter(c => {
            const months = c.duration_months || 0;
            return months >= range.min && months <= range.max;
          });
        }
      }
      
      // Флаги
      if (filters.value.isTopSale) {
        result = result.filter(c => c.is_top_sale);
      }
      if (filters.value.isWowEffect) {
        result = result.filter(c => c.is_wow_effect);
      }
      if (filters.value.jobHelp) {
        result = result.filter(c => c.job_help);
      }
      if (filters.value.freeOnly) {
        result = result.filter(c => !c.price || c.price === 0);
      }
      if (filters.value.hasInstallment) {
        result = result.filter(c => c.price_installment && c.price_installment > 0);
      }
      
      // Сортировка
      result = sortCourses(result);
      
      return result;
    });
    
    // Курсы для отображения (с пагинацией)
    const displayedCourses = computed(() => {
      const end = currentPage.value * perPage.value;
      return filteredCourses.value.slice(0, end);
    });
    
    // Есть ли ещё курсы
    const hasMore = computed(() => {
      return displayedCourses.value.length < filteredCourses.value.length;
    });
    
    // Количество активных фильтров
    const activeFiltersCount = computed(() => {
      let count = 0;
      if (filters.value.categories.length) count++;
      if (filters.value.directions.length) count++;
      if (filters.value.schools.length) count++;
      if (filters.value.levels.length) count++;
      if (filters.value.targets.length) count++;
      if (filters.value.priceRange) count++;
      if (filters.value.duration) count++;
      if (filters.value.isTopSale) count++;
      if (filters.value.isWowEffect) count++;
      if (filters.value.jobHelp) count++;
      if (filters.value.freeOnly) count++;
      if (filters.value.hasInstallment) count++;
      return count;
    });
    
    // ============================================================
    // МЕТОДЫ
    // ============================================================
    
    // Сортировка курсов
    function sortCourses(list) {
      const sorted = [...list];
      switch (sortBy.value) {
        case 'price_asc':
          return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        case 'price_desc':
          return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        case 'rating':
          return sorted.sort((a, b) => (b.school_rating || 0) - (a.school_rating || 0));
        case 'duration_asc':
          return sorted.sort((a, b) => (a.duration_months || 0) - (b.duration_months || 0));
        case 'popular':
        default:
          // Популярные = is_top_sale первые, потом по рейтингу
          return sorted.sort((a, b) => {
            if (a.is_top_sale && !b.is_top_sale) return -1;
            if (!a.is_top_sale && b.is_top_sale) return 1;
            return (b.school_rating || 0) - (a.school_rating || 0);
          });
      }
    }
    
    // Загрузить ещё
    function loadMore() {
      currentPage.value++;
    }
    
    // Сбросить фильтры
    function resetFilters() {
      filters.value = {
        categories: [],
        directions: [],
        schools: [],
        levels: [],
        targets: [],
        priceRange: null,
        duration: null,
        isTopSale: false,
        isWowEffect: false,
        jobHelp: false,
        freeOnly: false,
        hasInstallment: false,
      };
      searchQuery.value = '';
      currentPage.value = 1;
    }
    
    // Переключить фильтр массива
    function toggleArrayFilter(filterName, value) {
      const arr = filters.value[filterName];
      const idx = arr.indexOf(value);
      if (idx === -1) {
        arr.push(value);
      } else {
        arr.splice(idx, 1);
      }
      currentPage.value = 1;
    }
    
    // Переключить булевый фильтр
    function toggleBoolFilter(filterName) {
      filters.value[filterName] = !filters.value[filterName];
      currentPage.value = 1;
    }
    
    // Установить фильтр диапазона
    function setRangeFilter(filterName, value) {
      filters.value[filterName] = filters.value[filterName] === value ? null : value;
      currentPage.value = 1;
    }
    
    // Переключить выпадающее меню
    function toggleDropdown(name) {
      openDropdown.value = openDropdown.value === name ? null : name;
    }
    
    // Закрыть выпадающие меню при клике вне
    function closeDropdowns(event) {
      if (!event.target.closest('.dropdown')) {
        openDropdown.value = null;
      }
      if (!event.target.closest('.category-more-wrapper')) {
        showMoreCategories.value = false;
      }
    }
    
    // Форматирование цены
    function formatPrice(price) {
      if (!price || price === 0) return 'Бесплатно';
      return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }
    
    // Форматирование рейтинга
    function formatRating(rating) {
      return rating ? rating.toFixed(1) : '—';
    }
    
    // Форматирование длительности
    function formatDuration(course) {
      if (course.duration_months) return `${course.duration_months} мес.`;
      if (course.duration_days) return `${course.duration_days} дн.`;
      return '';
    }
    
    // Расчёт скидки
    function getDiscount(course) {
      if (!course.price_original || !course.price) return 0;
      if (course.price_original <= course.price) return 0;
      return Math.round((1 - course.price / course.price_original) * 100);
    }
    
    // Загрузка данных
    async function loadCourses(categoryId = null) {
      loading.value = true;
      
      try {
        const cat = categoryId || activeCategory.value;
        const categoryConfig = allCategories.value.find(c => c.id === cat);
        
        // Если это "Топ курсы" — грузим все и фильтруем
        if (categoryConfig?.filter === 'top') {
          const response = await fetch(`${DATA_PATH}/all_courses_combined.json`);
          const data = await response.json();
          courses.value = data.filter(c => c.is_top_sale || c.is_wow_effect);
        } else {
          // Обычная загрузка файла категории
          const fileName = categoryConfig?.file || 'all_courses_combined.json';
          const response = await fetch(`${DATA_PATH}/${fileName}`);
          const data = await response.json();
          courses.value = data;
        }
      } catch (error) {
        console.error('Ошибка загрузки курсов:', error);
        courses.value = [];
      } finally {
        loading.value = false;
      }
    }
    
    // Переключение категории
    function selectCategory(categoryId) {
      if (activeCategory.value === categoryId) return;
      
      activeCategory.value = categoryId;
      currentPage.value = 1;
      searchQuery.value = '';
      resetFilters();
      
      loadCourses(categoryId);
    }
    
    // ============================================================
    // LIFECYCLE
    // ============================================================
    
    onMounted(() => {
      loadCourses('typeProgramming'); // Загружаем программирование по умолчанию
      document.addEventListener('click', closeDropdowns);
    });
    
    // Сброс страницы при изменении фильтров
    watch([filters, searchQuery, sortBy], () => {
      currentPage.value = 1;
    }, { deep: true });
    
    // ============================================================
    // RETURN
    // ============================================================
    
    return {
      // Данные
      courses,
      loading,
      showAllFilters,
      showMoreCategories,
      searchQuery,
      filters,
      sortBy,
      openDropdown,
      perPage,
      currentPage,
      
      // Категории
      activeCategory,
      mainCategories,
      moreCategories,
      allCategories,
      selectCategory,
      
      // Опции
      categoryOptions,
      levelOptions,
      targetOptions,
      priceRangeOptions,
      durationOptions,
      sortOptions,
      schoolOptions,
      directionOptions,
      
      // Вычисляемые
      filteredCourses,
      displayedCourses,
      hasMore,
      activeFiltersCount,
      
      // Методы
      loadMore,
      resetFilters,
      toggleArrayFilter,
      toggleBoolFilter,
      setRangeFilter,
      toggleDropdown,
      formatPrice,
      formatRating,
      formatDuration,
      getDiscount,
    };
  },
  
  template: `
    <div class="courses-app">
      
      <!-- ПЛАШКА КАТЕГОРИЙ -->
      <div class="category-tabs">
        <div class="category-tabs-scroll">
          <!-- Основные категории -->
          <button 
            v-for="cat in mainCategories" 
            :key="cat.id"
            @click.stop="selectCategory(cat.id)"
            :class="['category-tab', { active: activeCategory === cat.id }]"
          >
            {{ cat.label }}
          </button>
          
          <!-- Кнопка "Ещё" -->
          <div class="category-more-wrapper">
            <button 
              class="category-tab category-tab-more"
              @click.stop="showMoreCategories = !showMoreCategories"
              :class="{ active: moreCategories.some(c => c.id === activeCategory) }"
            >
              Ещё
              <svg class="more-arrow" :class="{ open: showMoreCategories }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </button>
            
            <!-- Выпадающий список "Ещё" -->
            <div class="category-more-dropdown" v-show="showMoreCategories" @click.stop>
              <button 
                v-for="cat in moreCategories" 
                :key="cat.id"
                @click.stop="selectCategory(cat.id); showMoreCategories = false"
                :class="['category-more-item', { active: activeCategory === cat.id }]"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Заголовок и счётчик -->
      <div class="courses-header">
        <h1 class="courses-title">{{ allCategories.find(c => c.id === activeCategory)?.label || 'Онлайн-курсы' }}</h1>
        <span class="courses-count">{{ filteredCourses.length }} курсов</span>
      </div>
      
      <!-- Поиск / Фильтр -->
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Filter"
          class="search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">✕</button>
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="4" y1="12" x2="20" y2="12"/>
          <line x1="4" y1="18" x2="20" y2="18"/>
          <circle cx="8" cy="6" r="2" fill="currentColor"/>
          <circle cx="16" cy="12" r="2" fill="currentColor"/>
          <circle cx="10" cy="18" r="2" fill="currentColor"/>
        </svg>
      </div>
      
      <!-- Быстрые фильтры (теги) -->
      <div class="quick-filters">
        <!-- Направления (динамические из данных) -->
        <button 
          v-for="dir in directionOptions.slice(0, 8)" 
          :key="dir.value"
          @click="toggleArrayFilter('directions', dir.value)"
          :class="['filter-tag', { active: filters.directions.includes(dir.value) }]"
        >
          {{ dir.label }}
        </button>
        
        <!-- Уровни -->
        <button 
          v-for="level in levelOptions" 
          :key="level.value"
          @click="toggleArrayFilter('levels', level.value)"
          :class="['filter-tag', { active: filters.levels.includes(level.value) }]"
        >
          {{ level.label }}
        </button>
        
        <!-- Специальные -->
        <button 
          @click="toggleBoolFilter('jobHelp')"
          :class="['filter-tag', { active: filters.jobHelp }]"
        >
          С трудоустройством
        </button>
        
        <button 
          @click="toggleBoolFilter('isTopSale')"
          :class="['filter-tag', { active: filters.isTopSale }]"
        >
          Топ школы
        </button>
      </div>
      
      <!-- Выпадающие фильтры -->
      <div class="dropdown-filters">
        <!-- Стоимость -->
        <div class="dropdown" :class="{ open: openDropdown === 'price' }">
          <button class="dropdown-toggle" @click="toggleDropdown('price')">
            Стоимость
            <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
          <div class="dropdown-menu" v-show="openDropdown === 'price'">
            <label 
              v-for="opt in priceRangeOptions" 
              :key="opt.value"
              class="dropdown-item"
            >
              <input 
                type="radio" 
                :value="opt.value" 
                v-model="filters.priceRange"
                @change="openDropdown = null"
              />
              <span>{{ opt.label }}</span>
            </label>
          </div>
        </div>
        
        <!-- Срок -->
        <div class="dropdown" :class="{ open: openDropdown === 'duration' }">
          <button class="dropdown-toggle" @click="toggleDropdown('duration')">
            Срок
            <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
          <div class="dropdown-menu" v-show="openDropdown === 'duration'">
            <label 
              v-for="opt in durationOptions" 
              :key="opt.value"
              class="dropdown-item"
            >
              <input 
                type="radio" 
                :value="opt.value" 
                v-model="filters.duration"
                @change="openDropdown = null"
              />
              <span>{{ opt.label }}</span>
            </label>
          </div>
        </div>
        
        <!-- Школа -->
        <div class="dropdown" :class="{ open: openDropdown === 'school' }">
          <button class="dropdown-toggle" @click="toggleDropdown('school')">
            Школа
            <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
          <div class="dropdown-menu dropdown-menu-scrollable" v-show="openDropdown === 'school'">
            <label 
              v-for="opt in schoolOptions" 
              :key="opt.value"
              class="dropdown-item"
            >
              <input 
                type="checkbox" 
                :value="opt.value"
                v-model="filters.schools"
              />
              <span>{{ opt.label }}</span>
              <span class="dropdown-item-rating">★ {{ formatRating(opt.rating) }}</span>
            </label>
          </div>
        </div>
        
        <!-- Все фильтры -->
        <button 
          class="btn-all-filters"
          @click="showAllFilters = true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
            <circle cx="8" cy="6" r="2" fill="currentColor"/>
            <circle cx="16" cy="12" r="2" fill="currentColor"/>
            <circle cx="10" cy="18" r="2" fill="currentColor"/>
          </svg>
          Все фильтры
          <span v-if="activeFiltersCount" class="filters-badge">{{ activeFiltersCount }}</span>
        </button>
      </div>
      
      <!-- Активные фильтры -->
      <div class="active-filters" v-if="activeFiltersCount > 0">
        <span class="active-filters-label">Выбрано:</span>
        
        <span 
          v-for="dir in filters.directions" 
          :key="'dir-' + dir"
          class="active-filter-tag"
          @click="toggleArrayFilter('directions', dir)"
        >
          {{ dir }} ✕
        </span>
        
        <span 
          v-for="school in filters.schools" 
          :key="'school-' + school"
          class="active-filter-tag"
          @click="toggleArrayFilter('schools', school)"
        >
          {{ school }} ✕
        </span>
        
        <span 
          v-if="filters.priceRange"
          class="active-filter-tag"
          @click="filters.priceRange = null"
        >
          {{ priceRangeOptions.find(p => p.value === filters.priceRange)?.label }} ✕
        </span>
        
        <span 
          v-if="filters.duration"
          class="active-filter-tag"
          @click="filters.duration = null"
        >
          {{ durationOptions.find(d => d.value === filters.duration)?.label }} ✕
        </span>
        
        <span v-if="filters.jobHelp" class="active-filter-tag" @click="filters.jobHelp = false">
          С трудоустройством ✕
        </span>
        
        <span v-if="filters.isTopSale" class="active-filter-tag" @click="filters.isTopSale = false">
          Топ школы ✕
        </span>
        
        <button class="btn-reset-filters" @click="resetFilters">
          Сбросить все
        </button>
      </div>
      
      <!-- Сортировка -->
      <div class="sort-bar">
        <span class="sort-label">Сортировка:</span>
        <select v-model="sortBy" class="sort-select">
          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      
      <!-- Загрузка -->
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <span>Загрузка курсов...</span>
      </div>
      
      <!-- Нет результатов -->
      <div v-else-if="filteredCourses.length === 0" class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>Курсы не найдены</h3>
        <p>Попробуйте изменить параметры фильтрации</p>
        <button class="btn-primary" @click="resetFilters">Сбросить фильтры</button>
      </div>
      
      <!-- Сетка курсов -->
      <div v-else class="courses-grid">
        <article 
          v-for="course in displayedCourses" 
          :key="course.id"
          class="course-card"
        >
          <!-- Бейджи -->
          <div class="course-badges">
            <span v-if="course.is_top_sale" class="badge badge-popular">Популярное</span>
            <span v-if="course.is_wow_effect" class="badge badge-hot">🔥 Горячее</span>
            <span v-if="getDiscount(course) > 0" class="badge badge-discount">-{{ getDiscount(course) }}%</span>
          </div>
          
          <!-- Обложка -->
          <a :href="course.course_url" target="_blank" rel="noopener" class="course-cover">
            <img 
              :src="course.cover_url || '/wp-content/themes/flavor/courses-app/img/placeholder.png'" 
              :alt="course.name"
              loading="lazy"
            />
            <!-- Рейтинг и отзывы на обложке -->
            <div class="course-cover-stats">
              <span class="cover-rating">★ {{ formatRating(course.school_rating) }}</span>
              <span class="cover-reviews">💬 {{ course.school_reviews_count || 0 }}</span>
              <span v-if="course.duration_months" class="cover-duration">{{ course.duration_months }} мес.</span>
            </div>
          </a>
          
          <!-- Контент -->
          <div class="course-content">
            <!-- Школа -->
            <div class="course-school">
              <img 
                v-if="course.school_logo" 
                :src="course.school_logo" 
                :alt="course.school"
                class="school-logo"
              />
              <span class="school-name">{{ course.school }}</span>
            </div>
            
            <!-- Название -->
            <h3 class="course-name">
              <a :href="course.course_url" target="_blank" rel="noopener">
                {{ course.name }}
              </a>
            </h3>
            <span v-if="course.tariff" class="course-tariff">{{ course.tariff }}</span>
            
            <!-- Направления (теги) -->
            <div class="course-directions" v-if="course.directions?.length">
              <span 
                v-for="(dir, idx) in course.directions.slice(0, 3)" 
                :key="idx"
                class="direction-tag"
              >
                {{ dir }}
              </span>
              <span v-if="course.directions.length > 3" class="direction-more">
                +{{ course.directions.length - 3 }}
              </span>
            </div>
            
            <!-- Цена -->
            <div class="course-price">
              <span class="price-current">{{ formatPrice(course.price) }}</span>
              <span v-if="course.price_original && course.price_original > course.price" class="price-original">
                {{ formatPrice(course.price_original) }}
              </span>
            </div>
            
            <!-- Рассрочка -->
            <div v-if="course.price_installment" class="course-installment">
              или {{ formatPrice(course.price_installment) }}/мес.
            </div>
            
            <!-- Кнопка -->
            <a :href="course.course_url" target="_blank" rel="noopener" class="btn-course">
              Подробнее
            </a>
          </div>
        </article>
      </div>
      
      <!-- Показать ещё -->
      <div v-if="hasMore && !loading" class="load-more">
        <button class="btn-load-more" @click="loadMore">
          Показать ещё
          <span class="load-more-count">(ещё {{ filteredCourses.length - displayedCourses.length }})</span>
        </button>
      </div>
      
      <!-- Модальное окно: Все фильтры -->
      <div v-if="showAllFilters" class="modal-overlay" @click.self="showAllFilters = false">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Все фильтры</h2>
            <button class="modal-close" @click="showAllFilters = false">✕</button>
          </div>
          
          <div class="modal-body">
            <!-- Уровни -->
            <div class="filter-section">
              <h4>Уровень</h4>
              <div class="filter-tags">
                <button 
                  v-for="opt in levelOptions" 
                  :key="opt.value"
                  @click="toggleArrayFilter('levels', opt.value)"
                  :class="['filter-tag', { active: filters.levels.includes(opt.value) }]"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            
            <!-- Категории -->
            <div class="filter-section">
              <h4>Категория</h4>
              <div class="filter-tags">
                <button 
                  v-for="opt in categoryOptions" 
                  :key="opt.value"
                  @click="toggleArrayFilter('categories', opt.value)"
                  :class="['filter-tag', { active: filters.categories.includes(opt.value) }]"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            
            <!-- Цели -->
            <div class="filter-section">
              <h4>Какая цель?</h4>
              <div class="filter-tags">
                <button 
                  v-for="opt in targetOptions" 
                  :key="opt.value"
                  @click="toggleArrayFilter('targets', opt.value)"
                  :class="['filter-tag', { active: filters.targets.includes(opt.value) }]"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            
            <!-- Стоимость -->
            <div class="filter-section">
              <h4>Стоимость</h4>
              <div class="filter-tags">
                <button 
                  v-for="opt in priceRangeOptions" 
                  :key="opt.value"
                  @click="setRangeFilter('priceRange', opt.value)"
                  :class="['filter-tag', { active: filters.priceRange === opt.value }]"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            
            <!-- Срок -->
            <div class="filter-section">
              <h4>Срок</h4>
              <div class="filter-tags">
                <button 
                  v-for="opt in durationOptions" 
                  :key="opt.value"
                  @click="setRangeFilter('duration', opt.value)"
                  :class="['filter-tag', { active: filters.duration === opt.value }]"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            
            <!-- Дополнительно -->
            <div class="filter-section">
              <h4>Дополнительно</h4>
              <div class="filter-tags">
                <button 
                  @click="toggleBoolFilter('isTopSale')"
                  :class="['filter-tag', { active: filters.isTopSale }]"
                >
                  Лучшее в Сравни
                </button>
                <button 
                  @click="toggleBoolFilter('isWowEffect')"
                  :class="['filter-tag', { active: filters.isWowEffect }]"
                >
                  ВАУ курсы
                </button>
                <button 
                  @click="toggleBoolFilter('jobHelp')"
                  :class="['filter-tag', { active: filters.jobHelp }]"
                >
                  С трудоустройством
                </button>
                <button 
                  @click="toggleBoolFilter('hasInstallment')"
                  :class="['filter-tag', { active: filters.hasInstallment }]"
                >
                  С рассрочкой
                </button>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-secondary" @click="resetFilters">Сбросить</button>
            <button class="btn-primary" @click="showAllFilters = false">
              Применить
              <span v-if="filteredCourses.length">({{ filteredCourses.length }})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  const mountEl = document.getElementById('courses-app');
  if (mountEl) {
    createApp(CoursesApp).mount('#courses-app');
  }
});
