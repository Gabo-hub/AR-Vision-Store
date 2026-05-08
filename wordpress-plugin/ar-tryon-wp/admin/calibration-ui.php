<?php
/**
 * AR Try-On — Reference Model Calibration Page
 *
 * Two-column layout:
 *  - Left: Model picker + calibration sliders (position, rotation)
 *  - Right: Live AR preview (uses the same engine as the frontend)
 *
 * @package AR_TryOn
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Get current saved reference settings
$ref_model     = get_option( 'ar_tryon_ref_model_url', '' );
$ref_scale     = get_option( 'ar_tryon_ref_scale', '2.5' );
$ref_offset_x  = get_option( 'ar_tryon_ref_offset_x', '0' );
$ref_offset_y  = get_option( 'ar_tryon_ref_offset_y', '0' );
$ref_offset_z  = get_option( 'ar_tryon_ref_offset_z', '0' );
?>

<div class="ar-admin-notice">
    <strong><?php esc_html_e( 'How Reference Calibration Works:', 'ar-tryon' ); ?></strong><br>
    <?php esc_html_e( 'Upload a reference 3D glasses model and adjust the calibration until it looks perfect.', 'ar-tryon' ); ?>
    <?php esc_html_e( 'These settings become the global defaults for all products.', 'ar-tryon' ); ?>
    <?php esc_html_e( 'Any new glasses model exported at the same scale will automatically look correct — no per-product calibration needed.', 'ar-tryon' ); ?>
</div>

<div class="ar-admin-calibration">

    <!-- ═══ LEFT PANEL: Settings ═══ -->
    <div class="ar-admin-panel">
        <h2>
            <span class="dashicons dashicons-admin-settings" style="margin-right:6px;"></span>
            <?php esc_html_e( 'Reference Settings', 'ar-tryon' ); ?>
        </h2>

        <!-- Model Picker -->
        <div class="ar-admin-model-picker">
            <label for="ar-ref-model-url"><?php esc_html_e( 'Reference 3D Model (.glb / .gltf)', 'ar-tryon' ); ?></label>
            <div class="ar-admin-model-row">
                <input type="text"
                       id="ar-ref-model-url"
                       class="ar-admin-model-url"
                       value="<?php echo esc_attr( $ref_model ); ?>"
                       placeholder="<?php esc_attr_e( 'Select a model from the Media Library...', 'ar-tryon' ); ?>"
                       readonly />
                <button type="button" id="ar-btn-select-model" class="button button-primary ar-admin-btn-select-model">
                    <span class="dashicons dashicons-upload" style="line-height:1.4;"></span> <?php esc_html_e( 'Browse', 'ar-tryon' ); ?>
                </button>
            </div>
        </div>

        <!-- Calibration Sliders -->
        <div class="ar-admin-sliders">

            <!-- Scale -->
            <div class="ar-admin-slider-group">
                <label>
                    <span><?php esc_html_e( 'Scale Factor', 'ar-tryon' ); ?></span>
                    <input type="number"
                           id="ar-ref-scale-val"
                           class="ar-admin-slider-value"
                           value="<?php echo esc_attr( $ref_scale ); ?>"
                           step="0.001" min="0.001" max="150" />
                </label>
                <input type="range"
                       id="ar-ref-scale"
                       value="<?php echo esc_attr( $ref_scale ); ?>"
                       min="0.001" max="20" step="0.001" />
            </div>

            <!-- Offset X -->
            <div class="ar-admin-slider-group">
                <label>
                    <span><?php esc_html_e( 'Offset X (Horizontal)', 'ar-tryon' ); ?></span>
                    <input type="number"
                           id="ar-ref-offset-x-val"
                           class="ar-admin-slider-value"
                           value="<?php echo esc_attr( $ref_offset_x ); ?>"
                           step="0.001" />
                </label>
                <input type="range"
                       id="ar-ref-offset-x"
                       value="<?php echo esc_attr( $ref_offset_x ); ?>"
                       min="-1" max="1" step="0.001" />
            </div>

            <!-- Offset Y -->
            <div class="ar-admin-slider-group">
                <label>
                    <span><?php esc_html_e( 'Offset Y (Vertical)', 'ar-tryon' ); ?></span>
                    <input type="number"
                           id="ar-ref-offset-y-val"
                           class="ar-admin-slider-value"
                           value="<?php echo esc_attr( $ref_offset_y ); ?>"
                           step="0.001" />
                </label>
                <input type="range"
                       id="ar-ref-offset-y"
                       value="<?php echo esc_attr( $ref_offset_y ); ?>"
                       min="-1" max="1" step="0.001" />
            </div>

            <!-- Offset Z -->
            <div class="ar-admin-slider-group">
                <label>
                    <span><?php esc_html_e( 'Offset Z (Depth)', 'ar-tryon' ); ?></span>
                    <input type="number"
                           id="ar-ref-offset-z-val"
                           class="ar-admin-slider-value"
                           value="<?php echo esc_attr( $ref_offset_z ); ?>"
                           step="0.001" />
                </label>
                <input type="range"
                       id="ar-ref-offset-z"
                       value="<?php echo esc_attr( $ref_offset_z ); ?>"
                       min="-5" max="5" step="0.001" />
            </div>

            <!-- Rotation Section Header -->
            <div style="margin-top:8px;padding-top:16px;border-top:1px solid #f0f0f0;">
                <p style="margin:0 0 12px;font-weight:600;font-size:13px;color:#1d2327;">
                    <span class="dashicons dashicons-image-rotate" style="font-size:16px;vertical-align:middle;margin-right:4px;"></span>
                    <?php esc_html_e( 'Model Rotation (degrees)', 'ar-tryon' ); ?>
                </p>
            </div>

            <!-- Rotation X (Pitch) -->
            <div class="ar-admin-slider-group">
                <label>
                    <span><?php esc_html_e( 'Rotation X (Pitch)', 'ar-tryon' ); ?></span>
                    <input type="number"
                           id="ar-ref-rot-x-val"
                           class="ar-admin-slider-value"
                           value="0"
                           step="1" />
                </label>
                <input type="range"
                       id="ar-ref-rot-x"
                       value="0"
                       min="-180" max="180" step="1" />
            </div>

            <!-- Rotation Y (Yaw) -->
            <div class="ar-admin-slider-group">
                <label>
                    <span><?php esc_html_e( 'Rotation Y (Yaw)', 'ar-tryon' ); ?></span>
                    <input type="number"
                           id="ar-ref-rot-y-val"
                           class="ar-admin-slider-value"
                           value="0"
                           step="1" />
                </label>
                <input type="range"
                       id="ar-ref-rot-y"
                       value="0"
                       min="-180" max="180" step="1" />
            </div>

            <!-- Rotation Z (Roll) -->
            <div class="ar-admin-slider-group">
                <label>
                    <span><?php esc_html_e( 'Rotation Z (Roll)', 'ar-tryon' ); ?></span>
                    <input type="number"
                           id="ar-ref-rot-z-val"
                           class="ar-admin-slider-value"
                           value="0"
                           step="1" />
                </label>
                <input type="range"
                       id="ar-ref-rot-z"
                       value="0"
                       min="-180" max="180" step="1" />
            </div>

        </div>

        <!-- Save Button -->
        <div class="ar-admin-save-area">
            <button type="button" id="ar-btn-save-reference" class="button button-primary button-large">
                <span class="dashicons dashicons-saved" style="line-height:1.3;margin-right:4px;"></span>
                <?php esc_html_e( 'Save Reference Settings', 'ar-tryon' ); ?>
            </button>
            <span id="ar-save-status" class="ar-admin-save-status"></span>
        </div>
    </div>

    <!-- ═══ RIGHT PANEL: Live AR Preview ═══ -->
    <div class="ar-admin-preview-panel">
        <div class="ar-admin-preview-header">
            <h3>
                <span class="dashicons dashicons-camera" style="margin-right:4px;"></span>
                <?php esc_html_e( 'Live AR Preview', 'ar-tryon' ); ?>
            </h3>
            <button type="button" id="ar-btn-activate-preview" class="button button-secondary">
                <span class="dashicons dashicons-video-alt3" style="line-height:1.4;margin-right:2px;"></span>
                <?php esc_html_e( 'Start AR Camera', 'ar-tryon' ); ?>
            </button>
        </div>

        <div class="ar-admin-preview-container">
            <!-- AR Engine container — same class as frontend, auto-initialized by ar-tryon.js -->
            <div id="ar-calibration-viewer"
                 class="ar-tryon-container"
                 style="height:100%;width:100%;"
                 data-model="<?php echo esc_attr( $ref_model ); ?>"
                 data-scale="<?php echo esc_attr( $ref_scale ); ?>"
                 data-offset-x="<?php echo esc_attr( $ref_offset_x ); ?>"
                 data-offset-y="<?php echo esc_attr( $ref_offset_y ); ?>"
                 data-offset-z="<?php echo esc_attr( $ref_offset_z ); ?>"
                 data-button-text="<?php esc_attr_e( 'Start Preview', 'ar-tryon' ); ?>"
                 data-thumbnail=""
                 data-enable-capture="0">
            </div>

            <!-- Placeholder shown before activation -->
            <div id="ar-calibration-placeholder" class="ar-admin-preview-placeholder">
                <span class="dashicons dashicons-camera-alt"></span>
                <p><strong><?php esc_html_e( 'AR Preview', 'ar-tryon' ); ?></strong></p>
                <p style="font-size:12px;max-width:250px;">
                    <?php esc_html_e( 'Select a 3D model and click "Start AR Camera" to see a live preview. Adjust sliders in real-time.', 'ar-tryon' ); ?>
                </p>
            </div>
        </div>
    </div>

</div>
