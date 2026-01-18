import React, { useState, useMemo } from 'react';
import { Project, UserRole, Agency, Subcontractor, SubcontractorPayment, BOQItem, AgencyRateEntry, SubcontractorRateEntry, AppSettings } from '../types';
import { 
  Box, Typography, Button, Card, Grid, 
  Avatar, Chip, Stack, Paper, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Divider,
  LinearProgress, Table, TableHead, TableRow, TableCell, TableBody,
  InputAdornment, Tabs, Tab, Alert, IconButton, List, ListItem, ListItemText,
  Snackbar, Tooltip
} from '@mui/material';
import { 
  Briefcase, FileText, Calendar, MapPin, TrendingUp, Clock, Activity, 
  Plus, Save, X, Edit, Trash2, CheckCircle2, Calculator, Package,
  DollarSign, Navigation, Eye, HelpCircle
} from 'lucide-react';
import { formatCurrency } from '../utils/exportUtils';
import { getCurrencySymbol } from '../utils/currencyUtils';

interface Props {
  project: Project;
  userRole: UserRole;
  settings?: AppSettings;
  onProjectUpdate: (project: Project) => void;
}

const SubcontractorModule: React.FC<Props> = ({ project, onProjectUpdate, userRole, settings }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSubcontractorModalOpen, setIsSubcontractorModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const subcontractors = project.agencies?.filter(a => a.type === 'subcontractor') || [];
  const subPayments = (project.agencyPayments || []).filter(p => p.agencyId && subcontractors.some(s => s.id === p.agencyId));
  
  const [newSubcontractor, setNewSubcontractor] = useState<Partial<Subcontractor>>({
    name: '',
    trade: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: 'Active',
    type: 'subcontractor',
    contractValue: 0,
    startDate: '',
    endDate: '',
    assignedWorks: [],
    assetCategories: [],
    certification: []
  });

  const [paymentForm, setPaymentForm] = useState<Partial<SubcontractorPayment>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    reference: '',
    type: 'Bill Payment',
    description: ''
  });

  const [rateForm, setRateForm] = useState<Partial<SubcontractorRateEntry>>({
    boqItemId: '',
    rate: 0,
    effectiveDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    description: ''
  });

  const selectedSubcontractor = subcontractors.find(s => s.id === selectedSubId);
  const selectedSubcontractorRates = selectedSubcontractor?.rates || [];

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleAddSubcontractor = () => {
    setNewSubcontractor({
      name: '',
      trade: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      status: 'Active',
      type: 'subcontractor'
    });
    setIsSubcontractorModalOpen(true);
  };

  const handleEditSubcontractor = (sub: Agency) => {
    setNewSubcontractor({
      id: sub.id,
      name: sub.name,
      trade: sub.trade,
      contactPerson: sub.contactPerson,
      phone: sub.phone,
      email: sub.email,
      address: sub.address,
      status: sub.status,
      type: 'subcontractor'
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteSubcontractor = (subId: string) => {
    if (window.confirm('Are you sure you want to delete this subcontractor? This will also delete all associated payments.')) {
      const updatedAgencies = project.agencies?.filter(a => a.id !== subId) || [];
      const updatedPayments = project.agencyPayments?.filter(p => p.agencyId !== subId) || [];
      
      onProjectUpdate({
        ...project,
        agencies: updatedAgencies,
        agencyPayments: updatedPayments
      });
      
      if (selectedSubId === subId) {
        setSelectedSubId(null);
      }
    }
  };

  const handleSaveSubcontractor = () => {
    // Validation
    if (!newSubcontractor.name?.trim()) {
      showSnackbar('Contractor name is required');
      return;
    }
    
    if (!newSubcontractor.trade?.trim()) {
      showSnackbar('Trade is required');
      return;
    }
    
    if (newSubcontractor.contractValue && newSubcontractor.contractValue < 0) {
      showSnackbar('Contract value must be a positive number');
      return;
    }
    
    if (newSubcontractor.phone && !/^[+]?[0-9\s\-]{8,}$/.test(newSubcontractor.phone)) {
      showSnackbar('Please enter a valid phone number');
      return;
    }
    
    if (newSubcontractor.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/.test(newSubcontractor.email)) {
      showSnackbar('Please enter a valid email address');
      return;
    }
    
    if (newSubcontractor.startDate && newSubcontractor.endDate && new Date(newSubcontractor.startDate) > new Date(newSubcontractor.endDate)) {
      showSnackbar('Start date cannot be later than end date');
      return;
    }

    if (selectedSubId) {
      // Update existing subcontractor
      const updatedAgencies = project.agencies?.map(a => 
        a.id === selectedSubId 
          ? { 
              ...a, 
              name: newSubcontractor.name || a.name,
              trade: newSubcontractor.trade || a.trade,
              contactPerson: newSubcontractor.contactPerson || a.contactPerson,
              phone: newSubcontractor.phone || a.phone,
              email: newSubcontractor.email || a.email,
              address: newSubcontractor.address || a.address,
              status: newSubcontractor.status || a.status,
              contractValue: newSubcontractor.contractValue ?? a.contractValue,
              startDate: newSubcontractor.startDate || a.startDate,
              endDate: newSubcontractor.endDate || a.endDate,
              type: 'subcontractor' as const,
              assignedWorks: newSubcontractor.assignedWorks,
              assetCategories: newSubcontractor.assetCategories,
              certification: newSubcontractor.certification
            } 
          : a
      ) || [];
      
      // If assigned works are specified, update the BOQ items to link them to the subcontractor
      let updatedProject = { ...project, agencies: updatedAgencies };
      if (newSubcontractor.assignedWorks && newSubcontractor.assignedWorks.length > 0) {
        // First, clear any existing subcontractor assignments for this subcontractor
        const clearedBoq = project.boq.map(item => 
          item.subcontractorId === selectedSubId ? { ...item, subcontractorId: undefined } : item
        );
        
        // Then assign the new works
        updatedProject = {
          ...project,
          agencies: updatedAgencies,
          boq: clearedBoq.map(item => 
            newSubcontractor.assignedWorks?.includes(item.id) 
              ? { ...item, subcontractorId: selectedSubId }
              : item
          )
        };
      }
      
      onProjectUpdate(updatedProject);
    } else {
      // Add new subcontractor
      const newSub: Agency = {
        id: `sub-${Date.now()}`,
        name: newSubcontractor.name!,
        trade: newSubcontractor.trade!,
        contactPerson: newSubcontractor.contactPerson || '',
        phone: newSubcontractor.phone || '',
        email: newSubcontractor.email || '',
        address: newSubcontractor.address || '',
        status: newSubcontractor.status || 'Active',
        type: 'subcontractor',
        contractValue: newSubcontractor.contractValue || 0,
        startDate: newSubcontractor.startDate || '',
        endDate: newSubcontractor.endDate || '',
        assignedWorks: newSubcontractor.assignedWorks,
        assetCategories: newSubcontractor.assetCategories,
        certification: newSubcontractor.certification
      };
      
      // If assigned works are specified, update the BOQ items to link them to the subcontractor
      let updatedProject = { ...project };
      if (newSubcontractor.assignedWorks && newSubcontractor.assignedWorks.length > 0) {
        updatedProject = {
          ...project,
          boq: project.boq.map(item => 
            newSubcontractor.assignedWorks?.includes(item.id) 
              ? { ...item, subcontractorId: newSub.id }
              : item
          )
        };
      }
      
      onProjectUpdate({
        ...updatedProject,
        agencies: [...(project.agencies || []), newSub]
      });
    }
    
    setIsSubcontractorModalOpen(false);
    setIsEditModalOpen(false);
    setNewSubcontractor({
      name: '',
      trade: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      status: 'Active',
      type: 'subcontractor',
      contractValue: 0,
      startDate: '',
      endDate: '',
      assignedWorks: [],
      assetCategories: [],
      certification: []
    });
  };

  const handleSavePayment = () => {
    // Validation
    if (!selectedSubId) {
      showSnackbar('Please select a subcontractor first');
      return;
    }
    
    if (!paymentForm.amount || isNaN(Number(paymentForm.amount)) || Number(paymentForm.amount) <= 0) {
      showSnackbar('Please enter a valid positive amount');
      return;
    }
    
    if (!paymentForm.reference?.trim()) {
      showSnackbar('Please enter a reference number');
      return;
    }
    
    if (!paymentForm.date) {
      showSnackbar('Please select a payment date');
      return;
    }

    const newPayment: SubcontractorPayment = {
      id: `pay-${Date.now()}`,
      subcontractorId: selectedSubId,
      date: paymentForm.date,
      amount: Number(paymentForm.amount),
      reference: paymentForm.reference,
      type: paymentForm.type || 'Bill Payment',
      description: paymentForm.description || '',
      status: 'Confirmed'
    };

    onProjectUpdate({
      ...project,
      subcontractorPayments: [...(project.subcontractorPayments || []), newPayment]
    });
    
    setIsPaymentModalOpen(false);
    setPaymentForm({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      reference: '',
      type: 'Bill Payment',
      description: ''
    });
  };

  const handleOpenPaymentModal = () => {
    if (!selectedSubId) {
      showSnackbar('Please select a subcontractor first');
      return;
    }
    setPaymentForm({
      ...paymentForm,
      subcontractorId: selectedSubId
    });
    setIsPaymentModalOpen(true);
  };

  const calculateSubcontractorProgress = (subId: string) => {
    const subBoqItems = project.boq.filter(item => item.subcontractorId === subId);
    const totalValue = subBoqItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const completedValue = subBoqItems.reduce((sum, item) => sum + (item.completedQuantity * item.rate), 0);
    return totalValue > 0 ? Math.round((completedValue / totalValue) * 100) : 0;
  };

  const calculateSubcontractorValue = (subId: string) => {
    const sub = subcontractors.find(s => s.id === subId);
    const subRates = sub?.rates || [];
    
    // Calculate total contract value based on rates
    const totalValue = subRates.reduce((sum, rate) => {
      const boqItem = project.boq.find(b => b.id === (rate as any).boqItemId);
      if (boqItem) {
        // Using the rate from the subcontractor's specific rate entry
        return sum + (boqItem.quantity * rate.rate);
      }
      return sum;
    }, 0);
    
    return totalValue;
  };

  return (
    <Box className="animate-in fade-in duration-500">
      <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight="900">Works Execution</Typography>
          <Typography variant="body2" color="text.secondary">Subcontractor management and progress tracking</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16}/>} onClick={handleAddSubcontractor} sx={{ paddingX: 1.5, paddingY: 0.75 }}>Add Contractor</Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ bgcolor: 'slate.50', borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Subcontractors" icon={<Briefcase size={18}/>} iconPosition="start" />
          <Tab label="Rates" icon={<Calculator size={18}/>} iconPosition="start" />
          <Tab label="Payment Ledger" icon={<DollarSign size={18}/>} iconPosition="start" />
        </Tabs>

        <Box p={2}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight="bold">Subcontractors</Typography>
                    <Tooltip title="Manage your subcontractor partners and their assignments">
                      <Box component="span" sx={{ color: 'action.active', cursor: 'help' }}>
                        <HelpCircle size={16} />
                      </Box>
                    </Tooltip>
                  </Box>
                  {subcontractors.map(sub => (
                    <Card 
                      key={sub.id} 
                      variant="outlined"
                      onClick={() => setSelectedSubId(sub.id)} 
                      sx={{ 
                        cursor: 'pointer', borderRadius: 3, transition: 'all 0.2s',
                        bgcolor: selectedSubId === sub.id ? 'indigo.50/20' : 'white',
                        borderColor: selectedSubId === sub.id ? 'primary.main' : 'divider'
                      }}
                    >
                      <Box p={2} display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                          <Briefcase size={20}/>
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle2" fontWeight="bold">{sub.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{sub.trade}</Typography>
                          <Box mt={1}>
                            <Chip 
                              label={sub.status} 
                              size="small" 
                              sx={{ 
                                fontSize: 10, 
                                height: 18,
                                bgcolor: sub.status === 'Active' ? 'success.light' : 
                                         sub.status === 'Suspended' ? 'error.light' : 'warning.light',
                                color: sub.status === 'Active' ? 'success.dark' : 
                                       sub.status === 'Suspended' ? 'error.dark' : 'warning.dark'
                              }} 
                            />
                          </Box>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditSubcontractor(sub); }}>
                            <Edit size={14} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteSubcontractor(sub.id); }}>
                            <Trash2 size={14} />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Card>
                  ))}
                  
                  {subcontractors.length === 0 && (
                    <Box py={6} textAlign="center" color="text.disabled">
                      <Briefcase size={48} className="opacity-20 mx-auto mb-3"/>
                      <Typography variant="h6">No subcontractors registered</Typography>
                      <Typography variant="body2">Add your first subcontractor to get started</Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} md={8}>
                {selectedSubcontractor ? (
                  <Stack spacing={3}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
                      <Box display="flex" justifyContent="space-between" mb={3}>
                        <Box>
                          <Typography variant="h6" fontWeight="900">{selectedSubcontractor.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{selectedSubcontractor.trade}</Typography>
                        </Box>
                        <Button variant="contained" startIcon={<DollarSign size={16}/>} size="small" onClick={handleOpenPaymentModal}>Record Payment</Button>
                      </Box>
                      
                      <Grid container spacing={2} mb={3}>
                        <Grid item xs={6} md={3}>
                          <Paper variant="outlined" sx={{ textAlign: 'center', py: 2 }}>
                            <FileText size={16}/>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {project.boq.filter(item => item.subcontractorId === selectedSubcontractor.id).length}
                            </Typography>
                            <Typography variant="caption">BOQ Items</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Paper variant="outlined" sx={{ textAlign: 'center', py: 2 }}>
                            <TrendingUp size={16}/>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {calculateSubcontractorProgress(selectedSubcontractor.id)}%
                            </Typography>
                            <Typography variant="caption">Progress</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Paper variant="outlined" sx={{ textAlign: 'center', py: 2 }}>
                            <DollarSign size={16}/>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {formatCurrency(calculateSubcontractorValue(selectedSubcontractor.id), settings || project.settings)}
                            </Typography>
                            <Typography variant="caption">Contract Value</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Paper variant="outlined" sx={{ textAlign: 'center', py: 2 }}>
                            <Activity size={16}/>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {subPayments
                                .filter(p => p.agencyId === selectedSubcontractor.id)
                                .reduce((sum, p) => sum + p.amount, 0)
                                .toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </Typography>
                            <Typography variant="caption">Total Paid</Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      <Typography variant="subtitle2" fontWeight="bold" mb={2}>Assigned BOQ Items</Typography>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: 'slate.50' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Progress</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {project.boq
                            .filter(item => item.subcontractorId === selectedSubcontractor.id)
                            .map(item => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="medium">{item.description}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2">{item.quantity} {item.unit}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2">{formatCurrency(item.rate, settings || project.settings)}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="bold">{formatCurrency(item.quantity * item.rate, settings || project.settings)}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" color="primary">
                                    {item.completedQuantity}/{item.quantity} ({Math.round((item.completedQuantity / item.quantity) * 100)}%)
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          {project.boq.filter(item => item.subcontractorId === selectedSubcontractor.id).length === 0 && (
                            <TableRow>
                              <td colSpan={5} style={{ textAlign: 'center', padding: '32px 16px' }}>
                                <Typography variant="body2" color="text.disabled">No BOQ items assigned to this subcontractor</Typography>
                              </td>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </Paper>
                  </Stack>
                ) : (
                  <Box py={10} textAlign="center" color="text.disabled">
                    <Briefcase size={60} className="opacity-10 mx-auto mb-4"/>
                    <Typography variant="h6">Select a subcontractor to view details</Typography>
                    <Typography variant="body2">Choose from the list to see subcontractor information</Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
                <Typography variant="subtitle1" fontWeight="bold">Subcontractor Rates</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Plus size={16}/>} 
                  onClick={() => {
                    if (!selectedSubId) {
                      showSnackbar('Please select a subcontractor first');
                      return;
                    }
                    setRateForm({
                      boqItemId: '',
                      rate: 0,
                      effectiveDate: new Date().toISOString().split('T')[0],
                      status: 'Active',
                      description: ''
                    });
                    setIsRatesModalOpen(true);
                  }}
                >
                  Add Rate
                </Button>
              </Box>
              
              <Table size="small">
                <TableHead sx={{ bgcolor: 'slate.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>BOQ Item</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Effective Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedSubcontractorRates.map(rate => {
                    const boqItem = project.boq.find(b => b.id === (rate as any).boqItemId);
                    return (
                      <TableRow key={rate.id}>
                        <TableCell>{boqItem?.itemNo || 'N/A'}</TableCell>
                        <TableCell>{boqItem?.description || rate.description || 'N/A'}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">{formatCurrency(rate.rate, settings || project.settings)}</Typography>
                        </TableCell>
                        <TableCell>{rate.effectiveDate}</TableCell>
                        <TableCell>
                          <Chip 
                            label={rate.status} 
                            size="small" 
                            sx={{ 
                              fontSize: 10, 
                              height: 18,
                              bgcolor: rate.status === 'Active' ? 'success.light' : 
                                       rate.status === 'Expired' ? 'error.light' : 'warning.light',
                              color: rate.status === 'Active' ? 'success.dark' : 
                                     rate.status === 'Expired' ? 'error.dark' : 'warning.dark'
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {selectedSubcontractorRates.length === 0 && (
                    <TableRow>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '48px 16px' }}>
                        <Typography variant="body2" color="text.disabled">No rate records found for this subcontractor</Typography>
                      </td>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
                <Typography variant="subtitle1" fontWeight="bold">Payment Transactions</Typography>
              </Box>
              
              <Table size="small">
                <TableHead sx={{ bgcolor: 'slate.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subcontractor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subPayments.map(payment => {
                    const sub = subcontractors.find(s => s.id === payment.agencyId);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">{sub?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{sub?.trade}</Typography>
                        </TableCell>
                        <TableCell>{payment.reference}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{formatCurrency(payment.amount, settings || project.settings)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={payment.status} 
                            size="small" 
                            sx={{ 
                              fontSize: 10, 
                              height: 18,
                              bgcolor: payment.status === 'Confirmed' ? 'success.light' : 
                                       payment.status === 'Draft' ? 'info.light' : 'warning.light',
                              color: payment.status === 'Confirmed' ? 'success.dark' : 
                                     payment.status === 'Draft' ? 'info.dark' : 'warning.dark'
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {subPayments.length === 0 && (
                    <TableRow>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '48px 16px' }}>
                        <Typography variant="body2" color="text.disabled">No payment records found</Typography>
                      </td>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Add/Edit Subcontractor Modal */}
      <Dialog open={isSubcontractorModalOpen || isEditModalOpen} onClose={() => { setIsSubcontractorModalOpen(false); setIsEditModalOpen(false); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Briefcase className="text-indigo-600" /> {isEditModalOpen ? 'Edit Contractor' : 'Add New Contractor'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            <TextField 
              label="Subcontractor Name" 
              fullWidth 
              value={newSubcontractor.name} 
              onChange={e => setNewSubcontractor({...newSubcontractor, name: e.target.value})} 
              size="small" 
              required 
              helperText="Enter the full name of the subcontractor company"
            />
            <TextField 
              label="Trade/Service" 
              fullWidth 
              value={newSubcontractor.trade} 
              onChange={e => setNewSubcontractor({...newSubcontractor, trade: e.target.value})} 
              size="small" 
              required 
            />
            <TextField 
              label="Contact Person" 
              fullWidth 
              value={newSubcontractor.contactPerson} 
              onChange={e => setNewSubcontractor({...newSubcontractor, contactPerson: e.target.value})} 
              size="small" 
            />
            <TextField 
              label="Phone" 
              fullWidth 
              value={newSubcontractor.phone} 
              onChange={e => setNewSubcontractor({...newSubcontractor, phone: e.target.value})} 
              size="small" 
            />
            <TextField 
              label="Email" 
              fullWidth 
              value={newSubcontractor.email} 
              onChange={e => setNewSubcontractor({...newSubcontractor, email: e.target.value})} 
              size="small" 
            />
            <TextField 
              label="Address" 
              fullWidth 
              value={newSubcontractor.address} 
              onChange={e => setNewSubcontractor({...newSubcontractor, address: e.target.value})} 
              size="small" 
              multiline 
              rows={2}
            />
            <TextField 
              label="Contract Value" 
              type="number" 
              fullWidth 
              value={newSubcontractor.contractValue} 
              onChange={e => setNewSubcontractor({...newSubcontractor, contractValue: Number(e.target.value)})} 
              size="small" 
              InputProps={{ 
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: 0, step: 0.01 }
              }} 
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField 
                  label="Start Date" 
                  type="date" 
                  fullWidth 
                  size="small" 
                  InputLabelProps={{ shrink: true }} 
                  value={newSubcontractor.startDate} 
                  onChange={e => setNewSubcontractor({...newSubcontractor, startDate: e.target.value})} 
                  InputProps={{ startAdornment: <Calendar size={16} className="text-slate-400 mr-2"/> }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  label="End Date" 
                  type="date" 
                  fullWidth 
                  size="small" 
                  InputLabelProps={{ shrink: true }} 
                  value={newSubcontractor.endDate} 
                  onChange={e => setNewSubcontractor({...newSubcontractor, endDate: e.target.value})} 
                  InputProps={{ startAdornment: <Calendar size={16} className="text-slate-400 mr-2"/> }}
                />
              </Grid>
            </Grid>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select 
                value={newSubcontractor.status} 
                label="Status" 
                onChange={e => setNewSubcontractor({...newSubcontractor, status: e.target.value as any})}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="subtitle2" fontWeight="bold" mt={3} color="primary">Structural Assets & Works</Typography>
            <TextField 
              label="Assigned Works" 
              fullWidth 
              size="small" 
              value={newSubcontractor.assignedWorks?.join(', ') || ''} 
              onChange={e => setNewSubcontractor({...newSubcontractor, assignedWorks: e.target.value.split(',').map(work => work.trim()).filter(work => work)})} 
              helperText="Enter BOQ item IDs or work descriptions separated by commas"
            />
            <TextField 
              label="Asset Categories" 
              fullWidth 
              size="small" 
              value={newSubcontractor.assetCategories?.join(', ') || ''} 
              onChange={e => setNewSubcontractor({...newSubcontractor, assetCategories: e.target.value.split(',').map(cat => cat.trim()).filter(cat => cat)})}
              helperText="e.g., Bridges, Culverts, Retaining Walls"
            />
            <TextField 
              label="Certifications" 
              fullWidth 
              size="small" 
              value={newSubcontractor.certification?.join(', ') || ''} 
              onChange={e => setNewSubcontractor({...newSubcontractor, certification: e.target.value.split(',').map(cert => cert.trim()).filter(cert => cert)})}
              helperText="e.g., Structural Engineer License, Safety Certification"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
          <Button onClick={() => { setIsSubcontractorModalOpen(false); setIsEditModalOpen(false); }} startIcon={<X />}>Cancel</Button>
          <Button variant="contained" startIcon={<Save/>} onClick={handleSaveSubcontractor}>
            {isEditModalOpen ? 'Update' : 'Save'} Contractor
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.main', color: 'white', p: 2, borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
          <DollarSign size={20} className="text-white" /> Record Payment
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3} mt={1}>
            <TextField 
              label="Payment Date" 
              type="date" 
              fullWidth 
              size="small" 
              InputLabelProps={{ shrink: true }} 
              value={paymentForm.date} 
              onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} 
              InputProps={{ startAdornment: <Calendar size={16} className="text-slate-400 mr-2"/> }}
            />
            <TextField 
              label="Amount" 
              type="number" 
              fullWidth 
              size="small" 
              value={paymentForm.amount} 
              onChange={e => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})}
              InputProps={{ 
                startAdornment: <InputAdornment position="start">{getCurrencySymbol(settings?.currency || project.settings?.currency)}</InputAdornment>,
                inputProps: { min: 0, step: 0.01 }
              }} 
              required 
            />
            <TextField 
              label="Reference Number" 
              fullWidth 
              size="small" 
              value={paymentForm.reference} 
              onChange={e => setPaymentForm({...paymentForm, reference: e.target.value})} 
              required 
            />
            <FormControl fullWidth size="small">
              <InputLabel>Payment Type</InputLabel>
              <Select 
                value={paymentForm.type} 
                label="Payment Type" 
                onChange={e => setPaymentForm({...paymentForm, type: e.target.value as any})}
              >
                <MenuItem value="Bill Payment">Bill Payment</MenuItem>
                <MenuItem value="Advance">Advance</MenuItem>
                <MenuItem value="Retention">Retention</MenuItem>
                <MenuItem value="Final Payment">Final Payment</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              label="Description" 
              fullWidth 
              size="small" 
              value={paymentForm.description} 
              onChange={e => setPaymentForm({...paymentForm, description: e.target.value})} 
              multiline 
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }}>
          <Button onClick={() => setIsPaymentModalOpen(false)} startIcon={<X size={16} />} sx={{ px: 3, py: 1, fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" startIcon={<Save size={16} />} onClick={handleSavePayment} sx={{ px: 3, py: 1, fontWeight: 600, boxShadow: 2, '&:hover': { boxShadow: 3 } }}>Save Payment</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)} 
        message={snackbarMessage}
      />
    </Box>
  );
};

export default SubcontractorModule;