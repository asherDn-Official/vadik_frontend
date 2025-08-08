import { toast } from "react-toastify";

const showToast = (message, type = "info", options = {}) => {
  const config = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    // theme: "block", // Use "colored" instead of "block"
    ...options, // Allow custom options
  };

  switch (type) {
    case "success":
      toast.success(message, config);
      break;
    case "error":
      toast.error(message, config);
      break;
    case "warning":
      toast.warning(message, config);
      break;
    case "info":
      toast.info(message, config);
      break;
    default:
      toast(message, config);
      break;
  }
};

export default showToast;
