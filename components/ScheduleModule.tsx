import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Project, ScheduleTask, UserRole, TaskDependency, RFI, ResourceAllocation, Milestone } from '../types';
import { 
    Plus, Edit2, Trash2, Search, LayoutList, 
    BarChartHorizontal, Save, Calendar, ChevronLeft, ChevronRight,
    GripVertical, AlertCircle, Info, ZoomIn, ZoomOut, Maximize,
    FileCheck, Clock, CheckCircle, Layers, Flag
} from 'lucide-react';
import { 
    Chip, FormControl, Select, MenuItem, InputLabel, 
    Box, Button, Divider, Switch, FormControlLabel, Slider, 
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, 
    Typography, Stack, Paper, IconButton, Table, 
    TableHead, TableRow, TableCell, TableBody, LinearProgress, ToggleButtonGroup, ToggleButton,
    Tooltip, useTheme, Avatar, AvatarGroup, Badge,
    List, ListItem, ListItemText, InputAdornment, alpha,
    Tabs, Tab, Alert
} from '@mui/material';
import StatCard from './StatCard';
import { formatCurrency } from '../utils/exportUtils';
import { getCurrencySymbol } from '../utils/currencyUtils';

interface Props {
    project: Project;
    userRole: UserRole;
    onProjectUpdate: (project: Project) => void;
}


const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 70;
const SIDEBAR_WIDTH = 250;

type ZoomLevel = 'MONTH' | 'WEEK' | 'DAY';
type DragType = 'MOVE' | 'RESIZE_START' | 'RESIZE_END' | 'PROGRESS';

