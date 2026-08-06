export const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayCheckoutPromise = null;

export const loadRazorpayCheckout = () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayCheckoutPromise) {
    return razorpayCheckoutPromise;
  }

  razorpayCheckoutPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_CHECKOUT_SRC}"]`,
    );

    const handleLoad = () => resolve(Boolean(window.Razorpay));
    const handleError = () => {
      razorpayCheckoutPromise = null;
      resolve(false);
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = handleLoad;
    script.onerror = handleError;

    document.body.appendChild(script);
  });

  return razorpayCheckoutPromise;
};
