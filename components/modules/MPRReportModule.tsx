import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Chip, Avatar, Divider, List, ListItem, ListItemText,
  Accordion, AccordionSummary, AccordionDetails, Alert
} from '@mui/material';
import { 
  FileText, Calendar, Users, HardHat, FileSpreadsheet, TrendingUp,
  CheckCircle, AlertTriangle, MapPin, Image as ImageIcon, 
  Receipt, Shield, Trees, FileSignature, 
  MessageSquare, Camera, BookOpen, ChevronDown
} from 'lucide-react';
import { Project, UserRole, AppSettings, BOQItem, ScheduleTask, LabTest, NCR, RFI, RFIStatus, StructureAsset, Vehicle, InventoryItem, DailyReport, PreConstructionTask, LandParcel, MapOverlay, EnvironmentRegistry, WeatherInfo } from '../../types';
import { formatCurrency } from '../../utils/formatting/exportUtils';

interface Props {
  project: Project;
  userRole: UserRole;
  settings: AppSettings;
  onProjectUpdate: (project: Project) => void;
}

const MPRReportModule: React.FC<Props> = ({ project, settings, onProjectUpdate, userRole }) => {
  const [reportMonth, setReportMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [activeTab, setActiveTab] = useState(0);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
  // Calculate project statistics
  const financialSummary = {
    original: project.boq.reduce((acc, item) => acc + (item.quantity * item.rate), 0),
    variation: project.boq.reduce((acc, item) => acc + ((item.variationQuantity || 0) * item.rate), 0),
    revised: project.boq.reduce((acc, item) => acc + (item.quantity * item.rate) + ((item.variationQuantity || 0) * item.rate), 0),
    progressValue: project.boq.reduce((acc, item) => acc + (item.completedQuantity * item.rate), 0)
  };

  const physicalProgress = {
    planned: project.schedule.reduce((acc, task) => acc + (task.progress / 100), 0) / project.schedule.length || 0,
    actual: project.boq.reduce((acc, item) => acc + (item.completedQuantity / item.quantity), 0) / project.boq.length || 0
  };

  const handleGenerateReport = () => {
    setIsExportDialogOpen(true);
  };

  const handleExport = () => {
    alert('Monthly Progress Report would be exported in the specified format');
    setIsExportDialogOpen(false);
  };

  const getWeatherData = () => {
    if (!project.weather) return null;
    return project.weather;
  };

  const getEnvironmentalData = () => {
    return project.environmentRegistry || null;
  };

  const getSafetyData = () => {
    const activeNCRs = project.ncrs.filter(ncr => ncr.status !== 'Closed');
    const openRFIs = project.rfis.filter(rfi => rfi.status !== RFIStatus.CLOSED);
    return { activeNCRs, openRFIs };
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', gap: 3 }}>
      <Paper sx={{ width: 300, borderRadius: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} variant="outlined">
        <Box p={2.5} borderBottom="1px solid #f1f5f9" bgcolor="slate.50">
          <Typography variant="h6" fontWeight="900">MPR Generator</Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Monthly Progress Report
          </Typography>
          
          <TextField
            label="Reporting Month"
            type="month"
            fullWidth
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<FileText size={18}/>}
            onClick={handleGenerateReport}
            sx={{ borderRadius: 3 }}
          >
            Generate MPR
          </Button>
        </Box>
        
        <Box flex={1} p={2} overflow="auto">
          <Typography variant="subtitle2" fontWeight="bold" mb={2}>PROJECT STATS</Typography>
          
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'slate.50' }}>
                <Typography variant="caption" color="text.secondary">Planned</Typography>
                <Typography variant="h6" fontWeight="bold">{(physicalProgress.planned * 100).toFixed(1)}%</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'slate.50' }}>
                <Typography variant="caption" color="text.secondary">Actual</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">{(physicalProgress.actual * 100).toFixed(1)}%</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <List disablePadding>
            <ListItem disablePadding sx={{ py: 0.5 }}>
              <ListItemText 
                primary="BOQ Items" 
                secondary={project.boq.length.toString()} 
                primaryTypographyProps={{ variant: 'caption', fontWeight: 'bold' }}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 0.5 }}>
              <ListItemText 
                primary="Active Tasks" 
                secondary={project.schedule.filter(t => t.status !== 'Completed').length.toString()} 
                primaryTypographyProps={{ variant: 'caption', fontWeight: 'bold' }}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 0.5 }}>
              <ListItemText 
                primary="Structures" 
                secondary={project.structures?.length.toString() || '0'} 
                primaryTypographyProps={{ variant: 'caption', fontWeight: 'bold' }}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 0.5 }}>
              <ListItemText 
                primary="Active NCRs" 
                secondary={project.ncrs.filter(n => n.status !== 'Closed').length.toString()} 
                primaryTypographyProps={{ variant: 'caption', fontWeight: 'bold' }}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </Box>
      </Paper>

      <Box flex={1} overflow="auto">
        <Tabs 
          value={activeTab} 
          onChange={(e, newVal) => setActiveTab(newVal)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Executive Summary" />
          <Tab label="Physical Progress" />
          <Tab label="Financial Progress" />
          <Tab label="Resources" />
          <Tab label="Quality & Safety" />
          <Tab label="Environmental" />
          <Tab label="Endorsement" />
          <Tab label="Issues" />
          <Tab label="Photos" />
        </Tabs>

        <Box p={3}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <FileSpreadsheet size={20} className="text-indigo-600" /> Financial Overview
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary">Original</Typography>
                          <Typography variant="h6" fontWeight="bold">{formatCurrency(financialSummary.original, settings)}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary">Variation</Typography>
                          <Typography variant="h6" fontWeight="bold">{formatCurrency(financialSummary.variation, settings)}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary">Revised</Typography>
                          <Typography variant="h6" fontWeight="bold">{formatCurrency(financialSummary.revised, settings)}</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Box mt={2}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>Progress Value</Typography>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'slate.50' }}>
                        <Typography variant="h5" fontWeight="900" color="success.main">
                          {formatCurrency(financialSummary.progressValue, settings)}
                        </Typography>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <TrendingUp size={20} className="text-indigo-600" /> Physical Progress
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">Planned vs Actual</Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Box flex={1} display="flex" alignItems="center" gap={1}>
                            <Box width="100%" height={8} bgcolor="slate.200" borderRadius={4} overflow="hidden">
                              <Box width={`${physicalProgress.planned * 100}%`} height="100%" bgcolor="primary.main" />
                            </Box>
                            <Typography variant="caption">{(physicalProgress.planned * 100).toFixed(1)}%</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box mt={2}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>Key Metrics</Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold" color="success.main">+12%</Typography>
                            <Typography variant="caption">MoM Growth</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold" color="error.main">-3%</Typography>
                            <Typography variant="caption">Delay</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <Calendar size={20} className="text-indigo-600" /> Contract & Timeline
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary" display="block">Contract Duration</Typography>
                          <Typography variant="h6" fontWeight="900">{project.contractPeriod || 'TBD'}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary" display="block">Elapsed Time</Typography>
                          <Typography variant="h6" fontWeight="900">{(project.schedule.length > 0 ? project.schedule.filter(s => s.status === 'Completed').length / project.schedule.length * 100 : 0).toFixed(1)}%</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Box mt={2}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>Milestones</Typography>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'slate.50' }}>
                        <Typography variant="body2">{project.milestones?.length || 0} Total, {project.milestones?.filter(m => m.status === 'Completed').length || 0} Completed</Typography>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <Users size={20} className="text-indigo-600" /> Key Personnel
                    </Typography>
                    
                    <List dense>
                      <ListItem disablePadding>
                        <ListItemText 
                          primary="Project Manager" 
                          secondary={project.projectManager || 'TBD'} 
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemText 
                          primary="Engineer" 
                          secondary={project.engineer || 'TBD'} 
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemText 
                          primary="Supervisor" 
                          secondary={project.supervisor || 'TBD'} 
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <BookOpen size={20} className="text-indigo-600" /> Project Summary
                    </Typography>
                    
                    <Typography variant="body2" paragraph>
                      The project is currently executing {project.boq.length} BOQ items across {project.structures?.length || 0} structural assets. 
                      As of {new Date().toLocaleDateString()}, the physical progress stands at {(physicalProgress.actual * 100).toFixed(1)}% against 
                      the planned {(physicalProgress.planned * 100).toFixed(1)}%. The project value stands at {formatCurrency(financialSummary.revised, settings)} 
                      with a progress value of {formatCurrency(financialSummary.progressValue, settings)}.
                    </Typography>
                    
                    <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                      <Chip icon={<CheckCircle size={14}/>} label="On Track" color="success" size="small" />
                      <Chip icon={<AlertTriangle size={14}/>} label="Weather Delays" color="warning" size="small" />
                      <Chip icon={<Shield size={14}/>} label="Safety Compliant" color="success" size="small" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 6 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <FileSignature size={20} className="text-indigo-600" /> Endorsement Sheet
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary" display="block">Project Manager</Typography>
                          <Typography variant="body2" fontWeight="bold">{project.projectManager || 'TBD'}</Typography>
                          <Typography variant="caption" color="text.secondary">Signature: ________________ Date: {new Date().toLocaleDateString()}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary" display="block">Supervision Consultant</Typography>
                          <Typography variant="body2" fontWeight="bold">{project.consultantName || 'BDA-BN-UDAYA JV'}</Typography>
                          <Typography variant="caption" color="text.secondary">Signature: ________________ Date: {new Date().toLocaleDateString()}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary" display="block">Project Implementation Unit</Typography>
                          <Typography variant="body2" fontWeight="bold">{project.clientName || 'PIU'}</Typography>
                          <Typography variant="caption" color="text.secondary">Signature: ________________ Date: {new Date().toLocaleDateString()}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary" display="block">Funding Agency Representative</Typography>
                          <Typography variant="body2" fontWeight="bold">Asian Development Bank</Typography>
                          <Typography variant="caption" color="text.secondary">Signature: ________________ Date: {new Date().toLocaleDateString()}</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 7 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <MessageSquare size={20} className="text-indigo-600" /> Issue Register
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Issue ID</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Priority</TableCell>
                            <TableCell align="right">Status</TableCell>
                            <TableCell align="right">Date Raised</TableCell>
                            <TableCell align="right">Target Resolution</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[
                            ...project.ncrs.map((ncr, i) => ({
                              id: `NCR-${i + 1}`,
                              description: ncr.description.substring(0, 50),
                              priority: 'High',
                              status: ncr.status as any,
                              dateRaised: ncr.date || 'TBD',
                              targetResolution: 'TBD'
                            })),
                            ...project.rfis.map((rfi, i) => ({
                              id: `RFI-${i + 1}`,
                              description: rfi.question.substring(0, 50),
                              priority: rfi.priority || 'Medium',
                              status: rfi.status as any,
                              dateRaised: rfi.date || 'TBD',
                              targetResolution: rfi.responseDate || 'TBD'
                            }))
                          ].slice(0, 10).map((issue, index) => (
                            <TableRow key={index}>
                              <TableCell>{issue.id}</TableCell>
                              <TableCell>{issue.description}</TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={issue.priority} 
                                  size="small"
                                  color={issue.priority === 'High' ? 'error' : issue.priority === 'Medium' ? 'warning' : 'info'}
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={issue.status} 
                                  size="small"
                                  color={String(issue.status) === String('Closed') || String(issue.status) === String(RFIStatus.CLOSED) ? 'success' : 'warning'}
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </TableCell>
                              <TableCell align="right">{issue.dateRaised}</TableCell>
                              <TableCell align="right">{issue.targetResolution}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 8 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <Camera size={20} className="text-indigo-600" /> Site Photographs
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {project.dailyReports?.slice(0, 8).flatMap(report => 
                        report.photos?.map((photo, idx) => (
                          <Grid key={`${report.id}-${idx}`} item xs={12} sm={6} md={4} lg={3}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 1, 
                                textAlign: 'center', 
                                cursor: 'pointer',
                                '&:hover': { boxShadow: 3 }
                              }}
                              onClick={() => alert(`Photo preview would open: ${photo.url}`)}
                            >
                              <Box 
                                component="img" 
                                src={photo.url || '/placeholder-image.jpg'} 
                                alt={photo.caption || 'Site photo'}
                                sx={{ 
                                  width: '100%', 
                                  height: 120, 
                                  objectFit: 'cover',
                                  borderRadius: 1 
                                }}
                              />
                              <Typography variant="caption" display="block" mt={1} noWrap>
                                {photo.caption || `Site photo ${idx + 1}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {report.date || 'Unknown date'}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))
                      ) || []}
                    </Grid>
                    
                    <Box mt={3} textAlign="center">
                      <Button 
                        variant="outlined" 
                        startIcon={<ImageIcon size={16} />}
                        onClick={() => alert('Photo gallery would open in full view')}
                      >
                        View All Photos ({project.dailyReports?.reduce((count, report) => 
                          count + (report.photos?.length || 0), 0) || 0})
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2}>BOQ Progress Analysis</Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Item No</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Planned Qty</TableCell>
                            <TableCell align="right">Completed Qty</TableCell>
                            <TableCell align="right">Progress %</TableCell>
                            <TableCell align="right">Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {project.boq.slice(0, 10).map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.itemNo}</TableCell>
                              <TableCell>{item.description.substring(0, 30)}...</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">{item.completedQuantity}</TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={`${((item.completedQuantity / item.quantity) * 100).toFixed(1)}%`} 
                                  size="small"
                                  color={item.completedQuantity === item.quantity ? 'success' : 'primary'}
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </TableCell>
                              <TableCell align="right">{formatCurrency(item.completedQuantity * item.rate, settings)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2}>Progress Visualization</Typography>
                    
                    <Box height={300} display="flex" alignItems="flex-end" gap={1}>
                      {project.boq.slice(0, 12).map((item, index) => (
                        <Box key={index} flex={1} display="flex" flexDirection="column" alignItems="center">
                          <Box 
                            height={`${(item.completedQuantity / item.quantity) * 100}%`} 
                            width="100%" 
                            bgcolor={item.completedQuantity === item.quantity ? 'success.main' : 'primary.main'}
                            borderRadius={1}
                            title={`${item.description}: ${(item.completedQuantity / item.quantity) * 100}%`}
                          />
                          <Typography variant="caption" mt={1} align="center">{item.itemNo}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <Calendar size={20} className="text-indigo-600" /> Pre-Construction Activities
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Activity</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Start Date</TableCell>
                            <TableCell align="right">End Date</TableCell>
                            <TableCell align="right">Progress</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {project.preConstruction?.slice(0, 5).map((task, index) => (
                            <TableRow key={index}>
                              <TableCell>{task.description.substring(0, 30)}...</TableCell>
                              <TableCell>
                                <Chip 
                                  label={task.status} 
                                  size="small"
                                  color={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'primary' : 'warning'}
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </TableCell>
                              <TableCell align="right">{task.startDate || 'TBD'}</TableCell>
                              <TableCell align="right">{task.endDate || 'TBD'}</TableCell>
                              <TableCell align="right">{task.progress || 0}%</TableCell>
                            </TableRow>
                          )) || []}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2}>Financial Progress</Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary">Budget Allocated</Typography>
                          <Typography variant="h5" fontWeight="900">{formatCurrency(financialSummary.revised, settings)}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary">Expended</Typography>
                          <Typography variant="h5" fontWeight="900" color="success.main">{formatCurrency(financialSummary.progressValue, settings)}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary">Balance</Typography>
                          <Typography variant="h5" fontWeight="900" color="warning.main">
                            {formatCurrency(financialSummary.revised - financialSummary.progressValue, settings)}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary">Utilization</Typography>
                          <Typography variant="h5" fontWeight="900">
                            {((financialSummary.progressValue / financialSummary.revised) * 100).toFixed(1)}%
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2}>Financial Trend</Typography>
                    
                    <Box height={200} display="flex" alignItems="flex-end" gap={1} mt={4}>
                      {[60, 65, 70, 75, 80, 85, 90].map((val, index) => (
                        <Box key={index} flex={1} display="flex" flexDirection="column" alignItems="center">
                          <Box 
                            height={`${val}%`} 
                            width="100%" 
                            bgcolor="success.main"
                            borderRadius={1}
                          />
                          <Typography variant="caption" mt={1}>{index + 1}M</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <Receipt size={20} className="text-indigo-600" /> Cost Variance Analysis
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>BOQ Item</TableCell>
                            <TableCell align="right">Budgeted</TableCell>
                            <TableCell align="right">Actual</TableCell>
                            <TableCell align="right">Variance</TableCell>
                            <TableCell align="right">Variance %</TableCell>
                            <TableCell align="right">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {project.boq.slice(0, 5).map((item, index) => {
                            const budgeted = item.quantity * item.rate;
                            const actual = item.completedQuantity * item.rate;
                            const variance = actual - budgeted;
                            const variancePercent = budgeted !== 0 ? (variance / budgeted) * 100 : 0;
                            
                            return (
                              <TableRow key={index}>
                                <TableCell>{item.description.substring(0, 30)}...</TableCell>
                                <TableCell align="right">{formatCurrency(budgeted, settings)}</TableCell>
                                <TableCell align="right">{formatCurrency(actual, settings)}</TableCell>
                                <TableCell align="right" sx={{ color: variance >= 0 ? 'success.main' : 'error.main' }}>
                                  {formatCurrency(variance, settings)}
                                </TableCell>
                                <TableCell align="right" sx={{ color: variancePercent >= 0 ? 'success.main' : 'error.main' }}>
                                  {variancePercent.toFixed(2)}%
                                </TableCell>
                                <TableCell align="right">
                                  <Chip 
                                    label={variance >= 0 ? 'Under Budget' : 'Over Budget'} 
                                    size="small"
                                    color={variance >= 0 ? 'success' : 'error'}
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <Users size={20} className="text-indigo-600" /> Personnel Deployment
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Deployed</TableCell>
                            <TableCell align="right">Available</TableCell>
                            <TableCell align="right">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Engineers</TableCell>
                            <TableCell align="right">{project.personnel?.filter(p => p.role === 'Engineer' && p.assigned).length || 0}</TableCell>
                            <TableCell align="right">{project.personnel?.filter(p => p.role === 'Engineer' && !p.assigned).length || 0}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label="Active" 
                                size="small"
                                color="success"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Skilled Workers</TableCell>
                            <TableCell align="right">{project.personnel?.filter(p => p.role === 'Skilled Worker' && p.assigned).length || 0}</TableCell>
                            <TableCell align="right">{project.personnel?.filter(p => p.role === 'Skilled Worker' && !p.assigned).length || 0}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label="Active" 
                                size="small"
                                color="success"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Unskilled Workers</TableCell>
                            <TableCell align="right">{project.personnel?.filter(p => p.role === 'Unskilled Worker' && p.assigned).length || 0}</TableCell>
                            <TableCell align="right">{project.personnel?.filter(p => p.role === 'Unskilled Worker' && !p.assigned).length || 0}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label="Active" 
                                size="small"
                                color="success"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <HardHat size={20} className="text-indigo-600" /> Equipment Deployment
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Equipment</TableCell>
                            <TableCell align="right">Active</TableCell>
                            <TableCell align="right">Maintenance</TableCell>
                            <TableCell align="right">Available</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {project.fleet?.slice(0, 5).map((vehicle, index) => (
                            <TableRow key={index}>
                              <TableCell>{vehicle.name}</TableCell>
                              <TableCell align="right">{vehicle.status === 'Active' ? 1 : 0}</TableCell>
                              <TableCell align="right">{vehicle.status === 'Maintenance' ? 1 : 0}</TableCell>
                              <TableCell align="right">{vehicle.status === 'Available' ? 1 : 0}</TableCell>
                            </TableRow>
                          )) || []}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <ImageIcon size={20} className="text-indigo-600" /> Material Status
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Material</TableCell>
                            <TableCell align="right">Required</TableCell>
                            <TableCell align="right">Received</TableCell>
                            <TableCell align="right">Stock</TableCell>
                            <TableCell align="right">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {project.inventory?.slice(0, 5).map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.itemName || item.name}</TableCell>
                              <TableCell align="right">{(item.requiredQuantity ?? item.quantity) || 0}</TableCell>
                              <TableCell align="right">{item.receivedQuantity ?? 0}</TableCell>
                              <TableCell align="right">{(item.currentQuantity ?? item.quantity) || 0}</TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={item.currentQuantity && item.requiredQuantity ? 
                                    (item.currentQuantity >= item.requiredQuantity ? 'Sufficient' : 'Low Stock') : 'TBD'} 
                                  size="small"
                                  color={item.currentQuantity && item.requiredQuantity ? 
                                    (item.currentQuantity >= item.requiredQuantity ? 'success' : 'warning') : 'default'}
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </TableCell>
                            </TableRow>
                          )) || []}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <Shield size={20} className="text-indigo-600" /> Safety Status
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary">Active NCRs</Typography>
                          <Typography variant="h4" fontWeight="900" color="error.main">
                            {project.ncrs.filter(n => n.status !== 'Closed').length}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'slate.50' }}>
                          <Typography variant="caption" color="text.secondary">Open RFIs</Typography>
                          <Typography variant="h4" fontWeight="900" color="warning.main">
                            {project.rfis.filter(r => r.status !== RFIStatus.CLOSED).length}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Box mt={2}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>Recent Safety Incidents</Typography>
                      {project.ncrs.slice(0, 3).map((ncr, index) => (
                        <Alert key={index} severity="warning" sx={{ mb: 1, fontSize: '0.8rem' }}>
                          {ncr.description.substring(0, 50)}...
                        </Alert>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <Trees size={20} className="text-indigo-600" /> Environmental Status
                    </Typography>
                    
                    <Accordion>
                      <AccordionSummary expandIcon={<ChevronDown />}>
                        <Typography variant="body2" fontWeight="bold">Tree Management</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="caption">Trees Removed: {getEnvironmentalData()?.treesRemoved || 0}</Typography><br />
                        <Typography variant="caption">Trees Planted: {getEnvironmentalData()?.treesPlanted || 0}</Typography>
                      </AccordionDetails>
                    </Accordion>
                    
                    <Accordion>
                      <AccordionSummary expandIcon={<ChevronDown />}>
                        <Typography variant="body2" fontWeight="bold">Water Sprinkling</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="caption">Last 7 days operations: {getEnvironmentalData()?.sprinklingLogs?.length || 0}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 5 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="900" mb={2} display="flex" alignItems="center" gap={1}>
                      <MapPin size={20} className="text-indigo-600" /> Weather & Location
                    </Typography>
                    
                    {getWeatherData() ? (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'slate.50' }}>
                            <Typography variant="caption" color="text.secondary">Temperature</Typography>
                            <Typography variant="h4" fontWeight="900">{getWeatherData()?.temp}°C</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'slate.50' }}>
                            <Typography variant="caption" color="text.secondary">Condition</Typography>
                            <Typography variant="h4" fontWeight="900">{getWeatherData()?.condition}</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    ) : (
                      <Alert severity="info">Weather data not available for this project</Alert>
                    )}
                    
                    <Box mt={2}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>Impact on Schedule</Typography>
                      <Typography variant="body2">
                        {getWeatherData()?.impactOnSchedule === 'None' 
                          ? 'No impact on construction activities' 
                          : `Currently experiencing ${getWeatherData()?.impactOnSchedule} impact`}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>

      <Dialog 
        open={isExportDialogOpen} 
        onClose={() => setIsExportDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
          Export Monthly Progress Report
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Your report will be generated in the required MPR format with all project data as of {new Date(reportMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}.
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText 
                primary="Project Information" 
                secondary="Client, Contractor, Contract Details" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Physical Progress" 
                secondary="BOQ Completion, Work Activities" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Financial Progress" 
                secondary="Budget Utilization, Cost Analysis" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Quality & Safety" 
                secondary="NCRs, RFIs, Safety Records" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Environmental Data" 
                secondary="EMP Implementation Status" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Endorsement Sheet" 
                secondary="Signatures from stakeholders" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Issue Register" 
                secondary="Tracking of open issues" 
              />
            </ListItem>
          </List>
          
          <Box mt={3}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>Report Approval Workflow</Typography>
            
            <List>
              <ListItem>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 32, height: 32, mr: 2 }}>
                  <Users size={16} />
                </Avatar>
                <ListItemText 
                  primary="Project Manager Review" 
                  secondary="Initial review and validation" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Chip label="Pending" size="small" color="warning" />
              </ListItem>
              <ListItem>
                <Avatar sx={{ bgcolor: 'info.light', color: 'info.main', width: 32, height: 32, mr: 2 }}>
                  <Shield size={16} />
                </Avatar>
                <ListItemText 
                  primary="SDC Validation" 
                  secondary="Technical validation by SDC" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Chip label="Pending" size="small" color="default" />
              </ListItem>
              <ListItem>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 32, height: 32, mr: 2 }}>
                  <FileSignature size={16} />
                </Avatar>
                <ListItemText 
                  primary="PIU Approval" 
                  secondary="Final approval by PIU" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Chip label="Pending" size="small" color="default" />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleExport}>Export Report</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MPRReportModule;