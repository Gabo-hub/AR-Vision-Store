<?php
/**
 * Plugin Name: AR Try-On
 * Plugin URI:  https://github.com/ar-vision-store/ar-tryon-wp
 * Description: Real-time AR glasses try-on powered by MediaPipe FaceMesh and Three.js. Add virtual try-on to any page with a simple shortcode, or let WooCommerce products auto-display it.
 * Version:     2.2.0
 * Author:      AR Vision Store
 * Author URI:  https://arvisionstore.com
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ar-tryon
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Main plugin class — singleton pattern.
 */
final class AR_TryOn_Plugin {

    /** @var string Plugin version */
    const VERSION = '2.2.0';

    /** @var string Three.js version used from CDN */
    const THREEJS_VERSION = '0.165.0';

    /** @var self|null Singleton instance */
    private static $instance = null;

    /** @var bool Whether the shortcode/AR is used on the current page */
    private $shortcode_used = false;

    /** @var int Auto-increment counter for unique container IDs */
    private $instance_counter = 0;

    /**
     * Get singleton instance.
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor — hook into WordPress.
     */
    private function __construct() {
        // ── Load translations ──
        add_action( 'init', array( $this, 'load_textdomain' ) );

        // ── Shortcode ──
        add_shortcode( 'ar_tryon', array( $this, 'render_shortcode' ) );

        // ── Gutenberg Block ──
        add_action( 'init', array( $this, 'register_gutenberg_block' ) );

        // ── Frontend assets ──
        add_action( 'wp_enqueue_scripts', array( $this, 'maybe_enqueue_frontend' ) );
        add_action( 'wp_footer', array( $this, 'output_module_scripts' ), 5 );

        // ── Admin ──
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
        add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), array( $this, 'add_settings_link' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );

        // ── Allow 3D file uploads ──
        add_filter( 'upload_mimes', array( $this, 'allow_3d_mimes' ) );
        add_filter( 'wp_check_filetype_and_ext', array( $this, 'fix_3d_filetype_check' ), 10, 5 );
        add_filter( 'upload_size_limit', function( $limit ) {
            return max( $limit, 64 * 1024 * 1024 );
        } );

        // ── AJAX ──
        add_action( 'wp_ajax_ar_tryon_save_reference', array( $this, 'ajax_save_reference' ) );

