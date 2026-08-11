import {
  useEffect,
  useState,
} from "react";

import {
  Package,
} from "lucide-react";

import {
  getImageUrl,
} from "../../services/api";

// ========================================
// PRODUCT IMAGE
//
// Professional universal product image.
//
// Works for:
// - Trending Products
// - Deal Of The Day
// - Shop Products
// - Featured Products
// - New Arrivals
// - Best Sellers
//
// Main goals:
//
// 1. Same square image box
// 2. No stretching
// 3. No important cropping
// 4. Different image ratios supported
// 5. Wide images look better
// ========================================

const ProductImage = ({
  src,
  alt = "Product",
  className = "",
  imageClassName = "",
  fit = "contain",
  padding = true,
}) => {
  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  const imageUrl = src
    ? getImageUrl(src)
    : "";

  // ======================================
  // RESET ERROR WHEN IMAGE CHANGES
  // ======================================

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const hasImage =
    Boolean(imageUrl) &&
    !imageFailed;

  const fitClass =
    fit === "cover"
      ? "object-cover"
      : "object-contain";

  return (
    <div
      className={`
        relative
        flex
        aspect-square
        w-full
        items-center
        justify-center
        overflow-hidden
        bg-[#f7f7f7]

        ${className}
      `}
    >
      {hasImage ? (
        <>
          {/* =============================
              SOFT BACKGROUND

              Helps wide / unusual images
              visually fill the product box
              without stretching foreground.
          ============================= */}

          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            className="
              absolute
              inset-0
              h-full
              w-full
              scale-110
              object-cover
              opacity-[0.07]
              blur-xl
            "
          />

          {/* =============================
              MAIN PRODUCT IMAGE
          ============================= */}

          <img
            src={imageUrl}
            alt={alt}
            loading="lazy"
            onError={() =>
              setImageFailed(true)
            }
            className={`
              relative
              z-10
              h-full
              w-full
              ${fitClass}

              ${
                padding
                  ? "p-2 sm:p-3"
                  : ""
              }

              transition-transform
              duration-300

              ${imageClassName}
            `}
          />
        </>
      ) : (
        // =================================
        // NO IMAGE / FAILED IMAGE
        // =================================

        <div
          className="
            flex
            h-full
            w-full
            items-center
            justify-center
          "
        >
          <Package
            size={46}
            strokeWidth={1.6}
            className="
              text-[#d2d6dc]
            "
          />
        </div>
      )}
    </div>
  );
};

export default ProductImage;