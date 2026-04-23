/**
 * 快速捕捉頁面 — 夢境記錄的入口點。
 * 設計目標：打開 app 到開始打字 < 2 秒。
 * 美學：燕麥紙張 + 純粹書寫體驗，最少干擾。
 */
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { dreamRepo } from '../services/dreamRepo';
import Navbar from '../components/Navbar';

const AUTOSAVE_INTERVAL = 3000;
const DRAFT_STORAGE_KEY = 'capture-draft';

export default function Capture(): JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const autosaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 預設日期為昨天
  const defaultDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [draftRestored, setDraftRestored] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 進入頁面時還原草稿，並立即 focus
  useEffect(() => {
    const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (saved) {
      try {
        const { content: savedContent, date: savedDate } = JSON.parse(saved) as {
          content: string;
          date: string;
        };
        setContent(savedContent);
        setSelectedDate(savedDate);
        setDraftRestored(true);
      } catch {
        // 無效草稿，忽略
      }
    }
    textareaRef.current?.focus();
  }, []);

  // 自動儲存到 sessionStorage
  useEffect(() => {
    const save = (): void => {
      sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ content, date: selectedDate }),
      );
    };

    if (content || selectedDate !== defaultDate) {
      save();
    }

    autosaveTimerRef.current = setInterval(save, AUTOSAVE_INTERVAL);

    return () => {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current);
      }
    };
  }, [content, selectedDate, defaultDate]);

  const handleSave = async (): Promise<void> => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await dreamRepo.create({ content, dreamDate: selectedDate });
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      navigate('/home');
    } catch {
      setIsSubmitting(false);
    }
  };

  const displayDate = format(new Date(`${selectedDate}T00:00:00`), 'M月d日 EEEE', {
    locale: zhTW,
  });

  const rightActions = (
    <button
      type="button"
      onClick={() => void handleSave()}
      disabled={!content.trim() || isSubmitting}
      className="rounded-md px-3 py-1 font-ui text-small text-accent transition-colors duration-fast enabled:hover:text-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
    >
      {isSubmitting ? '儲存中…' : '儲存'}
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <Navbar
        showBack
        onBackClick={() => navigate('/home')}
        rightActions={rightActions}
      />

      <main className="flex flex-1 flex-col">
        {/* 日期標頭 */}
        <div className="px-5 pt-4 pb-2">
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="group flex items-center gap-2"
            aria-label="選擇夢境日期"
          >
            <span className="font-serif text-title font-light text-primary transition-colors duration-fast group-hover:text-accent">
              {displayDate}
            </span>
            <span className="font-ui text-caption text-tertiary transition-colors duration-fast group-hover:text-secondary">
              的夢
            </span>
          </button>

          {showDatePicker && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setShowDatePicker(false);
              }}
              className="mt-2 block rounded-md border border-border-default bg-raised px-3 py-2 font-ui text-small text-primary outline-none focus:border-border-focus"
              aria-label="夢境日期"
              autoFocus
            />
          )}

          {draftRestored && (
            <p className="mt-1 font-ui text-caption text-tertiary">已還原未儲存的草稿</p>
          )}
        </div>

        {/* 分隔線 */}
        <div className="mx-5 border-t border-border-subtle" />

        {/* 書寫區 */}
        <div className="relative flex-1 px-5 pt-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="記下你還記得的一切，零碎也沒關係…"
            className="h-full min-h-[50dvh] w-full resize-none bg-transparent font-serif text-bodyLg leading-relaxed text-primary placeholder-text-disabled outline-none"
            spellCheck={false}
          />
        </div>

        {/* 字數統計 */}
        {content.length > 0 && (
          <div className="px-5 pb-6 pt-2 text-right">
            <span className="font-ui text-caption text-disabled tabular-nums">
              {content.length} 字
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
