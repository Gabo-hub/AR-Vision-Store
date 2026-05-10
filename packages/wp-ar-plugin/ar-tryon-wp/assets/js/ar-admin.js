/**
 * AR Try-On — Admin JavaScript
 *
 * Handles:
 * - WordPress Media Library integration for model selection
 * - Real-time slider ↔ AR viewer communication
 * - AJAX save for reference calibration and per-product settings
 * - Toggle logic for "Use reference" vs "Custom" calibration mode
 * - Color picker initialization for settings page
 *
 * @version 2.2.0
 */
(function ($) {
    'use strict';

    // Shorthand for localized strings
    const i18n = (arTryOnAdmin && arTryOnAdmin.i18n) ? arTryOnAdmin.i18n : {};

    /* ═══════════════════════════════════════════════════════════════════════════
     *  CALIBRATION PAGE — Reference Model Setup
     * ═══════════════════════════════════════════════════════════════════════════ */

    /**
     * Initialize the calibration page if we're on it.
     */
    function initCalibrationPage() {
        const $container = $('#ar-calibration-viewer');
        if (!$container.length) return;

        const $modelUrl    = $('#ar-ref-model-url');
        const $selectBtn   = $('#ar-btn-select-model');
        const $activateBtn = $('#ar-btn-activate-preview');
        const $saveBtn     = $('#ar-btn-save-reference');
        const $saveStatus  = $('#ar-save-status');

        // Slider elements
        const sliders = {
            scale:   { range: $('#ar-ref-scale'),    value: $('#ar-ref-scale-val') },
            offsetX: { range: $('#ar-ref-offset-x'), value: $('#ar-ref-offset-x-val') },
            offsetY: { range: $('#ar-ref-offset-y'), value: $('#ar-ref-offset-y-val') },
            offsetZ: { range: $('#ar-ref-offset-z'), value: $('#ar-ref-offset-z-val') },
            rotX:    { range: $('#ar-ref-rot-x'),    value: $('#ar-ref-rot-x-val') },
            rotY:    { range: $('#ar-ref-rot-y'),    value: $('#ar-ref-rot-y-val') },
            rotZ:    { range: $('#ar-ref-rot-z'),    value: $('#ar-ref-rot-z-val') },
        };

        /* ── Media Library Picker ── */
        let mediaFrame = null;

        $selectBtn.on('click', function (e) {
            e.preventDefault();

            if (mediaFrame) {
                mediaFrame.open();
                return;
            }

            mediaFrame = wp.media({
                title: i18n.selectModel || 'Select 3D Model (.glb or .gltf)',
                button: { text: i18n.useModel || 'Use this model' },
                multiple: false,
            });

            mediaFrame.on('select', function () {
                const attachment = mediaFrame.state().get('selection').first().toJSON();
                const url = attachment.url;
                $modelUrl.val(url);

                // Update the AR viewer container data attribute
                $container.attr('data-model', url);

                // If AR is already active, hot-swap the model
                const arInstance = $container[0]._arTryOnInstance;
                if (arInstance && arInstance.state !== 'idle') {
                    arInstance.swapModel(url);
                }
            });

            mediaFrame.open();
        });

        /* ── Activate Preview Button ── */
        $activateBtn.on('click', function () {
            const modelUrl = $modelUrl.val();
            if (!modelUrl) {
                alert(i18n.selectFirst || 'Please select a 3D model first.');
                return;
            }

            // Ensure the container has the current settings
            $container.attr('data-model', modelUrl);
            $container.attr('data-scale', sliders.scale.range.val());
            $container.attr('data-offset-x', sliders.offsetX.range.val());
            $container.attr('data-offset-y', sliders.offsetY.range.val());
            $container.attr('data-offset-z', sliders.offsetZ.range.val());

            // Create a new AR instance or reuse existing
            let arInstance = $container[0]._arTryOnInstance;
            if (!arInstance) {
                console.warn('[AR Admin] No AR instance found on container.');
                return;
            }

            // Update config before activating
            arInstance.config.modelUrl = modelUrl;
            arInstance.updateConfig({
                scaleFactor: parseFloat(sliders.scale.range.val()),
                offsetX: parseFloat(sliders.offsetX.range.val()),
                offsetY: parseFloat(sliders.offsetY.range.val()),
                offsetZ: parseFloat(sliders.offsetZ.range.val()),
                rotationX: parseFloat(sliders.rotX.range.val()) || 0,
                rotationY: parseFloat(sliders.rotY.range.val()) || 0,
                rotationZ: parseFloat(sliders.rotZ.range.val()) || 0,
            });

            arInstance.activate();

            // Hide placeholder, show the AR container
            $('#ar-calibration-placeholder').hide();
            $(this).text(i18n.restartPreview || 'Restart AR Preview');
        });

        // Also hide placeholder if user clicks the internal AR button
        $container.on('click', '.ar-tryon-btn-start', function() {
            $('#ar-calibration-placeholder').hide();
            $activateBtn.text(i18n.restartPreview || 'Restart AR Preview');
        });

        /* ── Slider → AR Engine Bridge ── */
        function bindSlider(key, configKey) {
            const s = sliders[key];
            if (!s || !s.range.length) return;

            // Sync range → number input
            s.range.on('input', function () {
                const val = parseFloat(this.value);
                s.value.val(val);

                // Update AR engine in real-time
                const arInstance = $container[0]._arTryOnInstance;
                if (arInstance && arInstance.state !== 'idle') {
                    const cfg = {};
                    cfg[configKey] = val;
                    arInstance.updateConfig(cfg);
                }
            });

            // Sync number input → range
            s.value.on('input', function () {
                const val = parseFloat(this.value) || 0;
                s.range.val(val);

                const arInstance = $container[0]._arTryOnInstance;
                if (arInstance && arInstance.state !== 'idle') {
                    const cfg = {};
                    cfg[configKey] = val;
                    arInstance.updateConfig(cfg);
                }
            });
        }

        bindSlider('scale',   'scaleFactor');
        bindSlider('offsetX', 'offsetX');
        bindSlider('offsetY', 'offsetY');
        bindSlider('offsetZ', 'offsetZ');
        bindSlider('rotX',    'rotationX');
        bindSlider('rotY',    'rotationY');
        bindSlider('rotZ',    'rotationZ');

        /* ── Save Reference Settings (AJAX) ── */
        $saveBtn.on('click', function () {
            const data = {
                action: 'ar_tryon_save_reference',
                nonce: arTryOnAdmin.nonce,
                model_url: $modelUrl.val(),
                scale: sliders.scale.range.val(),
                offset_x: sliders.offsetX.range.val(),
                offset_y: sliders.offsetY.range.val(),
                offset_z: sliders.offsetZ.range.val(),
            };

            const saveText = i18n.saveReference || 'Save Reference Settings';
            $saveBtn.prop('disabled', true).html(
                '<span class="dashicons dashicons-update spin" style="line-height:1.3;margin-right:4px;animation:ar-admin-spin 1s linear infinite;"></span>' +
                (i18n.saving || 'Saving...')
            );

            $.post(ajaxurl, data, function (response) {
                $saveBtn.prop('disabled', false).html(
                    '<span class="dashicons dashicons-saved" style="line-height:1.3;margin-right:4px;"></span>' + saveText
                );
                if (response.success) {
                    $saveStatus.text(i18n.saved || '✓ Settings saved!').addClass('is-visible');
                    setTimeout(function () {
                        $saveStatus.removeClass('is-visible');
                    }, 3000);
                } else {
                    alert((i18n.saveError || 'Error saving: ') + (response.data || 'Unknown error'));
                }
            }).fail(function () {
                $saveBtn.prop('disabled', false).html(
                    '<span class="dashicons dashicons-saved" style="line-height:1.3;margin-right:4px;"></span>' + saveText
                );
                alert(i18n.networkError || 'Network error. Please try again.');
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════════════════════
     *  PRODUCT META BOX — Per-product AR settings
     * ═══════════════════════════════════════════════════════════════════════════ */

    function initProductMetaBox() {
        const $metaBox = $('#ar_tryon_meta_box');
        if (!$metaBox.length) return;

        const $modelUrl  = $('#ar-product-model-url');
        const $selectBtn = $('#ar-btn-product-select-model');
        const $toggle    = $('input[name="ar_use_reference"]');
        const $overrides = $('.ar-meta-overrides');

        /* ── Media Library for product model ── */
        let mediaFrame = null;

        $selectBtn.on('click', function (e) {
            e.preventDefault();

            if (mediaFrame) {
                mediaFrame.open();
                return;
            }

            mediaFrame = wp.media({
                title: i18n.selectModel || 'Select 3D Model for This Product',
                button: { text: i18n.useModel || 'Use this model' },
                multiple: false,
            });

            mediaFrame.on('select', function () {
                const attachment = mediaFrame.state().get('selection').first().toJSON();
                $modelUrl.val(attachment.url);

                // Show the remove button dynamically
                if (!$modelUrl.siblings('.ar-btn-remove-model').length) {
                    const $removeBtn = $('<button type="button" class="button ar-btn-remove-model" title="Remove model"><span class="dashicons dashicons-no-alt" style="line-height:1.4;"></span></button>');
                    $removeBtn.on('click', function() {
                        $modelUrl.val('');
                        $(this).remove();
                    });
                    $modelUrl.parent().append($removeBtn);
                }
            });

            mediaFrame.open();
        });

        // Initialize remove button
        $metaBox.find('.ar-btn-remove-model').on('click', function () {
            $modelUrl.val('');
            $(this).remove();
        });

        /* ── Toggle: Reference vs Custom ── */
        $toggle.on('change', function () {
            if ($(this).val() === '1') {
                $overrides.addClass('is-hidden');
            } else {
                $overrides.removeClass('is-hidden');
            }
        });

        // Initialize toggle state
        $toggle.filter(':checked').trigger('change');

        /* ── Sync sliders ↔ number inputs ── */
        $metaBox.find('input[type="range"]').on('input', function () {
            const targetId = $(this).data('sync');
            if (targetId) {
                $('#' + targetId).val(this.value);
            }
        });

        $metaBox.find('.ar-meta-slider-row input[type="number"]').on('input', function () {
            const targetId = $(this).data('sync');
            if (targetId) {
                $('#' + targetId).val(this.value);
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════════════════════
     *  SETTINGS PAGE
     * ═══════════════════════════════════════════════════════════════════════════ */

    function initSettingsPage() {
        // Initialize color pickers
        if ($.fn.wpColorPicker) {
            $('.ar-color-picker').wpColorPicker({
                change: function () {
                    // Delay to let the color picker update the input value
                    setTimeout(updateSettingsPreview, 50);
                },
                clear: function () {
                    setTimeout(updateSettingsPreview, 50);
                },
            });
        }

        // Live preview updates
        $('#ar-btn-text, #ar-btn-style, #ar-btn-color, #ar-btn-text-color').on('input change', function () {
            updateSettingsPreview();
        });
    }

    /**
     * Update the button preview in real-time.
     */
    function updateSettingsPreview() {
        const $preview = $('#ar-settings-btn-preview');
        if (!$preview.length) return;

        const text = $('#ar-btn-text').val() || 'Try On with AR';
        const color = $('#ar-btn-color').val() || '#111111';
        const textColor = $('#ar-btn-text-color').val() || '#ffffff';
        const style = $('#ar-btn-style').val() || 'solid';

        $preview.find('span').text(text);

        switch (style) {
            case 'solid':
                $preview.css({
                    'background-color': color,
                    'color': textColor,
                    'border': 'none',
                    'text-decoration': 'none',
                });
                break;
            case 'outline':
                $preview.css({
                    'background-color': 'transparent',
                    'color': color,
                    'border': '2px solid ' + color,
                    'text-decoration': 'none',
                });
                break;
            case 'minimal':
                $preview.css({
                    'background-color': 'transparent',
                    'color': color,
                    'border': 'none',
                    'text-decoration': 'underline',
                });
                break;
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════════
     *  TABBED NAVIGATION
     * ═══════════════════════════════════════════════════════════════════════════ */

    function initTabs() {
        const $tabs = $('.ar-admin-nav-tab');
        if (!$tabs.length) return;

        $tabs.on('click', function (e) {
            e.preventDefault();
            const target = $(this).data('tab');

            $tabs.removeClass('is-active').attr('aria-selected', 'false');
            $(this).addClass('is-active').attr('aria-selected', 'true');

            $('.ar-admin-tab-content').removeClass('is-active');
            $('#ar-tab-' + target).addClass('is-active');
        });
    }

    /* ═══════════════════════════════════════════════════════════════════════════
     *  VARIATION MODEL PICKER (WooCommerce Variable Products)
     * ═══════════════════════════════════════════════════════════════════════════ */

    function initVariationFields() {
        // Delegate events because variations are loaded dynamically by WooCommerce
        $(document).on('click', '.ar-variation-select-model', function (e) {
            e.preventDefault();
            var $btn = $(this);
            var loop = $btn.data('loop');
            var $input = $('#ar_variation_model_' + loop);

            var frame = wp.media({
                title: i18n.selectModel || 'Select 3D Model (.glb or .gltf)',
                button: { text: i18n.useModel || 'Use this model' },
                multiple: false,
            });

            frame.on('select', function () {
                var attachment = frame.state().get('selection').first().toJSON();
                $input.val(attachment.url);

                // Show remove button if not already present
                if (!$btn.siblings('.ar-variation-remove-model').length) {
                    var $removeBtn = $('<button type="button" class="button ar-variation-remove-model" data-loop="' + loop + '">✕</button>');
                    $btn.after($removeBtn);
                }
            });

            frame.open();
        });

        $(document).on('click', '.ar-variation-remove-model', function () {
            var loop = $(this).data('loop');
            $('#ar_variation_model_' + loop).val('');
            $(this).remove();
        });
    }

    /* ═══════════════════════════════════════════════════════════════════════════
     *  INITIALIZE ON READY
     * ═══════════════════════════════════════════════════════════════════════════ */
    $(function () {
        initTabs();
        initCalibrationPage();
        initProductMetaBox();
        initSettingsPage();
        initVariationFields();
    });

})(jQuery);
