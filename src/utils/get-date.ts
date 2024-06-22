import { format } from 'date-fns';

const getDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export { getDate };
