import React, { useState, useMemo } from 'react';
import { Project, UserRole, Vehicle } from '../../types';
import QRCodeGenerator from './QRCodeGenerator';
import { 
    Box, Typography, Button, Grid, Table, TableHead, TableRow, TableCell, 
    TableBody, Paper, Chip, Stack, Card, CardContent, LinearProgress,
    Tooltip, IconButton, Divider, Avatar, Tabs, Tab, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, InputAdornment,
    List, ListItem, ListItemText, ListItemSecondaryAction, Alert, Checkbox,
    Fab
} from '@mui/material';
import { 
    Package, AlertTriangle, CheckCircle2, TrendingDown, Plus, 
    ArrowUpRight, ShoppingCart, History, PackageSearch, Filter,
    FileText, Truck, CreditCard, ChevronRight, Calculator,
    PlusCircle, Trash2, Save, X, Printer, Edit, Car, Fuel, Gauge, Wrench, QrCode
} from 'lucide-react';

interface Props {
  project: Project;
  userRole: UserRole;
  onProjectUpdate: (project: Project) => void;
}

const AssetsModule: React.FC<Props> = ({ project, onProjectUpdate, userRole }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Vehicle | null>(null);
  const [assetForm, setAssetForm] = useState<Partial<Vehicle>>({
    plateNumber: '',
    type: '',
    status: 'Active',
    driver: '',
    agencyId: '',
    chainage: '',
    gpsLocation: undefined
  });
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  
  const assets = project.vehicles || [];

  const stats = useMemo(() => {
    const active = assets.filter(a => a.status === 'Active');
    const maintenance = assets.filter(a => a.status === 'Maintenance');
    const idle = assets.filter(a => a.status === 'Idle');
    return { active, maintenance, idle };
  }, [assets]);

  const handleAddAsset = () => {
    setAssetForm({
      plateNumber: '',
      type: '',
      status: 'Active',
      driver: '',
      chainage: ''
    });
    setEditingAssetId(null);
    setIsAssetModalOpen(true);
  };

  const handleEditAsset = (asset: Vehicle) => {
    setAssetForm({
      id: asset.id,
      plateNumber: asset.plateNumber,
      type: asset.type,
      status: asset.status,
      driver: asset.driver,
      agencyId: asset.agencyId || '',
      chainage: asset.chainage,
      gpsLocation: asset.gpsLocation
    });
    setEditingAssetId(asset.id);
    setIsAssetModalOpen(true);
  };

  const canDelete = userRole === UserRole.ADMIN || userRole === UserRole.PROJECT_MANAGER;
  
  const handleDeleteAsset = (assetId: string) => {
    if (!canDelete) {
      alert('Only Admin and Project Manager can delete assets');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    
    const updatedAssets = assets.filter(asset => asset.id !== assetId);
    onProjectUpdate({
      ...project,
      vehicles: updatedAssets
    });
  };

  const handleShowQRCode = (asset: Vehicle) => {
    setSelectedAsset(asset);
    setIsQRModalOpen(true);
  };

  const handleSaveAsset = () => {
    // Validation
    if (!assetForm.plateNumber?.trim()) {
      alert('Plate number is required');
      return;
    }
    
    if (!assetForm.type?.trim()) {
      alert('Asset type is required');
      return;
    }

    if (editingAssetId) {
      // Update existing asset
      const updatedAssets = assets.map(asset => 
        asset.id === editingAssetId 
          ? { 
              ...asset, 
              ...assetForm,
              agencyId: assetForm.agencyId || undefined,
              chainage: assetForm.chainage,
              gpsLocation: assetForm.gpsLocation
            } 
          : asset
      );
      
      onProjectUpdate({
        ...project,
        vehicles: updatedAssets
      });
    } else {
      // Add new asset
      const newAsset: Vehicle = {
        id: `asset-${Date.now()}`,
        name: assetForm.plateNumber || 'Unnamed Asset',
        description: assetForm.type || '',
        category: assetForm.type || 'Equipment',
        unit: 'unit',
        quantity: 1,
        location: assetForm.chainage || 'Site',
        lastUpdated: new Date().toISOString(),
        plateNumber: assetForm.plateNumber,
        type: assetForm.type,
        status: assetForm.status || 'Active',
        driver: assetForm.driver || '',
        agencyId: assetForm.agencyId || undefined,
        chainage: assetForm.chainage,
        gpsLocation: assetForm.gpsLocation
      };
      
      onProjectUpdate({
        ...project,
        vehicles: [...assets, newAsset]
      });
    }
    
    setIsAssetModalOpen(false);
    setAssetForm({
      plateNumber: '',
      type: '',
      status: 'Active',
      driver: '',
      chainage: ''
    });
    setEditingAssetId(null);
  };

  return (
    <Box className="animate-in fade-in duration-500">
      <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
          <Box>
              <Typography variant="h5" fontWeight="900">Asset & Equipment Registry</Typography>
              <Typography variant="body2" color="text.secondary">Equipment fleet management and operational status tracking</Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" startIcon={<History size={16}/>} sx={{ borderRadius: 2, paddingX: 1.5, paddingY: 0.75 }}>Asset Logs</Button>
              <Button 
                variant="contained" 
                startIcon={<Car size={16}/>} 
                sx={{ borderRadius: 2, paddingX: 1.5, paddingY: 0.75 }}
                onClick={handleAddAsset}
              >
                Add Asset
              </Button>
          </Stack>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', mb: 2 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ bgcolor: 'slate.50', borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Asset Inventory" icon={<Package size={18}/>} iconPosition="start" />
              <Tab label="Maintenance Schedule" icon={<Wrench size={18}/>} iconPosition="start" />
              <Tab label="Utilization Reports" icon={<TrendingDown size={18}/>} iconPosition="start" />
          </Tabs>

          <Box p={2}>
              {activeTab === 0 && (
                <Grid container spacing={2}>
                    {/* Stats Cards */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={1.5}>
                            <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #10b981', bgcolor: stats.active.length > 0 ? 'emerald.50/10' : 'white' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary">ACTIVE</Typography>
                                        <CheckCircle2 size={16} className="text-emerald-600"/>
                                    </Box>
                                    <Typography variant="h5" fontWeight="900" color="success.main">{stats.active.length}</Typography>
                                </CardContent>
                            </Card>
                            <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #f59e0b' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary">MAINTENANCE</Typography>
                                        <Wrench size={16} className="text-amber-600"/>
                                    </Box>
                                    <Typography variant="h5" fontWeight="900" color="warning.main">{stats.maintenance.length}</Typography>
                                </CardContent>
                            </Card>
                            <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #6366f1' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary">IDLE</Typography>
                                        <Gauge size={16} className="text-indigo-600"/>
                                    </Box>
                                    <Typography variant="h5" fontWeight="900" color="primary.main">{stats.idle.length}</Typography>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>

                    {/* Asset Table */}
                    <Grid item xs={12} md={8}>
                        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: 'slate.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Plate Number</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Agency/Contractor</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Driver</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Chainage</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {assets.map(asset => (
                                        <TableRow key={asset.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">{asset.plateNumber}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{asset.type}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                  {asset.agencyId ? (
                                                    project.agencies?.find(a => a.id === asset.agencyId)?.name || 'Unknown Agency'
                                                  ) : 'Unassigned'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip 
                                                  label={asset.status} 
                                                  size="small" 
                                                  variant="outlined"
                                                  color={
                                                    asset.status === 'Active' ? 'success' :
                                                    asset.status === 'Maintenance' ? 'warning' : 'default'
                                                  }
                                                  sx={{ height: 18, fontSize: 10 }} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{asset.driver}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{asset.chainage || 'N/A'}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton 
                                                  size="small" 
                                                  onClick={() => handleShowQRCode(asset)}
                                                >
                                                  <QrCode size={16}/>
                                                </IconButton>
                                                <IconButton 
                                                  size="small" 
                                                  onClick={() => handleEditAsset(asset)}
                                                >
                                                  <Edit size={16}/>
                                                </IconButton>
                                                <IconButton 
                                                  size="small" 
                                                  color="error"
                                                  onClick={() => handleDeleteAsset(asset.id)}
                                                >
                                                  <Trash2 size={16}/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                  <Box>
                      <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
                          <Typography variant="subtitle1" fontWeight="bold">Maintenance Schedule</Typography>
                          <Button variant="outlined" size="small" startIcon={<Filter size={14}/>}>Filter Status</Button>
                      </Box>
                      <Grid container spacing={2}>
                          {assets.map(asset => (
                              <Grid item xs={12} md={6} key={asset.id}>
                                  <Card variant="outlined" sx={{ borderRadius: 3, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
                                      <CardContent sx={{ p: 2 }}>
                                          <Box display="flex" justifyContent="space-between" mb={1.5}>
                                              <Box>
                                                  <Typography variant="caption" fontWeight="bold" color="primary">{asset.plateNumber}</Typography>
                                                  <Typography variant="subtitle2" fontWeight="bold">{asset.type}</Typography>
                                              </Box>
                                              <Chip 
                                                label={asset.status} 
                                                size="small" 
                                                color={asset.status === 'Active' ? 'success' : asset.status === 'Maintenance' ? 'warning' : 'default'} 
                                                sx={{ fontWeight: 'bold', fontSize: 9 }} 
                                              />
                                          </Box>
                                          <Divider sx={{ mb: 1.5 }} />
                                          <Box display="flex" justifyContent="space-between" alignItems="center">
                                              <Typography variant="caption" color="text.secondary">Driver: {asset.driver}</Typography>
                                              <Typography variant="body2" fontWeight="bold">{asset.status}</Typography>
                                          </Box>
                                      </CardContent>
                                  </Card>
                              </Grid>
                          ))}
                          {assets.length === 0 && (
                              <Grid item xs={12}>
                                  <Box py={8} textAlign="center" border="1px dashed #e2e8f0" borderRadius={4}>
                                      <Car size={48} className="text-slate-200 mx-auto mb-2"/>
                                      <Typography color="text.secondary">No assets registered.</Typography>
                                  </Box>
                              </Grid>
                          )}
                      </Grid>
                  </Box>
              )}
              
              {activeTab === 2 && (
                  <Box>
                      <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
                          <Typography variant="subtitle1" fontWeight="bold">Utilization Reports</Typography>
                          <Button variant="outlined" size="small" startIcon={<Filter size={14}/>}>Filter Period</Button>
                      </Box>
                      <Grid container spacing={2}>
                          {assets.map(asset => (
                              <Grid item xs={12} md={6} key={asset.id}>
                                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                      <CardContent sx={{ p: 2 }}>
                                          <Box display="flex" justifyContent="space-between" mb={1.5}>
                                              <Box>
                                                  <Typography variant="caption" fontWeight="bold" color="primary">{asset.plateNumber}</Typography>
                                                  <Typography variant="subtitle2" fontWeight="bold">{asset.type}</Typography>
                                              </Box>
                                              <Chip 
                                                label={asset.status} 
                                                size="small" 
                                                color={asset.status === 'Active' ? 'success' : asset.status === 'Maintenance' ? 'warning' : 'default'} 
                                                sx={{ fontWeight: 'bold', fontSize: 9 }} 
                                              />
                                          </Box>
                                          <Divider sx={{ mb: 1.5 }} />
                                          <Box>
                                              <Typography variant="caption" color="text.secondary">Driver: {asset.driver}</Typography>
                                              <LinearProgress 
                                                variant="determinate" 
                                                value={asset.status === 'Active' ? 75 : asset.status === 'Maintenance' ? 20 : 50} 
                                                sx={{ height: 6, borderRadius: 3, mt: 1 }} 
                                              />
                                              <Typography variant="caption" align="right" display="block" mt={0.5}>
                                                Utilization: {asset.status === 'Active' ? '75%' : asset.status === 'Maintenance' ? '20%' : '50%'}
                                              </Typography>
                                          </Box>
                                      </CardContent>
                                  </Card>
                              </Grid>
                          ))}
                          {assets.length === 0 && (
                              <Grid item xs={12}>
                                  <Box py={8} textAlign="center" border="1px dashed #e2e8f0" borderRadius={4}>
                                      <Car size={48} className="text-slate-200 mx-auto mb-2"/>
                                      <Typography color="text.secondary">No assets registered.</Typography>
                                  </Box>
                              </Grid>
                          )}
                      </Grid>
                  </Box>
              )}
          </Box>
      </Paper>

      {/* Asset Modal */}
      <Dialog open={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Car className="text-indigo-600" /> {editingAssetId ? 'Edit Asset' : 'Add New Asset'}
          </DialogTitle>
          <DialogContent>
              <Stack spacing={3} mt={3}>
                  <Grid container spacing={2}>
                      <Grid item xs={12}><TextField fullWidth label="Plate Number" value={assetForm.plateNumber} onChange={e => setAssetForm({...assetForm, plateNumber: e.target.value})} size="small" required /></Grid>
                      <Grid item xs={12}><TextField fullWidth label="Asset Type" value={assetForm.type} onChange={e => setAssetForm({...assetForm, type: e.target.value})} size="small" required /></Grid>
                      <Grid item xs={6}>
                        <TextField 
                          fullWidth 
                          label="Status" 
                          select
                          value={assetForm.status} 
                          onChange={e => setAssetForm({...assetForm, status: e.target.value as any})} 
                          size="small"
                          SelectProps={{ native: true }}
                        >
                          <option value="Active">Active</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Idle">Idle</option>
                        </TextField>
                      </Grid>
                      <Grid item xs={6}><TextField fullWidth label="Assigned Driver" value={assetForm.driver} onChange={e => setAssetForm({...assetForm, driver: e.target.value})} size="small" /></Grid>
                      <Grid item xs={6}><TextField fullWidth label="Chainage (km)" value={assetForm.chainage || ''} onChange={e => setAssetForm({...assetForm, chainage: e.target.value})} size="small" placeholder="e.g., 0+250" /></Grid>
                      <Grid item xs={12}>
                        <TextField 
                          fullWidth 
                          label="Assigned Agency/Contractor" 
                          select
                          value={assetForm.agencyId || ''}
                          onChange={e => setAssetForm({...assetForm, agencyId: e.target.value})}
                          size="small"
                          SelectProps={{ native: true }}
                        >
                          <option value="">None</option>
                          {project.agencies?.filter(a => a.type === 'agency' || a.type === 'subcontractor').map(agency => (
                            <option key={agency.id} value={agency.id}>{agency.name}</option>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight="bold">GPS Location</Typography>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<Gauge size={14} />}
                            onClick={() => {
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                  (position) => {
                                    setAssetForm({
                                      ...assetForm,
                                      gpsLocation: {
                                        latitude: position.coords.latitude,
                                        longitude: position.coords.longitude,
                                        timestamp: new Date().toISOString(),
                                        accuracy: position.coords.accuracy,
                                        speed: position.coords.speed || 0,
                                        heading: position.coords.heading || 0
                                      }
                                    });
                                  },
                                  (error) => {
                                    console.error('Error getting location:', error);
                                    alert('Could not retrieve location. Please ensure location services are enabled.');
                                  }
                                );
                              } else {
                                alert('Geolocation is not supported by this browser.');
                              }
                            }}
                          >
                            Get Current Location
                          </Button>
                        </Box>
                        {assetForm.gpsLocation && (
                          <Box mt={1} p={1} bgcolor="slate.50" borderRadius={1}>
                            <Typography variant="caption">
                              Lat: {assetForm.gpsLocation.latitude.toFixed(6)}, Lng: {assetForm.gpsLocation.longitude.toFixed(6)}
                              {assetForm.gpsLocation.accuracy && `, Acc: ${assetForm.gpsLocation.accuracy.toFixed(2)}m`}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                  </Grid>
              </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
              <Button onClick={() => setIsAssetModalOpen(false)} startIcon={<X />}>Cancel</Button>
              <Button variant="contained" startIcon={<Save />} onClick={handleSaveAsset}>
                {editingAssetId ? 'Update Asset' : 'Add Asset'}
              </Button>
          </DialogActions>
      </Dialog>
      
      {/* QR Code Modal */}
      <Dialog open={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <QrCode className="text-indigo-600" /> Asset QR Code
        </DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <Box display="flex" flexDirection="column" alignItems="center" py={3}>
              <QRCodeGenerator 
                value={`Asset ID: ${selectedAsset.id}
Plate: ${selectedAsset.plateNumber}
Type: ${selectedAsset.type}
Status: ${selectedAsset.status}
Driver: ${selectedAsset.driver}
Chainage: ${selectedAsset.chainage || 'N/A'}`} 
                size={256}
              />
              <Box mt={3} p={2} bgcolor="slate.50" borderRadius={2} width="100%">
                <Typography variant="body2" fontWeight="bold" mb={1}>Asset Details:</Typography>
                <Typography variant="caption">ID: {selectedAsset.id}</Typography><br/>
                <Typography variant="caption">Plate: {selectedAsset.plateNumber}</Typography><br/>
                <Typography variant="caption">Type: {selectedAsset.type}</Typography><br/>
                <Typography variant="caption">Status: {selectedAsset.status}</Typography><br/>
                <Typography variant="caption">Driver: {selectedAsset.driver}</Typography><br/>
                <Typography variant="caption">Chainage: {selectedAsset.chainage || 'N/A'}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
          <Button onClick={() => setIsQRModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetsModule;