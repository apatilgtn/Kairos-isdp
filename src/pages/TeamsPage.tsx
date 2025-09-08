import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { TeamDashboard } from '@/components/team/TeamDashboard';

export function TeamsPage() {
  return (
    <PageLayout>
      <TeamDashboard />
    </PageLayout>
  );
}