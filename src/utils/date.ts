export const getDayOfYear = (date: Date = new Date()): number => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const msInDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / msInDay) + 1;
};

export const formatDate = (date: Date = new Date()): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const getVisibilityIcon = (visibility: string): string => {
  switch (visibility?.toLowerCase()) {
    case 'daylight':
      return '☀️';
    case 'eclipsed':
      return '🌑';
    default:
      return '🛰️';
  }
};

export const getVisibilityText = (visibility: string): string => {
  switch (visibility?.toLowerCase()) {
    case 'daylight':
      return 'Daylight';
    case 'eclipsed':
      return 'Eclipsed';
    default:
      return 'Unknown';
  }
};