        // ── WooCommerce integration (conditional) ──
        if ( $this->is_woocommerce_active() ) {
            add_action( 'add_meta_boxes', array( $this, 'add_product_meta_box' ) );
            add_action( 'save_post_product', array( $this, 'save_product_meta' ) );
            add_action( 'woocommerce_after_add_to_cart_button', array( $this, 'inject_ar_on_product_page' ), 5 );

            // Variable product support
            add_action( 'woocommerce_product_after_variable_attributes', array( $this, 'render_variation_fields' ), 10, 3 );
            add_action( 'woocommerce_save_product_variation', array( $this, 'save_variation_fields' ), 10, 2 );
            add_filter( 'woocommerce_available_variation', array( $this, 'add_variation_ar_data' ), 10, 3 );
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════
     *  TRANSLATIONS
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Load plugin text domain for translations.
     */
    public function load_textdomain() {
        load_plugin_textdomain( 'ar-tryon', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
    }

    /* ═══════════════════════════════════════════════════════════════════════
     *  HELPER: Check if WooCommerce is active
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Check if WooCommerce is active. Uses a late check so it works
     * even if WooCommerce loads after this plugin.
     */
    private function is_woocommerce_active() {
        return class_exists( 'WooCommerce' ) || in_array(
            'woocommerce/woocommerce.php',
            apply_filters( 'active_plugins', get_option( 'active_plugins' ) ),
            true
        );
    }

    /* ═══════════════════════════════════════════════════════════════════════
     *  SETTINGS REGISTRATION
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Register plugin settings with the WP Settings API.
     */
    public function register_settings() {
        register_setting( 'ar_tryon_settings', 'ar_tryon_settings', array(
            'type'              => 'array',
            'sanitize_callback' => array( $this, 'sanitize_settings' ),
            'default'           => $this->get_default_settings(),
        ) );
    }

    /**
     * Get default plugin settings.
     */
    public function get_default_settings() {
        return array(
            'button_text'           => __( 'Try On with AR', 'ar-tryon' ),
            'button_color'          => '#111111',
            'button_text_color'     => '#ffffff',
            'button_style'          => 'solid',
            'camera_resolution'     => '640',
            'enable_photo_capture'  => '1',
            'enable_mobile'         => '1',
            'enable_face_guide'     => '1',
            'loading_text'          => __( 'Loading AI engine...', 'ar-tryon' ),
            'searching_text'        => __( 'Position your face', 'ar-tryon' ),
            'tracking_text'         => __( 'Live Tracking', 'ar-tryon' ),
        );
    }

    /**
     * Sanitize plugin settings on save.
     */
    public function sanitize_settings( $input ) {
        $defaults  = $this->get_default_settings();
        $sanitized = array();

        $sanitized['button_text']       = sanitize_text_field( $input['button_text'] ?? $defaults['button_text'] );
        $sanitized['button_color']      = sanitize_hex_color( $input['button_color'] ?? $defaults['button_color'] );
        $sanitized['button_text_color'] = sanitize_hex_color( $input['button_text_color'] ?? $defaults['button_text_color'] );
        $sanitized['button_style']      = in_array( $input['button_style'] ?? '', array( 'solid', 'outline', 'minimal' ), true )
                                          ? $input['button_style'] : $defaults['button_style'];
        $sanitized['camera_resolution'] = in_array( $input['camera_resolution'] ?? '', array( '480', '640', '720', '1080' ), true )
                                          ? $input['camera_resolution'] : $defaults['camera_resolution'];
        $sanitized['enable_photo_capture'] = ! empty( $input['enable_photo_capture'] ) ? '1' : '0';
        $sanitized['enable_mobile']        = ! empty( $input['enable_mobile'] ) ? '1' : '0';
        $sanitized['enable_face_guide']    = ! empty( $input['enable_face_guide'] ) ? '1' : '0';
        $sanitized['loading_text']         = sanitize_text_field( $input['loading_text'] ?? $defaults['loading_text'] );
        $sanitized['searching_text']       = sanitize_text_field( $input['searching_text'] ?? $defaults['searching_text'] );
        $sanitized['tracking_text']        = sanitize_text_field( $input['tracking_text'] ?? $defaults['tracking_text'] );

        return $sanitized;
    }

    /**
     * Get a single setting value with fallback to default.
     */
    public function get_setting( $key ) {
        $settings = get_option( 'ar_tryon_settings', $this->get_default_settings() );
        $defaults = $this->get_default_settings();
        return isset( $settings[ $key ] ) ? $settings[ $key ] : ( $defaults[ $key ] ?? '' );
    }

    /* ═══════════════════════════════════════════════════════════════════════
     *  3D FILE UPLOAD SUPPORT
     * ═══════════════════════════════════════════════════════════════════════ */

    public function allow_3d_mimes( $mimes ) {
        $mimes['glb']  = 'model/gltf-binary';
        $mimes['gltf'] = 'model/gltf+json';
        $mimes['bin']  = 'application/octet-stream';
        return $mimes;
    }


    public function fix_3d_filetype_check( $data, $file, $filename, $mimes, $real_mime = false ) {
        if ( ! empty( $data['ext'] ) && ! empty( $data['type'] ) ) {
            return $data;
        }

        $ext = strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );
        $allowed_3d = array(
            'glb'  => 'model/gltf-binary',
            'gltf' => 'model/gltf+json',
            'bin'  => 'application/octet-stream',
        );

        if ( isset( $allowed_3d[ $ext ] ) ) {
            $data['ext']  = $ext;
            $data['type'] = $allowed_3d[ $ext ];
        }

        return $data;
    }

    /* ═══════════════════════════════════════════════════════════════════════
     *  SHORTCODE — Enhanced with product ID support
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Render the [ar_tryon] shortcode.
     *
     * Modes:
     *   [ar_tryon id="42"]                         — Load from WooCommerce product
     *   [ar_tryon model="url"]                     — Manual URL mode
     *   [ar_tryon model="url" scale="3.0" ...]     — Manual with overrides
     *   [ar_tryon]                                 — On a WC product page, auto-detect product
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_shortcode( $atts ) {
        // Check mobile setting
        if ( wp_is_mobile() && $this->get_setting( 'enable_mobile' ) === '0' ) {
            return '<!-- AR Try-On: Disabled on mobile -->';
        }

        $this->shortcode_used = true;
        $this->instance_counter++;

        $default_btn_text = $this->get_setting( 'button_text' );

        $atts = shortcode_atts( array(
            'id'          => '',
            'model'       => '',
            'thumbnail'   => '',
            'scale'       => '',
            'offset_x'    => '',
            'offset_y'    => '',
            'offset_z'    => '',
            'rotation_x'  => '',
            'rotation_y'  => '',
            'rotation_z'  => '',
            'height'      => '500px',
            'button_text' => $default_btn_text,
            'mode'        => '', // 'modal' or ''
        ), $atts, 'ar_tryon' );

        // ── Resolve product data if ID is provided ──
        $resolved = $this->resolve_product_config( $atts );

        if ( empty( $resolved['model'] ) ) {
            return '<!-- AR Try-On: No 3D model URL provided -->';
        }

        $container_id = 'ar-tryon-' . $this->instance_counter;

        // Build data attributes
        $data_attrs = sprintf(
            'data-model="%s" data-thumbnail="%s" data-scale="%s" data-offset-x="%s" data-offset-y="%s" data-offset-z="%s" data-rotation-x="%s" data-rotation-y="%s" data-rotation-z="%s" data-button-text="%s" data-enable-capture="%s" data-enable-face-guide="%s"',
            esc_url( $resolved['model'] ),
            esc_url( $resolved['thumbnail'] ),
            esc_attr( $resolved['scale'] ),
            esc_attr( $resolved['offset_x'] ),
            esc_attr( $resolved['offset_y'] ),
            esc_attr( $resolved['offset_z'] ),
            esc_attr( $resolved['rotation_x'] ),
            esc_attr( $resolved['rotation_y'] ),
            esc_attr( $resolved['rotation_z'] ),
            esc_attr( $resolved['button_text'] ),
            esc_attr( $this->get_setting( 'enable_photo_capture' ) ),
            esc_attr( $this->get_setting( 'enable_face_guide' ) )
        );

        // Add settings as data attributes for the JS engine
        $data_attrs .= sprintf(
            ' data-btn-color="%s" data-btn-text-color="%s" data-btn-style="%s" data-camera-res="%s" data-loading-text="%s" data-searching-text="%s" data-tracking-text="%s"',
            esc_attr( $this->get_setting( 'button_color' ) ),
            esc_attr( $this->get_setting( 'button_text_color' ) ),
            esc_attr( $this->get_setting( 'button_style' ) ),
            esc_attr( $this->get_setting( 'camera_resolution' ) ),
            esc_attr( $this->get_setting( 'loading_text' ) ),
            esc_attr( $this->get_setting( 'searching_text' ) ),
            esc_attr( $this->get_setting( 'tracking_text' ) )
        );

        $container_class = 'ar-tryon-container';
        if ( ! empty( $atts['mode'] ) ) {
            $container_class .= ' ar-tryon-mode-' . sanitize_html_class( $atts['mode'] );
        }

        return sprintf(
            '<div id="%s" class="%s" style="height:%s;" %s></div>',
            esc_attr( $container_id ),
            esc_attr( $container_class ),
            esc_attr( $resolved['height'] ),
            $data_attrs
        );
    }

    /**
     * Resolve shortcode attributes → final config.
     *
     * Priority: shortcode attrs > product meta > reference defaults
     *
     * @param array $atts Shortcode attributes
     * @return array Resolved config
     */
    private function resolve_product_config( $atts ) {
        // Get reference defaults
        $ref_scale     = get_option( 'ar_tryon_ref_scale', '2.5' );
        $ref_offset_x  = get_option( 'ar_tryon_ref_offset_x', '0' );
        $ref_offset_y  = get_option( 'ar_tryon_ref_offset_y', '0' );
        $ref_offset_z  = get_option( 'ar_tryon_ref_offset_z', '0' );

        $result = array(
            'model'       => $atts['model'],
            'thumbnail'   => $atts['thumbnail'],
            'scale'       => $atts['scale'] !== '' ? $atts['scale'] : $ref_scale,
            'offset_x'    => $atts['offset_x'] !== '' ? $atts['offset_x'] : $ref_offset_x,
            'offset_y'    => $atts['offset_y'] !== '' ? $atts['offset_y'] : $ref_offset_y,
            'offset_z'    => $atts['offset_z'] !== '' ? $atts['offset_z'] : $ref_offset_z,
            'rotation_x'  => $atts['rotation_x'] !== '' ? $atts['rotation_x'] : '0',
            'rotation_y'  => $atts['rotation_y'] !== '' ? $atts['rotation_y'] : '0',
            'rotation_z'  => $atts['rotation_z'] !== '' ? $atts['rotation_z'] : '0',
            'height'      => $atts['height'],
            'button_text' => $atts['button_text'],
        );

        // Try loading from product ID
        $product_id = 0;

        if ( ! empty( $atts['id'] ) ) {
            $product_id = absint( $atts['id'] );
        } elseif ( empty( $atts['model'] ) && function_exists( 'is_product' ) && is_product() ) {
            // Auto-detect on WooCommerce product page
            $product_id = get_the_ID();
        }

        if ( $product_id > 0 ) {
            $model_url     = get_post_meta( $product_id, '_ar_model_url', true );
            $use_reference = get_post_meta( $product_id, '_ar_use_reference', true );

            if ( $model_url ) {
                $result['model'] = $model_url;

                // Get product thumbnail as fallback
                if ( empty( $result['thumbnail'] ) && has_post_thumbnail( $product_id ) ) {
                    $result['thumbnail'] = get_the_post_thumbnail_url( $product_id, 'medium' );
                }

                // If product uses custom calibration, load those values
                if ( $use_reference !== '1' ) {
                    $custom_scale  = get_post_meta( $product_id, '_ar_custom_scale', true );
                    $custom_off_x  = get_post_meta( $product_id, '_ar_custom_offset_x', true );
                    $custom_off_y  = get_post_meta( $product_id, '_ar_custom_offset_y', true );
                    $custom_off_z  = get_post_meta( $product_id, '_ar_custom_offset_z', true );

                    // Only override if values are set (non-empty)
                    if ( $custom_scale !== '' && $atts['scale'] === '' ) {
                        $result['scale'] = $custom_scale;
                    }
                    if ( $custom_off_x !== '' && $atts['offset_x'] === '' ) {
                        $result['offset_x'] = $custom_off_x;
                    }
                    if ( $custom_off_y !== '' && $atts['offset_y'] === '' ) {
                        $result['offset_y'] = $custom_off_y;
                    }
                    if ( $custom_off_z !== '' && $atts['offset_z'] === '' ) {
                        $result['offset_z'] = $custom_off_z;
                    }
                }
                // If use_reference === '1' (or default), result already has reference values
            }
        }

        return $result;
    }

    /* ═══════════════════════════════════════════════════════════════════════
     *  FRONTEND ASSET ENQUEUING
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Enqueue frontend styles on pages that use the shortcode or
     * WooCommerce product pages with AR models.
     */
    public function maybe_enqueue_frontend() {
        global $post;

        $should_enqueue = false;

        // Check shortcode in post content
        if ( is_a( $post, 'WP_Post' ) && has_shortcode( $post->post_content, 'ar_tryon' ) ) {
            $should_enqueue = true;
        }

        // Check WooCommerce product pages
        if ( ! $should_enqueue && function_exists( 'is_product' ) && is_product() ) {
            $model_url = get_post_meta( get_the_ID(), '_ar_model_url', true );
            if ( ! empty( $model_url ) ) {
                $should_enqueue = true;
            }
        }

        if ( $should_enqueue ) {
            $this->enqueue_frontend_assets();
        }
    }

    /**
     * Enqueue CSS and MediaPipe.
     */
    private function enqueue_frontend_assets() {
        $this->shortcode_used = true;

        // Add preconnect hints for CDN domains
        add_filter( 'wp_resource_hints', array( $this, 'add_resource_hints' ), 10, 2 );

        wp_enqueue_style(
            'ar-tryon-css',
            plugin_dir_url( __FILE__ ) . 'assets/css/ar-tryon.css',
            array(),
            self::VERSION
        );
    }

    /**
     * Add preconnect resource hints for CDN performance.
     */
    public function add_resource_hints( $urls, $relation_type ) {
        if ( 'preconnect' === $relation_type ) {
            $urls[] = array(
                'href'        => 'https://cdn.jsdelivr.net',
                'crossorigin' => 'anonymous',
            );
        }
        return $urls;
    }

    /**
     * Output importmap + module script in footer (frontend + admin).
     */
    public function output_module_scripts() {
        if ( ! $this->shortcode_used ) {
            return;
        }

        $threejs_version = self::THREEJS_VERSION;
        $js_url          = plugin_dir_url( __FILE__ ) . 'assets/js/ar-tryon.js';
        $js_version      = self::VERSION;

        ?>
        <!-- AR Try-On: Three.js Import Map -->
        <script type="importmap">
        {
            "imports": {
                "three": "https://cdn.jsdelivr.net/npm/three@<?php echo $threejs_version; ?>/build/three.module.min.js",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@<?php echo $threejs_version; ?>/examples/jsm/"
            }
        }
        </script>
        <!-- AR Try-On: Engine Module -->
        <script type="module" src="<?php echo esc_url( $js_url ); ?>?v=<?php echo $js_version; ?>"></script>
        <?php
    }

    /* ═══════════════════════════════════════════════════════════════════════
     *  WOOCOMMERCE INTEGRATION
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Add "AR Try-On" meta box to WooCommerce product editor.
     */
    public function add_product_meta_box() {
        add_meta_box(
            'ar_tryon_meta_box',
            '🕶️ ' . __( 'AR Try-On Settings', 'ar-tryon' ),
            array( $this, 'render_product_meta_box' ),
            'product',
            'side',
            'default'
        );
    }

    /**
     * Render the product meta box contents.
     */
    public function render_product_meta_box( $post ) {
        include plugin_dir_path( __FILE__ ) . 'admin/product-meta-box.php';
    }

    /**
     * Save product meta data when the product is saved.
     */
    public function save_product_meta( $post_id ) {
        // Verify nonce
        if ( ! isset( $_POST['ar_tryon_product_nonce'] ) ||
             ! wp_verify_nonce( $_POST['ar_tryon_product_nonce'], 'ar_tryon_save_product' ) ) {
            return;
        }

        // Check permissions
        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        // Check autosave
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }

        // Save meta fields with proper sanitization
        if ( isset( $_POST['ar_model_url'] ) ) {
            update_post_meta( $post_id, '_ar_model_url', esc_url_raw( $_POST['ar_model_url'] ) );
        }

        if ( isset( $_POST['ar_use_reference'] ) ) {
            update_post_meta( $post_id, '_ar_use_reference', in_array( $_POST['ar_use_reference'], array( '0', '1' ), true ) ? $_POST['ar_use_reference'] : '1' );
        }

        // Numeric fields — validate as floats
        $numeric_fields = array(
            'ar_custom_scale'    => '_ar_custom_scale',
            'ar_custom_offset_x' => '_ar_custom_offset_x',
            'ar_custom_offset_y' => '_ar_custom_offset_y',
            'ar_custom_offset_z' => '_ar_custom_offset_z',
        );

        foreach ( $numeric_fields as $post_key => $meta_key ) {
            if ( isset( $_POST[ $post_key ] ) ) {
                $value = sanitize_text_field( $_POST[ $post_key ] );
                // Validate it's actually a number
                if ( is_numeric( $value ) ) {
                    update_post_meta( $post_id, $meta_key, $value );
                }
            }
        }
    }

