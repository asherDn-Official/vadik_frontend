export const formatIndianMobile = (value) => {
    if (!value) return "";
    const digits = String(value).replace(/\D/g, "");
    let country = "91";
    let local = "";
    if (digits.length >= 12 && digits.startsWith("91")) {
      country = "91";
      local = digits.slice(-10);
    } else if (digits.length === 10) {
      local = digits;
    } else if (digits.startsWith("0") && digits.length === 11) {
      local = digits.slice(1);
    } else if (digits.startsWith("91") && digits.length === 11) {
      local = digits.slice(-10);
    } else {
      local = digits.slice(-10) || digits;
    }
    const part1 = local.slice(0, 5);
    const part2 = local.slice(5, 10);
    return `+${country} ${part1}${part2 ? " " + part2 : ""}`;
  };