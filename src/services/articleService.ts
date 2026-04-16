import type { ResearchArticle, ArticleCategory, ArticleSortOption } from '../types/article';
import { ARTICLES_DATA } from '../data/articles';

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
  let results = ARTICLES_DATA.filter(a => a.is_published);

  if (category && category !== 'all') {
    results = results.filter(a => a.category === category);
  }

  if (search.trim()) {
    const term = search.trim().toLowerCase();
    results = results.filter(
      a =>
        a.title.toLowerCase().includes(term) ||
        a.summary.toLowerCase().includes(term) ||
        a.author_name.toLowerCase().includes(term)
    );
  }

  switch (sort) {
    case 'oldest':
      results.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());
      break;
    case 'read_time':
      results.sort((a, b) => a.read_time_minutes - b.read_time_minutes);
      break;
    case 'newest':
    default:
      results.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
      break;
  }

  return results;
}

export async function fetchArticleById(id: string): Promise<ResearchArticle | null> {
  return ARTICLES_DATA.find(a => a.id === id && a.is_published) ?? null;
}
