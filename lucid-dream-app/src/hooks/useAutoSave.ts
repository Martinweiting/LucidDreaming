import { useEffect, useRef, useState } from 'react';

interface UseAutoSaveProps {
  value: unknown;
  onSave: () => Promise<void>;
  debounceDelay?: number;
}

export function useAutoSave({
  value,
  onSave,
  debounceDelay = 800,
}: UseAutoSaveProps): {
  isSaving: boolean;
  savedAt: Date | null;
} {
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastValueRef = useRef(value);

  useEffect(() => {
    lastValueRef.current = value;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsSaving(false);

    timeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await onSave();
        setSavedAt(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, debounceDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onSave, debounceDelay]);

  return { isSaving, savedAt };
}
