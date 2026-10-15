
"use client";

import { useState, type FormEvent } from "react";

type Severity = "low" | "medium" | "high" | "critical";

type TriageResult = {
  incidentId: string;
  severity: Severity;
  team: string;
  urgent: boolean;
  summary: string;
  reasoning: string;
  status: string;
  createdAt: string;
};

const initialForm = {
  title: "Checkout service outage",
  description:
    "Checkout requests are failing with elevated 5xx errors across production.",
  source: "PagerDuty",
  service: "checkout",
  severity: "high" as Severity,
  environment: "production",
};

const inputClass =
  "w-full rounded-md border border-[#e5e2df] bg-white px-3 py-3 text-sm text-[#171717] outline-none transition placeholder:text-[#aaa39d] focus:border-[#fc8a7d] focus:ring-2 focus:ring-[#fc8a7d]/20";

const labelClass = "mb-2 block text-xs font-semibold text-[#373330]";

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

      const response = await fetch(`${apiUrl}/incidents/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.message ?? payload.error ?? "Incident triage failed.",
        );
      }

      if (!payload.data) {
        throw new Error("The API returned an empty triage result.");
      }

      setResult(payload.data as TriageResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the Nova API.",
      );
    } finally {
      setLoading(false);
    }
  }

  const severityStyles: Record<Severity, string> = {
    critical: "border-[#f4c1ba] bg-[#fff0ed] text-[#9b3f34]",
    high: "border-[#f4d0a4] bg-[#fff7e9] text-[#965a13]",
    medium: "border-[#e9dfb0] bg-[#fffbea] text-[#806c1d]",
    low: "border-[#cce5d5] bg-[#eff9f2] text-[#33744b]",
  };

  return (
    <main className="min-h-screen bg-white text-[#171717]">
      <div className="flex min-h-screen">
      

        <section className="min-w-0 flex-1">
          <header className="flex h-[65px] items-center justify-between gap-3 border-b border-[#e9e6e3] px-5 sm:px-8 lg:px-11">
            <div className="text-xs text-[#77716b]">
              Workspace <span className="mx-2 text-[#c1bcb7]">/</span>
              <span className="font-medium text-[#171717]">Incidents</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-[#e9e6e3] px-2.5 py-2 text-[10px] text-[#57534f] sm:text-xs">
              <span className="size-1.5 rounded-full bg-[#fc8a7d]" />
              API endpoint configured
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1450px] px-4 py-8 sm:px-7 lg:px-11 lg:py-12">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-3 text-[10px] font-bold tracking-[1.6px] text-[#b45e53]">
                  INCIDENT MANAGEMENT
                </p>
                <h1 className="text-3xl font-bold tracking-[-1.2px] sm:text-4xl">
                  Incident triage
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#77716b]">
                  Analyze alerts, prioritize impact, and route incidents to
                  the right team.
                </p>
              </div>
              <span className="hidden pb-1 font-mono text-[11px] tracking-wider text-[#a29c97] sm:block">
                NOVA / 01
              </span>
            </div>

            <div className="grid items-start gap-5 xl:grid-cols-[1.12fr_0.88fr]">
              <section
                id="incident-form"
                className="overflow-hidden rounded-xl border border-[#e9e6e3] bg-white"
              >
                <div className="flex items-center justify-between border-b border-[#e9e6e3] px-5 py-5 sm:px-6">
                  <div>
                    <p className="mb-2 text-[9px] font-bold tracking-[1.5px] text-[#88817b]">
                      STEP 01
                    </p>
                    <h2 className="text-base font-bold">Incoming alert</h2>
                    <p className="mt-1.5 text-xs text-[#77716b]">
                      Provide the details needed for analysis.
                    </p>
                  </div>
                  <span className="grid size-9 place-items-center rounded-lg border border-[#f1d1cc] bg-[#fff2ef] text-xl text-[#aa5a4f]">
                    +
                  </span>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="grid gap-5 px-5 py-6 sm:px-6"
                >
                  <div>
                    <label htmlFor="title" className={labelClass}>
                      Incident title
                    </label>
                    <input
                      id="title"
                      className={inputClass}
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="e.g. Checkout service outage"
                      maxLength={200}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className={labelClass}>
                      Description
                    </label>
                    <textarea
                      id="description"
                      className={`${inputClass} resize-y leading-6`}
                      value={form.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      placeholder="Describe the symptoms and impact..."
                      rows={4}
                      maxLength={10000}
                      required
                    />
                    <p className="mt-2 text-[10px] text-[#96908a]">
                      Include symptoms, impact, and relevant context.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="source" className={labelClass}>
                        Alert source
                      </label>
                      <input
                        id="source"
                        className={inputClass}
                        value={form.source}
                        onChange={(e) =>
                          updateField("source", e.target.value)
                        }
                        maxLength={100}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="service" className={labelClass}>
                        Service
                      </label>
                      <input
                        id="service"
                        className={inputClass}
                        value={form.service}
                        onChange={(e) =>
                          updateField("service", e.target.value)
                        }
                        maxLength={100}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="severity" className={labelClass}>
                        Reported severity
                      </label>
                      <select
                        id="severity"
                        className={inputClass}
                        value={form.severity}
                        onChange={(e) =>
                          updateField("severity", e.target.value)
                        }
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="environment" className={labelClass}>
                        Environment
                      </label>
                      <select
                        id="environment"
                        className={inputClass}
                        value={form.environment}
                        onChange={(e) =>
                          updateField("environment", e.target.value)
                        }
                      >
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                        <option value="development">Development</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="break-words rounded-md border border-[#f1c2bc] bg-[#fff5f3] p-3 text-xs leading-5 text-[#923c32]"
                    >
                      <p className="font-bold">Triage failed</p>
                      <p className="mt-1">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-[#fc8a7d] bg-[#fc8a7d] px-4 text-sm font-bold text-[#171717] transition hover:-translate-y-px hover:bg-[#ff9a8f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <span className="size-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                        Analyzing incident...
                      </>
                    ) : (
                      <>
                        Run AI triage <span aria-hidden="true">↗</span>
                      </>
                    )}
                  </button>

                  <p className="-mt-2 text-center text-[10px] leading-5 text-[#96908a]">
                    Analysis is performed by the Nova API using Cloudflare
                    Clef.
                  </p>
                </form>
              </section>

              <section
                aria-live="polite"
                className="min-w-0 overflow-hidden rounded-xl border border-[#e9e6e3] bg-white"
              >
                <div className="flex items-center justify-between border-b border-[#e9e6e3] px-5 py-5 sm:px-6">
                  <div>
                    <p className="mb-2 text-[9px] font-bold tracking-[1.5px] text-[#88817b]">
                      STEP 02
                    </p>
                    <h2 className="text-base font-bold">Triage result</h2>
                    <p className="mt-1.5 text-xs text-[#77716b]">
                      Classification and routing recommendation.
                    </p>
                  </div>
                  <span className="grid size-9 place-items-center rounded-lg border border-[#f1d1cc] bg-[#fff2ef] text-lg text-[#aa5a4f]">
                    ↗
                  </span>
                </div>

                {!result && !loading && (
                  <div className="px-6 py-10 sm:px-7">
                    <div className="mb-6 grid size-12 place-items-center rounded-xl border border-[#f1d1cc] bg-[#fff2ef] text-2xl text-[#b45e53]">
                      +
                    </div>
                    <h3 className="text-base font-bold">
                      Waiting for an incident
                    </h3>
                    <p className="mb-7 mt-2 max-w-sm text-xs leading-6 text-[#77716b]">
                      Submit an alert to see its severity, urgency, owning
                      team, and triage summary here.
                    </p>
                    <div className="border-t border-[#e9e6e3]">
                      <div className="flex justify-between gap-3 border-b border-[#f0eeec] py-4">
                        <span className="text-[9px] font-bold tracking-wider text-[#928b85]">
                          ENGINE
                        </span>
                        <span className="text-right text-[11px]">
                          Cloudflare Clef
                        </span>
                      </div>
                      <div className="flex justify-between gap-3 py-4">
                        <span className="text-[9px] font-bold tracking-wider text-[#928b85]">
                          OUTPUT
                        </span>
                        <span className="text-right text-[11px]">
                          Structured assessment
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
                    <span className="mb-6 size-8 animate-spin rounded-full border-[3px] border-[#f4d2cd] border-t-[#fc8a7d]" />
                    <h3 className="font-bold">Analyzing alert</h3>
                    <p className="mt-2 max-w-xs text-xs leading-6 text-[#77716b]">
                      Evaluating urgency, severity, and team ownership.
                    </p>
                  </div>
                )}

                {result && (
                  <div className="px-5 py-6 sm:px-6">
                    <div className="mb-7 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded border px-2.5 py-1.5 text-[9px] font-extrabold tracking-wider ${
                          severityStyles[result.severity] ??
                          severityStyles.medium
                        }`}
                      >
                        {result.severity.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded border border-[#e9e5e1] bg-[#faf9f8] px-2.5 py-1.5 text-[10px] font-semibold text-[#56504b]">
                        <span
                          className={`size-1.5 rounded-full ${
                            result.urgent ? "bg-[#d45e50]" : "bg-[#6d9c7b]"
                          }`}
                        />
                        {result.urgent ? "Urgent" : "Not urgent"}
                      </span>
                    </div>

                    <div className="pb-6">
                      <p className="mb-2 text-[9px] font-bold tracking-[1.4px] text-[#88817b]">
                        ASSIGNED TEAM
                      </p>
                      <h3 className="text-2xl font-bold tracking-tight capitalize">
                        {result.team}
                      </h3>
                      <p className="mt-1 text-[11px] text-[#77716b]">
                        Recommended incident owner
                      </p>
                    </div>

                    <div className="border-t border-[#e9e6e3] pt-6">
                      <div className="mb-6">
                        <p className="mb-2 text-[9px] font-bold tracking-[1.4px] text-[#88817b]">
                          SUMMARY
                        </p>
                        <p className="break-words text-sm font-semibold leading-6">
                          {result.summary}
                        </p>
                      </div>

                      <div className="mb-6">
                        <p className="mb-2 text-[9px] font-bold tracking-[1.4px] text-[#88817b]">
                          ASSESSMENT
                        </p>
                        <p className="break-words text-xs leading-6 text-[#77716b]">
                          {result.reasoning}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-y border-[#e9e6e3] py-5">
                      <div>
                        <p className="mb-2 text-[9px] font-bold tracking-wider text-[#88817b]">
                          STATUS
                        </p>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold capitalize">
                          <span className="size-2 rounded-full bg-emerald-600" />
                          {result.status}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="mb-2 text-[9px] font-bold tracking-wider text-[#88817b]">
                          INCIDENT ID
                        </p>
                        <p
                          title={result.incidentId}
                          className="truncate font-mono text-xs"
                        >
                          {result.incidentId.slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 text-[10px] text-[#98918b]">
                      Analyzed{" "}
                      {new Date(result.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                )}
              </section>
            </div>

            <footer className="mt-8 flex flex-wrap justify-between gap-3 border-t border-[#e9e6e3] pt-5 text-[9px] tracking-wider text-[#99928c]">
              <span>NOVA INCIDENT INTELLIGENCE</span>
              <span>Built for reliable operations</span>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
