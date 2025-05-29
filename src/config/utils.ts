export const getTimeNow = (timestamp: string): number => {
  const date = new Date(timestamp);
  return date.getTime();
};
