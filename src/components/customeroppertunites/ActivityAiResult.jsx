/* eslint-disable react/prop-types */
import { useState } from "react";
import { ArrowLeft, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";

export default function ActivityAiResult({ draft, preferences = [], onUse, onEdit, onRegenerate, onBackPlan }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <main className="mx-auto w-full max-w-3xl px-3 pb-10 sm:px-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-100 px-5 py-6 sm:px-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} /> Your Activity is ready</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">{draft.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{draft.questions.length} questions · review before saving</p>
        </header>
        <ol className="space-y-3 px-5 py-6 sm:px-8">
          {draft.questions.map((question, index) => {
            const preference = preferences.find((item) => item.key === question.key && item.section === question.section);
            return <li key={`${question.section}-${question.key}-${index}`} className="rounded-xl border border-slate-200 p-4 sm:p-5">
              <div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-[#313166]">{index + 1}</span><div className="min-w-0 flex-1"><p className="font-medium leading-relaxed text-slate-900">{question.question}</p>{Array.isArray(question.options) && question.options.length > 0 && <ul className="mt-3 flex flex-wrap gap-2">{question.options.map((option, optionIndex) => <li key={`${option}-${optionIndex}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{option}</li>)}</ul>}{preference && <details className="mt-3"><summary className="cursor-pointer text-sm text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">Why this question?</summary><p className="mt-2 text-sm text-slate-600">{preference.reason}</p></details>}</div></div>
            </li>;
          })}
        </ol>

        {confirming && <div className="mx-5 mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:mx-8" role="alertdialog" aria-labelledby="regenerate-title" aria-describedby="regenerate-description">
          <h2 id="regenerate-title" className="font-semibold text-amber-950">Create another AI draft?</h2><p id="regenerate-description" className="mt-1 text-sm text-amber-900">This creates another AI draft and uses your AI allowance. Your current draft will be replaced if it succeeds.</p>
          <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => { setConfirming(false); onRegenerate(); }} className="rounded-lg bg-[#313166] px-4 py-2 text-sm font-semibold text-white">Confirm regenerate</button><button type="button" onClick={() => setConfirming(false)} className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-950">Cancel</button></div>
        </div>}

        <footer className="flex flex-col gap-3 border-t border-slate-100 px-5 py-5 sm:px-8">
          <div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={onUse} className="rounded-lg bg-[#313166] px-5 py-3 text-sm font-semibold text-white hover:opacity-90">Use Activity</button><button type="button" onClick={onEdit} className="rounded-lg border border-[#313166] px-5 py-3 text-sm font-semibold text-[#313166] hover:bg-indigo-50">Edit Questions</button></div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between"><button type="button" onClick={onBackPlan} className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"><ArrowLeft size={16} />Back to plan</button><button type="button" onClick={() => setConfirming(true)} className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"><RotateCcw size={16} /><Sparkles size={14} />Regenerate</button></div>
        </footer>
      </section>
    </main>
  );
}
