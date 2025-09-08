import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { AITestingDashboard } from '@/components/AITestingDashboard';

export const TestAIPage: React.FC = () => {
  return (
    <PageLayout>
      <AITestingDashboard />
    </PageLayout>
  );
};