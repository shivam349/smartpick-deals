export interface Product {
  id?: string;
  name: string;
  slug: string;
  merchant: string;
  source_url: string;
  affiliate_url: string;
  image_url: string;
  price: string;
  old_price?: string | null;
  is_deal?: boolean | null;
  discount_percent?: number | null;
  deal_badge?: string | null;
  rating: number;
  review_count: number;
  category: string;
  description: string;
  score: number;
  status: string;
  specs?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface Research {
  id: string;
  product_id: string;
  pros: string[];
  cons: string[];
  best_for: string;
  not_for: string;
  comparison: string;
  review_summary: string;
  recommendation: string;
  source_data?: Record<string, any>;
  created_at?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  product_count: number;
  created_at?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  meta_description?: string;
  content: string;
  category: string;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AutomationLog {
  id: string;
  event: string;
  status: string;
  details?: Record<string, any>;
  created_at?: string;
}

export interface ComparisonPair {
  productA: Product;
  productB: Product;
  slug: string;
  title: string;
  verdict: string;
  winnerSlug: string;
}
