'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { features } from '@/data/features';

interface Feature3DCarouselProps {
  className?: string;
}

const Feature3DCarousel: React.FC<Feature3DCarouselProps> = ({ className = '' }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragAngle, setDragAngle] = useState(0);

  const totalCards = features.length;
  const theta = 360 / totalCards; // 51.428 degrees per card

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const rotateCarousel = (direction: number) => {
      const newAngle = currentAngle + direction * theta;
      setCurrentAngle(newAngle);
      carousel.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      carousel.style.transform = `rotateY(${newAngle}deg)`;
    };

    const startDrag = (e: MouseEvent | TouchEvent) => {
      setIsDragging(true);
      const x = 'touches' in e ? e.touches[0].pageX : e.pageX;
      setStartX(x);
      setDragAngle(currentAngle);
      
      // Remove smooth transition so roll instantly follows mouse
      carousel.style.transition = 'none';
    };

    const onDrag = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      
      const currentX = 'touches' in e ? e.touches[0].pageX : e.pageX;
      const distance = currentX - startX;
      
      // 0.3 is a sensitivity multiplier for smoother rotation
      const newDragAngle = currentAngle + (distance * 0.3);
      setDragAngle(newDragAngle);
      
      carousel.style.transform = `rotateY(${newDragAngle}deg)`;
    };

    const stopDrag = () => {
      if (!isDragging) return;
      setIsDragging(false);
      
      // Snap logic: round drag angle to nearest multiple of 'theta'
      const snappedAngle = Math.round(dragAngle / theta) * theta;
      setCurrentAngle(snappedAngle);
      
      // Put smooth transition back on so it glides into place
      carousel.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      carousel.style.transform = `rotateY(${snappedAngle}deg)`;
    };

    // Mouse Event Listeners
    carousel.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);

    // Touch Event Listeners (for mobile phones)
    carousel.addEventListener('touchstart', startDrag);
    window.addEventListener('touchmove', onDrag);
    window.addEventListener('touchend', stopDrag);

    return () => {
      carousel.removeEventListener('mousedown', startDrag);
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
      carousel.removeEventListener('touchstart', startDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('touchend', stopDrag);
    };
  }, [currentAngle, isDragging, startX, dragAngle, theta]);

  const handlePrev = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    
    const newAngle = currentAngle + theta;
    setCurrentAngle(newAngle);
    carousel.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    carousel.style.transform = `rotateY(${newAngle}deg)`;
  };

  const handleNext = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    
    const newAngle = currentAngle - theta;
    setCurrentAngle(newAngle);
    carousel.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    carousel.style.transform = `rotateY(${newAngle}deg)`;
  };

  return (
    <div className={`flex items-center justify-center gap-80 relative pt-16 ${className}`}>
      {/* Left Arrow Control */}
      <button
        onClick={handlePrev}
        className="w-12 h-12 flex items-center justify-center text-cyan-400 border-2 border-cyan-400 rounded-full bg-transparent hover:bg-cyan-400 hover:text-black transition-all duration-200 cursor-pointer z-10 flex-shrink-0"
        aria-label="Previous"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 3D Carousel Scene */}
      <div className="relative w-[300px] h-[400px] perspective-[1200px]">
        <div
          ref={carouselRef}
          className="absolute w-full h-full transition-transform duration-500 ease-out cursor-grab active:cursor-grabbing"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${currentAngle}deg)`,
          }}
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const angle = index * theta;
            
            return (
              <div
                key={index}
                className="absolute w-[280px] h-[380px] left-[10px] top-[10px] rounded-2xl flex flex-col items-center justify-center p-6 select-none overflow-hidden"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(350px)`,
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Rotating multi-color border */}
                <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue animate-rotate-border">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-blue via-neon-green to-neon-pink animate-rotate-border-reverse">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-yellow via-neon-orange to-neon-purple animate-rotate-border">
                      <div className="absolute inset-[2px] rounded-2xl bg-gradient-to-br from-black via-gray-900 to-black" />
                    </div>
                  </div>
                </div>
                
                {/* Sharp rotating border overlay */}
                <div className="absolute inset-0 rounded-2xl border-2 border-neon-cyan animate-rotate-sharp" style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                  boxShadow: '0 0 20px rgba(0, 245, 255, 0.8), inset 0 0 20px rgba(0, 245, 255, 0.4)'
                }} />
                
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-indigo-900/80 to-black animate-gradient-shift" />
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/30 via-transparent to-cyan-500/30" />
                
                {/* Content */}
                <motion.div 
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-pink/30 to-neon-purple/30 flex items-center justify-center mb-6 relative z-10"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    animate={{
                      y: [0, -8, 0, -4, 0],
                      rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      times: [0, 0.2, 0.5, 0.8, 1],
                    }}
                  >
                    <IconComponent className="w-8 h-8 text-neon-cyan" />
                  </motion.div>
                </motion.div>
                
                <h3 className="text-xl font-bold text-white mb-4 text-center relative z-10">{feature.title}</h3>
                <p className="text-sm text-gray-200 text-center leading-relaxed relative z-10">{feature.description}</p>
                
                {/* Animated glow effect */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-pink/30 via-neon-purple/30 to-neon-blue/30 blur-xl -z-10"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Floating particles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-neon-cyan rounded-full"
                    style={{
                      top: `${20 + i * 30}%`,
                      left: `${10 + i * 15}%`,
                    }}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 2 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Arrow Control */}
      <button
        onClick={handleNext}
        className="w-12 h-12 flex items-center justify-center text-cyan-400 border-2 border-cyan-400 rounded-full bg-transparent hover:bg-cyan-400 hover:text-black transition-all duration-200 cursor-pointer z-10 flex-shrink-0"
        aria-label="Next"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Feature3DCarousel;
