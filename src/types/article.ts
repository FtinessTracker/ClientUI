export interface ResearchArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author_name: string;
  author_avatar_url: string;
  category: ArticleCategory;
  tags: string[];
  cover_image_url: string;
  source_url: string;
  source_name: string;
  read_time_minutes: number;
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export type ArticleCategory =
  | 'exercise_science'
  | 'nutrition'
  | 'strength_training'
  | 'recovery'
  | 'injury_prevention'
  | 'mental_health'
  | 'supplements'
  | 'general';

export type ArticleViewMode = 'grid' | 'list';

export type ArticleSortOption = 'newest' | 'oldest' | 'read_time';

export interface ArticleFilters {
  search: string;
  category: ArticleCategory | 'all';
  sort: ArticleSortOption;
}

export const ARTICLE_CATEGORY_META: Record<ArticleCategory, { label: string; color: string; bg: string }> = {
  exercise_science: { label: 'Exercise Science', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100' },
  nutrition: { label: 'Nutrition', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
  strength_training: { label: 'Strength Training', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-100' },
  recovery: { label: 'Recovery', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-100' },
  injury_prevention: { label: 'Injury Prevention', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-100' },
  mental_health: { label: 'Mental Health', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-100' },
  supplements: { label: 'Supplements', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
  general: { label: 'General', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-100' },
};
