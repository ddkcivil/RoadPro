
import React, { useState, useMemo } from 'react';
import { 
    Box, Typography, Button, Paper, Grid, Table, TableBody, TableCell, 
    TableHead, TableRow, Chip, IconButton, Stack, Divider, Card, 
    CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, InputAdornment, List, ListItem, ListItemText,
    Avatar, LinearProgress, Autocomplete, Alert, Tooltip,
    ListItemSecondaryAction
} from '@mui/material';
import { Project, UserRole, AppSettings, VariationOrder, VariationItem, BOQItem, WorkCategory } from '../../types';
import { formatCurrency } from '../../utils/formatting/exportUtils';
import { 
    FileDiff, Plus, Search, Trash2, Save, X, 
    CheckCircle2, AlertTriangle, TrendingUp, History, 
    Calculator, Receipt, Info, ArrowRight, DollarSign,
    CheckCircle, Clock, FileEdit, Send, FileX, Calendar
} from 'lucide-react';

interface Props {
  project: Project;
  userRole: UserRole;
  settings: AppSettings;
  onProjectUpdate: (project: Project) => void;
}

const VariationModule: React.FC<Props> = ({ project, settings, onProjectUpdate, userRole }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedVoId, setSelectedVoId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [voForm, setVoForm] = useState<Partial<VariationOrder>>({
        voNumber: `VO-${(project.variationOrders?.length || 0) + 1}`,
        title: '',
        date: new Date().toISOString().split('T')[0],
        reason: '',
        items: []
    });

    const [tempItem, setTempItem] = useState<Partial<VariationItem>>({
        description: '', unit: '', quantityDelta: 0, rate: 0, isNewItem: false
    });

    const currency = formatCurrency(0, settings).substring(0, formatCurrency(0, settings).indexOf('0'));
    const variationOrders = project.variationOrders || [];
    
    const financialSummary = useMemo(() => {
        const boqItems = project.boq || [];
        const original = boqItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
        const variation = boqItems.reduce((acc, item) => acc + ((item.variationQuantity || 0) * item.rate), 0);
        const revised = original + variation;
        return { original, variation, revised, percent: original > 0 ? (variation / original) * 100 : 0 };
    }, [project.boq]);

    const viewingVO = useMemo(() => variationOrders.find(v => v.id === selectedVoId), [selectedVoId, variationOrders]);

    const handleAddItemToVO = () => {
        if (!tempItem.description || !tempItem.quantityDelta) return;
        
        const newItem: VariationItem = {
            id: `voi-${Date.now()}-${Math.random()}`,
            boqItemId: tempItem.boqItemId,
            isNewItem: tempItem.isNewItem || false,
            description: tempItem.description!,
            unit: tempItem.unit || 'unit',
            quantityDelta: Number(tempItem.quantityDelta),
            rate: Number(tempItem.rate)
        };

        setVoForm(prev => ({
            ...prev,
            items: [...(prev.items || []), newItem]
        }));
        
        setTempItem({ description: '', unit: '', quantityDelta: 0, rate: 0, isNewItem: false });
    };

    const handleRemoveItemFromVO = (id: string) => {
        setVoForm(prev => ({
            ...prev,
            items: prev.items?.filter(i => i.id !== id)
        }));
    };

    const handleSaveVODraft = () => {
        if (!voForm.title || !voForm.items?.length) return;
        
        const totalImpact = voForm.items.reduce((acc, i) => acc + (i.quantityDelta * i.rate), 0);
        const finalVO: VariationOrder = {
            ...voForm,
            id: `vo-${Date.now()}`,
            status: 'Draft',
            totalImpact
        } as VariationOrder;

        onProjectUpdate({
            ...project,
            variationOrders: [...variationOrders, finalVO]
        });
        setIsCreateModalOpen(false);
        setVoForm({ 
            voNumber: `VO-${(project.variationOrders?.length || 0) + 2}`, 
            title: '', 
            items: [], 
            reason: '', 
            date: new Date().toISOString().split('T')[0] 
        });
    };

    const updateVOStatus = (voId: string, newStatus: VariationOrder['status']) => {
        let updatedBOQ = [...project.boq];
        const updatedVOs = variationOrders.map(v => {
            if (v.id === voId) {
                if (newStatus === 'Approved') {
                    // Sync logic for BOQ update
                    v.items.forEach(item => {
                        if (item.isNewItem) {
                            updatedBOQ.push({
                                id: `boq-ns-${Date.now()}-${Math.random()}`,
                                itemNo: `NS-${updatedBOQ.length + 1}`,
                                description: item.description,
                                unit: item.unit,
                                quantity: 0,
                                variationQuantity: item.quantityDelta,
                                revisedQuantity: item.quantityDelta,
                                rate: item.rate,
                                amount: item.rate * item.quantityDelta, // Calculate amount
                                location: '', // Default empty location
                                category: WorkCategory.EXTRA_WORK,
                                completedQuantity: 0
                            });
                        } else {
                            const boqIdx = updatedBOQ.findIndex(b => b.id === item.boqItemId);
                            if (boqIdx !== -1) {
                                const currentVar = updatedBOQ[boqIdx].variationQuantity || 0;
                                updatedBOQ[boqIdx].variationQuantity = currentVar + item.quantityDelta;
                                updatedBOQ[boqIdx].revisedQuantity = updatedBOQ[boqIdx].quantity + updatedBOQ[boqIdx].variationQuantity;
                            }
                        }
                    });
                }
                return { ...v, status: newStatus };
            }
            return v;
        });

        onProjectUpdate({ 
            ...project, 
            variationOrders: updatedVOs,
            boq: updatedBOQ
        });
    };

    const handleDeleteVO = (voId: string) => {
        if (confirm("Permanently delete this variation record?")) {
            onProjectUpdate({ 
                ...project, 
                variationOrders: variationOrders.filter(v => v.id !== voId) 
            });
            if (selectedVoId === voId) setSelectedVoId(null);
        }
    };

    const canApprove = [UserRole.ADMIN, UserRole.PROJECT_MANAGER].includes(userRole);

    return (
        <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', gap: 3 }} className="animate-in fade-in duration-500">
            <Paper sx={{ width: 340, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }} variant="outlined">
                <Box p={2.5} borderBottom="1px solid #f1f5f9" bgcolor="slate.50">
                    <Typography variant="h6" fontWeight="900">Contract Variations</Typography>
                    <Button 
                        fullWidth variant="contained" sx={{ mt: 2, borderRadius: 3 }} 
                        startIcon={<Plus size={18}/>}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Initialize Draft
                    </Button>
                </Box>
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <Box p={2}>
                        <TextField 
                            fullWidth size="small" placeholder="Search variations..." 
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            InputProps={{ startAdornment: <Search size={14} className="mr-2 text-slate-400" /> }}
                        />
                    </Box>
                    <List disablePadding>
                        {[...variationOrders].reverse().map(vo => (
                            <ListItem key={vo.id} disablePadding>
                                <Paper 
                                    elevation={0}
                                    sx={{ 
                                        width: '100%', m: 1, p: 2.5, cursor: 'pointer', borderRadius: 3, 
                                        border: '1px solid',
                                        borderColor: selectedVoId === vo.id ? 'primary.main' : 'divider',
                                        bgcolor: selectedVoId === vo.id ? 'indigo.50/30' : 'white',
                                        '&:hover': { bgcolor: 'slate.50' }
                                    }}
                                    onClick={() => setSelectedVoId(vo.id)}
                                >
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="caption" fontWeight="900" color="primary">{vo.voNumber}</Typography>
                                        <Chip 
                                            label={vo.status.toUpperCase()} size="small" 
                                            color={vo.status === 'Approved' ? 'success' : vo.status === 'Rejected' ? 'error' : vo.status === 'Submitted' ? 'info' : 'warning'}
                                            sx={{ height: 18, fontSize: 8, fontWeight: 'black' }}
                                        />
                                    </Box>
                                    <Typography variant="body2" fontWeight="900" noWrap sx={{ mb: 1 }}>{vo.title}</Typography>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Calendar size={10}/> {vo.date}
                                        </Typography>
                                        <Typography variant="caption" fontWeight="bold" color={vo.totalImpact >= 0 ? 'success.main' : 'error.main'}>
                                            {formatCurrency(vo.totalImpact, settings)}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Paper>

            <Box flex={1} sx={{ overflowY: 'auto' }}>
                <Stack spacing={3}>
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'white' }} variant="outlined">
                        {/* Fix: Added item prop to Grid components with xs/md props */}
                        <Grid container spacing={4} alignItems="center">
                            {/* Fix: Added item prop to Grid components with xs/md props */}
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" fontWeight="900" color="text.secondary" gutterBottom display="block" sx={{ letterSpacing: 1 }}>REVISED CONTRACT TOTAL</Typography>
                                <Typography variant="h4" fontWeight="900">{formatCurrency(financialSummary.revised, settings)}</Typography>
                                <Typography variant="caption" fontWeight="bold" color="text.disabled">Original: {formatCurrency(financialSummary.original, settings)}</Typography>
                            </Grid>
                            {/* Fix: Added item prop to Grid components with xs/md props */}
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" fontWeight="900" color="text.secondary" gutterBottom display="block" sx={{ letterSpacing: 1 }}>NET CHANGE IMPACT</Typography>
                                <Typography variant="h4" fontWeight="900" color={financialSummary.variation >= 0 ? 'success.main' : 'error.main'}>
                                    {formatCurrency(financialSummary.variation, settings)}
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1} mt={1}>
                                    <LinearProgress 
                                        variant="determinate" value={Math.min(100, Math.abs(financialSummary.percent) * 5)} 
                                        sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'slate.100' }}
                                    />
                                    <Typography variant="caption" fontWeight="900">{financialSummary.percent.toFixed(2)}%</Typography>
                                </Box>
                            </Grid>
                            {/* Fix: Added item prop to Grid components with xs/md props */}
                            <Grid item xs={12} md={4}>
                                <Stack spacing={1}>
                                    <Button fullWidth variant="outlined" size="small" startIcon={<History size={16}/>} sx={{ borderRadius: 3 }} onClick={() => alert('Financial History view would open here')}>Financial History</Button>
                                    <Button fullWidth variant="outlined" size="small" startIcon={<TrendingUp size={16}/>} sx={{ borderRadius: 3 }} onClick={() => alert('Variation S-Curve visualization would open here')}>Variation S-Curve</Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>

                    {viewingVO ? (
                        <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                            <Box p={3} borderBottom="1px solid #f1f5f9" bgcolor="slate.50" display="flex" justifyContent="space-between" alignItems="center">
                                <Box display="flex" gap={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: 'indigo.600', color: 'white', width: 48, height: 48 }} variant="rounded"><FileDiff size={24}/></Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight="900">{viewingVO.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">REF: {viewingVO.voNumber} • STATUS: <b>{viewingVO.status.toUpperCase()}</b></Typography>
                                    </Box>
                                </Box>
                                <Stack direction="row" spacing={1.5}>
                                    {viewingVO.status === 'Draft' && (
                                        <>
                                            <IconButton color="error" onClick={() => handleDeleteVO(viewingVO.id)}><Trash2 size={20}/></IconButton>
                                            <Button variant="contained" color="primary" startIcon={<Send size={18}/>} onClick={() => updateVOStatus(viewingVO.id, 'Submitted')} sx={{ borderRadius: 3 }}>Submit for Review</Button>
                                        </>
                                    )}
                                    {viewingVO.status === 'Submitted' && canApprove && (
                                        <>
                                            <Button variant="outlined" color="error" startIcon={<FileX size={18}/>} onClick={() => updateVOStatus(viewingVO.id, 'Rejected')} sx={{ borderRadius: 3 }}>Reject</Button>
                                            <Button variant="contained" color="success" startIcon={<CheckCircle2 size={18}/>} onClick={() => updateVOStatus(viewingVO.id, 'Approved')} sx={{ borderRadius: 3 }}>Approve & Sync</Button>
                                        </>
                                    )}
                                    {viewingVO.status === 'Approved' && (
                                        <Chip icon={<CheckCircle size={14}/>} label="APPROVED & SYNCED" color="success" sx={{ fontWeight: 'bold', px: 1 }} />
                                    )}
                                    {viewingVO.status === 'Rejected' && (
                                        <Button variant="outlined" startIcon={<FileEdit size={18}/>} onClick={() => updateVOStatus(viewingVO.id, 'Draft')} sx={{ borderRadius: 3 }}>Revise Draft</Button>
                                    )}
                                </Stack>
                            </Box>
                            <CardContent sx={{ p: 4 }}>
                                {/* Fix: Added item prop to Grid components with xs/md props */}
                                <Grid container spacing={6}>
                                    {/* Fix: Added item prop to Grid components with xs/md props */}
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="caption" fontWeight="900" color="text.secondary" gutterBottom display="block" sx={{ letterSpacing: 1 }}>TECHNICAL JUSTIFICATION</Typography>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'slate.50', borderStyle: 'dashed', borderRadius: 3 }}>
                                            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{viewingVO.reason || 'No written justification provided.'}</Typography>
                                        </Paper>
                                        <Box mt={4}>
                                            <Typography variant="caption" fontWeight="900" color="text.secondary" gutterBottom display="block">AUDIT SUMMARY</Typography>
                                            <Stack spacing={1.5} mt={2}>
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'slate.200', fontSize: 10, fontWeight: 'bold' }}>PM</Avatar>
                                                    <Typography variant="caption">Proposed by: Site Engineering Team</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Clock size={14} className="text-slate-400"/>
                                                    <Typography variant="caption">Created on: {viewingVO.date}</Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </Grid>
                                    {/* Fix: Added item prop to Grid components with xs/md props */}
                                    <Grid item xs={12} md={8}>
                                        <Typography variant="caption" fontWeight="900" color="text.secondary" gutterBottom display="block" sx={{ letterSpacing: 1 }}>SCHEDULE OF AMENDMENTS</Typography>
                                        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', mt: 1.5 }}>
                                            <Table size="small">
                                                <TableHead sx={{ bgcolor: 'slate.50' }}>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Work Description</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Delta Qty</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Net Value</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {viewingVO.items.map(item => (
                                                        <TableRow key={item.id} hover>
                                                            <TableCell>
                                                                <Typography variant="body2" fontWeight="bold">{item.description}</Typography>
                                                                <Chip label={item.isNewItem ? 'NON-SCHEDULED' : 'BOQ LINKED'} size="small" sx={{ fontSize: 8, height: 16, mt: 0.5 }} color={item.isNewItem ? 'secondary' : 'default'} variant="outlined" />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="body2" fontWeight="bold" color={item.quantityDelta >= 0 ? 'success.main' : 'error.main'}>
                                                                    {item.quantityDelta >= 0 ? '+' : ''}{item.quantityDelta} {item.unit}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">{formatCurrency(item.rate, settings)}</TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="body2" fontWeight="900">
                                                                    {currency}{(item.quantityDelta * item.rate).toLocaleString()}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow sx={{ bgcolor: 'slate.900' }}>
                                                        <TableCell colSpan={3} align="right">
                                                            <Typography variant="caption" color="white" fontWeight="900" sx={{ letterSpacing: 1 }}>TOTAL VO IMPACT</Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="subtitle2" color="white" fontWeight="900">
                                                                {formatCurrency(viewingVO.totalImpact, settings)}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ) : (
                        <Box py={15} textAlign="center" color="text.disabled" bgcolor="white" borderRadius={3} border="1px dashed #e2e8f0">
                            <FileDiff size={80} className="mx-auto mb-4 opacity-10"/>
                            <Typography variant="h6" fontWeight="bold">No Variation Selected</Typography>
                            <Typography variant="body2">Select a record from the registry or create a new draft to begin.</Typography>
                        </Box>
                    )}
                </Stack>
            </Box>

            <Dialog 
                open={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                maxWidth="lg" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, height: '90vh' } }}
            >
                <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Calculator className="text-indigo-600"/>
                        <Typography variant="h6" fontWeight="900">Draft Variation Order Worksheet</Typography>
                    </Box>
                    <IconButton onClick={() => setIsCreateModalOpen(false)}><X/></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: 'slate.50' }}>
                    <Box p={4}>
                        {/* Fix: Added item prop to Grid components with xs/md props */}
                        <Grid container spacing={4}>
                            {/* Fix: Added item prop to Grid components with xs/md props */}
                            <Grid item xs={12} md={5}>
                                <Stack spacing={3}>
                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ display: 'block', mb: 2.5, letterSpacing: 1 }}>CONTRACTUAL DETAILS</Typography>
                                        <Stack spacing={3}>
                                            {/* Fix: Added item prop to Grid components with xs/md props */}
                                            <Grid container spacing={2}>
                                                <Grid item xs={7}>
                                                    <TextField 
                                                        fullWidth label="Amendment Title" size="small" placeholder="e.g. KM 4-5 Add. Work"
                                                        value={voForm.title} onChange={e => setVoForm({...voForm, title: e.target.value})}
                                                    />
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <TextField fullWidth label="VO Ref #" size="small" value={voForm.voNumber} disabled />
                                                </Grid>
                                            </Grid>
                                            <TextField 
                                                fullWidth label="Technical Justification" multiline rows={4} size="small"
                                                placeholder="Detail the technical necessity..."
                                                value={voForm.reason} onChange={e => setVoForm({...voForm, reason: e.target.value})}
                                            />
                                        </Stack>
                                    </Paper>

                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'indigo.900', color: 'white' }}>
                                        <Typography variant="caption" fontWeight="900" sx={{ opacity: 0.7, display: 'block', mb: 2, letterSpacing: 1 }}>STAGING WORK ITEMS</Typography>
                                        <Stack spacing={2.5}>
                                            <Autocomplete<BOQItem>
                                                size="small"
                                                options={project.boq || []}
                                                getOptionLabel={(o) => `[${o.itemNo}] ${o.description.slice(0, 40)}...`}
                                                onChange={(_, v) => {
                                                    if (v) setTempItem({ 
                                                        boqItemId: v.id, description: v.description, 
                                                        unit: v.unit, rate: v.rate, isNewItem: false 
                                                    });
                                                }}
                                                renderInput={(params) => {
                                                    /* Fix: Handled Autocomplete InputProps with explicit cast to prevent ref incompatibility errors */
                                                    const { InputProps, ...rest } = params;
                                                    return (
                                                        <TextField 
                                                            {...rest} 
                                                            label="Existing BOQ Component" 
                                                            variant="filled" 
                                                            sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1.5 }} 
                                                            InputLabelProps={{ sx: { color: 'white' } }} 
                                                            InputProps={{ ...InputProps } as any}
                                                        />
                                                    );
                                                }}
                                            />
                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }}><Typography variant="caption" sx={{ color: 'white', opacity: 0.5 }}>OR NEW SCOPE</Typography></Divider>
                                            <TextField 
                                                size="small" label="Item Description" variant="filled" sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1.5 }} 
                                                InputLabelProps={{ sx: { color: 'white' } }} 
                                                value={tempItem.description} onChange={e => setTempItem({...tempItem, description: e.target.value, isNewItem: true, boqItemId: undefined})}
                                            />
                                            <Box display="flex" gap={2}>
                                                <TextField 
                                                    size="small" label="Qty Delta" type="number" variant="filled" sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1.5 }} 
                                                    InputLabelProps={{ sx: { color: 'white' } }}
                                                    value={tempItem.quantityDelta} onChange={e => setTempItem({...tempItem, quantityDelta: Number(e.target.value)})}
                                                />
                                                <TextField 
                                                    size="small" label="Unit" variant="filled" sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1.5 }} 
                                                    InputLabelProps={{ sx: { color: 'white' } }}
                                                    value={tempItem.unit} onChange={e => setTempItem({...tempItem, unit: e.target.value})}
                                                />
                                            </Box>
                                            <TextField 
                                                size="small" label="Agreed Rate" type="number" variant="filled" sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1.5 }} 
                                                InputLabelProps={{ sx: { color: 'white' } }}
                                                value={tempItem.rate} onChange={e => setTempItem({...tempItem, rate: Number(e.target.value)})}
                                            />
                                            <Button 
                                                fullWidth variant="contained" color="secondary" 
                                                startIcon={<Plus/>} onClick={handleAddItemToVO}
                                                disabled={!tempItem.description || !tempItem.quantityDelta}
                                                sx={{ borderRadius: 3 }}
                                            >
                                                Stage for Review
                                            </Button>
                                        </Stack>
                                    </Paper>
                                </Stack>
                            </Grid>

                            {/* Fix: Added item prop to Grid components with xs/md props */}
                            <Grid item xs={12} md={7}>
                                <Paper variant="outlined" sx={{ height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'white' }}>
                                    <Box p={3} borderBottom={1} borderColor="divider" bgcolor="slate.50" display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="900" display="flex" alignItems="center" gap={1}>
                                                <Receipt size={20} className="text-indigo-600"/> Impact Ledger
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">Current staged changes</Typography>
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography variant="caption" fontWeight="900" color="text.secondary" display="block">TOTAL NET VALUE</Typography>
                                            <Typography variant="h5" fontWeight="900" color="indigo.700">
                                                {formatCurrency(voForm.items?.reduce((acc, i) => acc + (i.quantityDelta * i.rate), 0) || 0, settings)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box flex={1} overflow="auto">
                                        <Table size="small" stickyHeader>
                                            <TableHead sx={{ bgcolor: 'white' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Delta Qty</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                                    <TableCell align="center"></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {voForm.items?.map(item => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="bold" noWrap sx={{ maxWidth: 200 }}>{item.description}</Typography>
                                                            <Typography variant="caption" color="text.disabled">{item.isNewItem ? 'EXTRA WORK' : 'BOQ ITEM'}</Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="caption" fontWeight="900" color={item.quantityDelta >= 0 ? 'success.main' : 'error.main'}>
                                                                {item.quantityDelta >= 0 ? '+' : ''}{item.quantityDelta} {item.unit}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right"><Typography variant="caption">{formatCurrency(item.rate, settings)}</Typography></TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="caption" fontWeight="bold">
                                                                {currency}{(item.quantityDelta * item.rate).toLocaleString()}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton size="small" color="error" onClick={() => handleRemoveItemFromVO(item.id)}>
                                                                <X size={14}/>
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                    <Box p={3} textAlign="right" borderTop={1} borderColor="divider">
                                        <Button onClick={() => setIsCreateModalOpen(false)} sx={{ mr: 2, borderRadius: 3 }}>Discard</Button>
                                        <Button 
                                            variant="contained" 
                                            onClick={handleSaveVODraft}
                                            disabled={!voForm.items?.length || !voForm.title}
                                            startIcon={<Save/>}
                                            sx={{ px: 6, py: 1.5, borderRadius: 3 }}
                                        >
                                            Store Draft
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default VariationModule;
