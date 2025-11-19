"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  // Framer motion hooks alleen voor desktop
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-background font-sans py-16 md:py-12 lg:py-16"
      ref={containerRef}
    >
      <div className="container-wide px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-0">
          <div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Wie zijn wij?
            </h2>
            <p className="text-base md:text-lg max-w-3xl" style={{ color: 'var(--color-text-secondary)' }}>
              Ons verhaal, passie en expertise in de automotive branche.
            </p>
          </div>
          <div className="lg:order-last pb-8 lg:pb-0">
            <img
              src="/two-men-image.jpg"
              alt="Kees Kraakman en Stefan van der Waals"
              className="w-full h-auto rounded-lg shadow-lg object-cover"
              style={{ maxHeight: '400px', objectPosition: 'center' }}
            />
          </div>
        </div>
      </div>

      {/* MOBILE VERSIE - Full Width Content Stack */}
      <div className="lg:hidden container-wide px-4 md:px-8 lg:px-16">
        <div className="space-y-8">
          {data.map((item, index) => (
            <div key={index} className="space-y-6">
              <h3 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {item.title}
              </h3>
              <div>
                {item.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP VERSIE - Full Timeline with Animations */}
      <div className="hidden lg:block">
        <div ref={ref} className="relative container-wide px-4 md:px-8 lg:px-16">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex justify-start pt-2 md:pt-32 md:gap-10"
            >
              <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
                <h3 className="hidden md:block text-3xl font-bold md:pl-20 px-2" style={{ color: 'var(--color-primary)' }}>
                  {item.title}
                </h3>
              </div>

              <div className="relative pl-20 pr-4 md:pl-4 w-full">
                <h3 className="md:hidden block text-2xl font-bold mb-4 text-left" style={{ color: 'var(--color-primary)' }}>
                  {item.title}
                </h3>
                <div className="px-2">
                  {item.content}{" "}
                </div>
              </div>
            </div>
          ))}
          <div
            style={{
              height: height + "px",
            }}
            className="absolute left-8 md:left-12 lg:left-20 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-muted to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
          >
            <motion.div
              style={{
                height: heightTransform,
                opacity: opacityTransform,
              }}
              className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-primary via-primary/80 to-transparent from-[0%] via-[10%] rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};