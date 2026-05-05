/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import type { CSSProperties } from "react";

type ManagedImageProps = {
  alt: string;
  className?: string;
  fill?: boolean;
  height?: number;
  priority?: boolean;
  sizes?: string;
  src: string;
  width?: number;
};

export function ManagedImage({ alt, className, fill, height, priority, sizes, src, width }: ManagedImageProps) {
  if (isInlineImageSource(src)) {
    const style: CSSProperties | undefined = fill
      ? {
          height: "100%",
          inset: 0,
          objectFit: "contain",
          position: "absolute",
          width: "100%",
        }
      : undefined;

    return <img alt={alt} className={className} height={height} src={src} style={style} width={width} />;
  }

  return (
    <Image
      alt={alt}
      className={className}
      fill={fill}
      height={height}
      priority={priority}
      sizes={sizes}
      src={src}
      width={width}
    />
  );
}

export function isInlineImageSource(src: string) {
  return /^(data|blob):/i.test(src);
}
