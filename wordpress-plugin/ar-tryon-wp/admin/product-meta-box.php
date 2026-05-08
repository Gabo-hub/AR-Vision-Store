<?php
/**
 * AR Try-On — Product Meta Box
 *
 * Renders the AR settings meta box on WooCommerce product edit pages.
 * Includes model picker, reference/custom toggle, and override sliders.
 *
 * @package AR_TryOn
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Get saved values for this product
$post_id       = $post->ID;
$model_url     = get_post_meta( $post_id, '_ar_model_url', true );
$use_reference = get_post_meta( $post_id, '_ar_use_reference', true );
$custom_scale  = get_post_meta( $post_id, '_ar_custom_scale', true );
$custom_off_x  = get_post_meta( $post_id, '_ar_custom_offset_x', true );
$custom_off_y  = get_post_meta( $post_id, '_ar_custom_offset_y', true );
$custom_off_z  = get_post_meta( $post_id, '_ar_custom_offset_z', true );

// Default to "use reference" if not set
if ( $use_reference === '' ) {
    $use_reference = '1';
}

// Get reference defaults for display
$ref_scale     = get_option( 'ar_tryon_ref_scale', '2.5' );
$ref_offset_x  = get_option( 'ar_tryon_ref_offset_x', '0' );
$ref_offset_y  = get_option( 'ar_tryon_ref_offset_y', '0' );
$ref_offset_z  = get_option( 'ar_tryon_ref_offset_z', '0' );

// Use reference values as defaults for custom fields
if ( $custom_scale === '' ) $custom_scale = $ref_scale;
if ( $custom_off_x === '' ) $custom_off_x = $ref_offset_x;
if ( $custom_off_y === '' ) $custom_off_y = $ref_offset_y;
if ( $custom_off_z === '' ) $custom_off_z = $ref_offset_z;

// Nonce for security
wp_nonce_field( 'ar_tryon_save_product', 'ar_tryon_product_nonce' );
?>

<div class="ar-meta-box-inner">

    <!-- Model File -->
    <div class="ar-meta-field">
        <label for="ar-product-model-url"><?php esc_html_e( '3D Model File (.glb / .gltf)', 'ar-tryon' ); ?></label>
        <div class="ar-admin-model-row" style="display:flex;gap:8px;">
            <input type="text"
                   id="ar-product-model-url"
                   name="ar_model_url"
                   value="<?php echo esc_attr( $model_url ); ?>"
                   class="regular-text"
                   style="flex:1;"
                   placeholder="<?php esc_attr_e( 'Select from Media Library...', 'ar-tryon' ); ?>"
                   readonly />
            <button type="button" id="ar-btn-product-select-model" class="button">
                <span class="dashicons dashicons-upload" style="line-height:1.4;"></span> <?php esc_html_e( 'Browse', 'ar-tryon' ); ?>
            </button>
            <?php if ( $model_url ) : ?>
                <button type="button" class="button ar-btn-remove-model" onclick="document.getElementById('ar-product-model-url').value='';this.remove();" title="<?php esc_attr_e( 'Remove model', 'ar-tryon' ); ?>">
                    <span class="dashicons dashicons-no-alt" style="line-height:1.4;"></span>
                </button>
            <?php endif; ?>
        </div>
        <p class="description">
            <?php esc_html_e( 'Upload or select a .glb or .gltf file. Setting a model enables the AR try-on button on this product\'s page.', 'ar-tryon' ); ?>
        </p>
    </div>

    <!-- Calibration Mode Toggle -->
    <div class="ar-meta-field">
        <label><?php esc_html_e( 'Calibration Mode', 'ar-tryon' ); ?></label>
        <div class="ar-meta-toggle">
            <label>
                <input type="radio"
                       name="ar_use_reference"
                       value="1"
                       <?php checked( $use_reference, '1' ); ?> />
                <?php esc_html_e( 'Use reference settings', 'ar-tryon' ); ?> <em><?php esc_html_e( '(recommended)', 'ar-tryon' ); ?></em>
            </label>
            <label>
                <input type="radio"
                       name="ar_use_reference"
                       value="0"
                       <?php checked( $use_reference, '0' ); ?> />
                <?php esc_html_e( 'Custom calibration', 'ar-tryon' ); ?>
            </label>
        </div>
        <p class="description" style="margin-top:0;">
            <?php
            printf(
                esc_html__( 'Reference settings use the global calibration from %sAR Try-On → Calibration%s. Use custom only if this specific model needs different values.', 'ar-tryon' ),
                '<a href="' . esc_url( admin_url( 'admin.php?page=ar-tryon' ) ) . '">',
                '</a>'
            );
            ?>
        </p>
    </div>

    <!-- Custom Override Sliders -->
    <div class="ar-meta-overrides <?php echo $use_reference === '1' ? 'is-hidden' : ''; ?>">
        <p style="margin-top:0;margin-bottom:12px;font-weight:600;font-size:13px;">
            <?php esc_html_e( 'Custom Calibration Overrides', 'ar-tryon' ); ?>
        </p>

        <!-- Scale -->
        <div class="ar-meta-field">
            <label><?php esc_html_e( 'Scale Factor', 'ar-tryon' ); ?></label>
            <div class="ar-meta-slider-row">
                <input type="range"
                       id="ar-product-scale-range"
                       min="0.001" max="20" step="0.001"
                       value="<?php echo esc_attr( $custom_scale ); ?>"
                       data-sync="ar-product-scale" />
                <input type="number"
                       id="ar-product-scale"
                       name="ar_custom_scale"
                       step="0.001" min="0.001" max="150"
                       value="<?php echo esc_attr( $custom_scale ); ?>"
                       data-sync="ar-product-scale-range" />
            </div>
        </div>

        <!-- Offset X -->
        <div class="ar-meta-field">
            <label><?php esc_html_e( 'Offset X (Horizontal)', 'ar-tryon' ); ?></label>
            <div class="ar-meta-slider-row">
                <input type="range"
                       id="ar-product-offset-x-range"
                       min="-1" max="1" step="0.001"
                       value="<?php echo esc_attr( $custom_off_x ); ?>"
                       data-sync="ar-product-offset-x" />
                <input type="number"
                       id="ar-product-offset-x"
                       name="ar_custom_offset_x"
                       step="0.001"
                       value="<?php echo esc_attr( $custom_off_x ); ?>"
                       data-sync="ar-product-offset-x-range" />
            </div>
        </div>

        <!-- Offset Y -->
        <div class="ar-meta-field">
            <label><?php esc_html_e( 'Offset Y (Vertical)', 'ar-tryon' ); ?></label>
            <div class="ar-meta-slider-row">
                <input type="range"
                       id="ar-product-offset-y-range"
                       min="-1" max="1" step="0.001"
                       value="<?php echo esc_attr( $custom_off_y ); ?>"
                       data-sync="ar-product-offset-y" />
                <input type="number"
                       id="ar-product-offset-y"
                       name="ar_custom_offset_y"
                       step="0.001"
                       value="<?php echo esc_attr( $custom_off_y ); ?>"
                       data-sync="ar-product-offset-y-range" />
            </div>
        </div>

        <!-- Offset Z -->
        <div class="ar-meta-field">
            <label><?php esc_html_e( 'Offset Z (Depth)', 'ar-tryon' ); ?></label>
            <div class="ar-meta-slider-row">
                <input type="range"
                       id="ar-product-offset-z-range"
                       min="-5" max="5" step="0.001"
                       value="<?php echo esc_attr( $custom_off_z ); ?>"
                       data-sync="ar-product-offset-z" />
                <input type="number"
                       id="ar-product-offset-z"
                       name="ar_custom_offset_z"
                       step="0.001"
                       value="<?php echo esc_attr( $custom_off_z ); ?>"
                       data-sync="ar-product-offset-z-range" />
            </div>
        </div>
    </div>

</div>
