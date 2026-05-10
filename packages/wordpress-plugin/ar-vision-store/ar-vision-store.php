<?php
/**
 * Plugin Name: AR Vision Store
 * Plugin URI: https://arvision.store
 * Description: High-performance AR Try-On for WordPress. Secure, modular, and easy to use.
 * Version: 1.0.0
 * Author: AR Vision Team
 * License: GPL2
 */

if (!defined('ABSPATH')) exit;

class ARVisionStore {
    public function __construct() {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_shortcode('ar_tryon', [$this, 'render_shortcode']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
    }

    /**
     * Enqueue the core AR engine from our CDN.
     * This script handles license validation and UI injection.
     */
    public function enqueue_assets() {
        $api_key = get_option('ar_vision_api_key');
        if (!$api_key) return;

        // In production, this would be your secure CDN URL
        // For development, we'll point to a local or placeholder URL
        wp_enqueue_script(
            'ar-engine-core', 
            'https://cdn.arvision.store/v1/ar-engine.min.js', 
            [], 
            '1.0.0', 
            true
        );
    }

    /**
     * Render the AR Try-On button via shortcode.
     * Usage: [ar_tryon model_url="..." product_name="..." scale="2.5"]
     */
    public function render_shortcode($atts) {
        $api_key = get_option('ar_vision_api_key');
        if (!$api_key) {
            return '<!-- AR Vision Store: Missing API Key -->';
        }

        $a = shortcode_atts([
            'model_url' => '',
            'product_name' => 'AR Product',
            'scale' => '2.5',
            'offset_x' => '0',
            'offset_y' => '0',
            'offset_z' => '0',
            'button_text' => 'Virtual Try-On',
            'button_class' => ''
        ], $atts);

        if (empty($a['model_url'])) {
            return '<!-- AR Vision Store: Missing Model URL -->';
        }

        // Output the button with data attributes that the AR Engine bootstraps
        ob_start();
        ?>
        <button 
            class="ar-tryon-trigger <?php echo esc_attr($a['button_class']); ?>"
            data-ar-button
            data-api-key="<?php echo esc_attr($api_key); ?>"
            data-model-url="<?php echo esc_url($a['model_url']); ?>"
            data-product-name="<?php echo esc_attr($a['product_name']); ?>"
            data-scale="<?php echo esc_attr($a['scale']); ?>"
            data-offset-x="<?php echo esc_attr($a['offset_x']); ?>"
            data-offset-y="<?php echo esc_attr($a['offset_y']); ?>"
            data-offset-z="<?php echo esc_attr($a['offset_z']); ?>"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <?php echo esc_html($a['button_text']); ?>
        </button>
        <?php
        return ob_get_clean();
    }

    public function add_admin_menu() {
        add_options_page(
            'AR Vision Store Settings',
            'AR Vision Store',
            'manage_options',
            'ar-vision-store',
            [$this, 'settings_page']
        );
    }

    public function register_settings() {
        register_setting('ar_vision_settings', 'ar_vision_api_key');
    }

    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>AR Vision Store Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('ar_vision_settings');
                do_settings_sections('ar_vision_settings');
                ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">API Key</th>
                        <td>
                            <input type="text" name="ar_vision_api_key" value="<?php echo esc_attr(get_option('ar_vision_api_key')); ?>" class="regular-text" />
                            <p class="description">Get your API key from the <a href="https://dashboard.arvision.store" target="_blank">AR Vision Dashboard</a>.</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}

new ARVisionStore();
