'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BroadcastLang,
  BroadcastRecipient,
  groupRecipients,
  renderBroadcastHtml,
  fillPlaceholders,
} from '@/lib/broadcast';

interface TreePin {
  id: number;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  tree_label: string;
  zone_id: number | null;
  zone_name: string | null;
  tree_type_id: number | null;
  tree_type_name: string | null;
  tree_exists: boolean;
  lang: BroadcastLang | null;
  created_at: string;
}

interface Broadcast {
  id: number;
  subject_el: string | null;
  subject_en: string | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

type Mode = 'selected' | 'all' | 'filter';
type Content = Record<BroadcastLang, { subject: string; body: string }>;

const CHUNK_SIZE = 50;
const PRESELECT_KEY = 'emailer:pinIds';

const TEMPLATES: { name: string; content: Content }[] = [
  {
    name: '💧 Υπενθύμιση ποτίσματος',
    content: {
      el: {
        subject: '💧 Ώρα να ποτίσεις το δέντρο σου!',
        body:
          'Ο καιρός ζεσταίνεται και τα δέντρα μας διψούν. Θυμήσου να ποτίσεις τα δέντρα που έχεις υιοθετήσει: {tree_labels}.\n\n' +
          'Οδηγίες ποτίσματος: https://mytree.epi-thermi.gr/guide\n\nΕυχαριστούμε που φροντίζεις την πόλη μας!',
      },
      en: {
        subject: '💧 Time to water your tree!',
        body:
          'The weather is getting warmer and our trees are thirsty. Please remember to water the trees you adopted: {tree_labels}.\n\n' +
          'Watering guide: https://mytree.epi-thermi.gr/guide\n\nThank you for caring for our town!',
      },
    },
  },
  {
    name: '🌱 Νέα για τη φύτευση',
    content: {
      el: {
        subject: '🌱 Νέα για την υιοθεσία σου',
        body: 'Έχουμε νέα για τα δέντρα σου ({tree_labels}).\n\n[Γράψε εδώ το μήνυμά σου]\n\nΕυχαριστούμε!',
      },
      en: {
        subject: '🌱 News about your adoption',
        body: 'We have news about your trees ({tree_labels}).\n\n[Write your message here]\n\nThank you!',
      },
    },
  },
];

const EMPTY_CONTENT: Content = { el: { subject: '', body: '' }, en: { subject: '', body: '' } };

export default function AdminEmailsPage() {
  const [pins, setPins] = useState<TreePin[]>([]);
  const [optedOut, setOptedOut] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preselectedIds, setPreselectedIds] = useState<number[]>([]);
  const [mode, setMode] = useState<Mode>('all');
  const [onlyToPlant, setOnlyToPlant] = useState(false);
  const [onlyNoPhone, setOnlyNoPhone] = useState(false);
  const [zoneFilter, setZoneFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const [content, setContent] = useState<Content>(EMPTY_CONTENT);
  const [activeLang, setActiveLang] = useState<BroadcastLang>('el');
  const [fallback, setFallback] = useState<'skip' | 'other'>('skip');

  const [testedKey, setTestedKey] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [summary, setSummary] = useState<{ sent: number; failed: number; skippedOptOut: number; skippedNoText: number; failedEmails: string[] } | null>(null);

  const loadHistory = async () => {
    const res = await fetch('/api/emails/history');
    if (res.ok) setHistory(await res.json());
  };

  useEffect(() => {
    (async () => {
      try {
        const [pinsRes, optRes] = await Promise.all([fetch('/api/pins'), fetch('/api/emails/optouts')]);
        if (optRes.status === 401) {
          window.location.href = '/admin/login?returnUrl=/admin/emails';
          return;
        }
        if (!pinsRes.ok || !optRes.ok) throw new Error('Αποτυχία φόρτωσης δεδομένων');
        setPins(await pinsRes.json());
        setOptedOut(new Set((await optRes.json()) as string[]));
        await loadHistory();

        try {
          const raw = sessionStorage.getItem(PRESELECT_KEY);
          if (raw) {
            const ids = JSON.parse(raw) as number[];
            if (Array.isArray(ids) && ids.length > 0) {
              setPreselectedIds(ids);
              setMode('selected');
            }
          }
        } catch {
          // sessionStorage unavailable, ignore
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // One recipient per email, using ALL of the adopter's trees for the placeholders
  const allRecipients = useMemo(() => groupRecipients(pins), [pins]);

  const candidateEmails = useMemo(() => {
    let list = pins;
    if (mode === 'selected') {
      const ids = new Set(preselectedIds);
      list = list.filter(p => ids.has(p.id));
    } else if (mode === 'filter') {
      list = list.filter(p =>
        (!onlyToPlant || !p.tree_exists) &&
        (!onlyNoPhone || !p.user_phone?.trim()) &&
        (!zoneFilter || String(p.zone_id) === zoneFilter) &&
        (!typeFilter || String(p.tree_type_id) === typeFilter)
      );
    }
    return new Set(list.map(p => p.user_email.trim().toLowerCase()));
  }, [pins, mode, preselectedIds, onlyToPlant, onlyNoPhone, zoneFilter, typeFilter]);

  const candidates = allRecipients.filter(r => candidateEmails.has(r.email.toLowerCase()));
  const optedOutCount = candidates.filter(r => optedOut.has(r.email.toLowerCase())).length;
  const recipients = candidates.filter(
    r => !optedOut.has(r.email.toLowerCase()) && !excluded.has(r.email.toLowerCase())
  );

  const zones = useMemo(() => {
    const m = new Map<number, string>();
    pins.forEach(p => p.zone_id && p.zone_name && m.set(p.zone_id, p.zone_name));
    return Array.from(m.entries());
  }, [pins]);
  const types = useMemo(() => {
    const m = new Map<number, string>();
    pins.forEach(p => p.tree_type_id && p.tree_type_name && m.set(p.tree_type_id, p.tree_type_name));
    return Array.from(m.entries());
  }, [pins]);

  const hasText = (l: BroadcastLang) => !!content[l].subject.trim() && !!content[l].body.trim();
  const countByLang = (l: BroadcastLang) => recipients.filter(r => r.lang === l).length;
  const missingLangCount = (['el', 'en'] as BroadcastLang[])
    .filter(l => !hasText(l))
    .reduce((n, l) => n + countByLang(l), 0);
  const nothingToSend = recipients.length === 0 || (!hasText('el') && !hasText('en'));
  const contentKey = JSON.stringify(content);
  const testDone = testedKey === contentKey;
  const needsTest = recipients.length > 1 && !testDone;

  const sample: BroadcastRecipient =
    recipients.find(r => r.lang === activeLang) ??
    recipients[0] ??
    { email: 'sample@example.com', name: 'Μαρία', lang: activeLang, treeCount: 2, treeLabels: ['Πλάτανος', 'Ελιά'] };
  const previewHtml = renderBroadcastHtml(
    activeLang,
    content[activeLang].body || '…',
    sample,
    '#'
  );

  const updateContent = (lang: BroadcastLang, field: 'subject' | 'body', value: string) =>
    setContent(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));

  const applyTemplate = (t: Content) => {
    if ((content.el.body || content.en.body) && !confirm('Το τρέχον κείμενο θα αντικατασταθεί. Συνέχεια;')) return;
    setContent(t);
  };

  const toggleExcluded = (email: string) => {
    const key = email.toLowerCase();
    setExcluded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const sendTest = async () => {
    setTestStatus('Αποστολή δοκιμαστικού...');
    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: { lang: activeLang }, content }),
      });
      const data = await res.json();
      if (!res.ok || data.failed) throw new Error(data.error || data.results?.[0]?.error || 'Αποτυχία');
      setTestedKey(contentKey);
      setTestStatus('✓ Το δοκιμαστικό στάλθηκε στο ADMIN_EMAIL');
    } catch (err: any) {
      setTestStatus('Σφάλμα: ' + err.message);
    }
  };

  const sendBroadcast = async () => {
    const toSend = recipients.filter(r => hasText(r.lang) || (fallback === 'other' && hasText(r.lang === 'el' ? 'en' : 'el')));
    if (!confirm(
      `Αποστολή σε ${toSend.length} παραλήπτες (EL: ${countByLang('el')}, EN: ${countByLang('en')});\n\n` +
      `Θέμα (EL): ${content.el.subject || '—'}\nΘέμα (EN): ${content.en.subject || '—'}`
    )) return;

    setSending(true);
    setSummary(null);
    const total = recipients.length;
    setProgress({ done: 0, total });

    const pinIdsByEmail = new Map<string, number[]>();
    pins.forEach(p => {
      const k = p.user_email.trim().toLowerCase();
      pinIdsByEmail.set(k, [...(pinIdsByEmail.get(k) ?? []), p.id]);
    });

    const totals = { sent: 0, failed: 0, skippedOptOut: 0, skippedNoText: 0, failedEmails: [] as string[] };
    let broadcastId: number | undefined;

    try {
      for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
        const chunk = recipients.slice(i, i + CHUNK_SIZE);
        const pinIds = chunk.flatMap(r => pinIdsByEmail.get(r.email.toLowerCase()) ?? []);
        const res = await fetch('/api/emails/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pinIds, content, fallback, broadcastId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Αποτυχία αποστολής');
        broadcastId = data.broadcastId;
        totals.sent += data.sent;
        totals.failed += data.failed;
        totals.skippedOptOut += data.skippedOptOut;
        totals.skippedNoText += data.skippedNoText;
        totals.failedEmails.push(...data.results.filter((r: any) => !r.ok).map((r: any) => r.email));
        setProgress({ done: Math.min(i + CHUNK_SIZE, total), total });
      }
    } catch (err: any) {
      alert('Η αποστολή διακόπηκε: ' + err.message);
    } finally {
      setSummary(totals);
      setSending(false);
      loadHistory();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Φόρτωση...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">Σφάλμα: {error}</div>;

  const inputCls = 'w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">✉️ Μαζική Αποστολή Email</h1>
            <p className="text-gray-600">Στείλε μήνυμα σε επιλεγμένους ή σε όλους τους υιοθέτες</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">
            Πίσω στον Πίνακα
          </Link>
        </div>

        {/* 1. Recipients */}
        <section className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold">1. Παραλήπτες</h2>

          <div className="flex flex-wrap gap-4 text-sm">
            {preselectedIds.length > 0 && (
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={mode === 'selected'} onChange={() => setMode('selected')} />
                Επιλεγμένα από τον πίνακα ({preselectedIds.length} δέντρα)
              </label>
            )}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" checked={mode === 'all'} onChange={() => setMode('all')} />
              Όλοι οι υιοθέτες
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" checked={mode === 'filter'} onChange={() => setMode('filter')} />
              Με φίλτρα
            </label>
          </div>

          {mode === 'filter' && (
            <div className="flex flex-wrap gap-4 items-center text-sm bg-gray-50 rounded p-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={onlyToPlant} onChange={e => setOnlyToPlant(e.target.checked)} />
                🌱 Προς φύτευση
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={onlyNoPhone} onChange={e => setOnlyNoPhone(e.target.checked)} />
                Χωρίς τηλέφωνο
              </label>
              <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} className="border border-gray-300 rounded px-2 py-1">
                <option value="">Όλες οι ζώνες</option>
                {zones.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-300 rounded px-2 py-1">
                <option value="">Όλα τα είδη</option>
                {types.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
            </div>
          )}

          <p className="text-sm text-gray-700">
            <strong>{recipients.length}</strong> παραλήπτες (EL: {countByLang('el')}, EN: {countByLang('en')})
            {optedOutCount > 0 && <span className="text-orange-600"> · {optedOutCount} εξαιρέθηκαν (διέκοψαν τις ενημερώσεις)</span>}
            {excluded.size > 0 && <span className="text-gray-500"> · {excluded.size} αφαιρέθηκαν χειροκίνητα</span>}
          </p>

          <div className="max-h-64 overflow-y-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 w-8" />
                  <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase">Όνομα</th>
                  <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase">Email</th>
                  <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase">Δέντρα</th>
                  <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase">Γλώσσα</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {candidates.map(r => {
                  const key = r.email.toLowerCase();
                  const isOut = optedOut.has(key);
                  return (
                    <tr key={key} className={isOut ? 'bg-orange-50 text-gray-400' : ''}>
                      <td className="px-3 py-1.5">
                        <input
                          type="checkbox"
                          disabled={isOut}
                          checked={!isOut && !excluded.has(key)}
                          onChange={() => toggleExcluded(r.email)}
                        />
                      </td>
                      <td className="px-3 py-1.5">{r.name}</td>
                      <td className="px-3 py-1.5">{r.email}{isOut && ' (διέκοψε)'}</td>
                      <td className="px-3 py-1.5">{r.treeCount}</td>
                      <td className="px-3 py-1.5 uppercase">{r.lang}</td>
                    </tr>
                  );
                })}
                {candidates.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-6 text-gray-500">Κανένας παραλήπτης.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Composer */}
        <section className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">2. Μήνυμα</h2>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button key={t.name} onClick={() => applyTemplate(t.content)} className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs hover:bg-amber-100">
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-1">
            {(['el', 'en'] as BroadcastLang[]).map(l => (
              <button
                key={l}
                onClick={() => setActiveLang(l)}
                className={`px-4 py-1.5 rounded-t text-sm font-medium ${activeLang === l ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              >
                {l === 'el' ? 'Ελληνικά' : 'English'} ({countByLang(l)})
                {!hasText(l) && ' ⚠'}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Θέμα</label>
                <input
                  type="text"
                  value={content[activeLang].subject}
                  onChange={e => updateContent(activeLang, 'subject', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Κείμενο — διαθέσιμα: <code>{'{name}'}</code> <code>{'{tree_count}'}</code> <code>{'{tree_labels}'}</code>
                </label>
                <textarea
                  value={content[activeLang].body}
                  onChange={e => updateContent(activeLang, 'body', e.target.value)}
                  rows={12}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Προεπισκόπηση — {sample.name} · {fillPlaceholders(content[activeLang].subject || '…', sample)}
              </label>
              <iframe title="Προεπισκόπηση" srcDoc={previewHtml} sandbox="" className="w-full h-[26rem] border rounded bg-white" />
            </div>
          </div>
        </section>

        {/* 3. Send */}
        <section className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold">3. Αποστολή</h2>

          {missingLangCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm space-y-1">
              <p>⚠ {missingLangCount} παραλήπτες έχουν γλώσσα χωρίς κείμενο. Τι να γίνει με αυτούς;</p>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={fallback === 'skip'} onChange={() => setFallback('skip')} /> Να παραλειφθούν
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={fallback === 'other'} onChange={() => setFallback('other')} /> Να λάβουν την άλλη γλώσσα
              </label>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={sendTest}
              disabled={!hasText(activeLang) || sending}
              className="px-4 py-2 bg-gray-100 text-gray-800 border rounded hover:bg-gray-200 text-sm disabled:opacity-50"
            >
              Δοκιμαστικό σε μένα ({activeLang.toUpperCase()})
            </button>
            {testStatus && <span className="text-sm text-gray-600">{testStatus}</span>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={sendBroadcast}
              disabled={nothingToSend || needsTest || sending}
              className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 font-medium"
            >
              {sending ? 'Αποστολή...' : `✉️ Αποστολή σε ${recipients.length}`}
            </button>
            {needsTest && !nothingToSend && (
              <span className="text-sm text-orange-600">Στείλε πρώτα δοκιμαστικό με το τρέχον κείμενο.</span>
            )}
            {progress && sending && (
              <span className="text-sm text-gray-600">{progress.done} / {progress.total}</span>
            )}
          </div>

          {summary && (
            <div className="bg-gray-50 border rounded p-3 text-sm space-y-1">
              <p>✓ Στάλθηκαν: <strong>{summary.sent}</strong> · Απέτυχαν: <strong className={summary.failed ? 'text-red-600' : ''}>{summary.failed}</strong>
                {summary.skippedNoText > 0 && ` · Παραλείφθηκαν (χωρίς κείμενο): ${summary.skippedNoText}`}
                {summary.skippedOptOut > 0 && ` · Παραλείφθηκαν (διέκοψαν): ${summary.skippedOptOut}`}
              </p>
              {summary.failedEmails.length > 0 && (
                <p className="text-red-600 break-all">Αποτυχία: {summary.failedEmails.join(', ')}</p>
              )}
            </div>
          )}
        </section>

        {/* History */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-3">Ιστορικό</h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">Δεν έχουν σταλεί ακόμα μαζικά μηνύματα.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="py-2">Ημερομηνία</th><th>Θέμα</th><th>Παραλήπτες</th><th>Στάλθηκαν</th><th>Απέτυχαν</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map(b => (
                  <tr key={b.id}>
                    <td className="py-2 whitespace-nowrap">{new Date(b.created_at).toLocaleString('el-GR')}</td>
                    <td>{b.subject_el || b.subject_en}</td>
                    <td>{b.recipient_count}</td>
                    <td>{b.sent_count}</td>
                    <td className={b.failed_count ? 'text-red-600' : ''}>{b.failed_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
