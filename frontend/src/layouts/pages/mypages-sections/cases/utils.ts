import dayjs from 'dayjs';

export const getDateString = (date: string) => {
  if (dayjs(date).isValid()) {
    return dayjs(date).format('YYYY-MM-DD');
  } else {
    return date;
  }
};
