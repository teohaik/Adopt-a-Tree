import { NextRequest, NextResponse } from 'next/server';
import {
  initDatabase,
  getTreePinsByIds,
  getOptedOutEmails,
  createEmailBroadcast,
  addEmailBroadcastCounts,
} from '@/lib/db';
import { verifyApiAuth } from '@/lib/apiAuth';
import { sendBroadcastBatch, BroadcastContent } from '@/lib/email';
import { groupRecipients, BroadcastRecipient } from '@/lib/broadcast';

const MAX_RECIPIENTS_PER_CALL = 100;

function cleanContent(raw: any): BroadcastContent {
  const pick = (v: any) => ({
    subject: String(v?.subject ?? '').trim(),
    body: String(v?.body ?? '').trim(),
  });
  return { el: pick(raw?.el), en: pick(raw?.en) };
}

export async function POST(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabase();
    const { pinIds, content: rawContent, fallback, broadcastId, test } = await request.json();
    const content = cleanContent(rawContent);
    const hasText = (l: 'el' | 'en') => !!content[l].subject && !!content[l].body;

    // Test mode: one email to ADMIN_EMAIL with sample data
    if (test) {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        return NextResponse.json({ error: 'ADMIN_EMAIL is not configured' }, { status: 400 });
      }
      const lang = test.lang === 'en' ? 'en' : 'el';
      if (!hasText(lang)) {
        return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
      }
      const sample: BroadcastRecipient = {
        email: adminEmail,
        name: 'Test',
        lang,
        treeCount: 2,
        treeLabels: ['Πλάτανος', 'Ελιά'],
      };
      const [result] = await sendBroadcastBatch([sample], content);
      return NextResponse.json({ results: [result], sent: result.ok ? 1 : 0, failed: result.ok ? 0 : 1 });
    }

    if (!Array.isArray(pinIds) || pinIds.length === 0) {
      return NextResponse.json({ error: 'No recipients' }, { status: 400 });
    }
    if (!hasText('el') && !hasText('en')) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    // Resolve addresses server-side from pin IDs, one recipient per email address
    const pins = await getTreePinsByIds(pinIds.map((id: any) => parseInt(id, 10)));
    const grouped = groupRecipients(pins);
    if (grouped.length > MAX_RECIPIENTS_PER_CALL) {
      return NextResponse.json(
        { error: `At most ${MAX_RECIPIENTS_PER_CALL} recipients per request` },
        { status: 400 }
      );
    }

    const optedOut = new Set(await getOptedOutEmails());
    const results: { email: string; ok: boolean; error?: string }[] = [];
    const toSend: BroadcastRecipient[] = [];
    let skippedOptOut = 0;
    let skippedNoText = 0;

    for (const r of grouped) {
      if (optedOut.has(r.email.toLowerCase())) {
        skippedOptOut++;
        continue;
      }
      if (!hasText(r.lang)) {
        const other = r.lang === 'el' ? 'en' : 'el';
        if (fallback === 'other' && hasText(other)) {
          r.lang = other;
        } else {
          skippedNoText++;
          continue;
        }
      }
      toSend.push(r);
    }

    if (toSend.length > 0) {
      results.push(...(await sendBroadcastBatch(toSend, content)));
    }

    const sent = results.filter(r => r.ok).length;
    const failed = results.length - sent;

    let id: number | undefined = broadcastId ? parseInt(broadcastId, 10) : undefined;
    if (!id) id = await createEmailBroadcast(content.el.subject, content.en.subject);
    await addEmailBroadcastCounts(id, results.length, sent, failed);

    return NextResponse.json({ broadcastId: id, sent, failed, skippedOptOut, skippedNoText, results });
  } catch (error) {
    console.error('Error sending broadcast:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}
