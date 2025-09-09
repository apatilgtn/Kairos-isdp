// Main API Service - Now using HTTP backend instead of localStorage
import { HTTPAPIService } from './http-api';

// Re-export all methods from HTTPAPIService
export class APIService {
  // Project Management
  static async createProject(...args: Parameters<typeof HTTPAPIService.createProject>) {
    return HTTPAPIService.createProject(...args);
  }

  static async getProjects(...args: Parameters<typeof HTTPAPIService.getProjects>) {
    return HTTPAPIService.getProjects(...args);
  }

  static async updateProject(...args: Parameters<typeof HTTPAPIService.updateProject>) {
    return HTTPAPIService.updateProject(...args);
  }

  static async deleteProject(...args: Parameters<typeof HTTPAPIService.deleteProject>) {
    return HTTPAPIService.deleteProject(...args);
  }

  // Document Management
  static async saveDocument(...args: Parameters<typeof HTTPAPIService.saveDocument>) {
    return HTTPAPIService.saveDocument(...args);
  }

  static async updateRoadmapDocument(...args: Parameters<typeof HTTPAPIService.updateRoadmapDocument>) {
    return HTTPAPIService.updateRoadmapDocument(...args);
  }

  static async getDocuments(...args: Parameters<typeof HTTPAPIService.getDocuments>) {
    return HTTPAPIService.getDocuments(...args);
  }

  static async deleteDocument(...args: Parameters<typeof HTTPAPIService.deleteDocument>) {
    return HTTPAPIService.deleteDocument(...args);
  }

  // Diagram Management
  static async saveDiagram(...args: Parameters<typeof HTTPAPIService.saveDiagram>) {
    return HTTPAPIService.saveDiagram(...args);
  }

  static async getDiagrams(...args: Parameters<typeof HTTPAPIService.getDiagrams>) {
    return HTTPAPIService.getDiagrams(...args);
  }

  static async updateDiagram(...args: Parameters<typeof HTTPAPIService.updateDiagram>) {
    return HTTPAPIService.updateDiagram(...args);
  }

  static async deleteDiagram(...args: Parameters<typeof HTTPAPIService.deleteDiagram>) {
    return HTTPAPIService.deleteDiagram(...args);
  }

  // AI Generation Services
  static async checkAuthStatus(...args: Parameters<typeof HTTPAPIService.checkAuthStatus>) {
    return HTTPAPIService.checkAuthStatus(...args);
  }

  static async chat(...args: Parameters<typeof HTTPAPIService.chat>) {
    return HTTPAPIService.chat(...args);
  }

  static async generateRoadmap(...args: Parameters<typeof HTTPAPIService.generateRoadmap>) {
    return HTTPAPIService.generateRoadmap(...args);
  }

  static async generateElevatorPitch(...args: Parameters<typeof HTTPAPIService.generateElevatorPitch>) {
    return HTTPAPIService.generateElevatorPitch(...args);
  }

  static async generateModelAdvice(...args: Parameters<typeof HTTPAPIService.generateModelAdvice>) {
    return HTTPAPIService.generateModelAdvice(...args);
  }

  static async enhanceDocument(...args: Parameters<typeof HTTPAPIService.enhanceDocument>) {
    return HTTPAPIService.enhanceDocument(...args);
  }

  static async generateDiagramFromContent(...args: Parameters<typeof HTTPAPIService.generateDiagramFromContent>) {
    return HTTPAPIService.generateDiagramFromContent(...args);
  }

  static async exportDocument(...args: Parameters<typeof HTTPAPIService.exportDocument>) {
    return HTTPAPIService.exportDocument(...args);
  }

  static async generateBusinessCase(...args: Parameters<typeof HTTPAPIService.generateBusinessCase>) {
    return HTTPAPIService.generateBusinessCase(...args);
  }

  static async generateFeasibilityStudy(...args: Parameters<typeof HTTPAPIService.generateFeasibilityStudy>) {
    return HTTPAPIService.generateFeasibilityStudy(...args);
  }

  static async generateProjectCharter(...args: Parameters<typeof HTTPAPIService.generateProjectCharter>) {
    return HTTPAPIService.generateProjectCharter(...args);
  }

  static async generateScopeStatement(...args: Parameters<typeof HTTPAPIService.generateScopeStatement>) {
    return HTTPAPIService.generateScopeStatement(...args);
  }

  static async generateRFP(...args: Parameters<typeof HTTPAPIService.generateRFP>) {
    return HTTPAPIService.generateRFP(...args);
  }

  // Team Management (placeholder)
  static async createTeam(...args: Parameters<typeof HTTPAPIService.createTeam>) {
    return HTTPAPIService.createTeam(...args);
  }

  static async getTeams(...args: Parameters<typeof HTTPAPIService.getTeams>) {
    return HTTPAPIService.getTeams(...args);
  }

  // Legacy methods for backward compatibility - these can be removed once frontend is updated
  static async getTeamsByOwner() { return []; }
  static async updateTeam() { throw new Error('Not implemented'); }
  static async deleteTeam() { throw new Error('Not implemented'); }
  static async addTeamMember() { throw new Error('Not implemented'); }
  static async getTeamMembers() { return []; }
  static async getUserTeams() { return []; }
  static async updateTeamMember() { throw new Error('Not implemented'); }
  static async removeTeamMember() { throw new Error('Not implemented'); }
  static async createInvitation() { throw new Error('Not implemented'); }
  static async getTeamInvitations() { return []; }
  static async getInvitationsByEmail() { return []; }
  static async updateInvitation() { throw new Error('Not implemented'); }
  static async deleteInvitation() { throw new Error('Not implemented'); }
  static async logActivity() { throw new Error('Not implemented'); }
  static async getTeamActivities() { return []; }
  static async getUserActivities() { return []; }
  static async getTeamProjects() { return []; }
  static async createDocumentEdit() { throw new Error('Not implemented'); }
  static async getDocumentEdits() { return []; }
  static async deleteDocumentEdit() { throw new Error('Not implemented'); }
  static async createDocumentVersion() { throw new Error('Not implemented'); }
  static async getDocumentVersions() { return []; }
  static async acquireDocumentLock() { throw new Error('Not implemented'); }
  static async releaseDocumentLock() { throw new Error('Not implemented'); }
  static async getDocumentLock() { return null; }
  static async createDocumentComment() { throw new Error('Not implemented'); }
  static async getDocumentComments() { return []; }
  static async getDocumentComment() { return null; }
  static async resolveDocumentComment() { throw new Error('Not implemented'); }
}
