import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles,
  Home,
  Users,
  TrendingUp,
  TestTube,
  Database,
  Settings,
  LogOut,
  X,
  Activity,
  FileText,
  Zap,
  Presentation,
  Building2,
  BarChart3,
  Folder,
  MessageSquare,
  Shield,
  Globe,
  BookOpen,
  Target,
  Briefcase,
  PlusCircle
} from 'lucide-react';

interface ComprehensiveSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComprehensiveSidebar: React.FC<ComprehensiveSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const mainNavigation = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/',
      description: 'Project overview and analytics',
      badge: null
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Folder,
      path: '/projects',
      description: 'Manage all projects',
      badge: null
    },
    {
      id: 'teams',
      label: 'Teams',
      icon: Users,
      path: '/teams',
      description: 'Team collaboration',
      badge: 'Pro'
    },
    {
      id: 'analytics',
      label: 'Analytics Hub',
      icon: TrendingUp,
      path: '/analytics-hub',
      description: 'AI generation insights',
      badge: null
    }
  ];

  const businessFeatures = [
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      path: '/documents',
      description: 'Strategic documents',
      badge: null
    },
    {
      id: 'enterprise',
      label: 'Enterprise',
      icon: Building2,
      path: '/enterprise',
      description: 'Enterprise features',
      badge: 'Enterprise'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      path: '/reports',
      description: 'Generate reports',
      badge: null
    }
  ];

  const aiFeatures = [
    {
      id: 'test-ai',
      label: 'Test AI',
      icon: TestTube,
      path: '/test',
      description: 'Test AI generation',
      badge: null
    },
    {
      id: 'ai-chat',
      label: 'AI Chat',
      icon: MessageSquare,
      path: '/chat',
      description: 'AI assistance',
      badge: 'New'
    }
  ];

  const quickActions = [
    {
      id: 'new-project',
      label: 'New Project',
      icon: PlusCircle,
      onClick: () => {
        navigate('/');
        onClose();
        // Trigger create project dialog
        setTimeout(() => {
          const createButton = document.querySelector('[data-create-project]');
          if (createButton) {
            (createButton as HTMLElement).click();
          }
        }, 100);
      },
      description: 'Create new strategic project'
    },
    {
      id: 'presentations',
      label: 'Presentations',
      icon: Presentation,
      onClick: () => {
        console.log('Navigate to presentations');
      },
      description: 'Interactive stakeholder presentations'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: Database,
      onClick: () => {
        navigate('/enterprise');
        onClose();
      },
      description: 'SharePoint & Confluence integration'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-200 bg-gradient-to-r from-yellow-50/80 to-orange-50/80">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">KAIROS</h1>
              <p className="text-xs text-gray-600">Strategic Platform</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main Navigation
              </h3>
              {mainNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Button
                    key={item.id}
                    variant={active ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-3 ${
                      active 
                        ? 'bg-gradient-to-r from-orange-400 to-yellow-500 text-white shadow-lg' 
                        : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${active ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            <Separator className="my-4" />

            {/* Business Features */}
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Business Features
              </h3>
              {businessFeatures.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Button
                    key={item.id}
                    variant={active ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-3 ${
                      active 
                        ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg' 
                        : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${active ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            <Separator className="my-4" />

            {/* AI Features */}
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                AI Features
              </h3>
              {aiFeatures.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Button
                    key={item.id}
                    variant={active ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-3 ${
                      active 
                        ? 'bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-lg' 
                        : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${active ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            <Separator className="my-4" />

            {/* Quick Actions */}
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Actions
              </h3>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-gray-600 hover:text-gray-800"
                    onClick={action.onClick}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <span className="text-sm font-medium">{action.label}</span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            <Separator className="my-4" />

            {/* Statistics */}
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Today's Activity
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-gray-600">Documents</span>
                  </div>
                  <span className="text-xs font-medium text-gray-800">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-gray-600">AI Generations</span>
                  </div>
                  <span className="text-xs font-medium text-gray-800">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-gray-600">Projects</span>
                  </div>
                  <span className="text-xs font-medium text-gray-800">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-purple-500" />
                    <span className="text-xs text-gray-600">Team Members</span>
                  </div>
                  <span className="text-xs font-medium text-gray-800">7</span>
                </div>
              </div>
       
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-600 hover:text-gray-800"
            onClick={() => handleNavigation('/settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-600 hover:text-gray-800"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
};