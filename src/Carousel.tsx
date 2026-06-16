
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Virtual} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface CarouselProps {
  title: string;
  items: { imagen: string; titulo: string; artista?: string }[];
}

const placeholderImage = '/images/placeholder.png';

const Carousel: React.FC<CarouselProps> = ({ title, items }) => {
  return (
    <section style={{ marginBottom: '2rem', position: 'relative' }}>
      <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.5rem' }}>{title}</h3>

      <Swiper
        modules={[Navigation, Virtual]} // ✅ Lazy activado por módulo
        spaceBetween={16}
        slidesPerView={5}
        slidesPerGroup={5}
        loop={false}
        virtual
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        breakpoints={{
          1024: { slidesPerView: 5, slidesPerGroup: 5 },
          768: { slidesPerView: 3, slidesPerGroup: 3 },
          480: { slidesPerView: 2, slidesPerGroup: 2 },
        }}
        style={{ paddingBottom: '1rem' }}
      >
        {items.map((item, index) => (
          <SwiperSlide key={`${item.titulo}-${index}`} virtualIndex={index}>
            <div style={{ textAlign: 'center' }}>
              <img
                data-src={item.imagen} // ✅ Lazy loading
                alt={item.titulo}
                className="swiper-lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = placeholderImage;
                }}
                style={{
                  width: '150px',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  margin: '0 auto',
                  transition: 'transform 0.25s ease',
                }}
              />
              <div className="swiper-lazy-preloader"></div>
              <p style={{ marginTop: '0.5rem', fontWeight: 'bold', color: '#fff' }}>
                {item.titulo}
              </p>
              {item.artista && (
                <p style={{ fontSize: '0.9rem', color: '#aaa' }}>{item.artista}</p>
              )}
            </div>
          </SwiperSlide>
        ))}

        {/* Flechas personalizadas */}
        <button
          type="button"
          className="swiper-button-prev"
          aria-label="Anterior"
          style={{
            position: 'absolute',
            left: '-30px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '2rem',
            color: '#1DB954',
            cursor: 'pointer',
            zIndex: 10,
            background: 'transparent',
            border: 'none',
            lineHeight: 1,
          }}
        >
          ‹
        </button>
        <button
          type="button"
          className="swiper-button-next"
          aria-label="Siguiente"
          style={{
            position: 'absolute',
            right: '-30px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '2rem',
            color: '#1DB954',
            cursor: 'pointer',
            zIndex: 10,
            background: 'transparent',
            border: 'none',
            lineHeight: 1,
          }}
        >
          ›
        </button>
      </Swiper>
    </section>
  );
};

export default Carousel;









