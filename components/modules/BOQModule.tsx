import React, { useState, useMemo } from 'react';
import { 
    Typography, Box, Grid, TextField, 
    Button, Card, 
    Dialog, DialogTitle, DialogContent, DialogActions, Stack,
    CardContent, Tabs, Tab, IconButton, Divider,
    Autocomplete, List, ListItem, ListItemText, ListItemSecondaryAction,
    Chip, Tooltip, Paper, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Project, UserRole, AppSettings, BOQItem, VariationOrder, VariationItem } from '../../types';
import { 
    Plus, Search, Receipt, FileDiff, Save, X, BarChart4, FileSpreadsheet, Upload,
    Maximize2, Minimize2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import StatCard from '../core/StatCard';
import BOQManager from './BOQManager';
import { formatCurrency } from '../../utils/formatting/exportUtils';
import { getCurrencySymbol } from '../../utils/formatting/currencyUtils';

interface Props {
  project: Project;
  userRole: UserRole;
  settings: AppSettings;
  onProjectUpdate: (project: Project) => void;
}

const BOQModule: React.FC<Props> = ({ project, settings, userRole, onProjectUpdate }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [isVOModalOpen, setIsVOModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importMethod, setImportMethod] = useState<'replace' | 'append'>('replace');
    
    // State for compact/full view toggle
    const [compactView, setCompactView] = useState(false);
    
    const [newVO, setNewVO] = useState<Partial<VariationOrder>>({
        voNumber: `VO-${(project.variationOrders?.length || 0) + 1}`,
        title: '',
        date: new Date().toISOString().split('T')[0],
        items: [],
        reason: ''
    });
    
    const [tempVOItem, setTempVOItem] = useState<Partial<VariationItem>>({
        description: '', unit: '', quantityDelta: 0, rate: 0, isNewItem: false
    });

    const currencySymbol = getCurrencySymbol(settings.currency);

    const handleExportCSV = () => {
        const headers = ["Item No", "Description", "Unit", "Contract Qty", "Rate", "Completed Qty", "Total Value"];
        const rows = project.boq.map(item => [
            item.itemNo,
            `"${item.description.replace(/"/g, '"')}"`,
            item.unit,
            item.quantity,
            item.rate,
            item.completedQuantity,
            item.quantity * item.rate
        ]);
            
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
                
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `BOQ_Ledger_${project.code}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImportFile(file);
        }
    };
    
    const handleImportSubmit = () => {
        if (!importFile) return;
    
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
                
            // Get the first worksheet
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
                
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
            // Process the data to match BOQItem structure
            const importedBoqItems: BOQItem[] = jsonData.map((row: any, index) => {
                // Handle various possible column names
                const itemNo = row['Item No'] || row['ItemNo'] || row['item_no'] || row['itemNo'] || `ITEM-${index + 1}`;
                const description = row['Description'] || row['description'] || row['Work Description'] || `Item ${index + 1}`;
                const unit = row['Unit'] || row['unit'] || row['Units'] || 'unit';
                const quantity = parseFloat(row['Contract Qty'] || row['Quantity'] || row['quantity'] || row['Qty'] || 0);
                const rate = parseFloat(row['Rate'] || row['rate'] || row['Unit Rate'] || 0);
                const amount = quantity * rate; // Calculate amount
                const location = row['Location'] || row['location'] || 'N/A'; // Default location
                const category = row['Category'] || row['category'] || row['Work Category'] || 'General';
                    
                return {
                    id: `boq-${Date.now()}-${index}`,
                    itemNo: typeof itemNo === 'string' ? itemNo : String(itemNo),
                    description: typeof description === 'string' ? description : String(description),
                    unit: typeof unit === 'string' ? unit : String(unit),
                    quantity: isNaN(quantity) ? 0 : quantity,
                    rate: isNaN(rate) ? 0 : rate,
                    amount: isNaN(amount) ? 0 : amount,
                    location: typeof location === 'string' ? location : String(location),
                    category: typeof category === 'string' ? category : String(category),
                    completedQuantity: 0,
                    variationQuantity: 0
                };
            });
    
            if (importMethod === 'replace') {
                // Replace the entire BOQ
                onProjectUpdate({
                    ...project,
                    boq: importedBoqItems
                });
            } else {
                // Append to existing BOQ
                onProjectUpdate({
                    ...project,
                    boq: [...project.boq, ...importedBoqItems]
                });
            }
                
            // Reset and close modal
            setImportFile(null);
            setIsImportModalOpen(false);
            alert(`Successfully imported ${importedBoqItems.length} items from Excel file.`);
        };
            
        reader.onerror = () => {
            alert('Error reading Excel file. Please try again.');
        };
            
        reader.readAsArrayBuffer(importFile);
    };



    const handleAddVOItem = () => {
        if (!tempVOItem.description || !tempVOItem.quantityDelta) return;
        const item: VariationItem = {
            id: `voi-${Date.now()}`,
            description: tempVOItem.description,
            unit: tempVOItem.unit || 'unit',
            quantityDelta: Number(tempVOItem.quantityDelta),
            rate: Number(tempVOItem.rate),
            isNewItem: !!tempVOItem.isNewItem,
            boqItemId: tempVOItem.boqItemId
        };
        setNewVO(prev => ({ ...prev, items: [...(prev.items || []), item] }));
        setTempVOItem({ description: '', unit: '', quantityDelta: 0, rate: 0, isNewItem: false });
    };

    const handleSaveVO = () => {
        if (!newVO.title || !newVO.items?.length) return;
        
        const totalImpact = newVO.items.reduce((acc, i) => acc + (i.quantityDelta * i.rate), 0);
        const finalVO: VariationOrder = {
            ...newVO,
            id: `vo-${Date.now()}`,
            status: 'Draft',
            totalImpact
        } as VariationOrder;

        onProjectUpdate({
            ...project,
            variationOrders: [...(project.variationOrders || []), finalVO]
        });
        
        setIsVOModalOpen(false);
        setNewVO({
            voNumber: `VO-${(project.variationOrders?.length || 0) + 2}`,
            title: '',
            date: new Date().toISOString().split('T')[0],
            items: [],
            reason: ''
        });
    };

    const financialSummary = useMemo(() => {
        const boqItems = project.boq || [];
        const originalValue = boqItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
        const currentCompletedValue = boqItems.reduce((acc, item) => acc + (item.completedQuantity * item.rate), 0);
        
        // Calculate breakdown of Original Contract Value
        // Assuming 0 for provisional sum and CPA initially, these could come from project settings
        const provisionalSum = 0; // This would typically come from project settings
        const cpaAmount = 0; // This would typically come from project settings
        
        const amountWithoutPS = originalValue - provisionalSum;
        const vatRate = settings?.vatRate || 13; // Default to 13% if not specified
        const vatAmount = amountWithoutPS * (vatRate / 100);
        const totalContractValue = amountWithoutPS + vatAmount + provisionalSum;
        
        return { 
            original: originalValue, 
            completed: currentCompletedValue, 
            percent: originalValue > 0 ? (currentCompletedValue / originalValue) * 100 : 0,
            amountWithPS: originalValue,
            amountWithoutPS: amountWithoutPS,
            vatAmount: vatAmount,
            totalContractValue: totalContractValue,
            provisionalSum: provisionalSum,
            cpaAmount: cpaAmount
        };
    }, [project.boq, settings]);

    return (
        <Box className="animate-in fade-in duration-500">
            <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                <Box>
                    <Typography variant="h5" fontWeight="900" color="text.primary">Bill of Quantities (Master)</Typography>
                    <Typography variant="body2" color="text.secondary">Contractual schedule of rates and quantities</Typography>
                </Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Tooltip title="Import from Excel">
                        <Button 
                            variant="outlined" 
                            startIcon={<Upload size={18}/>} 
                            onClick={() => setIsImportModalOpen(true)}
                            sx={{ borderRadius: 2, borderColor: 'divider', color: 'text.secondary' }}
                        >
                            Import
                        </Button>
                    </Tooltip>
                    <Tooltip title="Export to Sheets/Excel">
                        <Button 
                            variant="outlined" 
                            startIcon={<FileSpreadsheet size={18}/>} 
                            onClick={handleExportCSV}
                            sx={{ borderRadius: 2, borderColor: 'divider', color: 'text.secondary' }}
                        >
                            Export
                        </Button>
                    </Tooltip>
                    <Tooltip title={compactView ? "Expand View" : "Compact View"}>
                        <IconButton 
                            onClick={() => setCompactView(!compactView)}
                            sx={{ 
                                borderRadius: 2, 
                                bgcolor: compactView ? 'primary.light' : 'grey.100',
                                color: compactView ? 'primary.contrastText' : 'text.secondary'
                            }}
                        >
                            {compactView ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </IconButton>
                    </Tooltip>
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 0.5, border: '1px solid', borderColor: 'divider' }}>
                        <Tab label="Registry" icon={<Receipt size={18}/>} iconPosition="start" sx={{ fontWeight: 'bold' }} />
                        <Tab label="Variations" icon={<FileDiff size={18}/>} iconPosition="start" sx={{ fontWeight: 'bold' }} />
                    </Tabs>
                </Stack>
            </Box>

            {/* Contract Value Breakdown Section */}
            <Grid container spacing={2} mb={2}>
                <Grid item xs={12} md={compactView ? 6 : 4}>
                    <StatCard title="Original Contract Value" value={`${currencySymbol}${financialSummary.original.toLocaleString()}`} icon={Receipt} color="#4f46e5" />
                </Grid>
                <Grid item xs={12} md={compactView ? 6 : 4}>
                    <StatCard title="Value of Work Done" value={`${currencySymbol}${financialSummary.completed.toLocaleString()}`} icon={FileSpreadsheet} color="#10b981" />
                </Grid>
                {!compactView && (
                    <Grid item xs={12} md={4}>
                        <StatCard title="Overall Financial Progress" value={`${financialSummary.percent.toFixed(1)}%`} icon={BarChart4} color="#8b5cf6" />
                    </Grid>
                )}
            </Grid>
            
            {/* Detailed Contract Value Breakdown */}
            <Paper variant="outlined" sx={{ p: compactView ? 2 : 3, borderRadius: 3, mb: 3, bgcolor: 'slate.50' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={compactView ? 1 : 2}>
                    <Typography variant="h6" fontSize={compactView ? "1rem" : "1.25rem"} fontWeight="bold" color="primary">Contract Value Breakdown</Typography>
                    <Chip 
                        label={compactView ? "COMPACT" : "FULL"} 
                        size="small" 
                        color={compactView ? "default" : "primary"}
                        variant="outlined"
                    />
                </Box>
                <Grid container spacing={compactView ? 1 : 3}>
                    <Grid item xs={compactView ? 6 : 12} sm={compactView ? 6 : 3}>
                        <Box textAlign="center" p={compactView ? 1 : 2} borderRadius={2} bgcolor="white" border="1px solid #e2e8f0">
                            <Typography variant="caption" color="text.secondary" display="block">Amount With PS</Typography>
                            <Typography variant={compactView ? "body2" : "h6"} fontWeight="bold" color="primary">
                                {currencySymbol}{financialSummary.amountWithPS.toLocaleString()}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={compactView ? 6 : 12} sm={compactView ? 6 : 3}>
                        <Box textAlign="center" p={compactView ? 1 : 2} borderRadius={2} bgcolor="white" border="1px solid #e2e8f0">
                            <Typography variant="caption" color="text.secondary" display="block">Amount Without PS</Typography>
                            <Typography variant={compactView ? "body2" : "h6"} fontWeight="bold" color="info.main">
                                {currencySymbol}{financialSummary.amountWithoutPS.toLocaleString()}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={compactView ? 6 : 12} sm={compactView ? 6 : 3}>
                        <Box textAlign="center" p={compactView ? 1 : 2} borderRadius={2} bgcolor="white" border="1px solid #e2e8f0">
                            <Typography variant="caption" color="text.secondary" display="block">VAT (@{(settings?.vatRate || 13)}%)</Typography>
                            <Typography variant={compactView ? "body2" : "h6"} fontWeight="bold" color="error.main">
                                {currencySymbol}{financialSummary.vatAmount.toLocaleString()}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={compactView ? 6 : 12} sm={compactView ? 6 : 3}>
                        <Box textAlign="center" p={compactView ? 1 : 2} borderRadius={2} bgcolor="primary.light" color="white">
                            <Typography variant="caption" color="rgba(255,255,255,0.8)" display="block">Total Contract Value</Typography>
                            <Typography variant={compactView ? "body2" : "h6"} fontWeight="bold">
                                {currencySymbol}{financialSummary.totalContractValue.toLocaleString()}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {activeTab === 0 ? (
                <BOQManager project={project} settings={settings} userRole={userRole} onProjectUpdate={onProjectUpdate} compactView={compactView} />
            ) : (
                <Box>
                    <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                        <Typography variant="h6" fontWeight="bold">Variation History</Typography>
                        <Button variant="contained" startIcon={<Plus size={16}/>} onClick={() => setIsVOModalOpen(true)} sx={{ borderRadius: 2, paddingX: 1.5, paddingY: 0.75 }}>Initialize VO</Button>
                    </Box>
                    <Grid container spacing={2}>
                        {(project.variationOrders || []).map(vo => (
                            <Grid item xs={12} md={6} key={vo.id}>
                                <Card variant="outlined" sx={{ borderRadius: 4, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Box>
                                                <Typography variant="caption" fontWeight="900" color="primary">{vo.voNumber}</Typography>
                                                <Typography variant="subtitle1" fontWeight="bold">{vo.title}</Typography>
                                            </Box>
                                            <Chip label={vo.status} color={vo.status === 'Approved' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 'bold' }} />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>{vo.reason}</Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary">{vo.items.length} Affected Items</Typography>
                                            <Typography variant="subtitle1" fontWeight="900" color="primary.main">
                                                {currencySymbol}{vo.totalImpact.toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {(!project.variationOrders || project.variationOrders.length === 0) && (
                            <Grid item xs={12}>
                                <Box py={10} textAlign="center" color="text.disabled" border="1px dashed" borderColor="divider" borderRadius={4}>
                                    <FileDiff size={48} className="mx-auto mb-2 opacity-20"/>
                                    <Typography variant="body2">No variation orders recorded for this project.</Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            )}

            <Dialog open={isVOModalOpen} onClose={() => setIsVOModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>Initialize Variation Order</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} mt={2}>
                        <Grid container spacing={2}>
                            <Grid item xs={8}><TextField fullWidth label="VO Title" value={newVO.title} onChange={e => setNewVO({...newVO, title: e.target.value})} size="small" /></Grid>
                            <Grid item xs={4}><TextField fullWidth label="VO Ref #" value={newVO.voNumber} disabled size="small" /></Grid>
                        </Grid>
                        <TextField fullWidth label="Technical Justification" multiline rows={2} value={newVO.reason} onChange={e => setNewVO({...newVO, reason: e.target.value})} size="small" />
                        
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">STAGING WORK ITEMS</Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12}>
                                    <Autocomplete<BOQItem>
                                        options={project.boq || []}
                                        getOptionLabel={(option) => `[${option.itemNo}] ${option.description}`}
                                        onChange={(_, newValue) => {
                                            if (newValue) {
                                                setTempVOItem({
                                                    ...tempVOItem, 
                                                    boqItemId: newValue.id, 
                                                    description: newValue.description,
                                                    unit: newValue.unit,
                                                    rate: newValue.rate,
                                                    isNewItem: false
                                                });
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Select Existing Item" size="small" />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12}><Typography variant="caption" align="center" display="block" color="text.disabled">OR</Typography></Grid>
                                <Grid item xs={12}><TextField fullWidth label="New Item Description" size="small" value={tempVOItem.description} onChange={e => setTempVOItem({...tempVOItem, description: e.target.value, isNewItem: true})} /></Grid>
                                <Grid item xs={4}><TextField fullWidth label="Delta Qty" type="number" size="small" value={tempVOItem.quantityDelta} onChange={e => setTempVOItem({...tempVOItem, quantityDelta: Number(e.target.value)})} /></Grid>
                                <Grid item xs={4}><TextField fullWidth label="Unit" size="small" value={tempVOItem.unit} onChange={e => setTempVOItem({...tempVOItem, unit: e.target.value})} /></Grid>
                                <Grid item xs={4}><TextField fullWidth label="Rate" type="number" size="small" value={tempVOItem.rate} onChange={e => setTempVOItem({...tempVOItem, rate: Number(e.target.value)})} /></Grid>
                                <Grid item xs={12}><Button fullWidth variant="outlined" startIcon={<Plus size={18}/>} onClick={handleAddVOItem}>Stage Item</Button></Grid>
                            </Grid>
                        </Paper>

                        <List dense sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            {newVO.items?.map((item, idx) => (
                                <ListItem key={idx} divider={idx !== (newVO.items?.length || 0) - 1}>
                                    <ListItemText 
                                        primary={<Typography variant="body2" fontWeight="bold">{item.description}</Typography>} 
                                        secondary={`${item.quantityDelta} ${item.unit} @ ${currencySymbol}${item.rate}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <Typography variant="body2" fontWeight="900" color="primary.main">
                                            {currencySymbol}{(item.quantityDelta * item.rate).toLocaleString()}
                                        </Typography>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                    <Button onClick={() => setIsVOModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" startIcon={<Save size={18}/>} onClick={handleSaveVO} disabled={!newVO.items?.length}>Commit Draft VO</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>Import BOQ from Excel</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} mt={2}>
                        <Typography variant="body2" color="text.secondary">
                            Upload an Excel file containing BOQ items. The file should have columns with headers like:
                            <br />
                            <code>Item No, Description, Unit, Contract Qty, Rate, Category</code>
                        </Typography>
                        
                        <FormControl fullWidth size="small">
                            <InputLabel>Import Method</InputLabel>
                            <Select
                                value={importMethod}
                                label="Import Method"
                                onChange={(e) => setImportMethod(e.target.value as 'replace' | 'append')}
                            >
                                <MenuItem value="replace">Replace Existing BOQ</MenuItem>
                                <MenuItem value="append">Append to Existing BOQ</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <input
                            accept=".xlsx,.xls,.csv"
                            type="file"
                            onChange={handleFileChange}
                            style={{ marginTop: '16px' }}
                        />
                        
                        {importFile && (
                            <Box p={2} border="1px dashed" borderColor="divider" borderRadius={2} bgcolor="background.default">
                                <Typography variant="body2" fontWeight="bold">Selected File:</Typography>
                                <Typography variant="caption" color="text.secondary">{importFile.name}</Typography>
                                <Typography variant="caption" display="block" color="text.disabled">Size: {(importFile.size / 1024).toFixed(2)} KB</Typography>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                    <Button onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        startIcon={<Upload size={18}/>} 
                        onClick={handleImportSubmit} 
                        disabled={!importFile}
                        sx={{ borderRadius: 2 }}
                    >
                        Import Excel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BOQModule;
