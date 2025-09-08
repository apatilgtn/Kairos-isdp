import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl mb-4">404</h1>
        <p className="mb-6">Page not found</p>
        <Button onClick={() => navigate('/')} variant="default">
          Return home
        </Button>
      </div>
    </div>
  );
}; 