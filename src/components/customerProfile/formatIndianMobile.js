import { formatPhoneNumberIntl } from "react-phone-number-input";

export const formatIndianMobile = (value) => {
    if (!value) return "";
    const withPlus = String(value).startsWith("+") ? value : `+${value}`;
    try {
        return formatPhoneNumberIntl(withPlus) || withPlus;
    } catch (e) {
        return withPlus;
    }
  };