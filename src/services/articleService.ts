import { supabase } from '../lib/supabase';
import type { ResearchArticle, ArticleCategory, ArticleSortOption } from '../types/article';

interface FetchArticlesParams {
  search?: string;
  category?: ArticleCategory | 'all';
  sort?: ArticleSortOption;
}

export async function fetchArticles({
  search = '',
  category = 'all',
  sort = 'newest',
}: FetchArticlesParams = {}): Promise<ResearchArticle[]> {
  let query = supabase
    .from('research_articles')
    .select('*')
    .eq('is_published', true);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`title.ilike.${term},summary.ilike.${term},author_name.ilike.${term}`);
  }

  switch (sort) {
    case 'oldest':
      query = query.order('published_at', { ascending: true });
      break;
    case 'read_time':
      query = query.order('read_time_minutes', { ascending: true });
      break;
    case 'newest':
    default:
      query = query.order('published_at', { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as ResearchArticle[];
}

export async function fetchArticleById(id: string): Promise<ResearchArticle | null> {
  const { data, error } = await supabase
    .from('research_articles')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();

  if (error) throw error;
  return data as ResearchArticle | null;
}
