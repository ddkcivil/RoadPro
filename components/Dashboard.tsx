import React, { useEffect, useMemo, useState } from 'react';
import { 
  Box, Grid, Card, CardContent, Typography, 
  IconButton, Chip, Divider, Stack, Button, 
  Tooltip, CircularProgress, Avatar,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Checkbox,
} from '@mui/material';
import { 
  Clock, CheckCircle, TrendingUp, DollarSign, 
  Calendar, ShieldCheck, Sun, Wind, Droplets, ArrowUpRight,
  RefreshCw, Truck, Layers, Sparkles, FileText, AlertTriangle, FileDown, Settings, Move as DragHandle,
  ChevronDown, ChevronUp, LineChart as LineChartIcon
} from 'lucide-react';
import { 
  CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Project, AppSettings, RFIStatus, DashboardWidget } from '../types';
import StatCard from './StatCard';
import { 
  exportBOQToCSV,
  exportStructuresToCSV,
  exportRFIToCSV,
  exportLabTestsToCSV,
  exportSubcontractorPaymentsToCSV,
  exportScheduleToCSV
} from '../utils/exportUtils';
import { getCurrencySymbol } from '../utils/currencyUtils';
import { 
  generateProjectSummaryPDF,
  generateBOQPDF,
  generateStructuresPDF,
  generateRFIPDF
} from '../utils/pdfUtils';

interface Props {
  project: Project;
  settings: AppSettings;
  onUpdateProject: (project: Project) => void;
  onUpdateSettings: (settings: AppSettings) => void;
}

