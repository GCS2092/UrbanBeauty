import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import { Tag } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/free-mode';

export default function CategoryMarquee({ categories = [] }) {
  if (!categories.length) return null;

  // On duplique la liste pour boucler sans a-coup visible
  const loopItems = [...categories, ...categories];

  return (
    <section className="bg-rose-50/60 border-y border-stone-100 py-5 overflow-hidden">
      <Swiper
        modules={[Autoplay, FreeMode]}
        slidesPerView="auto"
        spaceBetween={16}
        loop
        freeMode={{ enabled: true, momentum: false }}
        speed={6000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
      >
        {loopItems.map((cat, i) => (
          <SwiperSlide key={`${cat.id}-${i}`} className="!w-auto">
            <Link
              to={`/products?category=${cat.slug}`}
              className="flex items-center gap-2.5 bg-white border border-stone-100 rounded-full pl-2 pr-4 py-2 hover:border-rose-300 transition-colors whitespace-nowrap"
            >
              <span className="w-8 h-8 rounded-full overflow-hidden bg-stone-100 shrink-0 flex items-center justify-center text-stone-300">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Tag size={14} />
                )}
              </span>
              <span className="text-sm font-semibold text-stone-700">
                {cat.name}
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
