import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Grid, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, 
  IconButton, Chip, Avatar, Card, CardContent, Tabs, Tab, Alert,
  FormControlLabel, Switch, InputAdornment, InputBase
} from '@mui/material';
import { 
  Plus, Edit, Trash2, Save, X, Calendar, DollarSign, 
  FileText, CheckCircle, AlertTriangle, User, Clock, Search
} from 'lucide-react';
import { Project, UserRole, AppSettings, Subcontractor, SubcontractorBill } from '../../types';
import { formatCurrency } from '../../utils/formatting/exportUtils';
import { getCurrencySymbol } from '../../utils/formatting/currencyUtils';



interface Props {
  project: Project;
  userRole: UserRole;
  settings: AppSettings;
  onProjectUpdate: (project: Project) => void;
}

const SubcontractorBillingModule: React.FC<Props> = ({ project, settings, onProjectUpdate, userRole }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<Partial<SubcontractorBill> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [billForm, setBillForm] = useState<Partial<SubcontractorBill>>({
    id: '',
    subcontractorId: '',
    billNumber: '',
    description: '',
    netAmount: 0,
    grossAmount: 0,
    date: new Date().toISOString().split('T')[0],
    periodFrom: '',
    periodTo: '',
    status: 'Draft',
    retentionPercent: 0,
    items: [],
  });
  const [isEditing, setIsEditing] = useState(false);

  // Get all subcontractors and bills
  const subcontractors = project.agencies?.filter(a => a.type === 'subcontractor') || [];
  const bills = project.subcontractorBills || [];
  
  // Filter bills based on search term
  const filteredBills = bills.filter(bill => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const subcontractor = subcontractors.find(s => s.id === bill.subcontractorId);
    return (
      bill.description.toLowerCase().includes(searchLower) ||
      (subcontractor?.name.toLowerCase().includes(searchLower) || false) ||
      bill.billNumber?.toLowerCase().includes(searchLower) ||
      bill.subcontractorId?.toLowerCase().includes(searchLower)
    );
  });

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setBillForm(prev => ({ ...prev, [field]: value }));
  };

  // Open modal to create new bill
  const handleCreateBill = () => {
    setBillForm({
      id: `bill-${Date.now()}`,
      subcontractorId: '',
      billNumber: `SB-${(project.subcontractorBills?.length || 0) + 1}`,
      description: '',
      netAmount: 0,
      grossAmount: 0,
      date: new Date().toISOString().split('T')[0],
      periodFrom: '',
      periodTo: '',
      status: 'Draft',
      retentionPercent: 0,
      items: [],
    });
    setIsEditing(true);
    setIsBillModalOpen(true);
  };

  // Open modal to edit existing bill
  const handleEditBill = (bill: SubcontractorBill) => {
    setBillForm({ ...bill });
    setCurrentBill(bill);
    setIsEditing(true);
    setIsBillModalOpen(true);
  };

  // Delete a bill
  const handleDeleteBill = (billId: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      const updatedProject = {
        ...project,
        subcontractorBills: project.subcontractorBills?.filter(b => b.id !== billId) || []
      };
      onProjectUpdate(updatedProject);
    }
  };

  // Save or update a bill
  const handleSaveBill = () => {
    const updatedProject = { ...project };
    
    if (isEditing && currentBill?.id) {
      // Update existing bill
      updatedProject.subcontractorBills = updatedProject.subcontractorBills?.map(bill => 
        bill.id === currentBill.id ? { ...billForm } as SubcontractorBill : bill
      ) || [];
    } else {
      // Add new bill
      updatedProject.subcontractorBills = [...(project.subcontractorBills || []), billForm as SubcontractorBill];
    }
    
    onProjectUpdate(updatedProject);
    setIsBillModalOpen(false);
    setBillForm({
      id: '',
      subcontractorId: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Draft'
    });
    setCurrentBill(null);
    setIsEditing(false);
  };

  // Cancel form
  const handleCancel = () => {
    setIsBillModalOpen(false);
    setBillForm({
      id: '',
      subcontractorId: '',
      billNumber: '',
      description: '',
      netAmount: 0,
      grossAmount: 0,
      date: new Date().toISOString().split('T')[0],
      periodFrom: '',
      periodTo: '',
      status: 'Draft',
      retentionPercent: 0,
      items: [],
    });
    setCurrentBill(null);
    setIsEditing(false);
  };

  // Calculate billing summary
  const billingSummary = {
    totalBills: bills.length,
    totalAmount: bills.reduce((sum, bill) => sum + bill.netAmount, 0),
    pendingAmount: bills.filter(b => b.status === 'Submitted').reduce((sum, bill) => sum + bill.netAmount, 0),
    approvedAmount: bills.filter(b => b.status === 'Approved').reduce((sum, bill) => sum + bill.netAmount, 0),
    paidAmount: bills.filter(b => b.status === 'Paid').reduce((sum, bill) => sum + bill.netAmount, 0)
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', gap: 3 }}>
      <Paper sx={{ width: 300, borderRadius: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} variant="outlined">
        <Box p={2.5} borderBottom="1px solid #f1f5f9" bgcolor="slate.50">
          <Typography variant="h6" fontWeight="900">Subcontractor Billing</Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Manage subcontractor bills and payments
          </Typography>
                  
          <TextField 
            fullWidth size="small" placeholder="Search bills..." 
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} className="text-slate-400" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
                  
          <Button 
            fullWidth variant="contained" 
            startIcon={<Plus size={18}/>} 
            onClick={handleCreateBill}
            sx={{ borderRadius: 3 }}
          >
            New Bill
          </Button>
        </Box>
        
        <Box flex={1} p={2} overflow="auto">
          <Typography variant="subtitle2" fontWeight="bold" mb={2}>BILLING SUMMARY</Typography>
          
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'slate.50' }}>
                <Typography variant="caption" color="text.secondary">Total Bills</Typography>
                <Typography variant="h6" fontWeight="bold">{billingSummary.totalBills}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'slate.50' }}>
                <Typography variant="caption" color="text.secondary">Total Amount</Typography>
                <Typography variant="h6" fontWeight="bold">{formatCurrency(billingSummary.totalAmount, settings)}</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Grid container spacing={1.5} mt={1}>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'slate.50' }}>
                <Typography variant="caption" color="text.secondary">Pending</Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">{formatCurrency(billingSummary.pendingAmount, settings)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'slate.50' }}>
                <Typography variant="caption" color="text.secondary">Paid</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">{formatCurrency(billingSummary.paidAmount, settings)}</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Box mt={3}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>STATUS FILTERS</Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip label="All" size="small" variant="outlined" clickable onClick={() => setActiveTab(0)} />
              <Chip label="Draft" size="small" variant="outlined" clickable onClick={() => setActiveTab(1)} />
              <Chip label="Submitted" size="small" variant="outlined" clickable onClick={() => setActiveTab(2)} />
              <Chip label="Approved" size="small" variant="outlined" clickable onClick={() => setActiveTab(3)} />
              <Chip label="Paid" size="small" variant="outlined" clickable onClick={() => setActiveTab(4)} />
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box flex={1} overflow="auto">
        <Tabs 
          value={activeTab} 
          onChange={(e, newVal) => setActiveTab(newVal)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Bills" />
          <Tab label="Drafts" />
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Paid" />
        </Tabs>

        <Box p={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bill #</TableCell>
                  <TableCell>Subcontractor</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Net Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Period To</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBills.map((bill) => {
                  const subcontractor = subcontractors.find(s => s.id === bill.subcontractorId);
                  return (
                    <TableRow key={bill.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{bill.billNumber || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 24, height: 24 }}>
                            <User size={14} />
                          </Avatar>
                          <Typography variant="body2">{subcontractor?.name || 'Unknown'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap title={bill.description}>
                          {bill.description.substring(0, 30)}{bill.description.length > 30 ? '...' : ''}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(bill.netAmount, settings)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{bill.date}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{bill.periodTo || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={bill.status} 
                          size="small"
                          color={
                            bill.status === 'Draft' ? 'default' : 
                            bill.status === 'Submitted' ? 'warning' : 
                            bill.status === 'Approved' ? 'info' : 
                            bill.status === 'Paid' ? 'success' : 'default'
                          }
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditBill(bill)}
                          title="Edit Bill"
                        >
                          <Edit size={16} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteBill(bill.id)}
                          title="Delete Bill"
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredBills.length === 0 && (
            <Box textAlign="center" py={8}>
              <FileText size={60} className="mx-auto mb-4 opacity-30" />
              <Typography variant="h6" fontWeight="bold">No bills found</Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'No bills match your search' : 'Create your first subcontractor bill to get started'}
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Plus size={16}/>} 
                sx={{ mt: 2, borderRadius: 3 }}
                onClick={handleCreateBill}
              >
                Create New Bill
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Bill Modal */}
      <Dialog 
        open={isBillModalOpen} 
        onClose={handleCancel} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <DollarSign className="text-indigo-600"/>
            <Typography variant="h6" fontWeight="900">
              {isEditing ? 'Edit Bill' : 'Create New Bill'}
            </Typography>
          </Box>
          <IconButton onClick={handleCancel}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="subcontractor-select-label">Subcontractor</InputLabel>
                <Select
                  labelId="subcontractor-select-label"
                  value={billForm.subcontractorId || ''}
                  label="Subcontractor"
                  onChange={(e) => handleFormChange('subcontractorId', e.target.value)}
                >
                  {subcontractors.map((sub) => (
                    <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bill Number"
                value={billForm.billNumber || ''}
                onChange={(e) => handleFormChange('billNumber', e.target.value)}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Gross Amount"
                type="number"
                value={billForm.grossAmount || 0}
                onChange={(e) => handleFormChange('grossAmount', parseFloat(e.target.value) || 0)}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">{getCurrencySymbol(settings.currency)}</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Net Amount"
                type="number"
                value={billForm.netAmount || 0}
                onChange={(e) => handleFormChange('netAmount', parseFloat(e.target.value) || 0)}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">{getCurrencySymbol(settings.currency)}</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Retention (%)"
                type="number"
                value={billForm.retentionPercent || 0}
                onChange={(e) => handleFormChange('retentionPercent', parseFloat(e.target.value) || 0)}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bill Date"
                type="date"
                value={billForm.date || ''}
                onChange={(e) => handleFormChange('date', e.target.value)}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Period From"
                type="date"
                value={billForm.periodFrom || ''}
                onChange={(e) => handleFormChange('periodFrom', e.target.value)}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Period To"
                type="date"
                value={billForm.periodTo || ''}
                onChange={(e) => handleFormChange('periodTo', e.target.value)}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={billForm.description || ''}
                onChange={(e) => handleFormChange('description', e.target.value)}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  value={billForm.status || 'Draft'}
                  label="Status"
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Submitted">Submitted</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCancel} startIcon={<X size={16}/>} sx={{ borderRadius: 3 }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveBill} 
            startIcon={<Save size={16}/>} 
            sx={{ borderRadius: 3 }}
            disabled={!billForm.subcontractorId || !billForm.description || billForm.netAmount === 0}
          >
            {isEditing ? 'Update Bill' : 'Create Bill'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubcontractorBillingModule;