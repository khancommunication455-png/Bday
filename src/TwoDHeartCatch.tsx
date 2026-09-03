import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Heart, Star, Skull } from 'lucide-react';
import confetti from 'canvas-confetti';

const safeConfetti = (options: any) => {
    try {
        confetti(options);
    } catch (e) {
        console.warn('Confetti error', e);
    }
};

export const TwoDHeartCatch = ({ onScore, onComplete }: { onScore: (s: number) => void, onComplete: () => void }) => {
  const [items, setItems] = useState<{ id: number, x: number, type: 'normal' | 'gold' | 'bad', speed: number }[]>([]);
  const [gameTime, setGameTime] = useState(25);
  const nextId = useRef(0);
  const [combo, setCombo] = useState(0);
  const [popups, setPopups] = useState<{ id: number, x: number, y: number, text: string, color: string }[]>([]);
  const popupId = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const typeRand = Math.random();
      let type: 'normal' | 'gold' | 'bad' = 'normal';
      if (typeRand > 0.85) type = 'gold';
      else if (typeRand < 0.15) type = 'bad';

      setItems(prev => [
        ...prev,
        {
          id: nextId.current++,
          x: 10 + Math.random() * 80, // percentage 10% to 90%
          type,
          speed: 3 + Math.random() * 3 // duration 3s to 6s
        }
      ]);
    }, 600);

    const timer = setInterval(() => {
      setGameTime(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          clearInterval(timer);
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (gameTime <= 0) {
      const t = setTimeout(onComplete, 1500);
      return () => clearTimeout(t);
    }
  }, [gameTime, onComplete]);

  const handleCatch = (id: number, type: 'normal' | 'gold' | 'bad', e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();

    const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const rect = (e.currentTarget as HTMLElement).closest('.game-arena')?.getBoundingClientRect();
    const relX = rect ? clientX - rect.left : 50;
    const relY = rect ? clientY - rect.top : 50;

    const addPopup = (text: string, color: string) => {
      const pid = popupId.current++;
      setPopups(prev => [...prev, { id: pid, x: relX, y: relY, text, color }]);
      setTimeout(() => setPopups(prev => prev.filter(p => p.id !== pid)), 800);
    };

    if (type === 'gold') {
      onScore(5);
      setCombo(c => c + 1);
      addPopup('+5', '#ffd700');
      safeConfetti({ particleCount: 30, colors: ['#ffd700'], spread: 50 });
    } else if (type === 'bad') {
      onScore(-2);
      setCombo(0);
      addPopup('-2', '#9ca3af');
    } else {
      onScore(1);
      setCombo(c => c + 1);
      addPopup('+1', '#f472b6');
    }

    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="game-arena w-full h-[500px] sm:h-[600px] relative rounded-[30px] sm:rounded-[40px] overflow-hidden bg-gradient-to-b from-indigo-950/80 to-black border border-white/10 shadow-2xl backdrop-blur-sm touch-none">
      <div className="absolute top-6 left-8 z-10 font-bold text-3xl text-white drop-shadow-xl flex items-center gap-4 pointer-events-none">
        <Clock className="text-romantic-pink animate-pulse" />
        <span className="font-mono">{gameTime}s</span>
      </div>

      <AnimatePresence>
        {combo > 1 && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            key={combo}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-romantic-gold font-script text-3xl sm:text-4xl drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] pointer-events-none"
          >
            {combo}x Combo!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ y: -100, rotate: 0 }}
              animate={{ y: 800, rotate: 360 }}
              transition={{ duration: item.speed, ease: "linear" }}
              onAnimationComplete={() => {
                setItems(prev => prev.filter(i => i.id !== item.id));
                setCombo(0);
              }}
              onPointerDown={(e: any) => handleCatch(item.id, item.type, e)}
              className="absolute top-0 cursor-pointer w-16 h-16 flex items-center justify-center transform -translate-x-1/2"
              style={{ touchAction: 'none', left: `${item.x}%` }}
              exit={{ scale: 0, opacity: 0 }}
            >
              {item.type === 'gold' ? (
                <Star size={48} fill="#ffd700" className="text-romantic-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" />
              ) : item.type === 'bad' ? (
                <Skull size={44} className="text-gray-400 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
              ) : (
                <Heart size={44} fill="#f472b6" className="text-romantic-rose drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {popups.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -50, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute z-20 font-black text-2xl pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{ left: p.x, top: p.y, color: p.color, textShadow: `0 0 12px ${p.color}` }}
          >
            {p.text}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest uppercase pointer-events-none text-center w-full px-4">
        Catch the <span className="text-romantic-gold font-bold">Gold</span> stars! Avoid <Skull size={12} className="inline mx-1" />
      </div>
    </div>
  );
};
