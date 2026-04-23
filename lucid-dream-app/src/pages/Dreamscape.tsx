import PageLayout from '../components/PageLayout';

/**
 * 夢景（Dreamscape）— 以視覺化方式呈現夢境的情緒地圖與模式。
 * 目前為佔位頁面，後續實作完整視覺化功能。
 */
export default function Dreamscape(): JSX.Element {
  return (
    <PageLayout title="夢景" showTabBar>
      <div className="flex flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <div className="font-serif text-display font-light text-tertiary select-none">
          ∿
        </div>
        <div>
          <p className="font-serif text-bodyLg text-secondary">夢境地圖</p>
          <p className="mt-2 font-ui text-small text-tertiary">
            此功能正在建構中，將呈現你的夢境情緒模式與視覺化地圖
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
