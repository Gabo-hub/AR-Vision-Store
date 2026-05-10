<?php
/**
 * AR Try-On — Uninstall Script
 *
 * Runs when the plugin is deleted from WordPress.
 * Cleans up all plugin options and post meta from the database.
 *
 * @package AR_TryOn
 */

// If uninstall not called from WordPress, exit
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// ── Remove plugin options ──
$options = array(
    'ar_tryon_ref_model_url',
    'ar_tryon_ref_scale',
    'ar_tryon_ref_offset_x',
    'ar_tryon_ref_offset_y',
    'ar_tryon_ref_offset_z',
    'ar_tryon_settings',
);

foreach ( $options as $option ) {
    delete_option( $option );
}

// ── Remove all post meta created by this plugin ──
global $wpdb;

$meta_keys = array(
    '_ar_model_url',
    '_ar_use_reference',
    '_ar_custom_scale',
    '_ar_custom_offset_x',
    '_ar_custom_offset_y',
    '_ar_custom_offset_z',
    '_ar_variation_model_url',
);

foreach ( $meta_keys as $key ) {
    $wpdb->delete(
        $wpdb->postmeta,
        array( 'meta_key' => $key ),
        array( '%s' )
    );
}