    /**
     * Auto-inject AR Try-On on WooCommerce single product pages.
     * Only injects if the product has a 3D model URL set.
     * For variable products, injects a placeholder that JS updates per variation.
     */
    public function inject_ar_on_product_page() {
        if ( ! is_product() ) {
            return;
        }

        $product_id = get_the_ID();
        $product    = wc_get_product( $product_id );
        $model_url  = get_post_meta( $product_id, '_ar_model_url', true );

        // For variable products, check if any variation has a model
        $is_variable = $product && $product->is_type( 'variable' );
        $has_variation_models = false;

        if ( $is_variable ) {
            $variations = $product->get_available_variations();
            foreach ( $variations as $variation ) {
                $v_model = get_post_meta( $variation['variation_id'], '_ar_variation_model_url', true );
                if ( ! empty( $v_model ) ) {
                    $has_variation_models = true;
                    break;
                }
            }
        }

        // No model at all? Skip
        if ( empty( $model_url ) && ! $has_variation_models ) {
            return;
        }

        // Enqueue assets
        $this->enqueue_frontend_assets();

        $button_text = $this->get_setting( 'button_text' );

        if ( $is_variable && $has_variation_models ) {
            // For variable products: render a dynamic container that JS will update
            $this->shortcode_used = true;
            $this->instance_counter++;
            $container_id = 'ar-tryon-' . $this->instance_counter;

            // Use product-level model as fallback, or first variation with a model
            $fallback_model = $model_url;

            echo sprintf(
                '<div id="%s" class="ar-tryon-container ar-tryon-mode-modal ar-tryon-variable" style="height:auto;" data-model="%s" data-scale="%s" data-offset-x="%s" data-offset-y="%s" data-offset-z="%s" data-button-text="%s" data-thumbnail="%s" data-enable-capture="%s" data-enable-face-guide="%s" data-btn-color="%s" data-btn-text-color="%s" data-btn-style="%s" data-camera-res="%s" data-loading-text="%s" data-searching-text="%s" data-tracking-text="%s"></div>',
                esc_attr( $container_id ),
                esc_url( $fallback_model ),
                esc_attr( get_option( 'ar_tryon_ref_scale', '2.5' ) ),
                esc_attr( get_option( 'ar_tryon_ref_offset_x', '0' ) ),
                esc_attr( get_option( 'ar_tryon_ref_offset_y', '0' ) ),
                esc_attr( get_option( 'ar_tryon_ref_offset_z', '0' ) ),
                esc_attr( $button_text ),
                esc_attr( has_post_thumbnail( $product_id ) ? get_the_post_thumbnail_url( $product_id, 'medium' ) : '' ),
                esc_attr( $this->get_setting( 'enable_photo_capture' ) ),
                esc_attr( $this->get_setting( 'enable_face_guide' ) ),
                esc_attr( $this->get_setting( 'button_color' ) ),
                esc_attr( $this->get_setting( 'button_text_color' ) ),
                esc_attr( $this->get_setting( 'button_style' ) ),
                esc_attr( $this->get_setting( 'camera_resolution' ) ),
                esc_attr( $this->get_setting( 'loading_text' ) ),
                esc_attr( $this->get_setting( 'searching_text' ) ),
                esc_attr( $this->get_setting( 'tracking_text' ) )
            );

            // Add inline script to listen for WooCommerce variation changes
            add_action( 'wp_footer', function() use ( $container_id ) {
                ?>
                <script>
                jQuery(function($) {
                    var $form = $('form.variations_form');
                    var $container = $('#<?php echo esc_js( $container_id ); ?>');
                    if (!$form.length || !$container.length) return;

                    $form.on('found_variation', function(e, variation) {
                        if (variation.ar_model_url) {
                            $container.attr('data-model', variation.ar_model_url);
                            $container.show();

                            // If AR instance exists and is idle, update it
                            var instance = $container[0]._arTryOnInstance;
                            if (instance) {
                                instance.config.modelUrl = variation.ar_model_url;
                                if (instance.state !== 'idle') {
                                    instance.swapModel(variation.ar_model_url);
                                }
                            }
                        } else {
                            $container.hide();
                        }
                    });

                    $form.on('reset_data', function() {
                        var defaultModel = $container.data('model');
                        if (!defaultModel) {
                            $container.hide();
                        }
                    });
                });
                </script>
                <?php
            }, 99 );

        } else {
            // Simple product: standard injection
            echo $this->render_shortcode( array(
                'id'          => $product_id,
                'height'      => 'auto',
                'mode'        => 'modal',
                'button_text' => $button_text,
            ) );
        }
    }

