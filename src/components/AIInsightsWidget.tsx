import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  CheckCircle,
  Zap,
  Award,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { APIService } from '@/lib/api';
import type { MVPProject } from '@/types';

interface AIInsightsWidgetProps {
  project?: MVPProject;
  className?: string;
  onViewFullAnalytics?: () => void;
}

interface QuickInsights {
  qualityScore: number;
  qualityTrend: 'up' | 'down' | 'stable';
  generationTime: number;
  timeTrend: 'up' | 'down' | 'stable';
  successRate: number;
  topModel: string;
  totalGenerations: number;
  weeklyGrowth: number;
  recommendation: {
    type: 'performance' | 'quality' | 'cost' | 'usage';
    message: string;
    priority: 'high' | 'medium' | 'low';
  };
}

export const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({
  project,
  className = '',
  onViewFullAnalytics
}) => {
  const [insights, setInsights] = useState<QuickInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuickInsights();
  }, [project]);

  const loadQuickInsights = async () => {
    setLoading(true);
    try {
      const response = await APIService.getAIAnalytics(project?._id);
      if (response.success && response.analytics) {
        const quickInsights = generateQuickInsights(response.analytics);
        setInsights(quickInsights);
      }
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuickInsights = (analytics: any): QuickInsights => {
    const qualityScore = analytics.averageQualityScore;
    const generationTime = analytics.averageGenerationTime;
    const successRate = analytics.successRate;
    
    // Simulate trends based on current performance
    const qualityTrend = qualityScore >= 85 ? 'up' : qualityScore >= 80 ? 'stable' : 'down';
    const timeTrend = generationTime <= 3000 ? 'up' : generationTime <= 4000 ? 'stable' : 'down';
    
    // Determine top performing model
    const topModel = Object.entries(analytics.modelUsage)
      .reduce((a, b) => (a[1] as any).count > (b[1] as any).count ? a : b)[0];
    
    // Generate recommendation based on performance
    let recommendation;
    if (qualityScore < 80) {
      recommendation = {
        type: 'quality' as const,
        message: 'Consider using Kimi model for better quality results',
        priority: 'high' as const
      };
    } else if (generationTime > 4500) {
      recommendation = {
        type: 'performance' as const,
        message: 'Optimize prompts to reduce generation time',
        priority: 'medium' as const
      };
    } else if (successRate < 90) {
      recommendation = {
        type: 'usage' as const,
        message: 'Review failed generations and optimize inputs',
        priority: 'high' as const
      };
    } else {
      recommendation = {
        type: 'cost' as const,
        message: 'System performing well - consider scaling up',
        priority: 'low' as const
      };
    }

    return {
      qualityScore,
      qualityTrend,
      generationTime,
      timeTrend,
      successRate,
      topModel,
      totalGenerations: analytics.totalGenerations,
      weeklyGrowth: 12 + Math.random() * 15, // Mock weekly growth
      recommendation
    };
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-blue-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Brain className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatTime = (ms: number): string => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <Brain className="h-6 w-6 animate-pulse text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-sm text-muted-foreground">
            Unable to load AI insights
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Performance Insights
        </CardTitle>
        <CardDescription>
          Real-time AI generation performance summary
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-lg font-bold text-primary">
                {insights.qualityScore.toFixed(1)}
              </span>
              {getTrendIcon(insights.qualityTrend)}
            </div>
            <p className="text-xs text-muted-foreground">Quality Score</p>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-lg font-bold text-primary">
                {formatTime(insights.generationTime)}
              </span>
              {getTrendIcon(insights.timeTrend)}
            </div>
            <p className="text-xs text-muted-foreground">Avg Time</p>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-lg font-bold text-green-600">
                {insights.successRate.toFixed(0)}%
              </span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Generations</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{insights.totalGenerations.toLocaleString()}</span>
              <Badge variant="secondary" className="text-xs">
                +{insights.weeklyGrowth.toFixed(0)}% this week
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Top Performing Model</span>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">
                {insights.topModel === 'kimi-k2-0711-preview' ? 'Kimi' : 'Default'}
              </span>
            </div>
          </div>
        </div>

        {/* Recommendation Card */}
        <div className="p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start gap-2">
            {getPriorityIcon(insights.recommendation.priority)}
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">AI Recommendation</p>
              <p className="text-xs text-muted-foreground">
                {insights.recommendation.message}
              </p>
            </div>
            <Badge 
              variant={insights.recommendation.priority === 'high' ? 'destructive' : 
                      insights.recommendation.priority === 'medium' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {insights.recommendation.priority}
            </Badge>
          </div>
        </div>

        {/* View Full Analytics Button */}
        {onViewFullAnalytics && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onViewFullAnalytics}
          >
            View Full Analytics
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsWidget;