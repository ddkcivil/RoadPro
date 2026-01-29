import React, { useState, useMemo } from 'react';
import { 
    Box, Typography, Button, Grid, Card, CardContent, Stack,
    Paper, Tabs, Tab, Divider, List, ListItem, ListItemText, 
    ListItemIcon, Chip, Avatar, Tooltip, Alert, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, LinearProgress,
    IconButton, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { 
    Receipt, FileText, DollarSign, TrendingUp, AlertTriangle, CheckCircle, 
    Plus, Edit, Trash2, Filter, Search, X, Save, Calendar, 
    Users, CreditCard, FileSpreadsheet, PieChart
} from 'lucide-react';
import { Project, UserRole, ContractBill, SubcontractorBill, AgencyPayment, AgencyBill } from '../../types';
import { formatCurrency } from '../../utils/formatting/exportUtils';

interface Props {
    project: Project;
    userRole: UserRole;
    onProjectUpdate: (project: Project) => void;
}

const FinancialsCommercialHub: React.FC<Props> = ({ project, onProjectUpdate, userRole }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<ContractBill | SubcontractorBill | null>(null);
    const [editingBillId, setEditingBillId] = useState<string | null>(null);
    
    // Bill states
    const [billForm, setBillForm] = useState<Partial<ContractBill>>({
        billNumber: '',
        date: new Date().toISOString().split('T')[0],
        periodFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        periodTo: new Date().toISOString().split('T')[0],
        items: [],
        grossAmount: 0,
        netAmount: 0,
        retentionPercent: 10,
        status: 'Draft'
    });
    const [editingBillType, setEditingBillType] = useState<'contract' | 'subcontractor' | null>(null);
    
    const contractBills = project.contractBills || [];
    const subcontractorBills = project.subcontractorBills || [];
    const agencyPayments = project.agencyPayments || [];
    const agencyBills = project.agencyBills || [];

    // Stats calculations
    const financialStats = useMemo(() => {
        const totalContractBills = contractBills.reduce((sum, bill) => sum + bill.netAmount, 0);
        const totalSubcontractorBills = subcontractorBills.reduce((sum, bill) => sum + bill.netAmount, 0);
        const totalAgencyPayments = agencyPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const pendingBills = [...contractBills, ...subcontractorBills].filter(b => b.status === 'Submitted').length;
        const approvedBills = [...contractBills, ...subcontractorBills].filter(b => b.status === 'Approved').length;
        const paidBills = [...contractBills, ...subcontractorBills].filter(b => b.status === 'Paid').length;
        
        return { 
            totalContractBills, 
            totalSubcontractorBills, 
            totalAgencyPayments,
            pendingBills,
            approvedBills,
            paidBills
        };
    }, [contractBills, subcontractorBills, agencyPayments]);

    // Filter functions
    const filteredContractBills = useMemo(() => {
        return contractBills.filter(bill => 
            bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [contractBills, searchTerm]);

    const filteredSubcontractorBills = useMemo(() => {
        return subcontractorBills.filter(bill => 
            bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [subcontractorBills, searchTerm]);

    const filteredAgencyPayments = useMemo(() => {
        return agencyPayments.filter(payment => 
            payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [agencyPayments, searchTerm]);

    // Bill functions
    const handleAddBill = (type: 'contract' | 'subcontractor') => {
        setBillForm({
            billNumber: `BILL-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            periodFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            periodTo: new Date().toISOString().split('T')[0],
            items: [],
            grossAmount: 0,
            netAmount: 0,
            retentionPercent: 10,
            status: 'Draft',
            description: ''
        });
        setEditingBillId(null);
        setEditingBillType(type);
        setIsBillModalOpen(true);
    };

    const handleEditBill = (bill: ContractBill | SubcontractorBill, type: 'contract' | 'subcontractor') => {
        setBillForm(bill as Partial<ContractBill>);
        setEditingBillId(bill.id);
        setEditingBillType(type);
        setIsBillModalOpen(true);
    };

    const handleDeleteBill = (billId: string, type: 'contract' | 'subcontractor') => {
        if (!window.confirm('Are you sure you want to delete this bill?')) return;
        
        if (type === 'contract') {
            const updatedBills = contractBills.filter(bill => bill.id !== billId);
            onProjectUpdate({
                ...project,
                contractBills: updatedBills
            });
        } else {
            const updatedBills = subcontractorBills.filter(bill => bill.id !== billId);
            onProjectUpdate({
                ...project,
                subcontractorBills: updatedBills
            });
        }
    };

    const handleSaveBill = () => {
        if (!billForm.billNumber?.trim()) {
            alert('Bill number is required');
            return;
        }

        if (editingBillType === 'contract') {
            if (editingBillId) {
                // Update existing contract bill
                const updatedBills = contractBills.map(bill => 
                    bill.id === editingBillId ? { ...bill, ...billForm, billNumber: billForm.billNumber || bill.billNumber, subcontractorId: (billForm as any).subcontractorId || (bill as any).subcontractorId } as ContractBill : bill
                );
                
                onProjectUpdate({
                    ...project,
                    contractBills: updatedBills
                });
            } else {
                // Add new contract bill
                const newBill: ContractBill = {
                    id: `bill-${Date.now()}`,
                    billNumber: billForm.billNumber || `BILL-${Date.now()}`,
                    date: billForm.date || new Date().toISOString().split('T')[0],
                    periodFrom: billForm.periodFrom || new Date().toISOString().split('T')[0],
                    periodTo: billForm.periodTo || new Date().toISOString().split('T')[0],
                    grossAmount: billForm.grossAmount || 0,
                    retentionPercent: billForm.retentionPercent || 10,
                    netAmount: billForm.netAmount || 0,
                    status: billForm.status || 'Draft',
                    description: billForm.description || '',
                    items: billForm.items || [],
                    provisionalSum: billForm.provisionalSum || 0,
                    cpaAmount: billForm.cpaAmount || 0,
                    liquidatedDamages: billForm.liquidatedDamages || 0
                };
                
                onProjectUpdate({
                    ...project,
                    contractBills: [...contractBills, newBill]
                });
            }
        } else {
            if (editingBillId) {
                // Update existing subcontractor bill
                const updatedBills = subcontractorBills.map(bill => 
                    bill.id === editingBillId ? { ...bill, ...billForm, billNumber: billForm.billNumber || bill.billNumber, subcontractorId: (billForm as any).subcontractorId || bill.subcontractorId } as SubcontractorBill : bill
                );
                
                onProjectUpdate({
                    ...project,
                    subcontractorBills: updatedBills
                });
            } else {
                // Add new subcontractor bill
                const newBill: SubcontractorBill = {
                    id: `sub-bill-${Date.now()}`,
                    billNumber: billForm.billNumber || `SCB-${Date.now()}`,
                    date: billForm.date || new Date().toISOString().split('T')[0],
                    periodFrom: billForm.periodFrom || new Date().toISOString().split('T')[0],
                    periodTo: billForm.periodTo || new Date().toISOString().split('T')[0],
                    subcontractorId: (billForm as any).subcontractorId || '',
                    grossAmount: billForm.grossAmount || 0,
                    netAmount: billForm.netAmount || 0,
                    retentionPercent: billForm.retentionPercent || 10,
                    status: billForm.status || 'Draft',
                    description: billForm.description || '',
                    items: billForm.items || []
                };
                
                onProjectUpdate({
                    ...project,
                    subcontractorBills: [...subcontractorBills, newBill]
                });
            }
        }
        
        setIsBillModalOpen(false);
        setBillForm({
            billNumber: '',
            date: new Date().toISOString().split('T')[0],
            periodFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            periodTo: new Date().toISOString().split('T')[0],
            items: [],
            grossAmount: 0,
            netAmount: 0,
            retentionPercent: 10,
            status: 'Draft'
        });
        setEditingBillId(null);
        setEditingBillType(null);
    };

    return (
        <Box className="animate-in fade-in duration-500">
            <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                <Box>
                    <Typography variant="caption" fontWeight="900" color="primary" sx={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}>FINANCIALS & COMMERCIAL</Typography>
                    <Typography variant="h4" fontWeight="900">Financials & Commercial Hub</Typography>
                    <Typography variant="body2" color="text.secondary">Centralized management for bills, payments, and commercial transactions</Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                    <Button variant="outlined" startIcon={<FileSpreadsheet size={16}/>} sx={{ borderRadius: 2, paddingX: 1.5, paddingY: 0.75 }}>Financial Reports</Button>
                    <Button variant="contained" startIcon={<Plus size={16}/>} sx={{ borderRadius: 2, paddingX: 1.5, paddingY: 0.75 }} onClick={() => handleAddBill(activeTab === 0 ? 'contract' : 'subcontractor')}>
                        Add {activeTab === 0 ? 'Contract' : activeTab === 1 ? 'Subcontractor' : 'Agency'} Bill
                    </Button>
                </Stack>
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', mb: 2 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(_, v) => setActiveTab(v)} 
                    sx={{ bgcolor: 'slate.50', borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Contract Bills" icon={<Receipt size={18}/>} iconPosition="start" />
                    <Tab label="Subcontractor Bills" icon={<Users size={18}/>} iconPosition="start" />
                    <Tab label="Agency Payments" icon={<CreditCard size={18}/>} iconPosition="start" />
                    <Tab label="Financial Overview" icon={<PieChart size={18}/>} iconPosition="start" />
                </Tabs>

                <Box p={2}>
                    {/* CONTRACT BILLS TAB */}
                    {activeTab === 0 && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
                                <TextField 
                                    size="small" 
                                    placeholder="Search contract bills..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)}
                                    sx={{ width: 400, bgcolor: 'white' }}
                                    InputProps={{ startAdornment: <Search size={16} className="text-slate-400 mr-2"/> }}
                                />
                                <Button variant="outlined" startIcon={<Filter size={14}/>}>Filter Bills</Button>
                            </Box>

                            <Grid container spacing={2} mb={3}>
                                <Grid item xs={12} md={3}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #10b981', bgcolor: 'emerald.50/10' }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">TOTAL BILLED</Typography>
                                                <DollarSign size={16} className="text-emerald-600"/>
                                            </Box>
                                            <Typography variant="h5" fontWeight="900" color="success.main">{formatCurrency(financialStats.totalContractBills)}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #f59e0b' }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">PENDING</Typography>
                                                <AlertTriangle size={16} className="text-amber-600"/>
                                            </Box>
                                            <Typography variant="h5" fontWeight="900" color="warning.main">{financialStats.pendingBills}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #6366f1' }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">APPROVED</Typography>
                                                <CheckCircle size={16} className="text-indigo-600"/>
                                            </Box>
                                            <Typography variant="h5" fontWeight="900" color="primary.main">{financialStats.approvedBills}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #8b5cf6' }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">PAID</Typography>
                                                <TrendingUp size={16} className="text-violet-600"/>
                                            </Box>
                                            <Typography variant="h5" fontWeight="900" color="secondary.main">{financialStats.paidBills}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: 'slate.50' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Bill Number</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Period</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Gross Amount</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Net Amount</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredContractBills.map(bill => (
                                            <TableRow key={bill.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="bold">{bill.billNumber}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{bill.date}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{bill.periodFrom} to {bill.periodTo}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight="900">{formatCurrency(bill.grossAmount)}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight="900">{formatCurrency(bill.netAmount)}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip 
                                                        label={bill.status} 
                                                        size="small" 
                                                        color={
                                                            bill.status === 'Paid' ? 'success' :
                                                            bill.status === 'Approved' ? 'primary' :
                                                            bill.status === 'Submitted' ? 'warning' : 'default'
                                                        }
                                                        sx={{ fontWeight: 'bold', fontSize: 10 }} 
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => handleEditBill(bill, 'contract')}>
                                                            <Edit size={16}/>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteBill(bill.id, 'contract')}>
                                                            <Trash2 size={16}/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {filteredContractBills.length === 0 && (
                                    <Box py={8} textAlign="center" border="1px dashed #e2e8f0" borderRadius={4}>
                                        <Receipt size={48} className="text-slate-200 mx-auto mb-2"/>
                                        <Typography color="text.secondary">No contract bills registered.</Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    )}

                    {/* SUBCONTRACTOR BILLS TAB */}
                    {activeTab === 1 && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
                                <TextField 
                                    size="small" 
                                    placeholder="Search subcontractor bills..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)}
                                    sx={{ width: 400, bgcolor: 'white' }}
                                    InputProps={{ startAdornment: <Search size={16} className="text-slate-400 mr-2"/> }}
                                />
                                <Button variant="outlined" startIcon={<Filter size={14}/>}>Filter Bills</Button>
                            </Box>

                            <Grid container spacing={2} mb={3}>
                                <Grid item xs={12} md={3}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #10b981', bgcolor: 'emerald.50/10' }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">TOTAL BILLED</Typography>
                                                <DollarSign size={16} className="text-emerald-600"/>
                                            </Box>
                                            <Typography variant="h5" fontWeight="900" color="success.main">{formatCurrency(financialStats.totalSubcontractorBills)}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #f59e0b' }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">PENDING</Typography>
                                                <AlertTriangle size={16} className="text-amber-600"/>
                                            </Box>
                                            <Typography variant="h5" fontWeight="900" color="warning.main">{financialStats.pendingBills}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #6366f1' }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">APPROVED</Typography>
                                                <CheckCircle size={16} className="text-indigo-600"/>
                                            </Box>
                                            <Typography variant="h5" fontWeight="900" color="primary.main">{financialStats.approvedBills}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #8b5cf6' }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">PAID</Typography>
                                                <TrendingUp size={16} className="text-violet-600"/>
                                            </Box>
                                            <Typography variant="h5" fontWeight="900" color="secondary.main">{financialStats.paidBills}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: 'slate.50' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Bill Number</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Subcontractor</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Period</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Net Amount</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredSubcontractorBills.map(bill => (
                                            <TableRow key={bill.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="bold">{bill.billNumber}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{bill.date}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {project.agencies?.find(a => a.id === bill.subcontractorId)?.name || 'Unknown'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{bill.periodFrom} to {bill.periodTo}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight="900">{formatCurrency(bill.netAmount)}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip 
                                                        label={bill.status} 
                                                        size="small" 
                                                        color={
                                                            bill.status === 'Paid' ? 'success' :
                                                            bill.status === 'Approved' ? 'primary' :
                                                            bill.status === 'Submitted' ? 'warning' : 'default'
                                                        }
                                                        sx={{ fontWeight: 'bold', fontSize: 10 }} 
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => handleEditBill(bill, 'subcontractor')}>
                                                            <Edit size={16}/>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteBill(bill.id, 'subcontractor')}>
                                                            <Trash2 size={16}/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {filteredSubcontractorBills.length === 0 && (
                                    <Box py={8} textAlign="center" border="1px dashed #e2e8f0" borderRadius={4}>
                                        <Users size={48} className="text-slate-200 mx-auto mb-2"/>
                                        <Typography color="text.secondary">No subcontractor bills registered.</Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    )}

                    {/* AGENCY PAYMENTS TAB */}
                    {activeTab === 2 && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
                                <TextField 
                                    size="small" 
                                    placeholder="Search agency payments..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)}
                                    sx={{ width: 400, bgcolor: 'white' }}
                                    InputProps={{ startAdornment: <Search size={16} className="text-slate-400 mr-2"/> }}
                                />
                                <Button variant="outlined" startIcon={<Filter size={14}/>}>Filter Payments</Button>
                            </Box>

                            <Grid container spacing={2} mb={3}>
                                <Grid item xs={12} md={3}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #10b981', bgcolor: 'emerald.50/10' }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">TOTAL PAID</Typography>
                                                <DollarSign size={16} className="text-emerald-600"/>
                                            </Box>
                                            <Typography variant="h5" fontWeight="900" color="success.main">{formatCurrency(financialStats.totalAgencyPayments)}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #f59e0b' }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">AGENCIES</Typography>
                                                <Users size={16} className="text-amber-600"/>
                                            </Box>
                                            <Typography variant="h5" fontWeight="900" color="warning.main">{project.agencies?.length || 0}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #6366f1' }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">PAYMENT TYPES</Typography>
                                                <CreditCard size={16} className="text-indigo-600"/>
                                            </Box>
                                            <Typography variant="h5" fontWeight="900" color="primary.main">{[...new Set(agencyPayments.map(p => p.type))].length}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #8b5cf6' }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" fontWeight="bold" color="text.secondary">AVG. PAYMENT</Typography>
                                                <TrendingUp size={16} className="text-violet-600"/>
                                            </Box>
                                            <Typography variant="h5" fontWeight="900" color="secondary.main">
                                                {agencyPayments.length > 0 
                                                    ? formatCurrency(agencyPayments.reduce((sum, p) => sum + p.amount, 0) / agencyPayments.length) 
                                                    : '$0'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: 'slate.50' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Reference</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Agency</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredAgencyPayments.map(payment => (
                                            <TableRow key={payment.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="bold">{payment.reference}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{payment.description}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {project.agencies?.find(a => a.id === payment.agencyId)?.name || 'Unknown'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{payment.type}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{payment.date}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight="900">{formatCurrency(payment.amount)}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip 
                                                        label={payment.status || 'Confirmed'} 
                                                        size="small" 
                                                        color="primary"
                                                        sx={{ fontWeight: 'bold', fontSize: 10 }} 
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {filteredAgencyPayments.length === 0 && (
                                    <Box py={8} textAlign="center" border="1px dashed #e2e8f0" borderRadius={4}>
                                        <CreditCard size={48} className="text-slate-200 mx-auto mb-2"/>
                                        <Typography color="text.secondary">No agency payments registered.</Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    )}

                    {/* FINANCIAL OVERVIEW TAB */}
                    {activeTab === 3 && (
                        <Box>
                            <Grid container spacing={3} mb={3}>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" fontWeight="bold" gutterBottom>Revenue & Expenditure</Typography>
                                            <Box display="flex" justifyContent="space-between" mb={2}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                                                    <Typography variant="h5" fontWeight="900" color="success.main">{formatCurrency(financialStats.totalContractBills)}</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Total Expenses</Typography>
                                                    <Typography variant="h5" fontWeight="900" color="error.main">{formatCurrency(financialStats.totalSubcontractorBills + financialStats.totalAgencyPayments)}</Typography>
                                                </Box>
                                            </Box>
                                            <Divider sx={{ my: 2 }} />
                                            <Box display="flex" justifyContent="space-between">
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Net Position</Typography>
                                                    <Typography variant="h5" fontWeight="900" color={financialStats.totalContractBills >= (financialStats.totalSubcontractorBills + financialStats.totalAgencyPayments) ? 'success.main' : 'error.main'}>
                                                        {formatCurrency(financialStats.totalContractBills - (financialStats.totalSubcontractorBills + financialStats.totalAgencyPayments))}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Margin</Typography>
                                                    <Typography variant="h5" fontWeight="900" color={financialStats.totalContractBills >= (financialStats.totalSubcontractorBills + financialStats.totalAgencyPayments) ? 'success.main' : 'error.main'}>
                                                        {financialStats.totalContractBills > 0 
                                                            ? `${(((financialStats.totalContractBills - (financialStats.totalSubcontractorBills + financialStats.totalAgencyPayments)) / financialStats.totalContractBills) * 100).toFixed(1)}%` 
                                                            : '0%'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" fontWeight="bold" gutterBottom>Cash Flow Status</Typography>
                                            <List>
                                                <ListItem>
                                                    <ListItemIcon><Receipt size={16} className="text-emerald-600"/></ListItemIcon>
                                                    <ListItemText primary="Outstanding Receivables" secondary={formatCurrency(contractBills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + b.netAmount, 0))} />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemIcon><Users size={16} className="text-amber-600"/></ListItemIcon>
                                                    <ListItemText primary="Outstanding Payables" secondary={formatCurrency(subcontractorBills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + b.netAmount, 0))} />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemIcon><CreditCard size={16} className="text-indigo-600"/></ListItemIcon>
                                                    <ListItemText primary="Pending Agency Payments" secondary={formatCurrency(agencyPayments.length)} />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemIcon><DollarSign size={16} className="text-violet-600"/></ListItemIcon>
                                                    <ListItemText primary="Available Budget" secondary={formatCurrency(1000000 - financialStats.totalContractBills)} /> {/* Placeholder calculation */}
                                                </ListItem>
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>Financial Summary</Typography>
                                    <Alert severity="info" icon={<FileText />}>
                                        This financial hub consolidates all commercial transactions for the project. Track contract bills, subcontractor payments, and agency expenses in one place.
                                    </Alert>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* BILL MODAL */}
            <Dialog open={isBillModalOpen} onClose={() => setIsBillModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Receipt className="text-indigo-600" /> {editingBillId ? 'Edit Bill' : 'Add New Bill'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} mt={3}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField fullWidth label="Bill Number" value={billForm.billNumber} onChange={e => setBillForm({...billForm, billNumber: e.target.value})} size="small" required /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Date" type="date" value={billForm.date} onChange={e => setBillForm({...billForm, date: e.target.value})} size="small" InputLabelProps={{ shrink: true }} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Period From" type="date" value={billForm.periodFrom} onChange={e => setBillForm({...billForm, periodFrom: e.target.value})} size="small" InputLabelProps={{ shrink: true }} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Period To" type="date" value={billForm.periodTo} onChange={e => setBillForm({...billForm, periodTo: e.target.value})} size="small" InputLabelProps={{ shrink: true }} /></Grid>
                            <Grid item xs={12}><TextField fullWidth label="Description" value={billForm.description || ''} onChange={e => setBillForm({...billForm, description: e.target.value})} size="small" multiline rows={2} /></Grid>
                            
                            {editingBillType === 'subcontractor' && (
                                <Grid item xs={12}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Subcontractor</InputLabel>
                                        <Select
                                            value={(billForm as any).subcontractorId || ''}
                                            onChange={e => setBillForm({...billForm, subcontractorId: e.target.value} as any)}
                                            label="Subcontractor"
                                        >
                                            {project.agencies?.filter(a => a.type === 'subcontractor').map(agency => (
                                                <MenuItem key={agency.id} value={agency.id}>{agency.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                            
                            <Grid item xs={4}><TextField fullWidth label="Gross Amount" type="number" value={billForm.grossAmount} onChange={e => setBillForm({...billForm, grossAmount: Number(e.target.value)})} size="small" /></Grid>
                            <Grid item xs={4}><TextField fullWidth label="Retention %" type="number" value={billForm.retentionPercent} onChange={e => setBillForm({...billForm, retentionPercent: Number(e.target.value)})} size="small" /></Grid>
                            <Grid item xs={4}><TextField fullWidth label="Net Amount" type="number" value={billForm.netAmount} onChange={e => setBillForm({...billForm, netAmount: Number(e.target.value)})} size="small" /></Grid>
                            
                            <Grid item xs={12}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={billForm.status || 'Draft'}
                                        onChange={e => setBillForm({...billForm, status: e.target.value as any})}
                                        label="Status"
                                    >
                                        <MenuItem value="Draft">Draft</MenuItem>
                                        <MenuItem value="Submitted">Submitted</MenuItem>
                                        <MenuItem value="Approved">Approved</MenuItem>
                                        <MenuItem value="Paid">Paid</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
                    <Button onClick={() => setIsBillModalOpen(false)} startIcon={<X />}>Cancel</Button>
                    <Button variant="contained" startIcon={<Save />} onClick={handleSaveBill}>
                        {editingBillId ? 'Update Bill' : 'Add Bill'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FinancialsCommercialHub;