    /**
     * Render AR model field for each variation.
     */
    public function render_variation_fields( $loop, $variation_data, $variation ) {
        $model_url = get_post_meta( $variation->ID, '_ar_variation_model_url', true );
        ?>
        <div class="form-row form-row-full ar-variation-field">
            <p class="form-field">
                <label for="ar_variation_model_<?php echo esc_attr( $loop ); ?>">
                    🕶️ <?php esc_html_e( 'AR Try-On 3D Model (.glb)', 'ar-tryon' ); ?>
                </label>
                <input type="text"
                       id="ar_variation_model_<?php echo esc_attr( $loop ); ?>"
                       name="ar_variation_model_url[<?php echo esc_attr( $loop ); ?>]"
                       value="<?php echo esc_attr( $model_url ); ?>"
                       class="short"
                       placeholder="<?php esc_attr_e( 'URL or select from Media Library...', 'ar-tryon' ); ?>" />
                <button type="button" class="button ar-variation-select-model" data-loop="<?php echo esc_attr( $loop ); ?>">
                    <?php esc_html_e( 'Browse', 'ar-tryon' ); ?>
                </button>
                <?php if ( $model_url ) : ?>
                    <button type="button" class="button ar-variation-remove-model" data-loop="<?php echo esc_attr( $loop ); ?>">
                        ✕
                    </button>
                <?php endif; ?>
            </p>
            <p class="description" style="margin-left:0;">
                <?php esc_html_e( 'Optional. Assign a different 3D model to this variation (e.g., different color).', 'ar-tryon' ); ?>
            </p>
        </div>
        <?php
    }

