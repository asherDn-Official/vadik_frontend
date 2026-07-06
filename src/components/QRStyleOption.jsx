import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

export default function QRStyleOption({
  options,
  selected,
  onClick,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.innerHTML = "";

    const qr = new QRCodeStyling({
      width: 70,
      height: 70,
      data: "https://vadik.ai",
      margin: 0,
      dotsOptions: options.dotsOptions,
      cornersSquareOptions: options.cornersSquareOptions,
      cornersDotOptions: options.cornersDotOptions,
      backgroundOptions: {
        color: "#ffffff",
      },
    });

    qr.append(ref.current);
  }, [options]);

  return (
    <button
      onClick={onClick}
      className={`w-28 h-28 rounded-xl border transition flex items-center justify-center
      ${
        selected
          ? "border-[#6D5DFC] ring-2 ring-[#6D5DFC]/20"
          : "border-gray-200 hover:border-[#6D5DFC]"
      }`}
    >
      <div ref={ref} />
    </button>
  );
}