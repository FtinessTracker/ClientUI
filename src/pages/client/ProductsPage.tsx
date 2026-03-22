import React, { useState } from 'react';
import { ShoppingCart, CircleCheck as CheckCircle, X, Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  coinCost: number;
  image: string;
  badge?: string;
  category: string;
  tag: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'resistance-bands',
    name: 'Resistance Band Set',
    description: 'Complete 4-piece kit with pilates bar, ankle straps & carry bag.',
    price: 49.99,
    coinCost: 500,
    image: '/Ressitance_bands.png',
    badge: 'Best Seller',
    category: 'Bands',
    tag: 'Home Training',
  },
  {
    id: 'barbell-set',
    name: 'Olympic Barbell & Weight Set',
    description: 'Adjustable barbell & plates with quick-lock collars. Multiple bar lengths.',
    price: 129.99,
    coinCost: 1300,
    image: '/weights_and_bar.png',
    badge: 'Pro Pick',
    category: 'Weights',
    tag: 'Strength',
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];

type PayMethod = 'cash' | 'coins';
interface ModalState { product: Product; method: PayMethod; }

export default function ProductsPage() {
  const [coins, setCoins] = useState(750);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState | null>(null);
  const [justBought, setJustBought] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  function confirm() {
    if (!modal) return;
    const { product, method } = modal;
    if (method === 'coins') {
      setCoins(prev => prev - product.coinCost);
    } else {
      setCoins(prev => prev + Math.floor(product.price * 10));
    }
    setOwned(prev => new Set([...prev, product.id]));
    setModal(null);
    setJustBought(product.id);
    setTimeout(() => setJustBought(null), 2500);
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shop</h1>
          <p className="text-slate-400 text-sm mt-1">Premium fitness equipment, delivered.</p>
        </div>

        {/* Coin balance */}
        <div className="inline-flex items-center gap-2.5 bg-amber-50 border border-amber-200/80 rounded-2xl px-4 py-2.5 self-start shrink-0">
          <span className="text-xl leading-none">🪙</span>
          <div className="leading-none">
            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-[0.1em] mb-1">Coins</p>
            <p className="text-[17px] font-black text-amber-700">{coins.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Earn banner */}
      <div className="flex items-center gap-3 bg-slate-900 text-white rounded-2xl px-5 py-3.5 mb-7">
        <span className="text-lg shrink-0">🪙</span>
        <p className="text-[13px] font-medium text-slate-300">
          Earn <span className="font-bold text-white">10 coins per $1</span> on every purchase — redeem them for free gear later.
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-4">
        {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
      </p>

      {/* Grid — compact cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-slate-500">No products found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, i) => {
            const isOwned = owned.has(product.id);
            const isSuccess = justBought === product.id;
            const coinsEnough = coins >= product.coinCost;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md hover:shadow-slate-900/[0.06] transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Compact image thumbnail */}
                <div className="relative bg-slate-50 overflow-hidden" style={{ aspectRatio: '1/1' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.06]"
                  />

                  {product.badge && (
                    <span className="absolute top-2 left-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {product.badge}
                    </span>
                  )}

                  <span className="absolute top-2 right-2 bg-white/90 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-100">
                    {product.tag}
                  </span>

                  {/* Owned overlay */}
                  <AnimatePresence>
                    {(isOwned && !isSuccess) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 flex items-center justify-center"
                      >
                        <div className="bg-white rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-[11px] font-bold text-slate-800">Purchased</span>
                        </div>
                      </motion.div>
                    )}
                    {isSuccess && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-green-500/95 flex items-center justify-center"
                      >
                        <div className="text-center text-white">
                          <CheckCircle className="w-8 h-8 mx-auto mb-1" />
                          <p className="text-[12px] font-bold">Ordered!</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card body */}
                <div className="p-3.5 flex flex-col flex-1">
                  <div className="mb-auto">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.category}</p>
                    <h3 className="font-bold text-slate-900 text-[13px] leading-snug mt-0.5">{product.name}</h3>
                    <p className="text-slate-400 text-[11px] mt-1 leading-relaxed line-clamp-2">{product.description}</p>
                  </div>

                  {/* Price row */}
                  <div className="flex items-center justify-between mt-3 mb-3">
                    <span className="text-base font-black text-slate-900">${product.price.toFixed(2)}</span>
                    <span className={`text-[11px] font-bold ${coinsEnough ? 'text-amber-600' : 'text-slate-300'}`}>
                      🪙 {product.coinCost.toLocaleString()}
                    </span>
                  </div>

                  {/* Buttons */}
                  {!isOwned ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setModal({ product, method: 'cash' })}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-2 rounded-lg transition-colors active:scale-[0.97]"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Buy
                      </button>
                      <button
                        onClick={() => coinsEnough && setModal({ product, method: 'coins' })}
                        disabled={!coinsEnough}
                        title={!coinsEnough ? `Need ${product.coinCost - coins} more coins` : 'Redeem with coins'}
                        className={`flex-1 flex items-center justify-center gap-1 text-[11px] font-bold py-2 rounded-lg border transition-colors active:scale-[0.97] ${
                          coinsEnough
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                        }`}
                      >
                        🪙 Coins
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 bg-green-50 border border-green-100 rounded-lg py-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-[11px] font-bold text-green-700">Owned</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirmation modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setModal(null); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    <img src={modal.product.image} alt="" className="w-full h-full object-contain p-1" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm Purchase</p>
                    <p className="text-sm font-bold text-slate-900 leading-snug">{modal.product.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setModal(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

              <div className="px-6 py-5">
                {/* Summary */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment</span>
                    <span className="font-bold text-slate-900">
                      {modal.method === 'coins' ? '🪙 Coins' : '💳 Card'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{modal.method === 'coins' ? 'Coins spent' : 'Total'}</span>
                    <span className="font-bold text-slate-900">
                      {modal.method === 'coins'
                        ? `${modal.product.coinCost.toLocaleString()} coins`
                        : `$${modal.product.price.toFixed(2)}`}
                    </span>
                  </div>
                  {modal.method === 'cash' && (
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="font-semibold text-amber-600">You'll earn</span>
                      <span className="font-bold text-amber-600">
                        🪙 +{Math.floor(modal.product.price * 10).toLocaleString()} coins
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 mt-4">
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirm}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors active:scale-[0.98]"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
