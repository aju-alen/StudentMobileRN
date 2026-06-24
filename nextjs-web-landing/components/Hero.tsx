'use client';

import { useEffect, useRef } from 'react';
import {
  LampDesk,
  BookOpen,
  GraduationCap,
  Presentation,
  Video,
} from 'lucide-react';
import { APP_DOWNLOAD_QR, S3_BASE } from '@/lib/constants';

const FloatingElement = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    let position = Math.random() * 100;
    const speed = 0.3 + Math.random() * 0.5;
    let direction = Math.random() > 0.5 ? 1 : -1;

    const animate = () => {
      position += speed * direction;
      if (position > 100) {
        direction = -1;
        position = 100;
      } else if (position < 0) {
        direction = 1;
        position = 0;
      }
      void element;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div
      ref={elementRef}
      className={`absolute transition-transform duration-1000 ${className}`}
    >
      {children}
    </div>
  );
};

export default function Hero() {
  return (
    <section
      id="home"
      className="home-section !py-0 pb-10 sm:pb-16 md:pb-20 relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white h-full"
    >
      <div className="home-section-inner relative z-10 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-0 lg:min-h-[760px] xl:min-h-[800px]">
          <div className="order-2 lg:order-1 text-left flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[600] mb-3 lg:mb-2 lg:leading-tight mt-0 lg:mt-36 font-sans">
              Find expert online tutors across the UAE
            </h1>
            <p className="text-lg sm:text-[1.3rem] text-gray-600 mb-6 sm:mb-8 lg:leading-8">
              Connect with qualified tutors for IGCSE, IB, A-Level, American,
              CBSE, and more. Compare tutor profiles, book lessons, and learn
              online.
            </p>
            <div className="mb-6 sm:mb-8">
              <div className="flex w-full flex-row items-center justify-between gap-4 rounded-2xl bg-[#205072] px-4 py-4 shadow-xl sm:px-6 sm:py-5 lg:inline-flex lg:w-auto lg:justify-start lg:gap-6">
                <div className="flex flex-col justify-center gap-1 min-w-0 flex-1 sm:pr-2">
                  <span className="text-base sm:text-lg lg:text-xl font-semibold text-white">
                    Get the app
                  </span>
                  <span className="text-xs sm:text-sm text-white/85 leading-snug">
                    Scan to download on iOS or Android
                  </span>
                </div>
                <div className="rounded-xl border border-white/30 bg-white p-2 sm:p-3 shadow-md shrink-0">
                  <img
                    src={APP_DOWNLOAD_QR}
                    alt="Scan to download app"
                    className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative h-[300px] sm:h-[360px] md:h-[420px] lg:h-full lg:min-h-[760px] xl:min-h-[800px] max-lg:mt-6 max-lg:overflow-visible -mx-2 sm:mx-0">
            <div className="absolute inset-0 flex items-start justify-center pt-8 sm:pt-10 md:pt-12 lg:pt-16 xl:pt-20 px-2 sm:px-0">
              <img
                src={`${S3_BASE}/hero-screenshot-left.png`}
                alt="CoachAcadem app screenshot"
                className="w-full h-full max-h-full object-contain object-top lg:object-top"
              />
            </div>

            <FloatingElement className="hidden lg:block top-20 -left-8">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <BookOpen size={32} className="text-indigo-600" />
              </div>
            </FloatingElement>

            <FloatingElement className="hidden lg:block top-40 -right-4">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <LampDesk size={32} className="text-yellow-500" />
              </div>
            </FloatingElement>

            <FloatingElement className="hidden lg:block bottom-32 -left-12">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <GraduationCap size={32} className="text-green-500" />
              </div>
            </FloatingElement>

            <FloatingElement className="hidden lg:block top-1/4 right-1/4">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <Presentation size={32} className="text-blue-500" />
              </div>
            </FloatingElement>

            <FloatingElement className="hidden lg:block bottom-1/4 -right-8">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <Video size={32} className="text-purple-500" />
              </div>
            </FloatingElement>

            <div className="absolute -top-10 -right-10 w-40 h-40 sm:w-64 sm:h-64 bg-indigo-100 rounded-full blur-3xl opacity-20 lg:opacity-30" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 sm:w-64 sm:h-64 bg-blue-100 rounded-full blur-3xl opacity-20 lg:opacity-30" />
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-indigo-50/60 to-white/10 -z-10" />
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-blue-100/30 to-transparent rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-t from-indigo-100/30 to-transparent rounded-full blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/3" />
    </section>
  );
}
