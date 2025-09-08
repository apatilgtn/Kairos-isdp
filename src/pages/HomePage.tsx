import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { OverviewDashboard } from '@/components/OverviewDashboard';

export const HomePage: React.FC = () => {
  return (
    <AppLayout>
      <OverviewDashboard />
    </AppLayout>
  );
};