    /**
     * Save variation AR model field.
     */
    public function save_variation_fields( $variation_id, $loop ) {
        if ( isset( $_POST['ar_variation_model_url'][ $loop ] ) ) {
            $url = esc_url_raw( $_POST['ar_variation_model_url'][ $loop ] );
            update_post_meta( $variation_id, '_ar_variation_model_url', $url );
        }
    }

    /**
     * Add AR model URL to variation data sent to the frontend JS.
     */
    public function add_variation_ar_data( $data, $product, $variation ) {
        $model_url = get_post_meta( $variation->get_id(), '_ar_variation_model_url', true );

        // Fallback to parent product model if variation has none
        if ( empty( $model_url ) ) {
            $model_url = get_post_meta( $product->get_id(), '_ar_model_url', true );
        }

        $data['ar_model_url'] = $model_url ? $model_url : '';
        return $data;
    }

    /* ═══════════════════════════════════════════════════════════════════════
     *  ADMIN MENU & PAGES
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Add top-level admin menu — single unified page.
     */
    public function add_admin_menu() {
        add_menu_page(
            __( 'AR Try-On', 'ar-tryon' ),
            __( 'AR Try-On', 'ar-tryon' ),
            'manage_options',
            'ar-tryon',
            array( $this, 'render_admin_page' ),
            'dashicons-visibility',
            58
        );
    }

