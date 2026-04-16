import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Calendar, ExternalLink, BookOpen, Tag, Star } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import type { ResearchArticle } from '../../types/article';
import { ARTICLE_CATEGORY_META } from '../../types/article';

interface ArticleDetailModalProps {
  article: ResearchArticle;
  onClose: () => void;
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
    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white bg-gradient-to-br shrink-0 ring-2 ring-white shadow-sm', color)}>
      {initials}
    </div>
  );
}

export default function ArticleDetailModal({ article, onClose }: ArticleDetailModalProps) {
  const catMeta = ARTICLE_CATEGORY_META[article.category] ?? ARTICLE_CATEGORY_META.general;

  const contentParagraphs = article.content
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {article.cover_image_url && (
          <div className="relative h-48 sm:h-56 overflow-hidden shrink-0">
            <img
              src={article.cover_image_url}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-900/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-slate-900/60 transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-sm border', catMeta.color)}>
                  {catMeta.label}
                </span>
                {article.is_featured && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-400/90 text-white backdrop-blur-sm">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    Featured
                  </span>
                )}
              </div>
              <h2 className="text-white font-black text-lg sm:text-xl leading-tight drop-shadow-lg">
                {article.title}
              </h2>
            </div>
          </div>
        )}

        {!article.cover_image_url && (
          <div className="px-6 pt-6 pb-0 flex items-start justify-between shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border', catMeta.bg, catMeta.color)}>
                  {catMeta.label}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">{article.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 sm:px-6 py-5">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <AuthorAvatar name={article.author_name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{article.author_name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(article.published_at), 'MMMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    {article.read_time_minutes} min read
                  </span>
                </div>
              </div>
              {article.source_name && (
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 shrink-0">
                  {article.source_name}
                </span>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Abstract</p>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {article.summary}
              </p>
            </div>

            <div className="space-y-4">
              {contentParagraphs.map((para, idx) => (
                <p key={idx} className="text-sm text-slate-700 leading-[1.75] font-[415]">
                  {para}
                </p>
              ))}
            </div>

            {article.tags.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tags</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {article.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[11px] font-semibold rounded-lg border border-slate-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl font-semibold border-slate-200 text-slate-600"
            >
              Close
            </Button>
            {article.source_url && (
              <Button
                className="flex-1 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white gap-2"
                onClick={() => window.open(article.source_url, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Original
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
