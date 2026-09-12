-- ==============================================================================
-- JEM LUIQA EYEWEAR - INITIAL SEED DATA
-- ==============================================================================

-- 0. SEED DISCOVERY TAXONOMY
INSERT INTO public.frame_shapes (id, name, slug, description, sort_order, active) VALUES
('shape-round', 'Round', 'round', 'Soft circular curves defining timeless intellectual silhouettes', 1, true),
('shape-square', 'Square', 'square', 'Defined angles and structured horizontal architectural lines', 2, true),
('shape-hexagonal', 'Hexagonal', 'hexagonal', 'Architectural geometric contours with modern precision', 3, true),
('shape-aviator', 'Aviator', 'aviator', 'Double-bridge teardrop silhouette with classic presence', 4, true),
('shape-cat-eye', 'Cat-Eye', 'cat-eye', 'Uplifted outer rim angles creating sculptural drama', 5, true),
('shape-browline', 'Browline', 'browline', 'Prominent upper acetate rims balanced with sleek lower frame', 6, true),
('shape-shield-wrap', 'Shield / Wrap', 'shield-wrap', 'Continuous aerodynamic curve engineered for dynamic lifestyle', 7, true),
('shape-oval', 'Oval', 'oval', 'Elongated soft curves offering balanced proportions', 8, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.face_shapes (id, name, slug, description, sort_order, active) VALUES
('face-oval', 'Oval Face', 'oval', 'Balanced symmetry suited for virtually all frame silhouettes', 1, true),
('face-round', 'Round Face', 'round', 'Complements angular, geometric, and square frames for definition', 2, true),
('face-square', 'Square Face', 'square', 'Harmonizes with round, oval, and curved silhouettes to soften jawline', 3, true),
('face-heart', 'Heart Face', 'heart', 'Accented by light bottom frames, aviators, and round contours', 4, true),
('face-diamond', 'Diamond Face', 'diamond', 'Emphasized by browlines, cat-eyes, and oval proportions', 5, true),
('face-oblong', 'Oblong Face', 'oblong', 'Balanced by tall lenses and wider geometric frames', 6, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.occasions (id, name, slug, description, sort_order, active) VALUES
('occ-daily', 'Daily Wear', 'daily', 'Effortless versatility for everyday creative pursuits', 1, true),
('occ-business', 'Business & Formal', 'business', 'Refined structural elegance for leadership and client meetings', 2, true),
('occ-weekend', 'Casual Weekend', 'weekend', 'Relaxed sophistication for gallery walks and weekend cafes', 3, true),
('occ-travel', 'Outdoor & Travel', 'travel', 'High-contrast statement style engineered for sun and movement', 4, true),
('occ-screen', 'Screen & Digital Work', 'screen', 'Lightweight ergonomic comfort optimized for extended device focus', 5, true),
('occ-statement', 'Statement Event', 'statement', 'Striking architectural silhouettes curated for gala and evening wear', 6, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 1. SEED PRODUCTS
INSERT INTO public.products (
    id, name, slug, sku, category, edition, short_description, description, 
    price, compare_at_price, currency, badge, material, frame_shape, frame_shape_id, color, 
    lens_width, bridge_width, temple_length, overall_width, lens_height, weight, 
    lens_compatible, stock_status, featured, published, sort_order, shopee_url
) VALUES 
(
    'jl-01',
    'CERVULA 01',
    'cervula-01',
    'JL-OPT-001',
    'optical',
    '2026 Studio Collection',
    'Bold circular frame carved from premium Italian tortoiseshell acetate.',
    'Bold circular frame carved from premium Italian tortoiseshell acetate. Engineered to define facial contours with a classic yet uncompromising aesthetic.',
    'IDR 299,000',
    'IDR 399,000',
    'IDR',
    'Iconic Classic',
    'Hand-polished Acetate (Tortoiseshell)',
    'Round',
    'shape-round',
    'Classic Tortoiseshell Leopard',
    '48 mm',
    '22 mm',
    '145 mm',
    '138 mm',
    '44 mm',
    '28 g',
    true,
    'Available',
    true,
    true,
    1,
    'https://shopee.co.id'
),
(
    'jl-02',
    'ANAK JUJUR 02',
    'anak-jujur-02',
    'JL-OPT-002',
    'optical',
    'Signature Two-Tone Series',
    'A distinctive dual-acetate silhouette fusing warm woodgrain brown upper rims with crystal blue transparent base.',
    'A distinctive dual-acetate silhouette fusing warm woodgrain brown upper rims with crystal blue transparent base. Balanced intellect meets architectural playfulness.',
    'IDR 299,000',
    'IDR 399,000',
    'IDR',
    'Bestseller',
    'Handcrafted Dual Acetate (Two-Tone)',
    'Square / Rounded',
    'shape-square',
    'Woodgrain Warm Brown & Crystal Blue',
    '49 mm',
    '20 mm',
    '145 mm',
    '140 mm',
    '42 mm',
    '30 g',
    true,
    'Available',
    true,
    true,
    2,
    'https://shopee.co.id'
),
(
    'jl-03',
    'STEALTH CLEAR 03',
    'stealth-clear-03',
    'JL-OPT-003',
    'optical',
    'Urban Minimalist Line',
    'Minimalist geometric square silhouette crafted from ultra-lightweight frost grey crystal polymer.',
    'Minimalist geometric square silhouette crafted from ultra-lightweight frost grey crystal polymer. Tailored for effortless everyday screen work and refined urban styling.',
    'IDR 299,000',
    'IDR 399,000',
    'IDR',
    'New Arrival',
    'TR90 Crystal Ultra-Light Polycarbonate',
    'Square Geometric',
    'shape-square',
    'Frost Grey Transparent',
    '51 mm',
    '19 mm',
    '140 mm',
    '142 mm',
    '41 mm',
    '22 g',
    true,
    'Available',
    true,
    true,
    3,
    'https://shopee.co.id'
),
(
    'jl-04',
    'AMBER SHADES 04',
    'amber-shades-04',
    'JL-SUN-004',
    'sunglasses',
    'Sun & Solar Campaign',
    'Substantial round silhouette featuring warm translucent honey amber acetate and brown polarized lenses.',
    'Substantial round silhouette featuring warm translucent honey amber acetate and brown polarized lenses. Evokes an understated retro-future beachside aesthetic.',
    'IDR 349,000',
    'IDR 449,000',
    'IDR',
    'Summer Essential',
    'High-grade Acetate (Translucent Amber)',
    'Round Oversized',
    'shape-round',
    'Translucent Honey Amber',
    '50 mm',
    '21 mm',
    '145 mm',
    '144 mm',
    '48 mm',
    '32 g',
    true,
    'Available',
    true,
    true,
    4,
    'https://shopee.co.id'
),
(
    'jl-05',
    'CYBERPULSE 05',
    'cyberpulse-05',
    'JL-SUN-005',
    'sunglasses',
    'Avant-Garde Futuristic Line',
    'Aerodynamic sculpted silhouette engineered from composite alloy and obsidian acetate.',
    'Aerodynamic sculpted silhouette engineered from composite alloy and obsidian acetate. Crafted for fearless personal statements and total UV protection.',
    'IDR 359,000',
    'IDR 479,000',
    'IDR',
    'Limited Edition',
    'Architectural Alloy & Acetate Composite',
    'Shield / Wrap',
    'shape-shield-wrap',
    'Obsidian Black & Silver Chrome',
    '53 mm',
    '18 mm',
    '142 mm',
    '146 mm',
    '45 mm',
    '34 g',
    false,
    'Available',
    true,
    true,
    5,
    'https://shopee.co.id'
),
(
    'jl-06',
    'HELIX MONO 06',
    'helix-mono-06',
    'JL-OPT-006',
    'optical',
    'Studio Precision Series',
    'Linear architectural optical frame reflecting contemporary structural precision.',
    'Linear architectural optical frame reflecting contemporary structural precision. Ultra-thin featherweight feel with enduring durability.',
    'IDR 319,000',
    'IDR 429,000',
    'IDR',
    'Editorial Pick',
    'Ultra-thin Titanium & Acetate Tips',
    'Hexagonal Octagon',
    'shape-hexagonal',
    'Brushed Silver Metal',
    '49 mm',
    '21 mm',
    '145 mm',
    '136 mm',
    '43 mm',
    '18 g',
    true,
    'Available',
    true,
    true,
    6,
    'https://shopee.co.id'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    frame_shape_id = EXCLUDED.frame_shape_id,
    updated_at = now();

-- 1B. SEED PRODUCT VARIANTS
INSERT INTO public.product_variants (
    id, product_id, color_name, color_hex, swatch_image_url, sku, price, compare_at_price, stock_status, shopee_url, is_active, is_default, sort_order
) VALUES
-- CERVULA 01 Variants
('b0000000-0000-0000-0001-000000000001', 'jl-01', 'Classic Tortoiseshell', '#8B4513', NULL, 'JL-OPT-001-TOR', NULL, NULL, 'Available', 'https://shopee.co.id', true, true, 1),
('b0000000-0000-0000-0001-000000000002', 'jl-01', 'Midnight Obsidian', '#111111', NULL, 'JL-OPT-001-BLK', 'IDR 299,000', NULL, 'Available', 'https://shopee.co.id', true, false, 2),
('b0000000-0000-0000-0001-000000000003', 'jl-01', 'Warm Honey Amber', '#D4AF37', NULL, 'JL-OPT-001-AMB', 'IDR 319,000', 'IDR 419,000', 'Low Stock', 'https://shopee.co.id', true, false, 3),

-- ANAK JUJUR 02 Variants
('b0000000-0000-0000-0002-000000000001', 'jl-02', 'Woodgrain Brown & Crystal Blue', '#2A52BE', NULL, 'JL-OPT-002-WDB', NULL, NULL, 'Available', 'https://shopee.co.id', true, true, 1),
('b0000000-0000-0000-0002-000000000002', 'jl-02', 'Smoked Espresso & Frost', '#4A3728', NULL, 'JL-OPT-002-ESP', NULL, NULL, 'Available', 'https://shopee.co.id', true, false, 2),

-- STEALTH CLEAR 03 Variants
('b0000000-0000-0000-0003-000000000001', 'jl-03', 'Frost Grey Crystal', '#9E9E9E', NULL, 'JL-OPT-003-FST', NULL, NULL, 'Available', 'https://shopee.co.id', true, true, 1),
('b0000000-0000-0000-0003-000000000002', 'jl-03', 'Pure Glass Ice', '#E0F7FA', NULL, 'JL-OPT-003-ICE', NULL, NULL, 'Available', 'https://shopee.co.id', true, false, 2),

-- AMBER SHADES 04 Variants
('b0000000-0000-0000-0004-000000000001', 'jl-04', 'Translucent Honey Amber', '#D4AF37', NULL, 'JL-SUN-004-AMB', NULL, NULL, 'Available', 'https://shopee.co.id', true, true, 1),
('b0000000-0000-0000-0004-000000000002', 'jl-04', 'Smoked Olive Green', '#556B2F', NULL, 'JL-SUN-004-OLV', 'IDR 349,000', NULL, 'Available', 'https://shopee.co.id', true, false, 2),

-- CYBERPULSE 05 Variants
('b0000000-0000-0000-0005-000000000001', 'jl-05', 'Obsidian Black & Silver', '#1A1A1A', NULL, 'JL-SUN-005-OBS', NULL, NULL, 'Available', 'https://shopee.co.id', true, true, 1),
('b0000000-0000-0000-0005-000000000002', 'jl-05', 'Liquid Titanium Chrome', '#C0C0C0', NULL, 'JL-SUN-005-CHR', 'IDR 379,000', 'IDR 499,000', 'Available', 'https://shopee.co.id', true, false, 2),

-- HELIX MONO 06 Variants
('b0000000-0000-0000-0006-000000000001', 'jl-06', 'Brushed Silver Titanium', '#C0C0C0', NULL, 'JL-OPT-006-SLV', NULL, NULL, 'Available', 'https://shopee.co.id', true, true, 1),
('b0000000-0000-0000-0006-000000000002', 'jl-06', 'Matte Gunmetal Obsidian', '#2C3539', NULL, 'JL-OPT-006-GUN', NULL, NULL, 'Available', 'https://shopee.co.id', true, false, 2)
ON CONFLICT (id) DO UPDATE SET
    color_name = EXCLUDED.color_name,
    color_hex = EXCLUDED.color_hex,
    updated_at = now();

-- 1C. SEED PRODUCT TAXONOMY JUNCTIONS
INSERT INTO public.product_face_shapes (product_id, face_shape_id) VALUES
('jl-01', 'face-square'),
('jl-01', 'face-heart'),
('jl-01', 'face-oval'),
('jl-02', 'face-round'),
('jl-02', 'face-oval'),
('jl-03', 'face-round'),
('jl-03', 'face-oval'),
('jl-04', 'face-square'),
('jl-04', 'face-diamond'),
('jl-05', 'face-oval'),
('jl-05', 'face-oblong'),
('jl-06', 'face-round'),
('jl-06', 'face-oval')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_occasions (product_id, occasion_id) VALUES
('jl-01', 'occ-daily'),
('jl-01', 'occ-business'),
('jl-02', 'occ-daily'),
('jl-02', 'occ-weekend'),
('jl-03', 'occ-screen'),
('jl-03', 'occ-daily'),
('jl-04', 'occ-travel'),
('jl-04', 'occ-weekend'),
('jl-05', 'occ-statement'),
('jl-05', 'occ-travel'),
('jl-06', 'occ-business'),
('jl-06', 'occ-daily')
ON CONFLICT DO NOTHING;

-- 2. SEED PRODUCT IMAGES (Linked to products and variants)
INSERT INTO public.product_images (product_id, variant_id, image_url, alt_text, image_type, sort_order) VALUES
('jl-01', 'b0000000-0000-0000-0001-000000000001', '/assets/images/cervula.jpg', 'CERVULA 01 Classic Tortoiseshell', 'Primary', 1),
('jl-01', 'b0000000-0000-0000-0001-000000000001', '/assets/images/lookbook1.jpg', 'CERVULA 01 Classic Model View', 'Lifestyle', 2),
('jl-01', 'b0000000-0000-0000-0001-000000000002', '/assets/images/cyberpulse.jpg', 'CERVULA 01 Midnight Obsidian', 'Primary', 1),
('jl-01', 'b0000000-0000-0000-0001-000000000003', '/assets/images/amber_shades.jpg', 'CERVULA 01 Warm Honey Amber', 'Primary', 1),

('jl-02', 'b0000000-0000-0000-0002-000000000001', '/assets/images/anak_jujur.jpg', 'ANAK JUJUR 02 Woodgrain Blue', 'Primary', 1),
('jl-02', 'b0000000-0000-0000-0002-000000000001', '/assets/images/lookbook2.jpg', 'ANAK JUJUR 02 Model Wearing', 'Lifestyle', 2),
('jl-02', 'b0000000-0000-0000-0002-000000000002', '/assets/images/cervula.jpg', 'ANAK JUJUR 02 Smoked Espresso', 'Primary', 1),

('jl-03', 'b0000000-0000-0000-0003-000000000001', '/assets/images/clear_lens.jpg', 'STEALTH CLEAR 03 Frost Grey', 'Primary', 1),
('jl-03', 'b0000000-0000-0000-0003-000000000001', '/assets/images/lookbook3.jpg', 'STEALTH CLEAR 03 Model Wearing', 'Lifestyle', 2),
('jl-03', 'b0000000-0000-0000-0003-000000000002', '/assets/images/helix.jpg', 'STEALTH CLEAR 03 Pure Ice', 'Primary', 1),

('jl-04', 'b0000000-0000-0000-0004-000000000001', '/assets/images/amber_shades.jpg', 'AMBER SHADES 04 Translucent Honey Amber', 'Primary', 1),
('jl-04', 'b0000000-0000-0000-0004-000000000001', '/assets/images/campaign_hero1.jpg', 'AMBER SHADES 04 Model Wearing', 'Campaign', 2),
('jl-04', 'b0000000-0000-0000-0004-000000000002', '/assets/images/cyberpulse.jpg', 'AMBER SHADES 04 Smoked Olive', 'Primary', 1),

('jl-05', 'b0000000-0000-0000-0005-000000000001', '/assets/images/cyberpulse.jpg', 'CYBERPULSE 05 Obsidian Black', 'Primary', 1),
('jl-05', 'b0000000-0000-0000-0005-000000000001', '/assets/images/campaign_hero2.jpg', 'CYBERPULSE 05 Model Wearing', 'Campaign', 2),
('jl-05', 'b0000000-0000-0000-0005-000000000002', '/assets/images/helix.jpg', 'CYBERPULSE 05 Titanium Chrome', 'Primary', 1),

('jl-06', 'b0000000-0000-0000-0006-000000000001', '/assets/images/helix.jpg', 'HELIX MONO 06 Brushed Silver', 'Primary', 1),
('jl-06', 'b0000000-0000-0000-0006-000000000001', '/assets/images/lookbook4.jpg', 'HELIX MONO 06 Model Wearing', 'Lifestyle', 2),
('jl-06', 'b0000000-0000-0000-0006-000000000002', '/assets/images/cyberpulse.jpg', 'HELIX MONO 06 Matte Gunmetal', 'Primary', 1);

-- 3. SEED CAMPAIGNS (HERO CAROUSEL)
INSERT INTO public.campaigns (
    id, name, eyebrow, title, description, 
    desktop_media_url, mobile_media_url, media_type, 
    primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url, 
    object_position_desktop, object_position_mobile, autoplay_duration, sort_order, active
) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    '2026 Solar Collection Video',
    'Summer Campaign',
    '2026 SOLAR COLLECTION',
    'Sculptural tinted frames engineered for high solar radiation and statement presence.',
    '/assets/videos/slide_1.mp4',
    '/assets/images/campaign_slide_1.jpg',
    'video',
    'Shop Now',
    '/catalog?category=sunglasses',
    'View Campaign',
    '/lookbook',
    'center',
    'center',
    6000,
    1,
    true
),
(
    'a0000000-0000-0000-0000-000000000002',
    '2026 Global Studio Campaign',
    'Studio Series',
    '2026 GLOBAL CAMPAIGN',
    'International avant-garde eyewear carved from cured Italian cellulose acetate.',
    '/assets/images/campaign_slide_2.jpg',
    '/assets/images/campaign_slide_2.jpg',
    'image',
    'Shop Now',
    '/catalog',
    'View Campaign',
    '/lookbook',
    'center',
    'center',
    6000,
    2,
    true
),
(
    'a0000000-0000-0000-0000-000000000003',
    '2026 Optical Precision Collection',
    'Optical Laboratory',
    '2026 OPTICAL COLLECTION',
    'Featherweight structural silhouettes with multi-coat anti-reflective technology.',
    '/assets/images/campaign_slide_3.jpg',
    '/assets/images/campaign_slide_3.jpg',
    'image',
    'Shop Now',
    '/catalog?category=optical',
    'View Campaign',
    '/lookbook',
    'center',
    'center',
    6000,
    3,
    true
)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED LENS SERVICES
INSERT INTO public.lens_services (
    name, slug, category, short_description, description, starting_price, currency, features, recommended_for, sort_order, active
) VALUES
(
    'Classic Single Vision',
    'classic-single-vision',
    'Single Vision',
    'Standard precision clarity lens for distance or near correction.',
    'Clear optical CR-39 and high-index lenses with hard multi-coat anti-scratch protection. Suitable for everyday prescription wear.',
    'IDR 150,000',
    'IDR',
    '["Hard Multi-Coat Anti Scratch", "Hydrophobic Easy Clean", "UV380 Protection", "1.56 Index Standard"]'::jsonb,
    'Everyday single-vision correction for distance or reading.',
    1,
    true
),
(
    'Blue Control Lens',
    'blue-control-lens',
    'Single Vision',
    'Essential digital blue light defense for computer, tablet, and smartphone users.',
    'Advanced optical coating filtering harmful high-energy blue-violet light (400-450nm) while maintaining color fidelity and reducing eye fatigue.',
    'IDR 250,000',
    'IDR',
    '["Anti Blue-Light 420nm Filter", "Anti-Reflective Coating", "UV400 Total Block", "Reduces Digital Eyestrain"]'::jsonb,
    'Professionals & creatives with extensive daily screen time.',
    2,
    true
),
(
    'Blue Control Shield (High-Index Thin)',
    'blue-control-shield',
    'Single Vision',
    'Ultra-thin blue filter lens optimized for medium to higher prescription strengths.',
    'Engineered with 1.60 / 1.67 high-index resin to significantly reduce lens edge thickness and cosmetic distortion for higher diopters.',
    'IDR 390,000',
    'IDR',
    '["1.60 / 1.67 High-Index Thin Profile", "Super Blue Cut Filter", "Super Hydrophobic Oleophobic Coat", "Impact Resistant"]'::jsonb,
    'Prescriptions above -3.00 requiring lighter, thinner aesthetic lenses.',
    3,
    true
),
(
    'Blue Control Drive Night & Day',
    'blue-control-drive',
    'Single Vision',
    'Contrast-enhancing anti-glare lens optimized for commuting, night driving, and screens.',
    'Specialized optical filtering minimizing harsh headlight flare, street reflection, and night glare while maintaining high contrast in low-light environments.',
    'IDR 450,000',
    'IDR',
    '["Anti-Glare Night Flare Reduction", "High-Contrast Visual Clarity", "Day & Night Dual Performance", "UV400 & Blue Defense"]'::jsonb,
    'Night drivers, commuters, and light-sensitive individuals.',
    4,
    true
),
(
    'Photochromic Fast-Transition',
    'photochromic-fast-transition',
    'Specialty',
    'Intelligent adaptive lens switching seamlessly from crystal clear indoor to dark sunglass outdoor.',
    'Rapid molecular transition activated by ambient UV sunlight. Returns quickly to clear indoors with full UV400 sun protection.',
    'IDR 350,000',
    'IDR',
    '["Fast Darkening Transition", "Clear Indoors Transparency", "UV400 Full Spectrum Shield", "Anti-Reflective Finish"]'::jsonb,
    'Those who transition frequently between indoor work and outdoor sunlight.',
    5,
    true
),
(
    'Blue Chromic (Blue Light + Photochromic)',
    'blue-chromic',
    'Specialty',
    'All-in-one hybrid: full blue light filtering plus adaptive UV sun tinting.',
    'The ultimate dual-protection lens combining indoor digital blue-light filtering with rapid outdoor sunlight darkening.',
    'IDR 490,000',
    'IDR',
    '["Dual Blue Light & UV Photochromic", "Rapid Responsive Transition", "Premium Anti-Glare Coating", "All-in-One Everyday Convenience"]'::jsonb,
    'Users demanding complete digital screen protection and outdoor solar tint in a single pair.',
    6,
    true
),
(
    'Polarized Sun Prescription',
    'polarized-sun-prescription',
    'Specialty',
    'Maximum glare elimination for sunglasses with custom prescription power.',
    'True polarization filter cutting water, asphalt, and metallic reflections for crisp visual acuity in intense sunlight.',
    'IDR 550,000',
    'IDR',
    '["99.9% Glare Elimination", "Category 3 Dark Tint (Grey/Brown)", "UV400 Total Sunblock", "Prescription Compatible"]'::jsonb,
    'Outdoor sports, driving, maritime, and intense sun exposure.',
    7,
    true
),
(
    'Custom Progressive Precision',
    'custom-progressive-precision',
    'Progressive',
    'Seamless multifocal lens with wide corridor for natural distance, intermediate, and near vision.',
    'Digital freeform surface technology eliminating visible line bifocal borders for smooth, distortion-free transitions at all focal lengths.',
    'IDR 650,000',
    'IDR',
    '["Digital Freeform Multifocal Surface", "Wide Intermediate Digital Corridor", "No Visible Segment Lines", "Anti-Reflective + Blue Cut Available"]'::jsonb,
    'Individuals experiencing presbyopia requiring clear vision at all distances without switching glasses.',
    8,
    true
),
(
    'Bifocal Flattop / Kryptok',
    'bifocal-flattop',
    'Bifocal',
    'Traditional distinct dual-segment prescription for dedicated distance and near reading.',
    'Stable dual-focus segment designed for easy reading adaptation and clear distance vision.',
    'IDR 280,000',
    'IDR',
    '["Distinct Dual-Vision Segment", "Easy Rapid Adaptation", "Hard Multi-Coat", "UV Protection"]'::jsonb,
    'Wearers accustomed to classic bifocal segment geometry.',
    9,
    true
);

-- 5. SEED LOOKBOOK COLLECTIONS & MEDIA
INSERT INTO public.lookbook_collections (
    id, title, slug, subtitle, description, cover_image_url, published, featured, sort_order
) VALUES (
    'b0000000-0000-0000-0000-000000000001',
    '2026 Campaign Lookbook',
    '2026-campaign-lookbook',
    'Editorial Lookbook 2026',
    'An exploration of form, shadow, and architectural silhouettes captured across international metropolises.',
    '/assets/images/lookbook1.jpg',
    true,
    true,
    1
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lookbook_media (lookbook_id, media_url, media_type, caption, sort_order) VALUES
('b0000000-0000-0000-0000-000000000001', '/assets/images/lookbook1.jpg', 'image', 'CERVULA ARCHITECTURE — Milan Studio Editorial', 1),
('b0000000-0000-0000-0000-000000000001', '/assets/images/campaign_hero1.jpg', 'image', 'SOLAR DUSK — Amber Shades 04 under golden hour solar reflections', 2),
('b0000000-0000-0000-0000-000000000001', '/assets/images/lookbook2.jpg', 'image', 'DUAL SYMMETRY — Anak Jujur 02 two-tone harmony in architectural studio context', 3),
('b0000000-0000-0000-0000-000000000001', '/assets/images/lookbook3.jpg', 'image', 'TRANSLUCENT SILENCE — Stealth Clear 03 ultra-light crystal polymer series', 4),
('b0000000-0000-0000-0000-000000000001', '/assets/images/campaign_hero2.jpg', 'image', 'CYBER SHIFT — Cyberpulse 05 alloy aerodynamics in nocturnal Tokyo', 5),
('b0000000-0000-0000-0000-000000000001', '/assets/images/lookbook4.jpg', 'image', 'LINEAR MONO — Helix Mono 06 titanium precision frame study', 6);

-- 6. SEED SITE SETTINGS
INSERT INTO public.site_settings (key, value) VALUES
('general', '{
    "brand_name": "JEM LUIQA",
    "tagline": "Define Your Vision",
    "instagram_url": "https://instagram.com/jemluiqa",
    "shopee_url": "https://shopee.co.id",
    "whatsapp_number": "6281234567890",
    "whatsapp_default_message": "Hello JEM LUIQA Concierge, I would like to consult regarding eyewear and custom prescription lenses.",
    "email": "concierge@jemluiqa.com",
    "address": "Jl. Cikutra Baru Raya No.1, Neglasari, Cibeunying Kaler, Kota Bandung, Jawa Barat 40123",
    "operational_hours": "Monday – Sunday: 09:00 – 20:00 WIB",
    "google_maps_url": "https://maps.google.com/?q=Jl.+Cikutra+Baru+Raya+baru+No.1,+Neglasari,+Kec.+Cibeunying+Kaler,+Kota+Bandung,+Jawa+Barat+40123",
    "footer_text": "International avant-garde & optical luxury eyewear. Hand-crafted acetate frames sculpturally engineered to redefine personal vision.",
    "seo_default_title": "JEM LUIQA EYEWEAR | Define Your Vision",
    "seo_default_description": "JEM LUIQA EYEWEAR — International avant-garde and optical luxury eyewear. Hand-crafted acetate frames engineered to define your vision."
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = now();
