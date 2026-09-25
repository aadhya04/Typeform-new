import { useEffect, useRef } from "react";

export function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay = 500) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  return (...args: Parameters<T>) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fnRef.current(...args), delay);
  };
}
