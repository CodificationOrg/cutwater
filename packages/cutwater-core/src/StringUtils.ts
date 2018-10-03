export const contains = (target: string, searchTerm: string, caseInsensitive = false): boolean => {
  return (
    target &&
    searchTerm &&
    (target.indexOf(searchTerm) !== -1 || (caseInsensitive && target.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1))
  );
};

export const startsWith = (target: string, searchTerm: string, caseInsensitive = false): boolean => {
  return (
    target &&
    searchTerm &&
    (target.indexOf(searchTerm) === 0 || (caseInsensitive && target.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0))
  );
};

export const endsWith = (target: string, searchTerm: string, caseInsensitive = false): boolean => {
  const index = target && searchTerm && target.length >= searchTerm.length ? target.length - searchTerm.length : -1;
  return (
    index !== -1 &&
    (target.indexOf(searchTerm) === index ||
      (caseInsensitive && target.toLowerCase().indexOf(searchTerm.toLowerCase()) === index))
  );
};
