import { useEffect, useRef } from 'react';
import useDeepMemo from './useDeepMemo';

const normalizeKeyCombination = (keys) => {
  const [modifier, k] = keys.toLowerCase().split(/\s*\+\s*/);

  return k == null ? [null, modifier] : [modifier, k];
};

const matchesModifierKey = (modifier, event) => {
  switch (modifier) {
    case null:
      return true;
    case 'cmd':
      return event.metaKey || event.ctrlKey;
    case 'ctrl':
      return event.ctrlKey;
    case 'shift':
      return event.shiftKey;
    case 'alt':
      return event.altKey;
    default:
      return false;
  }
};

const matchesAnyCombination = (combinations, event) => {
  return combinations.some(
    ([modifier, key]) =>
      event.key === key && matchesModifierKey(modifier, event)
  );
};

const useKeyPress = (keys, handler) => {
  const savedHandler = useRef();
  const combinations = useDeepMemo(
    () =>
      Array.isArray(keys)
        ? keys.map(normalizeKeyCombination)
        : [normalizeKeyCombination(keys)],
    [keys]
  );

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (matchesAnyCombination(combinations, event)) {
        savedHandler.current(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [combinations]);
};

export default useKeyPress;
