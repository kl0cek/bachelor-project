export function getVisibilityIcon(visibility: string): string {
    switch (visibility?.toLowerCase()) {
      case 'daylight':
        return '☀️';
      case 'eclipsed':
        return '🌑';
      default:
        return '🛰️';
    }
  }

  export function getVisibilityText(visibility: string): string {
    switch (visibility?.toLowerCase()) {
      case 'daylight':
        return 'Daylight';
      case 'eclipsed':
        return 'Eclipsed';
      default:
        return 'Unknown';
    }
  }

  export function getVisibilityColor(visibility: string): string {
    switch (visibility?.toLowerCase()) {
      case 'daylight':
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
      case 'eclipsed':
        return 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
    }
  }