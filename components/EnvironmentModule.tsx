
import React, { useState } from 'react';
import { 
    Box, Typography, Paper, Grid, TextField, Button, Table, 
    TableHead, TableBody, TableRow, TableCell, Chip, Stack,
    LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    InputAdornment, Divider, Alert
} from '@mui/material';
import { 
    Trees, CloudRain, Droplets, MapPin, Plus, X, Save,
    ShieldCheck, Calendar, Wind, Thermometer, History
} from 'lucide-react';
import { Project, UserRole, TreeLog, SprinklingLog } from '../types';

interface Props {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

const EnvironmentModule: React.FC<Props> = ({ project, onProjectUpdate }) => {
    const [activeTab, setActiveTab] = useState<'TREES' | 'SPRINKLING'>('TREES');
    const [isTreeModalOpen, setIsTreeModalOpen] = useState(false);
    const [isSprinkleModalOpen, setIsSprinkleModalOpen] = useState(false);

    const registry = project.environmentRegistry || { treesRemoved: 0, treesPlanted: 0, treeLogs: [], sprinklingLogs: [], airQualityLogs: [] };
    
    const treeStats = { removed: 0, planted: 0, target: 0 };
    for (const log of registry.treeLogs) {
        treeStats.removed += (log.removedCount || 0);
        treeStats.planted += (log.plantedCount || 0);
        treeStats.target += (log.targetPlant || 0);
    }

    const handleSaveTree = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const removed = Number(data.get('removed'));
        const location = data.get('location') as string || 'Unknown';
        const newLog: TreeLog = {
            id: `tree-${Date.now()}`,
            chainage: data.get('chainage') as string,
            species: data.get('species') as string,
            location: data.get('location') as string || 'Unknown',
            action: 'Removed',
            count: removed,
            removedCount: removed,
            plantedCount: 0,
            targetPlant: removed * 10,
            date: new Date().toISOString().split('T')[0]
        };
        onProjectUpdate({
            ...project,
            environmentRegistry: { ...registry, treeLogs: [...registry.treeLogs, newLog] }
        });
        setIsTreeModalOpen(false);
    };