    /**
     * Render the unified admin page (all tabs in one).
     */
    public function render_admin_page() {
        include plugin_dir_path( __FILE__ ) . 'admin/admin-page.php';
    }

    /**
     * Add "Settings" link on the Plugins page.
     */
    public function add_settings_link( $links ) {
        $settings_link = '<a href="' . admin_url( 'admin.php?page=ar-tryon' ) . '">' . __( 'Settings', 'ar-tryon' ) . '</a>';
        array_unshift( $links, $settings_link );
        return $links;
    }

    /* ═══════════════════════════════════════════════════════════════════════
     *  ADMIN ASSET ENQUEUING
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Enqueue admin CSS/JS only on plugin pages and WC product editor.
     */
    public function enqueue_admin_assets( $hook ) {
        $is_plugin_page = ( strpos( $hook, 'ar-tryon' ) !== false );
        $is_product_edit = ( $hook === 'post.php' || $hook === 'post-new.php' ) &&
                           isset( $_GET['post'] ) &&
                           get_post_type( absint( $_GET['post'] ) ) === 'product';
        $is_new_product = ( $hook === 'post-new.php' ) &&
                          isset( $_GET['post_type'] ) &&
                          sanitize_key( $_GET['post_type'] ) === 'product';

        if ( ! $is_plugin_page && ! $is_product_edit && ! $is_new_product ) {
            return;
        }

        // Admin CSS
        wp_enqueue_style(
            'ar-tryon-admin-css',
            plugin_dir_url( __FILE__ ) . 'assets/css/ar-admin.css',
            array(),
            self::VERSION
        );

        // WordPress Media Library
        wp_enqueue_media();

        // Color picker — always load on plugin page (Settings is now a tab)
        if ( $is_plugin_page ) {
            wp_enqueue_style( 'wp-color-picker' );
            wp_enqueue_script( 'wp-color-picker' );
        }

        // Admin JS
        wp_enqueue_script(
            'ar-tryon-admin-js',
            plugin_dir_url( __FILE__ ) . 'assets/js/ar-admin.js',
            array( 'jquery' ),
            self::VERSION,
            true
        );

        // Pass data to JS
        wp_localize_script( 'ar-tryon-admin-js', 'arTryOnAdmin', array(
            'nonce'   => wp_create_nonce( 'ar_tryon_admin_nonce' ),
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'i18n'    => array(
                'selectModel'     => __( 'Select 3D Model (.glb or .gltf)', 'ar-tryon' ),
                'useModel'        => __( 'Use this model', 'ar-tryon' ),
                'selectFirst'     => __( 'Please select a 3D model first.', 'ar-tryon' ),
                'saving'          => __( 'Saving...', 'ar-tryon' ),
                'saved'           => __( '✓ Settings saved!', 'ar-tryon' ),
                'saveError'       => __( 'Error saving: ', 'ar-tryon' ),
                'networkError'    => __( 'Network error. Please try again.', 'ar-tryon' ),
                'saveReference'   => __( 'Save Reference Settings', 'ar-tryon' ),
                'restartPreview'  => __( 'Restart AR Preview', 'ar-tryon' ),
            ),
        ) );

        // On the plugin page, also load the AR engine for calibration
        if ( $is_plugin_page ) {
            $this->shortcode_used = true;

            wp_enqueue_style(
                'ar-tryon-css',
                plugin_dir_url( __FILE__ ) . 'assets/css/ar-tryon.css',
                array(),
                self::VERSION
            );

            add_action( 'admin_footer', array( $this, 'output_module_scripts' ), 5 );
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════
     *  GUTENBERG BLOCK
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Register the Gutenberg block with server-side rendering.
     */
    public function register_gutenberg_block() {
        if ( ! function_exists( 'register_block_type' ) ) {
            return;
        }

        // Register editor script
        wp_register_script(
            'ar-tryon-block-editor',
            plugin_dir_url( __FILE__ ) . 'assets/js/ar-block.js',
            array( 'wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-server-side-render' ),
            self::VERSION,
            true
        );

        register_block_type( 'ar-tryon/try-on', array(
            'editor_script'   => 'ar-tryon-block-editor',
            'render_callback' => array( $this, 'render_gutenberg_block' ),
            'attributes'      => array(
                'productId'  => array( 'type' => 'number', 'default' => 0 ),
                'modelUrl'   => array( 'type' => 'string', 'default' => '' ),
                'height'     => array( 'type' => 'string', 'default' => '500px' ),
                'buttonText' => array( 'type' => 'string', 'default' => '' ),
                'scale'      => array( 'type' => 'string', 'default' => '' ),
                'offsetX'    => array( 'type' => 'string', 'default' => '' ),
                'offsetY'    => array( 'type' => 'string', 'default' => '' ),
                'offsetZ'    => array( 'type' => 'string', 'default' => '' ),
            ),
        ) );
    }

    /**
     * Server-side render callback for the Gutenberg block.
     * Translates block attributes → shortcode call.
     */
    public function render_gutenberg_block( $attributes ) {
        $atts = array();

        if ( ! empty( $attributes['productId'] ) ) {
            $atts['id'] = $attributes['productId'];
        }
        if ( ! empty( $attributes['modelUrl'] ) ) {
            $atts['model'] = $attributes['modelUrl'];
        }
        if ( ! empty( $attributes['height'] ) ) {
            $atts['height'] = $attributes['height'];
        }
        if ( ! empty( $attributes['buttonText'] ) ) {
            $atts['button_text'] = $attributes['buttonText'];
        }
        if ( $attributes['scale'] !== '' ) {
            $atts['scale'] = $attributes['scale'];
        }
        if ( $attributes['offsetX'] !== '' ) {
            $atts['offset_x'] = $attributes['offsetX'];
        }
        if ( $attributes['offsetY'] !== '' ) {
            $atts['offset_y'] = $attributes['offsetY'];
        }
        if ( $attributes['offsetZ'] !== '' ) {
            $atts['offset_z'] = $attributes['offsetZ'];
        }

        return $this->render_shortcode( $atts );
    }

    /* ═══════════════════════════════════════════════════════════════════════
     *  AJAX HANDLERS
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * AJAX: Save reference calibration settings.
     */
    public function ajax_save_reference() {
        check_ajax_referer( 'ar_tryon_admin_nonce', 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( __( 'Permission denied.', 'ar-tryon' ) );
        }

        $model_url = isset( $_POST['model_url'] ) ? esc_url_raw( $_POST['model_url'] ) : '';

        // Validate numeric values
        $scale    = isset( $_POST['scale'] ) && is_numeric( $_POST['scale'] ) ? sanitize_text_field( $_POST['scale'] ) : '2.5';
        $offset_x = isset( $_POST['offset_x'] ) && is_numeric( $_POST['offset_x'] ) ? sanitize_text_field( $_POST['offset_x'] ) : '0';
        $offset_y = isset( $_POST['offset_y'] ) && is_numeric( $_POST['offset_y'] ) ? sanitize_text_field( $_POST['offset_y'] ) : '0';
        $offset_z = isset( $_POST['offset_z'] ) && is_numeric( $_POST['offset_z'] ) ? sanitize_text_field( $_POST['offset_z'] ) : '0';

        update_option( 'ar_tryon_ref_model_url', $model_url );
        update_option( 'ar_tryon_ref_scale', $scale );
        update_option( 'ar_tryon_ref_offset_x', $offset_x );
        update_option( 'ar_tryon_ref_offset_y', $offset_y );
        update_option( 'ar_tryon_ref_offset_z', $offset_z );

        wp_send_json_success( __( 'Reference settings saved.', 'ar-tryon' ) );
    }
}

// Initialize the plugin
AR_TryOn_Plugin::get_instance();
