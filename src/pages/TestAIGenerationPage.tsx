import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { TestAIGeneration } from '@/components/TestAIGeneration';

export const TestAIGenerationPage: React.FC = () => {
  return (
    <PageLayout>
      <TestAIGeneration />
    </PageLayout>
  );
};