import { useEffect, useRef, memo } from "react";
import QRCodeStyling from "qr-code-styling";

const StyledQRCode = memo(function StyledQRCode({
  value,
  size = 180,
  fgColor = "#000000",
  bgColor = "#ffffff",
  logo,
  logoSize = 40,
  logoOpacity = 1,
  logoPlacement = "inside",
  qrStyle = "square",
  eyeFrame = "square",
  eyeBall = "square",
}) {
  const ref = useRef(null);
  const qr = useRef(null);
  const frame = useRef(null);

  // Create QR only once
  useEffect(() => {
    qr.current = new QRCodeStyling({
      width: size,
      height: size,
      type: "svg",
      data: value || "",

      image: logoPlacement === "inside" ? logo : undefined,

      dotsOptions: {
        color: fgColor,
        type: qrStyle,
      },

      backgroundOptions: {
        color: bgColor,
      },

      imageOptions: {
        crossOrigin: "anonymous",
        margin: 2,
        imageSize: logoSize / 100,
        opacity: logoOpacity,
        hideBackgroundDots: true,
      },

      cornersSquareOptions: {
        color: fgColor,
        type: eyeFrame,
      },

      cornersDotOptions: {
        color: fgColor,
        type: eyeBall,
      },
    });

    qr.current.append(ref.current);

    return () => {
      cancelAnimationFrame(frame.current);

      if (ref.current) {
        ref.current.innerHTML = "";
      }
    };
  }, []);

  // Update only when values change
  useEffect(() => {
    if (!qr.current) return;

    cancelAnimationFrame(frame.current);

    frame.current = requestAnimationFrame(() => {
      qr.current.update({
        width: size,
        height: size,

        data: value || "",

        image: logoPlacement === "inside" ? logo : undefined,

        dotsOptions: {
          color: fgColor,
          type: qrStyle,
        },

        backgroundOptions: {
          color: bgColor,
        },

        imageOptions: {
          crossOrigin: "anonymous",
          margin: 2,
          imageSize: logoSize / 100,
          opacity: logoOpacity,
          hideBackgroundDots: true,
        },

        cornersSquareOptions: {
          color: fgColor,
          type: eyeFrame,
        },

        cornersDotOptions: {
          color: fgColor,
          type: eyeBall,
        },
      });
    });
  }, [
    value,
    size,
    fgColor,
    bgColor,
    logo,
    logoOpacity,
    logoSize,
    logoPlacement,
    qrStyle,
    eyeFrame,
    eyeBall,
  ]);

  return <div ref={ref} />;
});

export default StyledQRCode;