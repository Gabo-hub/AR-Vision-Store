/**
 * AR Try-On — Gutenberg Block
 *
 * Registers a custom block that renders the AR Try-On shortcode
 * via server-side rendering.
 *
 * @version 2.2.0
 */
(function () {
    'use strict';

    var el = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var Placeholder = wp.components.Placeholder;
    var ServerSideRender = wp.serverSideRender || wp.components.ServerSideRender;

    // SVG icon for the block
    var blockIcon = el('svg', {
        width: 24, height: 24, viewBox: '0 0 24 24',
        fill: 'none', stroke: 'currentColor', strokeWidth: 2,
        strokeLinecap: 'round', strokeLinejoin: 'round'
    },
        el('path', { d: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z' }),
        el('circle', { cx: 12, cy: 13, r: 3 })
    );

    registerBlockType('ar-tryon/try-on', {
        title: 'AR Try-On',
        description: 'Add an AR glasses try-on experience. Users can try on 3D glasses using their webcam.',
        category: 'widgets',
        icon: blockIcon,
        keywords: ['ar', 'try-on', 'glasses', 'augmented reality', '3d', 'camera', 'virtual'],
        supports: {
            html: false,
            align: ['wide', 'full'],
        },

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            var hasContent = !!(attributes.modelUrl || attributes.productId);

            // Inspector controls (sidebar)
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: 'Model Source', initialOpen: true },
                    el(TextControl, {
                        label: 'WooCommerce Product ID',
                        help: 'Load the model from a WooCommerce product. Leave empty to use a direct URL.',
                        value: attributes.productId || '',
                        onChange: function (val) {
                            setAttributes({ productId: val ? parseInt(val, 10) : 0 });
                        },
                        type: 'number'
                    }),
                    el(TextControl, {
                        label: '3D Model URL',
                        help: 'Direct URL to a .glb or .gltf file. Ignored if Product ID is set.',
                        value: attributes.modelUrl,
                        onChange: function (val) { setAttributes({ modelUrl: val }); },
                        placeholder: 'https://your-site.com/model.glb'
                    })
                ),
                el(PanelBody, { title: 'Appearance', initialOpen: false },
                    el(TextControl, {
                        label: 'Container Height',
                        help: 'CSS height value (e.g., 500px, 60vh).',
                        value: attributes.height,
                        onChange: function (val) { setAttributes({ height: val }); }
                    }),
                    el(TextControl, {
                        label: 'Button Text',
                        help: 'Custom text for the activation button. Leave empty to use Settings default.',
                        value: attributes.buttonText,
                        onChange: function (val) { setAttributes({ buttonText: val }); }
                    })
                ),
                el(PanelBody, { title: 'Calibration Overrides', initialOpen: false },
                    el(TextControl, {
                        label: 'Scale',
                        help: 'Override the reference scale factor.',
                        value: attributes.scale,
                        onChange: function (val) { setAttributes({ scale: val }); }
                    }),
                    el(TextControl, {
                        label: 'Offset X',
                        value: attributes.offsetX,
                        onChange: function (val) { setAttributes({ offsetX: val }); }
                    }),
                    el(TextControl, {
                        label: 'Offset Y',
                        value: attributes.offsetY,
                        onChange: function (val) { setAttributes({ offsetY: val }); }
                    }),
                    el(TextControl, {
                        label: 'Offset Z',
                        value: attributes.offsetZ,
                        onChange: function (val) { setAttributes({ offsetZ: val }); }
                    })
                )
            );

            // Main block content
            var content;

            if (hasContent) {
                // Show server-rendered preview
                content = el(ServerSideRender, {
                    block: 'ar-tryon/try-on',
                    attributes: attributes,
                });
            } else {
                // Show placeholder
                content = el(Placeholder, {
                    icon: blockIcon,
                    label: 'AR Try-On',
                    instructions: 'Enter a WooCommerce Product ID or a direct 3D model URL in the block settings to get started.',
                },
                    el(TextControl, {
                        label: 'Product ID or Model URL',
                        placeholder: 'Enter product ID or paste .glb URL...',
                        onChange: function (val) {
                            if (val && !isNaN(val)) {
                                setAttributes({ productId: parseInt(val, 10) });
                            } else if (val) {
                                setAttributes({ modelUrl: val });
                            }
                        }
                    })
                );
            }

            return el('div', { className: props.className },
                inspector,
                content
            );
        },

        save: function () {
            // Server-side rendered — no save needed
            return null;
        }
    });
})();
