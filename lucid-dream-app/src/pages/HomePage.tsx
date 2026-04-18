import { Link } from 'react-router-dom';

export default function HomePage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-20">
      <header className="space-y-4">
        <p className="text-caption uppercase tracking-wider text-tertiary">Sprint 0</p>
        <h1 className="font-serif text-display font-light text-primary">夢境記錄</h1>
        <p className="font-serif text-bodyLg text-secondary">
          一個專為夜晚書寫夢境與練習清明夢的私人空間。
        </p>
      </header>

      <section className="rounded-lg border border-subtle bg-raised p-5">
        <p className="text-small text-tertiary">目前可用路由</p>
        <ul className="mt-3 space-y-2">
          <li>
            <Link
              to="/dev/tokens"
              className="inline-flex min-h-touch items-center text-body text-accent-default transition-colors duration-normal hover:text-accent-hover"
            >
              /dev/tokens — 設計 token 總覽
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
