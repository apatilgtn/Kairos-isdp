import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { ComprehensiveDocuments } from '@/components/ComprehensiveDocuments';

export const DocumentsPage: React.FC = () => {
  return (
    <PageLayout>
      <ComprehensiveDocuments />
    </PageLayout>
  );
};