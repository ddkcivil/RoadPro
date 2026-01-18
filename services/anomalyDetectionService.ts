import { Project, ScheduleTask, BOQItem, Vehicle, LabTest, RFI, NCR, WeatherInfo, DailyReport, VehicleLog, StructureAsset } from '../types';

// Interface for anomaly detection results
export interface AnomalyDetectionResult {
  id: string;
  timestamp: string;
  type: 'schedule' | 'cost' | 'quality' | 'safety' | 'weather' | 'resource' | 'progress' | 'behavioral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  entity: string; // Which entity the anomaly relates to (task, vehicle, etc.)
  entityName: string;
  description: string;
  detectedValue: any;
  expectedValue?: any;
  threshold?: number;
  confidence: number; // 0-100 percentage
  recommendations: string[];
  status: 'open' | 'investigating' | 'resolved' | 'false-positive';
  linkedEntities?: string[]; // Other related entities
}

// Interface for anomaly patterns
export interface AnomalyPattern {
  id: string;
  name: string;
  description: string;
  detectionRule: string; // Rule that identifies the anomaly
  affectedFields: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: number; // How often this pattern occurs
  lastDetected: string;
}

// Main anomaly detection service class
export class AnomalyDetectionService {
  /**
   * Detects anomalies in project data
   */
  async detectAnomalies(project: Project): Promise<AnomalyDetectionResult[]> {
    const anomalies: AnomalyDetectionResult[] = [];
    
    // Detect schedule anomalies
    const scheduleAnomalies = await this.detectScheduleAnomalies(project);
    anomalies.push(...scheduleAnomalies);
    
    // Detect cost anomalies
    const costAnomalies = await this.detectCostAnomalies(project);
    anomalies.push(...costAnomalies);
    
    // Detect quality anomalies
    const qualityAnomalies = await this.detectQualityAnomalies(project);
    anomalies.push(...qualityAnomalies);
    
    // Detect safety anomalies
    const safetyAnomalies = await this.detectSafetyAnomalies(project);
    anomalies.push(...safetyAnomalies);
    
    // Detect resource anomalies
    const resourceAnomalies = await this.detectResourceAnomalies(project);
    anomalies.push(...resourceAnomalies);
    
    // Detect progress anomalies
    const progressAnomalies = await this.detectProgressAnomalies(project);
    anomalies.push(...progressAnomalies);
    
    // Detect behavioral anomalies
    const behavioralAnomalies = await this.detectBehavioralAnomalies(project);
    anomalies.push(...behavioralAnomalies);
    
    return anomalies;
  }

  /**
   * Detects schedule-related anomalies
   */
  private async detectScheduleAnomalies(project: Project): Promise<AnomalyDetectionResult[]> {
    const anomalies: AnomalyDetectionResult[] = [];
    
    // Check for tasks that are significantly delayed
    for (const task of project.schedule) {
      const now = new Date();
      const endDate = new Date(task.endDate);
      
      if (now > endDate && task.status !== 'Completed') {
        const daysOverdue = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue > 7) { // More than a week overdue
          anomalies.push({
            id: `sched-anomaly-${task.id}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'schedule',
            severity: daysOverdue > 30 ? 'critical' : daysOverdue > 14 ? 'high' : 'medium',
            entity: task.id,
            entityName: task.name,
            description: `Task overdue by ${daysOverdue} days`,
            detectedValue: daysOverdue,
            expectedValue: 0,
            threshold: 7,
            confidence: 90,
            recommendations: [
              `Review task dependencies and resource allocation for ${task.name}`,
              'Assess impact on subsequent tasks',
              'Consider rescheduling dependent tasks'
            ],
            status: 'open'
          });
        }
      }
    }
    
    // Check for unusual progress rates
    for (const task of project.schedule) {
      const startDate = new Date(task.startDate);
      const endDate = new Date(task.endDate);
      const totalDuration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (totalDuration > 0) {
        const elapsedDuration = (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        const expectedProgress = Math.min(100, (elapsedDuration / totalDuration) * 100);
        const progressDifference = Math.abs(task.progress - expectedProgress);
        
        if (progressDifference > 30) { // More than 30% difference
          anomalies.push({
            id: `progress-anomaly-${task.id}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'progress',
            severity: progressDifference > 50 ? 'high' : 'medium',
            entity: task.id,
            entityName: task.name,
            description: `Progress deviates by ${progressDifference}% from expected`,
            detectedValue: task.progress,
            expectedValue: expectedProgress,
            threshold: 30,
            confidence: 85,
            recommendations: [
              `Investigate reasons for progress deviation in ${task.name}`,
              'Verify progress reporting accuracy',
              'Review resource allocation and dependencies'
            ],
            status: 'open'
          });
        }
      }
    }
    
