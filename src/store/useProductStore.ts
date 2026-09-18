import { create } from 'zustand';
import { Product, ProductCategory, ProductImage, ProductVariant } from '../types/database';
import { getSupabaseClient } from '../lib/supabase';
import { DEFAULT_FRAME_SHAPES, DEFAULT_FACE_SHAPES, DEFAULT_OCCASIONS } from '../constants/discovery';
import { generateUUID, ensureUUID } from '../lib/uuid';

const SEED_PRODUCTS: Product[] = [
  {
    id: 'jl-01',
    name: 'CERVULA 01',
    slug: 'cervula-01',
    sku: 'JL-OPT-001',
    category: 'optical',
    edition: '2026 Studio Collection',
    short_description: 'Bold circular frame carved from premium Italian tortoiseshell acetate.',
    description: 'Bold circular frame carved from premium Italian tortoiseshell acetate. Engineered to define facial contours with a classic yet uncompromising aesthetic.',
    price: 'IDR 299,000',
    compare_at_price: 'IDR 399,000',
    currency: 'IDR',
    badge: 'Iconic Classic',
    material: 'Hand-polished Acetate (Tortoiseshell)',
    frame_shape: 'Round',
    frame_shape_id: 'shape-round',
    frame_shape_obj: DEFAULT_FRAME_SHAPES.find((s) => s.id === 'shape-round'),
    suitable_face_shapes: [DEFAULT_FACE_SHAPES[2], DEFAULT_FACE_SHAPES[3], DEFAULT_FACE_SHAPES[0]],
    occasions: [DEFAULT_OCCASIONS[0], DEFAULT_OCCASIONS[1]],
    color: 'Classic Tortoiseshell Leopard',
    lens_width: '48 mm',
    bridge_width: '22 mm',
    temple_length: '145 mm',
    overall_width: '138 mm',
    lens_height: '44 mm',
    weight: '28 g',
    lens_compatible: true,
    stock_status: 'Available',
    featured: true,
    published: true,
    sort_order: 1,
    shopee_url: 'https://shopee.co.id',
    images: [
      { image_url: '/assets/images/cervula.jpg', alt_text: 'CERVULA 01 Frame View', image_type: 'Primary', sort_order: 1 },
      { image_url: '/assets/images/lookbook1.jpg', alt_text: 'CERVULA 01 Model Wearing', image_type: 'Lifestyle', sort_order: 2 },
    ],
    variants: [
      {
        id: 'var-jl01-1',
        product_id: 'jl-01',
        color_name: 'Classic Tortoiseshell',
        color_hex: '#8B4513',
        sku: 'JL-OPT-001-TOR',
        stock_status: 'Available',
        shopee_url: 'https://shopee.co.id',
        is_active: true,
        is_default: true,
        sort_order: 1,
        images: [
          { id: 'img-v01-1', product_id: 'jl-01', variant_id: 'var-jl01-1', image_url: '/assets/images/cervula.jpg', alt_text: 'CERVULA 01 Classic Tortoiseshell', image_type: 'Primary', sort_order: 1 },
          { id: 'img-v01-2', product_id: 'jl-01', variant_id: 'var-jl01-1', image_url: '/assets/images/lookbook1.jpg', alt_text: 'CERVULA 01 Model Wearing', image_type: 'Lifestyle', sort_order: 2 },
        ],
      },
      {
        id: 'var-jl01-2',
        product_id: 'jl-01',
        color_name: 'Midnight Obsidian',
        color_hex: '#111111',
        sku: 'JL-OPT-001-BLK',
        stock_status: 'Available',
        shopee_url: 'https://shopee.co.id',
        is_active: true,
        is_default: false,
        sort_order: 2,
        images: [
          { id: 'img-v01-3', product_id: 'jl-01', variant_id: 'var-jl01-2', image_url: '/assets/images/cyberpulse.jpg', alt_text: 'CERVULA 01 Midnight Obsidian', image_type: 'Primary', sort_order: 1 },
        ],
      },
      {
        id: 'var-jl01-3',
        product_id: 'jl-01',
        color_name: 'Warm Honey Amber',
        color_hex: '#D4AF37',
        sku: 'JL-OPT-001-AMB',
        price: 'IDR 319,000',
        compare_at_price: 'IDR 419,000',
        stock_status: 'Low Stock',
        shopee_url: 'https://shopee.co.id',
        is_active: true,
        is_default: false,
        sort_order: 3,
        images: [
          { id: 'img-v01-4', product_id: 'jl-01', variant_id: 'var-jl01-3', image_url: '/assets/images/amber_shades.jpg', alt_text: 'CERVULA 01 Warm Honey Amber', image_type: 'Primary', sort_order: 1 },
        ],
      },
    ],
  },
  {
    id: 'jl-02',
    name: 'ANAK JUJUR 02',
    slug: 'anak-jujur-02',
    sku: 'JL-OPT-002',
    category: 'optical',
    edition: 'Signature Two-Tone Series',
    short_description: 'A distinctive dual-acetate silhouette fusing warm woodgrain brown upper rims with crystal blue transparent base.',
    description: 'A distinctive dual-acetate silhouette fusing warm woodgrain brown upper rims with crystal blue transparent base. Balanced intellect meets architectural playfulness.',
    price: 'IDR 299,000',
    compare_at_price: 'IDR 399,000',
    currency: 'IDR',
    badge: 'Bestseller',
    material: 'Handcrafted Dual Acetate (Two-Tone)',
    frame_shape: 'Square / Rounded',
    frame_shape_id: 'shape-square',
    frame_shape_obj: DEFAULT_FRAME_SHAPES.find((s) => s.id === 'shape-square'),
    suitable_face_shapes: [DEFAULT_FACE_SHAPES[1], DEFAULT_FACE_SHAPES[0]],
    occasions: [DEFAULT_OCCASIONS[0], DEFAULT_OCCASIONS[2]],
    color: 'Woodgrain Warm Brown & Crystal Blue',
    lens_width: '49 mm',
    bridge_width: '20 mm',
    temple_length: '145 mm',
    overall_width: '140 mm',
    lens_height: '42 mm',
    weight: '30 g',
    lens_compatible: true,
    stock_status: 'Available',
    featured: true,
    published: true,
    sort_order: 2,
    shopee_url: 'https://shopee.co.id',
    images: [
      { image_url: '/assets/images/anak_jujur.jpg', alt_text: 'ANAK JUJUR 02 Frame View', image_type: 'Primary', sort_order: 1 },
      { image_url: '/assets/images/lookbook2.jpg', alt_text: 'ANAK JUJUR 02 Model Wearing', image_type: 'Lifestyle', sort_order: 2 },
    ],
    variants: [
      {
        id: 'var-jl02-1',
        product_id: 'jl-02',
        color_name: 'Woodgrain Brown & Crystal Blue',
        color_hex: '#2A52BE',
        sku: 'JL-OPT-002-WDB',
        stock_status: 'Available',
        shopee_url: 'https://shopee.co.id',
        is_active: true,
        is_default: true,
        sort_order: 1,
        images: [
          { id: 'img-v02-1', product_id: 'jl-02', variant_id: 'var-jl02-1', image_url: '/assets/images/anak_jujur.jpg', alt_text: 'ANAK JUJUR 02 Woodgrain Blue', image_type: 'Primary', sort_order: 1 },
          { id: 'img-v02-2', product_id: 'jl-02', variant_id: 'var-jl02-1', image_url: '/assets/images/lookbook2.jpg', alt_text: 'ANAK JUJUR 02 Model Wearing', image_type: 'Lifestyle', sort_order: 2 },
        ],
      },
      {
        id: 'var-jl02-2',
        product_id: 'jl-02',
        color_name: 'Smoked Espresso & Frost',
        color_hex: '#4A3728',
        sku: 'JL-OPT-002-ESP',
        stock_status: 'Available',
        shopee_url: 'https://shopee.co.id',
        is_active: true,
        is_default: false,
        sort_order: 2,
        images: [
          { id: 'img-v02-3', product_id: 'jl-02', variant_id: 'var-jl02-2', image_url: '/assets/images/cervula.jpg', alt_text: 'ANAK JUJUR 02 Smoked Espresso', image_type: 'Primary', sort_order: 1 },
        ],
      },
    ],
  },
  {
    id: 'jl-03',
    name: 'STEALTH CLEAR 03',
    slug: 'stealth-clear-03',
    sku: 'JL-OPT-003',
    category: 'optical',
    edition: 'Urban Minimalist Line',
    short_description: 'Minimalist geometric square silhouette crafted from ultra-lightweight frost grey crystal polymer.',
    description: 'Minimalist geometric square silhouette crafted from ultra-lightweight frost grey crystal polymer. Tailored for effortless everyday screen work and refined urban styling.',
    price: 'IDR 299,000',
    compare_at_price: 'IDR 399,000',
    currency: 'IDR',
    badge: 'New Arrival',
    material: 'TR90 Crystal Ultra-Light Polycarbonate',
    frame_shape: 'Square Geometric',
    frame_shape_id: 'shape-square',
    frame_shape_obj: DEFAULT_FRAME_SHAPES.find((s) => s.id === 'shape-square'),
    suitable_face_shapes: [DEFAULT_FACE_SHAPES[1], DEFAULT_FACE_SHAPES[0]],
    occasions: [DEFAULT_OCCASIONS[4], DEFAULT_OCCASIONS[0]],
    color: 'Frost Grey Transparent',
    lens_width: '51 mm',
    bridge_width: '19 mm',
    temple_length: '140 mm',
    overall_width: '142 mm',
    lens_height: '41 mm',
    weight: '22 g',
    lens_compatible: true,
    stock_status: 'Available',
    featured: true,
    published: true,
    sort_order: 3,
    shopee_url: 'https://shopee.co.id',
    images: [
      { image_url: '/assets/images/clear_lens.jpg', alt_text: 'STEALTH CLEAR 03 Frame View', image_type: 'Primary', sort_order: 1 },
      { image_url: '/assets/images/lookbook3.jpg', alt_text: 'STEALTH CLEAR 03 Model Wearing', image_type: 'Lifestyle', sort_order: 2 },
    ],
    variants: [
      {
        id: 'var-jl03-1',
        product_id: 'jl-03',
        color_name: 'Frost Grey Crystal',
        color_hex: '#9E9E9E',
        sku: 'JL-OPT-003-FST',
        stock_status: 'Available',
        shopee_url: 'https://shopee.co.id',
        is_active: true,
        is_default: true,
        sort_order: 1,
        images: [
          { id: 'img-v03-1', product_id: 'jl-03', variant_id: 'var-jl03-1', image_url: '/assets/images/clear_lens.jpg', alt_text: 'STEALTH CLEAR 03 Frost Grey', image_type: 'Primary', sort_order: 1 },
          { id: 'img-v03-2', product_id: 'jl-03', variant_id: 'var-jl03-1', image_url: '/assets/images/lookbook3.jpg', alt_text: 'STEALTH CLEAR 03 Model Wearing', image_type: 'Lifestyle', sort_order: 2 },
        ],
      },
      {
        id: 'var-jl03-2',
        product_id: 'jl-03',
        color_name: 'Pure Glass Ice',
        color_hex: '#E0F7FA',
        sku: 'JL-OPT-003-ICE',
        stock_status: 'Available',
        shopee_url: 'https://shopee.co.id',
        is_active: true,
        is_default: false,
        sort_order: 2,
        images: [
          { id: 'img-v03-3', product_id: 'jl-03', variant_id: 'var-jl03-2', image_url: '/assets/images/helix.jpg', alt_text: 'STEALTH CLEAR 03 Pure Ice', image_type: 'Primary', sort_order: 1 },
        ],
      },
    ],
  },
  {
    id: 'jl-04',
    name: 'AMBER SHADES 04',
    slug: 'amber-shades-04',
    sku: 'JL-SUN-004',
    category: 'sunglasses',
    edition: 'Sun & Solar Campaign',
    short_description: 'Substantial round silhouette featuring warm translucent honey amber acetate and brown polarized lenses.',
    description: 'Substantial round silhouette featuring warm translucent honey amber acetate and brown polarized lenses. Evokes an understated retro-future beachside aesthetic.',
    price: 'IDR 349,000',
    compare_at_price: 'IDR 449,000',
    currency: 'IDR',
    badge: 'Summer Essential',
    material: 'High-grade Acetate (Translucent Amber)',
    frame_shape: 'Round Oversized',
    frame_shape_id: 'shape-round',
    frame_shape_obj: DEFAULT_FRAME_SHAPES.find((s) => s.id === 'shape-round'),
    suitable_face_shapes: [DEFAULT_FACE_SHAPES[2], DEFAULT_FACE_SHAPES[4]],
    occasions: [DEFAULT_OCCASIONS[3], DEFAULT_OCCASIONS[2]],
    color: 'Translucent Honey Amber',
    lens_width: '50 mm',
    bridge_width: '21 mm',
    temple_length: '145 mm',
    overall_width: '144 mm',
    lens_height: '48 mm',
    weight: '32 g',
    lens_compatible: true,
    stock_status: 'Available',
    featured: true,
    published: true,
    sort_order: 4,
    shopee_url: 'https://shopee.co.id',
    images: [
      { image_url: '/assets/images/amber_shades.jpg', alt_text: 'AMBER SHADES 04 Frame View', image_type: 'Primary', sort_order: 1 },
      { image_url: '/assets/images/campaign_hero1.jpg', alt_text: 'AMBER SHADES 04 Model Wearing', image_type: 'Campaign', sort_order: 2 },
    ],
    variants: [
      {
        id: 'var-jl04-1',
        product_id: 'jl-04',
        color_name: 'Translucent Honey Amber',
        color_hex: '#D4AF37',
        sku: 'JL-SUN-004-AMB',
        stock_status: 'Available',
        shopee_url: 'https://shopee.co.id',
        is_active: true,
        is_default: true,
        sort_order: 1,
        images: [
          { id: 'img-v04-1', product_id: 'jl-04', variant_id: 'var-jl04-1', image_url: '/assets/images/amber_shades.jpg', alt_text: 'AMBER SHADES 04 Translucent Honey Amber', image_type: 'Primary', sort_order: 1 },
          { id: 'img-v04-2', product_id: 'jl-04', variant_id: 'var-jl04-1', image_url: '/assets/images/campaign_hero1.jpg', alt_text: 'AMBER SHADES 04 Model Wearing', image_type: 'Campaign', sort_order: 2 },
        ],
      },
      {
        id: 'var-jl04-2',
        product_id: 'jl-04',
        color_name: 'Smoked Olive Green',
        color_hex: '#556B2F',
        sku: 'JL-SUN-004-OLV',
        price: 'IDR 349,000',
        stock_status: 'Available',
        shopee_url: 'https://shopee.co.id',
        is_active: true,
        is_default: false,
        sort_order: 2,
        images: [
          { id: 'img-v04-3', product_id: 'jl-04', variant_id: 'var-jl04-2', image_url: '/assets/images/cyberpulse.jpg', alt_text: 'AMBER SHADES 04 Smoked Olive', image_type: 'Primary', sort_order: 1 },
        ],
      },
    ],
  },
  {
    id: 'jl-05',
    name: 'CYBERPULSE 05',
    slug: 'cyberpulse-05',
    sku: 'JL-SUN-005',
    category: 'sunglasses',
    edition: 'Avant-Garde Futuristic Line',
    short_description: 'Aerodynamic sculpted silhouette engineered from composite alloy and obsidian acetate.',
    description: 'Aerodynamic sculpted silhouette engineered from composite alloy and obsidian acetate. Crafted for fearless personal statements and total UV protection.',
    price: 'IDR 359,000',
    compare_at_price: 'IDR 479,000',
    currency: 'IDR',
    badge: 'Limited Edition',
    material: 'Architectural Alloy & Acetate Composite',
    frame_shape: 'Shield / Wrap',
    frame_shape_id: 'shape-shield-wrap',
    frame_shape_obj: DEFAULT_FRAME_SHAPES.find((s) => s.id === 'shape-shield-wrap'),
    suitable_face_shapes: [DEFAULT_FACE_SHAPES[0], DEFAULT_FACE_SHAPES[5]],
    occasions: [DEFAULT_OCCASIONS[5], DEFAULT_OCCASIONS[3]],
    color: 'Obsidian Black & Silver Chrome',
    lens_width: '53 mm',
    bridge_width: '18 mm',
    temple_length: '142 mm',
    overall_width: '146 mm',
    lens_height: '45 mm',
    weight: '34 g',
    lens_compatible: false,
    stock_status: 'Available',
    featured: true,
    published: true,
    sort_order: 5,
    shopee_url: 'https://shopee.co.id',
    images: [
      { image_url: '/assets/images/cyberpulse.jpg', alt_text: 'CYBERPULSE 05 Frame View', image_type: 'Primary', sort_order: 1 },
      { image_url: '/assets/images/campaign_hero2.jpg', alt_text: 'CYBERPULSE 05 Model Wearing', image_type: 'Campaign', sort_order: 2 },
    ],
    variants: [
      {
        id: 'var-jl05-1',
        product_id: 'jl-05',
        color_name: 'Obsidian Black & Silver',
        color_hex: '#1A1A1A',
        sku: 'JL-SUN-005-OBS',
        stock_status: 'Available',
        shopee_url: 'https://shopee.co.id',
        is_active: true,
        is_default: true,
        sort_order: 1,
        images: [
          { id: 'img-v05-1', product_id: 'jl-05', variant_id: 'var-jl05-1', image_url: '/assets/images/cyberpulse.jpg', alt_text: 'CYBERPULSE 05 Obsidian Black', image_type: 'Primary', sort_order: 1 },
          { id: 'img-v05-2', product_id: 'jl-05', variant_id: 'var-jl05-1', image_url: '/assets/images/campaign_hero2.jpg', alt_text: 'CYBERPULSE 05 Model Wearing', image_type: 'Campaign', sort_order: 2 },
        ],
      },
      {
        id: 'var-jl05-2',
        product_id: 'jl-05',
        color_name: 'Liquid Titanium Chrome',
        color_hex: '#C0C0C0',
        sku: 'JL-SUN-005-CHR',
        price: 'IDR 379,000',
        compare_at_price: 'IDR 499,000',
        stock_status: 'Available',
        shopee_url: 'https://shopee.co.id',
        is_active: true,
        is_default: false,
        sort_order: 2,
        images: [
          { id: 'img-v05-3', product_id: 'jl-05', variant_id: 'var-jl05-2', image_url: '/assets/images/helix.jpg', alt_text: 'CYBERPULSE 05 Titanium Chrome', image_type: 'Primary', sort_order: 1 },
        ],
      },
    ],
  },
  {
    id: 'jl-06',
    name: 'HELIX MONO 06',
    slug: 'helix-mono-06',
    sku: 'JL-OPT-006',
    category: 'optical',
    edition: 'Studio Precision Series',
    short_description: 'Linear architectural optical frame reflecting contemporary structural precision.',
    description: 'Linear architectural optical frame reflecting contemporary structural precision. Ultra-thin featherweight feel with enduring durability.',
    price: 'IDR 319,000',
    compare_at_price: 'IDR 429,000',
    currency: 'IDR',
    badge: 'Editorial Pick',
    material: 'Ultra-thin Titanium & Acetate Tips',
    frame_shape: 'Hexagonal Octagon',
    frame_shape_id: 'shape-hexagonal',
    frame_shape_obj: DEFAULT_FRAME_SHAPES.find((s) => s.id === 'shape-hexagonal'),
    suitable_face_shapes: [DEFAULT_FACE_SHAPES[1], DEFAULT_FACE_SHAPES[0]],
    occasions: [DEFAULT_OCCASIONS[1], DEFAULT_OCCASIONS[0]],
    color: 'Brushed Silver Metal',
    lens_width: '49 mm',
    bridge_width: '21 mm',
    temple_length: '145 mm',
    overall_width: '136 mm',
    lens_height: '43 mm',
    weight: '18 g',
    lens_compatible: true,
    stock_status: 'Available',
    featured: true,
    published: true,
    sort_order: 6,
    shopee_url: 'https://shopee.co.id',
    images: [
      { image_url: '/assets/images/helix.jpg', alt_text: 'HELIX MONO 06 Frame View', image_type: 'Primary', sort_order: 1 },
      { image_url: '/assets/images/lookbook4.jpg', alt_text: 'HELIX MONO 06 Model Wearing', image_type: 'Lifestyle', sort_order: 2 },
    ],
    variants: [
      {
        id: 'var-jl06-1',
        product_id: 'jl-06',
        color_name: 'Brushed Silver Titanium',
        color_hex: '#C0C0C0',
        sku: 'JL-OPT-006-SLV',
        stock_status: 'Available',
        shopee_url: 'https://shopee.co.id',
        is_active: true,
        is_default: true,
        sort_order: 1,
        images: [
          { id: 'img-v06-1', product_id: 'jl-06', variant_id: 'var-jl06-1', image_url: '/assets/images/helix.jpg', alt_text: 'HELIX MONO 06 Brushed Silver', image_type: 'Primary', sort_order: 1 },
          { id: 'img-v06-2', product_id: 'jl-06', variant_id: 'var-jl06-1', image_url: '/assets/images/lookbook4.jpg', alt_text: 'HELIX MONO 06 Model Wearing', image_type: 'Lifestyle', sort_order: 2 },
        ],
      },
      {
        id: 'var-jl06-2',
        product_id: 'jl-06',
        color_name: 'Matte Gunmetal Obsidian',
        color_hex: '#2C3539',
        sku: 'JL-OPT-006-GUN',
        stock_status: 'Available',
        shopee_url: 'https://shopee.co.id',
        is_active: true,
        is_default: false,
        sort_order: 2,
        images: [
          { id: 'img-v06-3', product_id: 'jl-06', variant_id: 'var-jl06-2', image_url: '/assets/images/cyberpulse.jpg', alt_text: 'HELIX MONO 06 Matte Gunmetal', image_type: 'Primary', sort_order: 1 },
        ],
      },
    ],
  },
];

