// Pure helpers shared by the admin composer (client preview) and the send API (server).

export type BroadcastLang = 'el' | 'en';

export interface BroadcastRecipient {
  email: string;
  name: string;
  lang: BroadcastLang;
  treeCount: number;
  treeLabels: string[];
}

export interface BroadcastPin {
  id: number;
  user_name: string;
  user_email: string;
  tree_label: string;
  lang?: BroadcastLang | null;
}

/**
 * One recipient per email address (case-insensitive). Pins must be ordered newest first:
 * the newest pin decides the name and language.
 */
export function groupRecipients(pins: BroadcastPin[]): BroadcastRecipient[] {
  const map = new Map<string, BroadcastRecipient>();
  for (const pin of pins) {
    const key = pin.user_email.trim().toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.treeCount += 1;
      existing.treeLabels.push(pin.tree_label);
    } else {
      map.set(key, {
        email: pin.user_email.trim(),
        name: pin.user_name,
        lang: pin.lang === 'en' ? 'en' : 'el',
        treeCount: 1,
        treeLabels: [pin.tree_label],
      });
    }
  }
  return Array.from(map.values());
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const PLACEHOLDERS = ['{name}', '{tree_count}', '{tree_labels}'] as const;

export function fillPlaceholders(text: string, r: Pick<BroadcastRecipient, 'name' | 'treeCount' | 'treeLabels'>): string {
  return text
    .replace(/\{name\}/g, r.name)
    .replace(/\{tree_count\}/g, String(r.treeCount))
    .replace(/\{tree_labels\}/g, r.treeLabels.join(', '));
}

const FOOTER = {
  el: {
    from: 'Υιοθέτησε ένα Δέντρο',
    greeting: (name: string) => `Αγαπητέ/ή ${name},`,
    footer: 'Λαμβάνεις αυτό το μήνυμα επειδή υιοθέτησες ένα δέντρο στο Υιοθέτησε ένα Δέντρο.',
    unsubscribe: 'Δεν θέλω να λαμβάνω άλλα τέτοια μηνύματα',
  },
  en: {
    from: 'Adopt a Tree',
    greeting: (name: string) => `Dear ${name},`,
    footer: 'You are receiving this message because you adopted a tree on Adopt a Tree.',
    unsubscribe: 'Unsubscribe from these messages',
  },
} as const;

export function broadcastFromName(lang: BroadcastLang): string {
  return FOOTER[lang].from;
}

/** Builds the branded HTML email. Body and subject placeholders are filled, then everything is HTML-escaped. */
export function renderBroadcastHtml(
  lang: BroadcastLang,
  body: string,
  recipient: Pick<BroadcastRecipient, 'name' | 'treeCount' | 'treeLabels'>,
  unsubscribeUrl: string
): string {
  const f = FOOTER[lang];
  const content = escapeHtml(fillPlaceholders(body, recipient))
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    .replace(/\r?\n/g, '<br>');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
      .footer { text-align: center; color: #6b7280; font-size: 13px; margin-top: 30px; }
      .footer a { color: #6b7280; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header"><h1>🌳 ${escapeHtml(f.from)}</h1></div>
      <div class="content">
        <p>${escapeHtml(f.greeting(recipient.name))}</p>
        <p>${content}</p>
        <div class="footer">
          <p>${escapeHtml(f.footer)}</p>
          <p><a href="${escapeHtml(unsubscribeUrl)}">${escapeHtml(f.unsubscribe)}</a></p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
