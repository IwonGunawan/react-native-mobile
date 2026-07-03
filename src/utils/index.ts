export * from './debug';
export * from './const';


/**
 * convert number with dot. ex: 50000 -> 50.000
 * @param value number
 * @returns 50.000
 */
export const formatNumberInput = (value: string) => {
  const numeric = value.replace(/\D/g, "");
  return numeric ? Number(numeric).toLocaleString("id-ID") : "";
};

/**
 * back again to type number. ex: 50.000 -> 50000
 * @param value number
 * @returns 50000
 */
export const parseNumberInput = (value: string) => {
  return value.replace(/\./g, "");
};
