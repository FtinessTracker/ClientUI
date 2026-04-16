import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutGrid, List, SlidersHorizontal, BookOpen,
  ChevronDown, X, Loader as Loader2, FileText,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { fetchArticles } from '../../services/articleService';
import ArticleCard from '../../components/articles/ArticleCard';
import ArticleDetailModal from '../../components/articles/ArticleDetailModal';
import type {
  ResearchArticle,
  ArticleCategory,
  ArticleViewMode,
  ArticleSortOption,
  ArticleFilters,
} from '../../types/article';
import { ARTICLE_CATEGORY_META } from '../../types/article';

const SORT_OPTIONS: { value: ArticleSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'read_time', label: 'Quick Reads' },
];

const CATEGORY_OPTIONS: { value: ArticleCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  ...Object.entries(ARTICLE_CATEGORY_META).map(([key, meta]) => ({
    value: key as ArticleCategory,
    label: meta.label,
  })),
];

export default function ResearchArticles() {
  const [viewMode, setViewMode] = useState<ArticleViewMode>('grid');
  const [filters, setFilters] = useState<ArticleFilters>({
    search: '',
    category: 'all',
    sort: 'newest',
  });
  const [selectedArticle, setSelectedArticle] = useState<ResearchArticle | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['research-articles', filters.category, filters.sort],
    queryFn: () => fetchArticles({ category: filters.category, sort: filters.sort }),
  });

  const filteredArticles = useMemo(() => {
    if (!filters.search.trim()) return articles;
    const term = filters.search.toLowerCase();
    return articles.filter(
      a =>
        a.title.toLowerCase().includes(term) ||
        a.summary.toLowerCase().includes(term) ||
        a.author_name.toLowerCase().includes(term) ||
        a.tags.some(t => t.toLowerCase().includes(term))
    );
  }, [articles, filters.search]);

  const featuredArticles = useMemo(
    () => filteredArticles.filter(a => a.is_featured),
    [filteredArticles]
  );

  const regularArticles = useMemo(
    () => filteredArticles.filter(a => !a.is_featured),
    [filteredArticles]
  );

  const handleSelect = useCallback((article: ResearchArticle) => {
    setSelectedArticle(article);
  }, []);

  const activeFilterCount = [
    filters.category !== 'all',
    filters.sort !== 'newest',
  ].filter(Boolean).length;

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-accent" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">Research</h1>
          </div>
          <p className="text-slate-400 font-medium text-sm mt-1">
            Evidence-based articles to fuel your fitness knowledge
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              )}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search + Filters bar */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
          <input
            type="text"
            placeholder="Search articles, authors, or topics..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters(f => ({ ...f, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(v => !v)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shrink-0',
            showFilters || activeFilterCount > 0
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className={cn(
              'w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center',
              showFilters ? 'bg-white text-slate-900' : 'bg-accent text-white'
            )}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </motion.div>

      {/* Expanded filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setFilters(f => ({ ...f, category: opt.value }))}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                        filters.category === opt.value
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:w-44 shrink-0">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  Sort by
                </label>
                <select
                  value={filters.sort}
                  onChange={e => setFilters(f => ({ ...f, sort: e.target.value as ArticleSortOption }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {activeFilterCount > 0 && (
                <div className="sm:self-end shrink-0">
                  <button
                    onClick={() => setFilters({ search: filters.search, category: 'all', sort: 'newest' })}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {isLoading && (
        <div className={cn(
          'gap-4',
          viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'
        )}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                'rounded-2xl',
                viewMode === 'grid' ? 'h-72' : 'h-24'
              )}
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-red-300" />
          </div>
          <p className="text-sm font-bold text-slate-500 mb-1">Failed to load articles</p>
          <p className="text-xs text-slate-400">Please try again later.</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Featured section */}
          {featuredArticles.length > 0 && !filters.search && filters.category === 'all' && (
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 bg-accent rounded-full" />
                <h2 className="text-base font-black text-slate-900 tracking-tight">Featured Articles</h2>
              </div>
              <div className={cn(
                'gap-4 mb-6',
                viewMode === 'grid' ? 'grid sm:grid-cols-2' : 'space-y-3'
              )}>
                {featuredArticles.map((article, idx) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    index={idx}
                    viewMode={viewMode}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* All articles */}
          {regularArticles.length > 0 && (
            <motion.div variants={itemVariants}>
              {featuredArticles.length > 0 && !filters.search && filters.category === 'all' && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-5 bg-slate-300 rounded-full" />
                  <h2 className="text-base font-black text-slate-900 tracking-tight">All Articles</h2>
                  <span className="text-xs font-semibold text-slate-400 ml-1">
                    ({regularArticles.length})
                  </span>
                </div>
              )}
              <div className={cn(
                'gap-4',
                viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'
              )}>
                {regularArticles.map((article, idx) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    index={idx}
                    viewMode={viewMode}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {filteredArticles.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 border border-dashed border-slate-200">
                <BookOpen className="w-7 h-7 text-slate-200" />
              </div>
              <p className="text-base font-black text-slate-500 mb-1">No articles found</p>
              <p className="text-sm text-slate-400 max-w-sm">
                {filters.search
                  ? `No results for "${filters.search}". Try a different search term.`
                  : 'No articles match the selected filters. Try adjusting your criteria.'}
              </p>
              {(filters.search || filters.category !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => setFilters({ search: '', category: 'all', sort: 'newest' })}
                  className="mt-4 rounded-xl font-semibold border-slate-200 text-slate-600 text-sm"
                >
                  Clear all filters
                </Button>
              )}
            </motion.div>
          )}

          {/* Results count */}
          {filteredArticles.length > 0 && (
            <motion.p
              variants={itemVariants}
              className="text-center text-xs font-medium text-slate-300 pt-4"
            >
              Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
            </motion.p>
          )}
        </>
      )}

      {/* Article detail modal */}
      <AnimatePresence>
        {selectedArticle && (
          <ArticleDetailModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
