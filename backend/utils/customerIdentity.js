// ========================================
// CUSTOMER IDENTITY HELPERS
// ========================================

const normalizePhoneKey = (value) => {
  let digits = String(value || "").replace(/\D/g, "");

  if (digits.startsWith("0092")) {
    digits = digits.slice(2);
  }

  // +92 3XX XXXXXXX -> 03XX XXXXXXX
  if (digits.startsWith("92") && digits.length === 12) {
    return `0${digits.slice(2)}`;
  }

  // 3XX XXXXXXX -> 03XX XXXXXXX
  if (digits.startsWith("3") && digits.length === 10) {
    return `0${digits}`;
  }

  return digits;
};

module.exports = {
  normalizePhoneKey,
};
