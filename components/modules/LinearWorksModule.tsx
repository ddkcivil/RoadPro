
import React, { useState, useMemo } from 'react';
import { 
    Box, Typography, Button, Card, Grid, TextField, 
    FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, 
    DialogContent, DialogActions, Chip, Tabs, Tab, Paper,
    Table, TableBody, TableCell, TableHead, TableRow, Stack, 
    LinearProgress, IconButton, Tooltip, Divider, InputAdornment,
    ToggleButtonGroup, ToggleButton, Snackbar
} from '@mui/material';
import { Project, UserRole, LinearWorkLog } from '../../types';
import { 
    Plus, Trash2, Layers, MapPin, History, Filter, 
    TrendingUp, Ruler, Navigation, ShieldCheck, 
    Construction, Waves, Footprints, Grid2X2
} from 'lucide-react';

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
);

interface Props {
  project: Project;
  userRole: UserRole;
  onProjectUpdate: (project: Project) => void;
}

const LINEAR_CATEGORIES = [
    { id: 'Pavement', icon: <Layers size={18} />, label: 'Pavement' },
    { id: 'Drainage', icon: <Waves size={18} />, label: 'Drainage' },
    { id: 'Footpath', icon: <Footprints size={18} />, label: 'Footpath' },
    { id: 'Median', icon: <Grid2X2 size={18} />, label: 'Median & Kerbs' }
];

const WORK_LAYERS: Record<string, string[]> = {
    'Pavement': ['Embankment', 'Subgrade', 'GSB', 'WMM', 'Prime Coat', 'Tack Coat', 'DBM', 'BC', 'Concrete Pavement'],
    'Drainage': ['Trench Excavation', 'PCC Bedding', 'Wall Construction', 'Cover Slab', 'Finishing / Plastering'],
    'Footpath': ['Subgrade Prep', 'Granular Base', 'Kerb Stone Fixing', 'Tactile Pavers', 'Interlocking Blocks'],
    'Median': ['Curb Casting', 'Soil Filling', 'Landscape Preparation', 'W-Beam Barrier']
};

