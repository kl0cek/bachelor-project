import { useState, useEffect, useRef, useCallback } from 'react';
import type { Mission } from '../types/types';

interface TimelineScrollState {
  allDates: string[];
  currentDateIndex: number;
  scrollToDate: (date: string) => void;
  scrollToToday: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  getDayNumber: (date: string) => number;
}

export const useTimelineScroll = (mission: Mission): TimelineScrollState => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

  useEffect(() => {
    const generateDates = () => {
      const dates: string[] = [];
      const start = new Date(mission.startDate);
      const end = new Date(mission.endDate);
      
      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      
      return dates;
    };

    const dates = generateDates();
    setAllDates(dates);

    const today = new Date().toISOString().split('T')[0];
    const todayIndex = dates.indexOf(today);
    if (todayIndex !== -1) {
      setCurrentDateIndex(todayIndex);
    } else {
      setCurrentDateIndex(0);
    }
  }, [mission.startDate, mission.endDate]);

  const getDayNumber = useCallback((date: string): number => {
    const index = allDates.indexOf(date);
    return index !== -1 ? index + 1 : 1;
  }, [allDates]);

  const scrollToDate = useCallback((date: string) => {
    const index = allDates.indexOf(date);
    if (index === -1 || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const dayWidth = container.scrollWidth / allDates.length;
    const scrollPosition = dayWidth * index;

    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });

    setCurrentDateIndex(index);
  }, [allDates]);

  const scrollToToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayIndex = allDates.indexOf(today);
    
    if (todayIndex !== -1) {
      scrollToDate(today);
    }
  }, [allDates, scrollToDate]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || allDates.length === 0) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const dayWidth = container.scrollWidth / allDates.length;
      const index = Math.round(scrollLeft / dayWidth);
      setCurrentDateIndex(Math.min(Math.max(0, index), allDates.length - 1));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [allDates.length]);

  return {
    allDates,
    currentDateIndex,
    scrollToDate,
    scrollToToday,
    scrollContainerRef,
    getDayNumber,
  };
};
