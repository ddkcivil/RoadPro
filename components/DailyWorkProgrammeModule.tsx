import React, { useState, useMemo } from 'react';
import { 
    Paper, Box, Typography, IconButton, Grid, TextField, FormControl, InputLabel, 
    Select, MenuItem, Button, Table, TableHead, TableBody, TableRow, 
    Chip, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
    List, ListItem, ListItemText, Stack, Divider,
    Autocomplete, InputAdornment, LinearProgress, Avatar, TableCell,
    Tabs, Tab, Accordion, AccordionSummary, AccordionDetails,
    Checkbox, FormControlLabel, RadioGroup, Radio
} from '@mui/material';
import { Project, DailyReport, DailyWorkItem, UserRole, ScheduleTask } from '../types';
import { 
    Plus, Eye, Edit2, History, X, ShieldCheck, FileText, Printer, 
    Clock, Lock, CheckCircle2, XCircle, FileSearch, CalendarPlus, 
    Link as LinkIcon, ExternalLink, Calendar, MapPin, BarChart2,
    MessageSquare, User as UserIcon, Circle, Filter, CheckCircle, Trash2,
    ChevronDown, Copy, Sun, Cloud, CloudRainWind, Wind, MountainSnow
} from 'lucide-react';
import StatCard from './StatCard';

interface Props {
  project: Project;
  userRole: UserRole;
  onProjectUpdate: (project: Project) => void;
}

