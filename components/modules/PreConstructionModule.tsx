
import React, { useState } from 'react';
import { 
    Button, TextField, Grid, Select, MenuItem, FormControl, InputLabel, 
    Typography, Box, Chip, Card, Paper, Stack, IconButton,
    Table, TableBody, TableCell, TableHead, TableRow, Divider, 
    InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, LinearProgress, Avatar, Tabs, Tab, CardContent, Snackbar,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { 
    Plus, Calendar, Bell, Target, Trash2, AlertTriangle, 
    CheckCircle2, Clock, MapPin, Filter, Search, X, ChevronDown
} from 'lucide-react';
import { Project, PreConstructionTask } from '../../types';

interface Props {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

const PreConstructionModule: React.FC<Props> = ({ project, onProjectUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedTaskForTrack, setSelectedTaskForTrack] = useState<string | null>(null);
  
  // Forms
  const [newTask, setNewTask] = useState<Partial<PreConstructionTask>>({
    category: 'Survey',
    status: 'Pending',
    description: '',
    remarks: '',
    estStartDate: '',
    estEndDate: '',
    progress: 0
  });

  const [trackForm, setTrackForm] = useState({
      date: new Date().toISOString().split('T')[0],
      progressAdded: 0,
      description: ''
  });

  // --- Logic ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isDuplicate = project.preConstruction.some(t => t.description.toLowerCase() === newTask.description?.toLowerCase());
    if (isDuplicate) {
        alert("Duplicate: An activity with this description already exists.");
        return;
    }

    const task: PreConstructionTask = {
        id: `pre-${Date.now()}`,
        category: newTask.category as any,
        description: newTask.description || '',
        status: newTask.status as any,
        targetDate: newTask.estEndDate || '', // Default target to end date
        estStartDate: newTask.estStartDate,
        estEndDate: newTask.estEndDate,
        progress: 0,
        remarks: newTask.remarks || '',
        logs: []
    };
    onProjectUpdate({
        ...project,
        preConstruction: [...project.preConstruction, task]
    });
    setIsModalOpen(false);
    setNewTask({ category: 'Survey', status: 'Pending', description: '', remarks: '', estStartDate: '', estEndDate: '', progress: 0 });
  };

  const handleDeleteTask = (id: string) => {
      if (window.confirm("Are you sure you want to delete this activity? This action cannot be undone.")) {
          onProjectUpdate({
              ...project,
              preConstruction: project.preConstruction.filter(t => t.id !== id)
          });
      }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTaskForTrack) return;
      
      const updated = project.preConstruction.map(t => {
          if (t.id === selectedTaskForTrack) {
              const newProgress = Math.min(100, (t.progress || 0) + Number(trackForm.progressAdded));
              const newLog = {
                  date: trackForm.date,
                  progressAdded: Number(trackForm.progressAdded),
                  description: trackForm.description
              };
              const newStatus = newProgress === 100 ? 'Completed' : newProgress > 0 ? 'In Progress' : t.status;
              return { ...t, progress: newProgress, status: newStatus, logs: [...(t.logs || []), newLog] };
          }
          return t;
      });

      onProjectUpdate({ ...project, preConstruction: updated as any });
      setIsTrackModalOpen(false);
      setTrackForm({ date: new Date().toISOString().split('T')[0], progressAdded: 0, description: '' });
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Completed': return 'success';
          case 'In Progress': return 'info';
          default: return 'warning';
      }
  };

  const today = new Date().toISOString().split('T')[0];
  const dueTasks = project.preConstruction.filter(t => t.status !== 'Completed' && t.estEndDate && t.estEndDate <= today);

  return (
    <div className="space-y-6">
       
       {/* Header with Notification */}
       <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
        <Box>
          <Typography variant="caption" fontWeight="900" color="primary" sx={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}>PRE-CONSTRUCTION</Typography>
          <Typography variant="h4" fontWeight="900">Pre-Construction Activities</Typography>
          <Typography variant="body2" color="text.secondary">Land Acquisition, Clearances, and Surveys</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16}/>} onClick={() => setIsModalOpen(true)} sx={{ borderRadius: 2, paddingX: 1.5, paddingY: 0.75 }}>Add Activity</Button>
      </Box>

      {/* Daily Notification Banner */}
      {dueTasks.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Action Required: {dueTasks.length} Tasks Due or Overdue</Typography>
              <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                  {dueTasks.map(t => (
                      <li key={t.id}>{t.description} (Due: {t.estEndDate})</li>
                  ))}
              </ul>
          </Alert>
      )}

      {/* Task Grid */}
      <Grid container spacing={3}>
          {project.preConstruction.map(task => (
              <Grid item xs={12} md={6} lg={4} key={task.id}>
                  <Card variant="outlined" sx={{ borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Chip 
                                  label={task.status}
                                  size="small" 
                                  color={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'info' : 'warning'} 
                                  sx={{ fontWeight: 'bold' }} 
                              />
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteTask(task.id)}
                                title="Delete Activity"
                              >
                                  <Trash2 size={14} />
                              </IconButton>
                          </Box>
                          
                          <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase" mb={1}>
                              {task.category}
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" mb={2}>
                              {task.description}
                          </Typography>
                          
                          <Box mb={2}>
                              <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={1}>
                                  <Calendar size={14} /> Est: {task.estStartDate || 'N/A'} → {task.estEndDate || 'N/A'}
                              </Typography>
                          </Box>
                          
                          {/* Progress Bar */}
                          <Box mb={2}>
                              <Box display="flex" justifyContent="space-between" mb={1}>
                                  <Typography variant="caption" fontWeight="medium" color="text.secondary">Progress</Typography>
                                  <Typography variant="caption" fontWeight="bold">{task.progress || 0}%</Typography>
                              </Box>
                              <LinearProgress variant="determinate" value={task.progress || 0} color="primary" sx={{ height: 6, borderRadius: 3 }} />
                          </Box>

                          {task.remarks && (
                            <Box p={1} bgcolor="slate.50" borderRadius={1}>
                                <Typography variant="caption" fontStyle="italic">"{task.remarks}"</Typography>
                            </Box>
                          )}
                      </CardContent>
                      
                      <Box p={2} borderTop="1px solid" borderColor="divider" mt="auto">
                          <Button 
                             fullWidth
                             variant="outlined"
                             startIcon={<Target size={14} />}
                             onClick={() => { setSelectedTaskForTrack(task.id); setIsTrackModalOpen(true); }}
                          >
                              Track Daily Progress
                          </Button>
                      </Box>
                  </Card>
              </Grid>
          ))}
          {project.preConstruction.length === 0 && (
              <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderStyle: 'dashed', bgcolor: 'slate.50' }}>
                      <Typography color="text.disabled" fontStyle="italic">No pre-construction activities logged.</Typography>
                  </Paper>
              </Grid>
          )}
      </Grid>

       {/* Add Activity Modal */}
       <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ component: 'form', onSubmit: handleAddTask, sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.main', color: 'white', p: 2, borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
              <Plus size={20} className="text-white" /> Add Pre-Construction Activity
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
             <Stack spacing={3} mt={1}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select 
                     value={newTask.category}
                     label="Category"
                     onChange={e => setNewTask({...newTask, category: e.target.value as any})}
                  >
                      <MenuItem value="Survey">Survey</MenuItem>
                      <MenuItem value="Land Acquisition">Land Acquisition</MenuItem>
                      <MenuItem value="Forest Clearance">Forest Clearance</MenuItem>
                      <MenuItem value="Utility Shifting">Utility Shifting</MenuItem>
                      <MenuItem value="Design">Design</MenuItem>
                  </Select>
                </FormControl>
                <TextField 
                  label="Description" required fullWidth size="small" 
                  value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
                  placeholder="e.g. Joint Verification"
                />
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField 
                            label="Est. Start" required type="date" fullWidth size="small" 
                            value={newTask.estStartDate} onChange={e => setNewTask({...newTask, estStartDate: e.target.value})}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField 
                            label="Est. End" required type="date" fullWidth size="small" 
                            value={newTask.estEndDate} onChange={e => setNewTask({...newTask, estEndDate: e.target.value})}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
                <TextField 
                  label="Remarks" fullWidth size="small" multiline rows={3}
                  value={newTask.remarks} onChange={e => setNewTask({...newTask, remarks: e.target.value})}
                />
             </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: 'grey.50', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }}>
              <Button onClick={() => setIsModalOpen(false)} startIcon={<X size={16} />} sx={{ px: 3, py: 1, fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" variant="contained" startIcon={<CheckCircle2 size={16} />} color="primary" sx={{ px: 3, py: 1, fontWeight: 600, boxShadow: 2, '&:hover': { boxShadow: 3 } }}>Add Activity</Button>
          </DialogActions>
       </Dialog>

      {/* Track Progress Modal */}
      <Dialog open={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ component: 'form', onSubmit: handleTrackSubmit, sx: { borderRadius: 3 } }}>
         <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.main', color: 'white', p: 2, borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
            <Target size={20} className="text-white" /> Track Daily Progress
         </DialogTitle>
         <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3} mt={1}>
                <TextField 
                    label="Date" type="date" required fullWidth size="small" 
                    value={trackForm.date} onChange={e => setTrackForm({...trackForm, date: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField 
                    label="Progress Added (%)" type="number" inputProps={{ min: 0, max: 100 }} required fullWidth size="small" 
                    value={trackForm.progressAdded} onChange={e => setTrackForm({...trackForm, progressAdded: Number(e.target.value)})} 
                    helperText="Enter incremental percentage completed today."
                />
                <TextField 
                    label="Description / Activity" required fullWidth size="small" 
                    placeholder="e.g. Field work done" value={trackForm.description} onChange={e => setTrackForm({...trackForm, description: e.target.value})} 
                />
            </Stack>
         </DialogContent>
         <DialogActions sx={{ p: 2, bgcolor: 'grey.50', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }}>
            <Button type="button" onClick={() => setIsTrackModalOpen(false)} startIcon={<X size={16} />} sx={{ px: 3, py: 1, fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={<CheckCircle2 size={16} />} color="primary" sx={{ px: 3, py: 1, fontWeight: 600, boxShadow: 2, '&:hover': { boxShadow: 3 } }}>Update Progress</Button>
         </DialogActions>
      </Dialog>
    </div>
  );
};

export default PreConstructionModule;