export type CatalogSortOption =
  | 'featured'
  | 'relevant'
  | 'best-selling'
  | 'title-asc'
  | 'title-desc'
  | 'price-asc'
  | 'price-desc'
  | 'date-asc'
  | 'date-desc';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;

  // Filter & Search state
  searchQuery: string;
  selectedCategory: 'all' | ProductCategory;
  sortBy: CatalogSortOption;

  // Discovery Filter State
  selectedFrameShapes: string[];
  selectedFaceShapes: string[];
  selectedOccasions: string[];

  // Setters
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: 'all' | ProductCategory) => void;
  setSortBy: (sort: CatalogSortOption) => void;

  toggleFrameShape: (id: string) => void;
  toggleFaceShape: (id: string) => void;
  toggleOccasion: (id: string) => void;
  resetDiscoveryFilters: () => void;

  // Actions
  loadInitialData: () => Promise<void>;
  getProductByIdOrSlug: (identifier: string) => Product | undefined;
  createProduct: (
    product: Omit<Product, 'created_at' | 'updated_at'>,
    images?: ProductImage[],
    variants?: ProductVariant[],
    faceShapeIds?: string[],
    occasionIds?: string[]
  ) => Promise<{ success: boolean; data?: Product; error?: string }>;
  updateProduct: (
    id: string,
    updates: Partial<Product>,
    images?: ProductImage[],
    variants?: ProductVariant[],
    faceShapeIds?: string[],
    occasionIds?: string[]
  ) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  duplicateProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  togglePublish: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: SEED_PRODUCTS,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: 'all',
  sortBy: 'featured',

  selectedFrameShapes: [],
  selectedFaceShapes: [],
  selectedOccasions: [],

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSortBy: (sortBy) => set({ sortBy }),

  toggleFrameShape: (id: string) => {
    const current = get().selectedFrameShapes;
    const exists = current.includes(id);
    set({
      selectedFrameShapes: exists ? [] : [id],
    });
  },

  toggleFaceShape: (id: string) => {
    const current = get().selectedFaceShapes;
    const exists = current.includes(id);
    set({
      selectedFaceShapes: exists ? [] : [id],
    });
  },

  toggleOccasion: (id: string) => {
    const current = get().selectedOccasions;
    const exists = current.includes(id);
    set({
      selectedOccasions: exists ? [] : [id],
    });
  },

  resetDiscoveryFilters: () => {
    set({
      selectedFrameShapes: [],
      selectedFaceShapes: [],
      selectedOccasions: [],
      selectedCategory: 'all',
      searchQuery: '',
    });
  },

  loadInitialData: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ products: SEED_PRODUCTS, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const [
        productsRes,
        imagesRes,
        variantsRes,
        faceShapesJoinRes,
        occasionsJoinRes,
        allShapesRes,
        allFacesRes,
        allOccsRes,
      ] = await Promise.all([
        supabase.from('products').select('*').order('sort_order', { ascending: true }),
        supabase.from('product_images').select('*').order('sort_order', { ascending: true }),
        supabase.from('product_variants').select('*').order('sort_order', { ascending: true }),
        supabase.from('product_face_shapes').select('*'),
        supabase.from('product_occasions').select('*'),
        supabase.from('frame_shapes').select('*'),
        supabase.from('face_shapes').select('*'),
        supabase.from('occasions').select('*'),
      ]);

      if (productsRes.error) throw productsRes.error;

      if (productsRes.data && productsRes.data.length > 0) {
        const allImages: ProductImage[] = imagesRes.data || [];
        const allVariants: any[] = variantsRes.data || [];
        const faceJoins: any[] = faceShapesJoinRes.data || [];
        const occJoins: any[] = occasionsJoinRes.data || [];
        const shapesList: any[] = allShapesRes.data || DEFAULT_FRAME_SHAPES;
        const facesList: any[] = allFacesRes.data || DEFAULT_FACE_SHAPES;
        const occsList: any[] = allOccsRes.data || DEFAULT_OCCASIONS;

        const merged: Product[] = productsRes.data.map((p: any) => {
          // Top-level product images (either variant_id is null or all images for product)
          const productBaseImages = allImages.filter((img) => img.product_id === p.id && !img.variant_id);

          // Variants for this product
          const productVariants: ProductVariant[] = allVariants
            .filter((v) => v.product_id === p.id)
            .map((v) => ({
              ...v,
              images: allImages.filter((img) => img.variant_id === v.id),
            }));

          // Suitable face shapes
          const linkedFaceShapeIds = faceJoins.filter((j) => j.product_id === p.id).map((j) => j.face_shape_id);
          const suitableFaceShapes = facesList.filter((f) => linkedFaceShapeIds.includes(f.id));

          // Occasions
          const linkedOccasionIds = occJoins.filter((j) => j.product_id === p.id).map((j) => j.occasion_id);
          const productOccasions = occsList.filter((o) => linkedOccasionIds.includes(o.id));

          // Frame shape object
          const frameShapeObj = shapesList.find((s) => s.id === p.frame_shape_id);

          return {
            ...p,
            frame_shape_obj: frameShapeObj,
            suitable_face_shapes: suitableFaceShapes,
            occasions: productOccasions,
            images: productBaseImages.length > 0 ? productBaseImages : allImages.filter((img) => img.product_id === p.id),
            variants: productVariants,
          };
        });

        set({ products: merged, isLoading: false });
      } else {
        set({ products: SEED_PRODUCTS, isLoading: false });
      }
    } catch (err: any) {
      console.warn('Failed to load products from Supabase, using seed:', err);
      set({ products: SEED_PRODUCTS, isLoading: false });
    }
  },

  getProductByIdOrSlug: (identifier: string) => {
    return get().products.find(
      (p) => p.id === identifier || p.slug === identifier
    );
  },

  createProduct: async (productData, images = [], variants = [], faceShapeIds = [], occasionIds = []) => {
    const supabase = getSupabaseClient();
    const newId = productData.id || `jl-${Date.now().toString().slice(-4)}`;
    
    // Auto-create initial variant if none provided, ensuring valid UUIDs
    const resolvedVariants: ProductVariant[] = variants.length > 0
      ? variants.map((v, idx) => {
          const validId = ensureUUID(v.id);
          return {
            ...v,
            id: validId,
            product_id: newId,
            sort_order: v.sort_order ?? idx + 1,
            is_default: v.is_default ?? idx === 0,
            is_active: v.is_active ?? true,
            images: (v.images || []).map((img) => ({ ...img, variant_id: validId })),
          };
        })
      : [
          {
            id: generateUUID(),
            product_id: newId,
            color_name: productData.color || 'Standard',
            color_hex: '#111111',
            sku: productData.sku,
            stock_status: productData.stock_status || 'Available',
            is_active: true,
            is_default: true,
            sort_order: 1,
            images: images.slice(0, 2).map((img) => ({ ...img })),
          },
        ];

    const newProduct: Product = {
      ...productData,
      id: newId,
      slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      images: images.map((img, idx) => ({ ...img, product_id: newId, sort_order: idx + 1 })),
      variants: resolvedVariants,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!supabase) {
      const updated = [newProduct, ...get().products];
      set({ products: updated });
      return { success: true, data: newProduct };
    }

    try {
      const { images: _ignoredImgs, variants: _ignoredVars, frame_shape_obj: _fs, suitable_face_shapes: _sfs, occasions: _occs, ...productPayload } = newProduct;
      let insertedProduct: any = null;

      const { data: inserted, error: prodErr } = await supabase
        .from('products')
        .insert([productPayload])
        .select()
        .single();

      if (prodErr) {
        // If remote database has not yet been migrated to include frame_shape_id
        if (prodErr.message?.includes('frame_shape_id') || prodErr.message?.includes('schema cache')) {
          console.warn('frame_shape_id column missing on remote Supabase. Retrying insert without frame_shape_id...');
          const { frame_shape_id: _ignoredId, ...fallbackPayload } = productPayload;
          const { data: retryInserted, error: retryErr } = await supabase
            .from('products')
            .insert([fallbackPayload])
            .select()
            .single();

          if (retryErr) throw retryErr;
          insertedProduct = retryInserted;
        } else {
          throw prodErr;
        }
      } else {
        insertedProduct = inserted;
      }

      // 1. Insert Variants
      if (resolvedVariants.length > 0) {
        const nowIso = new Date().toISOString();
        const variantPayload = resolvedVariants.map((v) => {
          const { images: _vImgs, ...cleanV } = v;
          return {
            ...cleanV,
            product_id: insertedProduct.id,
            created_at: cleanV.created_at || nowIso,
            updated_at: cleanV.updated_at || nowIso,
          };
        });
        const { error: insVarErr } = await supabase.from('product_variants').insert(variantPayload);
        if (insVarErr) {
          console.error('Failed to insert product variants in Supabase:', insVarErr);
          throw insVarErr;
        }

        // Insert variant images
        const variantImagesPayload: any[] = [];
        resolvedVariants.forEach((v) => {
          (v.images || []).forEach((img, idx) => {
            variantImagesPayload.push({
              product_id: insertedProduct.id,
              variant_id: v.id,
              image_url: img.image_url,
              alt_text: img.alt_text || `${insertedProduct.name} - ${v.color_name}`,
              image_type: img.image_type || 'Primary',
              sort_order: img.sort_order ?? idx + 1,
            });
          });
        });
        if (variantImagesPayload.length > 0) {
          const { error: insImgErr } = await supabase.from('product_images').insert(variantImagesPayload);
          if (insImgErr) {
            console.warn('Failed to insert variant images in Supabase:', insImgErr);
          }
        }
      }

      // 2. Insert Base Images
      if (images.length > 0) {
        const baseImgPayload = images.map((img, idx) => ({
          product_id: insertedProduct.id,
          image_url: img.image_url,
          alt_text: img.alt_text || insertedProduct.name,
          image_type: img.image_type || 'Primary',
          sort_order: img.sort_order ?? idx + 1,
        }));
        await supabase.from('product_images').insert(baseImgPayload);
      }

      // 3. Insert Face Shapes Junction
      if (faceShapeIds.length > 0) {
        const fsPayload = faceShapeIds.map((fsId) => ({
          product_id: insertedProduct.id,
          face_shape_id: fsId,
        }));
        await supabase.from('product_face_shapes').insert(fsPayload);
      }

      // 4. Insert Occasions Junction
      if (occasionIds.length > 0) {
        const occPayload = occasionIds.map((occId) => ({
          product_id: insertedProduct.id,
          occasion_id: occId,
        }));
        await supabase.from('product_occasions').insert(occPayload);
      }

      const updated = [newProduct, ...get().products];
      set({ products: updated });
      return { success: true, data: newProduct };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  updateProduct: async (id, updates, images, variants, faceShapeIds, occasionIds) => {
    const current = get().products;
    const existing = current.find((p) => p.id === id);
    if (!existing) return { success: false, error: 'Product not found' };

    const sanitizedVariants = variants !== undefined
      ? variants.map((v, idx) => {
          const validId = ensureUUID(v.id);
          return {
            ...v,
            id: validId,
            product_id: id,
            sort_order: v.sort_order ?? idx + 1,
            is_default: v.is_default ?? idx === 0,
            is_active: v.is_active ?? true,
            images: (v.images || []).map((img) => ({ ...img, variant_id: validId })),
          };
        })
      : existing.variants;

    const updatedProduct: Product = {
      ...existing,
      ...updates,
      images: images !== undefined ? images : existing.images,
      variants: sanitizedVariants,
      updated_at: new Date().toISOString(),
    };

    const optimistic = current.map((p) => (p.id === id ? updatedProduct : p));
    set({ products: optimistic });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { images: _ignoredImgs, variants: _ignoredVars, frame_shape_obj: _fs, suitable_face_shapes: _sfs, occasions: _occs, ...productPayload } = updates;
      const { error: prodErr } = await supabase
        .from('products')
        .update({
          ...productPayload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (prodErr) {
        if (prodErr.message?.includes('frame_shape_id') || prodErr.message?.includes('schema cache')) {
          console.warn('frame_shape_id missing on remote Supabase during update. Retrying without frame_shape_id...');
          const { frame_shape_id: _ignoredId, ...fallbackPayload } = productPayload;
          const { error: retryErr } = await supabase
            .from('products')
            .update({
              ...fallbackPayload,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);

          if (retryErr) throw retryErr;
        } else {
          throw prodErr;
        }
      }

      // Variants update (Smart Upsert: only delete removed variants, upsert existing/new)
      if (variants !== undefined) {
        const { data: existingDbVariants } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', id);

        const currentDbIds = (existingDbVariants || []).map((v: any) => v.id);
        const incomingIds = (sanitizedVariants || []).map((v) => v.id);

        // 1. Delete only variants that were removed in the editor
        const toDeleteIds = currentDbIds.filter((dbId: string) => !incomingIds.includes(dbId));
        if (toDeleteIds.length > 0) {
          await supabase.from('product_variants').delete().in('id', toDeleteIds);
        }

        // 2. Upsert remaining or newly added variants
        if (sanitizedVariants && sanitizedVariants.length > 0) {
          const nowIso = new Date().toISOString();
          const variantPayload = sanitizedVariants.map((v) => {
            const { images: _vImgs, ...cleanV } = v;
            return {
              ...cleanV,
              product_id: id,
              created_at: cleanV.created_at || nowIso,
              updated_at: nowIso,
            };
          });

          const { error: upsertVarErr } = await supabase
            .from('product_variants')
            .upsert(variantPayload, { onConflict: 'id' });

          if (upsertVarErr) {
            console.error('Failed to upsert product variants in Supabase:', upsertVarErr);
            throw upsertVarErr;
          }

          // 3. Sync variant images only if URLs actually changed
          for (const v of sanitizedVariants) {
            const incomingImgs = v.images || [];
            const { data: dbImgs } = await supabase
              .from('product_images')
              .select('id, image_url')
              .eq('variant_id', v.id);

            const dbUrls = (dbImgs || []).map((i: any) => i.image_url).sort().join(',');
            const newUrls = incomingImgs.map((i) => i.image_url).sort().join(',');

            if (dbUrls !== newUrls) {
              await supabase.from('product_images').delete().eq('variant_id', v.id);
              if (incomingImgs.length > 0) {
                const variantImgsPayload = incomingImgs.map((img, idx) => ({
                  product_id: id,
                  variant_id: v.id,
                  image_url: img.image_url,
                  alt_text: img.alt_text || `${existing.name} - ${v.color_name}`,
                  image_type: img.image_type || 'Primary',
                  sort_order: img.sort_order ?? idx + 1,
                }));
                await supabase.from('product_images').insert(variantImgsPayload);
              }
            }
          }
        }
      }

      // Base images update: only sync if image URLs actually changed
      if (images !== undefined) {
        const { data: dbBaseImages } = await supabase
          .from('product_images')
          .select('id, image_url')
          .eq('product_id', id)
          .is('variant_id', null);

        const currentBaseUrls = (dbBaseImages || []).map((i: any) => i.image_url).sort().join(',');
        const newBaseUrls = (images || []).map((i) => i.image_url).sort().join(',');

        if (currentBaseUrls !== newBaseUrls) {
          await supabase.from('product_images').delete().eq('product_id', id).is('variant_id', null);
          if (images.length > 0) {
            const imgPayload = images.map((img, idx) => ({
              product_id: id,
              image_url: img.image_url,
              alt_text: img.alt_text || existing.name,
              image_type: img.image_type || 'Primary',
              sort_order: img.sort_order ?? idx + 1,
            }));
            await supabase.from('product_images').insert(imgPayload);
          }
        }
      }

      // Junction updates
      if (faceShapeIds !== undefined) {
        await supabase.from('product_face_shapes').delete().eq('product_id', id);
        if (faceShapeIds.length > 0) {
          const fsPayload = faceShapeIds.map((fsId) => ({
            product_id: id,
            face_shape_id: fsId,
          }));
          await supabase.from('product_face_shapes').insert(fsPayload);
        }
      }

      if (occasionIds !== undefined) {
        await supabase.from('product_occasions').delete().eq('product_id', id);
        if (occasionIds.length > 0) {
          const occPayload = occasionIds.map((occId) => ({
            product_id: id,
            occasion_id: occId,
          }));
          await supabase.from('product_occasions').insert(occPayload);
        }
      }

      return { success: true };
    } catch (err: any) {
      set({ products: current });
      return { success: false, error: err.message };
    }
  },

  deleteProduct: async (id) => {
    const current = get().products;
    const filtered = current.filter((p) => p.id !== id);
    set({ products: filtered });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      set({ products: current });
      return { success: false, error: err.message };
    }
  },

  duplicateProduct: async (id) => {
    const source = get().products.find((p) => p.id === id);
    if (!source) return { success: false, error: 'Product not found' };

    const newId = `jl-${Date.now().toString().slice(-4)}`;
    const duplicateData: Omit<Product, 'created_at' | 'updated_at'> = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: source.sku ? `${source.sku}-COPY` : undefined,
      published: false,
    };

    const duplicateImages = (source.images || []).map((img) => ({
      image_url: img.image_url,
      alt_text: img.alt_text,
      image_type: img.image_type,
      sort_order: img.sort_order,
    }));

    const duplicateVariants = (source.variants || []).map((v) => ({
      ...v,
      id: generateUUID(),
      product_id: newId,
      sku: v.sku ? `${v.sku}-COPY` : undefined,
    }));

    const fsIds = (source.suitable_face_shapes || []).map((f) => f.id);
    const occIds = (source.occasions || []).map((o) => o.id);

    return get().createProduct(duplicateData, duplicateImages, duplicateVariants, fsIds, occIds);
  },

  togglePublish: async (id) => {
    const target = get().products.find((p) => p.id === id);
    if (target) {
      await get().updateProduct(id, { published: !target.published });
    }
  },
}));
