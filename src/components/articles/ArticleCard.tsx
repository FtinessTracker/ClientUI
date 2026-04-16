import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowUpRight, Star, BookOpen, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import type { ResearchArticle, ArticleViewMode } from '../../types/article';
import { ARTICLE_CATEGORY_META } from '../../types/article';

interface ArticleCardProps {
  article: ResearchArticle;
  index: number;
  viewMode: ArticleViewMode;
  onSelect: (article: ResearchArticle) => void;
  [key: string]: unknown;
}

function AuthorAvatar({ name }: { name: string }) {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-emerald-400 to-emerald-600',
    'from-orange-400 to-orange-600',
    'from-rose-400 to-rose-600',
    'from-cyan-400 to-cyan-600',
    'from-amber-400 to-amber-600',
  ];
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-br shrink-0', color)}>
      {initials}
    </div>
  );
}

export default function ArticleCard({ article, index, viewMode, onSelect }: ArticleCardProps) {
  const catMeta = ARTICLE_CATEGORY_META[article.category] ?? ARTICLE_CATEGORY_META.general;

  if (viewMode === 'list') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.35, ease: 'easeOut' }}
        onClick={() => onSelect(article)}
        className="group relative flex gap-5 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onSelect(article)}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-accent rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {article.cover_image_url && (
          <div className="w-28 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
            <img
              src={article.cover_image_url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border', catMeta.bg, catMeta.color)}>
              {catMeta.label}
            </span>
            {article.is_featured && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                <Star className="w-2.5 h-2.5 fill-current" />
                Featured
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-accent transition-colors duration-200">
            {article.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-medium leading-relaxed">
            {article.summary}
          </p>
          <div className="flex items-center gap-3 mt-2.5">
            <div className="flex items-center gap-1.5">
              <AuthorAvatar name={article.author_name} />
              <span className="text-[11px] font-semibold text-slate-500">{article.author_name}</span>
            </div>
            <span className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-300" />
              <span className="text-[11px] font-medium text-slate-400">{article.read_time_minutes} min read</span>
            </div>
            <span className="w-px h-3 bg-slate-200" />
            <span className="text-[11px] font-medium text-slate-400">
              {format(new Date(article.published_at), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        <div className="flex items-center shrink-0">
          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:bg-accent/10">
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      onClick={() => onSelect(article)}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer flex flex-col"
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(article)}
    >
      {article.cover_image_url && (
        <div className="relative h-44 overflow-hidden bg-slate-100">
          <img
            src={article.cover_image_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border backdrop-blur-sm bg-white/90', catMeta.color)}>
              {catMeta.label}
            </span>
            {article.is_featured && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-sm bg-amber-400/90 text-white border border-amber-300">
                <Star className="w-2.5 h-2.5 fill-current" />
                Featured
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-900/70 backdrop-blur-sm text-white/90 px-2 py-1 rounded-lg text-[10px] font-bold">
            <Clock className="w-3 h-3" />
            {article.read_time_minutes} min
          </div>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200 mb-2">
          {article.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 font-medium leading-relaxed mb-4 flex-1">
          {article.summary}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <AuthorAvatar name={article.author_name} />
            <div>
              <p className="text-[11px] font-bold text-slate-700 leading-none">{article.author_name}</p>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                {format(new Date(article.published_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          {article.source_name && (
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 truncate max-w-[100px]">
              {article.source_name}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
