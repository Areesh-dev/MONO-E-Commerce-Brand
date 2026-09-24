import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { HeroSkeleton } from '../skeletons';
import { fetchHeroSlides } from '../../lib/api';

export default function Hero() {
  const [slides, setSlides] = useState(null);
  const [i, setI] = useState(0);
  const timer = useRef();

  useEffect(() => {
    fetchHeroSlides().then(setSlides).catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (!slides?.length) return;
    timer.current = setInterval(() => setI((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(timer.current);
  }, [slides]);

  if (slides === null) return <HeroSkeleton />;

  if (!slides.length) {
    return (
      <section className="bg-ink">
        <Container className="py-20 sm:py-32 text-center">
          <h1 className="heading-editorial text-5xl sm:text-6xl md:text-7xl lg:text-9xl text-ink-white">
            STYLE<br />VIBE<br />REFLECT
          </h1>
          <p className="mt-6 text-sm text-ink-dim max-w-md mx-auto px-4">
            Editorial fashion. Limited drops. Built for the bold.
          </p>
          <Link to="/products" className="inline-block mt-8">
            <Button size="lg">Shop Now</Button>
          </Link>
        </Container>
      </section>
    );
  }

  const slide = slides[i];

  return (
    <section className="relative bg-ink overflow-hidden" aria-roledescription="carousel" aria-label="Featured">
      <div className="relative h-[70vh] sm:h-[85vh] min-h-[480px] sm:min-h-[560px]">
        {slides.map((s, idx) => (
          <motion.div
            key={s.id}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${s.image_url})` }}
            initial={false}
            animate={{ opacity: idx === i ? 1 : 0, scale: idx === i ? 1 : 1.05 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden={idx !== i}
          />
        ))}

        <div
          className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink"
          aria-hidden="true"
        />

        <Container className="relative h-full flex flex-col justify-center">
          <motion.div
            key={slide.id}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="heading-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-ink-white whitespace-pre-line">
              {slide.title}
            </h1>

            {slide.description && (
              <p className="mt-5 sm:mt-6 text-sm sm:text-base text-ink-text max-w-md">
                {slide.description}
              </p>
            )}

            {slide.button_text && slide.button_url && (
              <Link to={slide.button_url} className="inline-block mt-7 sm:mt-8">
                <Button size="lg">{slide.button_text}</Button>
              </Link>
            )}
          </motion.div>
        </Container>

        {slides.length > 1 && (
          <div className="hidden lg:flex absolute bottom-8 right-8 gap-3 z-10">
            <button
              onClick={() => setI((p) => (p - 1 + slides.length) % slides.length)}
              aria-label="Previous slide"
              className="w-10 h-10 border border-ink-line text-ink-white hover:border-ink-white transition-colors flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setI((p) => (p + 1) % slides.length)}
              aria-label="Next slide"
              className="w-10 h-10 border border-ink-line text-ink-white hover:border-ink-white transition-colors flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {slides.length > 1 && (
          <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setI(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === i ? 'true' : undefined}
                className={`h-px transition-all duration-500 ${
                  idx === i
                    ? 'w-8 bg-ink-white'
                    : 'w-3 bg-ink-white/30 hover:bg-ink-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}