const Dashboard: React.FC<Props> = ({ project, settings, onUpdateProject, onUpdateSettings }) => {
  // Guard clause for null/undefined project
  if (!project) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No project selected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please select a project to view the dashboard
        </Typography>
      </Box>
    );
  }

  const stats = useMemo(() => {
    if (!project || !project.boq) return { earnedValue: 0, totalPlannedValue: 0, actualCost: 0, spi: 0, cpi: 0, physPercent: 0 };
    
    const totalPlannedValue = project.boq.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    const earnedValue = project.boq.reduce((acc, item) => acc + (item.completedQuantity * item.rate), 0);
    const actualCost = (project.subcontractorPayments || []).reduce((acc, p) => acc + p.amount, 0);
    
    // Calculate SPI (Schedule Performance Index) based on planned vs actual progress
    const plannedProgress = project.boq.reduce((acc, item) => {
      const plannedCompletion = (item.completedQuantity / item.quantity) * 100;
      const weightedProgress = (item.quantity * item.rate) * (plannedCompletion / 100);
      return acc + weightedProgress;
    }, 0);
    
    const totalWeight = project.boq.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    const actualProgress = totalWeight > 0 ? plannedProgress / totalWeight : 0;
    
    // Calculate expected progress based on time elapsed
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = new Date().getTime() - startDate.getTime();
    const expectedProgress = totalDuration > 0 ? Math.min(1, elapsedDuration / totalDuration) : 0;
    
    const spi = actualProgress > 0 && expectedProgress > 0 ? actualProgress / expectedProgress : 1;
    const cpi = earnedValue > 0 && actualCost > 0 ? earnedValue / actualCost : 1;

    return { 
        earnedValue, 
        totalPlannedValue, 
        actualCost,
        spi, 
        cpi, 
        physPercent: totalPlannedValue > 0 ? Math.round((earnedValue / totalPlannedValue) * 100) : 0
    };
  }, [project]);

  // Prepare chart data for financial analytics (S-Curve)
  const sCurveData = useMemo(() => {
    if (project.schedule?.length > 0) {
      // Calculate cumulative planned and earned values over time
      const sortedTasks = [...project.schedule].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      let cumulativePlanned = 0;
      let cumulativeEarned = 0;
      
      return sortedTasks.map((task, index) => {
        const plannedValue = 0; // task.budget property doesn't exist in ScheduleTask interface
        const earnedValue = (task.progress / 100) * 0; // task.budget property doesn't exist in ScheduleTask interface
        
        cumulativePlanned += plannedValue;
        cumulativeEarned += earnedValue;
        
        return {
          name: task.name.substring(0, 3),
          'Cumulative Planned': cumulativePlanned,
          'Cumulative Earned': cumulativeEarned,
          'Planned Period': plannedValue,
          'Earned Period': earnedValue
        };
      });
    } else if (project.boq?.length > 0) {
      // Create S-Curve from BOQ data
      const sortedItems = [...project.boq].sort((a, b) => {
        // Sort by some logical order - for now just by rate
        return a.rate - b.rate;
      });
      
      let cumulativePlanned = 0;
      let cumulativeEarned = 0;
      
      return sortedItems.map((item, index) => {
        const plannedValue = item.quantity * item.rate;
        const earnedValue = item.completedQuantity * item.rate;
        
        cumulativePlanned += plannedValue;
        cumulativeEarned += earnedValue;
        
        return {
          name: item.description.substring(0, 3),
          'Cumulative Planned': cumulativePlanned,
          'Cumulative Earned': cumulativeEarned,
          'Planned Period': plannedValue,
          'Earned Period': earnedValue
        };
      });
    } else {
      // Default fallback data
      return [
        { name: 'Jan', 'Cumulative Planned': 4000, 'Cumulative Earned': 2400, 'Planned Period': 4000, 'Earned Period': 2400 },
        { name: 'Feb', 'Cumulative Planned': 7000, 'Cumulative Earned': 3798, 'Planned Period': 3000, 'Earned Period': 1398 },
        { name: 'Mar', 'Cumulative Planned': 9000, 'Cumulative Earned': 13598, 'Planned Period': 2000, 'Earned Period': 9800 },
        { name: 'Apr', 'Cumulative Planned': 11780, 'Cumulative Earned': 17506, 'Planned Period': 2780, 'Earned Period': 3908 },
        { name: 'May', 'Cumulative Planned': 13670, 'Cumulative Earned': 22306, 'Planned Period': 1890, 'Earned Period': 4800 },
        { name: 'Jun', 'Cumulative Planned': 16060, 'Cumulative Earned': 26106, 'Planned Period': 2390, 'Earned Period': 3800 },
        { name: 'Jul', 'Cumulative Planned': 19550, 'Cumulative Earned': 30406, 'Planned Period': 3490, 'Earned Period': 4300 },
      ];
    }
  }, [project]);

  // Prepare chart data for financial analytics (Periodic)
  const financialChartData = useMemo(() => {
    if (project.schedule?.length > 0) {
      return project.schedule.map((task, index) => {
        // Calculate planned and earned values based on task progress and budget
        const plannedValue = 0; // task.budget property doesn't exist in ScheduleTask interface
        const earnedValue = (task.progress / 100) * 0; // task.budget property doesn't exist in ScheduleTask interface
        return {
          name: task.name.substring(0, 3), // Shortened task name
          'Planned Value': plannedValue,
          'Earned Value': earnedValue
        };
      });
    } else {
      // Fallback to BOQ-based chart if no schedule data
      if (project.boq?.length > 0) {
        // Group BOQ items by month based on their estimated completion dates
        const monthlyData: Record<string, { planned: number, earned: number }> = {};
        
        (project.boq || []).forEach(item => {
          const completionRatio = item.completedQuantity / item.quantity;
          const plannedValue = item.quantity * item.rate;
          const earnedValue = item.completedQuantity * item.rate;
          
          // Group by month (simplified as Jan-Jul for demo)
          const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][Object.keys(monthlyData).length % 7] || 'Jan';
          
          if (!monthlyData[month]) {
            monthlyData[month] = { planned: 0, earned: 0 };
          }
          monthlyData[month].planned += plannedValue;
          monthlyData[month].earned += earnedValue;
        });
        
        return Object.entries(monthlyData).slice(0, 7).map(([month, values]) => ({
          name: month,
          'Planned Value': values.planned,
          'Earned Value': values.earned
        }));
      } else {
        // Default fallback data
        return [
          { name: 'Jan', 'Planned Value': 4000, 'Earned Value': 2400 },
          { name: 'Feb', 'Planned Value': 3000, 'Earned Value': 1398 },
          { name: 'Mar', 'Planned Value': 2000, 'Earned Value': 9800 },
          { name: 'Apr', 'Planned Value': 2780, 'Earned Value': 3908 },
          { name: 'May', 'Planned Value': 1890, 'Earned Value': 4800 },
          { name: 'Jun', 'Planned Value': 2390, 'Earned Value': 3800 },
          { name: 'Jul', 'Planned Value': 3490, 'Earned Value': 4300 },
        ];
      }
    }
  }, [project]);

  // Prepare pie chart data for BOQ completion by category
  const boqCategoryData = useMemo(() => {
    if (project.boq?.length > 0) {
      // Group BOQ items by category
      const categoryMap: Record<string, { plannedAmount: number, completedAmount: number }> = {};
      
      (project.boq || []).forEach(item => {
        const category = item.category || 'Uncategorized';
        const plannedAmount = item.quantity * item.rate;
        const completedAmount = item.completedQuantity * item.rate;
        
        if (!categoryMap[category]) {
          categoryMap[category] = { plannedAmount: 0, completedAmount: 0 };
        }
        
        categoryMap[category].plannedAmount += plannedAmount;
        categoryMap[category].completedAmount += completedAmount;
      });
      
      // Convert to array for chart
      return Object.entries(categoryMap).map(([name, values]) => ({
        name,
        value: values.completedAmount, // Using completed amount for now
        planned: values.plannedAmount,
        percent: values.plannedAmount > 0 ? Math.round((values.completedAmount / values.plannedAmount) * 100) : 0
      }));
    } else {
      return [];
    }
  }, [project]);

  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    quality: false,
    fleet: false,
    logistics: false,
    lab: false,
    rfi: false
  });
  const [activeChart, setActiveChart] = useState<'periodic' | 'scumulative'>('scumulative');

  // Toggle card expansion
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Initialize dashboard widgets if not already in settings
  useEffect(() => {
    if (settings && !settings.dashboardWidgets) {
      const defaultWidgets: DashboardWidget[] = [
        { id: 'spi', title: 'Schedule Perf. Index (SPI)', visible: true, position: 0 },
        { id: 'cpi', title: 'Cost Perf. Index (CPI)', visible: true, position: 1 },
        { id: 'ev', title: 'Total Earned Value', visible: true, position: 2 },
        { id: 'pp', title: 'Physical Progress', visible: true, position: 3 },
        { id: 'fa', title: 'Financial Analytics', visible: true, position: 4 },
        { id: 'boc', title: 'BOQ Completion by Category', visible: true, position: 5 },
        { id: 'qs', title: 'Quality & Safety', visible: true, position: 6 },
        { id: 'fm', title: 'Fleet Management', visible: true, position: 7 },
        { id: 'lg', title: 'Logistics', visible: true, position: 8 },
        { id: 'lt', title: 'Lab Testing', visible: true, position: 9 },
        { id: 'rs', title: 'RFIs Summary', visible: true, position: 10 },
        { id: 'ws', title: 'Weather Sentinel', visible: true, position: 11 },
      ];
      
      onUpdateSettings({
        ...settings,
        dashboardWidgets: defaultWidgets
      });
    }
  }, [settings, onUpdateSettings]);

  // Get visible widgets
  const visibleWidgets = useMemo(() => {
    if (!settings.dashboardWidgets) return [];
    return settings.dashboardWidgets
      .filter(widget => widget.visible)
      .sort((a, b) => a.position - b.position);
  }, [settings.dashboardWidgets]);

  const currency = getCurrencySymbol(settings.currency);

  return (
    <>
      <Box>
        <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
          <Box>
              <Typography variant="caption" fontWeight="900" color="primary" sx={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}>PROJECT DASHBOARD</Typography>
              <Typography variant="h4" fontWeight="900" mt={0.5} sx={{ background: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Operations Center</Typography>
          </Box>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={{ xs: 1, sm: 1.5 }} flexWrap="wrap">
              <Button variant="contained" startIcon={<FileDown size={16}/>} sx={{ borderRadius: 2, textTransform: 'none', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', paddingX: 1.5, paddingY: 0.75, minWidth: 120, marginY: { xs: 0.5, sm: 0 } }} onClick={() => generateProjectSummaryPDF(project)}>Generate PDF Report</Button>
              <Button variant="outlined" startIcon={<Settings size={16}/>} sx={{ borderRadius: 2, textTransform: 'none', paddingX: 1.5, paddingY: 0.75, minWidth: 120, marginY: { xs: 0.5, sm: 0 } }} onClick={() => setShowWidgetSettings(true)}>Customize Dashboard</Button>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3} sx={{ mb: { xs: 1, md: 0 } }}>
              <StatCard title="Schedule Perf. Index (SPI)" value={stats.spi.toFixed(2)} icon={Clock} color="#4f46e5" trend="+2.4%" />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ mb: { xs: 1, md: 0 } }}>
              <StatCard title="Cost Perf. Index (CPI)" value={stats.cpi.toFixed(2)} icon={DollarSign} color="#10b981" trend="+0.8%" />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ mb: { xs: 1, md: 0 } }}>
              <StatCard title="Total Earned Value" value={`${currency}${ (stats.earnedValue / 1000000).toFixed(1) }M`} icon={TrendingUp} color="#6366f1" />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ mb: { xs: 1, md: 0 } }}>
              <StatCard title="Physical Progress" value={`${stats.physPercent}%` } icon={CheckCircle} color="#8b5cf6" trend="+1.2%" />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%)', border: '1px solid rgba(79, 70, 229, 0.1)', borderRadius: 3 }}>
              <Box p={1.5} borderBottom="1px solid rgba(79, 70, 229, 0.1)" display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUp size={16} color="#4f46e5"/>
                  <Typography variant="subtitle1" fontWeight="800">Financial Analytics</Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <Chip 
                    label="Periodic" 
                    size="small" 
                    clickable
                    onClick={() => setActiveChart('periodic')}
                    sx={{ 
                      fontWeight: 800, 
                      fontSize: 10, 
                      bgcolor: activeChart === 'periodic' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(226, 232, 240, 0.5)', 
                      color: activeChart === 'periodic' ? '#4f46e5' : 'text.secondary',
                      borderRadius: 1,
                      border: activeChart === 'periodic' ? '1px solid #4f46e5' : '1px solid transparent'
                    }} 
                  />
                  <Chip 
                    label="S-Curve" 
                    size="small" 
                    clickable
                    onClick={() => setActiveChart('scumulative')}
                    sx={{ 
                      fontWeight: 800, 
                      fontSize: 10, 
                      bgcolor: activeChart === 'scumulative' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(226, 232, 240, 0.5)', 
                      color: activeChart === 'scumulative' ? '#4f46e5' : 'text.secondary',
                      borderRadius: 1,
                      border: activeChart === 'scumulative' ? '1px solid #4f46e5' : '1px solid transparent'
                    }} 
                  />
                </Box>
              </Box>
              <CardContent sx={{ p: 1.5 }}>
                <Box height={200}>
                  {activeChart === 'periodic' ? (
                    project.schedule?.length > 0 || project.boq?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={financialChartData}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                          <YAxis hide />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', borderColor: 'rgba(79, 70, 229, 0.2)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                            labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                            formatter={(value, name) => [
                              `${currency}${(Number(value) / 1000).toFixed(1)}k`,
                              name
                            ]}
                          />
                          <Legend iconType="circle" iconSize={8} verticalAlign="top" align="right" wrapperStyle={{ paddingTop: '10px' }} />
                          <Bar dataKey="Earned Value" fill="url(#earnGradient)" radius={[4, 4, 0, 0]} barSize={12} />
                          <Bar dataKey="Planned Value" fill="url(#planGradient)" radius={[4, 4, 0, 0]} barSize={12} />
                          <defs>
                            <linearGradient id="earnGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.4}/>
                            </linearGradient>
                            <linearGradient id="planGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#c7d2fe" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#c7d2fe" stopOpacity={0.4}/>
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Typography color="text.secondary">No schedule data available to display chart.</Typography>
                      </Box>
                    )
                  ) : (
                    project.schedule?.length > 0 || project.boq?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sCurveData}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                          <YAxis hide />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', borderColor: 'rgba(79, 70, 229, 0.2)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                            labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                            formatter={(value, name) => [
                              `${currency}${(Number(value) / 1000).toFixed(1)}k`,
                              name
                            ]}
                          />
                          <Legend iconType="circle" iconSize={8} verticalAlign="top" align="right" wrapperStyle={{ paddingTop: '10px' }} />
                          <Line 
                            type="monotone" 
                            dataKey="Cumulative Planned" 
                            stroke="#c7d2fe" 
                            strokeWidth={2} 
                            dot={{ r: 3 }}
                            activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: 'white' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="Cumulative Earned" 
                            stroke="#4f46e5" 
                            strokeWidth={2} 
                            dot={{ r: 3 }}
                            activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: 'white' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Typography color="text.secondary">No data available to display S-Curve.</Typography>
                      </Box>
                    )
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, rgba(249, 202, 36, 0.03) 100%)', border: '1px solid rgba(245, 158, 11, 0.1)', borderRadius: 3 }}>
              <Box p={1.5} borderBottom="1px solid rgba(245, 158, 11, 0.1)" display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight="800" display="flex" alignItems="center" gap={1}>
                  <Layers size={16} color="#f59e0b"/> BOQ Completion by Category
                </Typography>
              </Box>
              <CardContent sx={{ p: 1.5 }}>
                <Box height={200}>
                  {boqCategoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={boqCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {boqCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={
                              ['#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4', '#f97316', '#8b5cf6'][index % 7]
                            } />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value, name, props) => [`${currency}${Number(value).toLocaleString()}`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                      <Typography color="text.secondary">No BOQ category data available to display chart.</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(34, 197, 94, 0.03) 100%)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: 3 }}>
              <Box p={1.5} borderBottom="1px solid rgba(16, 185, 129, 0.1)" display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                <Typography variant="subtitle1" fontWeight="800" display="flex" alignItems="center" gap={1}>
                  <ShieldCheck size={16} color="#10b981"/>
                  <span>Quality & Safety Overview</span>
                </Typography>
                <IconButton size="small" onClick={() => toggleCardExpansion('quality')}>
                  {expandedCards.quality ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </IconButton>
              </Box>
              <CardContent sx={{ p: 1.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress variant="determinate" value={Math.min(100, Math.round(((project.labTests?.filter(t => t.result === 'Pass').length || 0) / Math.max(1, project.labTests?.length || 1)) * 100))} sx={{ color: '#10b981', width: '50px !important', height: '50px !important' }} size={50} thickness={5} />
                      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" fontWeight="800" color="success.main">{Math.round(((project.labTests?.filter(t => t.result === 'Pass').length || 0) / Math.max(1, project.labTests?.length || 1)) * 100)}%</Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mt: 1, display: 'block' }}>QC Pass Rate</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress variant="determinate" value={Math.min(100, (project.rfis?.filter(rfi => rfi.status !== 'Closed').length || 0) * 33)} sx={{ color: '#f59e0b', width: '50px !important', height: '50px !important' }} size={50} thickness={5} />
                      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" fontWeight="800" color="warning.main">{project.rfis?.filter(rfi => rfi.status !== 'Closed').length || 0}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Open RFIs</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress variant="determinate" value={Math.min(100, ((project.vehicles?.filter(v => v.status === 'Active').length || 0) / Math.max(1, project.vehicles?.length || 1)) * 100)} sx={{ color: '#f59e0b', width: '50px !important', height: '50px !important' }} size={50} thickness={5} />
                      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" fontWeight="800" color="warning.main">{project.vehicles?.filter(v => v.status === 'Active').length || 0}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Active Units</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress variant="determinate" value={Math.min(100, Math.round((project.inventory?.length || 0) * 2))} sx={{ color: '#6366f1', width: '50px !important', height: '50px !important' }} size={50} thickness={5} />
                      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" fontWeight="800" color="primary.main">{project.inventory?.length || 0}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Inventory Items</Typography>
                  </Grid>
                </Grid>
                
                {/* Expanded content - only shown when expanded */}
                {expandedCards.quality && (
                  <Box mt={2}>
                    <Grid container spacing={1}>
                      <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" fontWeight="600" color="text.secondary">Total Lab Tests</Typography>
                        <Typography variant="h6" fontWeight="800" color="text.primary">{project.labTests?.length || 0}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" fontWeight="600" color="text.secondary">Total RFIs</Typography>
                        <Typography variant="h6" fontWeight="800" color="text.primary">{project.rfis?.length || 0}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" fontWeight="600" color="text.secondary">Total Vehicles</Typography>
                        <Typography variant="h6" fontWeight="800" color="text.primary">{project.vehicles?.length || 0}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" fontWeight="600" color="text.secondary">Total NCRs</Typography>
                        <Typography variant="h6" fontWeight="800" color="text.primary">{project.ncrs?.length || 0}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Stack spacing={2}>
              <Card sx={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(124, 58, 237, 0.03) 100%)', border: '1px solid rgba(99, 102, 241, 0.1)', borderRadius: 3 }}>
                <Box p={1.5} borderBottom="1px solid rgba(99, 102, 241, 0.1)" display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                  <Typography variant="subtitle1" fontWeight="800" display="flex" alignItems="center" gap={1}>
                    <Layers size={16} color="#6366f1"/>
                    <span>Logistics</span>
                  </Typography>
                  <IconButton size="small" onClick={() => toggleCardExpansion('logistics')}>
                    {expandedCards.logistics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </IconButton>
                </Box>
                <CardContent sx={{ p: 1.5 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress variant="determinate" value={Math.min(100, Math.round((project.inventory?.length || 0) * 2))} sx={{ color: '#6366f1', width: '50px !important', height: '50px !important' }} size={50} thickness={5} />
                        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="h6" fontWeight="800" color="primary.main">{project.inventory?.length || 0}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Inventory Items</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress variant="determinate" value={Math.min(100, Math.round(((project.purchaseOrders?.filter(po => po.status === 'Received').length || 0) / Math.max(1, project.purchaseOrders?.length || 1)) * 100))} sx={{ color: '#f59e0b', width: '50px !important', height: '50px !important' }} size={50} thickness={5} />
                        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="h6" fontWeight="800" color="warning.main">{Math.round(((project.purchaseOrders?.filter(po => po.status === 'Received').length || 0) / Math.max(1, project.purchaseOrders?.length || 1)) * 100)}%</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Delivery Rate</Typography>
                    </Grid>
                  </Grid>
                  
                  {expandedCards.logistics && (
                    <Box mt={2}>
                      <Grid container spacing={1}>
                        <Grid item xs={6} sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" fontWeight="600" color="text.secondary">POs Pending</Typography>
                          <Typography variant="h6" fontWeight="800" color="text.primary">{project.purchaseOrders?.filter(po => po.status === 'Draft' || po.status === 'Issued').length || 0}</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" fontWeight="600" color="text.secondary">In Transit</Typography>
                          <Typography variant="h6" fontWeight="800" color="text.primary">{project.purchaseOrders?.filter(po => po.status === 'Received').length || 0}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
              
              <Card sx={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)', border: '1px solid rgba(139, 92, 246, 0.1)', borderRadius: 3 }}>
                <Box p={1.5} borderBottom="1px solid rgba(139, 92, 246, 0.1)" display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                  <Typography variant="subtitle1" fontWeight="800" display="flex" alignItems="center" gap={1}>
                    <Sparkles size={16} color="#8b5cf6"/>
                    <span>Lab Testing</span>
                  </Typography>
                  <IconButton size="small" onClick={() => toggleCardExpansion('lab')}>
                    {expandedCards.lab ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </IconButton>
                </Box>
                <CardContent sx={{ p: 1.5 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress variant="determinate" value={Math.min(100, Math.round((project.labTests?.length || 0) * 2))} sx={{ color: '#8b5cf6', width: '50px !important', height: '50px !important' }} size={50} thickness={5} />
                        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="h6" fontWeight="800" color="secondary.main">{project.labTests?.length || 0}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Tests Done</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress variant="determinate" value={Math.min(100, Math.round(((project.labTests?.filter(test => test.result === 'Pass').length || 0) / Math.max(1, project.labTests?.length || 1)) * 100))} sx={{ color: '#10b981', width: '50px !important', height: '50px !important' }} size={50} thickness={5} />
                        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="h6" fontWeight="800" color="success.main">{Math.round(((project.labTests?.filter(test => test.result === 'Pass').length || 0) / Math.max(1, project.labTests?.length || 1)) * 100)}%</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Pass Rate</Typography>
                    </Grid>
                  </Grid>
                  
                  {expandedCards.lab && (
                    <Box mt={2}>
                      <Grid container spacing={1}>
                        <Grid item xs={6} sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" fontWeight="600" color="text.secondary">Failed Tests</Typography>
                          <Typography variant="h6" fontWeight="800" color="text.primary">{project.labTests?.filter(test => test.result === 'Fail').length || 0}</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" fontWeight="600" color="text.secondary">Pending Tests</Typography>
                          <Typography variant="h6" fontWeight="800" color="text.primary">{project.labTests?.filter(test => test.result === 'Pending').length || 0}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
              
              <Card sx={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.03) 0%, rgba(248, 113, 113, 0.03) 100%)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: 3 }}>
                <Box p={1.5} borderBottom="1px solid rgba(239, 68, 68, 0.1)" display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                  <Typography variant="subtitle1" fontWeight="800" display="flex" alignItems="center" gap={1}>
                    <FileText size={16} color="#ef4444"/>
                    <span>RFIs Summary</span>
                  </Typography>
                  <IconButton size="small" onClick={() => toggleCardExpansion('rfi')}>
                    {expandedCards.rfi ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </IconButton>
                </Box>
                <CardContent sx={{ p: 1.5 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress variant="determinate" value={Math.min(100, Math.round(((project.rfis?.filter(rfi => rfi.status !== 'Closed').length || 0) / Math.max(1, project.rfis?.length || 1)) * 100))} sx={{ color: '#ef4444', width: '50px !important', height: '50px !important' }} size={50} thickness={5} />
                        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="h6" fontWeight="800" color="error.main">{project.rfis?.filter(rfi => rfi.status !== 'Closed').length || 0}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Pending</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress variant="determinate" value={Math.min(100, Math.round(((project.rfis?.filter(rfi => rfi.status === 'Closed').length || 0) / Math.max(1, project.rfis?.length || 1)) * 100))} sx={{ color: '#10b981', width: '50px !important', height: '50px !important' }} size={50} thickness={5} />
                        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="h6" fontWeight="800" color="success.main">{Math.round(((project.rfis?.filter(rfi => rfi.status === 'Closed').length || 0) / Math.max(1, project.rfis?.length || 1)) * 100)}%</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Resolved</Typography>
                    </Grid>
                  </Grid>
                  
                  {expandedCards.rfi && (
                    <Box mt={2}>
                      <Grid container spacing={1}>
                        <Grid item xs={6} sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" fontWeight="600" color="text.secondary">Approved</Typography>
                          <Typography variant="h6" fontWeight="800" color="text.primary">{project.rfis?.filter(rfi => rfi.status === 'Approved').length || 0}</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" fontWeight="600" color="text.secondary">Rejected</Typography>
                          <Typography variant="h6" fontWeight="800" color="text.primary">{project.rfis?.filter(rfi => rfi.status === 'Rejected').length || 0}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
              
              <Card sx={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', position: 'relative', overflow: 'hidden', borderRadius: 3 }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)', backgroundSize: '200% 200%', animation: 'gradientShift 3s ease infinite' }} />
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight="800" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }} gutterBottom>Weather Sentinel</Typography>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      {project.weather?.icon === 'Sun' && <Sun size={30} color="#fbbf24" />}
                      {project.weather?.icon === 'Cloud' && <Droplets size={30} color="#9ca3af" />}
                      {project.weather?.icon === 'CloudFog' && <Droplets size={30} color="#9ca3af" />}
                      {project.weather?.icon === 'CloudRain' && <Droplets size={30} color="#60a5fa" />}
                      {project.weather?.icon === 'CloudSnow' && <Droplets size={30} color="#e0f2fe" />}
                      {project.weather?.icon === 'CloudLightning' && <Wind size={30} color="#fbbf24" />}
                      <Typography variant="h5" fontWeight="800">{project.weather?.temp}°C</Typography>
                    </Box>
                    <Box textAlign="right">
                      <Box display="flex" gap={1} alignItems="center">
                        <Tooltip title="Humidity">
                          <Box display="flex" alignItems="center" gap={0.5}><Droplets size={12} color="#60a5fa" /> <Typography variant="body2" fontWeight="600">{project.weather?.humidity}%</Typography></Box>
                        </Tooltip>
                        <Tooltip title="Wind Speed">
                          <Box display="flex" alignItems="center" gap={0.5}><Wind size={12} color="#60a5fa" /> <Typography variant="body2" fontWeight="600">{project.weather?.windSpeed} km/h</Typography></Box>
                        </Tooltip>
                      </Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mt: 1, fontSize: '0.75rem' }}>{project.weather?.condition || 'Weather data unavailable'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
                <style>{`
                  @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                `}</style>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>
      
      {/* Dashboard Widget Settings Modal */}
      <Dialog open={showWidgetSettings} onClose={() => setShowWidgetSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Customize Dashboard</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select which widgets to show on your dashboard and reorder them.
          </DialogContentText>
          <List>
            {settings.dashboardWidgets?.sort((a, b) => a.position - b.position).map((widget, index) => (
              <ListItem key={widget.id} sx={{ p: 0, mb: 1 }}>
                <ListItemButton sx={{ borderRadius: 2 }}>
                  <ListItemIcon>
                    <DragHandle size={20} />
                  </ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={widget.visible}
                    onChange={(e) => {
                      const updatedWidgets = settings.dashboardWidgets?.map(w => 
                        w.id === widget.id ? { ...w, visible: e.target.checked } : w
                      ) || [];
                      
                      // Sort by position after update
                      updatedWidgets.sort((a, b) => a.position - b.position);
                      
                      onUpdateSettings({
                        ...settings,
                        dashboardWidgets: updatedWidgets
                      });
                    }}
                    disableRipple
                  />
                  <ListItemText primary={widget.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWidgetSettings(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dashboard;