import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
    it('renders with children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('applies default (primary) variant styles', () => {
        render(<Button>Default</Button>);
        const button = screen.getByRole('button');
        // Primary uses gradient
        expect(button).toHaveClass('from-primary');
    });

    it('applies secondary variant styles', () => {
        render(<Button variant="secondary">Secondary</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-bg-elevated');
    });

    it('applies ghost variant styles', () => {
        render(<Button variant="ghost">Ghost</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-transparent');
    });

    it('handles click events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('applies icon size classes', () => {
        render(<Button size="icon">X</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('p-2.5');
    });

    it('shows loading spinner when isLoading', () => {
        render(<Button isLoading>Loading</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button.querySelector('svg')).toBeInTheDocument();
    });
});
