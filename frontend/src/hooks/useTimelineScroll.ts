import { useState, useRef, useEffect, useCallback } from 'react';

interface UseTimelineScrollProps {
  currentDate: string;
  missionStartDate: string;
  missionEndDate: string;
  onDateChange: (date: string) => void;
}

interface UseTimelineScrollReturn {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
  handlePreviousDay: () => void;
  handleNextDay: () => void;
  isScrolling: boolean;
}

const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const useTimelineScroll = ({
  currentDate,
  missionStartDate,
  missionEndDate,
  onDateChange,
}: UseTimelineScrollProps): UseTimelineScrollReturn => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const isNavigatingRef = useRef(false);

  const canNavigatePrevious = useCallback(() => {
    const current = new Date(currentDate);
    const start = new Date(missionStartDate);
    return current > start;
  }, [currentDate, missionStartDate]);

  const canNavigateNext = useCallback(() => {
    const current = new Date(currentDate);
    const end = new Date(missionEndDate);
    return current < end;
  }, [currentDate, missionEndDate]);

  const handlePreviousDay = useCallback(() => {
    if (!canNavigatePrevious()) return;
    isNavigatingRef.current = true;
    const newDate = addDays(currentDate, -1);
    onDateChange(newDate);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  }, [currentDate, canNavigatePrevious, onDateChange]);

  const handleNextDay = useCallback(() => {
    if (!canNavigateNext()) return;
    isNavigatingRef.current = true;
    const newDate = addDays(currentDate, 1);
    onDateChange(newDate);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 200);
  }, [currentDate, canNavigateNext, onDateChange]);

  const initializedRef = useRef(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (isNavigatingRef.current) return;
    if (initializedRef.current) return;

    const totalDays = 1 + (canNavigatePrevious() ? 1 : 0) + (canNavigateNext() ? 1 : 0);
    const dayWidth = container.scrollWidth / totalDays;

    const currentDayIndex = canNavigatePrevious() ? 1 : 0;
    container.scrollLeft = dayWidth * currentDayIndex;

    initializedRef.current = true;
  }, [canNavigatePrevious, canNavigateNext]);

  useEffect(() => {
    if (isNavigatingRef.current) {
      requestAnimationFrame(() => {
        isNavigatingRef.current = false;
      });
    }
  }, [currentDate]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (isNavigatingRef.current) return;
      setIsScrolling(true);

      if (scrollTimeout) clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const totalDays = 1 + (canNavigatePrevious() ? 1 : 0) + (canNavigateNext() ? 1 : 0);
        const dayWidth = container.scrollWidth / totalDays;
        const currentDayIndex = canNavigatePrevious() ? 1 : 0;
        const scrollPercentage = container.scrollLeft / dayWidth;

        if (scrollPercentage < currentDayIndex - 0.5 && canNavigatePrevious()) {
          handlePreviousDay();
        } else if (scrollPercentage > currentDayIndex + 0.5 && canNavigateNext()) {
          handleNextDay();
        }

        setIsScrolling(false);
      }, 200);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [canNavigatePrevious, canNavigateNext, handlePreviousDay, handleNextDay]);

  return {
    scrollContainerRef,
    canNavigatePrevious: canNavigatePrevious(),
    canNavigateNext: canNavigateNext(),
    handlePreviousDay,
    handleNextDay,
    isScrolling,
  };
};
