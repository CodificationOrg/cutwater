export const contains = (value: string, searchTerm: string, caseInsensitive = false): boolean => {
  return (
    value &&
    searchTerm &&
    (value.indexOf(searchTerm) !== -1 || (caseInsensitive && value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1))
  );
};

export const startsWith = (value: string, searchTerm: string, caseInsensitive = false): boolean => {
  return (
    value &&
    searchTerm &&
    (value.indexOf(searchTerm) === 0 || (caseInsensitive && value.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0))
  );
};

export const endsWith = (value: string, searchTerm: string, caseInsensitive = false): boolean => {
  const index = value && searchTerm && value.length >= searchTerm.length ? value.length - searchTerm.length : -1;
  return (
    index !== -1 &&
    (value.indexOf(searchTerm) === index ||
      (caseInsensitive && value.toLowerCase().indexOf(searchTerm.toLowerCase()) === index))
  );
};
