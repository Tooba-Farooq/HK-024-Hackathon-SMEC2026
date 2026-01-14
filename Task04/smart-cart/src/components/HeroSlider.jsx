import { useEffect, useMemo, useState } from "react";

export default function HeroSlider() {
  const slides = useMemo(
    () => [
      {
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80",
        title: "New Season Essentials",
        subtitle: "Fresh picks, smart prices",
      },
      {
        image: "https://images.unsplash.com/photo-1521337706264-a414f153a5ed?auto=format&fit=crop&w=1600&q=80",
        title: "Style Your Cart",
        subtitle: "Add favorites in one click",
      },
      {
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80",
        title: "Fast & Easy Checkout",
        subtitle: "Shop smooth, save time",
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(id);
  }, [slides.length]);

  const current = slides[index];

  return (
    <section className="hero">
      <div
        className="hero__slide"
        style={{ backgroundImage: `url(${current.image})` }}
        aria-label={current.title}
      >
        <div className="hero__overlay" />
        <div className="hero__content">
          <h2 className="hero__title">{current.title}</h2>
          <p className="hero__subtitle">{current.subtitle}</p>
          <div className="hero__dots" aria-label="Hero slides">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`hero__dot ${i === index ? "is-active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
