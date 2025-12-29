import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByText('Click me');
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByText('Disabled Button');
    expect(button).toBeDisabled();
  });

  it('renders different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByText('Default')).toBeInTheDocument();

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByText('Destructive')).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText('Outline')).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { rerender } = render(<Button size="default">Default</Button>);
    expect(screen.getByText('Default')).toBeInTheDocument();

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toBeInTheDocument();
  });
});
