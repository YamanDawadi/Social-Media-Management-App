import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function GeminiStatusIndicator() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkApiKey() {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setHasKey(data.hasApiKey);
      } catch (e) {
        setHasKey(false);
      } finally {
        setChecking(false);
      }
    }
    checkApiKey();
  }, []);

  if (checking) {
    return (
      <div id="gemini-status-loading" className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
        <div className="w-2 h-2 rounded-full bg-neutral-500 animate-pulse" />
        Syncing CRM Copilot status...
      </div>
    );
  }

  return (
    <div
      id="gemini-status-container"
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-mono select-none ${
        hasKey
          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
          : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
      }`}
    >
      {hasKey ? (
        <>
          <CheckCircle2 id="gemini-icon-checked" className="w-3.5 h-3.5 text-emerald-400" />
          <span>Gemini AI Connected</span>
        </>
      ) : (
        <>
          <AlertCircle id="gemini-icon-alert" className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Gemini Demo Mode (Setup API Secret)</span>
        </>
      )}
    </div>
  );
}
