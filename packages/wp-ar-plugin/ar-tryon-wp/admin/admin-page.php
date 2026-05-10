<?php
/**
 * AR Try-On — Unified Admin Page
 *
 * Single admin shell with shared header and consistent navigation.
 * All sections (Calibration, Settings, Documentation) are tabs in the same page.
 *
 * @package AR_TryOn
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$plugin        = AR_TryOn_Plugin::get_instance();
$settings      = get_option( 'ar_tryon_settings', $plugin->get_default_settings() );
$defaults      = $plugin->get_default_settings();
$settings      = wp_parse_args( $settings, $defaults );
$current_tab   = isset( $_GET['tab'] ) ? sanitize_key( $_GET['tab'] ) : 'calibration';
$valid_tabs    = array( 'calibration', 'settings', 'usage' );
$current_tab   = in_array( $current_tab, $valid_tabs, true ) ? $current_tab : 'calibration';
?>
<div class="wrap ar-admin-wrap">

    <!-- ═══ Unified Header ═══ -->
    <div class="ar-admin-header">
        <div class="ar-admin-header-left">
            <div class="ar-admin-logo">
                <span class="dashicons dashicons-visibility"></span>
            </div>
            <div>
                <h1><?php esc_html_e( 'AR Try-On', 'ar-tryon' ); ?></h1>
                <p class="ar-admin-subtitle">
                    <?php esc_html_e( 'Augmented Reality virtual try-on for WooCommerce', 'ar-tryon' ); ?>
                    <span class="ar-admin-version">v<?php echo esc_html( AR_TryOn_Plugin::VERSION ); ?></span>
                </p>
            </div>
        </div>
        <div class="ar-admin-header-right">
            <?php if ( class_exists( 'WooCommerce' ) ) : ?>
                <span class="ar-admin-badge ar-admin-badge-success">
                    <span class="dashicons dashicons-yes-alt"></span> WooCommerce
                </span>
            <?php endif; ?>
            <span class="ar-admin-badge">
                <span class="dashicons dashicons-lock"></span> HTTPS <?php echo is_ssl() ? '✓' : '✗'; ?>
            </span>
        </div>
    </div>

    <!-- ═══ Tab Navigation ═══ -->
    <nav class="ar-admin-nav" role="tablist" aria-label="<?php esc_attr_e( 'AR Try-On sections', 'ar-tryon' ); ?>">
        <a href="#"
           class="ar-admin-nav-tab <?php echo $current_tab === 'calibration' ? 'is-active' : ''; ?>"
           data-tab="calibration"
           role="tab"
           aria-selected="<?php echo $current_tab === 'calibration' ? 'true' : 'false'; ?>">
            <span class="dashicons dashicons-admin-generic"></span>
            <span><?php esc_html_e( 'Calibration', 'ar-tryon' ); ?></span>
        </a>
        <a href="#"
           class="ar-admin-nav-tab <?php echo $current_tab === 'settings' ? 'is-active' : ''; ?>"
           data-tab="settings"
           role="tab"
           aria-selected="<?php echo $current_tab === 'settings' ? 'true' : 'false'; ?>">
            <span class="dashicons dashicons-admin-appearance"></span>
            <span><?php esc_html_e( 'Appearance & Settings', 'ar-tryon' ); ?></span>
        </a>
        <a href="#"
           class="ar-admin-nav-tab <?php echo $current_tab === 'usage' ? 'is-active' : ''; ?>"
           data-tab="usage"
           role="tab"
           aria-selected="<?php echo $current_tab === 'usage' ? 'true' : 'false'; ?>">
            <span class="dashicons dashicons-book"></span>
            <span><?php esc_html_e( 'Documentation', 'ar-tryon' ); ?></span>
        </a>
    </nav>

    <!-- ═══ TAB: Calibration ═══ -->
    <div id="ar-tab-calibration"
         class="ar-admin-tab-content <?php echo $current_tab === 'calibration' ? 'is-active' : ''; ?>"
         role="tabpanel">
        <?php include plugin_dir_path( __FILE__ ) . 'calibration-ui.php'; ?>
    </div>

    <!-- ═══ TAB: Appearance & Settings ═══ -->
    <div id="ar-tab-settings"
         class="ar-admin-tab-content <?php echo $current_tab === 'settings' ? 'is-active' : ''; ?>"
         role="tabpanel">
        <?php include plugin_dir_path( __FILE__ ) . 'settings-ui.php'; ?>
    </div>

    <!-- ═══ TAB: Documentation ═══ -->
    <div id="ar-tab-usage"
         class="ar-admin-tab-content <?php echo $current_tab === 'usage' ? 'is-active' : ''; ?>"
         role="tabpanel">
        <?php include plugin_dir_path( __FILE__ ) . 'docs-ui.php'; ?>
    </div>

</div>
