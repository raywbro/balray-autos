import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
};

export default function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  fill = false,
  className = "",
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  objectFit = "cover",
}: Props) {
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxMCI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjEwIiBmaWxsPSIjRTlFREYwIi8+PC9zdmc+";

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-${objectFit} ${className}`}
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={blurDataURL}
        quality={75}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-${objectFit} ${className}`}
      sizes={sizes}
      priority={priority}
      placeholder="blur"
      blurDataURL={blurDataURL}
      quality={75}
    />
  );
}