import React from 'react';
import { TestAIGeneration } from '@/components/TestAIGeneration';
import { AIStatusChecker } from '@/components/AIStatusChecker';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-accent bg-clip-text text-transparent">
            AI System Testing & Diagnostics
          </h1>
        </div>
        
        <Tabs defaultValue="diagnostics" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="diagnostics">System Diagnostics</TabsTrigger>
            <TabsTrigger value="testing">Generation Testing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diagnostics" className="space-y-6">
            <AIStatusChecker />
          </TabsContent>
          
          <TabsContent value="testing" className="space-y-6">
            <TestAIGeneration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};