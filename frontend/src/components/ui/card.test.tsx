import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card Components', () => {
  it('renders card with all sub-components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Test Content</p>
        </CardContent>
        <CardFooter>
          <p>Test Footer</p>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Footer')).toBeInTheDocument();
  });

  it('renders card without optional sections', () => {
    render(
      <Card>
        <CardContent>
          <p>Just Content</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByText('Just Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Card className="custom-class">
        <CardContent>Content</CardContent>
      </Card>
    );

    const card = screen.getByText('Content').closest('div')?.parentElement;
    expect(card).toHaveClass('custom-class');
  });
});
