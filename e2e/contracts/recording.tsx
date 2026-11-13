import { render, cleanup } from '@testing-library/react/pure.js';
import { expect } from '@playwright/test';
import { SetLink } from '../../src/components/artist';
import type { Recording } from '../../src/types';
const recording: Recording = {
  id: 'video',
  youtubeUrl: 'https://www.youtube.com/watch?v=DuXXMZLfAkQ',
  title: 'Full DJ set',
  eventLabel: 'Tomorrowland Belgium 2026',
  channel: 'Tomorrowland',
  uploadedAt: null,
  viewCount: null,
  verifiedAt: '2026-11-11',
  selectionReason: 'Full set.',
  representative: false,
};
export const contracts = {
  'recording links expose their event and representative status': () => {
    try {
      const view = render(<SetLink recording={recording} language="en" representative />);
      expect(
        view
          .getByRole('link', { name: /Tomorrowland Belgium 2026 Representative recording/ })
          .getAttribute('href')
      ).toBe(recording.youtubeUrl);
    } finally {
      cleanup();
    }
  },
  'unavailable recordings are localized without search links': () => {
    try {
      const view = render(<SetLink recording={undefined} language="pt-BR" />);
      expect(
        view.getByText('Ainda não encontramos um set completo com fonte confirmada.').textContent
      ).toBe('Ainda não encontramos um set completo com fonte confirmada.');
      expect(view.queryByRole('link')).toBeNull();
    } finally {
      cleanup();
    }
  },
};
