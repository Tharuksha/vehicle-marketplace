import React from 'react';
import { describe, it, expect } from 'vitest';
import Category from './Category';
import { render, screen } from '@testing-library/vitest';

describe('Category', () => {
  it('should render the component', () => {
    render(<Category />);
    expect(screen.getByText('Browse by Type')).toBeInTheDocument();
  });
});
