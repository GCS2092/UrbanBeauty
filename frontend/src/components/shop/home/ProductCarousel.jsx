import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import ProductCard from '../../shared/ProductCard';

import 'swiper/css';

export default function ProductCarousel({ products = [] }) {
  if (!products.length) return null;

  // On triple la liste pour garantir assez de slides au loop de Swiper,
  // meme si peu de produits sont marques "featured" en base (ex: 4 seulement)
  const items = [...products, ...products, ...products];

  return (
    <Swiper
      modules={[Autoplay]}
      slidesPerView={2}
      spaceBetween={16}
      loop
      breakpoints={{
        640: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
      }}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      className="!pb-2"
    >
      {items.map((p, i) => (
        <SwiperSlide key={`${p.id}-${i}`}>
          <ProductCard product={p} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
