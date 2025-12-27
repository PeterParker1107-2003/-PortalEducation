

  Виджет рейтинга школ — REST API + подключение скриптов
  
  Плагин Code Snippets
  Где выполнять Везде (Run everywhere)
 

 ============================================================
 REST API ENDPOINT wp-jsonschoolsv1list
 ============================================================
add_action('rest_api_init', function() {
    register_rest_route('schoolsv1', 'list', [
        'methods'  = 'GET',
        'callback' = 'get_schools_rating_list',
        'permission_callback' = '__return_true',
    ]);
});

function get_schools_rating_list() {
    $schools = get_posts([
        'post_type'      = 'schools',
        'posts_per_page' = 100,
        'post_status'    = 'publish',
    ]);
    
    $result = [];
    
    foreach ($schools as $school) {
         ACF поля
        $logo = get_field('logo', $school-ID);
        $logo_url = '';
        
         Логотип может быть массивом (ACF Image) или ID
        if (is_array($logo)) {
            $logo_url = $logo['url'];
        } elseif (is_numeric($logo)) {
            $logo_url = wp_get_attachment_url($logo);
        }
        
        $result[] = [
            'id'            = $school-ID,
            'name'          = get_field('nazvanie_shkoly', $school-ID)  $school-post_title,
            'slug'          = $school-post_name,
            'rating'        = (float) get_field('rejting', $school-ID),
            'reviews_count' = (int) get_field('otzyvy_count', $school-ID),
            'logo'          = $logo_url,
            'website'       = get_field('website_url', $school-ID),
            'url'           = get_permalink($school-ID),
        ];
    }
    
     Сортируем по рейтингу (по умолчанию)
    usort($result, function($a, $b) {
        return $b['rating'] = $a['rating'];
    });
    
    return $result;
}


 ============================================================
 ПОДКЛЮЧЕНИЕ СКРИПТОВ ВИДЖЕТА
 ============================================================
add_action('wp_enqueue_scripts', function() {
    $upload_dir = wp_upload_dir();
    $app_path = $upload_dir['baseurl'] . 'courses-app';
    
     Vue 3 (если ещё не подключен)
    if (!wp_script_is('vue-3', 'enqueued')) {
        wp_enqueue_script(
            'vue-3',
            'httpsunpkg.comvue@3distvue.global.prod.js',
            [],
            '3.4.0',
            true
        );
    }
    
     Конфигурация
    wp_add_inline_script('vue-3', 
        window.SchoolsRatingConfig = {
            apiUrl 'wp-jsonschoolsv1list',
            cssPath '{$app_path}schools-rating.css'
        };
    );
    
     Виджет
    wp_enqueue_script(
        'schools-rating',
        $app_path . 'schools-rating.js',
        ['vue-3'],
        '1.0.2',
        true
    );
});


 ============================================================
 ШОРТКОД [schools_rating]
 ============================================================
add_shortcode('schools_rating', function($atts) {
    $atts = shortcode_atts([
        'limit' = 0,   0 = все
    ], $atts);
    
    return 'div id=schools-rating-appdiv';
});