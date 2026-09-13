-- ==============================================================================
-- JEM LUIQA EYEWEAR - MIGRATION: LENS CUSTOMIZATION & COMPATIBILITY RULES
-- ==============================================================================

-- 1. Add compatibility and customization columns to lens_services
ALTER TABLE public.lens_services 
ADD COLUMN IF NOT EXISTS supports_non_prescription BOOLEAN DEFAULT true;

ALTER TABLE public.lens_services 
ADD COLUMN IF NOT EXISTS supported_vision_types JSONB DEFAULT '["Single Vision"]'::jsonb;

ALTER TABLE public.lens_services 
ADD COLUMN IF NOT EXISTS lens_options JSONB DEFAULT '[]'::jsonb;

-- 2. Update default seed records with accurate compatibility and optional treatments
UPDATE public.lens_services
SET 
  supports_non_prescription = true,
  supported_vision_types = '["Single Vision"]'::jsonb,
  lens_options = '[]'::jsonb
WHERE slug IN ('classic-single-vision', 'blue-control-lens', 'blue-control-shield', 'blue-control-drive');

UPDATE public.lens_services
SET 
  supports_non_prescription = true,
  supported_vision_types = '["Single Vision"]'::jsonb,
  lens_options = '[
    {
      "id": "transition-shade",
      "name": "Transition Tint Color",
      "choices": [
        {"label": "Adaptive Grey (Neutral Solar)", "extra_price": 0},
        {"label": "Warm Amber Brown", "extra_price": 0},
        {"label": "Sapphire Blue Glow", "extra_price": 50000}
      ]
    }
  ]'::jsonb
WHERE slug = 'photochromic-fast-transition';

UPDATE public.lens_services
SET 
  supports_non_prescription = true,
  supported_vision_types = '["Single Vision"]'::jsonb,
  lens_options = '[
    {
      "id": "blue-chromic-base",
      "name": "Dual Shield Formulation",
      "choices": [
        {"label": "Standard Blue Cut + Adaptive Grey", "extra_price": 0},
        {"label": "Max 420nm Blue Cut + Polar Shade", "extra_price": 50000}
      ]
    }
  ]'::jsonb
WHERE slug = 'blue-chromic';

UPDATE public.lens_services
SET 
  supports_non_prescription = true,
  supported_vision_types = '["Single Vision"]'::jsonb,
  lens_options = '[
    {
      "id": "polarized-color",
      "name": "Polarized Lens Color",
      "choices": [
        {"label": "Deep Charcoal Grey 85%", "extra_price": 0},
        {"label": "Tortoise Earth Brown 80%", "extra_price": 0},
        {"label": "Classic Aviator G-15 Green", "extra_price": 0}
      ]
    }
  ]'::jsonb
WHERE slug = 'polarized-sun-prescription';

UPDATE public.lens_services
SET 
  supports_non_prescription = false,
  supported_vision_types = '["Progressive"]'::jsonb,
  lens_options = '[
    {
      "id": "corridor-type",
      "name": "Multifocal Corridor Profile",
      "choices": [
        {"label": "Standard Balanced Corridor", "extra_price": 0},
        {"label": "Ultra-Wide Digital Work Corridor", "extra_price": 100000}
      ]
    }
  ]'::jsonb
WHERE slug = 'custom-progressive-precision';

UPDATE public.lens_services
SET 
  supports_non_prescription = false,
  supported_vision_types = '["Bifocal"]'::jsonb,
  lens_options = '[
    {
      "id": "bifocal-type",
      "name": "Segment Design",
      "choices": [
        {"label": "Classic Flattop 28mm", "extra_price": 0},
        {"label": "Curved Kryptok Round Segment", "extra_price": 0}
      ]
    }
  ]'::jsonb
WHERE slug = 'bifocal-flattop';
