import { describe, it, expect } from 'vitest';
import { buildQuestionPrompt, resolveQuestionText } from './ask';

describe('resolveQuestionText', () => {
  it('uses the spoken transcript even when the input state is still empty', () => {
    // The voice handler sets the state and calls the ask handler in the same
    // tick, so the state value is still the old one here.
    expect(resolveQuestionText('what did I say about the budget?', '')).toBe(
      'what did I say about the budget?',
    );
  });

  it('falls back to the current input value when nothing was spoken', () => {
    expect(resolveQuestionText(undefined, 'typed question')).toBe('typed question');
    expect(resolveQuestionText(null, 'typed question')).toBe('typed question');
  });

  it('trims the resolved text', () => {
    expect(resolveQuestionText('  spoken  ', 'typed')).toBe('spoken');
    expect(resolveQuestionText(undefined, '  typed  ')).toBe('typed');
  });

  it('returns an empty string when there is no question at all', () => {
    expect(resolveQuestionText(undefined, undefined)).toBe('');
    expect(resolveQuestionText('', '')).toBe('');
  });
});

describe('buildQuestionPrompt', () => {
  it('includes the question and the transcript', () => {
    const prompt = buildQuestionPrompt('why?', 'we talked about the budget');
    expect(prompt).toContain('"why?"');
    expect(prompt).toContain('"we talked about the budget"');
  });

  it('does not print the string undefined when there is no transcript', () => {
    expect(buildQuestionPrompt('why?')).not.toContain('undefined');
  });
});
