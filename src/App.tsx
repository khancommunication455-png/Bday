

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Stars } from "@react-three/drei";

import React, { useState, useEffect, useRef, useMemo, Suspense, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Music,
  VolumeX,
  ChevronRight,
  Send,
  Play,
  Smartphone,
  Gift,
  Award,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { TwoDHeartCatch } from './TwoDHeartCatch';
import { ColorfulFloatingItem3D } from './ColorfulFloatingItem3D';
import { REASONS_I_LOVE_YOU, QUIZ_QUESTIONS, BEAUTIFUL_WISHES, GRADIENT_PALETTE } from './constants';
import { ambientBackgroundSynth, playSyntheticNotification } from './utils/audio';

// --- Safe confetti wrapper to prevent canvas.getBoundingClientRect errors ---
const safeConfetti = (options?: confetti.Options) => {
    try {
        confetti(options);
    } catch (e) {
        console.warn('Confetti error suppressed:', e);
    }
};

// --- Dreamy animated starfield backdrop (replaces old photo backgrounds) ---
const StarsBackdrop = ({ count = 1200, speed = 1, className = "" }: { count?: number; speed?: number; className?: string }) => (
    <div className={cn("absolute inset-0 z-0 pointer-events-none", className)}>
        <Canvas>
            <Stars radius={100} depth={50} count={count} factor={4} saturation={0} fade speed={speed} />
        </Canvas>
    </div>
);

// --- Client-only random helper (avoids SSR hydration mismatches) ---
const useMounted = () => {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );
};

// --- Floating birthday balloons & sparkles ---
const FloatingBalloons = ({ count = 10 }: { count?: number }) => {
    const mounted = useMounted();
    const balloons = useMemo(() =>
        mounted ? [...Array(count)].map((_, i) => ({
            left: 2 + Math.random() * 92,
            delay: -Math.random() * 16,
            duration: Math.random() * 12 + 14,
            emoji: ['🎈', '✨', '💖', '🎉', '⭐', '🎊', '🎂', '🎀', '🌸', '💫'][i % 10],
            scale: 0.65 + Math.random() * 0.75,
        })) : [], [count, mounted]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
            {balloons.map((b, i) => (
                <motion.div
                    key={i}
                    initial={{ y: "110vh", scale: b.scale }}
                    animate={{ y: "-20vh", x: [0, 25, -20, 0], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "linear" }}
                    className="absolute text-3xl md:text-4xl drop-shadow-lg"
                    style={{ left: `${b.left}%` }}
                >
                    {b.emoji}
                </motion.div>
            ))}
        </div>
    );
};