    return anomalies;
  }

  /**
   * Detects cost-related anomalies
   */
  private async detectCostAnomalies(project: Project): Promise<AnomalyDetectionResult[]> {
    const anomalies: AnomalyDetectionResult[] = [];
    
    // Check for BOQ items with unusual cost ratios
    for (const item of project.boq) {
      // Calculate completion ratio
      const completionRatio = item.quantity > 0 ? item.completedQuantity / item.quantity : 0;
      const expectedCost = item.amount * completionRatio;
      const actualCost = item.rate * item.completedQuantity;
      const costVariance = Math.abs(actualCost - expectedCost);
      
      // If variance is more than 20% of expected cost
      if (expectedCost > 0 && (costVariance / expectedCost) > 0.2) {
        anomalies.push({
          id: `cost-anomaly-${item.id}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'cost',
          severity: (costVariance / expectedCost) > 0.5 ? 'high' : 'medium',
          entity: item.id,
          entityName: item.description,
          description: `Cost variance of ${(costVariance / expectedCost * 100).toFixed(1)}% from expected`,
          detectedValue: actualCost,
          expectedValue: expectedCost,
          threshold: 0.2,
          confidence: 80,
          recommendations: [
            `Review cost calculations for ${item.description}`,
            'Check for quantity discrepancies',
            'Verify rate applicability'
          ],
          status: 'open'
        });
      }
    }
    
    return anomalies;
  }

  /**
   * Detects quality-related anomalies
   */
  private async detectQualityAnomalies(project: Project): Promise<AnomalyDetectionResult[]> {
    const anomalies: AnomalyDetectionResult[] = [];
    
    // Check for unusual patterns in lab test results
    const failedTests = project.labTests.filter(test => test.result === 'Fail');
    const totalTests = project.labTests.length;
    
    if (totalTests > 0 && failedTests.length / totalTests > 0.1) { // More than 10% failure rate
      anomalies.push({
        id: `quality-anomaly-lab-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'quality',
        severity: 'high',
        entity: 'lab-tests',
        entityName: 'Laboratory Tests',
        description: `High failure rate of ${(failedTests.length / totalTests * 100).toFixed(1)}% in lab tests`,
        detectedValue: failedTests.length / totalTests,
        expectedValue: 0.1, // Expected 10% or less
        threshold: 0.1,
        confidence: 90,
        recommendations: [
          'Review material sourcing and quality control processes',
          'Inspect testing procedures and equipment calibration',
          'Investigate potential systemic quality issues'
        ],
        status: 'open'
      });
    }
    
    // Check for NCR patterns
    const openNCRs = project.ncrs.filter(ncr => ncr.status === 'Open' || ncr.status === 'Correction Pending');
    if (openNCRs.length > 5) { // More than 5 open NCRs
      anomalies.push({
        id: `quality-anomaly-ncr-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'quality',
        severity: openNCRs.length > 10 ? 'critical' : 'high',
        entity: 'ncrs',
        entityName: 'Non-Conformance Reports',
        description: `High number of open NCRs (${openNCRs.length})`,
        detectedValue: openNCRs.length,
        expectedValue: 5,
        threshold: 5,
        confidence: 85,
        recommendations: [
          `Prioritize resolution of ${openNCRs.length} open NCRs`,
          'Review quality control procedures',
          'Assess impact on project schedule and costs'
        ],
        status: 'open'
      });
    }
    
    return anomalies;
  }

  /**
   * Detects safety-related anomalies
   */
  private async detectSafetyAnomalies(project: Project): Promise<AnomalyDetectionResult[]> {
    const anomalies: AnomalyDetectionResult[] = [];
    
    // Check for unusual patterns in RFIs
    const openRFIs = project.rfis.filter(rfi => rfi.status === 'Open' || rfi.status === 'Pending Inspection');
    const totalRFIs = project.rfis.length;
    
    if (totalRFIs > 0 && openRFIs.length / totalRFIs > 0.3) { // More than 30% open RFIs
      anomalies.push({
        id: `safety-anomaly-rfi-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'safety',
        severity: 'high',
        entity: 'rfis',
        entityName: 'Requests for Information',
        description: `High proportion of open RFIs (${(openRFIs.length / totalRFIs * 100).toFixed(1)}%)`,
        detectedValue: openRFIs.length / totalRFIs,
        expectedValue: 0.3,
        threshold: 0.3,
        confidence: 80,
        recommendations: [
          'Accelerate RFI review and approval process',
          'Identify bottlenecks in decision-making',
          'Review design clarity and specifications'
        ],
        status: 'open'
      });
    }
    
    return anomalies;
  }

  /**
   * Detects resource-related anomalies
   */
  private async detectResourceAnomalies(project: Project): Promise<AnomalyDetectionResult[]> {
    const anomalies: AnomalyDetectionResult[] = [];
    
    // Check for unusual vehicle utilization patterns
    for (const vehicle of project.vehicles) {
      // This would normally check vehicle logs to see utilization patterns
      // For simulation, we'll check maintenance status
      if (vehicle.status === 'Maintenance') {
        // Check vehicle logs to see if it has been inactive for too long
        const recentLogs = project.vehicleLogs.filter(log => log.vehicleId === vehicle.id);
        if (recentLogs.length > 0) {
          const lastLogDate = new Date(recentLogs[recentLogs.length - 1].date);
          const daysSinceLastUse = (new Date().getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceLastUse > 5 && vehicle.status === 'Maintenance') {
            anomalies.push({
              id: `resource-anomaly-vehicle-${vehicle.id}-${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'resource',
              severity: 'medium',
              entity: vehicle.id,
              entityName: vehicle.plateNumber,
              description: `Vehicle in maintenance for ${Math.floor(daysSinceLastUse)} days`,
              detectedValue: Math.floor(daysSinceLastUse),
              expectedValue: 5,
              threshold: 5,
              confidence: 75,
              recommendations: [
                `Review maintenance status for ${vehicle.plateNumber}`,
                'Check if vehicle is needed for upcoming tasks',
                'Consider alternative equipment if needed'
              ],
              status: 'open'
            });
          }
        }
      }
    }
    
    return anomalies;
  }

  /**
   * Detects progress-related anomalies
   */
  private async detectProgressAnomalies(project: Project): Promise<AnomalyDetectionResult[]> {
    const anomalies: AnomalyDetectionResult[] = [];
    
    // Check for unusual patterns in daily reports
    if (project.dailyReports && project.dailyReports.length > 0) {
      // Check if there are unusual gaps in reporting
      const sortedReports = [...project.dailyReports].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      for (let i = 1; i < sortedReports.length; i++) {
        const prevDate = new Date(sortedReports[i-1].date);
        const currDate = new Date(sortedReports[i].date);
        const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff > 2) { // More than 2 days gap
          anomalies.push({
            id: `progress-anomaly-report-gap-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'progress',
            severity: 'medium',
            entity: 'daily-reports',
            entityName: 'Daily Reporting',
            description: `Gap of ${Math.floor(dayDiff)} days in daily reports`,
            detectedValue: Math.floor(dayDiff),
            expectedValue: 1,
            threshold: 2,
            confidence: 70,
            recommendations: [
              'Investigate reasons for reporting gaps',
              'Verify continuous work progress during gap period',
              'Implement reporting backup procedures'
            ],
            status: 'open'
          });
        }
      }
    }
    
    return anomalies;
  }

  /**
   * Detects behavioral anomalies
   */
  private async detectBehavioralAnomalies(project: Project): Promise<AnomalyDetectionResult[]> {
    const anomalies: AnomalyDetectionResult[] = [];
    
    // Check for unusual weather patterns affecting work
    if (project.weather) {
      if (project.weather.impactOnSchedule === 'Severe') {
        // Check if there are enough weather-impacting days to affect schedule
        // This is simulated - in reality, we'd check historical weather data
        
        // Check for unusual patterns in work stoppages related to weather
        const weatherRelatedStoppages = project.dailyReports.filter(report => 
          report.workToday.some(work => work.description.toLowerCase().includes('weather') || 
                                      work.description.toLowerCase().includes('rain') || 
                                      work.description.toLowerCase().includes('storm'))
        );
        
        if (weatherRelatedStoppages.length > project.dailyReports.length * 0.3) { // More than 30% weather-related stoppages
          anomalies.push({
            id: `behavioral-anomaly-weather-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'behavioral',
            severity: 'medium',
            entity: 'weather',
            entityName: 'Weather Impact',
            description: `High frequency of weather-related work stoppages (${(weatherRelatedStoppages.length / project.dailyReports.length * 100).toFixed(1)}%)`,
            detectedValue: weatherRelatedStoppages.length / project.dailyReports.length,
            expectedValue: 0.3,
            threshold: 0.3,
            confidence: 80,
            recommendations: [
              'Review weather contingency plans',
              'Consider seasonal scheduling adjustments',
              'Evaluate protective measures for weather-affected work'
            ],
            status: 'open'
          });
        }
      }
    }
    
    return anomalies;
  }

  /**
   * Creates an anomaly pattern definition
   */
  createAnomalyPattern(pattern: Omit<AnomalyPattern, 'id' | 'lastDetected' | 'frequency'>): AnomalyPattern {
    return {
      id: `pattern-${Date.now()}`,
      ...pattern,
      frequency: 0,
      lastDetected: new Date().toISOString()
    };
  }

  /**
   * Updates anomaly status
   */
  updateAnomalyStatus(anomalyId: string, status: AnomalyDetectionResult['status'], project: Project): Project {
    // This would normally update the anomaly in the project data
    // For now, we'll just return the project as-is since anomalies aren't stored in the project
    return project;
  }

  /**
   * Gets summary statistics of anomalies
   */
  getAnomalySummary(anomalies: AnomalyDetectionResult[]): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    openCount: number;
    criticalCount: number;
  } {
    const summary = {
      total: anomalies.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      openCount: 0,
      criticalCount: 0
    };
    
    for (const anomaly of anomalies) {
      // Count by type
      summary.byType[anomaly.type] = (summary.byType[anomaly.type] || 0) + 1;
      
      // Count by severity
      summary.bySeverity[anomaly.severity] = (summary.bySeverity[anomaly.severity] || 0) + 1;
      
      // Count open anomalies
      if (anomaly.status === 'open') {
        summary.openCount++;
      }
      
      // Count critical anomalies
      if (anomaly.severity === 'critical') {
        summary.criticalCount++;
      }
    }
    
    return summary;
  }

  /**
   * Generates anomaly report
   */
  async generateAnomalyReport(project: Project): Promise<AnomalyReport> {
    const anomalies = await this.detectAnomalies(project);
    const summary = this.getAnomalySummary(anomalies);
    
    return {
      projectId: project.id,
      reportDate: new Date().toISOString(),
      summary,
      anomalies,
      recommendations: this.generateOverallRecommendations(anomalies),
      riskLevel: this.calculateRiskLevel(summary)
    };
  }

  /**
   * Generates overall recommendations based on anomalies
   */
  private generateOverallRecommendations(anomalies: AnomalyDetectionResult[]): string[] {
    const recommendations: string[] = [];
    
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
    
    if (criticalAnomalies.length > 0) {
      recommendations.push(`Address ${criticalAnomalies.length} critical anomalies immediately`);
    }
    
    if (highSeverityAnomalies.length > 0) {
      recommendations.push(`Review and prioritize ${highSeverityAnomalies.length} high-severity anomalies`);
    }
    
    // Group by type and suggest actions
    const byType: Record<string, AnomalyDetectionResult[]> = {};
    for (const anomaly of anomalies) {
      if (!byType[anomaly.type]) byType[anomaly.type] = [];
      byType[anomaly.type].push(anomaly);
    }
    
    for (const [type, typeAnomalies] of Object.entries(byType)) {
      if (typeAnomalies.length > 3) { // If more than 3 anomalies of same type
        recommendations.push(`Review ${type} management processes - ${typeAnomalies.length} anomalies detected`);
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('No significant anomalies detected requiring immediate action');
    }
    
    return recommendations;
  }

  /**
   * Calculates overall risk level based on anomalies
   */
  private calculateRiskLevel(summary: ReturnType<typeof this.getAnomalySummary>): 'low' | 'medium' | 'high' | 'critical' {
    if (summary.criticalCount > 0) return 'critical';
    if (summary.openCount > 10) return 'high';
    if (summary.openCount > 5) return 'medium';
    return 'low';
  }
}

// Interface for anomaly report
export interface AnomalyReport {
  projectId: string;
  reportDate: string;
  summary: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    openCount: number;
    criticalCount: number;
  };
  anomalies: AnomalyDetectionResult[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Export a singleton instance
export const anomalyDetectionService = new AnomalyDetectionService();