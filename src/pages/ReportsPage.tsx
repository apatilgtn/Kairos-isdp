import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { ComprehensiveReports } from '@/components/ComprehensiveReports';

export const ReportsPage: React.FC = () => {
  return (
    <PageLayout>
      <ComprehensiveReports />
    </PageLayout>
  );
};