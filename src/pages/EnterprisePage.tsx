import React, { useEffect } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnterpriseDataInitializer } from '@/components/EnterpriseDataInitializer';
import { CacheUtils } from '@/lib/cache-utils';
import { Database, Shield, Users, Zap, Check, Star, Settings } from 'lucide-react';

export const EnterprisePage: React.FC = () => {
  console.log('EnterprisePage component loaded successfully');
  console.log('Current window location:', window.location.pathname);

  useEffect(() => {
    // Initialize cache debugging on enterprise page load
    CacheUtils.initializeWithDebug();
  }, []);
  
  const features = [
    { name: 'Advanced AI Models', included: true },
    { name: 'Unlimited Projects', included: true },
    { name: 'Team Collaboration', included: true },
    { name: 'Priority Support', included: true },
    { name: 'Custom Integrations', included: true },
    { name: 'Advanced Analytics', included: true },
    { name: 'SOC 2 Compliance', included: true },
    { name: 'Dedicated Account Manager', included: true },
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-4">
        <Badge variant="secondary" className="mb-2">
          <Star className="w-3 h-3 mr-1" />
          Enterprise Plan
        </Badge>
        <h1 className="text-4xl font-bold text-foreground">KAIROS Enterprise</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of AI-powered strategic planning with enterprise-grade features, 
          security, and dedicated support for your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enterprise Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Unlimited</div>
            <p className="text-xs text-muted-foreground">No user limits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Unlimited</div>
            <p className="text-xs text-muted-foreground">No usage caps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Storage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10TB+</div>
            <p className="text-xs text-muted-foreground">Expandable storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SOC 2</div>
            <p className="text-xs text-muted-foreground">Enterprise grade</p>
          </CardContent>
        </Card>
      </div>

      {/* Enterprise Data Setup */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Enterprise Setup</h2>
        </div>
        <React.Suspense fallback={
          <Card className="border-accent/20">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading enterprise setup...</p>
            </CardContent>
          </Card>
        }>
          <EnterpriseDataInitializer />
        </React.Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Enterprise Features</CardTitle>
            <CardDescription>
              Everything you need to scale strategic planning across your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm font-medium">{feature.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get Started with Enterprise</CardTitle>
            <CardDescription>
              Ready to transform your strategic planning process?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold gradient-text">Custom Pricing</div>
              <p className="text-muted-foreground">Tailored to your organization's needs</p>
            </div>
            
            <div className="space-y-3">
              <Button size="lg" className="w-full">
                Contact Sales
              </Button>
              <Button variant="outline" size="lg" className="w-full btn-enterprise-secondary">
                Schedule Demo
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs text-muted-foreground"
                onClick={async () => {
                  console.log('Running enterprise functionality test...');
                  const { EnterpriseTestUtils } = await import('@/lib/enterprise-test-utils');
                  const result = await EnterpriseTestUtils.runComprehensiveTest();
                  console.log('Test result:', result);
                  
                  if (result.success) {
                    alert('✅ Enterprise functionality test PASSED!\nCheck console for details.');
                  } else {
                    alert(`❌ Enterprise functionality test FAILED!\nErrors: ${result.errors.join(', ')}\nCheck console for details.`);
                  }
                }}
              >
                🧪 Test Enterprise Features
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs text-muted-foreground"
                onClick={() => {
                  console.log('Manual cache clear requested');
                  CacheUtils.clearEnterpriseCache();
                  window.location.reload();
                }}
              >
                🧹 Clear Cache & Reload
              </Button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                🔒 SOC 2 Type II Compliant
              </p>
              <p className="text-sm text-muted-foreground">
                💬 24/7 Priority Support
              </p>
              <p className="text-sm text-muted-foreground">
                🚀 30-day Implementation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </PageLayout>
  );
};