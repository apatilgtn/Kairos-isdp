import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ProjectsManagement } from '@/components/ProjectsManagement';

export const ProjectsPage: React.FC = () => {
  return (
    <AppLayout>
      <ProjectsManagement />
    </AppLayout>
  );
};