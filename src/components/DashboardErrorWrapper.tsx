'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ReactNode } from 'react';

interface DashboardErrorWrapperProps {
    children: ReactNode;
}

export function DashboardErrorWrapper({ children }: DashboardErrorWrapperProps) {
    return <ErrorBoundary>{children}</ErrorBoundary>;
}
