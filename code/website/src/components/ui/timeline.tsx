import React, { useEffect, useRef, useState, useCallback } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data, sectionTitle, sectionSubtitle, logos }: { data: TimelineEntry[]; sectionTitle?: string; sectionSubtitle?: string; logos?: { src: string; alt: string }[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Start when top of container hits 10% from top of viewport
    const startOffset = windowHeight * 0.1;
    // End when bottom of container hits 50% from top of viewport
    const endOffset = windowHeight * 0.5;

    const totalTravel = rect.height - endOffset + startOffset;
    const traveled = startOffset - rect.top;

    const pct = Math.min(1, Math.max(0, traveled / totalTravel));
    setProgress(pct);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const timelineHeight = ref.current?.getBoundingClientRect().height ?? 0;

  return (
    <div
      className="w-full bg-background font-sans py-16 md:py-12 lg:py-16"
      ref={containerRef}
    >
      <div className="container-wide px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-0">
          <div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              {sectionTitle || "Wie zijn wij?"}
            </h2>
            <p className="text-base md:text-lg max-w-3xl" style={{ color: 'var(--color-text-secondary)' }}>
              {sectionSubtitle || "Ons verhaal, passie en expertise in de automotive branche."}
            </p>
            {logos && logos.length > 0 && (
              <div className="flex items-center gap-6 mt-6">
                {logos.map((logo, i) => (
                  <img key={i} src={logo.src} alt={logo.alt} width={120} height={56} className="h-10 md:h-14 w-auto" style={{ filter: 'invert(1) hue-rotate(180deg)' }} />
                ))}
              </div>
            )}
          </div>
          <div className="lg:order-last pb-8 lg:pb-0">
            <img
              src="/two-men-image.jpg"
              alt="Kees Kraakman en Stefan van der Waals"
              width={800}
              height={533}
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

      {/* DESKTOP VERSIE - Full Timeline with Scroll Animation */}
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
            style={{ height: timelineHeight + "px" }}
            className="absolute left-8 md:left-12 lg:left-20 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-muted to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
          >
            <div
              style={{
                height: `${progress * 100}%`,
                opacity: Math.min(1, progress * 10),
                transition: 'height 0.1s linear, opacity 0.3s ease',
              }}
              className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-primary via-primary/80 to-transparent from-[0%] via-[10%] rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
