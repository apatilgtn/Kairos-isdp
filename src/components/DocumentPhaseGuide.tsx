import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  Search, 
  Shield, 
  Layers, 
  ShoppingCart, 
  Map, 
  ArrowDown, 
  CheckCircle 
} from 'lucide-react';

interface DocumentPhase {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  documents: Array<{
    name: string;
    description: string;
    icon: React.ReactNode;
  }>;
  outcomes: string[];
}

const phases: DocumentPhase[] = [
  {
    name: 'Justification Phase',
    description: 'Establish business need and project viability',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'green',
    documents: [
      {
        name: 'Business Case',
        description: 'ROI analysis and stakeholder benefits',
        icon: <DollarSign className="h-4 w-4" />
      },
      {
        name: 'Feasibility Study', 
        description: 'Technical, financial, and operational viability',
        icon: <Search className="h-4 w-4" />
      }
    ],
    outcomes: ['Approved business case', 'Confirmed project viability', 'Stakeholder buy-in']
  },
  {
    name: 'Definition & Authority',
    description: 'Define project scope and establish governance',
    icon: <Shield className="h-5 w-5" />,
    color: 'purple',
    documents: [
      {
        name: 'Project Charter',
        description: 'Formal authorization and governance framework',
        icon: <Shield className="h-4 w-4" />
      },
      {
        name: 'Scope Statement',
        description: 'Clear project boundaries and deliverables',
        icon: <Layers className="h-4 w-4" />
      }
    ],
    outcomes: ['Authorized project manager', 'Clear project boundaries', 'Governance framework']
  },
  {
    name: 'Procurement & Planning',
    description: 'Acquire resources and plan execution approach',
    icon: <ShoppingCart className="h-5 w-5" />,
    color: 'orange',
    documents: [
      {
        name: 'Request for Proposal (RFP)',
        description: 'Vendor solicitation for solution development',
        icon: <ShoppingCart className="h-4 w-4" />
      },
      {
        name: 'AI Roadmap',
        description: 'Detailed execution strategy and timeline',
        icon: <Map className="h-4 w-4" />
      }
    ],
    outcomes: ['Selected vendors', 'Detailed project plan', 'Resource allocation']
  }
];

export function DocumentPhaseGuide() {
  const getColorClasses = (color: string) => {
    const colorMap = {
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.green;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5 text-blue-600" />
          Project Documentation Workflow
        </CardTitle>
        <CardDescription>
          Follow this systematic approach to create comprehensive project documentation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {phases.map((phase, index) => (
            <div key={phase.name} className="relative">
              {/* Phase Header */}
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getColorClasses(phase.color)}`}>
                  {phase.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{phase.name}</h3>
                    <Badge variant="outline" className={getColorClasses(phase.color)}>
                      Phase {index + 1}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {phase.description}
                  </p>
                  
                  {/* Documents in Phase */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {phase.documents.map((doc) => (
                      <div key={doc.name} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="p-1 bg-white rounded">
                          {doc.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{doc.name}</h4>
                          <p className="text-xs text-muted-foreground">{doc.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Expected Outcomes */}
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Expected Outcomes:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {phase.outcomes.map((outcome) => (
                        <li key={outcome} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Arrow to next phase */}
              {index < phases.length - 1 && (
                <div className="flex justify-center my-4">
                  <ArrowDown className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">💡 Pro Tips:</p>
          <ul className="space-y-1">
            <li>• Complete documents in sequence for best results</li>
            <li>• Each phase builds upon previous documentation</li>
            <li>• Use the comparison tools to choose the right procurement approach</li>
            <li>• Export documents in professional formats for stakeholder review</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}