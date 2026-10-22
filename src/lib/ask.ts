/**
 * Resolve the question text that should be sent to the model.
 *
 * The spoken transcript has to win over the value of the `question` state,
 * because the state is not committed yet when the voice handler calls the
 * ask handler in the same tick. When an explicit text is given it is used,
 * otherwise the current input value is used.
 */
export function resolveQuestionText(explicit?: string | null, current?: string | null): string {
  const trimmedExplicit = typeof explicit === 'string' ? explicit.trim() : '';
  if (trimmedExplicit) return trimmedExplicit;
  return (current ?? '').trim();
}

/** Build the prompt that is sent to the model for a question. */
export function buildQuestionPrompt(question: string, transcript?: string): string {
  return `Question about this transcript: "${question}"\n\nTranscript: "${transcript ?? ''}"`;
}
