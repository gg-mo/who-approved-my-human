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
});
