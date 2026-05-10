<?php
/**
 * AR Try-On — Settings Page
 *
 * Global plugin settings: button appearance, camera, features.
 *
 * @package AR_TryOn
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$plugin = AR_TryOn_Plugin::get_instance();
$settings = get_option( 'ar_tryon_settings', $plugin->get_default_settings() );
$defaults = $plugin->get_default_settings();

// Merge with defaults to ensure all keys exist
$settings = wp_parse_args( $settings, $defaults );
?>
<div class="wrap">
    <h1>
        <span class="dashicons dashicons-visibility" style="font-size:28px;margin-right:8px;vertical-align:middle;"></span>
        <?php esc_html_e( 'AR Try-On Settings', 'ar-tryon' ); ?>
    </h1>
    <p style="font-size:14px;color:#646970;max-width:700px;margin-bottom:20px;">
        <?php esc_html_e( 'Configure the global appearance and behavior of the AR Try-On experience across your site.', 'ar-tryon' ); ?>
    </p>

    <form method="post" action="options.php">
        <?php settings_fields( 'ar_tryon_settings' ); ?>

        <!-- ═══ Button Appearance ═══ -->
        <div class="card ar-settings-card">
            <h2><?php esc_html_e( 'Button Appearance', 'ar-tryon' ); ?></h2>
            <p class="description"><?php esc_html_e( 'Customize how the "Try On" button looks on your product pages and shortcodes.', 'ar-tryon' ); ?></p>

            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">
                        <label for="ar-btn-text"><?php esc_html_e( 'Button Text', 'ar-tryon' ); ?></label>
                    </th>
                    <td>
                        <input type="text"
                               id="ar-btn-text"
                               name="ar_tryon_settings[button_text]"
                               value="<?php echo esc_attr( $settings['button_text'] ); ?>"
                               class="regular-text" />
                        <p class="description"><?php esc_html_e( 'Text shown on the activation button.', 'ar-tryon' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="ar-btn-style"><?php esc_html_e( 'Button Style', 'ar-tryon' ); ?></label>
                    </th>
                    <td>
                        <select id="ar-btn-style" name="ar_tryon_settings[button_style]">
                            <option value="solid" <?php selected( $settings['button_style'], 'solid' ); ?>><?php esc_html_e( 'Solid (filled background)', 'ar-tryon' ); ?></option>
                            <option value="outline" <?php selected( $settings['button_style'], 'outline' ); ?>><?php esc_html_e( 'Outline (border only)', 'ar-tryon' ); ?></option>
                            <option value="minimal" <?php selected( $settings['button_style'], 'minimal' ); ?>><?php esc_html_e( 'Minimal (text + icon)', 'ar-tryon' ); ?></option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="ar-btn-color"><?php esc_html_e( 'Button Color', 'ar-tryon' ); ?></label>
                    </th>
                    <td>
                        <input type="text"
                               id="ar-btn-color"
                               name="ar_tryon_settings[button_color]"
                               value="<?php echo esc_attr( $settings['button_color'] ); ?>"
                               class="ar-color-picker"
                               data-default-color="#111111" />
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="ar-btn-text-color"><?php esc_html_e( 'Button Text Color', 'ar-tryon' ); ?></label>
                    </th>
                    <td>
                        <input type="text"
                               id="ar-btn-text-color"
                               name="ar_tryon_settings[button_text_color]"
                               value="<?php echo esc_attr( $settings['button_text_color'] ); ?>"
                               class="ar-color-picker"
                               data-default-color="#ffffff" />
                    </td>
                </tr>
            </table>

            <!-- Live Preview -->
            <div class="ar-settings-preview">
                <p style="font-weight:600;font-size:13px;margin-bottom:8px;"><?php esc_html_e( 'Preview:', 'ar-tryon' ); ?></p>
                <div class="ar-settings-preview-box">
                    <button type="button" id="ar-settings-btn-preview" class="ar-settings-preview-btn"
                            style="background-color:<?php echo esc_attr( $settings['button_color'] ); ?>;color:<?php echo esc_attr( $settings['button_text_color'] ); ?>;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                        <span><?php echo esc_html( $settings['button_text'] ); ?></span>
                    </button>
                </div>
            </div>
        </div>

        <!-- ═══ Camera & Performance ═══ -->
        <div class="card ar-settings-card">
            <h2><?php esc_html_e( 'Camera & Performance', 'ar-tryon' ); ?></h2>

            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">
                        <label for="ar-camera-res"><?php esc_html_e( 'Camera Resolution', 'ar-tryon' ); ?></label>
                    </th>
                    <td>
                        <select id="ar-camera-res" name="ar_tryon_settings[camera_resolution]">
                            <option value="480" <?php selected( $settings['camera_resolution'], '480' ); ?>><?php esc_html_e( '480p — Fastest (low-end devices)', 'ar-tryon' ); ?></option>
                            <option value="640" <?php selected( $settings['camera_resolution'], '640' ); ?>><?php esc_html_e( '640p — Balanced (recommended)', 'ar-tryon' ); ?></option>
                            <option value="720" <?php selected( $settings['camera_resolution'], '720' ); ?>><?php esc_html_e( '720p — High quality', 'ar-tryon' ); ?></option>
                            <option value="1080" <?php selected( $settings['camera_resolution'], '1080' ); ?>><?php esc_html_e( '1080p — Max quality (desktop only)', 'ar-tryon' ); ?></option>
                        </select>
                        <p class="description"><?php esc_html_e( 'Higher resolutions look better but may slow down face tracking on mobile devices.', 'ar-tryon' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Mobile Devices', 'ar-tryon' ); ?></th>
                    <td>
                        <label>
                            <input type="checkbox"
                                   name="ar_tryon_settings[enable_mobile]"
                                   value="1"
                                   <?php checked( $settings['enable_mobile'], '1' ); ?> />
                            <?php esc_html_e( 'Enable AR Try-On on mobile devices', 'ar-tryon' ); ?>
                        </label>
                        <p class="description"><?php esc_html_e( 'Uncheck to hide the Try-On button on phones/tablets. Useful if your models are too heavy for mobile.', 'ar-tryon' ); ?></p>
                    </td>
                </tr>
            </table>
        </div>

        <!-- ═══ Features ═══ -->
        <div class="card ar-settings-card">
            <h2><?php esc_html_e( 'Features', 'ar-tryon' ); ?></h2>

            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><?php esc_html_e( 'Photo Capture', 'ar-tryon' ); ?></th>
                    <td>
                        <label>
                            <input type="checkbox"
                                   name="ar_tryon_settings[enable_photo_capture]"
                                   value="1"
                                   <?php checked( $settings['enable_photo_capture'], '1' ); ?> />
                            <?php esc_html_e( 'Enable screenshot button during AR try-on', 'ar-tryon' ); ?>
                        </label>
                        <p class="description"><?php esc_html_e( 'Lets users take a photo while trying on glasses. The image is rendered locally and never uploaded.', 'ar-tryon' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Face Guide', 'ar-tryon' ); ?></th>
                    <td>
                        <label>
                            <input type="checkbox"
                                   name="ar_tryon_settings[enable_face_guide]"
                                   value="1"
                                   <?php checked( $settings['enable_face_guide'], '1' ); ?> />
                            <?php esc_html_e( 'Show face positioning guide when searching for a face', 'ar-tryon' ); ?>
                        </label>
                    </td>
                </tr>
            </table>
        </div>

        <!-- ═══ Text Customization ═══ -->
        <div class="card ar-settings-card">
            <h2><?php esc_html_e( 'Status Messages', 'ar-tryon' ); ?></h2>
            <p class="description"><?php esc_html_e( 'Customize the text shown during different AR states.', 'ar-tryon' ); ?></p>

            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">
                        <label for="ar-loading-text"><?php esc_html_e( 'Loading Text', 'ar-tryon' ); ?></label>
                    </th>
                    <td>
                        <input type="text"
                               id="ar-loading-text"
                               name="ar_tryon_settings[loading_text]"
                               value="<?php echo esc_attr( $settings['loading_text'] ); ?>"
                               class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="ar-searching-text"><?php esc_html_e( 'Searching Text', 'ar-tryon' ); ?></label>
                    </th>
                    <td>
                        <input type="text"
                               id="ar-searching-text"
                               name="ar_tryon_settings[searching_text]"
                               value="<?php echo esc_attr( $settings['searching_text'] ); ?>"
                               class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="ar-tracking-text"><?php esc_html_e( 'Tracking Text', 'ar-tryon' ); ?></label>
                    </th>
                    <td>
                        <input type="text"
                               id="ar-tracking-text"
                               name="ar_tryon_settings[tracking_text]"
                               value="<?php echo esc_attr( $settings['tracking_text'] ); ?>"
                               class="regular-text" />
                    </td>
                </tr>
            </table>
        </div>

        <?php submit_button( __( 'Save Settings', 'ar-tryon' ) ); ?>
    </form>

    <div class="card ar-settings-card" style="margin-top:40px; border-top: 4px solid #72aee6;">
        <h2><?php esc_html_e( 'System Information', 'ar-tryon' ); ?></h2>
        <p class="description"><?php esc_html_e( 'Verification of server environment for 3D models.', 'ar-tryon' ); ?></p>

        <table class="form-table" role="presentation">
            <tr>
                <th scope="row"><?php esc_html_e( 'Max Upload Size', 'ar-tryon' ); ?></th>
                <td>
                    <code style="font-size:16px; font-weight:bold;"><?php echo size_format( wp_max_upload_size() ); ?></code>
                    <p class="description" style="margin-top:10px;">
                        <?php
                        $max_size = wp_max_upload_size();
                        if ( $max_size < 10 * 1024 * 1024 ) {
                            echo '<span style="background:#fcf0f1; border-left:4px solid #d63638; padding:10px; display:block; color:#d63638; font-weight:600;">' .
                                 __( '⚠️ Warning: Your upload limit is very low. 3D models typically require 5MB - 50MB.', 'ar-tryon' ) . '<br>' .
                                 __( 'If you see errors, ask your host to increase "upload_max_filesize" and "post_max_size" in PHP.', 'ar-tryon' ) .
                                 '</span>';
                        } else {
                            echo '<span style="background:#f0f8f1; border-left:4px solid #00a32a; padding:10px; display:block; color:#00a32a; font-weight:600;">' .
                                 __( '✅ Optimal: Your server allows uploading large 3D models.', 'ar-tryon' ) .
                                 '</span>';
                        }
                        ?>
                    </p>
                </td>
            </tr>
            <tr>
                <th scope="row"><?php esc_html_e( 'PHP Limits', 'ar-tryon' ); ?></th>
                <td>
                    <ul style="margin:0; padding:0; list-style:none;">
                        <li><code>upload_max_filesize</code>: <strong><?php echo ini_get( 'upload_max_filesize' ); ?></strong></li>
                        <li><code>post_max_size</code>: <strong><?php echo ini_get( 'post_max_size' ); ?></strong></li>
                        <li><code>memory_limit</code>: <strong><?php echo ini_get( 'memory_limit' ); ?></strong></li>
                    </ul>
                </td>
            </tr>
        </table>
    </div>
</div>