const DailyWorkProgrammeModule: React.FC<Props> = ({ project, userRole, onProjectUpdate }) => {
    const [viewMode, setViewMode] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
    const [programmeData, setProgrammeData] = useState<any>({});
    const [selectedProgramme, setSelectedProgramme] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Sample weather options
    const weatherOptions = [
        { value: 'Sunny', icon: <Sun size={16} />, label: 'Sunny' },
        { value: 'Cloudy', icon: <Cloud size={16} />, label: 'Cloudy' },
        { value: 'Rainy', icon: <CloudRainWind size={16} />, label: 'Rainy' },
        { value: 'Windy', icon: <Wind size={16} />, label: 'Windy' },
        { value: 'Dusty', icon: <MountainSnow size={16} />, label: 'Dusty' }
    ];

    // Handle creating a new daily work programme
    const handleCreate = () => {
        setProgrammeData({
            date: new Date().toISOString().split('T')[0],
            weather: 'Sunny',
            rainfall: '',
            temperatureMin: '',
            temperatureMax: '',
            workYesterday: [],
            workToday: [],
            workNextDay: [],
            manpower: {
                skilled: '',
                unskilled: '',
                supervisors: ''
            },
            equipment: [],
            materials: [],
            remarks: ''
        });
        setViewMode('CREATE');
    };

    // Handle editing a daily work programme
    const handleEdit = (programme: any) => {
        setProgrammeData(programme);
        setViewMode('EDIT');
    };

    // Handle saving a daily work programme
    const handleSave = () => {
        // In a real implementation, this would save to the project
        // For now, just switch back to list view
        setViewMode('LIST');
    };

    // Add a work item
    const addWorkItem = (section: string) => {
        const newItem = {
            id: `work-${Date.now()}`,
            assetId: '',
            componentId: '',
            location: '',
            quantity: 0,
            description: '',
            linkedTaskId: '', // Add linkage to schedule task
            linkedBoqId: ''  // Add linkage to BOQ item
        };
        
        setProgrammeData({
            ...programmeData,
            [section]: [...(programmeData[section] || []), newItem]
        });
    };

    // Update a work item
    const updateWorkItem = (section: string, index: number, field: string, value: any) => {
        const updatedItems = [...(programmeData[section] || [])];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setProgrammeData({ ...programmeData, [section]: updatedItems });
        
        // Link to schedule tasks when updating linkedTaskId
        if (field === 'linkedTaskId' && value) {
            const scheduleTask = project.schedule.find(task => task.id === value);
            if (scheduleTask) {
                // Update the schedule task progress based on the planned work
                const updatedSchedule: ScheduleTask[] = project.schedule.map(task => 
                    task.id === value 
                        ? { ...task, status: task.status } // Keep original status to avoid type conflict
                        : task
                );
                
                onProjectUpdate({
                    ...project,
                    schedule: updatedSchedule
                });
            }
        }
        
        // Link to BOQ items when updating linkedBoqId
        if (field === 'linkedBoqId' && value) {
            const boqItem = project.boq.find(item => item.id === value);
            if (boqItem) {
                // Potentially update BOQ planning based on work programme
                // This could be used to forecast upcoming work against BOQ items
            }
        }
        
        // Link to structural assets when updating assetId
        if (field === 'assetId' && value) {
            const asset = project.structures?.find(s => s.id === value);
            if (asset) {
                // Update asset planning information
                const updatedStructures = project.structures?.map(structure => 
                    structure.id === value
                        ? { ...structure, status: structure.status } // Keep the original status for now
                        : structure
                );
                
                onProjectUpdate({
                    ...project,
                    structures: updatedStructures
                });
            }
        }
    };

    // Remove a work item
    const removeWorkItem = (section: string, index: number) => {
        const updatedItems = [...(programmeData[section] || [])];
        updatedItems.splice(index, 1);
        setProgrammeData({ ...programmeData, [section]: updatedItems });
    };

    // Add equipment
    const addEquipment = () => {
        const newEquipment = {
            id: `equip-${Date.now()}`,
            name: '',
            quantity: '',
            status: 'Available'
        };
        
        setProgrammeData({
            ...programmeData,
            equipment: [...(programmeData.equipment || []), newEquipment]
        });
    };

    // Update equipment
    const updateEquipment = (index: number, field: string, value: any) => {
        const updatedEquipment = [...(programmeData.equipment || [])];
        updatedEquipment[index] = { ...updatedEquipment[index], [field]: value };
        setProgrammeData({ ...programmeData, equipment: updatedEquipment });
    };

    // Remove equipment
    const removeEquipment = (index: number) => {
        const updatedEquipment = [...(programmeData.equipment || [])];
        updatedEquipment.splice(index, 1);
        setProgrammeData({ ...programmeData, equipment: updatedEquipment });
    };

    // Add material
    const addMaterial = () => {
        const newMaterial = {
            id: `mat-${Date.now()}`,
            name: '',
            quantity: '',
            unit: ''
        };
        
        setProgrammeData({
            ...programmeData,
            materials: [...(programmeData.materials || []), newMaterial]
        });
    };

    // Update material
    const updateMaterial = (index: number, field: string, value: any) => {
        const updatedMaterials = [...(programmeData.materials || [])];
        updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
        setProgrammeData({ ...programmeData, materials: updatedMaterials });
    };

    // Remove material
    const removeMaterial = (index: number) => {
        const updatedMaterials = [...(programmeData.materials || [])];
        updatedMaterials.splice(index, 1);
        setProgrammeData({ ...programmeData, materials: updatedMaterials });
    };

    // Render the form for creating/editing daily work programme
    const renderForm = () => (
        <Paper sx={{ p: 4, borderRadius: 3 }} className="animate-in slide-in-from-right duration-300">
            <Box display="flex" justifyContent="space-between" mb={4} alignItems="center">
                <Box>
                    <Typography variant="h6" fontWeight="bold">Daily Work Programme</Typography>
                    <Typography variant="caption" color="text.secondary">Plan and track daily work activities</Typography>
                </Box>
                <IconButton onClick={() => setViewMode('LIST')}><X /></IconButton>
            </Box>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField 
                        fullWidth label="Date" type="date" 
                        InputLabelProps={{ shrink: true }}
                        value={programmeData.date || ''} 
                        onChange={e => setProgrammeData({...programmeData, date: e.target.value})} 
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Weather</InputLabel>
                        <Select 
                            value={programmeData.weather || 'Sunny'} 
                            label="Weather" 
                            onChange={e => setProgrammeData({...programmeData, weather: e.target.value})}
                        >
                            {weatherOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.icon} <span style={{ marginLeft: 8 }}>{option.label}</span>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                    <TextField 
                        fullWidth label="Rainfall (mm)" 
                        value={programmeData.rainfall || ''} 
                        onChange={e => setProgrammeData({...programmeData, rainfall: e.target.value})} 
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><CloudRainWind size={18} className="text-blue-500" /></InputAdornment>,
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField 
                        fullWidth label="Min Temp (°C)" 
                        value={programmeData.temperatureMin || ''} 
                        onChange={e => setProgrammeData({...programmeData, temperatureMin: e.target.value})} 
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><MountainSnow size={18} className="text-blue-500" /></InputAdornment>,
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField 
                        fullWidth label="Max Temp (°C)" 
                        value={programmeData.temperatureMax || ''} 
                        onChange={e => setProgrammeData({...programmeData, temperatureMax: e.target.value})} 
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Sun size={18} className="text-orange-500" /></InputAdornment>,
                        }}
                    />
                </Grid>
                
                {/* Yesterday's Work Progress */}
                <Grid item xs={12}>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ChevronDown />}>
                            <Typography variant="h6">Work Progress - Yesterday</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {(programmeData.workYesterday || []).map((item: any, index: number) => (
                                <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Structure Asset</InputLabel>
                                                <Select 
                                                    value={item.assetId || ''} 
                                                    label="Structure Asset" 
                                                    onChange={e => updateWorkItem('workYesterday', index, 'assetId', e.target.value)}
                                                >
                                                    {(project.structures || []).map(asset => (
                                                        <MenuItem key={asset.id} value={asset.id}>{asset.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Schedule Task</InputLabel>
                                                <Select 
                                                    value={item.linkedTaskId || ''} 
                                                    label="Schedule Task" 
                                                    onChange={e => updateWorkItem('workYesterday', index, 'linkedTaskId', e.target.value)}
                                                >
                                                    <MenuItem value="">
                                                        <em>None</em>
                                                    </MenuItem>
                                                    {project.schedule.map(task => (
                                                        <MenuItem key={task.id} value={task.id}>{task.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>BOQ Item</InputLabel>
                                                <Select 
                                                    value={item.linkedBoqId || ''} 
                                                    label="BOQ Item" 
                                                    onChange={e => updateWorkItem('workYesterday', index, 'linkedBoqId', e.target.value)}
                                                >
                                                    <MenuItem value="">
                                                        <em>None</em>
                                                    </MenuItem>
                                                    {project.boq.map(boqItem => (
                                                        <MenuItem key={boqItem.id} value={boqItem.id}>{boqItem.description.substring(0, 30)}{boqItem.description.length > 30 ? '...' : ''}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField 
                                                fullWidth label="Location/Chainage" 
                                                value={item.location || ''} 
                                                onChange={e => updateWorkItem('workYesterday', index, 'location', e.target.value)} 
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField 
                                                fullWidth label="Description" 
                                                value={item.description || ''} 
                                                onChange={e => updateWorkItem('workYesterday', index, 'description', e.target.value)} 
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField 
                                                fullWidth label="Quantity" 
                                                type="number"
                                                value={item.quantity || 0} 
                                                onChange={e => updateWorkItem('workYesterday', index, 'quantity', parseFloat(e.target.value) || 0)} 
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6} textAlign="right">
                                            <IconButton 
                                                color="error" 
                                                onClick={() => removeWorkItem('workYesterday', index)}
                                                size="small"
                                            >
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                            <Button variant="outlined" startIcon={<Plus size={16} />} onClick={() => addWorkItem('workYesterday')}>
                                Add Work Item
                            </Button>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                
                {/* Today's Work Programme */}
                <Grid item xs={12}>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ChevronDown />}>
                            <Typography variant="h6">Work Programme - Today</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {(programmeData.workToday || []).map((item: any, index: number) => (
                                <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Structure Asset</InputLabel>
                                                <Select 
                                                    value={item.assetId || ''} 
                                                    label="Structure Asset" 
                                                    onChange={e => updateWorkItem('workToday', index, 'assetId', e.target.value)}
                                                >
                                                    {(project.structures || []).map(asset => (
                                                        <MenuItem key={asset.id} value={asset.id}>{asset.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Schedule Task</InputLabel>
                                                <Select 
                                                    value={item.linkedTaskId || ''} 
                                                    label="Schedule Task" 
                                                    onChange={e => updateWorkItem('workToday', index, 'linkedTaskId', e.target.value)}
                                                >
                                                    <MenuItem value="">
                                                        <em>None</em>
                                                    </MenuItem>
                                                    {project.schedule.map(task => (
                                                        <MenuItem key={task.id} value={task.id}>{task.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>BOQ Item</InputLabel>
                                                <Select 
                                                    value={item.linkedBoqId || ''} 
                                                    label="BOQ Item" 
                                                    onChange={e => updateWorkItem('workToday', index, 'linkedBoqId', e.target.value)}
                                                >
                                                    <MenuItem value="">
                                                        <em>None</em>
                                                    </MenuItem>
                                                    {project.boq.map(boqItem => (
                                                        <MenuItem key={boqItem.id} value={boqItem.id}>{boqItem.description.substring(0, 30)}{boqItem.description.length > 30 ? '...' : ''}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField 
                                                fullWidth label="Location/Chainage" 
                                                value={item.location || ''} 
                                                onChange={e => updateWorkItem('workToday', index, 'location', e.target.value)} 
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField 
                                                fullWidth label="Description" 
                                                value={item.description || ''} 
                                                onChange={e => updateWorkItem('workToday', index, 'description', e.target.value)} 
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField 
                                                fullWidth label="Quantity" 
                                                type="number"
                                                value={item.quantity || 0} 
                                                onChange={e => updateWorkItem('workToday', index, 'quantity', parseFloat(e.target.value) || 0)} 
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6} textAlign="right">
                                            <IconButton 
                                                color="error" 
                                                onClick={() => removeWorkItem('workToday', index)}
                                                size="small"
                                            >
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                            <Button variant="outlined" startIcon={<Plus size={16} />} onClick={() => addWorkItem('workToday')}>
                                Add Work Item
                            </Button>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                
                {/* Next Day's Work Programme */}
                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ChevronDown />}>
                            <Typography variant="h6">Work Programme - Next Day</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {(programmeData.workNextDay || []).map((item: any, index: number) => (
                                <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Structure Asset</InputLabel>
                                                <Select 
                                                    value={item.assetId || ''} 
                                                    label="Structure Asset" 
                                                    onChange={e => updateWorkItem('workNextDay', index, 'assetId', e.target.value)}
                                                >
                                                    {(project.structures || []).map(asset => (
                                                        <MenuItem key={asset.id} value={asset.id}>{asset.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Schedule Task</InputLabel>
                                                <Select 
                                                    value={item.linkedTaskId || ''} 
                                                    label="Schedule Task" 
                                                    onChange={e => updateWorkItem('workNextDay', index, 'linkedTaskId', e.target.value)}
                                                >
                                                    <MenuItem value="">
                                                        <em>None</em>
                                                    </MenuItem>
                                                    {project.schedule.map(task => (
                                                        <MenuItem key={task.id} value={task.id}>{task.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>BOQ Item</InputLabel>
                                                <Select 
                                                    value={item.linkedBoqId || ''} 
                                                    label="BOQ Item" 
                                                    onChange={e => updateWorkItem('workNextDay', index, 'linkedBoqId', e.target.value)}
                                                >
                                                    <MenuItem value="">
                                                        <em>None</em>
                                                    </MenuItem>
                                                    {project.boq.map(boqItem => (
                                                        <MenuItem key={boqItem.id} value={boqItem.id}>{boqItem.description.substring(0, 30)}{boqItem.description.length > 30 ? '...' : ''}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField 
                                                fullWidth label="Location/Chainage" 
                                                value={item.location || ''} 
                                                onChange={e => updateWorkItem('workNextDay', index, 'location', e.target.value)} 
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField 
                                                fullWidth label="Description" 
                                                value={item.description || ''} 
                                                onChange={e => updateWorkItem('workNextDay', index, 'description', e.target.value)} 
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField 
                                                fullWidth label="Quantity" 
                                                type="number"
                                                value={item.quantity || 0} 
                                                onChange={e => updateWorkItem('workNextDay', index, 'quantity', parseFloat(e.target.value) || 0)} 
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6} textAlign="right">
                                            <IconButton 
                                                color="error" 
                                                onClick={() => removeWorkItem('workNextDay', index)}
                                                size="small"
                                            >
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                            <Button variant="outlined" startIcon={<Plus size={16} />} onClick={() => addWorkItem('workNextDay')}>
                                Add Work Item
                            </Button>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                
                {/* Manpower Section */}
                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ChevronDown />}>
                            <Typography variant="h6">Manpower</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <TextField 
                                        fullWidth label="Skilled Labour" 
                                        type="number"
                                        value={programmeData.manpower?.skilled || ''} 
                                        onChange={e => setProgrammeData({
                                            ...programmeData, 
                                            manpower: { 
                                                ...programmeData.manpower, 
                                                skilled: e.target.value 
                                            }
                                        })} 
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField 
                                        fullWidth label="Unskilled Labour" 
                                        type="number"
                                        value={programmeData.manpower?.unskilled || ''} 
                                        onChange={e => setProgrammeData({
                                            ...programmeData, 
                                            manpower: { 
                                                ...programmeData.manpower, 
                                                unskilled: e.target.value 
                                            }
                                        })} 
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField 
                                        fullWidth label="Supervisors" 
                                        type="number"
                                        value={programmeData.manpower?.supervisors || ''} 
                                        onChange={e => setProgrammeData({
                                            ...programmeData, 
                                            manpower: { 
                                                ...programmeData.manpower, 
                                                supervisors: e.target.value 
                                            }
                                        })} 
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                
                {/* Equipment Section */}
                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ChevronDown />}>
                            <Typography variant="h6">Equipment</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {(programmeData.equipment || []).map((equip: any, index: number) => (
                                <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={5}>
                                            <TextField 
                                                fullWidth label="Equipment Name" 
                                                value={equip.name || ''} 
                                                onChange={e => updateEquipment(index, 'name', e.target.value)} 
                                            />
                                        </Grid>
                                        <Grid item xs={3}>
                                            <TextField 
                                                fullWidth label="Quantity" 
                                                value={equip.quantity || ''} 
                                                onChange={e => updateEquipment(index, 'quantity', e.target.value)} 
                                            />
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl fullWidth>
                                                <InputLabel>Status</InputLabel>
                                                <Select 
                                                    value={equip.status || 'Available'} 
                                                    label="Status" 
                                                    onChange={e => updateEquipment(index, 'status', e.target.value)}
                                                >
                                                    <MenuItem value="Available">Available</MenuItem>
                                                    <MenuItem value="In Use">In Use</MenuItem>
                                                    <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
                                                    <MenuItem value="Not Available">Not Available</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={1} textAlign="right">
                                            <IconButton 
                                                color="error" 
                                                onClick={() => removeEquipment(index)}
                                                size="small"
                                            >
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                            <Button variant="outlined" startIcon={<Plus size={16} />} onClick={addEquipment}>
                                Add Equipment
                            </Button>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                
                {/* Materials Section */}
                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ChevronDown />}>
                            <Typography variant="h6">Materials</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {(programmeData.materials || []).map((mat: any, index: number) => (
                                <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={5}>
                                            <TextField 
                                                fullWidth label="Material Name" 
                                                value={mat.name || ''} 
                                                onChange={e => updateMaterial(index, 'name', e.target.value)} 
                                            />
                                        </Grid>
                                        <Grid item xs={3}>
                                            <TextField 
                                                fullWidth label="Quantity" 
                                                value={mat.quantity || ''} 
                                                onChange={e => updateMaterial(index, 'quantity', e.target.value)} 
                                            />
                                        </Grid>
                                        <Grid item xs={3}>
                                            <TextField 
                                                fullWidth label="Unit" 
                                                value={mat.unit || ''} 
                                                onChange={e => updateMaterial(index, 'unit', e.target.value)} 
                                            />
                                        </Grid>
                                        <Grid item xs={1} textAlign="right">
                                            <IconButton 
                                                color="error" 
                                                onClick={() => removeMaterial(index)}
                                                size="small"
                                            >
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                            <Button variant="outlined" startIcon={<Plus size={16} />} onClick={addMaterial}>
                                Add Material
                            </Button>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                
                {/* Remarks Section */}
                <Grid item xs={12}>
                    <TextField 
                        fullWidth label="Remarks" 
                        multiline 
                        rows={4}
                        value={programmeData.remarks || ''} 
                        onChange={e => setProgrammeData({...programmeData, remarks: e.target.value})} 
                    />
                </Grid>
            </Grid>
            
            <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                <Button onClick={() => setViewMode('LIST')}>Cancel</Button>
                <Button variant="contained" onClick={handleSave} startIcon={<CheckCircle2 size={18}/>}>Save Programme</Button>
            </Box>
        </Paper>
    );

    // State for search and filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    
    // Filtered programmes based on search and filters
    const filteredProgrammes = [
        { id: 1, date: '2023-06-15', weather: 'Sunny', yesterday: 'Foundation work', today: 'Concrete pouring', equipment: ['Excavator', 'Mixer'], status: 'Planned' },
        { id: 2, date: '2023-06-16', weather: 'Cloudy', yesterday: 'Base course', today: 'Sub-base work', equipment: ['Grader', 'Roller'], status: 'In Progress' },
        { id: 3, date: '2023-06-17', weather: 'Rainy', yesterday: 'Surface work', today: 'Curing', equipment: ['Truck'], status: 'Delayed' }
    ].filter(prog => 
        prog.date.includes(searchTerm) || 
        prog.yesterday.toLowerCase().includes(searchTerm.toLowerCase()) || 
        prog.today.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (filterStatus === 'All' || prog.status === filterStatus)
    );
    
    // Main list view
    return (
        <Box className="animate-in fade-in duration-500">
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" mb={4} alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
                <Box>
                    <Typography variant="h5" fontWeight="900">Daily Work Programme</Typography>
                    <Typography variant="body2" color="text.secondary">Plan and track daily construction activities</Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Button variant="contained" startIcon={<Plus />} onClick={handleCreate} sx={{ borderRadius: 2 }}>New Programme</Button>
                </Stack>
            </Box>
            
            {/* Search and Filter Controls */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField 
                            fullWidth 
                            placeholder="Search programmes..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FileSearch size={18} />
                                    </InputAdornment>
                                ),
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select 
                                value={filterStatus} 
                                label="Status" 
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <MenuItem value="All">All Statuses</MenuItem>
                                <MenuItem value="Planned">Planned</MenuItem>
                                <MenuItem value="In Progress">In Progress</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Delayed">Delayed</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3} textAlign={{ xs: 'left', md: 'right' }} pt={{ xs: 1, md: 0 }}>
                        <Typography variant="body2" color="text.secondary">
                            {filteredProgrammes.length} of 3 programmes
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={2} mb={4}>
                <Grid item xs={6} sm={3}>
                    <StatCard title="Total Programmes" value={5} icon={FileText} color="#4f46e5" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard title="Today's Work" value={12} icon={Calendar} color="#10b981" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard title="Active Equipment" value={8} icon={ExternalLink} color="#8b5cf6" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard title="Workers" value={45} icon={UserIcon} color="#ef4444" />
                </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'background.paper' }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Weather</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Yesterday's Work</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Today's Programme</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Equipment</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Filtered data */}
                        {filteredProgrammes.map((prog, index) => (
                            <TableRow key={prog.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="bold">{prog.date}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Sun size={16} className="text-yellow-500" />
                                        <Typography variant="body2">{prog.weather}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{prog.yesterday}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{prog.today}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{prog.equipment.join(', ')}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={prog.status} 
                                        size="small" 
                                        variant="outlined" 
                                        color={prog.status === 'Completed' ? 'success' : prog.status === 'Delayed' ? 'error' : 'primary'} 
                                        sx={{ fontWeight: '900', fontSize: 9 }} 
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={0} justifyContent="flex-end" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <IconButton size="small" onClick={() => { setSelectedProgramme(prog); setIsDetailModalOpen(true); }}><Eye size={16}/></IconButton>
                                        <IconButton size="small" onClick={() => handleEdit(prog)}><Edit2 size={16}/></IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredProgrammes.length === 0 && (
                            <TableRow>
                                <TableCell align="center" {...{ colSpan: 7 }} sx={{ py: 10 }}>
                                    <Typography variant="body2" color="text.disabled">No daily work programmes found. Create one to get started.</Typography>
                                    <Button 
                                        variant="outlined" 
                                        sx={{ mt: 2 }} 
                                        onClick={handleCreate}
                                    >
                                        Create Programme
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <Dialog 
                open={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                maxWidth="md" 
                fullWidth 
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <FileText size={24} color="primary.main"/>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Daily Work Programme Details</Typography>
                            <Typography variant="caption" color="text.secondary">2023-06-15</Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={() => setIsDetailModalOpen(false)}><X/></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                    {selectedProgramme && (
                        <Grid container spacing={0}>
                            <Grid item xs={12} md={8} sx={{ p: 4, borderRight: '1px solid', borderColor: 'divider' }}>
                                <Stack spacing={3}>
                                    <Box>
                                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: 1 }}>PROGRAMME OVERVIEW</Typography>
                                        <Paper variant="outlined" sx={{ p: 2, mt: 1.5, bgcolor: 'background.paper', borderRadius: 2 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" fontWeight="bold" color="text.secondary">Date:</Typography>
                                                    <Typography variant="body2">2023-06-15</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" fontWeight="bold" color="text.secondary">Weather:</Typography>
                                                    <Typography variant="body2">Sunny</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" fontWeight="bold" color="text.secondary">Rainfall:</Typography>
                                                    <Typography variant="body2">0 mm</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" fontWeight="bold" color="text.secondary">Temperature:</Typography>
                                                    <Typography variant="body2">25°C - 38°C</Typography>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Box>
                                    
                                    <Box>
                                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: 1 }}>YESTERDAY'S WORK PROGRESS</Typography>
                                        <Paper variant="outlined" sx={{ p: 2, mt: 1.5, bgcolor: 'background.paper', borderRadius: 2 }}>
                                            <List>
                                                <ListItem sx={{ pl: 0, py: 1, border: 'none' }}>
                                                    <ListItemText 
                                                        primary="Foundation excavation for culvert at 12+400 RHS"
                                                        secondary="Completed 100m³ excavation, 95% of planned quantity"
                                                    />
                                                </ListItem>
                                            </List>
                                        </Paper>
                                    </Box>
                                    
                                    <Box>
                                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: 1 }}>TODAY'S WORK PROGRAMME</Typography>
                                        <Paper variant="outlined" sx={{ p: 2, mt: 1.5, bgcolor: 'background.paper', borderRadius: 2 }}>
                                            <List>
                                                <ListItem sx={{ pl: 0, py: 1, border: 'none' }}>
                                                    <ListItemText 
                                                        primary="Concrete pouring for culvert base"
                                                        secondary="Plan to pour 50m³ concrete for culvert base at 12+400 RHS"
                                                    />
                                                </ListItem>
                                            </List>
                                        </Paper>
                                    </Box>
                                    
                                    <Box>
                                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: 1 }}>EQUIPMENT ALLOCATION</Typography>
                                        <Paper variant="outlined" sx={{ p: 2, mt: 1.5, bgcolor: 'background.paper', borderRadius: 2 }}>
                                            <List>
                                                <ListItem sx={{ pl: 0, py: 1, border: 'none' }}>
                                                    <ListItemText 
                                                        primary="Excavator CAT 320"
                                                        secondary="Assigned to backfilling activity"
                                                    />
                                                </ListItem>
                                                <ListItem sx={{ pl: 0, py: 1, border: 'none' }}>
                                                    <ListItemText 
                                                        primary="Concrete Mixer 5m³"
                                                        secondary="Ready for concrete pouring at culvert site"
                                                    />
                                                </ListItem>
                                            </List>
                                        </Paper>
                                    </Box>
                                    
                                    <Box>
                                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: 1 }}>MANPOWER ALLOCATION</Typography>
                                        <Paper variant="outlined" sx={{ p: 2, mt: 1.5, bgcolor: 'background.paper', borderRadius: 2 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4}>
                                                    <Typography variant="body2" fontWeight="bold" color="text.secondary">Skilled:</Typography>
                                                    <Typography variant="body2">5</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body2" fontWeight="bold" color="text.secondary">Unskilled:</Typography>
                                                    <Typography variant="body2">15</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body2" fontWeight="bold" color="text.secondary">Supervisors:</Typography>
                                                    <Typography variant="body2">2</Typography>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Box>
                                </Stack>
                            </Grid>

                            <Grid item xs={12} md={4} sx={{ p: 4, bgcolor: 'action.hover' }}>
                                <Stack spacing={3}>
                                    <Box>
                                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: 1 }}>REMARKS</Typography>
                                        <Paper variant="outlined" sx={{ p: 2, mt: 1.5, bgcolor: 'background.paper', borderRadius: 2 }}>
                                            <Typography variant="body2">
                                                Weather favorable for concreting. Need to ensure water curing for poured concrete. 
                                                Material delivery scheduled for morning shift.
                                            </Typography>
                                        </Paper>
                                    </Box>

                                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'background.paper' }}>
                                        <Typography variant="caption" fontWeight="900" color="text.secondary" display="flex" alignItems="center" gap={1} mb={1.5}>
                                            <Calendar size={14}/> PLANNING INFO
                                        </Typography>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">Prepared by: Site Engineer</Typography>
                                            <Typography variant="body2">Reviewed by: Project Manager</Typography>
                                        </Box>
                                    </Paper>
                                    
                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        startIcon={<Printer/>} 
                                        onClick={() => window.print()} 
                                        sx={{ mt: 2, height: 48, borderRadius: 2 }}
                                    >
                                        Print Programme
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default DailyWorkProgrammeModule;