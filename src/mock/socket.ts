import { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import dayjs from 'dayjs';

export const useMockSocket = () => {
  const setNow = useStore((s) => s.setNow);
  useEffect(() => {
    const id = setInterval(() => {
      // advance mocked now by 30 seconds
      setNow(dayjs().toISOString());
    }, 1000);
    return () => clearInterval(id);
  }, [setNow]);
};
