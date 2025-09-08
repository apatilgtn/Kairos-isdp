import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Lightbulb } from 'lucide-react';
import type { MVPProject } from '@/types';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (project: Omit<MVPProject, '_id' | '_uid' | '_tid' | 'created_at' | 'updated_at'>) => Promise<void>;
}

const INDUSTRIES = [
  'Technology/Software',
  'E-commerce/Retail',
  'Healthcare/Medical',
  'Education/EdTech',
  'Finance/FinTech',
  'Real Estate/PropTech',
  'Transportation/Logistics',
  'Food & Beverage',
  'Entertainment/Media',
  'Travel/Tourism',
  'Manufacturing',
  'Agriculture/AgTech',
  'Energy/CleanTech',
  'Social Impact/Non-profit',
  'B2B Services',
  'Consumer Products',
  'Gaming',
  'Artificial Intelligence/ML',
  'IoT/Hardware',
  'Other'
];

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onOpenChange,
  onCreateProject
}) => {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    problem_statement: '',
    status: 'draft' as MVPProject['status']
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.industry || !formData.problem_statement.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      await onCreateProject(formData);
      // Reset form
      setFormData({
        name: '',
        industry: '',
        problem_statement: '',
        status: 'draft'
      });
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.name.trim() && formData.industry && formData.problem_statement.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <span>Create New MVP Project</span>
          </DialogTitle>
          <DialogDescription>
            Start by defining your project idea. Our AI will help you build a comprehensive roadmap based on this information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="e.g., TaskMaster Pro, EcoTrack App, SmartHome Assistant..."
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isCreating}
                required
              />
              <p className="text-xs text-muted-foreground">
                Choose a clear, memorable name for your MVP
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => handleInputChange('industry', value)}
                disabled={isCreating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry..." />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This helps our AI provide industry-specific recommendations
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="problem-statement">Problem Statement *</Label>
              <Textarea
                id="problem-statement"
                placeholder="Describe the problem your MVP will solve. What pain point are you addressing? Who is your target user? What makes this problem worth solving?

Example: Small business owners struggle to manage multiple social media accounts efficiently, leading to inconsistent posting, missed engagement opportunities, and decreased brand visibility. Current tools are either too complex for beginners or lack the automation features needed for busy entrepreneurs."
                value={formData.problem_statement}
                onChange={(e) => handleInputChange('problem_statement', e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isCreating}
                required
              />
              <p className="text-xs text-muted-foreground">
                A clear problem statement is crucial for effective AI-generated roadmaps. Be specific about the user, pain point, and impact.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value as MVPProject['status'])}
                disabled={isCreating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft - Just an idea</SelectItem>
                  <SelectItem value="active">Active - Ready to develop</SelectItem>
                  <SelectItem value="completed">Completed - Already launched</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Project...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};