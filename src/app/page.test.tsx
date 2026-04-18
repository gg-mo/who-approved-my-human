import { render, screen } from '@testing-library/react';

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

  it('renders dual entry points with instruction file references', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /coding agents/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /chatbots/i })).toBeInTheDocument();
    expect(screen.getByText(/\/instructions\/coding-agent\.md/i)).toBeInTheDocument();
    expect(screen.getByText(/\/instructions\/chatbot\.md/i)).toBeInTheDocument();
  });

  it('renders a clear call to action for first-time users', () => {
    render(<Home />);

    expect(screen.getByRole('button', { name: /start your agent tea test/i })).toBeInTheDocument();
  });
});
