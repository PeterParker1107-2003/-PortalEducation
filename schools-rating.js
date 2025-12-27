/**
 * Schools Rating Widget
 * Vue 3 + Shadow DOM
 */

(function() {
'use strict';

const { createApp, ref, computed, onMounted } = Vue;

const SchoolsRatingApp = {
  setup() {
    const schools = ref([]);
    const loading = ref(true);
    const sortField = ref('rating');
    const sortDirection = ref('desc');
    
    const config = window.SchoolsRatingConfig || {};
    const API_URL = config.apiUrl || '/wp-json/schools/v1/list';
    
    const sortedSchools = computed(() => {
      const sorted = [...schools.value];
      const field = sortField.value;
      const dir = sortDirection.value;
      
      sorted.sort((a, b) => {
        const valA = field === 'rating' ? a.rating : a.reviews_count;
        const valB = field === 'rating' ? b.rating : b.reviews_count;
        return dir === 'desc' ? valB - valA : valA - valB;
      });
      
      return sorted;
    });
    
    function toggleSort(field) {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc';
      } else {
        sortField.value = field;
        sortDirection.value = 'desc';
      }
    }
    
    function getSortIcon(field) {
      if (sortField.value !== field) return 'none';
      return sortDirection.value;
    }
    
    function formatRating(rating) {
      return rating ? parseFloat(rating).toFixed(2) : '-';
    }
    
    function formatReviews(count) {
      return count ? parseInt(count).toLocaleString('ru-RU') : '0';
    }
    
    async function loadSchools() {
      loading.value = true;
      try {
        const response = await fetch(API_URL);
        schools.value = await response.json();
      } catch (error) {
        console.error('Load error:', error);
        schools.value = [];
      } finally {
        loading.value = false;
      }
    }
    
    onMounted(() => {
      loadSchools();
    });
    
    return {
      schools,
      sortedSchools,
      loading,
      sortField,
      sortDirection,
      toggleSort,
      getSortIcon,
      formatRating,
      formatReviews,
    };
  },
  
  template: `
    <div class="schools-rating">
      
      <div v-if="loading" class="schools-loading">
        <div class="spinner"></div>
        <span>Загрузка...</span>
      </div>
      
      <div v-else class="schools-table-wrapper">
        <table class="schools-table">
          <thead>
            <tr>
              <th class="col-name">Название школы</th>
              <th class="col-rating sortable" @click="toggleSort('rating')">
                <span>Рейтинг</span>
                <svg v-if="getSortIcon('rating') === 'desc'" class="sort-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5H7z"/>
                </svg>
                <svg v-else-if="getSortIcon('rating') === 'asc'" class="sort-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5-5 5 5H7z"/>
                </svg>
                <svg v-else class="sort-icon inactive" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5l-5 5h10l-5-5zm0 14l5-5H7l5 5z"/>
                </svg>
              </th>
              <th class="col-reviews sortable" @click="toggleSort('reviews')">
                <span>Отзывы</span>
                <svg v-if="getSortIcon('reviews') === 'desc'" class="sort-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5H7z"/>
                </svg>
                <svg v-else-if="getSortIcon('reviews') === 'asc'" class="sort-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5-5 5 5H7z"/>
                </svg>
                <svg v-else class="sort-icon inactive" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5l-5 5h10l-5-5zm0 14l5-5H7l5 5z"/>
                </svg>
              </th>
              <th class="col-action">О школе</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(school, index) in sortedSchools" :key="school.id">
              <td class="col-name">
                <div class="school-info">
                  <span class="school-index">{{ index + 1 }}</span>
                  <div class="school-logo">
                    <img v-if="school.logo" :src="school.logo" :alt="school.name" @error="$event.target.style.display='none'" />
                    <span v-if="!school.logo" class="school-logo-placeholder">{{ school.name.charAt(0) }}</span>
                  </div>
                  <span class="school-name">{{ school.name }}</span>
                </div>
              </td>
              <td class="col-rating">
                <div class="rating-value">
                  <svg class="star-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>{{ formatRating(school.rating) }}</span>
                </div>
              </td>
              <td class="col-reviews">
                {{ formatReviews(school.reviews_count) }}
              </td>
              <td class="col-action">
                <a :href="school.url" class="btn-details">Подробнее</a>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="sortedSchools.length === 0" class="schools-empty">
          Школы не найдены
        </div>
      </div>
      
    </div>
  `
};

// Shadow DOM Init
function initSchoolsRating() {
  const hostEl = document.getElementById('schools-rating-app');
  if (!hostEl) return;
  
  // Уже инициализировано
  if (hostEl.shadowRoot) return;
  
  const shadowRoot = hostEl.attachShadow({ mode: 'open' });
  const config = window.SchoolsRatingConfig || {};
  const cssPath = config.cssPath || '/wp-content/uploads/courses-app/schools-rating.css';
  
  fetch(cssPath)
    .then(response => response.text())
    .then(cssText => {
      const styleEl = document.createElement('style');
      styleEl.textContent = cssText;
      shadowRoot.appendChild(styleEl);
      
      const appContainer = document.createElement('div');
      appContainer.id = 'vue-root';
      shadowRoot.appendChild(appContainer);
      
      createApp(SchoolsRatingApp).mount(appContainer);
    })
    .catch(error => {
      console.error('Widget init error:', error);
      hostEl.innerHTML = '<p style="color: red;">Error loading widget</p>';
    });
}

// Запускаем сразу если DOM готов, иначе ждём
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSchoolsRating);
} else {
  initSchoolsRating();
}

})();