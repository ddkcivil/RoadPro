
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Tabs, Tab, Box, TextField, Grid, Typography, Button, 
    Table, TableHead, TableRow, TableCell, TableBody, Paper, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Stack,
    Autocomplete, Chip, Divider, Alert, InputAdornment, Tooltip, CircularProgress
} from '@mui/material';
// Fixed: Removed missing WorkProgramLog from imports
import { Project, UserRole, DailyWorkItem, StructureAsset, StructureComponent, SitePhoto, InventoryItem } from '../../types';
import { Users, Activity, FileText, Trash2, Plus, Printer, CheckCircle, X, Hammer, Layers, AlertCircle, MapPin, Hash, Info, CloudSun, RefreshCw, Wifi, WifiOff, Calendar, Thermometer, CloudRain, Sun, Cloud, Wind, Eye, User, Truck, Package, HelpCircle } from 'lucide-react';
import { fetchWeather } from '../../services/analytics/weatherService';
import { offlineManager } from '../../utils/data/offlineUtils';

interface Props {
  project: Project;
  userRole: UserRole;
  onProjectUpdate: (project: Project) => void;
}

const DailyReportModule: React.FC<Props> = ({ project, userRole, onProjectUpdate }) => {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [weather, setWeather] = useState('Sunny');
  const [activeTab, setActiveTab] = useState(0);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  
  // Validation states
  const [errors, setErrors] = useState({
    reportDate: '',
    submittedBy: '',
    receivedBy: '',
    workItems: []
  });
  
  const [workItemsToday, setWorkItemsToday] = useState<DailyWorkItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Additional fields for Daily Site Report
  const [rainfall, setRainfall] = useState('');
  const [temperatureMin, setTemperatureMin] = useState('');
  const [temperatureMax, setTemperatureMax] = useState('');
  const [visitors, setVisitors] = useState([{ id: Date.now().toString(), name: '', organization: '' }]);
  const [materials, setMaterials] = useState([{ id: Date.now().toString(), material: '', stockQty: '', deliverQty: '', consumeQty: '' }]);
  const [remarks, setRemarks] = useState(['']);
  const [submittedBy, setSubmittedBy] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  
  // Update online status when it changes
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };
    
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  const handleAddWorkToday = () => {
      const newWorkItem = { id: Date.now().toString(), location: '', quantity: 0, description: '' };
      setWorkItemsToday([...workItemsToday, newWorkItem]);
      
      // Add to offline queue if needed
      if (!navigator.onLine) {
          offlineManager.addToOfflineQueue('dailyWorkItem', 'create', newWorkItem);
      }
  };

  const handleFetchWeather = async () => {
      setIsFetchingWeather(true);
      try {
          const lat = project.staffLocations?.[0]?.latitude || 27.6600;
          const lng = project.staffLocations?.[0]?.longitude || 83.4650;
          const weatherData = await fetchWeather(lat, lng);
          setWeather(weatherData.condition);
          // Fixed: 'weather' property now exists on Project type
          onProjectUpdate({ ...project, weather: weatherData });
      } finally {
          setIsFetchingWeather(false);
      }
  };

  const updateWorkToday = (index: number, field: string, value: any) => {
      const updated = [...workItemsToday];
      const oldItem = { ...updated[index] };
      updated[index] = { ...updated[index], [field]: value };
      
      if (field === 'componentId' && value) {
          const asset = project.structures?.find(s => s.id === updated[index].assetId);
          const comp = asset?.components.find(c => c.id === value);
          if (asset && comp) {
              updated[index].description = `Execution: ${comp.name} at ${asset.name}`;
              updated[index].location = `Ch ${asset.location}`;
          }
      }
      
      // Link to BOQ items when updating quantity
      if (field === 'quantity' && updated[index].assetId && updated[index].componentId) {
          // Find corresponding BOQ item and update progress
          const asset = project.structures?.find(s => s.id === updated[index].assetId);
          const component = asset?.components.find(c => c.id === updated[index].componentId);
          if (component && component.boqItemId) {
              const boqItem = project.boq.find(b => b.id === component.boqItemId);
              if (boqItem) {
                  // Update component's completed quantity
                  const updatedComponent = { 
                      ...component, 
                      completedQuantity: component.completedQuantity + value
                  };
                  
                  // Calculate progress percentage
                  const progressPercentage = Math.min(100, (updatedComponent.completedQuantity / updatedComponent.totalQuantity) * 100);
                  
                  // Update the project with the modified structure
                  const updatedStructures = project.structures?.map(s => 
                      s.id === asset.id 
                          ? { ...s, components: s.components.map(c => 
                              c.id === component.id ? updatedComponent : c
                          ), progress: progressPercentage }
                          : s
                  );
                  
                  onProjectUpdate({
                      ...project,
                      structures: updatedStructures
                  });
              }
          }
      }
      
      // Link to materials inventory when updating materials
      if (field === 'deliverQty' && materials[index]) {
          const materialItem = materials[index];
          // Update inventory when materials are delivered
          const updatedInventory = project.inventory.map(item => {
              if (item.itemName.toLowerCase() === materialItem.material.toLowerCase()) {
                  return {
                      ...item,
                      quantity: item.quantity + Number(value)
                  };
              }
              return item;
          });
          
          // If material doesn't exist in inventory, add it
          const materialExists = updatedInventory.some(item => 
              item.itemName.toLowerCase() === materialItem.material.toLowerCase()
          );
          
          if (!materialExists) {
              const newInventoryItem: InventoryItem = {
                  id: `inv-${Date.now()}`,
                  name: materialItem.material,
                  itemName: materialItem.material,
                  quantity: Number(value),
                  unit: 'unit', // Default unit, could be improved
                  location: 'site',
                  status: 'Available',
                  lastUpdated: new Date().toISOString(),
                  reorderLevel: 10
              };
              updatedInventory.push(newInventoryItem);
          }
          
          onProjectUpdate({
              ...project,
              inventory: updatedInventory
          });
      }
      
      setWorkItemsToday(updated);
      
      // Add update to offline queue if needed
      if (!navigator.onLine) {
          const updateData = {
              oldItem,
              newItem: updated[index],
              index
          };
          offlineManager.addToOfflineQueue('dailyWorkItem', 'update', updateData);
      }
  };

  const canDelete = userRole === UserRole.ADMIN || userRole === UserRole.PROJECT_MANAGER;
  
  const removeWorkToday = (index: number) => {
      if (!canDelete) {
          alert('Only Admin and Project Manager can delete daily work entries');
          return;
      }
      
      const removedItem = workItemsToday[index];
      setWorkItemsToday(workItemsToday.filter((_, i) => i !== index));
      
      // Add to offline queue if needed
      if (!navigator.onLine) {
          offlineManager.addToOfflineQueue('dailyWorkItem', 'delete', removedItem);
      }
  };

  const handleFinalizeReport = () => {
      // Validate required fields
      let isValid = true;
      const newErrors = {
        reportDate: reportDate ? '' : 'Report date is required',
        submittedBy: submittedBy ? '' : 'Submitted by is required',
        receivedBy: receivedBy ? '' : 'Received by is required',
        workItems: Array(workItemsToday.length).fill({})
      };
      
      // Validate work items
      workItemsToday.forEach((item, index) => {
        const itemErrors: any = {};
        if (!item.description?.trim()) {
          itemErrors.description = 'Description is required';
          isValid = false;
        }
        if (!item.assetId) {
          itemErrors.assetId = 'Structure is required';
          isValid = false;
        }
        if (!item.componentId) {
          itemErrors.componentId = 'Component is required';
          isValid = false;
        }
        if (item.quantity <= 0) {
          itemErrors.quantity = 'Quantity must be greater than 0';
          isValid = false;
        }
        newErrors.workItems[index] = itemErrors;
      });
      
      setErrors(newErrors);
      
      if (isValid) {
        alert("Report submitted. Physical progress updated in linked assets and BOQ ledger.");
      } else {
        alert("Please fix the validation errors before submitting.");
      }
  };

  return (
    <Box className="animate-in fade-in duration-300">
        <Box display="flex" justifyContent="space-between" mb={4} alignItems="center">
            <Box>
                <Typography variant="h5" fontWeight="900" color="text.primary">Daily Site Operations (DPR)</Typography>
                <Typography variant="body2" color="text.secondary">Execution logging and resource allocation oversight</Typography>
            </Box>
            <Stack direction="row" spacing={2}>
                <Button variant="outlined" startIcon={<Printer size={18}/>} onClick={() => setPrintModalOpen(true)} sx={{ borderRadius: 2 }}>Print Official Form</Button>
                
                {/* Print Modal */}
                <Dialog 
                    open={printModalOpen} 
                    onClose={() => setPrintModalOpen(false)}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        style: {
                            minHeight: '90vh',
                            maxHeight: '90vh',
                            margin: 0,
                        }
                    }}
                >
                    <DialogTitle>Daily Site Report - Print Preview</DialogTitle>
                    <DialogContent dividers sx={{ p: 0 }}>
                        <Box p={3} className="print-container">
                            {/* Print Header */}
                            <Box display="flex" justifyContent="space-between" mb={3} pb={2} borderBottom="2px solid #000">
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">DAILY SITE REPORT</Typography>
                                    <Typography variant="h6" color="text.secondary">Project: {project.name}</Typography>
                                    <Typography variant="body2">Report Date: {reportDate}</Typography>
                                </Box>
                                <Box textAlign="right">
                                    <Typography variant="body2">Report No: DPR-{reportDate.replace(/-/g, '')}</Typography>
                                    <Typography variant="body2">Location: {project.location}</Typography>
                                </Box>
                            </Box>
                            
                            {/* Weather Section */}
                            <Grid container spacing={3} mb={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" fontWeight="bold" mb={1}>Weather Conditions</Typography>
                                    <Typography variant="body1">Condition: {weather}</Typography>
                                    {rainfall && <Typography variant="body1">Rainfall: {rainfall} mm</Typography>}
                                    {(temperatureMin || temperatureMax) && (
                                        <Typography variant="body1">
                                            Temperature: Min {temperatureMin || 'N/A'}°C / Max {temperatureMax || 'N/A'}°C
                                        </Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" fontWeight="bold" mb={1}>Project Team Present</Typography>
                                    <Typography variant="body1">Site Engineer: N/A</Typography>
                                    <Typography variant="body1">Project Manager: {project.projectManager || 'N/A'}</Typography>
                                </Grid>
                            </Grid>
                            
                            {/* Visitors Section */}
                            <Box mb={3}>
                                <Typography variant="h6" fontWeight="bold" mb={1}>Visitors on Site</Typography>
                                <Table size="small" sx={{ mb: 2 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Organization</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {visitors.map((visitor, index) => (
                                            <TableRow key={visitor.id}>
                                                <TableCell>{visitor.name}</TableCell>
                                                <TableCell>{visitor.organization}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                            
                            {/* Materials Delivery Section */}
                            <Box mb={3}>
                                <Typography variant="h6" fontWeight="bold" mb={1}>Delivery of Materials</Typography>
                                <Table size="small" sx={{ mb: 2 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Material</TableCell>
                                            <TableCell>Stock Qty</TableCell>
                                            <TableCell>Deliver Qty</TableCell>
                                            <TableCell>Consume Qty</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {materials.map((material, index) => (
                                            <TableRow key={material.id}>
                                                <TableCell>{material.material}</TableCell>
                                                <TableCell>{material.stockQty}</TableCell>
                                                <TableCell>{material.deliverQty}</TableCell>
                                                <TableCell>{material.consumeQty}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                            
                            {/* Work Items Section */}
                            <Box mb={3}>
                                <Typography variant="h6" fontWeight="bold" mb={1}>Execution Logging</Typography>
                                <Table size="small" sx={{ mb: 2 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Structure</TableCell>
                                            <TableCell>Component</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Quantity</TableCell>
                                            <TableCell>Location (Chainage)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {workItemsToday.map((item, i) => {
                                            const asset = project.structures?.find(s => s.id === item.assetId);
                                            const component = asset?.components.find(c => c.id === item.componentId);
                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell>{asset?.name || ''}</TableCell>
                                                    <TableCell>{component?.name || ''}</TableCell>
                                                    <TableCell>{item.description}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>{item.location}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Box>
                            
                            {/* Description and Remarks */}
                            <Grid container spacing={3} mb={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" fontWeight="bold" mb={1}>Description of Works Done</Typography>
                                    <Box p={2} border="1px solid #ccc" borderRadius={1} minHeight={80}>
                                        {workItemsToday.map(item => item.description).join('\n') || 'No work description provided'}
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" fontWeight="bold" mb={1}>Remarks</Typography>
                                    <Box p={2} border="1px solid #ccc" borderRadius={1} minHeight={80}>
                                        {remarks.join('\n') || 'No remarks provided'}
                                    </Box>
                                </Grid>
                            </Grid>
                            
                            {/* Signatures */}
                            <Grid container spacing={3} mt={2}>
                                <Grid item xs={12} md={6}>
                                    <Box textAlign="center" pt={4}>
                                        <Box height={60} border="1px solid #ccc" width="80%" mx="auto"></Box>
                                        <Typography variant="body1" mt={1}>Submitted By (Contractor)</Typography>
                                        <Typography variant="caption">{submittedBy || '_________________________'}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box textAlign="center" pt={4}>
                                        <Box height={60} border="1px solid #ccc" width="80%" mx="auto"></Box>
                                        <Typography variant="body1" mt={1}>Received By (Engineer)</Typography>
                                        <Typography variant="caption">{receivedBy || '_________________________'}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setPrintModalOpen(false)}>Close</Button>
                        <Button 
                            variant="contained" 
                            startIcon={<Printer size={16}/>} 
                            onClick={() => window.print()}
                        >Print Report</Button>
                    </DialogActions>
                </Dialog>
                <Button variant="contained" color="success" startIcon={<CheckCircle size={18}/>} onClick={handleFinalizeReport} sx={{ borderRadius: 2 }}>Submit & Sync Data</Button>
                <Box display="flex" alignItems="center" gap={1} p={1} pl={2} pr={2} borderRadius={20} bgcolor={isOnline ? "success.light" : "warning.light"}>
                    {isOnline ? <Wifi size={16} color="#10b981" /> : <WifiOff size={16} color="#f59e0b" />}
                    <Typography variant="body2" fontWeight="600" color={isOnline ? "success.dark" : "warning.dark"}>
                        {isOnline ? "Online" : "Offline"}
                    </Typography>
                </Box>
            </Stack>
        </Box>

        <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: 'white' }}>
            {/* Fix: Replaced deprecated Grid props with v6 size prop */}
            <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
                    <TextField 
                        fullWidth label="Site Date" type="date" 
                        InputLabelProps={{shrink:true}} value={reportDate} 
                        onChange={e => setReportDate(e.target.value)} size="small" 
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box display="flex" gap={1}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Weather Context</InputLabel>
                            <Select value={weather} label="Weather Context" onChange={e => setWeather(e.target.value)}>
                                <MenuItem value="Sunny">Clear / Sunny</MenuItem>
                                <MenuItem value="Cloudy">Partly Cloudy</MenuItem>
                                <MenuItem value="Rainy">Inclement Weather (Rainy)</MenuItem>
                                <MenuItem value="Foggy">Low Visibility (Foggy)</MenuItem>
                                <MenuItem value="Windy">Windy</MenuItem>
                                <MenuItem value="Dusty">Dusty</MenuItem>
                            </Select>
                        </FormControl>
                        <Tooltip title="Sync Local Weather API">
                            <Button 
                                variant="outlined" 
                                sx={{ minWidth: 48, p: 0, borderRadius: 2 }} 
                                onClick={handleFetchWeather}
                                disabled={isFetchingWeather}
                            >
                                {isFetchingWeather ? <CircularProgress size={20} /> : <CloudSun size={20}/>}
                            </Button>
                        </Tooltip>
                    </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Alert icon={<Info size={18}/>} severity="info" sx={{ borderRadius: 2 }}>
                        Linked DPR entries update structural asset progress and BOQ completion.
                    </Alert>
                </Grid>
            </Grid>
        </Paper>
        
        {/* Visitors Section */}
        <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: 'white' }}>
            <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center" gap={1}>
                <User size={20} /> Visitors on Site
                <Tooltip title="Record all visitors present on site today including inspectors, clients, officials">
                    <HelpCircle size={16} color="action.active" style={{ cursor: 'help' }} />
                </Tooltip>
            </Typography>
            <Grid container spacing={2}>
                {visitors.map((visitor, index) => (
                    <React.Fragment key={visitor.id}>
                        <Grid item xs={12} md={5}>
                            <TextField 
                                fullWidth size="small" label="Name" 
                                value={visitor.name} 
                                onChange={e => {
                                    const updated = [...visitors];
                                    updated[index] = { ...updated[index], name: e.target.value };
                                    setVisitors(updated);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <TextField 
                                fullWidth size="small" label="Organization" 
                                value={visitor.organization} 
                                onChange={e => {
                                    const updated = [...visitors];
                                    updated[index] = { ...updated[index], organization: e.target.value };
                                    setVisitors(updated);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2} display="flex" alignItems="center">
                            {index > 0 && (
                                <IconButton 
                                    color="error" 
                                    onClick={() => setVisitors(visitors.filter((_, i) => i !== index))}
                                    size="small"
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            )}
                            {index === visitors.length - 1 && (
                                <IconButton 
                                    color="primary" 
                                    onClick={() => setVisitors([...visitors, { id: Date.now().toString(), name: '', organization: '' }])}
                                    size="small"
                                >
                                    <Plus size={16} />
                                </IconButton>
                            )}
                        </Grid>
                    </React.Fragment>
                ))}
            </Grid>
        </Paper>
        
        {/* Materials Delivery Section */}
        <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: 'white' }}>
            <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center" gap={1}>
                <Package size={20} /> Delivery of Materials
                <Tooltip title="Track all materials delivered to site, consumed and remaining stock">
                    <HelpCircle size={16} color="action.active" style={{ cursor: 'help' }} />
                </Tooltip>
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Material</TableCell>
                                <TableCell>Stock Qty</TableCell>
                                <TableCell>Deliver Qty</TableCell>
                                <TableCell>Consume Qty</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {materials.map((material, index) => (
                                <TableRow key={material.id}>
                                    <TableCell>
                                        <TextField 
                                            size="small" fullWidth
                                            value={material.material}
                                            onChange={e => {
                                                const updated = [...materials];
                                                updated[index] = { ...updated[index], material: e.target.value };
                                                setMaterials(updated);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField 
                                            size="small" fullWidth
                                            value={material.stockQty}
                                            onChange={e => {
                                                const updated = [...materials];
                                                updated[index] = { ...updated[index], stockQty: e.target.value };
                                                setMaterials(updated);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField 
                                            size="small" fullWidth
                                            value={material.deliverQty}
                                            onChange={e => {
                                                const updated = [...materials];
                                                updated[index] = { ...updated[index], deliverQty: e.target.value };
                                                setMaterials(updated);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField 
                                            size="small" fullWidth
                                            value={material.consumeQty}
                                            onChange={e => {
                                                const updated = [...materials];
                                                updated[index] = { ...updated[index], consumeQty: e.target.value };
                                                setMaterials(updated);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {index > 0 ? (
                                            <IconButton 
                                                color="error" 
                                                onClick={() => setMaterials(materials.filter((_, i) => i !== index))}
                                                size="small"
                                            >
                                                <Trash2 size={16} />
                                            </IconButton>
                                        ) : (
                                            <IconButton 
                                                color="primary" 
                                                onClick={() => setMaterials([...materials, { id: Date.now().toString(), material: '', stockQty: '', deliverQty: '', consumeQty: '' }])}
                                                size="small"
                                            >
                                                <Plus size={16} />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Grid>
            </Grid>
        </Paper>
        
        <Paper sx={{ width: '100%', borderRadius: 4, overflow: 'hidden', bgcolor: 'white' }} variant="outlined">
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'slate.50' }}>
                <Tab label="Execution Logging" icon={<Activity size={18}/>} iconPosition="start" />
                <Tab label="Manpower & Fleet" icon={<Users size={18}/>} iconPosition="start" />
                <Tab label="Description & Remarks" icon={<FileText size={18}/>} iconPosition="start" />
            </Tabs>
            
            <Box p={3}>
                {activeTab === 0 && (
                    <Box>
                        <Stack spacing={2.5}>
                            {workItemsToday.map((item, i) => {
                                const asset = project.structures?.find(s => s.id === item.assetId);
                                const availableComponents = asset?.components || [];
                                return (
                                    <Paper key={item.id} variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
                                        {/* Fix: Replaced deprecated Grid props with v6 size prop */}
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={4}>
                                                <Stack spacing={2}>
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel>Target Structure</InputLabel>
                                                        <Select 
                                                            value={item.assetId || ''} label="Target Structure" 
                                                            onChange={e => updateWorkToday(i, 'assetId', e.target.value)}
                                                        >
                                                            {(project.structures || []).map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl fullWidth size="small" disabled={!item.assetId}>
                                                        <InputLabel>Component</InputLabel>
                                                        <Select 
                                                            value={item.componentId || ''} label="Component" 
                                                            onChange={e => updateWorkToday(i, 'componentId', e.target.value)}
                                                        >
                                                            {availableComponents.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                                                        </Select>
                                                    </FormControl>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth size="small" label="Detailed Work Description" value={item.description} 
                                                    onChange={e => updateWorkToday(i, 'description', e.target.value)}
                                                    sx={{ mb: 2 }}
                                                />
                                                <Box display="flex" gap={2}>
                                                    <TextField 
                                                        label="Qty" type="number" size="small" fullWidth
                                                        value={item.quantity} onChange={e => updateWorkToday(i, 'quantity', Number(e.target.value))}
                                                    />
                                                    <TextField 
                                                        label="Chainage" size="small" fullWidth
                                                        value={item.location} onChange={e => updateWorkToday(i, 'location', e.target.value)}
                                                    />
                                                </Box>
                                            </Grid>
                                            {/* Fix: Replaced deprecated Grid props with v6 size prop */}
                                            <Grid item xs={12} md={2} sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                                                <IconButton color="error" onClick={() => removeWorkToday(i)}><Trash2/></IconButton>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                );
                            })}
                            <Button variant="outlined" startIcon={<Plus/>} onClick={handleAddWorkToday} sx={{ py: 1.5, borderStyle: 'dashed' }}>Add Another Entry</Button>
                        </Stack>
                    </Box>
                )}
                {activeTab === 1 && (
                    <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Manpower & Fleet Tracking</Typography>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Manpower and fleet tracking functionality coming soon.
                        </Alert>
                    </Box>
                )}
                {activeTab === 2 && (
                    <Box>
                        <Typography variant="h6" fontWeight="bold" mb={2}>Description of Works Done & Remarks</Typography>
                                        
                        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: 'white' }}>
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>Description of Works Done</Typography>
                            <TextField 
                                fullWidth 
                                multiline 
                                rows={4}
                                placeholder="Sample collection for Test performance, etc."
                                value={workItemsToday.map(item => item.description).join('\n')}
                                onChange={e => {
                                    // Update all work items with the new description
                                    const descriptions = e.target.value.split('\n');
                                    const updated = [...workItemsToday];
                                    for (let i = 0; i < updated.length; i++) {
                                        if (descriptions[i]) {
                                            updated[i] = { ...updated[i], description: descriptions[i] };
                                        }
                                    }
                                    setWorkItemsToday(updated);
                                }}
                                size="small"
                            />
                        </Paper>
                                        
                        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: 'white' }}>
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>Remarks</Typography>
                            {remarks.map((remark, index) => (
                                <Box key={index} mb={2}>
                                    <TextField 
                                        fullWidth 
                                        multiline 
                                        rows={2}
                                        placeholder={`Remark ${index + 1}...`}
                                        value={remark}
                                        onChange={e => {
                                            const updated = [...remarks];
                                            updated[index] = e.target.value;
                                            setRemarks(updated);
                                        }}
                                        size="small"
                                    />
                                </Box>
                            ))}
                            <Button 
                                variant="outlined" 
                                startIcon={<Plus/>} 
                                onClick={() => setRemarks([...remarks, ''])}
                                sx={{ mt: 1 }}
                            >
                                Add Remark
                            </Button>
                        </Paper>
                                        
                        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: 'white' }}>
                            <Typography variant="subtitle2" fontWeight="bold" mb={2}>Submission</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        fullWidth 
                                        label="Submitted By (Contractor)"
                                        value={submittedBy}
                                        onChange={e => setSubmittedBy(e.target.value)}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        fullWidth 
                                        label="Received By (Engineer)"
                                        value={receivedBy}
                                        onChange={e => setReceivedBy(e.target.value)}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                )}
            </Box>
        </Paper>
    </Box>
  );
};

export default DailyReportModule;
