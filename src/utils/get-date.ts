const getDate = (date: Date): string => {
  return date.toISOString().split('T').at(0);
};

export { getDate };
