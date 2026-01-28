import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge Component', () => {
    it('renders with text', () => {
        render(<Badge>New</Badge>);
        expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('applies default variant styles', () => {
        render(<Badge data-testid="badge">Default</Badge>);
        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('bg-bg-elevated');
    });

    it('applies success variant styles', () => {
        render(<Badge variant="success" data-testid="badge">Success</Badge>);
        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('text-success');
    });

    it('applies secondary variant styles', () => {
        render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('text-text-muted');
    });

    it('applies category variant (movies)', () => {
        render(<Badge variant="movies" data-testid="badge">Movies</Badge>);
        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('text-movies');
    });

    it('accepts additional className', () => {
        render(<Badge className="custom-class" data-testid="badge">Text</Badge>);
        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('custom-class');
    });
});
