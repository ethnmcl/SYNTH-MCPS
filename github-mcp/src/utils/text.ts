export const truncate = (value: string, max = 5000): string => {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max)}...`;
};