    const handleSaveSprinkle = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const newLog: SprinklingLog = {
            id: `sprinkle-${Date.now()}`,
            date: data.get('date') as string,
            area: data.get('location') as string,
            volume: Number(data.get('volume')),
            unit: 'liters',
            operator: data.get('operator') as string,
        };
        onProjectUpdate({
            ...project,
            environmentRegistry: { ...registry, sprinklingLogs: [...registry.sprinklingLogs, newLog] }
        });
        setIsSprinkleModalOpen(false);
    };
    
    return (
        <Box className="animate-in fade-in duration-500">
            <Box display="flex" justifyContent="space-between" mb={4} alignItems="center">
                <Box>
                    <Typography variant="h5" fontWeight="900">Environmental Compliance</Typography>
                    <Typography variant="body2" color="text.secondary">Safeguard monitoring per project EMP guidelines</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant={activeTab === 'TREES' ? 'contained' : 'outlined'} startIcon={<Trees/>} onClick={() => setActiveTab('TREES')}>Tree Replacement</Button>
                    <Button variant={activeTab === 'SPRINKLING' ? 'contained' : 'outlined'} startIcon={<Droplets/>} onClick={() => setActiveTab('SPRINKLING')}>Dust Suppression</Button>
                </Stack>
            </Box>

            {activeTab === 'TREES' && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: '#f0fdf4' }}>
                            <Typography variant="caption" fontWeight="900" color="success.main" sx={{ letterSpacing: 1 }}>COMPENSATORY PLANTATION (1:10)</Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="baseline" mt={2}>
                                <Typography variant="h3" fontWeight="900">{treeStats.planted}</Typography>
                                <Typography variant="h6" color="text.secondary">/ {treeStats.target}</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={treeStats.target > 0 ? (treeStats.planted / treeStats.target) * 100 : 0} color="success" sx={{ height: 10, borderRadius: 5, mt: 2 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Based on {treeStats.removed} trees cleared along the alignment.</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                            <Box p={2} borderBottom="1px solid #eee" display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" fontWeight="bold">Removal & Plantation Ledger</Typography>
                                <Button size="small" variant="contained" color="success" startIcon={<Plus size={16}/>} onClick={() => setIsTreeModalOpen(true)}>Log Clearing</Button>
                            </Box>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: 'slate.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Location (Ch)</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Species</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cleared</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Target</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Planted</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {registry.treeLogs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell>{log.date}</TableCell>
                                            {/* Fixed: Used sx prop for fontWeight on TableCell */}
                                            <TableCell sx={{ fontWeight: 'bold' }}>{log.chainage}</TableCell>
                                            <TableCell>{log.species}</TableCell>
                                            <TableCell align="right" sx={{ color: 'error.main' }}>-{log.removedCount}</TableCell>
                                            <TableCell align="right">{log.targetPlant}</TableCell>
                                            <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>{log.plantedCount}</TableCell>
                                        </TableRow>
                                    ))}
                                    {registry.treeLogs.length === 0 && (
                                        <TableRow>
                                            <TableCell align="center" {...{ colSpan: 6 }} sx={{ py: 6, color: 'text.disabled' }}>No tree clearing logs recorded.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {activeTab === 'SPRINKLING' && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
                            <Typography variant="caption" fontWeight="900" color="primary" sx={{ letterSpacing: 1 }}>DAILY TARGET MONITOR</Typography>
                            <Stack spacing={2} mt={3}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2">Today's Logs</Typography>
                                    <Chip label="2/3" color="warning" size="small" sx={{ fontWeight: 'bold' }} />
                                </Box>
                                <Alert severity="warning" icon={<Wind size={18}/>}>Dry conditions reported. Ensure 3rd sprinkling cycle is completed at high-traffic zones.</Alert>
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                         <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                            <Box p={2} borderBottom="1px solid #eee" display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" fontWeight="bold">Water Sprinkling History</Typography>
                                <Button size="small" variant="contained" startIcon={<Plus size={16}/>} onClick={() => setIsSprinkleModalOpen(true)}>Record Cycle</Button>
                            </Box>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: 'slate.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Cycle</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Section Covered</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Bowser Ref</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {registry.sprinklingLogs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell>{log.date}</TableCell>
                                            <TableCell><Chip label={log.time || 'N/A'} size="small" sx={{ height: 20, fontSize: 10 }} /></TableCell>
                                            {/* Fixed: Used sx prop for fontWeight on TableCell */}
                                            <TableCell sx={{ fontWeight: 'bold' }}>{log.location || 'N/A'}</TableCell>
                                            <TableCell>{log.bowserId || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {registry.sprinklingLogs.length === 0 && (
                                        <TableRow>
                                            <TableCell align="center" {...{ colSpan: 4 }} sx={{ py: 6, color: 'text.disabled' }}>No sprinkling cycles logged today.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                         </Paper>
                    </Grid>
                </Grid>
            )}

            <Dialog open={isTreeModalOpen} onClose={() => setIsTreeModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ component: 'form', onSubmit: handleSaveTree, sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.main', color: 'white', p: 2, borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
                    <Trees size={20} className="text-white" /> Log Tree Clearing
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={3} mt={1}>
                        <TextField name="chainage" label="Location (Ch)" fullWidth size="small" required />
                        <TextField name="species" label="Tree Species" fullWidth size="small" required />
                        <TextField name="removed" label="Number of Trees" type="number" fullWidth size="small" required helperText="System will auto-calculate 1:10 target." />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: 'grey.50', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }}>
                    <Button onClick={() => setIsTreeModalOpen(false)} startIcon={<X size={16} />} sx={{ px: 3, py: 1, fontWeight: 600 }}>Cancel</Button>
                    <Button type="submit" variant="contained" startIcon={<Save size={16} />} color="success" sx={{ px: 3, py: 1, fontWeight: 600, boxShadow: 2, '&:hover': { boxShadow: 3 } }}>Commit Registry</Button>
                </DialogActions>
            </Dialog>
            
            <Dialog open={isSprinkleModalOpen} onClose={() => setIsSprinkleModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ component: 'form', onSubmit: handleSaveSprinkle, sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.main', color: 'white', p: 2, borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
                    <Droplets size={20} className="text-white" /> Record Sprinkling Cycle
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={3} mt={1}>
                        <TextField name="date" label="Date" type="date" fullWidth size="small" required InputLabelProps={{ shrink: true }} defaultValue={new Date().toISOString().split('T')[0]} />
                        <TextField name="location" label="Section Covered (Chainage/Location)" fullWidth size="small" required />
                        <TextField name="volume" label="Volume (Ltrs)" type="number" fullWidth size="small" required />
                        <TextField name="operator" label="Operator" fullWidth size="small" required />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: 'grey.50', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }}>
                    <Button onClick={() => setIsSprinkleModalOpen(false)} startIcon={<X size={16} />} sx={{ px: 3, py: 1, fontWeight: 600 }}>Cancel</Button>
                    <Button type="submit" variant="contained" startIcon={<Save size={16} />} color="primary" sx={{ px: 3, py: 1, fontWeight: 600, boxShadow: 2, '&:hover': { boxShadow: 3 } }}>Save Cycle</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EnvironmentModule;
