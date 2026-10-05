/* eslint-disable react/prop-types */
import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Plus, Sparkles, X } from "lucide-react";
import api from "../../api/apiconfig";
import { generateActivityDraft, planActivity } from "./activityAiApi";
import ActivityAiResult from "./ActivityAiResult";
import {
  ACTIVITY_AI_LANGUAGES,
  AUDIENCE_SUGGESTIONS,
  PURPOSE_CATEGORIES,
  buildPlanPayload,
  generationErrorMessage,
  moveItem,
  planErrorMessage,
  resolveGenerationAttempt,
  toggleAudience,
  validateWizardStep,
} from "./activityAiWizardUtils";

const initialValues = {
  purposeCategory: "",
  purposeText: "",
  audience: [],
  customAudience: "",
  goal: "",
  questionCount: 5,
  customCount: null,
  language: "English",
  instructions: "",
};

const steps = ["Purpose & audience", "Your goal", "Questions & language", "Review plan"];

function PreferenceRow({ item, index, total, onRemove, onMove }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-[#313166]">{index + 1}</span>
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-slate-800">{item.label}</h4>
        <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{sourceLabel(item.source)}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" aria-label={`Move ${item.label} up`} disabled={index === 0} onClick={() => onMove(index, -1)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-30"><ArrowUp size={17} /></button>
        <button type="button" aria-label={`Move ${item.label} down`} disabled={index === total - 1} onClick={() => onMove(index, 1)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-30"><ArrowDown size={17} /></button>
        <button type="button" aria-label={`Remove ${item.label}`} onClick={() => onRemove(item)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"><X size={17} /></button>
      </div>
    </li>
  );
}

function sourceLabel(source) {
  return ({ EXPLICIT: "Specifically requested", PURPOSE_RELEVANT: "Relevant to your purpose", PROFILE_GAP: "Useful profile insight" })[source] || "Recommended";
}

export default function ActivityAiWizard({ onCancel, onUseActivity }) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [plan, setPlan] = useState(null);
  const [selected, setSelected] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [audienceSearch, setAudienceSearch] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const generationLock = useRef(false);
  const generationAttempt = useRef(null);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (["purposeCategory", "purposeText", "audience", "goal", "questionCount", "language", "instructions"].includes(field)) {
      setPlan(null);
    }
  };

  const filteredAudiences = useMemo(() => AUDIENCE_SUGGESTIONS.filter((item) => item.toLowerCase().includes(audienceSearch.toLowerCase())), [audienceSearch]);
  const filteredLanguages = useMemo(() => ACTIVITY_AI_LANGUAGES.filter((item) => `${item.label} ${item.value}`.toLowerCase().includes(languageSearch.toLowerCase())), [languageSearch]);

  const validate = () => {
    const nextErrors = validateWizardStep(step, values);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const addCustomAudience = () => {
    const custom = values.customAudience.trim();
    if (!custom) return;
    if (!values.audience.some((item) => item.toLowerCase() === custom.toLowerCase())) {
      setField("audience", [...values.audience, custom]);
    }
    setValues((current) => ({ ...current, customAudience: "" }));
  };

  const requestPlan = async () => {
    if (!validate()) return;
    setLoading(true);
    setFormError("");
    setStep(4);
    try {
      const response = await planActivity(api, buildPlanPayload(values));
      const result = response.data;
      setPlan(result);
      setSelected(Array.isArray(result.preferences) ? result.preferences : []);
      setAlternatives(Array.isArray(result.eligibleAlternatives) ? result.eligibleAlternatives : []);
      setGeneratedDraft(null);
      generationAttempt.current = null;
      setFormError("");
    } catch (error) {
      setFormError(planErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const requestGeneration = async ({ newAttempt = false } = {}) => {
    if (generationLock.current || selected.length === 0 || !plan || plan.status !== "READY") return;
    generationLock.current = true;
    setIsGenerating(true);
    setFormError("");
    setGeneratedDraft(null);
    const context = buildPlanPayload(values);
    const payload = {
      ...context,
      questionCount: selected.length,
      reviewedPlan: {
        planVersion: plan.planVersion,
        catalogueFingerprint: plan.catalogueFingerprint,
        requestedQuestionCount: plan.requestedQuestionCount,
        selections: selected.map(({ key, section }) => ({ key, section })),
      },
    };
    generationAttempt.current = resolveGenerationAttempt(payload, generationAttempt.current, { newAttempt });

    try {
      const response = await generateActivityDraft(api, generationAttempt.current.payload, generationAttempt.current.key);
      const draft = response.data?.draft;
      if (!draft || !Array.isArray(draft.questions) || draft.questions.length === 0) {
        throw new Error("Vadik did not return an Activity draft. Please try again.");
      }
      setGeneratedDraft(draft);
      setFormError("");
    } catch (error) {
      const stale = error?.response?.status === 409 && error?.response?.data?.code === "AI_ACTIVITY_PLAN_STALE";
      setFormError(generationErrorMessage(error));
      if (stale) {
        setPlan(null);
        setSelected([]);
        setAlternatives([]);
        generationAttempt.current = null;
      }
    } finally {
      generationLock.current = false;
      setIsGenerating(false);
    }
  };

  const handoffGeneratedActivity = (focusQuestions) => {
    if (!generatedDraft) return;
    onUseActivity?.(generatedDraft, focusQuestions);
  };

  const continueStep = () => {
    if (!validate()) return;
    if (step < 3) setStep(step + 1);
    else requestPlan();
  };

  const updateSelected = (next) => {
    generationAttempt.current = null;
    setFormError("");
    setSelected(next);
    const chosen = new Set(next.map(({ section, key }) => `${section}\u0000${key}`));
    setAlternatives((current) => [
      ...current.filter((item) => !chosen.has(`${item.section}\u0000${item.key}`)),
      ...selected.filter((item) => !next.some((entry) => entry.section === item.section && entry.key === item.key)),
    ]);
  };

  const addAlternative = (item) => {
    if (selected.length >= Number(values.questionCount)) return;
    if (selected.some((entry) => entry.section === item.section && entry.key === item.key)) return;
    generationAttempt.current = null;
    setFormError("");
    setSelected((current) => [...current, item]);
    setAlternatives((current) => current.filter((entry) => !(entry.section === item.section && entry.key === item.key)));
  };

  const understood = plan?.understoodIntent || {};
  const isClarification = plan?.status === "NEEDS_CLARIFICATION";

  if (generatedDraft) {
    return <ActivityAiResult
      draft={generatedDraft}
      preferences={selected}
      onUse={() => handoffGeneratedActivity(false)}
      onEdit={() => handoffGeneratedActivity(true)}
      onRegenerate={() => requestGeneration({ newAttempt: true })}
      onBackPlan={() => setGeneratedDraft(null)}
    />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-3 pb-10 sm:px-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-100 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#313166]"><Sparkles size={21} /></span><div><p className="text-xs font-semibold uppercase tracking-wide text-[#55558a]">Build with AI</p><h1 className="text-lg font-semibold text-slate-900">Plan your Activity</h1></div></div>
          <ol aria-label="Activity wizard progress" className="mt-6 grid grid-cols-4 gap-2">
            {steps.map((label, index) => <li key={label} aria-current={step === index + 1 ? "step" : undefined} className="min-w-0"><div className={`h-1.5 rounded-full ${step >= index + 1 ? "bg-[#313166]" : "bg-slate-100"}`} /><span className={`mt-2 hidden truncate text-xs sm:block ${step === index + 1 ? "font-semibold text-[#313166]" : "text-slate-500"}`}>{label}</span></li>)}
          </ol>
        </header>

        <div className="px-5 py-6 sm:px-8 sm:py-8" aria-live={loading ? "polite" : undefined}>
          {loading ? <div className="py-16 text-center" role="status"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-[#313166]"><Sparkles size={24} /></span><h2 className="mt-4 text-xl font-semibold text-slate-900">Vadik is planning your Activityâ€¦</h2><p className="mt-2 text-sm text-slate-600">Matching your goal with useful customer insights.</p></div> : null}
          {isGenerating ? <div className="py-16 text-center" role="status"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-[#313166]"><Sparkles size={24} /></span><h2 className="mt-4 text-xl font-semibold text-slate-900">Vadik is creating your Activityâ€¦</h2><p className="mt-2 text-sm text-slate-600">Turning your approved customer insights into clear, engaging questions.</p></div> : null}

          {!loading && !isGenerating && step === 1 && <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">What are you creating this Activity for?</h2>
            <p className="mt-2 text-slate-600">Choose a starting point, then add your own description.</p>
            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Purpose category">
              {PURPOSE_CATEGORIES.map((category) => <button key={category} type="button" aria-pressed={values.purposeCategory === category} onClick={() => setField("purposeCategory", values.purposeCategory === category ? "" : category)} className={`rounded-full border px-3.5 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${values.purposeCategory === category ? "border-[#313166] bg-indigo-50 text-[#313166]" : "border-slate-200 text-slate-700 hover:border-slate-400"}`}>{category}</button>)}
            </div>
            <label htmlFor="activity-purpose" className="mt-6 block text-sm font-medium text-slate-800">Your purpose</label>
            <input id="activity-purpose" value={values.purposeText} onChange={(event) => setField("purposeText", event.target.value)} placeholder="For example, Diwali sale and wishes" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" aria-invalid={Boolean(errors.purpose)} aria-describedby={errors.purpose ? "purpose-error" : undefined} />
            {errors.purpose && <p id="purpose-error" className="mt-2 text-sm text-red-700">{errors.purpose}</p>}

            <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-semibold text-slate-900">Who is this Activity for?</h3><p className="mt-1 text-sm text-slate-600">This helps Vadik shape the Activity; it does not choose recipients.</p>
              <label htmlFor="audience-search" className="sr-only">Search audience context</label><input id="audience-search" value={audienceSearch} onChange={(event) => setAudienceSearch(event.target.value)} placeholder="Search audiences" className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Audience context">{filteredAudiences.map((item) => <button key={item} type="button" aria-pressed={values.audience.includes(item)} onClick={() => setField("audience", toggleAudience(values.audience, item))} className={`rounded-full border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 ${values.audience.includes(item) ? "border-[#313166] bg-indigo-50 text-[#313166]" : "border-slate-200 text-slate-700"}`}>{values.audience.includes(item) && <Check size={14} className="mr-1 inline" />}{item}</button>)}</div>
              <div className="mt-3 flex gap-2"><label htmlFor="custom-audience" className="sr-only">Add custom audience context</label><input id="custom-audience" value={values.customAudience} onChange={(event) => setValues((current) => ({ ...current, customAudience: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomAudience(); } }} placeholder="Add custom audience" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" /><button type="button" onClick={addCustomAudience} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Plus size={16} /> Add</button></div>
              {values.audience.length > 0 && <div className="mt-3 flex flex-wrap gap-2" aria-label="Selected audience context">{values.audience.map((item) => <button key={item} type="button" onClick={() => setField("audience", values.audience.filter((value) => value !== item))} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">{item} <span aria-hidden="true">Ã—</span><span className="sr-only">Remove {item}</span></button>)}</div>}
            </div>
          </div>}

          {!loading && !isGenerating && step === 2 && <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">What do you want this Activity to achieve?</h2><p className="mt-2 text-slate-600">Describe the outcome and what you want to learn about customers.</p>
            <label htmlFor="activity-goal" className="sr-only">Activity goal</label><textarea id="activity-goal" autoFocus rows={6} value={values.goal} onChange={(event) => setField("goal", event.target.value)} placeholder="Give Diwali wishes and collect customersâ€™ dates of birth." className="mt-6 w-full resize-y rounded-xl border border-slate-300 px-4 py-4 text-base leading-relaxed focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" aria-invalid={Boolean(errors.goal)} aria-describedby={errors.goal ? "goal-error" : undefined} />
            {errors.goal && <p id="goal-error" className="mt-2 text-sm text-red-700">{errors.goal}</p>}
            <p className="mt-5 text-sm font-medium text-slate-700">Examples</p><div className="mt-2 flex flex-col items-start gap-2">{["Give festive wishes and learn what customers enjoy", "Collect birthdays for special offers", "Get feedback on our latest products"].map((example) => <button type="button" key={example} onClick={() => setField("goal", example)} className="text-left text-sm text-[#45457a] underline decoration-indigo-200 underline-offset-4 hover:text-[#313166]">{example}</button>)}</div>
          </div>}

          {!loading && !isGenerating && step === 3 && <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Set up your questions</h2><p className="mt-2 text-slate-600">Vadik prioritizes what you requested, then adds relevant insights when suitable.</p>
            <fieldset className="mt-7"><legend className="text-lg font-semibold text-slate-900">How many questions should Vadik prepare?</legend><div className="mt-3 flex flex-wrap gap-2">{[1, 3, 5, 7].map((count) => <button key={count} type="button" aria-pressed={Number(values.questionCount) === count && values.customCount === null} onClick={() => { setField("questionCount", count); setValues((current) => ({ ...current, customCount: null })); }} className={`min-w-14 rounded-lg border px-5 py-3 font-semibold ${Number(values.questionCount) === count && values.customCount === null ? "border-[#313166] bg-indigo-50 text-[#313166]" : "border-slate-200 text-slate-700"}`}>{count}</button>)}<button type="button" aria-pressed={values.customCount !== null} onClick={() => setValues((current) => ({ ...current, customCount: current.customCount ?? String(current.questionCount) }))} className={`rounded-lg border px-4 py-3 text-sm font-medium ${values.customCount !== null ? "border-[#313166] bg-indigo-50 text-[#313166]" : "border-slate-200 text-slate-700"}`}>Custom</button></div>
              {values.customCount !== null && <label htmlFor="custom-count" className="mt-3 block max-w-xs text-sm font-medium text-slate-700">Custom count (1â€“10)<input id="custom-count" type="number" min="1" max="10" value={values.customCount} onChange={(event) => { setValues((current) => ({ ...current, customCount: event.target.value, questionCount: event.target.value })); setPlan(null); }} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" aria-invalid={Boolean(errors.questionCount)} /></label>}
              {errors.questionCount && <p className="mt-2 text-sm text-red-700">{errors.questionCount}</p>}
            </fieldset>
            <div className="mt-8"><label htmlFor="activity-language-search" className="block text-lg font-semibold text-slate-900">Language</label><p className="mt-1 text-sm text-slate-600">Choose the language for customer-facing questions.</p><input id="activity-language-search" value={languageSearch} onChange={(event) => setLanguageSearch(event.target.value)} placeholder="Search available languages" className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" /><div className="mt-2 grid gap-2 sm:grid-cols-3" role="group" aria-label="Language">{filteredLanguages.map((language) => <button key={language.value} type="button" aria-pressed={values.language === language.value} onClick={() => setField("language", language.value)} className={`rounded-lg border px-4 py-3 text-left text-sm ${values.language === language.value ? "border-[#313166] bg-indigo-50 font-semibold text-[#313166]" : "border-slate-200 text-slate-700"}`}>{language.label}</button>)}</div>{errors.language && <p className="mt-2 text-sm text-red-700">{errors.language}</p>}</div>
            <div className="mt-8 rounded-xl bg-slate-50 p-4"><button type="button" aria-expanded={instructionsOpen} onClick={() => setInstructionsOpen((current) => !current)} className="text-left text-sm font-semibold text-slate-800">Anything else Vadik should know? <span className="font-normal text-slate-500">Optional</span></button>{instructionsOpen ? <><label htmlFor="activity-instructions" className="sr-only">Optional instructions</label><textarea id="activity-instructions" rows={3} value={values.instructions} onChange={(event) => setField("instructions", event.target.value)} placeholder="Keep it festive and friendly. Avoid very personal questions." className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" /><button type="button" onClick={() => { setField("instructions", ""); setInstructionsOpen(false); }} className="mt-2 text-sm text-slate-600 underline">Skip instructions</button></> : <p className="mt-1 text-sm text-slate-500">You can skip this or add a tone or context note.</p>}</div>
          </div>}

          {!loading && !isGenerating && step === 4 && <div>
            {isClarification ? <><h2 className="text-2xl font-semibold text-slate-900">We need a little more detail before planning</h2><p className="mt-3 rounded-xl bg-amber-50 p-4 text-slate-700">{plan.clarification || "Please add a little more detail about what you want to learn."}</p><button type="button" onClick={() => setStep(2)} className="mt-5 rounded-lg bg-[#313166] px-5 py-3 font-medium text-white">Update goal</button></> : plan ? <>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Review your Activity plan</h2><p className="mt-2 text-slate-600">Check what Vadik understood before moving on.</p>
              <dl className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">{[["Purpose", buildPlanPayload(values).purpose], ["Audience context", values.audience.join(" Â· ") || "Not specified"], ["Goal", values.goal], ["Questions requested", String(values.questionCount)], ["Language", values.language]].map(([label, value]) => <div key={label}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm text-slate-800">{value}</dd></div>)}</dl><p className="mt-2 text-xs text-slate-500">Audience provides context only. Recipient selection happens when you send the Activity.</p>
              <div className="mt-7"><h3 className="text-lg font-semibold text-slate-900">What Vadik understood</h3><div className="mt-3 space-y-2">{(understood.campaignContext || []).map((item, index) => <p key={`campaign-${index}`} className="flex gap-2 text-sm text-slate-700"><Check className="mt-0.5 shrink-0 text-emerald-700" size={17} />{item}</p>)}{(understood.requestedInformation || []).map((item, index) => <p key={`requested-${index}`} className="flex gap-2 text-sm text-slate-700"><Check className="mt-0.5 shrink-0 text-emerald-700" size={17} />{item}</p>)}</div></div>
              {(plan.unsupportedIntent || []).length > 0 && <div role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><h3 className="font-medium text-amber-950">Some information could not be matched</h3>{plan.unsupportedIntent.map((item, index) => <p key={`${item}-${index}`} className="mt-1 text-sm text-amber-900">We couldnâ€™t match â€œ{item}â€ to an available customer preference.</p>)}</div>}
              <div className="mt-7"><div className="flex flex-wrap items-end justify-between gap-2"><div><h3 className="text-lg font-semibold text-slate-900">Recommended questions</h3><p className="mt-1 text-sm text-slate-600">{selected.length} of {values.questionCount} requested</p></div></div>
                {(plan.shortfall || selected.length < Number(values.questionCount)) && <p className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-950">Vadik found {selected.length} suitable questions from your available customer preferences.</p>}
                {selected.length ? <ol className="mt-3 space-y-3">{selected.map((item, index) => <PreferenceRow key={`${item.section}-${item.key}`} item={item} index={index} total={selected.length} onRemove={(removed) => updateSelected(selected.filter((entry) => !(entry.section === removed.section && entry.key === removed.key)))} onMove={(from, direction) => { generationAttempt.current = null; setFormError(""); setSelected((current) => moveItem(current, from, direction)); }} />)}</ol> : <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No supported questions are available yet.</p>}
              </div>
              {alternatives.length > 0 && selected.length < Number(values.questionCount) && <div className="mt-5"><label htmlFor="add-insight" className="block text-sm font-semibold text-slate-800">Add another insight</label><select id="add-insight" defaultValue="" onChange={(event) => { const item = alternatives[Number(event.target.value)]; if (item) addAlternative(item); event.target.value = ""; }} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"><option value="" disabled>Select an available recommendation</option>{alternatives.map((item, index) => <option key={`${item.section}-${item.key}`} value={index}>{item.label} â€” {sourceLabel(item.source)}</option>)}</select></div>}
              {plan.questionCountLimitNotice && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{plan.questionCountLimitNotice}</p>}
              <div className="mt-7 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4"><h3 className="font-semibold text-slate-900">Your plan is ready</h3><p className="mt-1 text-sm text-slate-600">Generate the Activity when youâ€™re ready. Generation uses your AI allowance.</p><button type="button" onClick={() => requestGeneration({ newAttempt: true })} disabled={selected.length === 0} className="mt-4 w-full rounded-lg bg-[#313166] px-5 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">Generate Activity</button></div>
            </> : <><h2 className="text-2xl font-semibold text-slate-900">Plan your Activity</h2><p className="mt-2 text-slate-600">{formError || "Your plan has not been loaded."}</p><button type="button" onClick={requestPlan} className="mt-4 rounded-lg bg-[#313166] px-5 py-3 text-sm font-semibold text-white">{formError ? "Review updated plan" : "Create plan"}</button></>}
            {formError && plan && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{formError}<div className="mt-2 flex flex-wrap gap-3"><button type="button" onClick={() => requestGeneration()} className="font-semibold underline">Retry this request</button><button type="button" onClick={() => requestGeneration({ newAttempt: true })} className="font-semibold underline">Start a new generation</button></div></div>}
          </div>}
        </div>

        {!loading && !isGenerating && <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <button type="button" onClick={() => step === 1 ? onCancel?.() : setStep((current) => Math.max(1, current - 1))} className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"><ArrowLeft size={16} />{step === 1 ? "Cancel" : "Back"}</button>
          {step < 4 && <button type="button" onClick={continueStep} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#313166] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{step === 3 ? "Review Activity Plan" : "Continue"}<ArrowRight size={16} /></button>}
          {step === 4 && !isClarification && <button type="button" onClick={() => { setPlan(null); setStep(3); }} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Adjust plan</button>}
        </footer>}
      </section>
    </main>
  );
}