// --- Colorful Background Blobs ---
const ColorfulBlobs = () => {
    const mounted = useMounted();
    const particles = useMemo(() =>
        mounted ? [...Array(6)].map((_, i) => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 10 + 15,
            delay: -Math.random() * 10,
            bg: GRADIENT_PALETTE[i % GRADIENT_PALETTE.length].split(' ')[0].replace('from-', 'bg-'),
        })) : [], [mounted]);

    return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden scale-110">
        <motion.div
            animate={{
                x: [0, 80, -50, 0],
                y: [0, -80, 80, 0],
                rotate: [0, 180]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-pink-500/10 rounded-full blur-[60px]"
            style={{ willChange: 'transform' }}
        />
        <motion.div
            animate={{
                x: [0, -100, 60, 0],
                y: [0, 100, -40, 0],
                rotate: [180, 0]
            }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-fuchsia-600/10 rounded-full blur-[80px]"
            style={{ willChange: 'transform' }}
        />
        <motion.div
            animate={{
                x: [0, 60, -60, 0],
                y: [0, 60, 100, 0],
                scale: [1, 1.2, 0.8, 1]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] right-[-5%] w-[50%] h-[50%] bg-amber-400/10 rounded-full blur-[70px]"
            style={{ willChange: 'transform' }}
        />
        {/* Floating particles */}
        {particles.map((p, i) => (
            <motion.div
                key={i}
                initial={{
                    x: `${p.x}%`,
                    y: `${p.y}%`,
                    opacity: 0.1
                }}
                animate={{
                    y: ["-10%", "110%"],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "linear"
                }}
                className={cn("absolute w-1 h-1 rounded-full", p.bg)}
            />
        ))}
    </div>
    );
};

// --- Friendship songs (shown in the outro) ---
const MusicPlayer = () => {
    const songs = [
        { title: "Count on Me", artist: "Bruno Mars", duration: "3:17" },
        { title: "I'll Be There for You", artist: "The Rembrandts", duration: "3:09" },
        { title: "You've Got a Friend in Me", artist: "Randy Newman", duration: "2:04" },
        { title: "Lean on Me", artist: "Bill Withers", duration: "4:22" },
    ];

    return (
        <div className="mt-8 w-full glass p-6">
            <h3 className="text-2xl font-script text-white mb-6 flex items-center gap-2">
                <Music className="text-romantic-pink" /> Songs That Remind Me of You
            </h3>
            <div className="space-y-4">
                {songs.map((song, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-xl border-l-4 transition-all",
                            i === 0 ? "border-romantic-pink bg-romantic-pink/10" : "border-transparent"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white">
                                <Play size={16} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">{song.title}</p>
                                <p className="text-gray-400 text-xs">{song.artist}</p>
                            </div>
                        </div>
                        <span className="text-gray-500 text-xs font-mono">{song.duration}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- Heart-shaped mouse cursor ---
const HeartCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] text-romantic-pink mix-blend-screen hidden md:block"
      animate={{
        x: position.x - 12,
        y: position.y - 12,
        scale: isClicking ? 0.8 : 1,
        opacity: [0, 1]
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.5, opacity: { duration: 0.5 } }}
    >
      <Heart fill="currentColor" size={24} className="dreamy-glow" />
    </motion.div>
  );
};

// --- Scene 0: Cinematic opening ---
const CinematicIntro = ({ onComplete }: { onComplete: () => void }) => {
  const texts = [
    "In a world of billions...",
    "Some people make everything better.",
    "Today, the stars celebrate...",
    "The one and only — Aneeza."
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < texts.length) {
      const timer = setTimeout(() => setIndex(index + 1), 3200);
      return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 1000);
    }
  }, [index, onComplete]);

  return (
    <div className="fixed inset-0 bg-[#030014] z-50 flex items-center justify-center p-8 overflow-hidden">
      <StarsBackdrop count={1200} speed={1} className="opacity-40" />
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, filter: 'blur(10px)', scale: 1.1 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.9 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl w-full"
        >
          <p className="text-white text-3xl md:text-6xl font-serif text-center italic tracking-tighter leading-[1.1] font-medium">
            {texts[index]}
          </p>
          <div className="mt-8 mx-auto w-12 h-[1px] bg-white/20" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- Scene 1: Hero — Happy Birthday Aneeza ---
const HeroSection = ({ onNext }: { onNext: () => void }) => {
  const triggerCelebration = () => {
    safeConfetti({
      particleCount: 180,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ff8fab', '#fbbf24', '#ffffff', '#f9a8d4', '#c4b5fd']
    });
  };

  useEffect(() => {
    const timer = setTimeout(triggerCelebration, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 overflow-hidden bg-[#030014]">
      {/* Deep dreamy gradient background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,#2d1b4e_0%,#0a0618_55%,#030014_100%)]" />

      {/* Immersive 3D starfield + floating gem */}
      <div className="absolute inset-0 z-[2] mix-blend-screen opacity-70 pointer-events-none">
        <Canvas key="hero-canvas">
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#ff8fab" />
          <Suspense fallback={null}>
            <group position={[0, 0.5, 0]}>
               <ColorfulFloatingItem3D scale={2.5} color="#ff8fab" speed={0.5} variant={0} />
            </group>
            <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={0.5} />
          </Suspense>
        </Canvas>
      </div>

      {/* Floating birthday balloons */}
      <FloatingBalloons count={10} />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
        {/* Decorative Line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100px' }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="h-[1px] bg-romantic-gold/50 mb-12"
        />

        <div className="text-center bg-black/20 backdrop-blur-sm border border-white/20 rounded-[3rem] p-8 md:p-16 shadow-2xl max-w-5xl w-full mx-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <h1 className="text-[12vw] md:text-[10vw] font-serif font-black leading-[0.8] mb-4 text-white tracking-tighter uppercase whitespace-nowrap">
              Happy <span className="text-romantic-pink italic serif lowercase">Birthday</span>
            </h1>
            <h2 className="text-[14vw] md:text-[12vw] font-serif font-black leading-[0.8] mb-8 text-glow uppercase tracking-tight bg-gradient-to-r from-romantic-gold via-yellow-200 to-romantic-gold bg-clip-text text-transparent">
              Aneeza
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="text-white/70 text-base md:text-xl font-sans tracking-[0.35em] uppercase mb-14 font-light"
          >
            The Universe Conspired To Create You ✨
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            <button
              onClick={onNext}
              className="group relative px-12 py-5 overflow-hidden rounded-full transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,143,171,0.4)]"
            >
              <div className="absolute inset-0 bg-white/10 group-hover:bg-romantic-pink transition-colors duration-500" />
              <div className="relative flex items-center gap-4 text-white font-medium text-base md:text-lg tracking-widest uppercase">
                Begin The Celebration
                <ChevronRight className="group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>
          </motion.div>
        </div>

        {/* Navigation Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 flex flex-col items-center gap-2"
        >
          <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
};

// --- Scene 2: Friendly chat on an iPhone ---
const ChatInterface = ({ onNext }: { onNext: () => void }) => {
  const script = [
    { sender: 'me', text: "Hey… do you know what day it is? 👀" },
    { sender: 'her', text: "What? 😅" },
    { sender: 'me', text: "The day the world's most wonderful girl was born 💖" },
    { sender: 'her', text: "Stopppp 😭😂" },
    { sender: 'me', text: "No seriously… everything got brighter today ✨" },
    { sender: 'me', text: "I have something special for you…" },
  ];

  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [step, setStep] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  // Derived typing indicator: shown while the next message is "being typed"
  const isTyping = step < script.length;

  useEffect(() => {
    if (step < script.length) {
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, script[step]]);
        setStep(step + 1);
      }, 1600);
      return () => clearTimeout(timer);
    }
    const notifTimer = setTimeout(() => {
      // Show notification (falls back to sweet synthetic chime)
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        playSyntheticNotification();
      });
      setShowNotification(true);
    }, 1000);
    return () => clearTimeout(notifTimer);
  }, [step]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#030014]">
      {/* Dreamy gradient background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1e1b4b] via-[#4c1d95]/60 to-[#831843]/60" />
      <StarsBackdrop count={900} speed={0.6} className="opacity-50" />

      {/* iPhone Frame */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-[320px] aspect-[9/19] bg-white/10 backdrop-blur-md rounded-[2.5rem] border-[8px] border-white/20 shadow-2xl relative overflow-hidden flex flex-col z-10"
      >
        <div className="h-10 bg-black/80 backdrop-blur-md flex items-center justify-center border-b border-white/10">
            <div className="h-6 w-24 bg-black/50 rounded-full shadow-inner" /> {/* Speaker/Camera hole */}
        </div>

        <div className="flex-1 bg-white/60 backdrop-blur-lg flex flex-col pt-4 px-3 overflow-y-auto scrollbar-hide pb-20">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-fuchsia-500 shadow-md rounded-full mx-auto mb-1 flex items-center justify-center font-bold text-white">A</div>
            <p className="text-[10px] text-gray-600 font-medium drop-shadow-sm">Aneeza ✨</p>
          </div>

          <div className="space-y-3">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, x: m.sender === 'me' ? 20 : -20 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                className={cn(
                  "max-w-[75%] p-2.5 rounded-2xl text-[13px] leading-tight",
                  m.sender === 'me' ? "bg-[#ff5c8a] text-white self-end ml-auto rounded-br-none" : "bg-[#e5e5ea] text-black self-start rounded-bl-none"
                )}
              >
                {m.text}
              </motion.div>
            ))}
            {isTyping && (
                <div className="bg-[#e5e5ea] p-2.5 rounded-2xl self-start rounded-bl-none flex gap-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                </div>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-6 left-0 right-0 px-3 bg-white/80 backdrop-blur pb-2">
            <div className="h-10 bg-[#f1f1f2] rounded-full flex items-center px-4 gap-2">
                <div className="flex-1 text-gray-400 text-xs">iMessage</div>
                <div className="w-6 h-6 bg-[#ff5c8a] rounded-full flex items-center justify-center">
                    <Send size={12} className="text-white" />
                </div>
            </div>
        </div>
      </motion.div>

      {/* Notification Popup */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[340px] bg-white/90 backdrop-blur border border-white/20 shadow-xl rounded-2xl p-4 flex items-center gap-4 cursor-pointer z-[60]"
            onClick={onNext}
          >
            <div className="bg-romantic-pink p-2 rounded-xl text-white">
                <Gift size={24} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <span className="text-[14px] font-bold text-gray-800">You have 1 new surprise 💝</span>
                    <span className="text-[10px] text-gray-400">now</span>
                </div>
                <p className="text-[12px] text-gray-600 line-clamp-1">Tap to open your birthday gift, bestie!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Scene 3: How the friendship started ---
const StoryChoiceScene = ({ onNext }: { onNext: (choice: string) => void }) => {
    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#030014]">
            {/* Starfield background */}
            <StarsBackdrop count={1100} speed={0.8} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(76,29,149,0.35)_0%,rgba(3,0,20,0.9)_80%)] z-[1] pointer-events-none" />

            <div className="relative z-10 text-center max-w-4xl px-8 bg-black/20 backdrop-blur-sm border border-white/20 p-12 rounded-[3rem] shadow-2xl mx-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                >
                  <span className="text-romantic-gold tracking-[0.5em] uppercase text-[10px] mb-8 block font-medium">Chapter II: The Origin</span>
                  <h2 className="text-white text-5xl md:text-8xl font-serif mb-12 italic leading-tight text-glow">
                    {"\u201C"}It all started with a simple <span className="text-romantic-pink not-italic font-bold uppercase font-sans">Hello</span>{"\u2026\u201D"}
                  </h2>
                </motion.div>

                <p className="text-white/80 text-xl md:text-2xl mb-16 font-serif italic max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                  I still remember the day we met. I had no idea that one little hello would grow into the most beautiful friendship of my life. What should I have done to win your heart, bestie?
                </p>

                <div className="flex flex-col md:flex-row gap-8 justify-center">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNext('smile')}
                        className="group relative px-12 py-6 overflow-hidden rounded-full transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-md group-hover:bg-romantic-pink transition-colors border border-white/20" />
                        <span className="relative text-white font-medium text-lg tracking-widest uppercase drop-shadow-sm">Smile at her 😊</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNext('cool')}
                        className="group relative px-12 py-6 overflow-hidden rounded-full transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-md group-hover:bg-white/20 transition-colors border border-white/10" />
                        <span className="relative text-white font-medium text-lg tracking-widest uppercase drop-shadow-sm">Pretend to be cool 😎</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

// --- Scene 4: Beautiful Wishes Gallery (replaces the old photo memories) ---
const WishesGallery = ({ onNext }: { onNext: () => void }) => {
    const [selectedWish, setSelectedWish] = useState<number | null>(null);

    const openWish = (i: number) => {
        setSelectedWish(i);
        safeConfetti({ particleCount: 70, spread: 75, colors: ['#ff8fab', '#fbbf24', '#ffffff', '#c4b5fd'] });
    };

    return (
        <div className="min-h-screen bg-[#030014] py-32 px-4 relative overflow-hidden">
            <StarsBackdrop count={800} speed={0.5} className="opacity-70" />

            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-romantic-pink/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-[1]" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-romantic-rose/10 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-[1]" />

            <div className="max-w-7xl mx-auto mb-24 relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-[1px] flex-1 bg-white/10" />
                  <span className="text-romantic-gold tracking-[0.5em] uppercase text-xs font-medium">Chapter III</span>
                  <div className="h-[1px] flex-1 bg-white/10" />
                </div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-8xl font-serif text-center text-white italic"
                >
                  Beautiful Wishes <span className="font-sans font-bold not-italic text-white/10">For You</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-white/50 text-lg mt-6 font-serif italic"
                >
                  Six little pieces of my heart, wrapped in stardust 🎁
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-center">
                {BEAUTIFUL_WISHES.map((wish, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.12 }}
                        onClick={() => openWish(i)}
                        whileHover={{ scale: 1.04, rotateZ: i % 2 === 0 ? 1.5 : -1.5 }}
                        className={cn(
                          "relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 hover:border-white/30 transition-colors min-h-[340px] flex flex-col items-center justify-center text-center p-8 shadow-2xl",
                          i === 1 ? "md:scale-110 z-10" : "scale-95"
                        )}
                    >
                        {/* Gradient wash */}
                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-25 group-hover:opacity-40 transition-opacity duration-700", wish.gradient)} />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                        {/* Sparkle decorations */}
                        <div className="absolute top-4 right-6 text-xl opacity-40 group-hover:opacity-90 group-hover:rotate-12 transition-all duration-500">✦</div>
                        <div className="absolute bottom-6 left-6 text-sm opacity-30 group-hover:opacity-70 group-hover:-rotate-12 transition-all duration-500">✦</div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className={cn(
                                "w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center text-4xl mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500",
                                wish.gradient
                            )}>
                                {wish.emoji}
                            </div>
                            <h3 className="font-script text-3xl text-romantic-gold mb-4 drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]">{wish.title}</h3>
                            <p className="text-white/80 font-serif italic text-sm md:text-base leading-relaxed max-w-[280px]">{"\u201C"}{wish.text}{"\u201D"}</p>
                            <div className="mt-8 flex items-center gap-2 text-white/40 group-hover:text-romantic-pink transition-colors duration-500">
                                <span className="text-[10px] uppercase tracking-[0.3em]">Tap to unwrap</span>
                                <ChevronRight size={12} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-32 text-center relative z-10">
                <button
                  onClick={onNext}
                  className="group relative px-12 py-5 overflow-hidden rounded-full transition-all duration-500"
                >
                  <div className="absolute inset-0 border border-white/20 group-hover:bg-white/10 transition-all rounded-full" />
                  <div className="relative flex items-center gap-3 text-white/60 group-hover:text-white font-medium tracking-widest uppercase">
                    Continue Our Journey <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </button>
            </div>

            {/* Fullscreen wish reveal */}
            <AnimatePresence>
                {selectedWish !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 z-[100] backdrop-blur-2xl flex items-center justify-center p-8 overflow-y-auto"
                        onClick={() => setSelectedWish(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                            className="relative max-w-3xl w-full text-center py-10"
                        >
                            <div className={cn(
                                "w-28 h-28 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center text-6xl mb-10 shadow-[0_0_50px_rgba(255,143,171,0.35)]",
                                BEAUTIFUL_WISHES[selectedWish].gradient
                            )}>
                                {BEAUTIFUL_WISHES[selectedWish].emoji}
                            </div>
                            <h3 className="text-white text-4xl md:text-6xl font-script text-glow mb-8">
                                {BEAUTIFUL_WISHES[selectedWish].title}
                            </h3>
                            <p className="text-white/85 text-xl md:text-2xl font-serif italic leading-relaxed max-w-2xl mx-auto">
                                {BEAUTIFUL_WISHES[selectedWish].text}
                            </p>
                            <p className="text-romantic-pink text-2xl font-script mt-10">— with love, Alina 💖</p>
                            <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mt-14">Tap anywhere to close</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Scene 5: A heartfelt birthday letter ---
const LoveLetter = ({ onNext }: { onNext: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const letterText = "My Dearest Aneeza,\n\nHappy Birthday, sunshine! Today the world celebrates the day it got a whole lot brighter — the day you arrived in it.\n\nFrom the moment we became friends, every day turned into an adventure. You have this magical way of making ordinary moments feel like celebrations. Your laughter is my favorite sound, and your friendship is one of the greatest gifts of my life.\n\nThank you for being the kind, brilliant, and wonderfully-you person you are. Thank you for the late-night talks, the laughing fits that hurt our stomachs, and for always showing up with the best advice (and the best snacks).\n\nToday is all about celebrating YOU — but honestly, I celebrate our friendship every single day. Here's to more giggles, more dreams, and a lifetime of beautiful memories together.\n\nHappy Birthday, bestie. Here's to your brightest year yet!\n\nWith all my love,\nYour Alina ✨";

    const [displayText, setDisplayText] = useState("");

    useEffect(() => {
        if (isOpen && displayText.length < letterText.length) {
            const timer = setTimeout(() => {
                setDisplayText(letterText.slice(0, displayText.length + 1));
            }, 22);
            return () => clearTimeout(timer);
        }
    }, [isOpen, displayText]);

    return (
        <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Warm glowing background */}
            <StarsBackdrop count={700} speed={0.4} className="opacity-60" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-romantic-gold/20 rounded-full blur-[100px] animate-pulse z-[1] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-romantic-pink/15 rounded-full blur-[100px] z-[1] pointer-events-none" />

            {!isOpen ? (
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(true)}
                    className="relative group cursor-pointer z-10"
                >
                    <div className="absolute inset-0 bg-romantic-pink blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-full max-w-sm aspect-[4/3] bg-white/10 backdrop-blur-md shadow-2xl p-12 flex flex-col items-center justify-center border border-white/20 rounded-2xl">
                      <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg transform -translate-y-8">
                        <Heart className="text-white" fill="currentColor" />
                      </div>
                      <p className="text-white/80 font-serif lowercase italic tracking-widest text-sm drop-shadow-sm">Strictly for your eyes only</p>
                      <h3 className="text-white font-serif text-2xl mt-4 drop-shadow-md">Aneeza</h3>
                      <div className="mt-8 flex items-center gap-2 text-white/60 group-hover:text-romantic-pink transition-colors">
                        <span className="text-[10px] uppercase tracking-widest drop-shadow-sm">Open With Joy</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                </motion.div>
            ) : (
                <div className="max-w-4xl w-full py-20 px-8 relative z-10 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 text-white/5 font-serif text-[10vw] leading-none pointer-events-none uppercase italic">Besties</div>

                   <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-12 opacity-60">
                         <div className="h-[1px] w-8 bg-white" />
                         <span className="text-[10px] uppercase tracking-[0.4em] text-white">A Letter From Alina</span>
                      </div>

                      <div className="whitespace-pre-wrap font-serif text-xl md:text-3xl leading-relaxed text-white/95 italic tracking-tight drop-shadow-md">
                        {displayText}
                      </div>

                      {displayText.length === letterText.length && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-20 pt-12 border-t border-white/10 flex justify-between items-center">
                              <p className="text-white/60 font-sans text-xs tracking-widest uppercase">END OF CHAPTER IV</p>
                              <button
                                onClick={onNext}
                                className="group flex items-center gap-3 text-romantic-pink font-serif text-2xl italic transition-all hover:gap-6 drop-shadow-md"
                              >
                                  See what's next... <ChevronRight />
                              </button>
                          </motion.div>
                      )}
                   </div>
                </div>
            )}
        </div>
    );
};


// --- Scene 6: Friendship games ---
const GamesSection = ({ onNext }: { onNext: () => void }) => {
    const [activeGame, setActiveGame] = useState<'intro' | 'heart' | 'quiz'>('intro');
    const [score, setScore] = useState(0);
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);

  const startHeartGame = () => {
        setActiveGame('heart');
        setScore(0);
    };

    const handleScore = (points: number) => {
        setScore(s => s + points);
    };

    useEffect(() => {
        if (score === 10 && activeGame === 'heart') {
            safeConfetti({ particleCount: 50, colors: ['#ff8fab'] });
        }
    }, [score, activeGame]);

    return (
        <div className="min-h-screen bg-romantic-lavender flex items-center justify-center p-4 relative overflow-hidden">
            {/* Starfield background */}
            <StarsBackdrop count={1000} speed={0.7} />
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/30 via-purple-900/40 to-rose-900/30 z-[1] pointer-events-none" />

            <div className="w-full max-w-4xl glass !bg-black/20 backdrop-blur-sm border border-white/20 p-8 md:p-16 min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden rounded-[3rem] shadow-2xl z-10 text-white mx-4">

                {activeGame === 'intro' && (
                    <div className="text-center">
                        <Award size={64} className="text-romantic-pink mx-auto mb-6 drop-shadow-md" />
                        <h2 className="text-4xl font-serif text-white mb-4 drop-shadow-md">Are you truly the Bestie Queen?</h2>
                        <p className="text-white/80 mb-8 text-lg drop-shadow-sm">Prove your skills in these friendship challenges, Aneeza!</p>
                        <button
                            onClick={startHeartGame}
                            className="px-10 py-4 bg-white/20 hover:bg-romantic-pink backdrop-blur-md text-white border border-white/30 rounded-full font-bold shadow-lg transition-colors"
                        >
                            Start Challenge
                        </button>
                    </div>
                )}

                {activeGame === 'heart' && (
                    <div className="w-full h-full relative">
                        <div className="absolute top-4 right-4 z-20 text-2xl font-bold text-white bg-white/20 border border-white/20 px-4 py-1 rounded-full backdrop-blur shadow-md">
                            Friendship Meter: {Math.min(Math.max(score * 10, 0), 100)}%
                        </div>
                        <p className="text-center text-white/80 drop-shadow-sm mb-4 italic">Catch the falling hearts!</p>
                        <TwoDHeartCatch
                            onScore={handleScore}
                            onComplete={() => setActiveGame('quiz')}
                        />
                    </div>
                )}

                {activeGame === 'quiz' && !quizCompleted && (
                    <div className="w-full max-w-lg">
                        <div className="mb-8">
                            <div className="flex justify-between mb-2">
                                <span className="text-white/80 drop-shadow-sm">Question {quizIndex + 1} of 5</span>
                                <span className="text-romantic-pink font-bold drop-shadow-sm">{Math.round((quizIndex / 5) * 100)}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/20 rounded-full">
                                <motion.div className="h-full bg-romantic-pink rounded-full shadow-[0_0_10px_#ff8fab]" animate={{ width: (quizIndex / 5) * 100 + "%" }} />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-6 text-white drop-shadow-md">{QUIZ_QUESTIONS[quizIndex].question}</h3>
                        <div className="grid gap-4">
                            {QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (i === QUIZ_QUESTIONS[quizIndex].answer) {
                                            safeConfetti({ particleCount: 30, spread: 60 });
                                            if (quizIndex < 4) setQuizIndex(quizIndex + 1);
                                            else setQuizCompleted(true);
                                        } else {
                                            alert("Oops! Try again, bestie 😉");
                                        }
                                    }}
                                    className="p-4 bg-white/10 glass text-left hover:bg-white/20 transition-all font-medium text-white shadow-sm drop-shadow-sm border border-white/10 rounded-xl"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {quizCompleted && (
                    <div className="text-center">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="text-romantic-gold inline-block mb-6 drop-shadow-md">
                            <Award size={80} />
                        </motion.div>
                        <h2 className="text-5xl font-script text-white mb-2 drop-shadow-md text-glow">Certified Bestie Queen 👑✨</h2>
                        <p className="text-white/80 mb-8 text-lg drop-shadow-sm">You know our story better than anyone, Aneeza.</p>
                        <button
                            onClick={onNext}
                            className="px-10 py-4 bg-romantic-gold hover:bg-yellow-500 transition-colors text-white rounded-full font-bold shadow-[0_0_20px_rgba(234,179,8,0.4)] border border-white/20"
                        >
                            Final Question...
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Scene 7: The forever question ---
const FinaleScene = ({ onNext }: { onNext: () => void }) => {
    const [response, setResponse] = useState<string | null>(null);

    useEffect(() => {
        if (response) {
            safeConfetti({
                particleCount: 300,
                spread: 130,
                origin: { y: 0.6 },
                colors: ['#ff8fab', '#fbbf24', '#ffffff', '#f9a8d4', '#c4b5fd']
            });
            setTimeout(onNext, 7000);
        }
    }, [response, onNext]);

    return (
        <div className="min-h-screen bg-[#030014] flex items-center justify-center p-8 relative overflow-hidden">
            {/* Starfield background */}
            <div className="absolute inset-0 z-0 mix-blend-screen opacity-60 pointer-events-none">
               <Canvas key="finale-canvas">
                  <Stars radius={100} depth={50} count={1200} factor={4} saturation={0} fade speed={2} />
               </Canvas>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)] z-0" />
            <FloatingBalloons count={6} />

            <div className="relative z-10 text-center max-w-4xl bg-black/20 backdrop-blur-sm border border-white/20 p-12 md:p-20 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] mx-4 w-full">
              {!response ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5 }}
                >
                  <span className="text-romantic-gold tracking-[0.6em] uppercase text-[12px] mb-8 block font-medium drop-shadow-md text-glow">The Final Chapter</span>
                  <h2 className="text-white text-5xl md:text-7xl font-serif mb-12 italic leading-[1.1] drop-shadow-lg text-glow">
                    Will you be my best friend <br />
                    <span className="text-romantic-pink not-italic font-bold uppercase font-sans drop-shadow-[0_0_20px_rgba(255,143,171,0.8)]">Forever?</span>
                  </h2>
                  <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
                     <button
                       onClick={() => setResponse('yes')}
                       className="group relative px-16 py-6 overflow-hidden rounded-full transition-all duration-500 hover:scale-105 shadow-[0_0_30px_rgba(255,143,171,0.4)]"
                     >
                        <div className="absolute inset-0 bg-romantic-pink transition-colors group-hover:brightness-110" />
                        <span className="relative text-white font-bold text-xl tracking-widest uppercase drop-shadow-sm">YES, ALWAYS</span>
                     </button>
                     <button
                       onClick={() => alert("Hmm… are you sure? Try again, I'm waiting for a different answer 😉")}
                       className="px-12 py-6 border border-white/20 bg-white/5 backdrop-blur-md rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all tracking-widest uppercase text-sm drop-shadow-sm"
                     >
                        Maybe...
                     </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <Heart size={120} className="text-romantic-pink mx-auto mb-12 animate-pulse" fill="currentColor" />
                  <h2 className="text-white text-6xl md:text-8xl font-script text-glow mb-8 tracking-tighter">My Brilliant Aneeza</h2>
                  <p className="text-romantic-gold text-xl md:text-2xl font-serif italic tracking-widest uppercase opacity-70">Happy Birthday, Aneeza. I'm so lucky to know you.</p>
                </motion.div>
              )}
            </div>
        </div>
    );
};

// --- Scene 8: Movie-style credits ---
const MovieCredits = ({ onComplete }: { onComplete: () => void }) => {
    return (
        <div className="min-h-screen bg-black overflow-hidden flex items-center justify-center py-20 px-4 relative">
            <ColorfulBlobs />
            <motion.div
                initial={{ y: "100vh" }}
                animate={{ y: "-100%" }}
                transition={{ duration: 20, ease: "linear" }}
                className="text-center space-y-12 max-w-xl"
                onAnimationComplete={onComplete}
            >
                <div className="space-y-4">
                    <p className="text-gray-500 uppercase tracking-widest text-xs">Directed by</p>
                    <h3 className="text-white text-3xl font-serif">Your Best Friend — Alina</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-gray-500 uppercase tracking-widest text-xs">Starring</p>
                    <h3 className="text-white text-3xl font-serif">Aneeza — The Birthday Star 🌟</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-gray-500 uppercase tracking-widest text-xs">Produced by</p>
                    <h3 className="text-white text-3xl font-serif">Fate & Serendipity</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-gray-500 uppercase tracking-widest text-xs">Release Date</p>
                    <h3 className="text-white text-3xl font-serif">The Day The World Got Brighter</h3>
                </div>
                <div className="space-y-4 pt-40">
                    <Heart className="text-romantic-pink mx-auto" size={48} fill="currentColor" />
                    <p className="text-white text-xl italic font-serif">{"\u201C"}I'm the luckiest person alive because I get to call you my friend.{"\u201D"}</p>
                    <p className="text-romantic-pink text-3xl font-script">– Forever Your Bestie, Alina ✨</p>
                </div>
            </motion.div>
        </div>
    );
};

const ProgressBar = ({ current, total }: { current: number, total: number }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-[80] bg-white/5 backdrop-blur-sm">
      <motion.div
        className="h-full bg-gradient-to-r from-pink-500 via-romantic-gold to-fuchsia-500 shadow-[0_0_15px_rgba(255,143,171,0.6)]"
        initial={{ width: 0 }}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ type: 'spring', damping: 20, stiffness: 50 }}
      />
    </div>
  );
};

// --- Scene 9: 100 reasons I appreciate you ---
const ReasonsGallery = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="min-h-screen py-20 px-4 relative overflow-y-auto scrollbar-hide bg-[#030014]">
            {/* Starfield background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-70">
                <Canvas key="reasons-canvas">
                    <Stars radius={100} depth={50} count={900} factor={4} saturation={0} fade speed={0.4} />
                </Canvas>
            </div>

            <div className="max-w-7xl mx-auto text-center mb-20 relative z-10 bg-black/20 backdrop-blur-sm border border-white/20 p-12 rounded-[3rem] shadow-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                >
                    <span className="text-romantic-gold tracking-[0.6em] uppercase text-[10px] mb-4 block font-medium drop-shadow-md text-glow">Chapter V: The Infinite List</span>
                    <h2 className="text-5xl md:text-8xl font-serif text-white italic mb-12 drop-shadow-lg text-glow">
                        100 Reasons <br />
                        <span className="text-romantic-pink font-sans font-bold not-italic drop-shadow-[0_0_20px_rgba(255,143,171,0.8)]">I Appreciate You</span>
                    </h2>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {REASONS_I_LOVE_YOU.map((reason, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (i % 10) * 0.05 }}
                        whileHover={{ scale: 1.05, rotateZ: Math.random() * 4 - 2 }}
                        className="group relative p-8 glass !bg-black/20 backdrop-blur-sm flex flex-col items-center text-center overflow-hidden border border-white/20 hover:border-white/40 hover:bg-black/50 transition-all duration-500 h-full rounded-[2rem] shadow-2xl"
                    >
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-700",
                            GRADIENT_PALETTE[i % GRADIENT_PALETTE.length]
                        )} />

                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white text-sm font-bold shadow-xl shrink-0 rotate-3 group-hover:rotate-12 transition-transform duration-500 bg-gradient-to-br",
                            GRADIENT_PALETTE[i % GRADIENT_PALETTE.length]
                        )}>
                            {i + 1}
                        </div>

                        <p className="text-white/80 font-serif italic text-lg md:text-xl leading-relaxed group-hover:text-white transition-colors">
                            "{reason}"
                        </p>

                        <div className="mt-8 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                             <Heart className="text-romantic-pink" fill="currentColor" size={20} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-40 mb-20 text-center relative z-10">
                <button
                  onClick={onNext}
                  className="group relative px-16 py-6 overflow-hidden rounded-full transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,215,0,0.4)]"
                >
                    <div className="absolute inset-0 bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all rounded-full" />
                    <div className="relative flex items-center gap-4 text-white font-medium tracking-widest uppercase">
                        The Final Word
                        <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                    </div>
                </button>
            </div>
        </div>
    );
};

// --- Scene 10: Sweet goodbye + songs ---
const OutroMessage = () => (
    <div className="min-h-screen flex flex-col items-center justify-center py-16 p-8 bg-[#030014] relative">
        <div className="absolute inset-0">
             <Canvas key="outro-canvas">
                <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
             </Canvas>
        </div>

        {/* Colorful glows */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-romantic-pink/10 rounded-full blur-[120px]" />
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[40px] p-12 text-center shadow-2xl"
            >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-romantic-pink rounded-3xl rotate-12 flex items-center justify-center shadow-xl">
                     <Smartphone className="text-white" size={32} />
                </div>

                <p className="text-romantic-gold tracking-[0.5em] uppercase text-[10px] mb-8 font-medium">Notification Received</p>

                <div className="space-y-6 text-white/80 font-serif text-xl italic mb-12">
                    <p>{"\u201C"}Still grateful for her.{"\u201D"}</p>
                    <p>{"\u201C"}Still laughing with her.{"\u201D"}</p>
                    <p>{"\u201C"}Still my favorite hello.{"\u201D"}</p>
                </div>

                <div className="h-[1px] w-full bg-white/10 mb-8" />

                <h3 className="text-white text-3xl font-serif italic mb-12 animate-pulse">See you in our next adventure, Aneeza.</h3>

                <button
                  onClick={() => safeConfetti({ particleCount: 500, spread: 200, origin: { y: 0.7 } })}
                  className="bg-romantic-pink text-white px-12 py-5 rounded-full font-bold tracking-widest uppercase text-sm hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,143,171,0.4)]"
                >
                  💖 For You
                </button>
            </motion.div>

            <div className="w-full max-w-lg mt-12">
                <MusicPlayer />
            </div>
        </div>
    </div>
);

// --- Ambient floating dust particles (client-only randoms) ---
const FloatingDust = () => {
    const mounted = useMounted();
    const dust = useMemo(() =>
        mounted ? [...Array(10)].map(() => ({
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: Math.random() * 100,
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 5,
            xJitter: (Math.random() - 0.5) * 200,
        })) : [], [mounted]);

    return (
      <div className="fixed inset-0 pointer-events-none z-[100]">
          {dust.map((d, i) => (
              <motion.div
                key={i}
                className="absolute bg-white/30 rounded-full"
                animate={{
                    y: [-10, -500],
                    x: [0, d.xJitter],
                    opacity: [0, 1, 0]
                }}
                transition={{
                    duration: d.duration,
                    repeat: Infinity,
                    delay: d.delay
                }}
                style={{
                    width: d.width,
                    height: d.height,
                    left: `${d.left}%`,
                    bottom: "-20px"
                }}
              />
          ))}
      </div>
    );
};

// --- Main App: scene flow controller ---
export default function App() {
  const [scene, setScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playRealMusic = () => {
    const el = audioRef.current;
    if (!el) { ambientBackgroundSynth.start(); return; }
    el.volume = 0.55;
    el.play().catch(() => {
      // Fallback to procedural ambience if playback is blocked
      ambientBackgroundSynth.start();
    });
  };

  const stopRealMusic = () => {
    const el = audioRef.current;
    if (el) {
      el.pause();
    }
    ambientBackgroundSynth.stop();
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);

    // Mute ResizeObserver errors, third-party script errors, and common iframe resize warnings safely
    const errorHandler = (e: ErrorEvent) => {
      const msg = e && e.message;
      if (typeof msg === 'string') {
        const lowerMsg = msg.toLowerCase();
        if (
          lowerMsg.includes('resizeobserver') ||
          lowerMsg.includes('getboundingclientrect') ||
          lowerMsg.includes('script error')
        ) {
          if (e.preventDefault) e.preventDefault();
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          return true;
        }
      }
      return false;
    };
    window.addEventListener('error', errorHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      stopRealMusic();
    };
  }, []);

  const toggleMusic = () => {
    if (isPlaying) {
      stopRealMusic();
      setIsPlaying(false);
    } else {
      playRealMusic();
      setIsPlaying(true);
    }
  };

  const nextScene = () => setScene(prev => prev + 1);

  const musicElement = <audio ref={audioRef} src="/music.mp3" loop preload="auto" />;

  if (loading || !started) {
      return (
          <div className="fixed inset-0 bg-[#030014] z-[100] flex flex-col items-center justify-center overflow-hidden cursor-none">
               {musicElement}
               <ColorfulBlobs />
               <div className="relative z-10 text-center">
                   <motion.div
                     animate={{
                       scale: [1, 1.2, 1],
                       rotate: [0, 10, -10, 0],
                     }}
                     transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                     className="text-romantic-pink mb-8 inline-block"
                   >
                       <Heart size={80} fill="currentColor" className="drop-shadow-[0_0_30px_rgba(255,143,171,0.6)]" />
                   </motion.div>

                   {loading ? (
                     <>
                       <p className="text-white text-2xl font-serif italic tracking-[0.3em] mb-2 animate-pulse">Aneeza's Universe</p>
                       <p className="text-romantic-gold/60 text-xs tracking-[0.5em] uppercase">Wrapping your gifts...</p>
                     </>
                   ) : (
                     <motion.button
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       onClick={() => {
                         setStarted(true);
                         setIsPlaying(true);
                         playRealMusic();
                       }}
                       className="px-12 py-5 bg-white/10 hover:bg-romantic-pink border border-white/20 transition-all rounded-full text-white font-bold tracking-[0.3em] uppercase text-sm group"
                     >
                       <span className="flex items-center gap-4">
                         Press Start To Begin
                         <Play size={18} className="group-hover:translate-x-1 transition-transform" />
                       </span>
                     </motion.button>
                   )}
               </div>
          </div>
      )
  }

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden cursor-none">
      {musicElement}
      <div className="noise" />
      <HeartCursor />
      <ProgressBar current={scene} total={10} />

      <ColorfulBlobs />

      <div className="fixed top-8 right-8 z-[70] flex items-center gap-4">
          <button
            onClick={toggleMusic}
            className="w-14 h-14 glass flex items-center justify-center text-white/40 hover:text-romantic-pink transition-all duration-500 hover:shadow-[0_0_20px_rgba(255,143,171,0.2)] rounded-full"
          >
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div key="playing" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Music size={24} className="animate-pulse" />
                  </motion.div>
                ) : (
                  <motion.div key="muted" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <VolumeX size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
          </button>
      </div>

      {scene === 0 && <CinematicIntro onComplete={nextScene} />}
      {scene === 1 && <HeroSection onNext={nextScene} />}
      {scene === 2 && <ChatInterface onNext={nextScene} />}
      {scene === 3 && <StoryChoiceScene onNext={() => nextScene()} />}
      {scene === 4 && <WishesGallery onNext={nextScene} />}
      {scene === 5 && <LoveLetter onNext={nextScene} />}
      {scene === 6 && <GamesSection onNext={nextScene} />}
      {scene === 7 && <FinaleScene onNext={nextScene} />}
      {scene === 8 && <MovieCredits onComplete={nextScene} />}
      {scene === 9 && <ReasonsGallery onNext={nextScene} />}
      {scene === 10 && <OutroMessage />}

      {/* Extra Interactive Love Button */}
      {scene > 0 && scene < 9 && (
          <motion.button
            whileHover={{ scale: 1.2, rotate: 15 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => {
                safeConfetti({
                    particleCount: 40,
                    spread: 60,
                    origin: { y: 0.8 },
                    shapes: ['circle'],
                    colors: ['#ff8fab', '#f9a8d4']
                });
            }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-romantic-pink text-white rounded-full flex items-center justify-center shadow-lg"
          >
              <Heart size={28} fill="currentColor" />
          </motion.button>
      )}

      {/* Floating Particles Overlay */}
      <FloatingDust />
    </div>
  );
}
