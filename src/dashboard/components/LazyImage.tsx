import React, { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Imagen a mostrar mientras no está en viewport (placeholder/skeleton). */
  placeholderSrc?: string;
  /** Si true, carga inmediatamente (para las primeras filas). */
  eager?: boolean;
  /** Equivalente a fetchPriority del <img>. */
  fetchPriority?: "high" | "low" | "auto";
  /** Margen para precargar un poco antes de entrar en pantalla. */
  rootMargin?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
};

/**
 * Lazy load robusto: no asigna el `src` real hasta que el elemento
 * entra (o está cerca) del viewport. Esto evita que el navegador empiece
 * a descargar *todas* las imágenes a la vez, incluso si `loading="lazy"`
 * no se respeta en algunos escenarios.
 */
export default function LazyImage({
  src,
  alt,
  className,
  placeholderSrc,
  eager,
  fetchPriority = "auto",
  rootMargin = "250px",
  onError,
}: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [resolvedSrc, setResolvedSrc] = useState<string>(
    eager ? src : ""
  );

  // Si cambia el src (p.ej. al paginar), actualizamos el placeholder.
  useEffect(() => {
    if (eager) {
      setResolvedSrc(src);
      return;
    }
    setResolvedSrc("");
  }, [src, eager, placeholderSrc]);

  useEffect(() => {
    if (eager) return;

    const node = imgRef.current;
    if (!node) return;

    // Si no hay IntersectionObserver (muy raro hoy), caemos a carga directa.
    if (typeof IntersectionObserver === "undefined") {
      setResolvedSrc(src);
      return;
    }

    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          if (!cancelled) setResolvedSrc(src);
          io.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );

    io.observe(node);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [src, eager, rootMargin]);

  return (
    <img
      ref={imgRef}
      src={resolvedSrc || undefined}
      alt={alt}
      className={className}
      decoding="async"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={(eager ? fetchPriority : (fetchPriority === "high" ? "auto" : fetchPriority)) as any}
      onError={onError}
    />
  );
}
