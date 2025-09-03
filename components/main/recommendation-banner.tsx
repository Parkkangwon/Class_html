'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export interface BannerItem {
  id: number;
  title: string;
  imageUrl: string;
  link: string;
  backgroundColor?: string;
}

interface RecommendationBannerProps {
  banners: BannerItem[];
  autoPlay?: boolean;
  interval?: number;
}

export function RecommendationBanner({ 
  banners, 
  autoPlay = true, 
  interval = 4000 
}: RecommendationBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 자동 재생
  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const timer = setInterval(() => {
      if (!isHovered) {
        goToNext();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isHovered, autoPlay, interval, banners.length]);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? banners.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === banners.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  if (banners.length === 0) return null;

  return (
    <div 
      className="relative w-full h-64 md:h-80 overflow-hidden rounded-lg shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 배너 이미지 */}
      <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: banners[currentIndex].backgroundColor || '#f3f4f6' }}>
        <a 
          href={banners[currentIndex].link} 
          className="block w-full h-full relative"
          aria-label={banners[currentIndex].title}
        >
          <div className="relative w-full h-full">
            <Image
              src={banners[currentIndex].imageUrl}
              alt={banners[currentIndex].title}
              fill
              priority
              sizes="100vw"
              className="object-cover transition-opacity duration-500 ease-in-out"
              style={{ objectFit: 'cover' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl md:text-3xl font-bold text-white px-4 py-2 rounded-md bg-black/60 backdrop-blur-sm text-center">
                {banners[currentIndex].title}
              </span>
            </div>
          </div>
        </a>
      </div>

      {/* 네비게이션 화살표 */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
            aria-label="이전 배너"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
            aria-label="다음 배너"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* 인디케이터 */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {banners.map((_, slideIndex) => (
            <button
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentIndex === slideIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
              }`}
              aria-label={`배너 ${slideIndex + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
