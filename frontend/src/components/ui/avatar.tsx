import { cx } from "class-variance-authority";

function Avatar({
  className,
  image,
  alt,
  fallback,
}: {
  className?: string;
  image?: string | null;
  alt: string;
  fallback?: string;
}) {
  return (
    <div
      className={cx(
        "relative rounded-full aspect-square overflow-hidden border w-16",
        className
      )}
    >
      {image ? (
        <img src={image} alt={alt} className="object-contain w-full h-full" />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-2xl">
          {fallback}
        </div>
      )}
    </div>
  );
}

export default Avatar;
