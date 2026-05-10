<?php
/**
 * AR Try-On — Settings UI (Tab Panel)
 *
 * Renders inside the unified admin page as the "Appearance & Settings" tab.
 * Uses the same card/panel design system as the Calibration tab.
 *
 * @package AR_TryOn
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// $settings and $defaults are already defined by the parent admin-page.php
?>

<div class="ar-admin-section-intro">
    <span class="dashicons dashicons-admin-appearance"></span>
    <div>
        <h2><?php esc_html_e( 'Appearance & Settings', 'ar-tryon' ); ?></h2>
        <p><?php esc_html_e( 'Configure how the AR Try-On button and experience looks across your site. Changes apply to all products and shortcodes.', 'ar-tryon' ); ?></p>
    </div>
</div>

<form method="post" action="options.php" class="ar-admin-settings-form">
    <?php settings_fields( 'ar_tryon_settings' ); ?>

    <div class="ar-admin-settings-grid">

        <!-- ═══ LEFT COLUMN: Settings ═══ -->
        <div class="ar-admin-settings-main">

            <!-- Button Appearance -->
            <div class="ar-admin-panel">
                <div class="ar-admin-panel-header">
                    <span class="dashicons dashicons-button"></span>
                    <h3><?php esc_html_e( 'Button Appearance', 'ar-tryon' ); ?></h3>
                </div>
                <div class="ar-admin-panel-body">
                    <div class="ar-admin-form-group">
                        <label for="ar-btn-text"><?php esc_html_e( 'Button Text', 'ar-tryon' ); ?></label>
                        <input type="text"
                               id="ar-btn-text"
                               name="ar_tryon_settings[button_text]"
                               value="<?php echo esc_attr( $settings['button_text'] ); ?>"
                               class="regular-text" />
                        <p class="ar-admin-help"><?php esc_html_e( 'Text shown on the activation button.', 'ar-tryon' ); ?></p>
                    </div>

                    <div class="ar-admin-form-row">
                        <div class="ar-admin-form-group">
                            <label for="ar-btn-style"><?php esc_html_e( 'Button Style', 'ar-tryon' ); ?></label>
                            <select id="ar-btn-style" name="ar_tryon_settings[button_style]">
                                <option value="solid" <?php selected( $settings['button_style'], 'solid' ); ?>><?php esc_html_e( 'Solid — Filled background', 'ar-tryon' ); ?></option>
                                <option value="outline" <?php selected( $settings['button_style'], 'outline' ); ?>><?php esc_html_e( 'Outline — Border only', 'ar-tryon' ); ?></option>
                                <option value="minimal" <?php selected( $settings['button_style'], 'minimal' ); ?>><?php esc_html_e( 'Minimal — Text + icon', 'ar-tryon' ); ?></option>
                            </select>
                        </div>
                    </div>

                    <div class="ar-admin-form-row">
                        <div class="ar-admin-form-group">
                            <label for="ar-btn-color"><?php esc_html_e( 'Button Color', 'ar-tryon' ); ?></label>
                            <input type="text"
                                   id="ar-btn-color"
                                   name="ar_tryon_settings[button_color]"
                                   value="<?php echo esc_attr( $settings['button_color'] ); ?>"
                                   class="ar-color-picker"
                                   data-default-color="#111111" />
                        </div>
                        <div class="ar-admin-form-group">
                            <label for="ar-btn-text-color"><?php esc_html_e( 'Text Color', 'ar-tryon' ); ?></label>
                            <input type="text"
                                   id="ar-btn-text-color"
                                   name="ar_tryon_settings[button_text_color]"
                                   value="<?php echo esc_attr( $settings['button_text_color'] ); ?>"
                                   class="ar-color-picker"
                                   data-default-color="#ffffff" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Camera & Performance -->
            <div class="ar-admin-panel">
                <div class="ar-admin-panel-header">
                    <span class="dashicons dashicons-camera"></span>
                    <h3><?php esc_html_e( 'Camera & Performance', 'ar-tryon' ); ?></h3>
                </div>
                <div class="ar-admin-panel-body">
                    <div class="ar-admin-form-group">
                        <label for="ar-camera-res"><?php esc_html_e( 'Camera Resolution', 'ar-tryon' ); ?></label>
                        <select id="ar-camera-res" name="ar_tryon_settings[camera_resolution]">
                            <option value="480" <?php selected( $settings['camera_resolution'], '480' ); ?>><?php esc_html_e( '480p — Fastest (low-end devices)', 'ar-tryon' ); ?></option>
                            <option value="640" <?php selected( $settings['camera_resolution'], '640' ); ?>><?php esc_html_e( '640p — Balanced (recommended)', 'ar-tryon' ); ?></option>
                            <option value="720" <?php selected( $settings['camera_resolution'], '720' ); ?>><?php esc_html_e( '720p — High quality', 'ar-tryon' ); ?></option>
                            <option value="1080" <?php selected( $settings['camera_resolution'], '1080' ); ?>><?php esc_html_e( '1080p — Maximum quality', 'ar-tryon' ); ?></option>
                        </select>
                        <p class="ar-admin-help"><?php esc_html_e( 'Higher resolutions look better but may slow down face tracking on mobile devices.', 'ar-tryon' ); ?></p>
                    </div>

                    <div class="ar-admin-form-group">
                        <label class="ar-admin-toggle-label">
                            <input type="checkbox"
                                   name="ar_tryon_settings[enable_mobile]"
                                   value="1"
                                   <?php checked( $settings['enable_mobile'], '1' ); ?> />
                            <span class="ar-admin-toggle-switch"></span>
                            <?php esc_html_e( 'Enable on mobile devices', 'ar-tryon' ); ?>
                        </label>
                        <p class="ar-admin-help"><?php esc_html_e( 'Uncheck to hide the Try-On button on phones and tablets.', 'ar-tryon' ); ?></p>
                    </div>
                </div>
            </div>

            <!-- Features -->
            <div class="ar-admin-panel">
                <div class="ar-admin-panel-header">
                    <span class="dashicons dashicons-star-filled"></span>
                    <h3><?php esc_html_e( 'Features', 'ar-tryon' ); ?></h3>
                </div>
                <div class="ar-admin-panel-body">
                    <div class="ar-admin-form-group">
                        <label class="ar-admin-toggle-label">
                            <input type="checkbox"
                                   name="ar_tryon_settings[enable_photo_capture]"
                                   value="1"
                                   <?php checked( $settings['enable_photo_capture'], '1' ); ?> />
                            <span class="ar-admin-toggle-switch"></span>
                            <?php esc_html_e( 'Photo capture', 'ar-tryon' ); ?>
                        </label>
                        <p class="ar-admin-help"><?php esc_html_e( 'Lets visitors take a screenshot while trying on glasses. Images are rendered locally and never uploaded.', 'ar-tryon' ); ?></p>
                    </div>

                    <div class="ar-admin-form-group">
                        <label class="ar-admin-toggle-label">
                            <input type="checkbox"
                                   name="ar_tryon_settings[enable_face_guide]"
                                   value="1"
                                   <?php checked( $settings['enable_face_guide'], '1' ); ?> />
                            <span class="ar-admin-toggle-switch"></span>
                            <?php esc_html_e( 'Face positioning guide', 'ar-tryon' ); ?>
                        </label>
                        <p class="ar-admin-help"><?php esc_html_e( 'Show a guide frame when searching for a face to help users position correctly.', 'ar-tryon' ); ?></p>
                    </div>
                </div>
            </div>

            <!-- Status Messages -->
            <div class="ar-admin-panel">
                <div class="ar-admin-panel-header">
                    <span class="dashicons dashicons-megaphone"></span>
                    <h3><?php esc_html_e( 'Status Messages', 'ar-tryon' ); ?></h3>
                </div>
                <div class="ar-admin-panel-body">
                    <p class="ar-admin-help" style="margin-top:0;"><?php esc_html_e( 'Customize the text shown during different AR states.', 'ar-tryon' ); ?></p>

                    <div class="ar-admin-form-group">
                        <label for="ar-loading-text"><?php esc_html_e( 'Loading', 'ar-tryon' ); ?></label>
                        <input type="text" id="ar-loading-text" name="ar_tryon_settings[loading_text]"
                               value="<?php echo esc_attr( $settings['loading_text'] ); ?>" class="regular-text" />
                    </div>
                    <div class="ar-admin-form-group">
                        <label for="ar-searching-text"><?php esc_html_e( 'Searching', 'ar-tryon' ); ?></label>
                        <input type="text" id="ar-searching-text" name="ar_tryon_settings[searching_text]"
                               value="<?php echo esc_attr( $settings['searching_text'] ); ?>" class="regular-text" />
                    </div>
                    <div class="ar-admin-form-group">
                        <label for="ar-tracking-text"><?php esc_html_e( 'Tracking', 'ar-tryon' ); ?></label>
                        <input type="text" id="ar-tracking-text" name="ar_tryon_settings[tracking_text]"
                               value="<?php echo esc_attr( $settings['tracking_text'] ); ?>" class="regular-text" />
                    </div>
                </div>
            </div>

            <!-- Save Button -->
            <div class="ar-admin-settings-save">
                <?php submit_button( __( 'Save All Settings', 'ar-tryon' ), 'primary large', 'submit', false ); ?>
            </div>

        </div>

        <!-- ═══ RIGHT COLUMN: Live Preview ═══ -->
        <div class="ar-admin-settings-sidebar">
            <div class="ar-admin-panel ar-admin-sticky">
                <div class="ar-admin-panel-header">
                    <span class="dashicons dashicons-visibility"></span>
                    <h3><?php esc_html_e( 'Live Preview', 'ar-tryon' ); ?></h3>
                </div>
                <div class="ar-admin-panel-body">
                    <p class="ar-admin-help" style="margin-top:0;"><?php esc_html_e( 'This is how your AR Try-On button will look on the frontend.', 'ar-tryon' ); ?></p>
                    <div class="ar-settings-preview-box">
                        <button type="button" id="ar-settings-btn-preview" class="ar-settings-preview-btn"
                                style="background-color:<?php echo esc_attr( $settings['button_color'] ); ?>;color:<?php echo esc_attr( $settings['button_text_color'] ); ?>;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                            <span><?php echo esc_html( $settings['button_text'] ); ?></span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- System Info (sidebar card) -->
            <div class="ar-admin-panel">
                <div class="ar-admin-panel-header">
                    <span class="dashicons dashicons-info-outline"></span>
                    <h3><?php esc_html_e( 'System Info', 'ar-tryon' ); ?></h3>
                </div>
                <div class="ar-admin-panel-body ar-admin-sysinfo">
                    <div class="ar-admin-sysinfo-row">
                        <span><?php esc_html_e( 'Plugin', 'ar-tryon' ); ?></span>
                        <strong>v<?php echo esc_html( AR_TryOn_Plugin::VERSION ); ?></strong>
                    </div>
                    <div class="ar-admin-sysinfo-row">
                        <span>Three.js</span>
                        <strong><?php echo esc_html( AR_TryOn_Plugin::THREEJS_VERSION ); ?></strong>
                    </div>
                    <div class="ar-admin-sysinfo-row">
                        <span>WooCommerce</span>
                        <strong><?php echo class_exists( 'WooCommerce' ) ? '<span style="color:#00a32a;">✓ ' . esc_html__( 'Active', 'ar-tryon' ) . '</span>' : '<span style="color:#646970;">' . esc_html__( 'Not detected', 'ar-tryon' ) . '</span>'; ?></strong>
                    </div>
                    <div class="ar-admin-sysinfo-row">
                        <span>PHP</span>
                        <strong><?php echo esc_html( phpversion() ); ?></strong>
                    </div>
                    <div class="ar-admin-sysinfo-row">
                        <span>WordPress</span>
                        <strong><?php echo esc_html( get_bloginfo( 'version' ) ); ?></strong>
                    </div>
                </div>
            </div>
        </div>

    </div>
</form>
