import React, { useState } from 'react';
import { 
    Box, Typography, Button, Grid, Card, CardContent, Stack,
    Paper, Divider, List, ListItem, ListItemText, ListItemIcon,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, Chip, Avatar, Tooltip
} from '@mui/material';
import { 
    Download, FileText, FileSpreadsheet, FileCode, Archive,
    Package, Ruler, FileSignature, HardHat, Scale,
    FileChartColumn, Calendar, Users, MapPin, Receipt,
    X, CheckCircle, AlertTriangle, Info
} from 'lucide-react';
import { Project, UserRole, AppSettings } from '../types';
import { 
    exportBOQToCSV, 
    exportStructuresToCSV, 
    exportRFIToCSV, 
    exportLabTestsToCSV, 
    exportSubcontractorPaymentsToCSV, 
    exportScheduleToCSV 
} from '../utils/exportUtils';

interface Props {
    project: Project;
    userRole: UserRole;
    settings: AppSettings;
    onProjectUpdate: (project: Project) => void;
}

const OutputExportModule: React.FC<Props> = ({ project, settings, onProjectUpdate, userRole }) => {
    const [activeExport, setActiveExport] = useState<string | null>(null);
    const [exportStatus, setExportStatus] = useState<Record<string, 'idle' | 'processing' | 'success' | 'error'>>({});

    const exportOptions = [
        {
            id: 'boq',
            title: 'BOQ Data Export',
            description: 'Export Bill of Quantities with rates and quantities',
            icon: FileText,
            dataCount: project.boq.length,
            color: '#4f46e5',
            handler: () => handleExportBOQ()
        },
        {
            id: 'structures',
            title: 'Structural Assets Export',
            description: 'Export all structural components and progress',
            icon: Ruler,
            dataCount: project.structures?.reduce((acc, s) => acc + s.components.length, 0) || 0,
            color: '#059669',
            handler: () => handleExportStructures()
        },
        {
            id: 'schedule',
            title: 'Schedule Export',
            description: 'Export project schedule and task progress',
            icon: Calendar,
            dataCount: project.schedule.length,
            color: '#dc2626',
            handler: () => handleExportSchedule()
        },
        {
            id: 'rfis',
            title: 'RFI/Inspections Export',
            description: 'Export all Requests for Information and inspections',
            icon: FileSignature,
            dataCount: project.rfis.length,
            color: '#7c3aed',
            handler: () => handleExportRFIs()
        },
        {
            id: 'lab-tests',
            title: 'Lab Tests Export',
            description: 'Export all material testing results',
            icon: Scale,
            dataCount: project.labTests.length,
            color: '#0891b2',
            handler: () => handleExportLabTests()
        },
        {
            id: 'payments',
            title: 'Subcontractor Payments Export',
            description: 'Export all subcontractor payment records',
            icon: Receipt,
            dataCount: project.agencyPayments?.length || 0,
            color: '#ea580c',
            handler: () => handleExportPayments()
        },
        {
            id: 'daily-reports',
            title: 'Daily Reports Export',
            description: 'Export all daily progress reports',
            icon: FileChartColumn,
            dataCount: project.dailyReports?.length || 0,
            color: '#ca8a04',
            handler: () => handleExportDailyReports()
        },
        {
            id: 'environment',
            title: 'Environmental Data Export',
            description: 'Export environmental compliance records',
            icon: MapPin,
            dataCount: project.environmentRegistry?.treeLogs.length + project.environmentRegistry?.sprinklingLogs.length,
            color: '#16a34a',
            handler: () => handleExportEnvironment()
        }
    ];

    const handleExportBOQ = () => {
        startExport('boq');
        try {
            exportBOQToCSV(project);
            setTimeout(() => finishExport('boq', 'success'), 1000);
        } catch (error) {
            finishExport('boq', 'error');
        }
    };

    const handleExportStructures = () => {
        startExport('structures');
        try {
            exportStructuresToCSV(project);
            setTimeout(() => finishExport('structures', 'success'), 1000);
        } catch (error) {
            finishExport('structures', 'error');
        }
    };

    const handleExportSchedule = () => {
        startExport('schedule');
        try {
            exportScheduleToCSV(project);
            setTimeout(() => finishExport('schedule', 'success'), 1000);
        } catch (error) {
            finishExport('schedule', 'error');
        }
    };

    const handleExportRFIs = () => {
        startExport('rfis');
        try {
            exportRFIToCSV(project);
            setTimeout(() => finishExport('rfis', 'success'), 1000);
        } catch (error) {
            finishExport('rfis', 'error');
        }
    };

    const handleExportLabTests = () => {
        startExport('lab-tests');
        try {
            exportLabTestsToCSV(project);
            setTimeout(() => finishExport('lab-tests', 'success'), 1000);
        } catch (error) {
            finishExport('lab-tests', 'error');
        }
    };

    const handleExportPayments = () => {
        startExport('payments');
        try {
            exportSubcontractorPaymentsToCSV(project);
            setTimeout(() => finishExport('payments', 'success'), 1000);
        } catch (error) {
            finishExport('payments', 'error');
        }
    };

    const handleExportDailyReports = () => {
        startExport('daily-reports');
        alert('Daily Reports export functionality would be implemented here');
        setTimeout(() => finishExport('daily-reports', 'success'), 1000);
    };

    const handleExportEnvironment = () => {
        startExport('environment');
        alert('Environmental Data export functionality would be implemented here');
        setTimeout(() => finishExport('environment', 'success'), 1000);
    };

    const startExport = (id: string) => {
        setActiveExport(id);
        setExportStatus(prev => ({ ...prev, [id]: 'processing' }));
    };

    const finishExport = (id: string, status: 'success' | 'error') => {
        setExportStatus(prev => ({ ...prev, [id]: status }));
        setTimeout(() => {
            setExportStatus(prev => ({ ...prev, [id]: 'idle' }));
            setActiveExport(null);
        }, 2000);
    };

    const getStatusIcon = (status: 'idle' | 'processing' | 'success' | 'error') => {
        switch (status) {
            case 'processing': return <FileText size={16} className="animate-pulse text-blue-600" />;
            case 'success': return <CheckCircle size={16} className="text-green-600" />;
            case 'error': return <AlertTriangle size={16} className="text-red-600" />;
            default: return <Download size={16} className="text-gray-600" />;
        }
    };

    return (
        <Box className="animate-in fade-in duration-500">
            <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                <Box>
                    <Typography variant="caption" fontWeight="900" color="primary" sx={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}>OUTPUT & EXPORTS</Typography>
                    <Typography variant="h4" fontWeight="900">Project Data Export Center</Typography>
                    <Typography variant="body2" color="text.secondary">Generate reports, export data, and manage project outputs</Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                    <Button variant="outlined" startIcon={<Archive size={16}/>} sx={{ borderRadius: 2, paddingX: 1.5, paddingY: 0.75 }}>
                        Archive Data
                    </Button>
                    <Button variant="contained" startIcon={<Download size={16}/>} sx={{ borderRadius: 2, paddingX: 1.5, paddingY: 0.75 }}>
                        Export All
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={3}>
                    <Card variant="outlined" sx={{ borderRadius: 4, bgcolor: 'white' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: '#eef2ff', color: '#4f46e5' }}><FileText size={18}/></Avatar>
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">TOTAL RECORDS</Typography>
                                    <Typography variant="h5" fontWeight="900">{project.boq.length + project.schedule.length + (project.rfis?.length || 0) + (project.labTests?.length || 0)}</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card variant="outlined" sx={{ borderRadius: 4, bgcolor: 'white' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: '#fffbeb', color: '#f59e0b' }}><FileSpreadsheet size={18}/></Avatar>
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">EXPORTED THIS MONTH</Typography>
                                    <Typography variant="h5" fontWeight="900">12</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card variant="outlined" sx={{ borderRadius: 4, bgcolor: 'white' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: '#ecfdf5', color: '#10b981' }}><CheckCircle size={18}/></Avatar>
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">SUCCESS RATE</Typography>
                                    <Typography variant="h5" fontWeight="900">98%</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card variant="outlined" sx={{ borderRadius: 4, borderLeft: '6px solid #4f46e5', bgcolor: 'white' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: '#eef2ff', color: '#4f46e5' }}><Download size={18}/></Avatar>
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">DOWNLOADS</Typography>
                                    <Typography variant="h5" fontWeight="900">47</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'white' }}>
                <Box p={2} borderBottom="1px solid #eee" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">Export Options</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" size="small" startIcon={<Info size={14}/>}>Help</Button>
                        <Button variant="outlined" size="small" startIcon={<FileCode size={14}/>}>JSON Export</Button>
                    </Stack>
                </Box>
                
                <Box p={3}>
                    <Grid container spacing={3}>
                        {exportOptions.map((option) => {
                            const IconComponent = option.icon;
                            const status = exportStatus[option.id] || 'idle';
                            
                            return (
                                <Grid item xs={12} md={6} lg={4} key={option.id}>
                                    <Card 
                                        variant="outlined" 
                                        sx={{ 
                                            borderRadius: 3, 
                                            height: '100%', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            border: status === 'processing' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                            bgcolor: status === 'processing' ? '#eff6ff' : 'white'
                                        }}
                                    >
                                        <CardContent sx={{ p: 2.5, flex: 1 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                                <Avatar sx={{ bgcolor: `${option.color}20`, color: option.color }}>
                                                    <IconComponent size={18} />
                                                </Avatar>
                                                <Tooltip title={status === 'processing' ? 'Export in progress...' : status === 'success' ? 'Export completed' : status === 'error' ? 'Export failed' : 'Ready to export'}>
                                                    <Box>
                                                        {getStatusIcon(status)}
                                                    </Box>
                                                </Tooltip>
                                            </Box>
                                            
                                            <Typography variant="h6" fontWeight="bold" mb={1}>
                                                {option.title}
                                            </Typography>
                                            
                                            <Typography variant="body2" color="text.secondary" mb={2}>
                                                {option.description}
                                            </Typography>
                                            
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Chip 
                                                    label={`${option.dataCount} records`} 
                                                    size="small" 
                                                    variant="outlined"
                                                    sx={{ fontWeight: 'bold', fontSize: 10 }} 
                                                />
                                                <Button 
                                                    variant="contained" 
                                                    size="small"
                                                    startIcon={<Download size={14} />}
                                                    onClick={option.handler}
                                                    disabled={status === 'processing'}
                                                    sx={{ 
                                                        borderRadius: 2, 
                                                        textTransform: 'none',
                                                        bgcolor: option.color,
                                                        '&:hover': { bgcolor: `${option.color}cc` }
                                                    }}
                                                >
                                                    {status === 'processing' ? 'Exporting...' : 'Export'}
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            </Paper>

            <Box mt={4}>
                <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'white' }}>
                    <Box p={2} borderBottom="1px solid #eee" display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold">Recent Exports</Typography>
                        <Button variant="outlined" size="small">View All</Button>
                    </Box>
                    
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <FileText size={20} className="text-indigo-600" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="BOQ Export - Project ABC-2024" 
                                secondary="Exported 2 hours ago by Project Manager" 
                            />
                            <Typography variant="caption" color="text.secondary">CSV • 2.4 MB</Typography>
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemIcon>
                                <Calendar size={20} className="text-red-600" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Schedule Export - Project ABC-2024" 
                                secondary="Exported yesterday by Site Engineer" 
                            />
                            <Typography variant="caption" color="text.secondary">CSV • 1.1 MB</Typography>
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemIcon>
                                <Scale size={20} className="text-cyan-600" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Lab Tests Export - Project ABC-2024" 
                                secondary="Exported 3 days ago by QA Engineer" 
                            />
                            <Typography variant="caption" color="text.secondary">CSV • 0.8 MB</Typography>
                        </ListItem>
                    </List>
                </Paper>
            </Box>
        </Box>
    );
};

export default OutputExportModule;