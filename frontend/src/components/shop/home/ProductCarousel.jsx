import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import ProductCard from '../../shared/ProductCard';

import 'swiper/css';
import 'swiper/css/navigation';

export default function ProductCarousel({ products = [] }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  if (!products.length) return null;

  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, Navigation]}
        slidesPerView={2}
        spaceBetween={16}
        breakpoints={{
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        autoplay={{
          delay: 3500,
          disableOnInteraction: true,
          pauseOnMouseEnter: true,
        }}
        className="!pb-2"
      >
        {products.map((p) => (
          <SwiperSlide key={p.id}>
            <ProductCard product={p} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="hidden sm:flex gap-2 justify-end mt-4">
        <button
          ref={prevRef}
          aria-label="Precedent"
          className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:border-rose-300 hover:bg-rose-50 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          ref={nextRef}
          aria-label="Suivant"
          className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:border-rose-300 hover:bg-rose-50 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
