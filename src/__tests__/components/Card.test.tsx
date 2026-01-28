import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

describe('Card Component', () => {
    it('renders children correctly', () => {
        render(
            <Card>
                <CardContent>Card content</CardContent>
            </Card>
        );
        expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies default variant styles', () => {
        render(<Card data-testid="card">Content</Card>);
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('bg-bg-surface');
    });

    it('applies glass variant styles', () => {
        render(<Card variant="glass" data-testid="card">Content</Card>);
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('backdrop-blur-xl');
    });

    it('applies elevated variant styles', () => {
        render(<Card variant="elevated" data-testid="card">Content</Card>);
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('bg-bg-elevated');
    });

    it('renders CardHeader with title and description', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>My Title</CardTitle>
                    <CardDescription>My Description</CardDescription>
                </CardHeader>
            </Card>
        );
        expect(screen.getByText('My Title')).toBeInTheDocument();
        expect(screen.getByText('My Description')).toBeInTheDocument();
    });

    it('renders CardFooter correctly', () => {
        render(
            <Card>
                <CardFooter>Footer content</CardFooter>
            </Card>
        );
        expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('accepts additional className', () => {
        render(<Card className="custom-class" data-testid="card">Content</Card>);
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('custom-class');
    });

    it('applies hover styles when hover=true', () => {
        render(<Card hover data-testid="card">Content</Card>);
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('cursor-pointer');
    });
});
