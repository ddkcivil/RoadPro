
import React, { useState, useMemo } from 'react';
import {
    Box, Typography, Button, Paper, Grid, Table, TableBody, TableCell,
    TableHead, TableRow, Chip, IconButton, Stack, Divider, Card,
    CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, InputAdornment, List, ListItemText, ListItemAvatar,
    Avatar, ListItemButton, LinearProgress, Checkbox, Tooltip, Alert,
    Tabs, Tab, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Project, UserRole, AppSettings, ContractBill, BillItem, BOQItem, SubcontractorBill, StructureWorkLog, StructureComponent, StructureAsset } from '../../types';
import { formatCurrency } from '../../utils/formatting/exportUtils';
import {
    Receipt, Printer, Plus, Calculator,
    History, X, Save, ArrowRight, ArrowLeft, Landmark,
    Receipt as ReceiptIcon, FileCheck, TrendingUp, Edit3,
    AlertTriangle, CheckCircle2, FileSpreadsheet
} from 'lucide-react';

interface Props {
  project: Project;
  userRole: UserRole;
  settings: AppSettings;
  onProjectUpdate: (project: Project) => void;
}

const BillingModule: React.FC<Props> = ({ project, settings, onProjectUpdate }) => {
    const [selectedIpcId, setSelectedIpcId] = useState<string | null>(null);
    const [selectedSubcontractorBillId, setSelectedSubcontractorBillId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubcontractorBillModalOpen, setIsSubcontractorBillModalOpen] = useState(false);
    const [createStep, setCreateStep] = useState(0);
    const [subcontractorBillCreateStep, setSubcontractorBillCreateStep] = useState(0);
    const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
    const [selectedSheetIds, setSelectedSheetIds] = useState(new Set<string>());
    const [selectedSubcontractorWorkIds, setSelectedSubcontractorWorkIds] = useState(new Set<string>());
    
    const [ipcForm, setIpcForm] = useState<Partial<ContractBill>>({
        billNumber: '',
        date: new Date().toISOString().split('T')[0],
        dateOfMeasurement: new Date().toISOString().split('T')[0],
        orderOfBill: (project.contractBills?.length || 0) + 1,
        items: [],
        provisionalSum: 0,
        cpaAmount: 0,
        liquidatedDamages: 0
    });
    
    const [subcontractorBillForm, setSubcontractorBillForm] = useState<Partial<SubcontractorBill>>({
        billNumber: '',
        date: new Date().toISOString().split('T')[0],
        periodFrom: new Date().toISOString().split('T')[0],
        periodTo: new Date().toISOString().split('T')[0],
        subcontractorId: '',
        items: [],
        grossAmount: 0,
        retentionPercent: 5
    });

    const currency = formatCurrency(0, settings).substring(0, formatCurrency(0, settings).indexOf('0'));
    const bills = project.contractBills || [];
    const subcontractorBills = project.subcontractorBills || [];
    const approvedSheets = (project.measurementSheets || []).filter(s => s.status === 'Approved');

    const calculateIPCDetails = (form: Partial<ContractBill>) => {
        const gross = (form.items || []).reduce((acc, item) => acc + (item.currentAmount || 0), 0);
        const cpa = Number(form.cpaAmount) || 0;
        const ps = Number(form.provisionalSum) || 0;
        
        // Following Standard IPC Logic: Gross of current work + Price Adjustments
        const billWithCPA = gross + cpa;
        const billWithoutPS = billWithCPA - ps;
        const vat = billWithoutPS * 0.13;
        const totalWithVat = billWithoutPS + vat + ps;
        
        // Deductions
        const retention = billWithCPA * 0.05;
        const tds = billWithCPA * 0.015;
        const ncrDevFund = billWithCPA * 0.001;
        const deductibleVat = vat * 0.30;
        
        const deductions = retention + tds + ncrDevFund + deductibleVat + (Number(form.advancePaymentDeduction) || 0) + (Number(form.liquidatedDamages) || 0);
        const payable = totalWithVat - deductions;

        return {
            billAmountGross: gross,
            cpaAmount: cpa,
            billAmountWithCPA: billWithCPA,
            billAmountWithoutPS: billWithoutPS,
            vatAmount: vat,
            totalBillWithVat: totalWithVat,
            retentionAmount: retention,
            advanceIncomeTax: tds,
            contractorDevFund: ncrDevFund,
            deductableVat: deductibleVat,
            totalAmountPayable: payable
        };
    };

    const currentIpcSummary = useMemo(() => calculateIPCDetails(ipcForm), [ipcForm]);
    const viewingIpc = useMemo(() => bills.find(b => b.id === selectedIpcId), [selectedIpcId, bills]);
    
    const calculateSubcontractorBillDetails = (form: Partial<SubcontractorBill>) => {
        const gross = (form.items || []).reduce((acc, item) => acc + (item.currentAmount || 0), 0);
        const retention = gross * (Number(form.retentionPercent) / 100);
        const net = gross - retention;
        
        return {
            grossAmount: gross,
            retentionAmount: retention,
            netAmount: net
        };
    };
    
    const currentSubcontractorBillSummary = useMemo(() => calculateSubcontractorBillDetails(subcontractorBillForm), [subcontractorBillForm]);
    
    const viewingSubcontractorBill = useMemo(() => subcontractorBills.find(b => b.id === selectedSubcontractorBillId), [selectedSubcontractorBillId, subcontractorBills]);
    
    const handleInitNewSubcontractorBill = () => {
        setSubcontractorBillForm({
            billNumber: `SCB-${(subcontractorBills.length || 0) + 1}`,
            date: new Date().toISOString().split('T')[0],
            periodFrom: new Date().toISOString().split('T')[0],
            periodTo: new Date().toISOString().split('T')[0],
            subcontractorId: '',
            items: [],
            grossAmount: 0,
            retentionPercent: 5
        });
        setSelectedSubcontractorWorkIds(new Set());
        setSubcontractorBillCreateStep(0);
        setIsSubcontractorBillModalOpen(true);
    };
    
    const generateSubcontractorBillItemsFromWorkLogs = () => {
        const selectedWorkLogs = getSubcontractorWorkLogs(subcontractorBillForm.subcontractorId || '').filter(log => selectedSubcontractorWorkIds.has(log.id));
        
        // Group work logs by BOQ item ID to calculate quantities
        const workLogGroups: Record<string, StructureWorkLog[]> = {};
        selectedWorkLogs.forEach(log => {
            if (log.boqItemId) {
                if (!workLogGroups[log.boqItemId]) {
                    workLogGroups[log.boqItemId] = [];
                }
                workLogGroups[log.boqItemId].push(log);
            }
        });
        
        // Create bill items based on BOQ items and work logs
        const items: BillItem[] = Object.keys(workLogGroups).map(boqId => {
            const boqItem = project.boq.find(b => b.id === boqId);
            if (!boqItem) return null;
            
            const workLogs = workLogGroups[boqId];
            const currentQuantity = workLogs.reduce((sum, log) => sum + log.quantity, 0);
            
            // Get the rate from the subcontractor's specific rate entry
            const subcontractor = project.agencies?.find(a => a.id === subcontractorBillForm.subcontractorId);
            const subcontractorRate = subcontractor?.rates?.find(r => r.boqItemId === boqId);
            const rate = subcontractorRate ? subcontractorRate.rate : boqItem.rate;
            
            return {
                id: `sb-${Date.now()}-${boqId}`,
                boqItemId: boqId,
                itemNo: boqItem.itemNo,
                description: boqItem.description,
                unit: boqItem.unit,
                contractQuantity: boqItem.quantity,
                rate: rate,
                previousQuantity: 0, // For subcontractor bills, we start fresh
                currentQuantity: currentQuantity,
                uptoDateQuantity: currentQuantity,
                previousAmount: 0,
                currentAmount: currentQuantity * rate,
                uptoDateAmount: currentQuantity * rate
            };
        }).filter(Boolean) as BillItem[];
        
        setSubcontractorBillForm(prev => ({ ...prev, items }));
        setSubcontractorBillCreateStep(1);
    };
    
    const getSubcontractorWorkLogs = (subcontractorId: string) => {
        if (!project.structures) return [];
        
        return project.structures.flatMap(structure => 
            structure.components.flatMap(component => 
                component.workLogs || []
            )
        ).filter(log => log.subcontractorId === subcontractorId);
    };
    
    const handleSubcontractorBillItemQtyChange = (boqId: string, newCurrentQty: number) => {
        const updatedItems = (subcontractorBillForm.items || []).map(item => {
            if (item.boqItemId === boqId) {
                return {
                    ...item,
                    currentQuantity: newCurrentQty,
                    uptoDateQuantity: newCurrentQty, // For subcontractor bills, we start fresh
                    currentAmount: newCurrentQty * item.rate,
                    uptoDateAmount: newCurrentQty * item.rate
                };
            }
            return item;
        });
        setSubcontractorBillForm({ ...subcontractorBillForm, items: updatedItems });
    };
    
    const handleSaveSubcontractorBill = () => {
        const summary = calculateSubcontractorBillDetails(subcontractorBillForm);
        
        const finalSubcontractorBill: SubcontractorBill = {
            ...subcontractorBillForm,
            id: `scb-${Date.now()}`,
            status: 'Draft',
            grossAmount: summary.grossAmount,
            retentionPercent: subcontractorBillForm.retentionPercent || 5,
            netAmount: summary.netAmount,
            items: subcontractorBillForm.items || []
        } as SubcontractorBill;
        
        onProjectUpdate({ 
            ...project, 
            subcontractorBills: [...(project.subcontractorBills || []), finalSubcontractorBill] 
        });
        
        setIsSubcontractorBillModalOpen(false);
        setSelectedSubcontractorBillId(finalSubcontractorBill.id);
    };

    const handleInitNewIPC = () => {
        setIpcForm({
            billNumber: `IPC-${(project.contractBills?.length || 0) + 1}`,
            date: new Date().toISOString().split('T')[0],
            dateOfMeasurement: new Date().toISOString().split('T')[0],
            orderOfBill: (project.contractBills?.length || 0) + 1,
            items: [],
            provisionalSum: 0,
            cpaAmount: 0,
            advancePaymentDeduction: 0,
            liquidatedDamages: 0
        });
        setSelectedSheetIds(new Set());
        setCreateStep(0);
        setIsCreateModalOpen(true);
    };

    const generateBillItemsFromSheets = () => {
        const latestIpc = bills[bills.length - 1];
        const selectedSheets = approvedSheets.filter(s => selectedSheetIds.has(s.id));
        const currentWorkMap: Record<string, number> = {};
        
        selectedSheets.forEach(sheet => {
            (sheet.entries || []).forEach(entry => {
                if (entry.boqItemId) {
                    currentWorkMap[entry.boqItemId] = (currentWorkMap[entry.boqItemId] || 0) + entry.quantity;
                }
            });
        });

        const items: BillItem[] = project.boq.map(boq => {
            const previous = latestIpc?.items.find(pi => pi.boqItemId === boq.id);
            const prevQty = previous?.uptoDateQuantity || 0;
            const currentQty = currentWorkMap[boq.id] || 0;
            const uptoDateQty = prevQty + currentQty;
            
            return {
                id: `bi-${Date.now()}-${boq.id}`,
                boqItemId: boq.id,
                itemNo: boq.itemNo,
                description: boq.description,
                unit: boq.unit,
                contractQuantity: boq.quantity,
                rate: boq.rate,
                previousQuantity: prevQty,
                currentQuantity: currentQty,
                uptoDateQuantity: uptoDateQty,
                previousAmount: prevQty * boq.rate,
                currentAmount: currentQty * boq.rate,
                uptoDateAmount: uptoDateQty * boq.rate
            };
        });

        setIpcForm(prev => ({ ...prev, items }));
        setCreateStep(1);
    };

    const handleItemQtyChange = (boqId: string, newCurrentQty: number) => {
        const updatedItems = (ipcForm.items || []).map(item => {
            if (item.boqItemId === boqId) {
                const uptoDateQty = item.previousQuantity + newCurrentQty;
                return {
                    ...item,
                    currentQuantity: newCurrentQty,
                    uptoDateQuantity: uptoDateQty,
                    currentAmount: newCurrentQty * item.rate,
                    uptoDateAmount: uptoDateQty * item.rate
                };
            }
            return item;
        });
        setIpcForm({ ...ipcForm, items: updatedItems });
    };

    const handleSaveIPC = () => {
        const finalIPC: ContractBill = {
            ...ipcForm,
            ...currentIpcSummary,
            id: `ipc-${Date.now()}`,
            status: 'Draft',
            type: 'IPC', // Added missing type property
            location: project.location,
            dateOfWorkOrder: project.startDate,
            extendedCompletionDate: project.endDate,
        } as ContractBill;

        onProjectUpdate({ ...project, contractBills: [...bills, finalIPC] });
        setIsCreateModalOpen(false);
        setSelectedIpcId(finalIPC.id);
    };

    const toggleSheetSelection = (id: string) => {
        const next = new Set(selectedSheetIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedSheetIds(next);
    };

    const getRowLabel = (sn: string, label: string) => (
        <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ minWidth: 30, fontWeight: 'bold', color: 'primary.main' }}>{sn}</Typography>
            <Typography variant="body2">{label}</Typography>
        </Stack>
    );

    return (
        <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', gap: 3 }}>
            <Paper sx={{ width: 320, display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden' }} variant="outlined">
                <Box p={2.5} borderBottom="1px solid #f1f5f9" bgcolor="slate.50">
                    <Typography variant="h6" fontWeight="bold">Interim Payments</Typography>
                    <Button fullWidth variant="contained" sx={{ mt: 2 }} startIcon={<Plus size={18}/>} onClick={handleInitNewIPC}>New IPC Request</Button>
                    <Button fullWidth variant="outlined" sx={{ mt: 1 }} startIcon={<FileCheck size={18}/>} onClick={handleInitNewSubcontractorBill}>New Subcontractor Bill</Button>
                </Box>
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <Tabs value={0} sx={{ mb: 2 }}>
                        <Tab label={`Main Contracts (${bills.length})`} />
                        <Tab label={`Subcontractor Bills (${subcontractorBills.length})`} />
                    </Tabs>
                    <List disablePadding>
                        {[...bills].reverse().map(b => (
                            <ListItemButton 
                                key={b.id} 
                                onClick={() => setSelectedIpcId(b.id)} 
                                selected={selectedIpcId === b.id} 
                                sx={{ 
                                    borderBottom: '1px solid #f1f5f9', 
                                    py: 2,
                                    '&.Mui-selected': { bgcolor: 'indigo.50/50', borderRight: '4px solid #6366f1' }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'indigo.50', color: 'indigo.main' }}><Receipt size={20}/></Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={<Typography variant="subtitle2" fontWeight="bold">{b.billNumber}</Typography>} 
                                    secondary={<Typography variant="caption" fontWeight="bold" color="success.main">{currency}{b.totalAmountPayable.toLocaleString()}</Typography>} 
                                />
                            </ListItemButton>
                        ))}
                        {bills.length === 0 && (
                            <Box p={3} textAlign="center" color="text.disabled">
                                <History size={32} className="mx-auto mb-2 opacity-20"/>
                                <Typography variant="body2">No main contracts billed yet.</Typography>
                            </Box>
                        )}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ px: 2, pb: 1 }}>SUBCONTRACTOR BILLS</Typography>
                    <List disablePadding>
                        {[...subcontractorBills].reverse().map(b => {
                            const subcontractor = project.agencies?.find(a => a.id === b.subcontractorId);
                            return (
                                <ListItemButton 
                                    key={b.id} 
                                    onClick={() => setSelectedSubcontractorBillId(b.id)} 
                                    selected={selectedSubcontractorBillId === b.id} 
                                    sx={{ 
                                        borderBottom: '1px solid #f1f5f9', 
                                        py: 2,
                                        '&.Mui-selected': { bgcolor: 'indigo.50/50', borderRight: '4px solid #6366f1' }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'amber.50', color: 'amber.main' }}><FileCheck size={20}/></Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={<Typography variant="subtitle2" fontWeight="bold">{b.billNumber}</Typography>} 
                                        secondary={
                                            <>
                                                <Typography variant="caption" fontWeight="bold" color="primary">{subcontractor?.name || 'Unknown'}</Typography>
                                                <Typography variant="caption" display="block" color="success.main">{currency}{b.netAmount.toLocaleString()}</Typography>
                                            </>
                                        } 
                                    />
                                </ListItemButton>
                            );
                        })}
                        {subcontractorBills.length === 0 && (
                            <Box p={3} textAlign="center" color="text.disabled">
                                <FileCheck size={32} className="mx-auto mb-2 opacity-20"/>
                                <Typography variant="body2">No subcontractor bills created yet.</Typography>
                            </Box>
                        )}
                    </List>
                </Box>
            </Paper>

            <Box flex={1} sx={{ overflowY: 'auto' }}>
                {viewingIpc || viewingSubcontractorBill ? (
                    <Stack spacing={3}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar sx={{ bgcolor: viewingSubcontractorBill ? 'amber.50' : 'indigo.50', color: viewingSubcontractorBill ? 'amber.600' : 'indigo.600' }}>
                                        {viewingSubcontractorBill ? <FileCheck /> : <ReceiptIcon />}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight="900">{viewingSubcontractorBill ? viewingSubcontractorBill.billNumber : viewingIpc?.billNumber}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {viewingSubcontractorBill ? (
                                                <>
                                                    Subcontractor Bill • Date: {viewingSubcontractorBill.date}<br />
                                                    {project.agencies?.find(a => a.id === viewingSubcontractorBill.subcontractorId)?.name || 'Unknown Subcontractor'}
                                                </>
                                            ) : (
                                                <>Order: {viewingIpc?.orderOfBill} • Date: {viewingIpc?.date}</>
                                            )}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button variant="outlined" startIcon={<Printer size={18}/>} onClick={() => setPrintPreviewOpen(true)}>Print DoR Format</Button>
                            </Box>
                        </Paper>

                        {/* Fix: Replaced deprecated Grid props with v6 size prop */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: 'slate.50' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>SN / Financial Description</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount ({currency})</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {viewingSubcontractorBill ? (
                                                <>
                                                    <TableRow><TableCell>{getRowLabel('1', 'Gross Bill Amount')}</TableCell><TableCell align="right">{viewingSubcontractorBill.grossAmount.toLocaleString()}</TableCell></TableRow>
                                                    <TableRow><TableCell>{getRowLabel('2', `Less: Retention (${viewingSubcontractorBill.retentionPercent || 0}%)`)}</TableCell><TableCell align="right">{(viewingSubcontractorBill.grossAmount * ((viewingSubcontractorBill.retentionPercent || 0)/100)).toLocaleString()}</TableCell></TableRow>
                                                    <TableRow sx={{ bgcolor: 'amber.50/30' }}><TableCell>{getRowLabel('3', 'Net Payable Amount')}</TableCell><TableCell align="right"><strong>{viewingSubcontractorBill.netAmount.toLocaleString()}</strong></TableCell></TableRow>
                                                </>
                                            ) : (
                                                <>
                                                    <TableRow><TableCell>{getRowLabel('1', 'Gross Bill Amount (Current)')}</TableCell><TableCell align="right">{viewingIpc?.billAmountGross.toLocaleString()}</TableCell></TableRow>
                                                    <TableRow><TableCell>{getRowLabel('2', 'Add Price Adjustment (CPA)')}</TableCell><TableCell align="right">{viewingIpc?.cpaAmount.toLocaleString()}</TableCell></TableRow>
                                                    <TableRow sx={{ bgcolor: 'indigo.50/30' }}><TableCell>{getRowLabel('3', 'Total Bill with CPA')}</TableCell><TableCell align="right"><strong>{viewingIpc?.billAmountWithCPA.toLocaleString()}</strong></TableCell></TableRow>
                                                    <TableRow><TableCell>{getRowLabel('4', 'VAT @ 13%')}</TableCell><TableCell align="right">{viewingIpc?.vatAmount.toLocaleString()}</TableCell></TableRow>
                                                    <Divider component="tr" />
                                                    <TableRow sx={{ bgcolor: 'slate.900', color: 'white' }}>
                                                        <TableCell sx={{ color: 'white' }}>{getRowLabel('A13', 'NET PAYABLE TO CONTRACTOR')}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'white' }}><Typography variant="h6" fontWeight="bold">{viewingIpc?.totalAmountPayable.toLocaleString()}</Typography></TableCell>
                                                    </TableRow>
                                                </>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Paper>
                            </Grid>
                            {/* Fix: Replaced deprecated Grid props with v6 size prop */}
                            <Grid item xs={12} md={4}>
                                <Stack spacing={3}>
                                    <Card variant="outlined" sx={{ borderRadius: 4, bgcolor: '#f8fafc' }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={2}><TrendingUp size={18}/> Financial Progress</Typography>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" color="text.secondary">Vs. Total Contract</Typography>
                                                <Typography variant="caption" fontWeight="bold">42%</Typography>
                                            </Box>
                                            <LinearProgress variant="determinate" value={42} sx={{ height: 8, borderRadius: 4 }} />
                                        </CardContent>
                                    </Card>
                                    <Alert severity={viewingSubcontractorBill ? "info" : "success"} icon={viewingSubcontractorBill ? <FileCheck /> : <CheckCircle2 />} sx={{ borderRadius: 3 }}>
                                        {viewingSubcontractorBill ? (
                                            `Subcontractor bill for ${project.agencies?.find(a => a.id === viewingSubcontractorBill.subcontractorId)?.name || 'Unknown Subcontractor'}`
                                        ) : (
                                            `This IPC has been verified against measurement book MB-${viewingIpc?.id?.slice(-4)}.`
                                        )}
                                    </Alert>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Stack>
                ) : (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.disabled" sx={{ py: 20 }}>
                        <Calculator size={80} className="opacity-20 mb-4"/><Typography variant="h6">Select a Bill record</Typography>
                    </Box>
                )}
            </Box>

            {/* Create IPC Dialog */}
            <Dialog 
                open={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                maxWidth="lg" 
                fullWidth 
                PaperProps={{ sx: { borderRadius: 4, height: '90vh' } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <FileSpreadsheet className="text-indigo-600" />
                        <Typography variant="h6">Prepare New IPC (Certificate No. {ipcForm.orderOfBill})</Typography>
                    </Box>
                    <IconButton onClick={() => setIsCreateModalOpen(false)}><X/></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
                    <Box sx={{ p: 4 }}>
                        {createStep === 0 && (
                            <Stack spacing={3}>
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    Select approved measurement sheets to auto-map work quantities to BOQ items.
                                </Alert>
                                <Typography variant="subtitle1" fontWeight="bold">Available Measurement Sheets (Approved)</Typography>
                                <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: 'slate.50' }}>
                                            <TableRow>
                                                <TableCell padding="checkbox"></TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>MB Ref #</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Entries</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {approvedSheets.map(sheet => (
                                                <TableRow key={sheet.id} hover onClick={() => toggleSheetSelection(sheet.id)} sx={{ cursor: 'pointer' }}>
                                                    <TableCell padding="checkbox"><Checkbox checked={selectedSheetIds.has(sheet.id)} size="small" /></TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', color: 'indigo.700' }}>{sheet.sheetNumber}</TableCell>
                                                    <TableCell>{sheet.title || 'N/A'}</TableCell>
                                                    <TableCell>{sheet.date}</TableCell>
                                                    <TableCell>{(sheet.entries || []).length} items</TableCell>
                                                </TableRow>
                                            ))}
                                            {approvedSheets.length === 0 && (
                                                <TableRow>
                                                    <TableCell align="center" {...{ colSpan: 5 }} sx={{ py: 6 }}>
                                                        No approved measurement sheets found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Paper>
                                <Box textAlign="right">
                                    <Button variant="contained" disabled={selectedSheetIds.size === 0} onClick={generateBillItemsFromSheets} endIcon={<ArrowRight size={18}/>} sx={{ px: 4, py: 1.2, borderRadius: 2 }}>
                                        Generate Quantity Matrix
                                    </Button>
                                </Box>
                            </Stack>
                        )}
                        {createStep === 1 && (
                            <Stack spacing={3}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="900" color="primary">Review & Adjust Work Quantities</Typography>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography variant="caption" fontWeight="bold">IPC TOTAL:</Typography>
                                        <Typography variant="h6" fontWeight="900" color="indigo.700">{currency}{currentIpcSummary.billAmountGross.toLocaleString()}</Typography>
                                    </Stack>
                                </Box>

                                <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', maxHeight: '50vh', overflowY: 'auto' }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead sx={{ bgcolor: 'slate.50' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', width: 80 }}>Item</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'slate.100' }}>Previous</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'indigo.50' }}>Current Qty</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Upto-Date</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(ipcForm.items || []).filter(item => item.uptoDateQuantity > 0 || item.currentQuantity > 0).map((item) => (
                                                <TableRow key={item.id} hover>
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>{item.itemNo}</TableCell>
                                                    <TableCell><Typography variant="caption" sx={{ fontWeight: 500 }}>{item.description.slice(0, 60)}...</Typography></TableCell>
                                                    <TableCell>{item.unit}</TableCell>
                                                    <TableCell align="right">{item.rate.toLocaleString()}</TableCell>
                                                    <TableCell align="right" sx={{ bgcolor: 'slate.50/30' }}>{item.previousQuantity.toLocaleString()}</TableCell>
                                                    <TableCell align="right" sx={{ bgcolor: 'indigo.50/30' }}>
                                                        <TextField 
                                                            size="small" 
                                                            type="number"
                                                            value={item.currentQuantity}
                                                            onChange={(e) => handleItemQtyChange(item.boqItemId, Number(e.target.value))}
                                                            sx={{ 
                                                                width: 90, 
                                                                '& .MuiInputBase-input': { 
                                                                    fontSize: '0.85rem', 
                                                                    py: 0.5, 
                                                                    textAlign: 'right',
                                                                    fontWeight: 'bold',
                                                                    color: 'indigo.700'
                                                                } 
                                                            }}
                                                            variant="standard"
                                                            InputProps={{ disableUnderline: true }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" fontWeight="bold" color={item.uptoDateQuantity > item.contractQuantity ? 'error.main' : 'text.primary'}>
                                                            {item.uptoDateQuantity.toLocaleString()}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{item.currentAmount.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Paper>

                                <Box display="flex" gap={3}>
                                    <Paper variant="outlined" sx={{ flex: 1, p: 3, borderRadius: 3 }}>
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom display="block">IPC HEADER INFO</Typography>
                                        {/* Fix: Replaced deprecated Grid props with v6 size prop */}
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}><TextField fullWidth label="IPC Reference #" value={ipcForm.billNumber} onChange={e => setIpcForm({...ipcForm, billNumber: e.target.value})} size="small" /></Grid>
                                            <Grid item xs={6}><TextField fullWidth label="Billing Date" type="date" InputLabelProps={{shrink:true}} value={ipcForm.date} onChange={e => setIpcForm({...ipcForm, date: e.target.value})} size="small" /></Grid>
                                        </Grid>
                                    </Paper>
                                    <Paper variant="outlined" sx={{ width: 400, p: 3, borderRadius: 3, bgcolor: 'indigo.900', color: 'white' }}>
                                        <Stack spacing={1.5}>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>Current Gross Work:</Typography>
                                                <Typography variant="body2" fontWeight="bold">{currency}{currentIpcSummary.billAmountGross.toLocaleString()}</Typography>
                                            </Box>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>VAT (13%):</Typography>
                                                <Typography variant="body2" fontWeight="bold">{currency}{currentIpcSummary.vatAmount.toLocaleString()}</Typography>
                                            </Box>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>Retention (5%):</Typography>
                                                <Typography variant="body2" fontWeight="bold">-{currency}{currentIpcSummary.retentionAmount.toLocaleString()}</Typography>
                                            </Box>
                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                                            <Box display="flex" justifyContent="space-between" pt={1}>
                                                <Typography variant="subtitle1" fontWeight="900">NET PAYABLE:</Typography>
                                                <Typography variant="subtitle1" fontWeight="900" color="success.light">{currency}{currentIpcSummary.totalAmountPayable.toLocaleString()}</Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Box>

                                <Box textAlign="right" gap={2} display="flex" justifyContent="flex-end" pt={2}>
                                    <Button variant="outlined" startIcon={<ArrowLeft size={18}/>} onClick={() => setCreateStep(0)} sx={{ borderRadius: 2 }}>Back to Selection</Button>
                                    <Button variant="contained" onClick={handleSaveIPC} startIcon={<CheckCircle2 size={18}/>} sx={{ px: 4, borderRadius: 2 }}>Issue Certificate Draft</Button>
                                </Box>
                            </Stack>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Create Subcontractor Bill Dialog */}
            <Dialog 
                open={isSubcontractorBillModalOpen} 
                onClose={() => setIsSubcontractorBillModalOpen(false)} 
                maxWidth="lg" 
                fullWidth 
                PaperProps={{ sx: { borderRadius: 4, height: '90vh' } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <FileCheck className="text-amber-600" />
                        <Typography variant="h6">Prepare New Subcontractor Bill (Bill No. {subcontractorBillForm.billNumber})</Typography>
                    </Box>
                    <IconButton onClick={() => setIsSubcontractorBillModalOpen(false)}><X/></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
                    <Box sx={{ p: 4 }}>
                        {subcontractorBillCreateStep === 0 && (
                            <Stack spacing={3}>
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    Select subcontractor and time period, then choose work logs to include in the bill.
                                </Alert>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField 
                                            label="Bill Number" 
                                            fullWidth 
                                            value={subcontractorBillForm.billNumber} 
                                            onChange={e => setSubcontractorBillForm({...subcontractorBillForm, billNumber: e.target.value})} 
                                            size="small" 
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField 
                                            label="Bill Date" 
                                            type="date" 
                                            fullWidth 
                                            InputLabelProps={{shrink: true}} 
                                            value={subcontractorBillForm.date} 
                                            onChange={e => setSubcontractorBillForm({...subcontractorBillForm, date: e.target.value})} 
                                            size="small" 
                                        />
                                    </Grid>
                                </Grid>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField 
                                            label="Period From" 
                                            type="date" 
                                            fullWidth 
                                            InputLabelProps={{shrink: true}} 
                                            value={subcontractorBillForm.periodFrom} 
                                            onChange={e => setSubcontractorBillForm({...subcontractorBillForm, periodFrom: e.target.value})} 
                                            size="small" 
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField 
                                            label="Period To" 
                                            type="date" 
                                            fullWidth 
                                            InputLabelProps={{shrink: true}} 
                                            value={subcontractorBillForm.periodTo} 
                                            onChange={e => setSubcontractorBillForm({...subcontractorBillForm, periodTo: e.target.value})} 
                                            size="small" 
                                        />
                                    </Grid>
                                </Grid>
                                
                                <FormControl fullWidth>
                                    <InputLabel>Subcontractor</InputLabel>
                                    <Select
                                        value={subcontractorBillForm.subcontractorId || ''}
                                        label="Subcontractor"
                                        onChange={(e) => {
                                            setSubcontractorBillForm({...subcontractorBillForm, subcontractorId: e.target.value});
                                            // Also reset selected work logs when subcontractor changes
                                            setSelectedSubcontractorWorkIds(new Set());
                                        }}
                                    >
                                        {project.agencies?.filter(a => a.type === 'subcontractor').map(sub => (
                                            <MenuItem key={sub.id} value={sub.id}>{sub.name} ({sub.trade})</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                
                                <Typography variant="subtitle1" fontWeight="bold">Available Work Logs</Typography>
                                <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: 'slate.50' }}>
                                            <TableRow>
                                                <TableCell padding="checkbox"></TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>BOQ Item</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Component</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {getSubcontractorWorkLogs(subcontractorBillForm.subcontractorId || '').map(log => {
                                                // Find the structure and component for this log
                                                let structureName = 'Unknown';
                                                let componentName = 'Unknown';
                                                
                                                if (project.structures) {
                                                    for (const structure of project.structures) {
                                                        for (const component of structure.components) {
                                                            if (component.workLogs?.some(wl => wl.id === log.id)) {
                                                                structureName = structure.name;
                                                                componentName = component.name;
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }
                                                
                                                const boqItem = project.boq.find(b => b.id === log.boqItemId);
                                                return (
                                                    <TableRow key={log.id} hover onClick={() => {
                                                        const next = new Set(selectedSubcontractorWorkIds);
                                                        if (next.has(log.id)) next.delete(log.id);
                                                        else next.add(log.id);
                                                        setSelectedSubcontractorWorkIds(next);
                                                    }} sx={{ cursor: 'pointer' }}>
                                                        <TableCell padding="checkbox"><Checkbox checked={selectedSubcontractorWorkIds.has(log.id)} size="small" /></TableCell>
                                                        <TableCell>{log.date}</TableCell>
                                                        <TableCell>{boqItem ? `[${boqItem.itemNo}] ${boqItem.description.substring(0, 30)}...` : 'N/A'}</TableCell>
                                                        <TableCell>{componentName}</TableCell>
                                                        <TableCell>{log.quantity}</TableCell>
                                                        <TableCell>{boqItem?.unit || 'N/A'}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {getSubcontractorWorkLogs(subcontractorBillForm.subcontractorId || '').length === 0 && (
                                                <TableRow>
                                                    <TableCell align="center" {...{ colSpan: 6 }} sx={{ py: 6 }}>
                                                        No work logs found for this subcontractor in the project.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Paper>
                                <Box textAlign="right">
                                    <Button 
                                        variant="contained" 
                                        disabled={selectedSubcontractorWorkIds.size === 0} 
                                        onClick={generateSubcontractorBillItemsFromWorkLogs} 
                                        endIcon={<ArrowRight size={18}/>} 
                                        sx={{ px: 4, py: 1.2, borderRadius: 2 }}
                                    >
                                        Generate Bill Items
                                    </Button>
                                </Box>
                            </Stack>
                        )}
                        {subcontractorBillCreateStep === 1 && (
                            <Stack spacing={3}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="900" color="primary">Review & Adjust Bill Quantities</Typography>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography variant="caption" fontWeight="bold">BILL TOTAL:</Typography>
                                        <Typography variant="h6" fontWeight="900" color="amber.700">{currency}{currentSubcontractorBillSummary.grossAmount.toLocaleString()}</Typography>
                                    </Stack>
                                </Box>

                                <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', maxHeight: '50vh', overflowY: 'auto' }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead sx={{ bgcolor: 'slate.50' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', width: 80 }}>Item</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'amber.50' }}>Current Qty</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(subcontractorBillForm.items || []).map((item) => (
                                                <TableRow key={item.id} hover>
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>{item.itemNo}</TableCell>
                                                    <TableCell><Typography variant="caption" sx={{ fontWeight: 500 }}>{item.description.slice(0, 60)}...</Typography></TableCell>
                                                    <TableCell>{item.unit}</TableCell>
                                                    <TableCell align="right">{item.rate.toLocaleString()}</TableCell>
                                                    <TableCell align="right" sx={{ bgcolor: 'amber.50/30' }}>
                                                        <TextField 
                                                            size="small" 
                                                            type="number" 
                                                            value={item.currentQuantity}
                                                            onChange={(e) => handleSubcontractorBillItemQtyChange(item.boqItemId, Number(e.target.value))}
                                                            sx={{ 
                                                                width: 90, 
                                                                '& .MuiInputBase-input': { 
                                                                    fontSize: '0.85rem', 
                                                                    py: 0.5, 
                                                                    textAlign: 'right',
                                                                    fontWeight: 'bold',
                                                                    color: 'amber.700'
                                                                } 
                                                            }}
                                                            variant="standard"
                                                            InputProps={{ disableUnderline: true }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{item.currentAmount.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Paper>

                                <Box display="flex" gap={3}>
                                    <Paper variant="outlined" sx={{ flex: 1, p: 3, borderRadius: 3 }}>
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom display="block">BILL SETTINGS</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <TextField 
                                                    label="Retention %" 
                                                    type="number" 
                                                    fullWidth 
                                                    value={subcontractorBillForm.retentionPercent} 
                                                    onChange={e => setSubcontractorBillForm({...subcontractorBillForm, retentionPercent: Number(e.target.value)})} 
                                                    size="small" 
                                                />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                    <Paper variant="outlined" sx={{ width: 400, p: 3, borderRadius: 3, bgcolor: 'amber.900', color: 'white' }}>
                                        <Stack spacing={1.5}>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>Gross Amount:</Typography>
                                                <Typography variant="body2" fontWeight="bold">{currency}{currentSubcontractorBillSummary.grossAmount.toLocaleString()}</Typography>
                                            </Box>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>Retention ({subcontractorBillForm.retentionPercent}%):</Typography>
                                                <Typography variant="body2" fontWeight="bold">-{currency}{currentSubcontractorBillSummary.retentionAmount.toLocaleString()}</Typography>
                                            </Box>
                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                                            <Box display="flex" justifyContent="space-between" pt={1}>
                                                <Typography variant="subtitle1" fontWeight="900">NET PAYABLE:</Typography>
                                                <Typography variant="subtitle1" fontWeight="900" color="success.light">{currency}{currentSubcontractorBillSummary.netAmount.toLocaleString()}</Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Box>

                                <Box textAlign="right" gap={2} display="flex" justifyContent="flex-end" pt={2}>
                                    <Button variant="outlined" startIcon={<ArrowLeft size={18}/>} onClick={() => setSubcontractorBillCreateStep(0)} sx={{ borderRadius: 2 }}>Back to Selection</Button>
                                    <Button variant="contained" onClick={handleSaveSubcontractorBill} startIcon={<CheckCircle2 size={18}/>} sx={{ px: 4, borderRadius: 2 }}>Issue Bill Draft</Button>
                                </Box>
                            </Stack>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Print Preview Dialog */}
            <Dialog open={printPreviewOpen} onClose={() => setPrintPreviewOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold">Interim Payment Certificate - Print Layout</Typography>
                    <IconButton onClick={() => setPrintPreviewOpen(false)}><X/></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 4, bgcolor: 'slate.100' }}>
                    <Paper sx={{ p: 8, width: '210mm', mx: 'auto', minHeight: '297mm', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <Typography align="center" variant="h5" fontWeight="bold" gutterBottom>DEPARTMENT OF ROADS</Typography>
                        <Typography align="center" variant="subtitle1" sx={{ textTransform: 'uppercase', mb: 4 }}>Interim Payment Certificate (IPC)</Typography>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="body2">Simulation of DoR Format... Content derived from ID: {selectedIpcId}</Typography>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setPrintPreviewOpen(false)}>Close</Button>
                    <Button variant="contained" startIcon={<Printer/>}>Print PDF</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BillingModule;
