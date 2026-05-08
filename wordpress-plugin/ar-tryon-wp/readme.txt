=== AR Try-On ===
Contributors: arvisionstore
Tags: augmented reality, ar, try-on, glasses, 3d, mediapipe, threejs, virtual try-on, woocommerce
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 2.2.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Real-time AR glasses virtual try-on for your WordPress site. Powered by MediaPipe FaceMesh and Three.js.

== Description ==

AR Try-On lets your visitors try on glasses in real-time using their webcam and augmented reality, directly on your WordPress site.

**Features:**

* Real-time face tracking with MediaPipe FaceMesh AI
* 3D glasses rendering with Three.js
* **Photo capture** — Visitors can take a screenshot while trying on glasses
* **Smooth tracking** — One Euro Filter eliminates jitter for professional results
* **Front/back camera switch** on mobile devices
* **Loading progress bar** — Clear visual feedback during initialization
* Built-in WooCommerce integration — auto-inject AR on product pages
* Reference calibration system — calibrate once, all models work automatically
* **Settings page** — Customize button text, colors, style, camera resolution, and more
* **Rotation controls** — Handle models with different orientations
* No React or build tools required — works out of the box
* Simple shortcode integration: `[ar_tryon]`
* Supports .glb and .gltf 3D model formats
* Responsive design works on desktop and mobile
* Lightweight — assets loaded from CDN only when needed
* No external API calls — all processing happens in the browser
* Multiple instances per page supported
* Full internationalization (i18n) ready
* Proper uninstall cleanup — leaves no data behind
* ARIA accessible controls

**How it works:**

1. Upload your 3D glasses model (.glb or .gltf)
2. Configure calibration via the admin panel (or just use defaults)
3. Add the `[ar_tryon]` shortcode to any page — or let WooCommerce do it automatically
4. Visitors click the button to activate the webcam
5. AI detects their face and overlays the glasses in real-time
6. They can take a photo and save it!

== Installation ==

1. Upload the `ar-tryon-wp` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to AR Try-On → Calibration for reference model setup
4. Go to AR Try-On → Settings to customize appearance
5. Add the shortcode to any page or post, or set 3D models on WooCommerce products

**Important:** Your site MUST use HTTPS (SSL certificate). The browser camera API does not work on insecure connections.

== Frequently Asked Questions ==

= Does this work on mobile? =

Yes! The AR try-on works on modern mobile browsers (Chrome, Safari 16.4+). Performance may vary depending on the device. You can disable mobile support in Settings if needed.

= Do I need WooCommerce? =

No. The plugin works independently with any WordPress theme. You can add the shortcode to any page or post.

= Where should I host my 3D models? =

You can upload .glb files to your WordPress Media Library or use a CDN. For best performance, use compressed .glb files under 5MB.

= What 3D model format should I use? =

We recommend .glb (binary glTF) for faster loading. The plugin also supports .gltf files.

= Is the face data sent to any server? =

No. All face tracking and 3D rendering happens entirely in the user's browser. No data leaves the device.

= Can visitors take screenshots? =

Yes! When enabled in Settings, a capture button appears during the AR session. Photos are rendered entirely in the browser and never uploaded to any server.

= Does it work in iframes? =

If you're embedding a page with the shortcode in an iframe, you need to add `allow="camera"` to the iframe tag for camera permissions to work.

== Screenshots ==

1. AR Try-On activated — glasses rendered on user's face in real-time
2. Photo capture — screenshot with glasses overlay
3. Admin calibration page with live AR preview
4. Settings page — button customization and feature toggles
5. WooCommerce product meta box with 3D model settings

== Changelog ==

= 2.2.0 =
* **NEW: Unified Admin Dashboard** — Single page with tabbed Calibration, Settings, and Documentation
* **NEW: Gutenberg Block** — Insert AR Try-On from the block editor with live preview
* **NEW: Variable Product Support** — Assign different 3D models per WooCommerce variation (e.g., different colors)
* **Improved: Consistent Admin UI** — All tabs share the same design system, header, and navigation
* **Improved: Modern toggle switches** in Settings for a polished admin experience
* **Improved: Section intros** with visual icons in each tab
* **Improved: Sticky preview sidebar** in Settings stays visible while scrolling

= 2.1.0 =
* **NEW: Photo capture** — Visitors can take screenshots during try-on
* **NEW: Camera switch** — Toggle front/back camera on mobile devices
* **NEW: Settings page** — Customize button text, colors, style, camera resolution
* **NEW: Smooth tracking** — One Euro Filter applied for jitter-free results
* **NEW: Loading progress bar** — Visual feedback during AI initialization
* **NEW: Rotation controls** — Fix model orientation in calibration
* **NEW: Face detection hysteresis** — Prevents flickering when face briefly lost
* **NEW: Model-ready flag** — Eliminates the "flash" on initial load
* **NEW: Retry button** — Retry on error instead of just closing
* **NEW: Friendly error messages** — User-friendly text for camera/model errors
* **Improved: Full i18n support** — All strings translatable via .po/.mo files
* **Improved: Security hardening** — Numeric validation, absint() on $_GET, sanitized settings
* **Improved: ARIA accessibility** — Screen reader support for status and controls
* **Improved: Preconnect hints** — Faster CDN resource loading
* **Improved: Uninstall cleanup** — Removes all plugin data on deletion
* **Fixed: Calibration link** — Product meta box now links to correct admin page
* **Fixed: Version sync** — PHP header and readme.txt now match

= 2.0.0 =
* WooCommerce integration with auto-inject
* Reference calibration system with live preview
* Product meta box with per-product overrides
* Tabbed admin interface
* Media Library picker for 3D models

= 1.0.0 =
* Initial release
* MediaPipe FaceMesh face tracking
* Three.js 3D rendering with GLTF support
* One Euro Filter for smooth tracking
* IPD-based automatic scaling
* Head occlusion for realistic rendering
* Shortcode with configurable attributes
* Admin documentation page
* Responsive CSS design

== Upgrade Notice ==

= 2.2.0 =
Unified admin UI, Gutenberg block editor support, and WooCommerce variable product support. Recommended for all users.
Major update: Photo capture, smooth tracking, settings page, camera switch, and more. Recommended for all users.