import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 bg-gradient-to-br from-orange-50 via-white to-cyan-50">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-8 px-6 py-16">
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            LOGRES CALC
          </h1>
          <p className="text-sm font-semibold tracking-[0.2em] text-slate-500">剣と魔法のログレス -いにしえの女神- 計算機</p>
          <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            こちらはiOS/Android/Windows(Andapp)向けゲーム『剣と魔法のログレス -いにしえの女神-』非公式ウェブサービスです。<br />
            現時点ではダメージ火力リミット計算機(デスペラード版)のみを実装しています。
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Link
            href="/calc/desperado"
            className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-orange-500"
          >
            デスペラード版
          </Link>
          <Link
            href="/calc"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-4 text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            計算機ページへ移動<br />
            (※デスペラード版のページへリダイレクト)
          </Link>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white/80 p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">今後の開発予定</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>・トップページとダメージ火力リミット計算機ページのUI調整</li>
            <li>・【随時】他の武器などの実装</li>
            <li>・『古代機鋼兵』など他ジョブ版のダメージ火力リミット計算機ページの実装</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
