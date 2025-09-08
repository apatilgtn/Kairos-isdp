import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { ComprehensiveTestDashboard } from '@/components/ComprehensiveTestDashboard';

export const TestAIPage: React.FC = () => {
  return (
    <PageLayout>
      <ComprehensiveTestDashboard />
    </PageLayout>
  );
};