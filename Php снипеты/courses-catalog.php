
/**
 * Каталог курсов — Shadow DOM версия
 * 
 * Плагин: Code Snippets
 * Где выполнять: Везде (Frontend + Backend) или только Frontend
 */

// Путь к папке с приложением в uploads
$upload_dir = wp_upload_dir();
$courses_app_path = $upload_dir['baseurl'] . '/courses-app';

// Подключаем скрипты
add_action('wp_enqueue_scripts', function() use ($courses_app_path) {
    
    // Vue 3
    wp_enqueue_script(
        'vue-3',
        'https://unpkg.com/vue@3/dist/vue.global.prod.js',
        [],
        '3.4.0',
        true
    );
    
    // Конфигурация
    wp_add_inline_script('vue-3', "
        window.CoursesAppConfig = {
            dataPath: '{$courses_app_path}/data',
            cssPath: '{$courses_app_path}/courses-shadow.css'
        };
    ");
    
    // Приложение
    wp_enqueue_script(
        'courses-app',
        $courses_app_path . '/courses.js',
        ['vue-3'],
        '1.0.0',
        true
    );
});

// Шорткод [courses_catalog]
add_shortcode('courses_catalog', function() {
    return '<div id="courses-app"></div>';
});