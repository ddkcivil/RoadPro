import React, { useMemo, useState } from 'react';
import { 
    Box, Paper, Typography, LinearProgress, 
    Tooltip, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
    Snackbar, Alert, Grid, Autocomplete
} from '@mui/material';
import { 
    DataGrid, 
    GridColDef, 
    GridToolbar,
    GridRenderCellParams,
    GridRowParams,
    GridActionsCellItem,
    GridRowId
} from '@mui/x-data-grid';
import { Project, BOQItem, AppSettings, UserRole } from '../types';
import { getAutofillSuggestions, checkForDuplicates } from '../utils/autofillUtils';
import { 
    AlertCircle, CheckCircle2, TrendingUp, 
    FileSpreadsheet, Receipt, Plus, Save, Trash2, Edit3, X
} from 'lucide-react';
import { getCurrencySymbol, formatCurrency } from '../utils/currencyUtils';

interface Props {
  project: Project;
  settings: AppSettings;
  userRole: UserRole;
  onProjectUpdate?: (project: Project) => void;
  compactView?: boolean;
}

const BOQManager: React.FC<Props> = ({ project, settings, userRole, onProjectUpdate, compactView = false }) => {
    const currency = getCurrencySymbol(settings.currency);
    
    // State for BOQ CRUD operations
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentBOQItem, setCurrentBOQItem] = useState<Partial<BOQItem> | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    
    const columns: GridColDef<BOQItem>[] = [
        { 
            field: 'itemNo', 
            headerName: 'Item #', 
            width: 90, 
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => (
                <Typography variant="caption" fontWeight="900" color="primary.main" sx={{ fontFamily: 'monospace' }}>
                    {params.value}
                </Typography>
            )
        },
        { 
            field: 'description', 
            headerName: 'Work Description', 
            flex: 1,
            minWidth: 300,
            renderCell: (params) => (
                <Tooltip title={params.value as string}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                        {params.value}
                    </Typography>
                </Tooltip>
            )
        },
        { 
            field: 'unit', 
            headerName: 'Unit', 
            width: 70, 
            align: 'center',
            headerAlign: 'center'
        },
        { 
            field: 'quantity', 
            headerName: 'Original Qty', 
            type: 'number', 
            width: 110,
            headerAlign: 'right'
        },
        { 
            field: 'variationQuantity', 
            headerName: 'VO Delta', 
            type: 'number', 
            width: 90,
            headerAlign: 'right',
            valueGetter: (value, row) => row.variationQuantity || 0,
            renderCell: (params) => {
                const val = params.value as number;
                return (
                    <Typography variant="caption" fontWeight="bold" color={val > 0 ? 'success.main' : val < 0 ? 'error.main' : 'text.disabled'}>
                        {val > 0 ? '+' : ''}{val === 0 ? '-' : val}
                    </Typography>
                );
            }
        },
        { 
            field: 'revisedQuantity', 
            headerName: 'Revised Qty', 
            type: 'number', 
            width: 110,
            headerAlign: 'right',
            valueGetter: (value, row) => (row.quantity || 0) + (row.variationQuantity || 0)
        },
        { 
            field: 'completedQuantity', 
            headerName: 'Executed', 
            type: 'number', 
            width: 100,
            headerAlign: 'right',
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="bold">
                    {params.value.toLocaleString()}
                </Typography>
            )
        },
        {
            field: 'progress',
            headerName: 'Progress',
            width: 140,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => {
                const revised = (params.row.quantity || 0) + (params.row.variationQuantity || 0);
                const progress = revised > 0 ? (params.row.completedQuantity / revised) * 100 : 0;
                const isOverrun = progress > 100.1;

                return (
                    <Box sx={{ width: '100%', pr: 1 }}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 'black' }} color={isOverrun ? 'error.main' : 'text.secondary'}>
                                {progress.toFixed(1)}%
                            </Typography>
                            {isOverrun && <AlertCircle size={10} className="text-red-500" />}
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={Math.min(100, progress)} 
                            color={isOverrun ? "error" : progress >= 100 ? "success" : "primary"}
                            sx={{ height: 4, borderRadius: 2 }}
                        />
                    </Box>
                );
            }
        },
        { 
            field: 'rate', 
            headerName: 'Rate', 
            type: 'number', 
            width: 100,
            headerAlign: 'right',
            valueFormatter: (value) => `${currency}${Number(value).toLocaleString()}`
        },
        { 
            field: 'id', 
            headerName: 'Total Value', 
            type: 'number', 
            width: 130,
            headerAlign: 'right',
            valueGetter: (value, row) => {
                const revised = (row.quantity || 0) + (row.variationQuantity || 0);
                return revised * row.rate;
            },
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="900" color="indigo.700">
                    {currency}{(params.value as number).toLocaleString()}
                </Typography>
            )
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            getActions: (params: GridRowParams<BOQItem>) => [
                <GridActionsCellItem
                    icon={<Edit3 size={18} />}
                    label="Edit"
                    onClick={() => handleEditBOQItem(params.row)}
                    color="primary"
                />,
                <GridActionsCellItem
                    icon={<Trash2 size={18} />}
                    label="Delete"
                    onClick={() => handleDeleteBOQItem(params.row.id)}
                    color="error"
                />
            ]
        }
    ];

    const boqData = useMemo(() => project.boq || [], [project.boq]);

    // CRUD Functions
    const handleAddBOQItem = () => {
        setCurrentBOQItem({
            id: `boq-${Date.now()}`,
            itemNo: '',
            description: '',
            unit: 'unit',
            quantity: 0,
            rate: 0,
            category: 'General',
            completedQuantity: 0
        });
        setDialogMode('add');
        setIsDialogOpen(true);
    };

    const handleEditBOQItem = (item: BOQItem) => {
        setCurrentBOQItem({ ...item });
        setDialogMode('edit');
        setIsDialogOpen(true);
    };

    const canDelete = userRole === UserRole.ADMIN || userRole === UserRole.PROJECT_MANAGER;
    
    const handleDeleteBOQItem = (id: string) => {
        if (!onProjectUpdate) return;
        
        if (!canDelete) {
            setSnackbarMessage('Only Admin and Project Manager can delete BOQ items');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        
        if (window.confirm('Are you sure you want to delete this BOQ item?')) {
            const updatedProject = {
                ...project,
                boq: project.boq.filter(item => item.id !== id)
            };
            onProjectUpdate(updatedProject);
            setSnackbarMessage('BOQ item deleted successfully');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        }
    };

    const handleSaveBOQItem = () => {
        if (!currentBOQItem || !onProjectUpdate) return;
        
        // Validation
        if (!currentBOQItem.itemNo.trim()) {
            setSnackbarMessage('Item number is required');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        
        if (!currentBOQItem.description.trim()) {
            setSnackbarMessage('Description is required');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        
        if (isNaN(Number(currentBOQItem.quantity)) || Number(currentBOQItem.quantity) < 0) {
            setSnackbarMessage('Quantity must be a non-negative number');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        
        if (isNaN(Number(currentBOQItem.rate)) || Number(currentBOQItem.rate) < 0) {
            setSnackbarMessage('Rate must be a non-negative number');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        
        if (isNaN(Number(currentBOQItem.completedQuantity)) || Number(currentBOQItem.completedQuantity) < 0) {
            setSnackbarMessage('Completed quantity must be a non-negative number');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        
        if (Number(currentBOQItem.completedQuantity) > (Number(currentBOQItem.quantity) + (Number(currentBOQItem.variationQuantity) || 0))) {
            setSnackbarMessage('Completed quantity cannot exceed total quantity');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        
        if (dialogMode === 'add') {
            // Add new item
            const newItem: BOQItem = {
                ...currentBOQItem,
                id: currentBOQItem.id || `boq-${Date.now()}`,
                quantity: Number(currentBOQItem.quantity) || 0,
                rate: Number(currentBOQItem.rate) || 0,
                completedQuantity: Number(currentBOQItem.completedQuantity) || 0,
                variationQuantity: Number(currentBOQItem.variationQuantity) || 0,
                revisedQuantity: Number(currentBOQItem.revisedQuantity) || 0
            } as BOQItem;
            
            const updatedProject = {
                ...project,
                boq: [...project.boq, newItem]
            };
            onProjectUpdate(updatedProject);
            setSnackbarMessage('BOQ item added successfully');
        } else {
            // Update existing item
            const updatedProject = {
                ...project,
                boq: project.boq.map(item => 
                    item.id === currentBOQItem.id ? {
                        ...currentBOQItem,
                        quantity: Number(currentBOQItem.quantity) || 0,
                        rate: Number(currentBOQItem.rate) || 0,
                        completedQuantity: Number(currentBOQItem.completedQuantity) || 0,
                        variationQuantity: Number(currentBOQItem.variationQuantity) || 0,
                        revisedQuantity: Number(currentBOQItem.revisedQuantity) || 0
                    } as BOQItem : item
                )
            };
            onProjectUpdate(updatedProject);
            setSnackbarMessage('BOQ item updated successfully');
        }
        
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setIsDialogOpen(false);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setCurrentBOQItem(null);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box>
            <Paper 
                variant="outlined" 
                sx={{ 
                    height: 'calc(100vh - 300px)', 
                    width: '100%', 
                    borderRadius: 4, 
                    overflow: 'hidden',
                    bgcolor: 'white',
                    '& .super-app-theme--header': {
                        bgcolor: 'slate.50',
                        fontWeight: 'bold'
                    }
                }}
            >
                <DataGrid
                    rows={boqData}
                    columns={columns}
                    slots={{ 
                        toolbar: () => (
                            <Box display="flex" justifyContent="space-between" alignItems="center" p={1}>
                                <GridToolbar />
                                <Button 
                                    color="primary" 
                                    startIcon={<Plus />} 
                                    onClick={handleAddBOQItem}
                                    variant="contained"
                                    size="small"
                                >
                                    Add Item
                                </Button>
                            </Box>
                        ) 
                    }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                            csvOptions: { fileName: `BOQ_Export_${project.code}` },
                            printOptions: { disableToolbarButton: true },
                        },
                    }}
                    density="compact"
                    disableRowSelectionOnClick
                    initialState={{
                        pagination: { paginationModel: { pageSize: 50 } },
                    }}
                    pageSizeOptions={[25, 50, 100]}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            color: 'text.secondary'
                        }
                    }}
                />
            </Paper>
            
            {/* Dialog for Adding/Editing BOQ Items */}
            <Dialog open={isDialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>
                    {dialogMode === 'add' ? 'Add New BOQ Item' : 'Edit BOQ Item'}
                </DialogTitle>
                <DialogContent dividers>
                    <Box mt={2}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    freeSolo
                                    options={getAutofillSuggestions.boqItems(project, 'itemNo', currentBOQItem?.itemNo || '')}
                                    value={currentBOQItem?.itemNo || ''}
                                    onInputChange={(event, newValue) => {
                                        setCurrentBOQItem(prev => ({ ...prev!, itemNo: newValue }));
                                        // Check for duplicates
                                        if (checkForDuplicates.boqItemExists(project, { itemNo: newValue, description: currentBOQItem?.description || '' })) {
                                            setSnackbarMessage('A similar BOQ item already exists!');
                                            setSnackbarSeverity('error');
                                            setSnackbarOpen(true);
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            autoFocus
                                            margin="dense"
                                            label="Item Number"
                                            fullWidth
                                            variant="outlined"
                                            required
                                            InputProps={{
                                                ...params.InputProps,
                                                type: 'search'
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    freeSolo
                                    options={getAutofillSuggestions.boqItems(project, 'unit', currentBOQItem?.unit || '')}
                                    value={currentBOQItem?.unit || ''}
                                    onInputChange={(event, newValue) => setCurrentBOQItem(prev => ({ ...prev!, unit: newValue }))}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            margin="dense"
                                            label="Unit"
                                            fullWidth
                                            variant="outlined"
                                            InputProps={{
                                                ...params.InputProps,
                                                type: 'search'
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    freeSolo
                                    options={getAutofillSuggestions.boqItems(project, 'description', currentBOQItem?.description || '')}
                                    value={currentBOQItem?.description || ''}
                                    onInputChange={(event, newValue) => {
                                        setCurrentBOQItem(prev => ({ ...prev!, description: newValue }));
                                        // Check for duplicates
                                        if (checkForDuplicates.boqItemExists(project, { description: newValue, itemNo: currentBOQItem?.itemNo || '' })) {
                                            setSnackbarMessage('A similar BOQ item already exists!');
                                            setSnackbarSeverity('error');
                                            setSnackbarOpen(true);
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            margin="dense"
                                            label="Description"
                                            fullWidth
                                            variant="outlined"
                                            multiline
                                            rows={2}
                                            required
                                            InputProps={{
                                                ...params.InputProps,
                                                type: 'search'
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    margin="dense"
                                    label="Quantity"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    value={currentBOQItem?.quantity || 0}
                                    onChange={(e) => setCurrentBOQItem(prev => ({ ...prev!, quantity: Number(e.target.value) }))}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    margin="dense"
                                    label="Rate"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    value={currentBOQItem?.rate || 0}
                                    onChange={(e) => setCurrentBOQItem(prev => ({ ...prev!, rate: Number(e.target.value) }))}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    margin="dense"
                                    label="Completed Quantity"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    value={currentBOQItem?.completedQuantity || 0}
                                    onChange={(e) => setCurrentBOQItem(prev => ({ ...prev!, completedQuantity: Number(e.target.value) }))}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="dense">
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={currentBOQItem?.category || 'General'}
                                        label="Category"
                                        onChange={(e) => setCurrentBOQItem(prev => ({ ...prev!, category: e.target.value }))}
                                    >
                                        <MenuItem value="General">General</MenuItem>
                                        <MenuItem value="Earthwork">Earthwork</MenuItem>
                                        <MenuItem value="Structural">Structural</MenuItem>
                                        <MenuItem value="Pavement">Pavement</MenuItem>
                                        <MenuItem value="Drainage">Drainage</MenuItem>
                                        <MenuItem value="Provisional Sum">Provisional Sum</MenuItem>
                                        <MenuItem value="Extra Work">Extra Work</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="dense"
                                    label="Variation Quantity"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    value={currentBOQItem?.variationQuantity || 0}
                                    onChange={(e) => setCurrentBOQItem(prev => ({ ...prev!, variationQuantity: Number(e.target.value) }))}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
                    <Button onClick={handleDialogClose} startIcon={<X />}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveBOQItem} startIcon={<Save />}>Save Item</Button>
                </DialogActions>
            </Dialog>
            
            {/* Snackbar for notifications */}
            <Snackbar 
                open={snackbarOpen} 
                autoHideDuration={6000} 
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BOQManager;