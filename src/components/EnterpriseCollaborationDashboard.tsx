import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useEnterpriseStore } from '@/store/enterprise-store';
import { useAppStore } from '@/store/app-store';
import { APIService } from '@/lib/api';
import {
  Users,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Download,
  FileText,
  Database,
  Share2,
  Activity,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  MessageCircle,
  GitBranch,
  Timer,
  TrendingUp,
  Zap
} from 'lucide-react';

interface CollaborationActivity {
  id: string;
  type: 'edit' | 'comment' | 'export' | 'share' | 'approval';
  user_name: string;
  user_avatar?: string;
  document_title: string;
  timestamp: number;
  description: string;
  platform: 'sharepoint' | 'confluence';
  url?: string;
}

interface ActiveCollaboration {
  id: string;
  document_id: string;
  document_title: string;
  platform: 'sharepoint' | 'confluence';
  collaborators: Array<{
    user_name: string;
    last_active: number;
    status: 'editing' | 'viewing' | 'commenting';
  }>;
  last_updated: number;
  version: string;
  has_conflicts: boolean;
  comments_count: number;
  pending_approvals: number;
}

export const EnterpriseCollaborationDashboard: React.FC = () => {
  const { toast } = useToast();
  const { integrations, exportJobs, getConnectedIntegrations } = useEnterpriseStore();
  const { projects, documents } = useAppStore();
  
  const [activities, setActivities] = useState<CollaborationActivity[]>([]);
  const [activeCollaborations, setActiveCollaborations] = useState<ActiveCollaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const connectedIntegrations = getConnectedIntegrations();
  const recentExports = exportJobs.slice(0, 10);

  useEffect(() => {
    loadCollaborationData();
  }, []);

  const loadCollaborationData = async () => {
    setLoading(true);
    try {
      // Simulate loading collaboration data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock collaboration activities
      const mockActivities: CollaborationActivity[] = [
        {
          id: '1',
          type: 'edit',
          user_name: 'Sarah Johnson',
          document_title: 'MVP Roadmap - Q1 2024',
          timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
          description: 'Updated milestone dates and resource allocation',
          platform: 'sharepoint',
          url: 'https://company.sharepoint.com/sites/mvp-docs/mvp-roadmap-q1.docx'
        },
        {
          id: '2',
          type: 'comment',
          user_name: 'Michael Chen',
          document_title: 'Business Case - AI Integration',
          timestamp: Date.now() - 1000 * 60 * 32, // 32 minutes ago
          description: 'Added feedback on cost-benefit analysis section',
          platform: 'confluence',
          url: 'https://company.atlassian.net/wiki/spaces/MVP/pages/123456'
        },
        {
          id: '3',
          type: 'export',
          user_name: 'System',
          document_title: 'Project Charter - Mobile App',
          timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
          description: 'Exported to SharePoint with collaboration enabled',
          platform: 'sharepoint'
        },
        {
          id: '4',
          type: 'approval',
          user_name: 'David Wilson',
          document_title: 'Feasibility Study - Cloud Migration',
          timestamp: Date.now() - 1000 * 60 * 90, // 1.5 hours ago
          description: 'Approved document for stakeholder review',
          platform: 'confluence',
          url: 'https://company.atlassian.net/wiki/spaces/MVP/pages/789012'
        },
        {
          id: '5',
          type: 'share',
          user_name: 'Emily Rodriguez',
          document_title: 'RFP Document - Enterprise Software',
          timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
          description: 'Shared with procurement team',
          platform: 'sharepoint'
        }
      ];
      
      // Mock active collaborations
      const mockCollaborations: ActiveCollaboration[] = [
        {
          id: 'collab-1',
          document_id: 'doc-1',
          document_title: 'MVP Roadmap - Q1 2024',
          platform: 'sharepoint',
          collaborators: [
            { user_name: 'Sarah Johnson', last_active: Date.now() - 1000 * 60 * 5, status: 'editing' },
            { user_name: 'Tom Parker', last_active: Date.now() - 1000 * 60 * 12, status: 'viewing' }
          ],
          last_updated: Date.now() - 1000 * 60 * 5,
          version: '1.3',
          has_conflicts: false,
          comments_count: 3,
          pending_approvals: 0
        },
        {
          id: 'collab-2',
          document_id: 'doc-2',
          document_title: 'Business Case - AI Integration',
          platform: 'confluence',
          collaborators: [
            { user_name: 'Michael Chen', last_active: Date.now() - 1000 * 60 * 2, status: 'commenting' },
            { user_name: 'Lisa Wang', last_active: Date.now() - 1000 * 60 * 8, status: 'viewing' },
            { user_name: 'Alex Turner', last_active: Date.now() - 1000 * 60 * 15, status: 'editing' }
          ],
          last_updated: Date.now() - 1000 * 60 * 2,
          version: '2.1',
          has_conflicts: true,
          comments_count: 7,
          pending_approvals: 1
        }
      ];
      
      setActivities(mockActivities);
      setActiveCollaborations(mockCollaborations);
    } catch (error) {
      toast({
        title: 'Failed to load collaboration data',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadCollaborationData();
    setRefreshing(false);
    toast({
      title: 'Data refreshed',
      description: 'Collaboration data has been updated.',
    });
  };

  const getActivityIcon = (type: CollaborationActivity['type']) => {
    switch (type) {
      case 'edit': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'comment': return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'export': return <Download className="h-4 w-4 text-purple-600" />;
      case 'share': return <Share2 className="h-4 w-4 text-orange-600" />;
      case 'approval': return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: 'editing' | 'viewing' | 'commenting') => {
    switch (status) {
      case 'editing': return 'bg-blue-100 text-blue-800';
      case 'viewing': return 'bg-gray-100 text-gray-800';
      case 'commenting': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: 'sharepoint' | 'confluence') => {
    return platform === 'sharepoint' ? Database : Users;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <CardTitle>Enterprise Collaboration</CardTitle>
          </div>
          <CardDescription>
            Real-time collaboration insights and activity tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading collaboration data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCollaborators = activeCollaborations.reduce((sum, collab) => sum + collab.collaborators.length, 0);
  const totalComments = activeCollaborations.reduce((sum, collab) => sum + collab.comments_count, 0);
  const pendingApprovals = activeCollaborations.reduce((sum, collab) => sum + collab.pending_approvals, 0);
  const documentsWithConflicts = activeCollaborations.filter(collab => collab.has_conflicts).length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Collaborators</p>
                <p className="text-2xl font-bold">{totalCollaborators}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">+12% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Comments</p>
                <p className="text-2xl font-bold">{totalComments}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">+8% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{pendingApprovals}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2">
              <Timer className="h-3 w-3 text-orange-600 mr-1" />
              <span className="text-xs text-orange-600">Avg 2.3 days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conflicts</p>
                <p className="text-2xl font-bold text-red-600">{documentsWithConflicts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex items-center mt-2">
              <GitBranch className="h-3 w-3 text-red-600 mr-1" />
              <span className="text-xs text-red-600">Require attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Active Collaborations</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Recent Activity</span>
            </TabsTrigger>
            <TabsTrigger value="exports" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export History</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <TabsContent value="active" className="space-y-4">
          {activeCollaborations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Collaborations</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start collaborating by exporting documents to SharePoint or Confluence
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Collaboration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeCollaborations.map((collab) => {
                const PlatformIcon = getPlatformIcon(collab.platform);
                return (
                  <Card key={collab.id} className={collab.has_conflicts ? 'border-red-200' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base leading-tight">
                            {collab.document_title}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <PlatformIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground capitalize">
                              {collab.platform}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              v{collab.version}
                            </Badge>
                          </div>
                        </div>
                        {collab.has_conflicts && (
                          <Badge variant="destructive" className="text-xs">
                            Conflicts
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Collaborators</span>
                          <span>{collab.collaborators.length}</span>
                        </div>
                        <div className="space-y-1">
                          {collab.collaborators.map((collaborator, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{collaborator.user_name}</span>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className={`text-xs ${getStatusColor(collaborator.status)}`}>
                                  {collaborator.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(collaborator.last_active)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold">{collab.comments_count}</div>
                          <div className="text-xs text-muted-foreground">Comments</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{collab.pending_approvals}</div>
                          <div className="text-xs text-muted-foreground">Approvals</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">
                            {formatTimeAgo(collab.last_updated)}
                          </div>
                          <div className="text-xs text-muted-foreground">Last Update</div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>
                Latest collaboration activities across all connected platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => {
                  const PlatformIcon = getPlatformIcon(activity.platform);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {activity.user_name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <PlatformIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-medium">
                            {activity.document_title}
                          </span>
                          {activity.url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={activity.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export History</CardTitle>
              <CardDescription>
                Recent document exports to enterprise platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExports.map((exportJob) => {
                  const PlatformIcon = exportJob.integration_type === 'sharepoint' ? Database : Users;
                  const statusColor = {
                    completed: 'text-green-600',
                    failed: 'text-red-600',
                    processing: 'text-blue-600',
                    pending: 'text-yellow-600'
                  };
                  
                  return (
                    <div key={exportJob._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <PlatformIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {exportJob.total_documents} documents exported
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(exportJob.started_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <Badge 
                            variant="outline"
                            className={statusColor[exportJob.status] || 'text-gray-600'}
                          >
                            {exportJob.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {exportJob.processed_documents}/{exportJob.total_documents}
                          </p>
                        </div>
                        {exportJob.status === 'completed' && (
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Usage</CardTitle>
                <CardDescription>Distribution of collaboration across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">SharePoint</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">65%</span>
                      <Progress value={65} className="w-24 h-2 mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Confluence</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">35%</span>
                      <Progress value={35} className="w-24 h-2 mt-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Collaboration Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                    <span className="text-sm font-medium">2.3 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Document Approval Rate</span>
                    <span className="text-sm font-medium">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Sessions/Day</span>
                    <span className="text-sm font-medium">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Conflict Resolution Time</span>
                    <span className="text-sm font-medium">45 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};