const ScheduleModule: React.FC<Props> = ({ project, userRole, onProjectUpdate }) => {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<ScheduleTask>>({});
  const [dependencyTab, setDependencyTab] = useState(0); // 0 for basic, 1 for dependencies, 2 for BOQ linkage, 3 for resources
  const [selectedResource, setSelectedResource] = useState('');
  const [resourceQuantity, setResourceQuantity] = useState<number>(0);
  const [resourceStartDate, setResourceStartDate] = useState('');
  const [resourceEndDate, setResourceEndDate] = useState('');
  const [resourceNotes, setResourceNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'LIST' | 'GANTT' | 'RESOURCES' | 'CAPACITY' | 'MILESTONES'>('GANTT');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('WEEK');
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const [draggingTask, setDraggingTask] = useState<{ id: string, type: DragType, initialX: number, initialValue: any } | null>(null);

  const canEdit = [UserRole.PROJECT_MANAGER, UserRole.ADMIN, UserRole.SITE_ENGINEER].includes(userRole);

  const dayWidth = useMemo(() => {
    switch(zoomLevel) {
        case 'MONTH': return 10;
        case 'WEEK': return 40;
        case 'DAY': return 100;
        default: return 40;
    }
  }, [zoomLevel]);

  const taskRFIMap = useMemo(() => {
      const map: Record<string, RFI[]> = {};
      project.rfis.forEach(rfi => {
          if (rfi.linkedTaskId) {
              if (!map[rfi.linkedTaskId]) map[rfi.linkedTaskId] = [];
              map[rfi.linkedTaskId].push(rfi);
          }
      });
      return map;
  }, [project.rfis]);

  const { startDate, daysCount, dateScale } = useMemo(() => {
    if (project.schedule.length === 0) {
        const start = new Date();
        start.setHours(0,0,0,0);
        return { startDate: start, daysCount: 60, dateScale: [] };
    }
    
    const dates = project.schedule.flatMap(t => [new Date(t.startDate), new Date(t.endDate)]);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    minDate.setHours(0,0,0,0);
    minDate.setDate(minDate.getDate() - 10);
    
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    maxDate.setDate(maxDate.getDate() + 30);
    
    const count = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const scale = [];
    for (let i = 0; i <= count; i++) {
        const date = new Date(minDate);
        date.setDate(minDate.getDate() + i);
        scale.push(date);
    }
    return { startDate: minDate, daysCount: count, dateScale: scale };
  }, [project.schedule]);

  const getXFromDate = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(0,0,0,0);
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays * dayWidth;
  };

  const resolveDependencies = (tasks: ScheduleTask[]): ScheduleTask[] => {
      let updated = [...tasks];
      let changed = true;
      let iterations = 0;
      
      while (changed && iterations < 10) {
          changed = false;
          iterations++;
          updated = updated.map(task => {
              let newStart = new Date(task.startDate);
              let newEnd = new Date(task.endDate);
              let startModified = false;
              let endModified = false;

              task.dependencies.forEach(dep => {
                  const pred = updated.find(t => t.id === dep.taskId);
                  if (!pred) return;

                  const lag = dep.lag || 0;
                  
                  switch(dep.type) {
                      case 'FS': // Finish to Start
                          const predEnd = new Date(pred.endDate);
                          predEnd.setDate(predEnd.getDate() + lag);
                          if (newStart < predEnd) {
                              newStart = new Date(predEnd);
                              newStart.setDate(newStart.getDate() + 1); // Add one day since it's finish to start
                              startModified = true;
                          }
                          break;
                      case 'SS': // Start to Start
                          const predStart = new Date(pred.startDate);
                          predStart.setDate(predStart.getDate() + lag);
                          if (newStart < predStart) {
                              newStart = new Date(predStart);
                              startModified = true;
                          }
                          break;
                      case 'FF': // Finish to Finish
                          const predEndFF = new Date(pred.endDate);
                          predEndFF.setDate(predEndFF.getDate() + lag);
                          if (newEnd < predEndFF) {
                              newEnd = new Date(predEndFF);
                              endModified = true;
                          }
                          break;
                      case 'SF': // Start to Finish
                          const predStartSF = new Date(pred.startDate);
                          predStartSF.setDate(predStartSF.getDate() + lag);
                          if (newEnd < predStartSF) {
                              newEnd = new Date(predStartSF);
                              endModified = true;
                          }
                          break;
                  }
              });

              if (startModified || endModified) {
                  // If only start was modified, keep the same duration
                  if (startModified && !endModified) {
                      const duration = new Date(task.endDate).getTime() - new Date(task.startDate).getTime();
                      newEnd = new Date(newStart.getTime() + duration);
                  } 
                  // If only end was modified and it's now before start, adjust start
                  else if (endModified && !startModified && newEnd < newStart) {
                      const duration = new Date(task.endDate).getTime() - new Date(task.startDate).getTime();
                      newStart = new Date(newEnd.getTime() - duration);
                  }
                  // If both were modified, ensure end is not before start
                  else if (startModified && endModified && newEnd < newStart) {
                      newEnd = new Date(newStart);
                      newEnd.setDate(newEnd.getDate() + 1);
                  }
                  
                  changed = true;
                  return {
                      ...task,
                      startDate: newStart.toISOString().split('T')[0],
                      endDate: newEnd.toISOString().split('T')[0]
                  };
              }
              return task;
          });
      }
      return updated;
  };

  const handleOpenModal = (task?: ScheduleTask) => {
      if (task) setEditingTask({ ...task });
      else setEditingTask({
          name: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          progress: 0,
          status: 'On Track',
          isCritical: false,
          dependencies: [],
          boqItemId: ''
      });
      setIsModalOpen(true);
  };

  const handleSave = () => {
      if (!editingTask.name || !editingTask.startDate || !editingTask.endDate) return;
      let updatedSchedule: ScheduleTask[];
      if (editingTask.id) {
          updatedSchedule = project.schedule.map(t => t.id === editingTask.id ? { ...t, ...editingTask } as ScheduleTask : t);
      } else {
          const newTask: ScheduleTask = {
              id: `task-${Date.now()}`,
              name: editingTask.name!,
              startDate: editingTask.startDate!,
              endDate: editingTask.endDate!,
              progress: Number(editingTask.progress) || 0,
              status: editingTask.status as any || 'On Track',
              dependencies: [],
              isCritical: editingTask.isCritical || false,
              boqItemId: editingTask.boqItemId
          };
          updatedSchedule = [...project.schedule, newTask];
      }
      onProjectUpdate({ ...project, schedule: resolveDependencies(updatedSchedule) });
      setIsModalOpen(false);
      setEditingTask({}); // Reset form
      setDependencyTab(0); // Reset tab
  };

  const handleDeleteTask = (taskId: string) => {
      if (window.confirm('Are you sure you want to delete this task?')) {
          const updatedSchedule = project.schedule.filter(t => t.id !== taskId);
          onProjectUpdate({ ...project, schedule: updatedSchedule });
      }
  };

  const onMouseDown = (e: React.MouseEvent, taskId: string, type: DragType) => {
      if (!canEdit) return;
      e.stopPropagation();
      const task = project.schedule.find(t => t.id === taskId);
      if (!task) return;
      
      setDraggingTask({
          id: taskId,
          type,
          initialX: e.clientX,
          initialValue: { start: task.startDate, end: task.endDate, progress: task.progress }
      });
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
        if (!draggingTask) return;
        
        const deltaX = (e.clientX - draggingTask.initialX);
        const deltaDays = Math.round(deltaX / dayWidth);
        
        const updatedSchedule = project.schedule.map(t => {
            if (t.id === draggingTask.id) {
                if (draggingTask.type === 'MOVE') {
                    const newStart = new Date(draggingTask.initialValue.start);
                    newStart.setDate(newStart.getDate() + deltaDays);
                    const newEnd = new Date(draggingTask.initialValue.end);
                    newEnd.setDate(newEnd.getDate() + deltaDays);
                    return { 
                        ...t, 
                        startDate: newStart.toISOString().split('T')[0], 
                        endDate: newEnd.toISOString().split('T')[0] 
                    };
                } else if (draggingTask.type === 'RESIZE_START') {
                    const newStart = new Date(draggingTask.initialValue.start);
                    newStart.setDate(newStart.getDate() + deltaDays);
                    // Prevent zero or negative duration
                    if (newStart >= new Date(t.endDate)) return t;
                    return { ...t, startDate: newStart.toISOString().split('T')[0] };
                } else if (draggingTask.type === 'RESIZE_END') {
                    const newEnd = new Date(draggingTask.initialValue.end);
                    newEnd.setDate(newEnd.getDate() + deltaDays);
                    if (newEnd <= new Date(t.startDate)) return t;
                    return { ...t, endDate: newEnd.toISOString().split('T')[0] };
                } else if (draggingTask.type === 'PROGRESS') {
                    const taskX = getXFromDate(t.startDate);
                    const taskW = getXFromDate(t.endDate) - taskX;
                    const containerRect = ganttContainerRef.current?.getBoundingClientRect();
                    const mouseXInTask = e.clientX - (containerRect?.left || 0) + (ganttContainerRef.current?.scrollLeft || 0) - SIDEBAR_WIDTH - taskX;
                    const newProgress = Math.min(100, Math.max(0, Math.round((mouseXInTask / taskW) * 100)));
                    return { ...t, progress: newProgress };
                }
            }
            return t;
        });
        
        onProjectUpdate({ ...project, schedule: resolveDependencies(updatedSchedule) });
    };

    const onMouseUp = () => setDraggingTask(null);

    if (draggingTask) {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };
  }, [draggingTask, dayWidth, project.schedule]);

  const filteredTasks = useMemo(() => {
      let tasks = project.schedule;
      if (searchQuery) tasks = tasks.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return [...tasks].sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [project.schedule, searchQuery]);

  const canvasHeight = useMemo(() => {
      return (filteredTasks.length + (canEdit ? 1 : 0)) * ROW_HEIGHT;
  }, [filteredTasks.length, canEdit]);

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" mb={3} alignItems="flex-start">
            <Box>
                <Typography variant="h5" fontWeight="900">Project Schedule</Typography>
                <Typography variant="body2" color="text.secondary">Interactive Gantt timeline with dependency resolution</Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpenModal()}>Add Activity</Button>
            </Stack>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total Activities" value={project.schedule.length} icon={LayoutList} color={theme.palette.primary.main} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Completed" value={project.schedule.filter(t => t.status === 'Completed').length} icon={CheckCircle} color={theme.palette.success.main} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Delayed" value={project.schedule.filter(t => t.status === 'Delayed').length} icon={AlertCircle} color={theme.palette.error.main} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="On Track" value={project.schedule.filter(t => t.status === 'On Track').length} icon={Clock} color={theme.palette.warning.main} />
            </Grid>
        </Grid>
        
        <Paper variant="outlined" sx={{ mb: 2, p: 1, display: 'flex', gap: 2, alignItems: 'center', borderRadius: 3, bgcolor: 'background.paper' }}>
            <TextField 
                size="small" placeholder="Filter tasks..." 
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} 
                sx={{ width: 250, '.MuiOutlinedInput-root': { borderRadius: 2 } }} 
                InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
            />
            <Divider orientation="vertical" flexItem />
            <Stack direction="row" spacing={2} alignItems="center">
                <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}>
                    <ToggleButton value="GANTT" sx={{ px: 2, borderRadius: 2 }}><BarChartHorizontal size={18} /> </ToggleButton>
                    <ToggleButton value="LIST" sx={{ px: 2, borderRadius: 2 }}><LayoutList size={18} /></ToggleButton>
                    <ToggleButton value="RESOURCES" sx={{ px: 2, borderRadius: 2 }}><FileCheck size={18} /></ToggleButton>
                    <ToggleButton value="CAPACITY" sx={{ px: 2, borderRadius: 2 }}><Layers size={18} /></ToggleButton>
                    <ToggleButton value="MILESTONES" sx={{ px: 2, borderRadius: 2 }}><Flag size={18} /></ToggleButton>
                </ToggleButtonGroup>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                   <Tooltip title="Month View"><span><IconButton size="small" onClick={() => setZoomLevel('MONTH')} color={zoomLevel === 'MONTH' ? 'primary' : 'default'}><ZoomOut size={16}/></IconButton></span></Tooltip>
                   <Tooltip title="Week View"><span><IconButton size="small" onClick={() => setZoomLevel('WEEK')} color={zoomLevel === 'WEEK' ? 'primary' : 'default'}><Maximize size={16}/></IconButton></span></Tooltip>
                   <Tooltip title="Day View"><span><IconButton size="small" onClick={() => setZoomLevel('DAY')} color={zoomLevel === 'DAY' ? 'primary' : 'default'}><ZoomIn size={16}/></IconButton></span></Tooltip>
                </Box>
            </Stack>
            <Box sx={{ flexGrow: 1 }} />
            <Box display="flex" alignItems="center" gap={1} sx={{ px:1, borderRadius: 1, bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}><AlertCircle size={14}/><Typography variant="caption" fontWeight="bold">Critical Path</Typography></Box>
        </Paper>

        {viewMode === 'LIST' ? (
            <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', flex: 1, bgcolor: 'background.paper' }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Activity Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Schedule Range</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Inspections</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Progress</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTasks.map(task => {
                            const rfis = taskRFIMap[task.id] || [];
                            return (
                                <TableRow key={task.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                                    <TableCell><Box display="flex" alignItems="center" gap={1.5}>{task.isCritical && <AlertCircle size={14} color={theme.palette.error.main}/>}<Typography variant="body2" fontWeight="bold">{task.name}</Typography>{task.boqItemId && <Chip label={`BOQ: ${project.boq.find(b => b.id === task.boqItemId)?.itemNo || 'N/A'}`} size="small" variant="outlined" sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} />}</Box></TableCell>
                                    <TableCell><Box display="flex" alignItems="center" gap={1} color="text.secondary"><Calendar size={12}/><Typography variant="caption" fontWeight="medium">{task.startDate} — {task.endDate}</Typography></Box></TableCell>
                                    <TableCell>{rfis.length > 0 ? <Tooltip title={`${rfis.length} Linked Inspection Requests`}><div><Chip icon={<FileCheck size={12}/>} label={rfis.length} size="small" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, fontWeight: 'bold', fontSize: 10 }}/></div></Tooltip> : <Typography variant="caption" color="text.disabled">—</Typography>}</TableCell>
                                    <TableCell sx={{ width: 150 }}><Box display="flex" alignItems="center" gap={1.5}><LinearProgress variant="determinate" value={task.progress} sx={{ flex: 1, height: 6, borderRadius: 3 }} color={task.progress === 100 ? "success" : "primary"} /><Typography variant="caption" fontWeight="bold">{task.progress}%</Typography></Box></TableCell>
                                    <TableCell><Chip label={task.status} size="small" variant="outlined" color={task.status === 'Completed' ? "success" : task.status === 'Delayed' ? "error" : "primary"} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} /></TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleOpenModal(task)}><Edit2 size={16}/></IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDeleteTask(task.id)}><Trash2 size={16}/></IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        ) : viewMode === 'RESOURCES' ? (
            <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', flex: 1, bgcolor: 'background.paper' }}>
                <Box p={2} borderBottom="1px solid" borderColor="divider" bgcolor="action.hover">
                    <Typography variant="h6" fontWeight="bold">Resource Allocation Overview</Typography>
                </Box>
                <Box p={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Resource Allocation by Task</Typography>
                            <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto', borderRadius: 3 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Task</TableCell>
                                            <TableCell>Resource</TableCell>
                                            <TableCell>Quantity</TableCell>
                                            <TableCell>Period</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(project.resourceAllocations || []).map(alloc => {
                                            const task = project.schedule.find(t => t.id === alloc.allocatedTo);
                                            const resource = (project.resources || []).find(r => r.id === alloc.resourceId);
                                            return (
                                                <TableRow key={alloc.id}>
                                                    <TableCell>{task?.name || 'Unknown Task'}</TableCell>
                                                    <TableCell>{resource?.name || 'Unknown Resource'}</TableCell>
                                                    <TableCell>{alloc.allocatedQuantity} {resource?.unit || ''}</TableCell>
                                                    <TableCell>{alloc.startDate} to {alloc.endDate}</TableCell>
                                                    <TableCell><Chip label={alloc.status} size="small" color={alloc.status === 'Completed' ? 'success' : alloc.status === 'In Progress' ? 'info' : 'default'} /></TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                                {(project.resourceAllocations || []).length === 0 && (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                                        No resource allocations found
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Resource Availability</Typography>
                            <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto', borderRadius: 3 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Resource</TableCell>
                                            <TableCell>Available</TableCell>
                                            <TableCell>Allocated</TableCell>
                                            <TableCell>Total</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(project.resources || []).map(resource => {
                                            const allocated = (project.resourceAllocations || [])
                                                .filter(alloc => alloc.resourceId === resource.id)
                                                .reduce((sum, alloc) => sum + alloc.allocatedQuantity, 0);
                                            const available = resource.totalQuantity - allocated;
                                            return (
                                                <TableRow key={resource.id}>
                                                    <TableCell>{resource.name}</TableCell>
                                                    <TableCell>{available} {resource.unit}</TableCell>
                                                    <TableCell>{allocated} {resource.unit}</TableCell>
                                                    <TableCell>{resource.totalQuantity} {resource.unit}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={resource.status} 
                                                            size="small" 
                                                            color={resource.status === 'Available' ? 'success' : resource.status === 'Allocated' ? 'info' : 'warning'} 
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                                {(project.resources || []).length === 0 && (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                                        No resources defined
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        ) : viewMode === 'CAPACITY' ? (
            <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', flex: 1, bgcolor: 'background.paper' }}>
                <Box p={2} borderBottom="1px solid" borderColor="divider" bgcolor="action.hover">
                    <Typography variant="h6" fontWeight="bold">Capacity Management</Typography>
                </Box>
                <Box p={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Resource Capacity Utilization</Typography>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Resource</TableCell>
                                            <TableCell>Capacity</TableCell>
                                            <TableCell>Utilized</TableCell>
                                            <TableCell>Available</TableCell>
                                            <TableCell>Utilization %</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(project.resources || []).map(resource => {
                                            const allocated = (project.resourceAllocations || [])
                                                .filter(alloc => alloc.resourceId === resource.id)
                                                .reduce((sum, alloc) => sum + alloc.allocatedQuantity, 0);
                                            const available = resource.totalQuantity - allocated;
                                            const utilization = resource.totalQuantity > 0 ? Math.round((allocated / resource.totalQuantity) * 100) : 0;
                                            return (
                                                <TableRow key={resource.id}>
                                                    <TableCell>{resource.name}</TableCell>
                                                    <TableCell>{resource.totalQuantity} {resource.unit}</TableCell>
                                                    <TableCell>{allocated} {resource.unit}</TableCell>
                                                    <TableCell>{available} {resource.unit}</TableCell>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Box flex={1}>
                                                                <LinearProgress 
                                                                    variant="determinate" 
                                                                    value={utilization} 
                                                                    color={utilization > 90 ? 'error' : utilization > 75 ? 'warning' : 'success'}
                                                                    sx={{ height: 8, borderRadius: 4 }}
                                                                />
                                                            </Box>
                                                            <Typography variant="caption" fontWeight="bold">{utilization}%</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={utilization > 90 ? 'Over Utilized' : utilization > 75 ? 'High Utilization' : utilization > 50 ? 'Normal' : 'Under Utilized'} 
                                                            size="small" 
                                                            color={utilization > 90 ? 'error' : utilization > 75 ? 'warning' : utilization > 50 ? 'info' : 'success'} 
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                                {(project.resources || []).length === 0 && (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                                        No resources defined
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Capacity Planning by Period</Typography>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                                <Typography variant="body2" color="text.secondary" mb={2}>Visualize resource capacity over time</Typography>
                                <Box height={300} display="flex" alignItems="center" justifyContent="center" border="1px dashed" borderColor="divider" borderRadius={2}>
                                    <Typography variant="h6" color="text.secondary">Capacity planning chart will be displayed here</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        ) : viewMode === 'MILESTONES' ? (
            <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', flex: 1, bgcolor: 'background.paper' }}>
                <Box p={2} borderBottom="1px solid" borderColor="divider" bgcolor="action.hover">
                    <Typography variant="h6" fontWeight="bold">Milestone Tracking</Typography>
                </Box>
                <Box p={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" fontWeight="bold">Project Milestones</Typography>
                                <Button 
                                    variant="contained" 
                                    startIcon={<Plus size={16} />} 
                                    onClick={() => {
                                        // Add new milestone functionality
                                        const newMilestone: Milestone = {
                                            id: `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                            name: 'New Milestone',
                                            description: 'Milestone description',
                                            date: new Date().toISOString().split('T')[0],
                                            status: 'Planned',
                                            priority: 'Medium',
                                            notes: 'Add details'
                                        };
                                        
                                        const updatedMilestones = [...(project.milestones || []), newMilestone];
                                        onProjectUpdate({
                                            ...project,
                                            milestones: updatedMilestones
                                        });
                                    }}
                                >
                                    Add Milestone
                                </Button>
                            </Box>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Scheduled Date</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Priority</TableCell>
                                            <TableCell>Progress</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(project.milestones || []).map(milestone => {
                                            const isOverdue = new Date(milestone.date) < new Date() && milestone.status !== 'Completed';
                                            const isUpcoming = new Date(milestone.date) > new Date() && milestone.status === 'Planned';
                                            const isCompleted = milestone.status === 'Completed';
                                            
                                            return (
                                                <TableRow key={milestone.id}>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Flag size={16} color={isCompleted ? '#10b981' : isOverdue ? '#ef4444' : '#f59e0b'} />
                                                            <Typography fontWeight="bold">{milestone.name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{milestone.description}</TableCell>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Calendar size={14} />
                                                            <Typography>{milestone.date}</Typography>
                                                            {isOverdue && <AlertCircle size={14} color="#ef4444" />}
                                                            {isUpcoming && <Info size={14} color="#f59e0b" />}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={milestone.status} 
                                                            size="small" 
                                                            color={milestone.status === 'Completed' ? 'success' : milestone.status === 'Missed' ? 'error' : 'info'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={milestone.priority} 
                                                            size="small" 
                                                            color={milestone.priority === 'Critical' ? 'error' : milestone.priority === 'High' ? 'warning' : 'default'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <LinearProgress 
                                                            variant="determinate" 
                                                            value={milestone.status === 'Completed' ? 100 : milestone.status === 'In Progress' ? 50 : 0}
                                                            color={milestone.status === 'Completed' ? 'success' : 'primary'}
                                                            sx={{ height: 6, borderRadius: 3, width: 100 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton size="small" onClick={() => {
                                                            // Edit milestone functionality
                                                            const updatedStatus = milestone.status === 'Completed' ? 'In Progress' : 'Completed';
                                                            const updatedMilestones = (project.milestones || []).map(m => 
                                                                m.id === milestone.id 
                                                                    ? { ...m, status: updatedStatus as 'Planned' | 'In Progress' | 'Completed' | 'Missed', completedDate: updatedStatus === 'Completed' ? new Date().toISOString().split('T')[0] : m.completedDate } 
                                                                    : m
                                                            );
                                                            onProjectUpdate({
                                                                ...project,
                                                                milestones: updatedMilestones
                                                            });
                                                        }}>
                                                            {milestone.status === 'Completed' ? <CheckCircle size={16} color="#10b981" /> : <Edit2 size={16} />}
                                                        </IconButton>
                                                        <IconButton size="small" color="error" onClick={() => {
                                                            // Delete milestone functionality
                                                            if (window.confirm('Are you sure you want to delete this milestone?')) {
                                                                const updatedMilestones = (project.milestones || []).filter(m => m.id !== milestone.id);
                                                                onProjectUpdate({
                                                                    ...project,
                                                                    milestones: updatedMilestones
                                                                });
                                                            }
                                                        }}>
                                                            <Trash2 size={16} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                                {(project.milestones || []).length === 0 && (
                                    <Box textAlign="center" py={4}>
                                        <Flag size={48} color="#d1d5db" />
                                        <Typography variant="h6" color="text.secondary" mt={2}>No Milestones Defined</Typography>
                                        <Typography variant="body2" color="text.secondary" mt={1}>Add milestones to track important project events and achievements</Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        ) : (
            <Box ref={ganttContainerRef} sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 4, border: '1px solid', borderColor: 'divider', position: 'relative', userSelect: draggingTask ? 'none' : 'auto' }}>
                <Box sx={{ position: 'sticky', left: 0, width: SIDEBAR_WIDTH, zIndex: 10, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ height: HEADER_HEIGHT, display: 'flex', alignItems: 'center', px: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}><Typography variant="caption" fontWeight="900" color="text.secondary">TASK NAME</Typography></Box>
                    {filteredTasks.map((task, i) => (
                        <Box key={task.id} sx={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', px: 2, borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }} onClick={() => handleOpenModal(task)}>
                            <Box display="flex" alignItems="center" gap={1} sx={{ overflow: 'hidden' }}><Typography variant="caption" sx={{ minWidth: 20, color: 'text.disabled', fontWeight: 'bold' }}>{i + 1}</Typography><Typography variant="caption" fontWeight="bold" noWrap sx={{ color: task.isCritical ? 'error.main' : 'text.primary', flex: 1 }}>{task.name}</Typography>{taskRFIMap[task.id] && <Tooltip title={`${taskRFIMap[task.id].length} Linked RFIs`}><div><FileCheck size={12} color={theme.palette.warning.main} className="shrink-0" /></div></Tooltip>}</Box>
                        </Box>
                    ))}
                    {canEdit && (
                        <Box 
                            sx={{ 
                                height: ROW_HEIGHT, 
                                display: 'flex', 
                                alignItems: 'center', 
                                px: 2, 
                                borderBottom: '1px solid', 
                                borderColor: 'divider', 
                                cursor: 'pointer',
                                color: 'primary.main',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                            }} 
                            onClick={() => handleOpenModal()}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                <Plus size={16} strokeWidth={3} />
                                <Typography variant="caption" fontWeight="800" sx={{ letterSpacing: '0.05em' }}>NEW ACTIVITY</Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
                <Box sx={{ position: 'absolute', top: 0, left: SIDEBAR_WIDTH, width: daysCount * dayWidth, minHeight: '100%' }}>
                    <Box sx={{ height: HEADER_HEIGHT, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, zIndex: 5 }}>
                        <svg width={daysCount * dayWidth} height={HEADER_HEIGHT}>
                            {dateScale.map((date, i) => {
                                const isFirstOfMonth = date.getDate() === 1;
                                const x = i * dayWidth;
                                return (
                                    <g key={i}>
                                        <line x1={x} y1={0} x2={x} y2={HEADER_HEIGHT + canvasHeight} stroke={theme.palette.divider} strokeWidth={1} />
                                        {dayWidth > 20 && <text x={x + (dayWidth/2)} y={55} textAnchor="middle" fontSize="10" fontWeight="bold" fill={theme.palette.text.secondary}>{date.getDate()}</text>}
                                        {(isFirstOfMonth || (i === 0)) && <text x={x + 5} y={25} fontWeight="900" fontSize="11" fill={theme.palette.text.secondary}>{date.toLocaleString('default', { month: 'short' }).toUpperCase()} {date.getFullYear()}</text>}
                                    </g>
                                );
                            })}
                        </svg>
                    </Box>
                    <Box sx={{ position: 'relative' }}>
                        <svg width={daysCount * dayWidth} height={canvasHeight} style={{ overflow: 'visible' }}>
                            <defs>
                                <pattern id="progress-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
                                    <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke={theme.palette.primary.dark} strokeWidth="2"/>
                                </pattern>
                            </defs>
                            <line x1={getXFromDate(new Date().toISOString().split('T')[0])} y1={0} x2={getXFromDate(new Date().toISOString().split('T')[0])} y2={canvasHeight} stroke={theme.palette.error.main} strokeWidth={1} strokeDasharray="4 2" />
                            {filteredTasks.map((task, i) => {
                                const x = getXFromDate(task.startDate);
                                const width = Math.max(dayWidth, getXFromDate(task.endDate) - x + dayWidth);
                                const y = i * ROW_HEIGHT + (ROW_HEIGHT / 2.5);
                                const h = ROW_HEIGHT / 2;
                                const barColor = task.isCritical ? theme.palette.error.main : theme.palette.primary.main;
                                const barLight = task.isCritical ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.primary.main, 0.2);
                                const rfiCount = taskRFIMap[task.id]?.length || 0;
                                return (
                                    <g key={task.id} className="gantt-bar-group" style={{ cursor: canEdit ? 'grab' : 'default' }} onMouseDown={(e) => onMouseDown(e, task.id, 'MOVE')}>
                                        <line x1={0} y1={(i+1)*ROW_HEIGHT} x2={daysCount*dayWidth} y2={(i+1)*ROW_HEIGHT} stroke={theme.palette.divider} strokeWidth={1} />
                                        <rect x={x} y={y} width={width} height={h} rx={6} fill={barLight} />
                                        <rect x={x} y={y} width={(width * task.progress) / 100} height={h} rx={6} fill={barColor} />
                                        
                                        <rect x={x} y={y} width={width} height={h} rx={6} fill={`url(#progress-pattern)`} opacity={0.1} style={{ pointerEvents: 'none' }}/ >

                                        <rect x={x} y={y} width={10} height={h} fill="transparent" style={{ cursor: 'col-resize' }} onMouseDown={(e) => onMouseDown(e, task.id, 'RESIZE_START')} />
                                        <rect x={x + width - 10} y={y} width={10} height={h} fill="transparent" style={{ cursor: 'col-resize' }} onMouseDown={(e) => onMouseDown(e, task.id, 'RESIZE_END')} />
                                        
                                        {rfiCount > 0 && zoomLevel !== 'MONTH' && <g transform={`translate(${x + 4}, ${y + (h / 2) - 6})`}><rect width="12" height="12" rx="2" fill={theme.palette.warning.main} /><text x="6" y="9" textAnchor="middle" fontSize="8" fontWeight="black" fill="white">{rfiCount}</text></g>}
                                        
                                        {zoomLevel !== 'MONTH' && (
                                            <foreignObject x={x + width + 8} y={y-2} width={100} height={ROW_HEIGHT}>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                                                  <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.7rem' } }}>
                                                      <Avatar alt="User 1" src="/path/to/u1.png" />
                                                      <Avatar alt="User 2" src="/path/to/u2.png" />
                                                  </AvatarGroup>
                                                  <Typography variant="caption" fontWeight="bold" color="text.secondary">{task.progress}%</Typography>
                                                </Stack>
                                            </foreignObject>
                                        )}
                                    </g>
                                );
                            })}
                            {canEdit && <line x1={0} y1={canvasHeight} x2={daysCount*dayWidth} y2={canvasHeight} stroke={theme.palette.divider} strokeWidth={1} />}
                        </svg>
                    </Box>
                </Box>
            </Box>
        )}

        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ fontWeight: 'bold' }}>{editingTask.id ? 'Edit Activity' : 'New Activity'}</DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Tabs value={dependencyTab} onChange={(_, v) => setDependencyTab(v)} sx={{ mb: 3 }}>
                    <Tab label="Basic" />
                    <Tab label="Dependencies" />
                    <Tab label="BOQ Linkage" />
                    <Tab label="Resources" />
                </Tabs>
                
                {dependencyTab === 0 && (
                    <Stack spacing={3}>
                        <TextField label="Name" fullWidth value={editingTask.name || ''} onChange={e => setEditingTask({...editingTask, name: e.target.value})} size="small" />
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={editingTask.startDate || ''} onChange={e => setEditingTask({...editingTask, startDate: e.target.value})} size="small" /></Grid>
                            <Grid item xs={6}><TextField label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={editingTask.endDate || ''} onChange={e => setEditingTask({...editingTask, endDate: e.target.value})} size="small" /></Grid>
                        </Grid>
                        <Box><Typography variant="caption" fontWeight="bold">Progress ({editingTask.progress || 0}%)</Typography><Slider value={editingTask.progress || 0} onChange={(_, v) => setEditingTask({...editingTask, progress: v as number})} valueLabelDisplay="auto" /></Box>
                        <FormControlLabel control={<Switch checked={editingTask.isCritical || false} onChange={e => setEditingTask({...editingTask, isCritical: e.target.checked})} />} label="Critical Path" />
                        <FormControl fullWidth size="small"><InputLabel>Status</InputLabel><Select value={editingTask.status || 'On Track'} label="Status" onChange={e => setEditingTask({...editingTask, status: e.target.value as any})}><MenuItem value="Not Started">Not Started</MenuItem><MenuItem value="On Track">On Track</MenuItem><MenuItem value="Delayed">Delayed</MenuItem><MenuItem value="Completed">Completed</MenuItem></Select></FormControl>
                    </Stack>
                )}
                
                {dependencyTab === 1 && (
                    <Stack spacing={3}>
                        <Typography variant="h6" fontWeight="bold">Task Dependencies</Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>Define predecessor relationships with other tasks</Typography>
                        
                        {(editingTask.dependencies || []).map((dep, index) => {
                            const predecessorTask = project.schedule.find(t => t.id === dep.taskId);
                            return (
                                <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="subtitle2" fontWeight="bold">Dependency {index + 1}</Typography>
                                        <IconButton size="small" color="error" onClick={() => {
                                            const updatedDeps = [...(editingTask.dependencies || [])];
                                            updatedDeps.splice(index, 1);
                                            setEditingTask({...editingTask, dependencies: updatedDeps});
                                        }}>
                                            <Trash2 size={16} />
                                        </IconButton>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Predecessor Task</InputLabel>
                                                <Select 
                                                    value={dep.taskId || ''}
                                                    label="Predecessor Task"
                                                    onChange={(e) => {
                                                        const updatedDeps = [...(editingTask.dependencies || [])];
                                                        updatedDeps[index] = { ...updatedDeps[index], taskId: e.target.value };
                                                        setEditingTask({...editingTask, dependencies: updatedDeps});
                                                    }}
                                                >
                                                    {project.schedule.filter(t => t.id !== editingTask.id).map(task => (
                                                        <MenuItem key={task.id} value={task.id}>{task.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Type</InputLabel>
                                                <Select 
                                                    value={dep.type || 'FS'}
                                                    label="Type"
                                                    onChange={(e) => {
                                                        const updatedDeps = [...(editingTask.dependencies || [])];
                                                        updatedDeps[index] = { ...updatedDeps[index], type: e.target.value as any };
                                                        setEditingTask({...editingTask, dependencies: updatedDeps});
                                                    }}
                                                >
                                                    <MenuItem value="FS">Finish to Start (FS)</MenuItem>
                                                    <MenuItem value="SS">Start to Start (SS)</MenuItem>
                                                    <MenuItem value="FF">Finish to Finish (FF)</MenuItem>
                                                    <MenuItem value="SF">Start to Finish (SF)</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField 
                                                label="Lag (days)" 
                                                type="number" 
                                                fullWidth 
                                                size="small" 
                                                value={dep.lag || 0}
                                                onChange={(e) => {
                                                    const updatedDeps = [...(editingTask.dependencies || [])];
                                                    updatedDeps[index] = { ...updatedDeps[index], lag: Number(e.target.value) };
                                                    setEditingTask({...editingTask, dependencies: updatedDeps});
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                    {predecessorTask && (
                                        <Typography variant="caption" color="text.secondary" mt={1}>
                                            Links: {predecessorTask.name} → {editingTask.name}
                                        </Typography>
                                    )}
                                </Paper>
                            );
                        })}
                        
                        <Button 
                            variant="outlined" 
                            startIcon={<Plus size={16} />} 
                            onClick={() => {
                                const newDep: TaskDependency = { taskId: '', type: 'FS', lag: 0 };
                                setEditingTask({
                                    ...editingTask, 
                                    dependencies: [...(editingTask.dependencies || []), newDep]
                                });
                            }}
                        >
                            Add Dependency
                        </Button>
                        
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2" fontWeight="bold">Dependency Types:</Typography>
                            <List dense sx={{ pl: 2 }}>
                                <ListItem disablePadding><ListItemText primary="FS (Finish to Start): Current task starts after predecessor finishes" /></ListItem>
                                <ListItem disablePadding><ListItemText primary="SS (Start to Start): Current task starts after predecessor starts" /></ListItem>
                                <ListItem disablePadding><ListItemText primary="FF (Finish to Finish): Current task finishes after predecessor finishes" /></ListItem>
                                <ListItem disablePadding><ListItemText primary="SF (Start to Finish): Current task finishes after predecessor starts" /></ListItem>
                            </List>
                        </Alert>
                    </Stack>
                )}
                
                {dependencyTab === 2 && (
                    <Stack spacing={3}>
                        <Typography variant="h6" fontWeight="bold">BOQ Item Linkage</Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>Link this activity to Bill of Quantities items</Typography>
                        
                        <FormControl fullWidth size="small">
                            <InputLabel>Linked BOQ Item</InputLabel>
                            <Select 
                                value={editingTask.boqItemId || ''}
                                label="Linked BOQ Item"
                                onChange={(e) => setEditingTask({...editingTask, boqItemId: e.target.value as string})}
                            >
                                <MenuItem value=""><em>No BOQ Item</em></MenuItem>
                                {project.boq.map(item => (
                                    <MenuItem key={item.id} value={item.id}>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">[{item.itemNo}] {item.description.substring(0, 50)}{item.description.length > 50 ? '...' : ''}</Typography>
                                            <Typography variant="caption" color="text.secondary">Rate: {formatCurrency(item.rate || 0, project.settings)} per {item.unit}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        {editingTask.boqItemId && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="body2">This activity is linked to BOQ item: 
                                    {project.boq.find(b => b.id === editingTask.boqItemId)?.itemNo} - 
                                    {project.boq.find(b => b.id === editingTask.boqItemId)?.description.substring(0, 60)}...
                                </Typography>
                            </Alert>
                        )}
                    </Stack>
                )}
                
                {dependencyTab === 3 && (
                    <Stack spacing={3}>
                        <Typography variant="h6" fontWeight="bold">Resource Allocation</Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>Allocate resources to this activity</Typography>
                        
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>Assigned Resources</Typography>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                                <Stack spacing={2}>
                                    {(project.resourceAllocations || [])
                                        .filter(alloc => alloc.allocatedTo === editingTask.id)
                                        .map(alloc => {
                                            const resource = (project.resources || []).find(r => r.id === alloc.resourceId);
                                            return (
                                                <Box key={alloc.id} display="flex" justifyContent="space-between" alignItems="center" p={1} border="1px solid" borderColor="divider" borderRadius={2}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">{resource?.name || 'Unknown Resource'}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Quantity: {alloc.allocatedQuantity} {resource?.unit} | Period: {alloc.startDate} to {alloc.endDate}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton 
                                                        size="small" 
                                                        color="error"
                                                        onClick={() => {
                                                            const updatedAllocations = (project.resourceAllocations || []).filter(a => a.id !== alloc.id);
                                                            onProjectUpdate({ 
                                                                ...project, 
                                                                resourceAllocations: updatedAllocations 
                                                            });
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </Box>
                                            );
                                        })
                                    }
                                    
                                    {(project.resourceAllocations || []).filter(alloc => alloc.allocatedTo === editingTask.id).length === 0 && (
                                        <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                            No resources allocated to this task
                                        </Typography>
                                    )}
                                </Stack>
                            </Paper>
                        </Box>
                        
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>Add New Resource</Typography>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Resource</InputLabel>
                                            <Select 
                                                value={selectedResource}
                                                label="Resource"
                                                onChange={(e) => setSelectedResource(e.target.value as string)}
                                            >
                                                {(project.resources || []).filter(r => r.availableQuantity > 0).map(resource => (
                                                    <MenuItem key={resource.id} value={resource.id}>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">{resource.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Available: {resource.availableQuantity} {resource.unit} | Cost: {getCurrencySymbol(project.settings?.currency || 'USD')} {resource.unitCost?.toLocaleString()}/{resource.unit}
                                                            </Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField 
                                            label="Quantity" 
                                            type="number" 
                                            fullWidth 
                                            size="small" 
                                            value={resourceQuantity}
                                            onChange={(e) => setResourceQuantity(Number(e.target.value))}
                                            inputProps={{ min: 0 }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField 
                                            label="Start Date" 
                                            type="date" 
                                            fullWidth 
                                            InputLabelProps={{ shrink: true }} 
                                            value={resourceStartDate}
                                            onChange={(e) => setResourceStartDate(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField 
                                            label="End Date" 
                                            type="date" 
                                            fullWidth 
                                            InputLabelProps={{ shrink: true }} 
                                            value={resourceEndDate}
                                            onChange={(e) => setResourceEndDate(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField 
                                            label="Notes" 
                                            fullWidth 
                                            size="small" 
                                            value={resourceNotes}
                                            onChange={(e) => setResourceNotes(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                                
                                <Button 
                                    variant="contained" 
                                    startIcon={<Plus size={16} />} 
                                    sx={{ mt: 2 }}
                                    disabled={!selectedResource || resourceQuantity <= 0 || !resourceStartDate || !resourceEndDate}
                                    onClick={() => {
                                        if (editingTask.id) {
                                            const newAllocation: ResourceAllocation = {
                                                id: `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                                resourceId: selectedResource,
                                                resourceType: (project.resources || []).find(r => r.id === selectedResource)?.type || 'Material',
                                                allocatedTo: editingTask.id!, // Use the task ID
                                                allocatedQuantity: resourceQuantity,
                                                startDate: resourceStartDate,
                                                endDate: resourceEndDate,
                                                status: 'Planned',
                                                notes: resourceNotes
                                            };
                                            
                                            const updatedAllocations = [...(project.resourceAllocations || []), newAllocation];
                                            onProjectUpdate({ 
                                                ...project, 
                                                resourceAllocations: updatedAllocations 
                                            });
                                            
                                            // Reset form
                                            setSelectedResource('');
                                            setResourceQuantity(0);
                                            setResourceStartDate('');
                                            setResourceEndDate('');
                                            setResourceNotes('');
                                        }
                                    }}
                                >
                                    Allocate Resource
                                </Button>
                            </Paper>
                        </Box>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => {setIsModalOpen(false); setEditingTask({}); setDependencyTab(0);}}>Cancel</Button>
                <Button variant="contained" onClick={handleSave} startIcon={<Save size={18}/>}>Save Activity</Button>
            </DialogActions>
        </Dialog>
    </Box>
  );
};

export default ScheduleModule;