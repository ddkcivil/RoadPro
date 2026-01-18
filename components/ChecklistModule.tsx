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
import { Project, Checklist, ChecklistItem, UserRole } from '../types';
import { 
    Plus, Eye, Edit2, History, X, ShieldCheck, FileText, Printer, 
    Clock, Lock, CheckCircle2, XCircle, FileSearch, CalendarPlus, 
    Link as LinkIcon, ExternalLink, Calendar, MapPin, BarChart2,
    MessageSquare, User as UserIcon, Circle, Filter, CheckCircle, Trash2,
    ChevronDown, Copy
} from 'lucide-react';
import StatCard from './StatCard';

interface Props {
  project: Project;
  userRole: UserRole;
  onProjectUpdate: (project: Project) => void;
}

const ChecklistModule: React.FC<Props> = ({ project, userRole, onProjectUpdate }) => {
    const [viewMode, setViewMode] = useState<'LIST' | 'TEMPLATE_LIST' | 'TEMPLATE_EDIT' | 'INSTANCE_CREATE' | 'INSTANCE_EDIT'>('LIST');
    const [templateData, setTemplateData] = useState<Partial<Checklist>>({});
    const [instanceData, setInstanceData] = useState<any>({});
    const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Sample checklist templates based on the requirements
    const checklistTemplates = [
        {
            id: 'setting-out',
            name: 'Setting out, site clearance and foundation excavation',
            category: 'Quality',
            description: 'Checklist for setting out, site clearance and foundation excavation activities'
        },
        {
            id: 'level-transfer',
            name: 'Level transfer',
            category: 'Quality',
            description: 'Checklist for level transfer activities'
        },
        {
            id: 'stone-soling',
            name: 'Stone soling work',
            category: 'Quality',
            description: 'Checklist for stone soling work'
        },
        {
            id: 'pcc-box-culvert',
            name: 'PCC work (Box culvert)',
            category: 'Quality',
            description: 'Checklist for Plain Cement Concrete work in box culverts'
        },
        {
            id: 'concreting',
            name: 'Concreting',
            category: 'Quality',
            description: 'Checklist for concreting activities'
        },
        {
            id: 'formwork',
            name: 'Formwork',
            category: 'Quality',
            description: 'Checklist for formwork activities'
        },
        {
            id: 'reinforcement',
            name: 'Reinforcement (Box culvert)',
            category: 'Quality',
            description: 'Checklist for reinforcement work in box culverts'
        },
        {
            id: 'embankment-filling',
            name: 'Embankment filling work',
            category: 'Quality',
            description: 'Checklist for embankment filling activities'
        }
    ];

    // Get project checklists
    const projectChecklists = project.checklists || [];

    // Handle creating a new checklist template
    const handleCreateTemplate = () => {
        setTemplateData({
            name: '',
            category: 'Quality',
            description: '',
            items: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        setViewMode('TEMPLATE_EDIT');
    };

    // Handle editing a checklist template
    const handleEditTemplate = (template: Checklist) => {
        setTemplateData(template);
        setViewMode('TEMPLATE_EDIT');
    };

    // Handle saving a checklist template
    const handleSaveTemplate = () => {
        if (!templateData.name) return;

        const checklistToSave: Checklist = {
            id: templateData.id || `cl-${Date.now()}`,
            name: templateData.name,
            category: templateData.category || 'Quality',
            description: templateData.description || '',
            items: templateData.items || [],
            createdAt: templateData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: templateData.isActive !== undefined ? templateData.isActive : true,
            assignedTo: templateData.assignedTo,
            applicableTo: templateData.applicableTo
        };

        const updatedChecklists = project.checklists 
            ? [...project.checklists.filter(c => c.id !== checklistToSave.id), checklistToSave]
            : [checklistToSave];

        onProjectUpdate({ ...project, checklists: updatedChecklists });
        setViewMode('TEMPLATE_LIST');
        setTemplateData({});
    };

    // Handle creating a new checklist instance from a template
    const handleCreateInstance = (templateId: string) => {
        const template = [...(project.checklists || []), ...checklistTemplates].find(t => 
            typeof t === 'string' ? false : t.id === templateId
        ) as Checklist;
        
        if (template) {
            setInstanceData({
                templateId: template.id,
                name: template.name,
                items: template.items.map(item => ({...item, response: null, remarks: ''})),
                location: '',
                date: new Date().toISOString().split('T')[0],
                status: 'Draft',
                completedBy: userRole,
                contractorSignature: '',
                engineerSignature: ''
            });
            setViewMode('INSTANCE_CREATE');
        }
    };

    // Handle editing a checklist instance
    const handleEditInstance = (checklist: Checklist) => {
        setSelectedChecklist(checklist);
        setInstanceData({
            ...checklist,
            items: checklist.items.map(item => ({...item, response: null, remarks: ''}))
        });
        setViewMode('INSTANCE_EDIT');
    };

    // Handle saving a checklist instance
    const handleSaveInstance = () => {
        // Implementation for saving checklist instance
        setViewMode('LIST');
    };

    // Handle deleting a checklist
    const handleDelete = (checklistId: string) => {
        if (window.confirm('Are you sure you want to delete this checklist?')) {
            const updatedChecklists = project.checklists?.filter(c => c.id !== checklistId) || [];
            onProjectUpdate({ ...project, checklists: updatedChecklists });
        }
    };

    // Add a new item to the template
    const addTemplateItem = () => {
        const newItem: ChecklistItem = {
            id: `item-${Date.now()}`,
            title: '',
            description: '',
            required: true,
            valueType: 'boolean',
            order: (templateData.items?.length || 0) + 1
        };
        
        setTemplateData({
            ...templateData,
            items: [...(templateData.items || []), newItem]
        });
    };

    // Update a template item
    const updateTemplateItem = (index: number, field: keyof ChecklistItem, value: any) => {
        const updatedItems = [...(templateData.items || [])];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setTemplateData({ ...templateData, items: updatedItems });
    };

    // Remove a template item
    const removeTemplateItem = (index: number) => {
        const updatedItems = [...(templateData.items || [])];
        updatedItems.splice(index, 1);
        setTemplateData({ ...templateData, items: updatedItems });
    };

    // Render template editor view
    const renderTemplateEditor = () => (
        <Paper sx={{ p: 4, borderRadius: 3 }} className="animate-in slide-in-from-right duration-300">
            <Box display="flex" justifyContent="space-between" mb={4} alignItems="center">
                <Box>
                    <Typography variant="h6" fontWeight="bold">Checklist Template Editor</Typography>
                    <Typography variant="caption" color="text.secondary">Create or edit checklist templates</Typography>
                </Box>
                <IconButton onClick={() => setViewMode('TEMPLATE_LIST')}><X /></IconButton>
            </Box>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField 
                        fullWidth label="Template Name" 
                        value={templateData.name || ''} 
                        onChange={e => setTemplateData({...templateData, name: e.target.value})} 
                        required
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select 
                            value={templateData.category || 'Quality'} 
                            label="Category" 
                            onChange={e => setTemplateData({...templateData, category: e.target.value})}
                        >
                            <MenuItem value="Quality">Quality</MenuItem>
                            <MenuItem value="Safety">Safety</MenuItem>
                            <MenuItem value="Environmental">Environmental</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                    <TextField 
                        fullWidth multiline rows={3} label="Description" 
                        value={templateData.description || ''} 
                        onChange={e => setTemplateData({...templateData, description: e.target.value})} 
                    />
                </Grid>
                
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Checklist Items</Typography>
                        <Button variant="outlined" startIcon={<Plus size={16} />} onClick={addTemplateItem}>
                            Add Item
                        </Button>
                    </Box>
                    
                    {(templateData.items || []).map((item, index) => (
                        <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField 
                                        fullWidth label="Item Title" 
                                        value={item.title || ''} 
                                        onChange={e => updateTemplateItem(index, 'title', e.target.value)} 
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Response Type</InputLabel>
                                        <Select 
                                            value={item.valueType || 'boolean'} 
                                            label="Response Type" 
                                            onChange={e => updateTemplateItem(index, 'valueType', e.target.value)}
                                        >
                                            <MenuItem value="boolean">Yes/No</MenuItem>
                                            <MenuItem value="number">Numeric</MenuItem>
                                            <MenuItem value="text">Text</MenuItem>
                                            <MenuItem value="select">Dropdown</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <TextField 
                                        fullWidth label="Description" 
                                        value={item.description || ''} 
                                        onChange={e => updateTemplateItem(index, 'description', e.target.value)} 
                                    />
                                </Grid>
                                
                                <Grid item xs={6}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={item.required || false}
                                                onChange={e => updateTemplateItem(index, 'required', e.target.checked)}
                                            />
                                        }
                                        label="Required"
                                    />
                                </Grid>
                                
                                <Grid item xs={6} textAlign="right">
                                    <IconButton 
                                        color="error" 
                                        onClick={() => removeTemplateItem(index)}
                                        size="small"
                                    >
                                        <Trash2 size={16} />
                                    </IconButton>
                                </Grid>
                            </Grid>
                            
                            {item.valueType === 'select' && (
                                <Grid item xs={12}>
                                    <TextField 
                                        fullWidth label="Options (comma separated)" 
                                        value={item.options?.join(', ') || ''} 
                                        onChange={e => updateTemplateItem(index, 'options', e.target.value.split(',').map(opt => opt.trim()))} 
                                        helperText="Enter options separated by commas"
                                    />
                                </Grid>
                            )}
                        </Paper>
                    ))}
                </Grid>
            </Grid>
            
            <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                <Button onClick={() => setViewMode('TEMPLATE_LIST')}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveTemplate} startIcon={<CheckCircle2 size={18}/>}>Save Template</Button>
            </Box>
        </Paper>
    );

    // Render instance editor view
    const renderInstanceEditor = () => (
        <Paper sx={{ p: 4, borderRadius: 3 }} className="animate-in slide-in-from-right duration-300">
            <Box display="flex" justifyContent="space-between" mb={4} alignItems="center">
                <Box>
                    <Typography variant="h6" fontWeight="bold">Checklist Instance</Typography>
                    <Typography variant="caption" color="text.secondary">Complete checklist for site verification</Typography>
                </Box>
                <IconButton onClick={() => setViewMode('LIST')}><X /></IconButton>
            </Box>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField 
                        fullWidth label="Location (Chainage + Side)" 
                        placeholder="e.g. 12+400 RHS"
                        value={instanceData.location || ''} 
                        onChange={e => setInstanceData({...instanceData, location: e.target.value})} 
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField 
                        fullWidth label="Date" type="date" 
                        InputLabelProps={{ shrink: true }}
                        value={instanceData.date || ''} 
                        onChange={e => setInstanceData({...instanceData, date: e.target.value})} 
                    />
                </Grid>
                
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Checklist Items</Typography>
                    
                    {(instanceData.items || []).map((item: any, index: number) => (
                        <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Box mb={2}>
                                <Typography variant="subtitle2" fontWeight="bold">{item.title}</Typography>
                                {item.description && (
                                    <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                                )}
                            </Box>
                            
                            {item.valueType === 'boolean' ? (
                                <RadioGroup
                                    row
                                    value={item.response || ''}
                                    onChange={(e) => {
                                        const updatedItems = [...instanceData.items];
                                        updatedItems[index] = { ...item, response: e.target.value };
                                        setInstanceData({ ...instanceData, items: updatedItems });
                                    }}
                                >
                                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                    <FormControlLabel value="no" control={<Radio />} label="No" />
                                    <FormControlLabel value="na" control={<Radio />} label="N/A" />
                                </RadioGroup>
                            ) : item.valueType === 'text' ? (
                                <TextField
                                    fullWidth
                                    label="Response"
                                    value={item.response || ''}
                                    onChange={(e) => {
                                        const updatedItems = [...instanceData.items];
                                        updatedItems[index] = { ...item, response: e.target.value };
                                        setInstanceData({ ...instanceData, items: updatedItems });
                                    }}
                                />
                            ) : item.valueType === 'number' ? (
                                <TextField
                                    fullWidth
                                    label="Value"
                                    type="number"
                                    value={item.response || ''}
                                    onChange={(e) => {
                                        const updatedItems = [...instanceData.items];
                                        updatedItems[index] = { ...item, response: parseFloat(e.target.value) || 0 };
                                        setInstanceData({ ...instanceData, items: updatedItems });
                                    }}
                                />
                            ) : item.valueType === 'select' ? (
                                <FormControl fullWidth>
                                    <InputLabel>Response</InputLabel>
                                    <Select
                                        value={item.response || ''}
                                        onChange={(e) => {
                                            const updatedItems = [...instanceData.items];
                                            updatedItems[index] = { ...item, response: e.target.value };
                                            setInstanceData({ ...instanceData, items: updatedItems });
                                        }}
                                    >
                                        {item.options?.map((opt: string, idx: number) => (
                                            <MenuItem key={idx} value={opt}>{opt}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : null}
                            
                            <TextField
                                fullWidth
                                label="Remarks"
                                multiline
                                rows={2}
                                value={item.remarks || ''}
                                onChange={(e) => {
                                    const updatedItems = [...instanceData.items];
                                    updatedItems[index] = { ...item, remarks: e.target.value };
                                    setInstanceData({ ...instanceData, items: updatedItems });
                                }}
                                sx={{ mt: 1 }}
                            />
                        </Paper>
                    ))}
                </Grid>
                
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Signatures</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField 
                                fullWidth label="Contractor Signature" 
                                value={instanceData.contractorSignature || ''} 
                                onChange={e => setInstanceData({...instanceData, contractorSignature: e.target.value})} 
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField 
                                fullWidth label="Engineer Signature" 
                                value={instanceData.engineerSignature || ''} 
                                onChange={e => setInstanceData({...instanceData, engineerSignature: e.target.value})} 
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            
            <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                <Button onClick={() => setViewMode('LIST')}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveInstance} startIcon={<CheckCircle2 size={18}/>}>Save Checklist</Button>
            </Box>
        </Paper>
    );

    // Render template list view
    const renderTemplateList = () => (
        <Box className="animate-in fade-in duration-500">
            <Box display="flex" justifyContent="space-between" mb={4} alignItems="center">
                <Box>
                    <Typography variant="h5" fontWeight="900">Checklist Templates</Typography>
                    <Typography variant="body2" color="text.secondary">Standard templates for quality verification</Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Button variant="contained" startIcon={<Plus />} onClick={handleCreateTemplate} sx={{ borderRadius: 2 }}>New Template</Button>
                    <Button variant="outlined" onClick={() => setViewMode('LIST')} sx={{ borderRadius: 2 }}>Instances</Button>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                {checklistTemplates.map((template, index) => (
                    <Grid item xs={12} md={6} lg={4} key={index}>
                        <Paper 
                            variant="outlined" 
                            sx={{ 
                                p: 3, 
                                borderRadius: 3, 
                                height: '100%',
                                cursor: 'pointer',
                                '&:hover': { 
                                    boxShadow: 2,
                                    borderColor: 'primary.main'
                                }
                            }}
                            onClick={() => handleCreateInstance(template.id)}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                <Typography variant="h6" fontWeight="bold">{template.name}</Typography>
                                <Chip label={template.category} size="small" color="primary" />
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={2}>{template.description}</Typography>
                            <Box display="flex" justifyContent="flex-end">
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    startIcon={<Copy size={16} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCreateInstance(template.id);
                                    }}
                                >
                                    Use Template
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
                
                {(project.checklists || []).map((checklist, index) => (
                    <Grid item xs={12} md={6} lg={4} key={checklist.id}>
                        <Paper 
                            variant="outlined" 
                            sx={{ 
                                p: 3, 
                                borderRadius: 3, 
                                height: '100%',
                                '&:hover': { boxShadow: 2 }
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                <Typography variant="h6" fontWeight="bold">{checklist.name}</Typography>
                                <Chip label={checklist.category} size="small" color="secondary" />
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={2}>{checklist.description}</Typography>
                            <Box display="flex" justifyContent="flex-end" gap={1}>
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    onClick={() => handleEditTemplate(checklist)}
                                >
                                    Edit
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    startIcon={<Copy size={16} />}
                                    onClick={() => handleCreateInstance(checklist.id)}
                                >
                                    Use
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    // Render main list view
    if (viewMode === 'LIST') {
        return (
            <Box className="animate-in fade-in duration-500">
                <Box display="flex" justifyContent="space-between" mb={4} alignItems="center">
                    <Box>
                        <Typography variant="h5" fontWeight="900">Quality Checklists</Typography>
                        <Typography variant="body2" color="text.secondary">Verification of works against quality standards</Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button variant="contained" startIcon={<Plus />} onClick={() => setViewMode('TEMPLATE_LIST')} sx={{ borderRadius: 2 }}>New Checklist</Button>
                    </Stack>
                </Box>

                <Grid container spacing={2} mb={4}>
                    <Grid item xs={6} sm={3}>
                        <StatCard title="Total" value={projectChecklists.length} icon={FileText} color="#4f46e5" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <StatCard title="Active" value={projectChecklists.filter(c => c.isActive).length} icon={CheckCircle} color="#10b981" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <StatCard title="Quality" value={projectChecklists.filter(c => c.category === 'Quality').length} icon={ShieldCheck} color="#8b5cf6" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <StatCard title="Safety" value={projectChecklists.filter(c => c.category === 'Safety').length} icon={Lock} color="#ef4444" />
                    </Grid>
                </Grid>

                <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'background.paper' }}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Items Count</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projectChecklists.map((checklist, index) => (
                                <TableRow key={checklist.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">{checklist.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{checklist.description}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={checklist.category} size="small" variant="outlined" color="primary" />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{checklist.items.length} items</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={checklist.isActive ? 'Active' : 'Inactive'} 
                                            size="small" 
                                            variant="outlined" 
                                            color={checklist.isActive ? 'success' : 'default'} 
                                            sx={{ fontWeight: '900', fontSize: 9 }} 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">{new Date(checklist.createdAt).toLocaleDateString()}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0} justifyContent="flex-end" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <IconButton size="small" onClick={() => { setSelectedChecklist(checklist); setIsDetailModalOpen(true); }}><Eye size={16}/></IconButton>
                                            <IconButton size="small" onClick={() => handleEditInstance(checklist)}><Edit2 size={16}/></IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(checklist.id)}><Trash2 size={16}/></IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {projectChecklists.length === 0 && (
                                <TableRow>
                                    <TableCell align="center" {...{ colSpan: 6 }} sx={{ py: 10 }}>
                                        <Typography variant="body2" color="text.disabled">No checklists found. Create a template to get started.</Typography>
                                        <Button 
                                            variant="outlined" 
                                            sx={{ mt: 2 }} 
                                            onClick={() => setViewMode('TEMPLATE_LIST')}
                                        >
                                            Create Template
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
                                <Typography variant="h6" fontWeight="bold">Checklist Details</Typography>
                                <Typography variant="caption" color="text.secondary">{selectedChecklist?.name}</Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={() => setIsDetailModalOpen(false)}><X/></IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                        {selectedChecklist && (
                            <Grid container spacing={0}>
                                <Grid item xs={12} md={8} sx={{ p: 4, borderRight: '1px solid', borderColor: 'divider' }}>
                                    <Stack spacing={3}>
                                        <Box>
                                            <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: 1 }}>CHECKLIST INFORMATION</Typography>
                                            <Paper variant="outlined" sx={{ p: 2, mt: 1.5, bgcolor: 'background.paper', borderRadius: 2 }}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" fontWeight="bold" color="text.secondary">Name:</Typography>
                                                        <Typography variant="body2">{selectedChecklist.name}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" fontWeight="bold" color="text.secondary">Category:</Typography>
                                                        <Typography variant="body2">{selectedChecklist.category}</Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" fontWeight="bold" color="text.secondary">Description:</Typography>
                                                        <Typography variant="body2">{selectedChecklist.description}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        </Box>
                                        
                                        <Box>
                                            <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: 1 }}>CHECKLIST ITEMS</Typography>
                                            <Paper variant="outlined" sx={{ p: 2, mt: 1.5, bgcolor: 'background.paper', borderRadius: 2 }}>
                                                <List>
                                                    {selectedChecklist.items.map((item, idx) => (
                                                        <ListItem key={idx} sx={{ pl: 0, py: 1, border: 'none' }}>
                                                            <ListItemText 
                                                                primary={
                                                                    <Box display="flex" alignItems="center" gap={1}>
                                                                        <Typography variant="body2" fontWeight="bold">{item.title}</Typography>
                                                                        {item.required && <Chip label="Required" size="small" color="error" />}
                                                                    </Box>
                                                                }
                                                                secondary={
                                                                    <>
                                                                        <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                                                                        <br />
                                                                        <Chip label={item.valueType} size="small" variant="outlined" />
                                                                    </>
                                                                }
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Paper>
                                        </Box>
                                    </Stack>
                                </Grid>

                                <Grid item xs={12} md={4} sx={{ p: 4, bgcolor: 'action.hover' }}>
                                    <Stack spacing={3}>
                                        <Box>
                                            <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: 1 }}>STATUS</Typography>
                                            <Chip 
                                                label={selectedChecklist.isActive ? 'Active' : 'Inactive'} 
                                                color={selectedChecklist.isActive ? 'success' : 'default'} 
                                                sx={{ fontWeight: 'bold', height: 40, borderRadius: 2, width: '100%', mt: 1.5 }} 
                                            />
                                        </Box>

                                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'background.paper' }}>
                                            <Typography variant="caption" fontWeight="900" color="text.secondary" display="flex" alignItems="center" gap={1} mb={1.5}>
                                                <Calendar size={14}/> CREATION INFO
                                            </Typography>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">Created: {new Date(selectedChecklist.createdAt).toLocaleDateString()}</Typography>
                                                <Typography variant="body2">Updated: {new Date(selectedChecklist.updatedAt).toLocaleDateString()}</Typography>
                                            </Box>
                                        </Paper>
                                        
                                        <Button 
                                            fullWidth 
                                            variant="contained" 
                                            startIcon={<Printer/>} 
                                            onClick={() => window.print()} 
                                            sx={{ mt: 2, height: 48, borderRadius: 2 }}
                                        >
                                            Print Checklist
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        )}
                    </DialogContent>
                </Dialog>
            </Box>
        );
    }

    // Render template editor if in template edit mode
    if (viewMode === 'TEMPLATE_EDIT') {
        return renderTemplateEditor();
    }

    // Render instance editor if in instance edit mode
    if (viewMode === 'INSTANCE_EDIT' || viewMode === 'INSTANCE_CREATE') {
        return renderInstanceEditor();
    }

    // Render template list if in template list mode
    if (viewMode === 'TEMPLATE_LIST') {
        return renderTemplateList();
    }

    // Default fallback
    return (
        <Box className="animate-in fade-in duration-500">
            <Typography variant="h5">Checklist Module</Typography>
            <Typography>Select an option to get started.</Typography>
        </Box>
    );
};

export default ChecklistModule;