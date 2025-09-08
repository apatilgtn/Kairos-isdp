import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Zap, Target } from 'lucide-react';
import { AdvancedAIAnalytics } from '@/components/AdvancedAIAnalytics';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive insights into your AI-powered document generation and project analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97.8%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">-0.5s from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2</div>
            <p className="text-xs text-muted-foreground">+3.2 from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Analytics Dashboard</CardTitle>
          <CardDescription>
            Detailed performance metrics and insights for your AI-powered document generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <React.Suspense fallback={
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Loading Advanced AI Analytics</h3>
              <p className="text-muted-foreground">
                Analyzing performance data and generating insights...
              </p>
            </div>
          }>
            <AdvancedAIAnalytics />
          </React.Suspense>
        </CardContent>
      </Card>
    </div>
  );
};