import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EnterpriseDataSeeder } from '@/lib/enterprise-data-seeder';
import { 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  RefreshCw,
  Zap,
  Settings
} from 'lucide-react';

interface EnterpriseDataInitializerProps {
  projectId?: string;
}

export const EnterpriseDataInitializer: React.FC<EnterpriseDataInitializerProps> = ({
  projectId
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [dataStatus, setDataStatus] = useState({
    hasIntegrations: false,
    hasExportJobs: false,
    hasSettings: false
  });

  useEffect(() => {
    console.log('EnterpriseDataInitializer mounted, checking data status...');
    checkDataStatus();
  }, []);

  const checkDataStatus = async () => {
    try {
      setChecking(true);
      console.log('Checking enterprise data status...');
      const status = await EnterpriseDataSeeder.checkEnterpriseDataExists();
      console.log('Enterprise data status:', status);
      setDataStatus(status);
    } catch (error) {
      console.error('Error checking data status:', error);
      toast({
        title: 'Check failed',
        description: 'Could not check enterprise data status. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setLoading(true);
      
      toast({
        title: 'Seeding started',
        description: 'Creating sample enterprise data...',
      });

      await EnterpriseDataSeeder.seedAllEnterpriseData(projectId);
      
      // Refresh status
      await checkDataStatus();
      
      toast({
        title: 'Data seeded successfully',
        description: 'Enterprise integrations and export jobs are now available.',
      });
      
    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: 'Seeding failed',
        description: 'Could not create sample enterprise data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedIntegrationsOnly = async () => {
    try {
      setLoading(true);
      
      toast({
        title: 'Creating integrations',
        description: 'Setting up sample SharePoint and Confluence integrations...',
      });

      await EnterpriseDataSeeder.seedEnterpriseIntegrations();
      await checkDataStatus();
      
      toast({
        title: 'Integrations created',
        description: 'Sample enterprise integrations are now available.',
      });
      
    } catch (error) {
      console.error('Error creating integrations:', error);
      toast({
        title: 'Creation failed',
        description: 'Could not create sample integrations.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (hasData: boolean) => {
    if (checking) return <Loader2 className="h-4 w-4 animate-spin" />;
    return hasData ? 
      <CheckCircle className="h-4 w-4 text-success" /> : 
      <AlertTriangle className="h-4 w-4 text-warning" />;
  };

  const getStatusBadge = (hasData: boolean) => {
    if (checking) return <Badge variant="outline">Checking...</Badge>;
    return hasData ? 
      <Badge variant="default" className="bg-success text-success-foreground">Ready</Badge> : 
      <Badge variant="outline" className="border-warning text-warning">Missing</Badge>;
  };

  const allDataExists = dataStatus.hasIntegrations && dataStatus.hasExportJobs && dataStatus.hasSettings;

  if (checking) {
    return (
      <Card className="border-accent/20">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Checking enterprise data status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allDataExists) {
    return (
      <Card className="border-success/20 bg-success/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-success" />
              <CardTitle className="text-success">Enterprise Data Ready</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={checkDataStatus} disabled={checking}>
              <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            All enterprise functionality is ready to use. You can now export documents and manage integrations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-warning/20 bg-warning/5">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-6 w-6 text-warning" />
            <CardTitle className="text-warning">Enterprise Setup Required</CardTitle>
          </div>
          <CardDescription>
            Initialize enterprise integrations and sample data to enable full functionality.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Data Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(dataStatus.hasIntegrations)}
              <span className="text-sm font-medium">Integrations</span>
            </div>
            {getStatusBadge(dataStatus.hasIntegrations)}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(dataStatus.hasExportJobs)}
              <span className="text-sm font-medium">Export Jobs</span>
            </div>
            {getStatusBadge(dataStatus.hasExportJobs)}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(dataStatus.hasSettings)}
              <span className="text-sm font-medium">Settings</span>
            </div>
            {getStatusBadge(dataStatus.hasSettings)}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button 
          onClick={handleSeedData}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Initialize All Enterprise Data
        </Button>
        
        {!dataStatus.hasIntegrations && (
          <Button 
            variant="outline"
            onClick={handleSeedIntegrationsOnly}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            Setup Integrations Only
          </Button>
        )}
        
        <Button 
          variant="ghost"
          onClick={checkDataStatus}
          disabled={checking}
        >
          <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Information Card */}
      <Card className="border-accent/20">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>What this will create:</strong>
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
            <li>• Sample SharePoint and Confluence integrations</li>
            <li>• Demo export jobs with realistic progress and results</li>
            <li>• Enterprise security and compliance settings</li>
            <li>• Mock authentication and configuration data</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            This creates demo data for testing enterprise features. In production, you would connect real integrations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};