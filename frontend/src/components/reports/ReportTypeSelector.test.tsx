import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportTypeSelector } from './ReportTypeSelector';

describe('ReportTypeSelector Component', () => {
  it('renders all 5 report types', () => {
    const mockOnChange = jest.fn();
    render(<ReportTypeSelector value="PROGRESS" onChange={mockOnChange} />);
    
    expect(screen.getByText('Progress Report')).toBeInTheDocument();
    expect(screen.getByText('Cost Report')).toBeInTheDocument();
    expect(screen.getByText('Schedule Report')).toBeInTheDocument();
    expect(screen.getByText('Risk Report')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive Report')).toBeInTheDocument();
  });

  it('highlights selected report type', () => {
    const mockOnChange = jest.fn();
    render(<ReportTypeSelector value="COST" onChange={mockOnChange} />);
    
    const costCard = screen.getByText('Cost Report').closest('div');
    expect(costCard).toHaveClass('ring-2');
  });

  it('calls onChange when report type is clicked', async () => {
    const mockOnChange = jest.fn();
    render(<ReportTypeSelector value="PROGRESS" onChange={mockOnChange} />);
    
    const scheduleReport = screen.getByText('Schedule Report');
    await userEvent.click(scheduleReport);
    
    expect(mockOnChange).toHaveBeenCalledWith('SCHEDULE');
  });

  it('displays report descriptions', () => {
    const mockOnChange = jest.fn();
    render(<ReportTypeSelector value="PROGRESS" onChange={mockOnChange} />);
    
    expect(screen.getByText(/Project progress, EVM metrics/)).toBeInTheDocument();
    expect(screen.getByText(/Budget tracking, cost variance/)).toBeInTheDocument();
  });

  it('displays icons for each report type', () => {
    const mockOnChange = jest.fn();
    const { container } = render(
      <ReportTypeSelector value="PROGRESS" onChange={mockOnChange} />
    );
    
    // Check that there are 5 icon containers (one for each report type)
    const iconContainers = container.querySelectorAll('.p-2.rounded-lg');
    expect(iconContainers).toHaveLength(5);
  });
});
