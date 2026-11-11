import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Recording } from '../types';
import { SetLink } from './artist';

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
describe('recording discovery', () => {
  it('uses the event label as an accessible link and identifies representative recordings per artist', () => {
    render(<SetLink recording={recording} language="en" representative />);
    expect(
      screen.getByRole('link', { name: /Tomorrowland Belgium 2026 Representative recording/ })
    ).toHaveAttribute('href', recording.youtubeUrl);
  });
  it('shows an honest localized unavailable state instead of a search-results link', () => {
    render(<SetLink recording={undefined} language="pt-BR" />);
    expect(screen.getByText('Nenhum set completo verificado disponível.')).toBeVisible();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
