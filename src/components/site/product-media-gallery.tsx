"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ManagedImage } from "@/components/site/managed-image";
import type { ProductImage } from "@/content/products";

type ProductMediaGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductMediaGallery({ images, productName }: ProductMediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const suppressStageClickRef = useRef(false);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
  });
  const selectedImage = images[selectedIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

  function showPrevious() {
    setSelectedIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function showNext() {
    setSelectedIndex((current) => (current + 1) % images.length);
  }

  function startGalleryGesture(event: PointerEvent<HTMLElement>) {
    if (!hasMultipleImages || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function trackGalleryGesture(event: PointerEvent<HTMLElement>) {
    const drag = dragRef.current;

    if (!drag.active || drag.pointerId !== event.pointerId) {
      return;
    }

    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);

    if (distance > 10) {
      suppressStageClickRef.current = true;
    }
  }

  function finishGalleryGesture(event: PointerEvent<HTMLElement>) {
    const drag = dragRef.current;

    if (!drag.active || drag.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current.active = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    const isHorizontalGesture = Math.abs(deltaX) > 46 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15;

    if (!isHorizontalGesture) {
      return;
    }

    suppressStageClickRef.current = true;

    if (deltaX < 0) {
      showNext();
      return;
    }

    showPrevious();
  }

  function cancelGalleryGesture(event: PointerEvent<HTMLElement>) {
    const drag = dragRef.current;

    if (drag.active && event.currentTarget.hasPointerCapture(drag.pointerId)) {
      event.currentTarget.releasePointerCapture(drag.pointerId);
    }

    dragRef.current.active = false;
  }

  function handleStageClick() {
    if (suppressStageClickRef.current) {
      suppressStageClickRef.current = false;
      return;
    }

    setIsZoomOpen(true);
  }

  useEffect(() => {
    if (!isZoomOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsZoomOpen(false);
      }

      if (event.key === "ArrowLeft" && hasMultipleImages) {
        setSelectedIndex((current) => (current === 0 ? images.length - 1 : current - 1));
      }

      if (event.key === "ArrowRight" && hasMultipleImages) {
        setSelectedIndex((current) => (current + 1) % images.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasMultipleImages, isZoomOpen, images.length]);

  if (!selectedImage) {
    return null;
  }

  return (
    <section className="product-media-gallery" aria-label={`${productName} product images`}>
      <button
        aria-label={`${selectedImage.alt || productName}. Tap to zoom${hasMultipleImages ? ", swipe or drag to change image" : ""}.`}
        className={`gallery-stage ${hasMultipleImages ? "gallery-stage-draggable" : ""}`}
        type="button"
        onClick={handleStageClick}
        onPointerCancel={cancelGalleryGesture}
        onPointerDown={startGalleryGesture}
        onPointerMove={trackGalleryGesture}
        onPointerUp={finishGalleryGesture}
      >
        <ManagedImage
          src={selectedImage.src}
          alt={selectedImage.alt}
          fill
          priority
          sizes="(max-width: 980px) 100vw, 42vw"
        />
        <span className="zoom-hint">{hasMultipleImages ? "Swipe / drag or zoom" : "Zoom image"}</span>
      </button>

      {hasMultipleImages ? (
        <div className="thumbnail-strip" aria-label="Choose product image">
          {images.map((image, index) => (
            <button
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-pressed={selectedIndex === index}
              className={`thumbnail-button ${selectedIndex === index ? "active" : ""}`}
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
            >
              <ManagedImage src={image.src} alt="" fill sizes="96px" />
            </button>
          ))}
        </div>
      ) : null}

      <p className="gallery-caption">
        {selectedImage.alt || `${productName} image`}{" "}
        <span>
          {selectedIndex + 1}/{images.length}
        </span>
      </p>

      {isZoomOpen ? (
        <div className="zoom-backdrop" role="dialog" aria-modal="true" aria-label={`${productName} zoomed image`}>
          <button className="zoom-dismiss-layer" type="button" aria-label="Close image zoom" onClick={() => setIsZoomOpen(false)} />
          <div className="zoom-dialog">
            <div className="zoom-toolbar">
              <span>{selectedImage.alt || productName}</span>
              <button type="button" onClick={() => setIsZoomOpen(false)}>
                Close
              </button>
            </div>
            <div
              className={`zoom-media ${hasMultipleImages ? "gallery-stage-draggable" : ""}`}
              onPointerCancel={cancelGalleryGesture}
              onPointerDown={startGalleryGesture}
              onPointerMove={trackGalleryGesture}
              onPointerUp={finishGalleryGesture}
            >
              <ManagedImage src={selectedImage.src} alt={selectedImage.alt} fill sizes="100vw" />
            </div>
            {hasMultipleImages ? (
              <div className="zoom-controls" aria-label="Zoom gallery controls">
                <button type="button" onClick={showPrevious}>
                  Previous
                </button>
                <span>
                  {selectedIndex + 1} / {images.length}
                </span>
                <button type="button" onClick={showNext}>
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
