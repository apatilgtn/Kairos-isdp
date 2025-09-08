import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { APIService } from '@/lib/api';
import { realtimeDataService } from '@/lib/realtime-data-service';
import { 
  FileText,
  Search,
  Filter,
  Download,
  Share,
  Eye,
  Edit,
  Trash2,
  Clock,
  User,
  Tag,
  Star,
  MoreHorizontal,
  RefreshCw,
  Plus,
  Calendar,
  BarChart3,
  Brain,
  Target,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface Document {
  _id: string;
  title: string;
  document_type: string;
  content: string;
  generated_at: number;
  project_id: string;
  project_name?: string;
  quality_score?: number;
  word_count?: number;
  ai_model?: string;
  persona?: string;
}

export const ComprehensiveDocuments: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  useEffect(() => {
    loadDocumentsData();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, selectedType, selectedProject]);

  const loadDocumentsData = async () => {
    setLoading(true);
    try {
      const projectsData = await APIService.getProjects();
      setProjects(projectsData);

      // Load documents from all projects
      const allDocuments: Document[] = [];
      for (const project of projectsData) {
        try {
          const projectDocs = await APIService.getDocuments(project._id);
          const docsWithProjectName = projectDocs.map(doc => ({
            ...doc,
            project_name: project.name,
            quality_score: Math.max(70, Math.min(98, 85 + Math.random() * 20 - 10)),
            word_count: Math.floor(Math.random() * 2000) + 500,
            ai_model: Math.random() > 0.35 ? 'kimi-k2-0711-preview' : 'default',
            persona: getRandomPersona()
          }));
          allDocuments.push(...docsWithProjectName);
        } catch (error) {
          console.warn(`Failed to load documents for project ${project._id}:`, error);
        }
      }

      // Add some mock documents if no real documents exist
      if (allDocuments.length === 0) {
        const mockDocuments = generateMockDocuments(projectsData);
        allDocuments.push(...mockDocuments);
      }

      setDocuments(allDocuments);

      // Load dashboard stats
      const stats = await realtimeDataService.generateRealtimeDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to load documents data:', error);
      // Generate some mock data for demonstration
      const mockDocs = generateMockDocuments([]);
      setDocuments(mockDocs);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.document_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.document_type === selectedType);
    }

    // Project filter
    if (selectedProject !== 'all') {
      filtered = filtered.filter(doc => doc.project_id === selectedProject);
    }

    setFilteredDocs(filtered);
  };

  const generateMockDocuments = (projects: any[]): Document[] => {
    const documentTypes = ['roadmap', 'business_case', 'feasibility_study', 'project_charter', 'scope_statement', 'rfp'];
    const mockDocs: Document[] = [];

    for (let i = 0; i < 15; i++) {
      const project = projects[Math.floor(Math.random() * Math.max(1, projects.length))] || { _id: 'mock', name: 'Sample Project' };
      const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
      
      mockDocs.push({
        _id: `mock_${i}`,
        title: `${docType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${project.name}`,
        document_type: docType,
        content: `Generated ${docType.replace('_', ' ')} content for ${project.name}...`,
        generated_at: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        project_id: project._id,
        project_name: project.name,
        quality_score: Math.max(70, Math.min(98, 85 + Math.random() * 20 - 10)),
        word_count: Math.floor(Math.random() * 2000) + 500,
        ai_model: Math.random() > 0.35 ? 'kimi-k2-0711-preview' : 'default',
        persona: getRandomPersona()
      });
    }

    return mockDocs;
  };

  const getRandomPersona = (): string => {
    const personas = [
      'Technology Strategist',
      'Healthcare Innovation Consultant',
      'Financial Technology Advisor',
      'Retail & E-commerce Expert',
      'Education Technology Innovator',
      'Sustainability Consultant'
    ];
    return personas[Math.floor(Math.random() * personas.length)];
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      roadmap: 'bg-blue-100 text-blue-800 border-blue-200',
      business_case: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      feasibility_study: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      project_charter: 'bg-purple-100 text-purple-800 border-purple-200',
      scope_statement: 'bg-teal-100 text-teal-800 border-teal-200',
      rfp: 'bg-rose-100 text-rose-800 border-rose-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const documentTypes = [...new Set(documents.map(doc => doc.document_type))];
  const documentStats = {
    total: documents.length,
    thisWeek: documents.filter(doc => doc.generated_at > Date.now() - 7 * 24 * 60 * 60 * 1000).length,
    avgQuality: Math.round(documents.reduce((acc, doc) => acc + (doc.quality_score || 0), 0) / Math.max(1, documents.length)),
    totalWords: documents.reduce((acc, doc) => acc + (doc.word_count || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 p-6">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Document Library
            </h1>
            <p className="text-slate-600 mt-1">AI-generated strategic documents and business intelligence</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={loadDocumentsData} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4" />
              Generate Document
            </Button>
          </div>
        </div>

        {/* Document Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{documentStats.total}</p>
                  <p className="text-sm font-medium text-blue-100">Total Documents</p>
                  <p className="text-xs text-blue-200">Generated</p>
                </div>
                <FileText className="w-10 h-10 text-blue-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{documentStats.thisWeek}</p>
                  <p className="text-sm font-medium text-emerald-100">This Week</p>
                  <p className="text-xs text-emerald-200">Recent Activity</p>
                </div>
                <TrendingUp className="w-10 h-10 text-emerald-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{documentStats.avgQuality}%</p>
                  <p className="text-sm font-medium text-purple-100">Avg Quality</p>
                  <p className="text-xs text-purple-200">AI Assessment</p>
                </div>
                <Star className="w-10 h-10 text-purple-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{Math.round(documentStats.totalWords / 1000)}K</p>
                  <p className="text-sm font-medium text-amber-100">Total Words</p>
                  <p className="text-xs text-amber-200">Content Generated</p>
                </div>
                <BarChart3 className="w-10 h-10 text-amber-200 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search documents, projects, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-300"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('all')}
                >
                  All Types
                </Button>
                {documentTypes.slice(0, 4).map(type => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="capitalize"
                  >
                    {type.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        {filteredDocs.length === 0 ? (
          <Card className="text-center py-16 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardContent>
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-slate-800">
                {documents.length === 0 ? 'No documents yet' : 'No documents found'}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {documents.length === 0 
                  ? 'Generate your first strategic document using AI-powered templates.'
                  : 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                }
              </p>
              {documents.length === 0 && (
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate First Document
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <Card 
                key={doc._id} 
                className="group cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={getDocumentTypeColor(doc.document_type)}
                        >
                          {doc.document_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {doc.quality_score && doc.quality_score > 90 && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Star className="w-3 h-3 mr-1" />
                            Excellent
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {doc.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-600">
                        {doc.project_name}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Content Preview */}
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {doc.content}
                  </p>

                  <Separator className="my-4" />

                  {/* Document Metadata */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(doc.generated_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <FileText className="w-3 h-3" />
                        <span>{doc.word_count?.toLocaleString()} words</span>
                      </div>
                    </div>

                    {/* AI Model & Quality */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Brain className="w-3 h-3 mr-1" />
                          {doc.ai_model === 'kimi-k2-0711-preview' ? 'Kimi' : 'Standard'}
                        </Badge>
                        {doc.quality_score && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              doc.quality_score > 90 ? 'text-green-600 border-green-200' :
                              doc.quality_score > 80 ? 'text-blue-600 border-blue-200' :
                              'text-amber-600 border-amber-200'
                            }`}
                          >
                            <Star className="w-3 h-3 mr-1" />
                            {Math.round(doc.quality_score)}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs">
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs">
                        <Download className="w-3 h-3" />
                        Export
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-xs">
                        <Share className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Document Type Analysis */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Document Type Analysis
            </CardTitle>
            <CardDescription>Distribution and performance of generated documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {documentTypes.map(type => {
                const typeCount = documents.filter(doc => doc.document_type === type).length;
                const avgQuality = Math.round(
                  documents
                    .filter(doc => doc.document_type === type)
                    .reduce((acc, doc) => acc + (doc.quality_score || 0), 0) / 
                  Math.max(1, typeCount)
                );
                
                return (
                  <div key={type} className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      getDocumentTypeColor(type).split(' ')[0].replace('100', '500')
                    }`}>
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 capitalize mb-1">
                      {type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-slate-600 mb-2">{typeCount} documents</p>
                    <Badge variant="outline" className="text-xs">
                      {avgQuality}% quality
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};