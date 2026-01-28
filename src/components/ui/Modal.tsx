'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl sm:max-w-4xl max-sm:max-w-none max-sm:w-full max-sm:h-full max-sm:rounded-none max-sm:m-0',
};

export function Modal({
    isOpen,
    onClose,
    children,
    className,
    closeOnOverlayClick = true,
    closeOnEscape = true,
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (closeOnEscape && e.key === 'Escape') {
                onClose();
            }
        },
        [closeOnEscape, onClose]
    );

    const handleOverlayClick = useCallback(
        (e: React.MouseEvent) => {
            if (closeOnOverlayClick && e.target === overlayRef.current) {
                onClose();
            }
        },
        [closeOnOverlayClick, onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    const modalContent = (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
            {/* Pass onClose to children so the content can close the modal if needed */}
            {children}
        </div>
    );

    if (typeof window === 'undefined') return null;

    return createPortal(modalContent, document.body);
}

export function ModalContent({
    children,
    className,
    size = 'md',
    onClose
}: {
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    onClose?: () => void;
}) {
    return (
        <div
            className={cn(
                'w-full bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl animate-scale-in flex flex-col max-h-[90vh]',
                sizeClasses[size],
                className
            )}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    );
}

export function ModalHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('flex flex-col space-y-1.5 px-6 py-4 border-b border-border-subtle', className)}>
            {children}
        </div>
    );
}

export function ModalTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <h2 className={cn('text-lg font-semibold text-text-primary', className)}>
            {children}
        </h2>
    );
}

export function ModalDescription({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <p className={cn('text-sm text-text-muted', className)}>
            {children}
        </p>
    );
}

export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0 shrink-0', className)}>
            {children}
        </div>
    );
}

export function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('px-6 py-4 overflow-y-auto flex-1', className)}>
            {children}
        </div>
    );
}
