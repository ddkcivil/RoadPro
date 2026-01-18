import React, { useState, useMemo } from 'react';
import { Project, UserRole, Vehicle, VehicleLog, ScheduleTask } from '../types';
import { getAutofillSuggestions, checkForDuplicates } from '../utils/autofillUtils';
import { 
    Box, Typography, Button, Card, Grid, 
    Avatar, Chip, Stack, Paper, 
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControl, InputLabel, Select, MenuItem, Divider,
    // Fix: Added missing 'Alert' import from @mui/material
    LinearProgress, Snackbar, Table, TableHead, TableRow, TableCell, TableBody,
    InputAdornment, Tabs, Tab, Alert, IconButton, Autocomplete, Tooltip
} from '@mui/material';
import { 
    Truck, Gauge, Droplets, Clock, Signal, Plus, 
    // Fix: Added missing 'CheckCircle2' import from lucide-react
    ShieldCheck, MapPin, History, Save, X, Navigation,
    ArrowUpRight, Fuel, Calendar, HardHat, CheckCircle2, Trash2, Edit, AlertTriangle
} from 'lucide-react';

interface Props {
  project: Project;
  userRole: UserRole;
  onProjectUpdate: (project: Project) => void;
}

const FleetModule: React.FC<Props> = ({ project, onProjectUpdate, userRole }) => {
  const [activeTab, setActiveTab] = useState(0);
  const vehicles = project.vehicles || [];
  const vehicleLogs = project.vehicleLogs || [];
  const [selectedId, setSelectedId] = useState<string | null>(vehicles[0]?.id || null);
  const [activeDetailTab, setActiveDetailTab] = useState(0);
  
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isLogTripModalOpen, setIsLogTripModalOpen] = useState(false);
  const [isEditVehicleModalOpen, setIsEditVehicleModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const activeVehicle = vehicles.find(v => v.id === selectedId);
  const activeVehicleLogs = useMemo(() => 
    vehicleLogs.filter(log => log.vehicleId === selectedId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [vehicleLogs, selectedId]
  );

  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
      plateNumber: '',
      type: 'Tipper Truck',
      driver: '',
      status: 'Active'
  });

  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(null);

  const [tripForm, setTripForm] = useState<Partial<VehicleLog>>({
      date: new Date().toISOString().split('T')[0],
      startKm: 0,
      endKm: 0,
      fuelConsumed: 0,
      workingHours: 0,
      activityDescription: ''
  });

  const handleAddVehicle = () => {
    setNewVehicle({
      plateNumber: '',
      type: 'Tipper Truck',
      driver: '',
      status: 'Active'
    });
    setIsRegModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle({
      id: vehicle.id,
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      driver: vehicle.driver,
      status: vehicle.status,
      geofenceStatus: vehicle.geofenceStatus,
      agencyId: vehicle.agencyId
    });
    setIsEditVehicleModalOpen(true);
  };

  const handleSaveVehicle = () => {
    // Validation
    if (!newVehicle.plateNumber?.trim()) {
      alert('Plate number is required');
      return;
    }
    
    if (!newVehicle.driver?.trim()) {
      alert('Driver name is required');
      return;
    }
    
    // Check for duplicate plate number
    const duplicateVehicle = vehicles.find(v => v.plateNumber?.toLowerCase() === newVehicle.plateNumber?.toLowerCase());
    if (duplicateVehicle) {
      if (!confirm(`A vehicle with plate number '${newVehicle.plateNumber}' already exists. Do you want to add it anyway?`)) {
        return;
      }
    }

    const vehicle: Vehicle = { 
      ...newVehicle, 
      id: `v-${Date.now()}`, 
      status: newVehicle.status || 'Active',
      geofenceStatus: newVehicle.geofenceStatus || 'Inside',
      agencyId: newVehicle.agencyId || undefined
    } as Vehicle;
    
    onProjectUpdate({ ...project, vehicles: [...vehicles, vehicle] });
    setIsRegModalOpen(false);
    setNewVehicle({ plateNumber: '', type: 'Tipper Truck', driver: '', status: 'Active' });
  };

  const handleUpdateVehicle = () => {
    if (!editingVehicle?.id) return;
    
    // Validation
    if (!editingVehicle.plateNumber?.trim()) {
      alert('Plate number is required');
      return;
    }
    
    if (!editingVehicle.driver?.trim()) {
      alert('Driver name is required');
      return;
    }
    
    // Check for duplicate plate number (excluding the current vehicle being edited)
    const duplicateVehicle = vehicles.find(v => 
      v.plateNumber?.toLowerCase() === editingVehicle.plateNumber?.toLowerCase() && 
      v.id !== editingVehicle.id
    );
    if (duplicateVehicle) {
      if (!confirm(`A vehicle with plate number '${editingVehicle.plateNumber}' already exists. Do you want to update anyway?`)) {
        return;
      }
    }

    const updatedVehicles = vehicles.map(vehicle => 
      vehicle.id === editingVehicle.id 
        ? { 
            ...vehicle, 
            plateNumber: editingVehicle.plateNumber,
            type: editingVehicle.type,
            driver: editingVehicle.driver,
            status: editingVehicle.status,
            geofenceStatus: editingVehicle.geofenceStatus,
            agencyId: vehicle.agencyId  // Preserve agencyId when updating
          } 
        : vehicle
    );
    
    onProjectUpdate({ ...project, vehicles: updatedVehicles });
    setIsEditVehicleModalOpen(false);
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle? This will also delete all associated trip logs.')) {
      // Remove the vehicle
      const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
      // Remove all logs associated with this vehicle
      const updatedLogs = vehicleLogs.filter(log => log.vehicleId !== vehicleId);
      
      onProjectUpdate({ 
        ...project, 
        vehicles: updatedVehicles,
        vehicleLogs: updatedLogs
      });
      
      // If the deleted vehicle was selected, clear selection
      if (selectedId === vehicleId) {
        setSelectedId(updatedVehicles[0]?.id || null);
      }
    }
  };

  const handleSaveTrip = () => {
      if (!activeVehicle || !tripForm.endKm || tripForm.endKm < (tripForm.startKm || 0)) {
          alert("Please check odometer readings. End KM must be greater than Start KM.");
          return;
      }

      const totalKm = Number(tripForm.endKm) - Number(tripForm.startKm || 0);
      const log: VehicleLog = {
          ...tripForm,
          id: `vl-${Date.now()}`,
          vehicleId: activeVehicle.id,
          plateNumber: activeVehicle.plateNumber,
          totalKm,
          date: tripForm.date!,
          startKm: Number(tripForm.startKm),
          endKm: Number(tripForm.endKm),
          fuelConsumed: Number(tripForm.fuelConsumed),
          workingHours: Number(tripForm.workingHours),
          activityDescription: tripForm.activityDescription || 'Daily work'
      } as VehicleLog;

      onProjectUpdate({ ...project, vehicleLogs: [...vehicleLogs, log] });
      setIsLogTripModalOpen(false);
      setTripForm({ date: new Date().toISOString().split('T')[0], startKm: 0, endKm: 0, fuelConsumed: 0, workingHours: 0, activityDescription: '' });
  };

  const handleDeleteTripLog = (logId: string) => {
      if (window.confirm('Are you sure you want to delete this trip log?')) {
          const updatedLogs = vehicleLogs.filter(log => log.id !== logId);
          onProjectUpdate({ ...project, vehicleLogs: updatedLogs });
      }
  };

  const handleOpenTripLog = () => {
    const lastLog = activeVehicleLogs[0];
    setTripForm({
        ...tripForm,
        startKm: lastLog ? lastLog.endKm : 0,
        endKm: lastLog ? lastLog.endKm : 0
    });
    setIsLogTripModalOpen(true);
  };

  return (
    <Box className="animate-in fade-in duration-500">
        <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
            <Box>
                <Typography variant="h5" fontWeight="900">Fleet & Equipment</Typography>
                <Typography variant="body2" color="text.secondary">Real-time telematics & utilization</Typography>
            </Box>
            <Button variant="contained" startIcon={<Plus size={16}/>} onClick={handleAddVehicle} sx={{ paddingX: 1.5, paddingY: 0.75 }}>Register Plant</Button>
        </Box>

        <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
                <Stack spacing={1.5}>
                    {vehicles.map(v => (
                        <Card 
                            key={v.id} 
                            variant="outlined"
                            onClick={() => { setSelectedId(v.id); setActiveDetailTab(0); }} 
                            sx={{ 
                                cursor: 'pointer', borderRadius: 3, transition: 'all 0.2s', borderLeft: '6px solid',
                                borderLeftColor: v.status === 'Active' ? 'success.main' : 'warning.main',
                                bgcolor: selectedId === v.id ? 'indigo.50/20' : 'white',
                                borderColor: selectedId === v.id ? 'primary.main' : 'divider'
                            }}
                        >
                            <Box p={1.5} display="flex" alignItems="center" gap={1.5}>
                                <Avatar sx={{ bgcolor: 'slate.100', color: 'slate.600' }}><Truck size={20}/></Avatar>
                                <Box flex={1}>
                                    <Typography variant="subtitle2" fontWeight="bold">{v.plateNumber}</Typography>
                                    <Typography variant="caption" color="text.secondary">{v.type}</Typography>
                                    <Typography variant="caption" color="primary.main">
                                      {v.agencyId ? (
                                        project.agencies?.find(a => a.id === v.agencyId)?.name || 'Unknown Agency'
                                      ) : 'Unassigned'}
                                    </Typography>
                                </Box>
                                <Chip label={v.status} size="small" sx={{ fontSize: 8, height: 16 }} />
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditVehicle(v); }}>
                                  <Edit size={14} />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteVehicle(v.id); }}>
                                  <Trash2 size={14} />
                                </IconButton>
                            </Box>
                        </Card>
                    ))}
                </Stack>
            </Grid>

            <Grid item xs={12} md={8}>
                {activeVehicle ? (
                    <Stack spacing={3}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
                            <Box display="flex" justifyContent="space-between" mb={3}>
                                <Box display="flex" gap={2}>
                                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}><Truck size={28}/></Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight="900">{activeVehicle.plateNumber}</Typography>
                                        <Typography variant="body2" color="text.secondary">Operator: <b>{activeVehicle.driver}</b></Typography>
                                        <Typography variant="body2" color="primary.main">Agency: <b>{activeVehicle.agencyId ? (
                                          project.agencies?.find(a => a.id === activeVehicle.agencyId)?.name || 'Unknown Agency'
                                        ) : 'Unassigned'}</b></Typography>
                                    </Box>
                                </Box>
                                <Button variant="contained" color="secondary" startIcon={<Navigation size={16}/>} size="small" onClick={handleOpenTripLog}>Log Trip / Work</Button>
                            </Box>
                            
                            <Tabs value={activeDetailTab} onChange={(_, v) => setActiveDetailTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                                <Tab label="Summary" icon={<Gauge size={18}/>} iconPosition="start" />
                                <Tab label="Trip History" icon={<History size={18}/>} iconPosition="start" />
                            </Tabs>

                            {activeDetailTab === 0 && (
                                <>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6} md={3}><Paper variant="outlined" sx={{ textAlign: 'center', py: 2 }}><Gauge size={16}/><Typography variant="subtitle1" fontWeight="bold">{(activeVehicleLogs.reduce((acc, l) => acc + l.totalKm, 0)).toLocaleString()}</Typography><Typography variant="caption">Total Km</Typography></Paper></Grid>
                                        <Grid item xs={6} md={3}><Paper variant="outlined" sx={{ textAlign: 'center', py: 2 }}><Droplets size={16} className="text-emerald-500"/><Typography variant="subtitle1" fontWeight="bold">{activeVehicleLogs.length > 0 ? (activeVehicleLogs[0].fuelConsumed) : '0'}L</Typography><Typography variant="caption">Last Fuel</Typography></Paper></Grid>
                                        <Grid item xs={6} md={3}><Paper variant="outlined" sx={{ textAlign: 'center', py: 2 }}><Clock size={16} className="text-amber-500"/><Typography variant="subtitle1" fontWeight="bold">{(activeVehicleLogs.reduce((acc, l) => acc + l.workingHours, 0)).toFixed(1)}h</Typography><Typography variant="caption">Total Use</Typography></Paper></Grid>
                                        <Grid item xs={6} md={3}><Paper variant="outlined" sx={{ textAlign: 'center', py: 2 }}><MapPin size={16} className="text-rose-500"/><Typography variant="subtitle1" fontWeight="bold">{activeVehicle.geofenceStatus || 'Inside'}</Typography><Typography variant="caption">Geofence</Typography></Paper></Grid>
                                    </Grid>

                                    <Box mt={4}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}><ShieldCheck size={18} className="text-indigo-600"/> HEALTH STATUS</Typography>
                                        <Divider sx={{ my: 2 }} />
                                        <Box mb={2}><Box display="flex" justifyContent="space-between" mb={0.5}><Typography variant="caption" fontWeight="bold">Engine Performance</Typography><Typography variant="caption" fontWeight="bold">95%</Typography></Box><LinearProgress variant="determinate" value={95} color="success" sx={{ height: 6, borderRadius: 3 }} /></Box>
                                        <Box><Box display="flex" justifyContent="space-between" mb={0.5}><Typography variant="caption" fontWeight="bold">Service Due</Typography><Typography variant="caption" fontWeight="bold">32 Days</Typography></Box><LinearProgress variant="determinate" value={30} color="warning" sx={{ height: 6, borderRadius: 3 }} /></Box>
                                    </Box>
                                </>
                            )}

                            {activeDetailTab === 1 && (
                                <Box>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: 'slate.50' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Activity / Task</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Range (Km)</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Fuel (L)</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {activeVehicleLogs.map(log => (
                                                <TableRow key={log.id} hover>
                                                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{log.date}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="medium">{log.activityDescription}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{log.startKm} - {log.endKm}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="bold" color="primary">{log.totalKm} Km</Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                                                            <Typography variant="body2">{log.fuelConsumed}</Typography>
                                                            <Fuel size={12} className="text-slate-400" />
                                                            <IconButton size="small" color="error" onClick={() => handleDeleteTripLog(log.id)}>
                                                                <Trash2 size={14} />
                                                            </IconButton>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {activeVehicleLogs.length === 0 && (
                                                <TableRow>
                                                    <TableCell align="center" {...{ colSpan: 5 }} sx={{ py: 6 }}>
                                                        <Typography variant="body2" color="text.disabled">No logs found for this asset.</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Box>
                            )}
                        </Paper>
                    </Stack>
                ) : (
                    <Box py={20} textAlign="center" color="text.disabled"><Signal size={60} className="opacity-10 mb-4"/><Typography variant="h6">Select an asset to view telemetry</Typography></Box>
                )}
            </Grid>
        </Grid>

        {/* Register Asset Dialog */}
        <Dialog open={isRegModalOpen} onClose={() => setIsRegModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.main', color: 'white', p: 2, borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
                <Truck size={20} className="text-white" /> Register Asset
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Stack spacing={3} mt={1}>
                                    <Autocomplete
                      freeSolo
                      options={getAutofillSuggestions.generic(vehicles, 'plateNumber', newVehicle.plateNumber || '')}
                      value={newVehicle.plateNumber || ''}
                      onInputChange={(event, newValue) => {
                        setNewVehicle({...newVehicle, plateNumber: newValue});
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Plate Number"
                          fullWidth
                          size="small"
                          required
                          InputProps={{
                            ...params.InputProps,
                            type: 'search'
                          }}
                        />
                      )}
                    />
                    <Autocomplete
                      freeSolo
                      options={getAutofillSuggestions.generic(vehicles, 'driver', newVehicle.driver || '')}
                      value={newVehicle.driver || ''}
                      onInputChange={(event, newValue) => setNewVehicle({...newVehicle, driver: newValue})}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Driver Name"
                          fullWidth
                          size="small"
                          required
                          InputProps={{
                            ...params.InputProps,
                            type: 'search'
                          }}
                        />
                      )}
                    />
                    <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select value={newVehicle.type} label="Type" onChange={e => setNewVehicle({...newVehicle, type: e.target.value as any})}>
                            <MenuItem value="Tipper Truck">Tipper Truck</MenuItem>
                            <MenuItem value="Excavator">Excavator</MenuItem>
                            <MenuItem value="Motor Grader">Motor Grader</MenuItem>
                            <MenuItem value="Water Tanker">Water Tanker</MenuItem>
                            <MenuItem value="Roller">Static Roller</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select value={newVehicle.status} label="Status" onChange={e => setNewVehicle({...newVehicle, status: e.target.value as any})}>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Maintenance">Maintenance</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                        <InputLabel>Assigned Agency/Contractor</InputLabel>
                        <Select 
                          value={newVehicle.agencyId || ''}
                          label="Assigned Agency/Contractor"
                          onChange={e => setNewVehicle({...newVehicle, agencyId: e.target.value as string})}
                          size="small"
                          displayEmpty
                        >
                          <MenuItem value="">None</MenuItem>
                          {project.agencies?.filter(a => a.type === 'agency' || a.type === 'subcontractor').map(agency => (
                            <MenuItem key={agency.id} value={agency.id}>{agency.name}</MenuItem>
                          ))}
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: 'grey.50', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }}>
                <Button onClick={() => setIsRegModalOpen(false)} startIcon={<X size={16} />} sx={{ px: 3, py: 1, fontWeight: 600 }}>Cancel</Button>
                <Button variant="contained" startIcon={<Save size={16} />} onClick={handleSaveVehicle} sx={{ px: 3, py: 1, fontWeight: 600, boxShadow: 2, '&:hover': { boxShadow: 3 } }}>Save Asset</Button>
            </DialogActions>
        </Dialog>

        {/* Edit Vehicle Dialog */}
        <Dialog open={isEditVehicleModalOpen} onClose={() => setIsEditVehicleModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.main', color: 'white', p: 2, borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
                <Edit size={20} className="text-white" /> Edit Asset
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Stack spacing={3} mt={1}>
                                    <Autocomplete
                      freeSolo
                      options={getAutofillSuggestions.generic(vehicles, 'plateNumber', editingVehicle?.plateNumber || '')}
                      value={editingVehicle?.plateNumber || ''}
                      onInputChange={(event, newValue) => setEditingVehicle({...editingVehicle, plateNumber: newValue})}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Plate Number"
                          fullWidth
                          size="small"
                          required
                          InputProps={{
                            ...params.InputProps,
                            type: 'search'
                          }}
                        />
                      )}
                    />
                    <Autocomplete
                      freeSolo
                      options={getAutofillSuggestions.generic(vehicles, 'driver', editingVehicle?.driver || '')}
                      value={editingVehicle?.driver || ''}
                      onInputChange={(event, newValue) => setEditingVehicle({...editingVehicle, driver: newValue})}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Driver Name"
                          fullWidth
                          size="small"
                          required
                          InputProps={{
                            ...params.InputProps,
                            type: 'search'
                          }}
                        />
                      )}
                    />
                    <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select value={editingVehicle?.type || 'Tipper Truck'} label="Type" onChange={e => setEditingVehicle({...editingVehicle, type: e.target.value as any})}>
                            <MenuItem value="Tipper Truck">Tipper Truck</MenuItem>
                            <MenuItem value="Excavator">Excavator</MenuItem>
                            <MenuItem value="Motor Grader">Motor Grader</MenuItem>
                            <MenuItem value="Water Tanker">Water Tanker</MenuItem>
                            <MenuItem value="Roller">Static Roller</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select value={editingVehicle?.status || 'Active'} label="Status" onChange={e => setEditingVehicle({...editingVehicle, status: e.target.value as any})}>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Maintenance">Maintenance</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                        <InputLabel>Geofence Status</InputLabel>
                        <Select value={editingVehicle?.geofenceStatus || 'Inside'} label="Geofence Status" onChange={e => setEditingVehicle({...editingVehicle, geofenceStatus: e.target.value as any})}>
                            <MenuItem value="Inside">Inside</MenuItem>
                            <MenuItem value="Outside">Outside</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                        <InputLabel>Assigned Agency/Contractor</InputLabel>
                        <Select 
                          value={editingVehicle?.agencyId || ''}
                          label="Assigned Agency/Contractor"
                          onChange={e => setEditingVehicle({...editingVehicle, agencyId: e.target.value as string})}
                          size="small"
                          displayEmpty
                        >
                          <MenuItem value="">None</MenuItem>
                          {project.agencies?.filter(a => a.type === 'agency' || a.type === 'subcontractor').map(agency => (
                            <MenuItem key={agency.id} value={agency.id}>{agency.name}</MenuItem>
                          ))}
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: 'grey.50', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }}>
                <Button onClick={() => setIsEditVehicleModalOpen(false)} startIcon={<X size={16} />} sx={{ px: 3, py: 1, fontWeight: 600 }}>Cancel</Button>
                <Button variant="contained" startIcon={<Save size={16} />} onClick={handleUpdateVehicle} sx={{ px: 3, py: 1, fontWeight: 600, boxShadow: 2, '&:hover': { boxShadow: 3 } }}>Update Asset</Button>
            </DialogActions>
        </Dialog>

        {/* Log Trip Dialog */}
        <Dialog open={isLogTripModalOpen} onClose={() => setIsLogTripModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.main', color: 'white', p: 2, borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
                <Navigation size={20} className="text-white" /> Log Trip: {activeVehicle?.plateNumber}
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                            <TextField 
                                label="Date" type="date" fullWidth size="small" 
                                InputLabelProps={{ shrink: true }} 
                                value={tripForm.date} 
                                onChange={e => setTripForm({...tripForm, date: e.target.value})} 
                                InputProps={{ startAdornment: <Calendar size={16} className="text-slate-400 mr-2"/> }}
                            />
                            <TextField 
                                label="Start Odometer" type="number" fullWidth size="small" 
                                value={tripForm.startKm} 
                                onChange={e => setTripForm({...tripForm, startKm: Number(e.target.value)})} 
                                InputProps={{ endAdornment: <InputAdornment position="end">Km</InputAdornment> }}
                            />
                            <TextField 
                                label="End Odometer" type="number" fullWidth size="small" 
                                value={tripForm.endKm} 
                                onChange={e => setTripForm({...tripForm, endKm: Number(e.target.value)})} 
                                InputProps={{ endAdornment: <InputAdornment position="end">Km</InputAdornment> }}
                                helperText={`Calculated: ${Number(tripForm.endKm || 0) - Number(tripForm.startKm || 0)} Km`}
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                            <TextField 
                                label="Fuel Consumed" type="number" fullWidth size="small" 
                                value={tripForm.fuelConsumed} 
                                onChange={e => setTripForm({...tripForm, fuelConsumed: Number(e.target.value)})} 
                                InputProps={{ endAdornment: <InputAdornment position="end">Liters</InputAdornment> }}
                            />
                            <TextField 
                                label="Working Hours" type="number" fullWidth size="small" 
                                value={tripForm.workingHours} 
                                onChange={e => setTripForm({...tripForm, workingHours: Number(e.target.value)})} 
                                InputProps={{ endAdornment: <InputAdornment position="end">Hrs</InputAdornment> }}
                            />
                            <TextField 
                                label="Activity / Task / Location" fullWidth size="small" multiline rows={1}
                                value={tripForm.activityDescription} 
                                onChange={e => setTripForm({...tripForm, activityDescription: e.target.value})} 
                                placeholder="e.g. Shifting GSB KM 12-14"
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        {/* Fix: Alert is now correctly imported from @mui/material */}
                        <Alert icon={<HardHat size={18}/>} severity="info">
                            This log will be appended to the asset's utilization history for operational reporting.
                        </Alert>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: 'grey.50', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }}>
                <Button onClick={() => {setIsLogTripModalOpen(false); setTripForm({ date: new Date().toISOString().split('T')[0], startKm: 0, endKm: 0, fuelConsumed: 0, workingHours: 0, activityDescription: '' });}} startIcon={<X size={16} />} sx={{ px: 3, py: 1, fontWeight: 600 }}>Back</Button>
                {/* Fix: CheckCircle2 is now correctly imported from lucide-react */}
                <Button variant="contained" startIcon={<CheckCircle2 size={16}/>} onClick={handleSaveTrip} sx={{ px: 3, py: 1, fontWeight: 600, boxShadow: 2, '&:hover': { boxShadow: 3 } }}>Commit Trip Record</Button>
            </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} message="Opening full trip log history report..." />
    </Box>
  );
};

export default FleetModule;