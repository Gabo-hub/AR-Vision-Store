<?php
/**
 * AR Try-On — Documentation UI (Tab Panel)
 *
 * Renders inside the unified admin page as the "Documentation" tab.
 * Uses the same panel design system as the other tabs.
 *
 * @package AR_TryOn
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>

<div class="ar-admin-section-intro">
    <span class="dashicons dashicons-book"></span>
    <div>
        <h2><?php esc_html_e( 'Documentation', 'ar-tryon' ); ?></h2>
        <p><?php esc_html_e( 'Learn how to integrate AR Try-On into your pages and products.', 'ar-tryon' ); ?></p>
    </div>
</div>

<div class="ar-admin-docs-grid">

    <!-- Quick Start -->
    <div class="ar-admin-panel">
        <div class="ar-admin-panel-header">
            <span class="dashicons dashicons-lightbulb"></span>
            <h3><?php esc_html_e( 'Quick Start', 'ar-tryon' ); ?></h3>
        </div>
        <div class="ar-admin-panel-body">
            <p><?php esc_html_e( 'Insert the following shortcode into any page or post:', 'ar-tryon' ); ?></p>
            <div class="ar-admin-code">
                [ar_tryon model="https://your-site.com/glasses.glb"]
            </div>
            <?php if ( class_exists( 'WooCommerce' ) ) : ?>
                <div class="ar-admin-info-box">
                    <span class="dashicons dashicons-cart"></span>
                    <div>
                        <strong><?php esc_html_e( 'WooCommerce detected!', 'ar-tryon' ); ?></strong>
                        <p><?php esc_html_e( 'Products with a 3D model attached will automatically show the AR try-on button on their product pages. No shortcode needed.', 'ar-tryon' ); ?></p>
                    </div>
                </div>
            <?php endif; ?>
            <?php if ( function_exists( 'register_block_type' ) ) : ?>
                <div class="ar-admin-info-box">
                    <span class="dashicons dashicons-block-default"></span>
                    <div>
                        <strong><?php esc_html_e( 'Gutenberg Block available!', 'ar-tryon' ); ?></strong>
                        <p><?php esc_html_e( 'Search for "AR Try-On" in the block editor to insert it visually. No shortcode needed.', 'ar-tryon' ); ?></p>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Shortcode Attributes -->
    <div class="ar-admin-panel">
        <div class="ar-admin-panel-header">
            <span class="dashicons dashicons-editor-code"></span>
            <h3><?php esc_html_e( 'Shortcode Attributes', 'ar-tryon' ); ?></h3>
        </div>
        <div class="ar-admin-panel-body">
            <table class="widefat fixed striped" style="max-width:100%;">
                <thead>
                    <tr>
                        <th style="width:130px;"><?php esc_html_e( 'Attribute', 'ar-tryon' ); ?></th>
                        <th style="width:90px;"><?php esc_html_e( 'Required', 'ar-tryon' ); ?></th>
                        <th style="width:100px;"><?php esc_html_e( 'Default', 'ar-tryon' ); ?></th>
                        <th><?php esc_html_e( 'Description', 'ar-tryon' ); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>model</code></td>
                        <td><?php esc_html_e( 'No*', 'ar-tryon' ); ?></td>
                        <td>—</td>
                        <td><?php esc_html_e( 'URL to the 3D model file (.glb or .gltf). Required if id is not set.', 'ar-tryon' ); ?></td>
                    </tr>
                    <tr>
                        <td><code>id</code></td>
                        <td><?php esc_html_e( 'No*', 'ar-tryon' ); ?></td>
                        <td>—</td>
                        <td><?php esc_html_e( 'WooCommerce product ID. Loads model and calibration from product settings.', 'ar-tryon' ); ?></td>
                    </tr>
                    <tr>
                        <td><code>thumbnail</code></td>
                        <td><?php esc_html_e( 'No', 'ar-tryon' ); ?></td>
                        <td>—</td>
                        <td><?php esc_html_e( 'URL to the product preview image shown in idle state.', 'ar-tryon' ); ?></td>
                    </tr>
                    <tr>
                        <td><code>scale</code></td>
                        <td><?php esc_html_e( 'No', 'ar-tryon' ); ?></td>
                        <td><em><?php esc_html_e( 'Reference', 'ar-tryon' ); ?></em></td>
                        <td><?php esc_html_e( 'Scale factor. If not set, uses reference calibration value.', 'ar-tryon' ); ?></td>
                    </tr>
                    <tr>
                        <td><code>offset_x</code></td>
                        <td><?php esc_html_e( 'No', 'ar-tryon' ); ?></td>
                        <td><em><?php esc_html_e( 'Reference', 'ar-tryon' ); ?></em></td>
                        <td><?php esc_html_e( 'Horizontal offset.', 'ar-tryon' ); ?></td>
                    </tr>
                    <tr>
                        <td><code>offset_y</code></td>
                        <td><?php esc_html_e( 'No', 'ar-tryon' ); ?></td>
                        <td><em><?php esc_html_e( 'Reference', 'ar-tryon' ); ?></em></td>
                        <td><?php esc_html_e( 'Vertical offset.', 'ar-tryon' ); ?></td>
                    </tr>
                    <tr>
                        <td><code>offset_z</code></td>
                        <td><?php esc_html_e( 'No', 'ar-tryon' ); ?></td>
                        <td><em><?php esc_html_e( 'Reference', 'ar-tryon' ); ?></em></td>
                        <td><?php esc_html_e( 'Depth offset.', 'ar-tryon' ); ?></td>
                    </tr>
                    <tr>
                        <td><code>rotation_x/y/z</code></td>
                        <td><?php esc_html_e( 'No', 'ar-tryon' ); ?></td>
                        <td><code>0</code></td>
                        <td><?php esc_html_e( 'Model rotation in degrees (pitch, yaw, roll).', 'ar-tryon' ); ?></td>
                    </tr>
                    <tr>
                        <td><code>height</code></td>
                        <td><?php esc_html_e( 'No', 'ar-tryon' ); ?></td>
                        <td><code>500px</code></td>
                        <td><?php esc_html_e( 'Container height (any CSS unit).', 'ar-tryon' ); ?></td>
                    </tr>
                    <tr>
                        <td><code>button_text</code></td>
                        <td><?php esc_html_e( 'No', 'ar-tryon' ); ?></td>
                        <td><em><?php esc_html_e( 'Settings', 'ar-tryon' ); ?></em></td>
                        <td><?php esc_html_e( 'Text displayed on the activation button.', 'ar-tryon' ); ?></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Examples -->
    <div class="ar-admin-panel">
        <div class="ar-admin-panel-header">
            <span class="dashicons dashicons-format-aside"></span>
            <h3><?php esc_html_e( 'Examples', 'ar-tryon' ); ?></h3>
        </div>
        <div class="ar-admin-panel-body">
            <h4><?php esc_html_e( 'Manual Mode (Direct URL)', 'ar-tryon' ); ?></h4>
            <div class="ar-admin-code">[ar_tryon model="https://cdn.example.com/models/aviator.glb"]</div>

            <h4><?php esc_html_e( 'Product Mode (WooCommerce ID)', 'ar-tryon' ); ?></h4>
            <div class="ar-admin-code">[ar_tryon id="42"]</div>

            <h4><?php esc_html_e( 'With Custom Calibration', 'ar-tryon' ); ?></h4>
            <div class="ar-admin-code">[ar_tryon model="https://cdn.example.com/aviator.glb" scale="3.2" offset_y="-0.1"]</div>

            <h4><?php esc_html_e( 'With Rotation Override', 'ar-tryon' ); ?></h4>
            <div class="ar-admin-code">[ar_tryon model="https://cdn.example.com/aviator.glb" rotation_x="90"]</div>
        </div>
    </div>

    <!-- Requirements -->
    <div class="ar-admin-panel">
        <div class="ar-admin-panel-header">
            <span class="dashicons dashicons-warning"></span>
            <h3><?php esc_html_e( 'Requirements', 'ar-tryon' ); ?></h3>
        </div>
        <div class="ar-admin-panel-body">
            <ul class="ar-admin-list">
                <li><strong><?php esc_html_e( 'HTTPS required', 'ar-tryon' ); ?></strong> — <?php esc_html_e( 'The camera API only works on secure connections. Make sure your site has an active SSL certificate.', 'ar-tryon' ); ?></li>
                <li><strong><?php esc_html_e( '3D Models', 'ar-tryon' ); ?></strong> — <?php esc_html_e( 'Upload your .glb or .gltf files to the WordPress Media Library.', 'ar-tryon' ); ?></li>
                <li><strong><?php esc_html_e( 'Browser support', 'ar-tryon' ); ?></strong> — Chrome 89+, Firefox 108+, Edge 89+, Safari 16.4+</li>
            </ul>
        </div>
    </div>

    <!-- Calibration Tips -->
    <div class="ar-admin-panel">
        <div class="ar-admin-panel-header">
            <span class="dashicons dashicons-admin-tools"></span>
            <h3><?php esc_html_e( 'Calibration Tips', 'ar-tryon' ); ?></h3>
        </div>
        <div class="ar-admin-panel-body">
            <ul class="ar-admin-list">
                <li><strong><?php esc_html_e( 'Reference model approach:', 'ar-tryon' ); ?></strong> <?php esc_html_e( 'Tell your 3D artist to export all glasses models at the same scale. Calibrate once with the reference model, and all others will just work.', 'ar-tryon' ); ?></li>
                <li><strong><?php esc_html_e( 'Scale:', 'ar-tryon' ); ?></strong> <?php esc_html_e( 'Controls overall size. Larger values = bigger glasses.', 'ar-tryon' ); ?></li>
                <li><strong><?php esc_html_e( 'Offset Y:', 'ar-tryon' ); ?></strong> <?php esc_html_e( 'Negative = down, Positive = up. Adjust nose bridge position.', 'ar-tryon' ); ?></li>
                <li><strong><?php esc_html_e( 'Offset Z:', 'ar-tryon' ); ?></strong> <?php esc_html_e( 'Controls depth. Decrease to push closer, increase to pull away.', 'ar-tryon' ); ?></li>
                <li><strong><?php esc_html_e( 'Rotation:', 'ar-tryon' ); ?></strong> <?php esc_html_e( 'Use when your model is oriented differently. Values are in degrees.', 'ar-tryon' ); ?></li>
                <li><strong><?php esc_html_e( 'Recommended:', 'ar-tryon' ); ?></strong> <?php printf( esc_html__( 'Use %s to compress models before uploading.', 'ar-tryon' ), '<a href="https://gltf.report/" target="_blank">gltf.report</a>' ); ?></li>
            </ul>
        </div>
    </div>

</div>