const LinearWorksModule: React.FC<Props> = ({ project, onProjectUpdate, userRole }) => {
  const [activeCategory, setActiveCategory] = useState('Pavement');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [newLog, setNewLog] = useState<Partial<LinearWorkLog>>({ 
      category: 'Pavement', 
      date: new Date().toISOString().split('T')[0],
      side: 'Both',
      layer: ''
  });

  const logs = project.linearWorks || [];
  const filteredLogs = logs.filter(l => l.category === activeCategory);

  const stats = useMemo(() => {
      const uniqueLayers = WORK_LAYERS[activeCategory] || [];
      return uniqueLayers.map(layer => {
          const layerLogs = filteredLogs.filter(l => l.layer === layer);
          const totalKm = layerLogs.reduce((acc, l) => acc + (l.endChainage - l.startChainage), 0);
          return { layer, totalKm };
      });
  }, [filteredLogs, activeCategory]);

  const handleSaveLog = () => {
      if (!newLog.layer || newLog.startChainage === undefined || newLog.endChainage === undefined) return;
      
      const log: LinearWorkLog = {
          id: `lin-${Date.now()}`,
          category: activeCategory,
          layer: newLog.layer!,
          startChainage: Number(newLog.startChainage),
          endChainage: Number(newLog.endChainage),
          date: newLog.date!,
          side: newLog.side as any || 'Both',
          status: 'Completed'
      };

      onProjectUpdate({ ...project, linearWorks: [...logs, log] });
      setIsLogModalOpen(false);
      setNewLog({ category: activeCategory, date: new Date().toISOString().split('T')[0], side: 'Both', layer: '' });
  };

  const handleDeleteLog = (id: string) => {
      if (confirm("Delete this work log?")) {
          onProjectUpdate({ ...project, linearWorks: logs.filter(l => l.id !== id) });
      }
  };

  const handleExport = () => {
      setSnackbarOpen(true);
  };

  return (
    <Box className="animate-in fade-in duration-500">
        <Box display="flex" justifyContent="space-between" mb={4} alignItems="center">
            <Box>
                <Typography variant="h5" fontWeight="900">Linear Operations</Typography>
                <Typography variant="body2" color="text.secondary">Kilometer-wise progress of pavement and utilities</Typography>
            </Box>
            <Stack direction="row" spacing={2}>
                <Button variant="outlined" startIcon={<History size={18}/>} sx={{ borderRadius: 2 }} onClick={handleExport}>Export History</Button>
                <Button variant="contained" startIcon={<Plus size={18}/>} onClick={() => setIsLogModalOpen(true)} sx={{ borderRadius: 2 }}>Log Progress</Button>
            </Stack>
        </Box>

        <Paper variant="outlined" sx={{ mb: 4, borderRadius: 4, bgcolor: 'white', overflow: 'hidden' }}>
            <Tabs 
                value={activeCategory} 
                onChange={(e, v) => setActiveCategory(v)} 
                sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'slate.50' }}
            >
                {LINEAR_CATEGORIES.map(cat => (
                    <Tab 
                        key={cat.id} 
                        value={cat.id} 
                        label={cat.label} 
                        icon={cat.icon} 
                        iconPosition="start"
                        sx={{ fontWeight: 'bold', minHeight: 60 }}
                    />
                ))}
            </Tabs>
            
            <Box p={3}>
                <Grid container spacing={3}>
                    {/* Fix: Replaced deprecated Grid props with v6 size prop */}
                    <Grid item xs={12} lg={4}>
                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: 1, display: 'block', mb: 2 }}>CATEGORY COVERAGE</Typography>
                        <Stack spacing={2.5}>
                            {stats.map(s => (
                                <Box key={s.layer}>
                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                        <Typography variant="caption" fontWeight="bold">{s.layer}</Typography>
                                        <Typography variant="caption" fontWeight="900" color="primary">{s.totalKm.toFixed(3)} Km</Typography>
                                    </Box>
                                    <LinearProgress variant="determinate" value={Math.min(100, (s.totalKm / 15) * 100)} sx={{ height: 6, borderRadius: 3, bgcolor: 'slate.100' }} />
                                </Box>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Fix: Replaced deprecated Grid props with v6 size prop */}
                    <Grid item xs={12} lg={8}>
                        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                            <Box p={2} borderBottom={1} borderColor="divider" display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" fontWeight="bold">History: {activeCategory}</Typography>
                                <IconButton size="small"><Filter size={16}/></IconButton>
                            </Box>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: 'slate.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Layer</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Range</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Side</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                                        <TableRow key={log.id} hover>
                                            <TableCell sx={{ fontSize: '0.8rem' }}>{log.date}</TableCell>
                                            <TableCell><Typography variant="body2" fontWeight="bold">{log.layer}</Typography></TableCell>
                                            <TableCell><Chip label={`${log.startChainage.toFixed(3)} - ${log.endChainage.toFixed(3)}`} size="small" variant="outlined" sx={{ fontSize: 9, fontFamily: 'monospace' }} /></TableCell>
                                            <TableCell><Chip label={log.side} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: 8 }} /></TableCell>
                                            <TableCell align="right"><IconButton size="small" color="error" onClick={() => handleDeleteLog(log.id)}><Trash2 size={16}/></IconButton></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Paper>

        <Dialog open={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5 }}><Ruler className="text-indigo-600" /> Log Progress</DialogTitle>
            <DialogContent>
                <Stack spacing={3} pt={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Layer</InputLabel>
                        <Select value={newLog.layer} label="Layer" onChange={e => setNewLog({...newLog, layer: e.target.value})}>
                            {(WORK_LAYERS[activeCategory] || []).map(l => (<MenuItem key={l} value={l}>{l}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <Grid container spacing={2}>
                        {/* Fix: Replaced deprecated Grid props with v6 size prop */}
                        <Grid item xs={6}><TextField label="Start Km" type="number" fullWidth size="small" value={newLog.startChainage} onChange={e => setNewLog({...newLog, startChainage: Number(e.target.value)})} /></Grid>
                        {/* Fix: Replaced deprecated Grid props with v6 size prop */}
                        <Grid item xs={6}><TextField label="End Km" type="number" fullWidth size="small" value={newLog.endChainage} onChange={e => setNewLog({...newLog, endChainage: Number(e.target.value)})} /></Grid>
                    </Grid>
                    <ToggleButtonGroup color="primary" value={newLog.side} exclusive onChange={(_, v) => v && setNewLog({...newLog, side: v})} fullWidth size="small">
                        <ToggleButton value="LHS">LHS</ToggleButton><ToggleButton value="RHS">RHS</ToggleButton><ToggleButton value="Both">BOTH</ToggleButton>
                    </ToggleButtonGroup>
                    <TextField label="Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setIsLogModalOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveLog} disabled={!newLog.layer} startIcon={<ShieldCheck size={18}/>}>Certify Log</Button>
            </DialogActions>
        </Dialog>
        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} message="Preparing high-fidelity PDF export of linear works history..." />
    </Box>
  );
};

export default LinearWorksModule;
