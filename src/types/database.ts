// ==============================================================================
// JEM LUIQA EYEWEAR - TYPESCRIPT DATA MODELS & DATABASE TYPES
// ==============================================================================

export type ProductCategory = 'sunglasses' | 'optical';

export type StockStatus = 'Available' | 'Low Stock' | 'Sold Out' | 'Coming Soon';

export type ProductImageType = 'Primary' | 'Front' | 'Side' | 'Detail' | 'Campaign' | 'Lifestyle';

export interface ProductImage {
  id?: string;
  product_id?: string;
  variant_id?: string;
  image_url: string;
  alt_text?: string;
  image_type: ProductImageType;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  swatch_image_url?: string;
  sku?: string;
  price?: string; // Optional price override
  compare_at_price?: string;
  stock_status: StockStatus;
  shopee_url?: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  images?: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

export interface FrameShape {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  active: boolean;
  created_at?: string;
}

export interface FaceShape {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  active: boolean;
  created_at?: string;
}

export interface Occasion {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  category: ProductCategory;
  edition?: string;
  short_description?: string;
  description?: string;
  price: string; // e.g. "IDR 299,000"
  compare_at_price?: string;
  currency?: string;
  badge?: string;
  
  // Specifications
  material?: string;
  frame_shape?: string; // Legacy string or display name
  frame_shape_id?: string;
  frame_shape_obj?: FrameShape;
  suitable_face_shapes?: FaceShape[];
  occasions?: Occasion[];
  color?: string; // Base/default colorway title
  lens_width?: string;
  bridge_width?: string;
  temple_length?: string;
  overall_width?: string;
  lens_height?: string;
  weight?: string;
  lens_compatible?: boolean;
  
  // Commerce & Visibility
  stock_status: StockStatus;
  featured: boolean;
  published: boolean;
  sort_order?: number;
  shopee_url?: string;
  
  // Media & Variant Relations
  images?: ProductImage[];
  variants?: ProductVariant[];
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export type MediaType = 'image' | 'video';

export interface Campaign {
  id: string;
  name: string;
  eyebrow?: string;
  title: string;
  description?: string;
  desktop_media_url: string;
  mobile_media_url?: string;
  media_type: MediaType;
  primary_cta_label: string;
  primary_cta_url: string;
  secondary_cta_label: string;
  secondary_cta_url: string;
  object_position_desktop?: string;
  object_position_mobile?: string;
  autoplay_duration?: number;
  sort_order: number;
  active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type LensCategory = 'Single Vision' | 'Bifocal' | 'Progressive' | 'Specialty';

export type VisionType = 'Single Vision' | 'Bifocal' | 'Progressive';

export interface LensOptionChoice {
  id?: string;
  label: string;
  extra_price?: number; // e.g. 0 or 50000
}

export interface LensOption {
  id: string;
  name: string; // e.g. "Tint Color", "Lens Coating"
  description?: string;
  choices: LensOptionChoice[];
}

export interface LensService {
  id: string;
  name: string;
  slug: string;
  category: LensCategory;
  short_description?: string;
  description?: string;
  starting_price: string;
  currency?: string;
  features: string[]; // List of feature bullet points
  recommended_for?: string;
  sort_order: number;
  active: boolean;
  
  // Customization & Compatibility Rules
  supports_non_prescription?: boolean;
  supported_vision_types?: VisionType[];
  lens_options?: LensOption[];
  
  created_at?: string;
  updated_at?: string;
}

export type LensRequirement = 'non-prescription' | 'prescription';

export interface PrescriptionEye {
  sph: string;
  cyl: string;
  axis: string;
}

export interface PrescriptionData {
  od: PrescriptionEye;
  os: PrescriptionEye;
  pd: string;
  add?: string; // Reading addition for near vision (Bifocal/Progressive/Reading)
  cc?: string; // Chief Complaint / Catatan Khusus
  unsure: boolean; // "I'm not sure / need help reading prescription"
  notes?: string;
  prescription_mode?: 'manual' | 'upload';
  prescription_file_url?: string;
  prescription_file_name?: string;
}

export interface CustomLensSelection {
  requirement: LensRequirement;
  visionType?: VisionType;
  prescription?: PrescriptionData;
  lensService?: LensService;
  selectedOptions?: Record<string, string>; // optionId -> choiceLabel
  estimatedTotalPrice?: string;
}


export interface Promotion {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  price_label?: string;
  image_url?: string;
  cta_label?: string;
  cta_url?: string;
  active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface LookbookMedia {
  id: string;
  lookbook_id: string;
  media_url: string;
  media_type: MediaType;
  caption?: string;
  sort_order: number;
  created_at?: string;
}

export interface LookbookCollection {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  cover_image_url?: string;
  published: boolean;
  featured: boolean;
  sort_order: number;
  media?: LookbookMedia[];
  created_at?: string;
  updated_at?: string;
}

export type InquiryStatus = 'New' | 'Contacted' | 'In Production' | 'Completed' | 'Canceled' | 'Read' | 'Replied' | 'Closed';

export interface ContactInquiry {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  status: InquiryStatus;
  product_id?: string;
  product_name?: string;
  variant_name?: string;
  variant_sku?: string;
  variant_color_hex?: string;
  prescription_file_url?: string;
  prescription_file_name?: string;
  custom_lens_data?: CustomLensSelection;
  total_price?: string;
  created_at: string;
}

export interface SiteSettings {
  brand_name: string;
  tagline: string;
  instagram_url: string;
  shopee_url: string;
  whatsapp_number: string;
  whatsapp_default_message: string;
  email: string;
  address: string;
  operational_hours: string;
  google_maps_url: string;
  footer_text: string;
  seo_default_title?: string;
  seo_default_description?: string;
  social_share_image?: string;
}

export type HomeSectionId =
  | 'hero'
  | 'promo_banner'
  | 'collection_grid'
  | 'featured_products'
  | 'lens_showcase'
  | 'editorial_story';

export interface HomeSectionConfig {
  id: HomeSectionId;
  name: string;
  description: string;
  badge?: string;
  enabled: boolean;
}

export interface HomepageLayoutSettings {
  hero_enabled: boolean;
  sections: HomeSectionConfig[];
}

// ------------------------------------------------------------------------------
// 9. SECURITY AUDIT LOGS
// ------------------------------------------------------------------------------
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'ACTIVATE'
  | 'DEACTIVATE';

export type AuditEntityType =
  | 'products'
  | 'product_variants'
  | 'product_images'
  | 'campaigns'
  | 'lens_services'
  | 'promotions'
  | 'lookbook_collections'
  | 'lookbook_media'
  | 'site_settings'
  | string;

export interface AuditLogEntry {
  id: string;
  actor_user_id?: string | null;
  actor_email?: string | null;
  action: AuditAction | string;
  entity_type: AuditEntityType;
  entity_id?: string | null;
  entity_label?: string | null;
  before_data?: Record<string, any> | null;
  after_data?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  created_at: string;
}

export type AuditDateRangePreset = 'all' | 'today' | '7days' | '30days' | 'custom';

export interface AuditLogFilters {
  dateRange: AuditDateRangePreset;
  startDate?: string;
  endDate?: string;
  action: string;
  entityType: string;
  userEmail: string;
  searchQuery: string;
}

