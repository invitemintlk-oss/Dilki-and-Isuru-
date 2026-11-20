import React, { useEffect, useMemo, useState } from "react";
import { INVITATION } from "./invitation";
import { PREFIXES, Prefix, buildDisplayName, buildGreeting, buildInviteLink, cleanName } from "./guest";

const { brideEn, groomEn } = INVITATION.couple;

function buildMessage(displayName: string, link: string): string {
  return `${buildGreeting(displayName)}

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${groomEn} & ${brideEn}`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* Fallback for older browsers / non-HTTPS */
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  }
}

export default function Admin() {
  const [prefix, setPrefix] = useState<Prefix>("Mr.");
  const [guestName, setGuestName] = useState("");
  const [generated, setGenerated] = useState<{ displayName: string; link: string; message: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const previewName = useMemo(() => buildDisplayName(prefix, guestName), [prefix, guestName]);

  useEffect(() => {
    document.title = `Invitation Links | ${brideEn} & ${groomEn}`;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // Inputs changed after generating → the old link no longer matches
  useEffect(() => {
    setGenerated((prev) => (prev && prev.displayName !== previewName ? null : prev));
  }, [previewName]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanName(guestName)) return;

    const displayName = buildDisplayName(prefix, guestName);
    const link = buildInviteLink(window.location.origin, displayName);
    setGenerated({ displayName, link, message: buildMessage(displayName, link) });
  };

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyText(text);
    setToast(ok ? label : "Copy failed — please copy manually");
  };

  return (
    <div className="admin-page min-h-screen h-screen overflow-y-auto bg-[#f4f8f5] py-10 md:py-14 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-emerald-700/70">Invitation Link Generator</p>
          <h1 className="mt-2 text-3xl font-semibold text-emerald-900">
            {groomEn} &amp; {brideEn}
          </h1>
        </header>

        <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-slate-600">Select Prefix</span>
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value as Prefix)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {PREFIXES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 block sm:col-span-2">
              <span className="text-sm font-semibold text-slate-600">Guest Name</span>
              <input
                type="text"
                placeholder="e.g. Sanjaya"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </label>
          </div>

          <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 px-4 py-3 text-sm text-emerald-900">
            <span className="text-emerald-700/70">Greeting preview: </span>
            <span className="font-semibold">{previewName ? buildGreeting(previewName) : "—"}</span>
          </div>

          <button
            type="submit"
            disabled={!cleanName(guestName)}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-700/40 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            Generate Link
          </button>
        </form>

        <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 md:p-8 space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-600">Generated Link</p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm break-all min-h-[46px]">
              {generated ? (
                <a href={generated.link} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline underline-offset-2">
                  {generated.link}
                </a>
              ) : (
                <span className="text-slate-400">Click “Generate Link” to create a personalised link.</span>
              )}
            </div>
          </div>

          {generated && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-600">Message Preview</p>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                {generated.message}
              </pre>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!generated}
              onClick={() => generated && handleCopy(generated.link, "Link copied!")}
              className="py-3 rounded-xl border border-emerald-200 text-emerald-800 font-semibold hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              Copy Link Only
            </button>
            <button
              type="button"
              disabled={!generated}
              onClick={() => generated && handleCopy(generated.message, "Message copied!")}
              className="py-3 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-40 disabled:hover:bg-emerald-700 transition-colors"
            >
              Copy Full Message
            </button>
          </div>
        </section>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-emerald-900 text-white text-sm px-5 py-2.5 shadow-lg transition-all duration-300 ${
          toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        {toast}
      </div>
    </div>
  );
}
