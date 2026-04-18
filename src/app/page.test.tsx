import { vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import Home from './page';

describe('Home page', () => {
  it('renders the Agent Tea launch headline', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', {
        name: /your ai has tea about you\./i,
      }),
    ).toBeInTheDocument();
  });

  it('reveals dual entry points only after start CTA click', () => {
    render(<Home />);

    expect(screen.queryByRole('heading', { name: /coding agents/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /chatbots/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /see what your ai thinks of you/i }));

    expect(screen.getByRole('heading', { name: /coding agents/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /chatbots/i })).toBeInTheDocument();
    expect(screen.getByText(/\/instructions\/coding-agent\.md/i)).toBeInTheDocument();
    expect(screen.getByText(/\/instructions\/chatbot\.md/i)).toBeInTheDocument();
  });

  it('renders a clear call to action for first-time users', () => {
    render(<Home />);

    expect(screen.getByRole('button', { name: /see what your ai thinks of you/i })).toBeInTheDocument();
  });

  it('reveals chatbot encoded input only after copying chatbot instruction', () => {
    render(<Home />);
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    fireEvent.click(screen.getByRole('button', { name: /see what your ai thinks of you/i }));

    expect(screen.queryByLabelText(/paste chatbot encoded answer/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /copy chatbot instruction/i }));

    expect(screen.getByLabelText(/paste chatbot encoded answer/i)).toBeInTheDocument();
  });
});
