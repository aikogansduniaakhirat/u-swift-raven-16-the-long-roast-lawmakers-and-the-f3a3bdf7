/**
 * The Long Roast: Lawmakers and the File They Cannot Convert — entry.
 *
 * One string, written to ${MAKEFUN_OUTPUT_DIR:-/output}/entry.txt by a
 * stdlib-only Node program: no network, no clock, nothing sampled at runtime,
 * so two runs write byte-identical files (the gate runs the program twice).
 *
 * Written against this bounty's published judge brief, in its own order:
 *
 *  1. It is a one-sentence satirical roast of lawmakers who would regulate AI
 *     without being able to convert a file to PDF. Single sentence, and the
 *     subject is named in the first clause.
 *  2. The turn is structural: the sentence opens on nine months of authority
 *     and ends with the committee legislating the exact workaround it needed
 *     for itself. The authority is set up, then spent on the file.
 *  3. The aim stays on the lawmakers and on the rule they write. Nobody is
 *     insulted; the rule is the punchline, which is what keeps it about power
 *     and competence rather than abuse.
 *  4. One pass, no subclauses to hold in memory, and the punch is the last
 *     four words ("take to PDF").
 *  5. The specific detail is "a scan of a printout" — not the worn "politician
 *     cannot open a PDF" cliché, but the absurd bureaucratic artefact that
 *     cliché produces once it is written into law.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Held as three named beats — the authority, the rule, the confession — so a
 * revision edits one beat instead of one opaque string, and so the punch can
 * be checked to sit in the last one.
 */
/**
 * Second pass, three edits, each tied to a criterion:
 *
 *  - "allowed to read" became "permitted to read": the longer word is the
 *    committee's own register, and it makes the opening clause sound like a
 *    hearing transcript rather than a blogger's summary (2, 3).
 *  - "required every filing as a scan" became "required every filing to arrive
 *    as a scan". The verb is what turns a preference into a rule with teeth,
 *    which is the thing being roasted (3).
 *  - "the one route" became "the only route": "only" carries the exasperation
 *    and lands one word earlier, so the last four words stay the punch (4).
 */
const BEATS = {
  authority: "After nine months of hearings on how AI should be permitted to read official documents,",
  rule: "the committee unanimously required every filing to arrive as a scan of a printout,",
  confession: "the only route its own report managed to take to PDF.",
} as const;

/**
 * Cut in the second pass, each killed by a named criterion:
 *
 *  "Nine months of hearings on how AI will be allowed to read our documents
 *   produced a 400-page report that the committee could not convert to PDF, so
 *   it was circulated as a screenshot of a printout, which is now the binding
 *   version." — 229, the funniest of the set, but it is two sentences and the
 *   roast lands on a mishap rather than on a rule (1, 3).
 *  "The committee that will decide how AI may process official documents spent
 *   forty minutes failing to convert its own report to PDF, then voted to
 *   require that every future filing be submitted in the format they had just
 *   failed to produce." — 237, correct aim, but "the format they had just
 *   failed to produce" explains the joke instead of landing it (4).
 *  "The subcommittee spent the morning establishing that AI cannot be trusted
 *   with sensitive documents, then classified its own report and found that not
 *   one of them could save it as a PDF, so the document is now safe from
 *   everyone, including the committee." — 253, clever, but the last clause is a
 *   second joke stacked on the first, and the punch stops being the file (4).
 */

/** RULES.txt gate: UTF-8, 1 to 320 characters, not only white space. */
const MIN_CHARS = 1;
const MAX_CHARS = 320;

/** Local ceiling under the published cap, so a bloating edit fails here. */
const TARGET_CHARS = 280;

const OUTPUT_NAME = "entry.txt";

function composeRoast(b: typeof BEATS): string {
  return `${b.authority} ${b.rule} ${b.confession}`;
}

/** Count code points, which is how the gate counts, not UTF-16 units. */
function charCount(text: string): number {
  return [...text].length;
}

function refuse(reason: string): never {
  process.stderr.write(`entry gate failed: ${reason}\n`);
  process.exit(1);
}

function check(text: string): number {
  const chars = charCount(text);
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    refuse(`${chars} characters, want ${MIN_CHARS}..${MAX_CHARS}`);
  }
  if (chars > TARGET_CHARS) {
    refuse(`${chars} characters, over the local ${TARGET_CHARS} ceiling`);
  }
  if (text.trim().length === 0) {
    refuse("text is empty or whitespace only");
  }
  if (text.includes("\n") || text.includes("\r")) {
    refuse("text spans more than one line");
  }
  if (text !== text.trim() || / {2,}/.test(text)) {
    refuse("stray or doubled spaces cost Size bytes");
  }
  // ASCII only: keeps the byte count the Size column ranks equal to the
  // character count the gate measured, so neither number is a guess.
  if (!/^[\x20-\x7E]+$/.test(text)) {
    refuse("non-ASCII characters make bytes and characters diverge");
  }
  // The brief asks for one sentence and for the punch on the last words; both
  // are cheap to assert here rather than discover in a rejected entry.
  const sentenceEnds = (text.match(/[.!?](\s|$)/g) ?? []).length;
  if (sentenceEnds !== 1) {
    refuse(`one sentence only, found ${sentenceEnds} sentence ends`);
  }
  if (!text.endsWith("to PDF.")) {
    refuse("the punch has to land on the file at the end");
  }
  return chars;
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const line = composeRoast(BEATS);
  const chars = check(line);

  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, OUTPUT_NAME);
  // No trailing newline: the file's bytes are the entry, and Size is the
  // first tie-break after the playoff games.
  writeFileSync(outPath, line, "utf8");

  // The judge reads the file on disk, not the string in memory.
  const written = readFileSync(outPath, "utf8");
  if (written !== line) {
    refuse(`the file on disk differs from the entry text (${written.length} units)`);
  }

  process.stdout.write(
    `wrote ${chars} characters / ${Buffer.byteLength(line, "utf8")} bytes -> ${outPath}\n`,
  );
}

main();
