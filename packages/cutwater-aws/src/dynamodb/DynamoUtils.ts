export const VALUE_SEPERATOR = '#';

export const toValuePart = (value: string, index: number, defaultValue?: string): string | undefined => {
  const parts = parseValue(value);
  return parts.length > index ? parts[index] : defaultValue;
};

export const formatValue = (...elements: Array<string | number | undefined>): string => {
  return elements
    .filter((el) => el !== undefined)
    .map((el) => (typeof el === 'number' ? el.toString() : el))
    .join(VALUE_SEPERATOR);
};

export const parseValue = (value?: string): string[] => {
  return value ? value.split(VALUE_SEPERATOR) : [];
};
