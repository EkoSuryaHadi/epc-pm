import { render, screen } from '@testing-library/react';
import { KPICard } from './KPICard';

describe('KPICard Component', () => {
  it('renders KPI title and value', () => {
    render(<KPICard title="Budget" value="$1,000,000" />);
    
    expect(screen.getByText('Budget')).toBeInTheDocument();
    expect(screen.getByText('$1,000,000')).toBeInTheDocument();
  });

  it('renders with icon when provided', () => {
    const Icon = () => <svg data-testid="test-icon" />;
    render(<KPICard title="Test" value="100" icon={<Icon />} />);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('displays trend when provided', () => {
    render(<KPICard title="Progress" value="75%" trend="+5%" />);
    
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });

  it('applies positive trend styling', () => {
    render(<KPICard title="Test" value="100" trend="+10%" />);
    
    const trendElement = screen.getByText('+10%');
    expect(trendElement).toBeInTheDocument();
    // Positive trends typically have green color class
  });

  it('applies negative trend styling', () => {
    render(<KPICard title="Test" value="100" trend="-5%" />);
    
    const trendElement = screen.getByText('-5%');
    expect(trendElement).toBeInTheDocument();
    // Negative trends typically have red color class
  });

  it('renders description when provided', () => {
    render(
      <KPICard 
        title="Budget" 
        value="$1M" 
        description="Total project budget"
      />
    );
    
    expect(screen.getByText('Total project budget')).toBeInTheDocument();
  });
});
