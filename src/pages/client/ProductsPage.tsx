import React, { useState } from 'react';
import { ShoppingCart, CircleCheck as CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  coinCost: number;
  image: string;
  badge: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'resistance-bands',
    name: 'Resistance Band Set',
    description:
      'Complete 4-piece resistance band kit with pilates bar, ankle straps, and a carry bag. Ideal for full-body strength training at home or on the go.',
    price: 49.99,
    coinCost: 500,
    image: '/Ressitance_bands.png',
    badge: 'Best Seller',
  },
  {
    id: 'barbell-set',
    name: 'Olympic Barbell & Weight Set',
    description:
      'Premium adjustable barbell and weight plate set with quick-lock collars. Includes multiple bar lengths for versatile compound lifts and progressive overload.',
    price: 129.99,
    coinCost: 1300,
    image: '/weights_and_bar.png',
    badge: 'Pro Pick',
  },
];

type PayMethod = 'cash' | 'coins';

interface ModalState {
  product: Product;
  method: PayMethod;
}

export default function ProductsPage() {
  const [coins, setCoins] = useState(750);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState | null>(null);
  const [justBought, setJustBought] = useState<string | null>(null);

  function openModal(product: Product, method: PayMethod) {
    setModal({ product, method });
  }

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
    setTimeout(() => setJustBought(null), 2800);
  }

  const canAfford = (product: Product, method: PayMethod) =>
    method === 'cash' || coins >= product.coinCost;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shop</h1>
          <p className="text-slate-500 text-sm mt-1">Premium fitness equipment delivered to your door</p>
        </div>

        {/* Coin balance pill */}
        <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 self-start sm:self-auto">
          <span className="text-2xl leading-none">🪙</span>
          <div>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none">Your Coins</p>
            <p className="text-2xl font-black text-amber-700 leading-none mt-0.5">{coins.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Coins earn banner */}
      <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl px-5 py-4 mb-8">
        <span className="text-xl mt-0.5">🪙</span>
        <div>
          <p className="text-sm font-bold text-blue-800">Earn coins with every purchase</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Get <span className="font-bold">10 coins</span> for every $1 spent. Redeem coins for free products later!
          </p>
        </div>
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {PRODUCTS.map((product, i) => {
          const isOwned = owned.has(product.id);
          const isSuccess = justBought === product.id;
          const coinsEnough = coins >= product.coinCost;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm shadow-slate-900/[0.04] overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="relative bg-slate-50 overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                />

                {/* Badge */}
                <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {product.badge}
                </span>

                {/* Owned overlay */}
                {isOwned && !isSuccess && (
                  <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl px-5 py-2.5 flex items-center gap-2 shadow-lg">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-bold text-slate-800">Purchased</span>
                    </div>
                  </div>
                )}

                {/* Success flash */}
                <AnimatePresence>
                  {isSuccess && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-green-500/90 flex items-center justify-center"
                    >
                      <div className="text-center text-white">
                        <CheckCircle className="w-10 h-10 mx-auto mb-2" />
                        <p className="font-bold text-lg">Order placed!</p>
                        <p className="text-sm text-green-100 mt-0.5">Thank you for your purchase</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 text-[15px] leading-snug">{product.name}</h3>
                <p className="text-slate-500 text-[13px] mt-1.5 leading-relaxed flex-1">{product.description}</p>

                {/* Pricing tiles */}
                <div className="flex items-stretch gap-2.5 mt-5 mb-4">
                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-3 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price</p>
                    <p className="text-xl font-black text-slate-900">${product.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center justify-center text-slate-300 text-xs font-medium px-0.5">or</div>

                  <div className={`flex-1 rounded-2xl px-3 py-3 text-center border ${coinsEnough ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${coinsEnough ? 'text-amber-500' : 'text-slate-400'}`}>
                      Coins
                    </p>
                    <p className={`text-xl font-black ${coinsEnough ? 'text-amber-600' : 'text-slate-300'}`}>
                      🪙 {product.coinCost.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                {!isOwned ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(product, 'cash')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-[13px] font-bold px-4 py-2.5 rounded-xl transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Buy Now
                    </button>
                    <button
                      onClick={() => coinsEnough && openModal(product, 'coins')}
                      disabled={!coinsEnough}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-[13px] font-bold px-4 py-2.5 rounded-xl border transition-all active:scale-[0.98] ${
                        coinsEnough
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-sm">🪙</span>
                      Use Coins
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-100 rounded-xl py-2.5">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-[13px] font-semibold text-green-700">You own this</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

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
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              {/* Modal image */}
              <div className="relative bg-slate-50" style={{ aspectRatio: '16/9' }}>
                <img src={modal.product.image} alt={modal.product.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => setModal(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-slate-900 text-lg leading-snug">{modal.product.name}</h3>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">{modal.product.description}</p>

                {/* Order summary */}
                <div className="mt-5 bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Payment method</span>
                    <span className="font-bold text-slate-900">
                      {modal.method === 'coins' ? '🪙 Coins' : '💳 Card'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{modal.method === 'coins' ? 'Coins to spend' : 'Total'}</span>
                    <span className="font-bold text-slate-900">
                      {modal.method === 'coins'
                        ? `${modal.product.coinCost.toLocaleString()} coins`
                        : `$${modal.product.price.toFixed(2)}`}
                    </span>
                  </div>
                  {modal.method === 'cash' && (
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                      <span className="font-semibold text-amber-600">Coins earned</span>
                      <span className="font-bold text-amber-600">
                        🪙 +{Math.floor(modal.product.price * 10).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirm}
                    disabled={!canAfford(modal.product, modal.method)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
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
