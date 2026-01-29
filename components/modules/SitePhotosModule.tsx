
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
    Box, Typography, Button, Grid, Card, CardMedia, CardContent, 
    IconButton, Stack, Chip, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField, MenuItem, Select, FormControl, 
    InputLabel, Paper, LinearProgress, Tooltip, Avatar, Divider, Alert,
    InputAdornment
} from '@mui/material';
import { 
    Camera, Upload, Search, Filter, Sparkles, Trash2, 
    Calendar, MapPin, X,
    HardHat, History, Wifi, WifiOff
} from 'lucide-react';
import { Project, SitePhoto, UserRole } from '../../types';
import { analyzeSitePhoto } from '../../services/ai/geminiService';
import { offlineManager } from '../../utils/data/offlineUtils';

interface Props {
  project: Project;
  userRole: UserRole;
  onProjectUpdate: (project: Project) => void;
}

const PHOTO_CATEGORIES = ['General', 'Earthwork', 'Structures', 'Pavement', 'Safety'] as const;

const SitePhotosModule: React.FC<Props> = ({ project, onProjectUpdate, userRole }) => {
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState<SitePhoto | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    // Update online status when it changes
    useEffect(() => {
        const handleOnlineStatusChange = () => {
            setIsOnline(navigator.onLine);
        };
        
        window.addEventListener('online', handleOnlineStatusChange);
        window.addEventListener('offline', handleOnlineStatusChange);
        
        return () => {
            window.removeEventListener('online', handleOnlineStatusChange);
            window.removeEventListener('offline', handleOnlineStatusChange);
        };
    }, []);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadForm, setUploadForm] = useState<Partial<SitePhoto>>({
        category: 'General',
        caption: '',
        location: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [tempFile, setTempFile] = useState<File | null>(null);
    const [tempPreview, setTempPreview] = useState<string | null>(null);

    // Clean up temporary preview URL when component unmounts or when a new file is selected
    useEffect(() => {
        return () => {
            if (tempPreview && tempPreview.startsWith('blob:')) {
                URL.revokeObjectURL(tempPreview);
            }
        };
    }, [tempPreview]);

    const sitePhotos = project.sitePhotos || [];

    const filteredPhotos = useMemo(() => {
        return sitePhotos.filter(p => 
            (categoryFilter === 'All' || p.category === categoryFilter) &&
            (p.caption.toLowerCase().includes(searchTerm.toLowerCase()) || 
             p.location.toLowerCase().includes(searchTerm.toLowerCase()))
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sitePhotos, categoryFilter, searchTerm]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setTempFile(file);
            setTempPreview(URL.createObjectURL(file));
        }
    };

    const handleSavePhoto = async () => {
        if (!tempPreview) return;
        
        // Convert the temporary blob URL to base64 data to store permanently
        const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Extract just the base64 portion after the comma
                resolve(base64String.split(',')[1]);
            };
            reader.readAsDataURL(tempFile);
        });

        const newPhoto: SitePhoto = {
            id: `img-${Date.now()}`,
            url: `data:image/${tempFile!.type.split('/')[1] || 'jpeg'};base64,${base64Data as string}`, // Store as base64 data URL
            date: uploadForm.date!,
            caption: uploadForm.caption || 'Site Photo',
            location: uploadForm.location || 'Not Specified',
            category: uploadForm.category as any,
            isAnalyzed: false
        };

        // Add to offline queue if offline
        if (!navigator.onLine) {
            offlineManager.addToOfflineQueue('sitePhoto', 'create', newPhoto);
        }
        
        onProjectUpdate({
            ...project,
            sitePhotos: [...sitePhotos, newPhoto]
        });
        // Clean up the temporary blob URL
        if (tempPreview) {
            URL.revokeObjectURL(tempPreview);
        }
        setUploadModalOpen(false);
        setTempFile(null);
        setTempPreview(null);
    };

    const handleAnalyze = async (photo: SitePhoto) => {
        setIsAnalyzing(true);
        try {
            let base64 = "";
            
            if (photo.url.startsWith('data:')) {
                // If it's already a data URL, extract the base64 part
                base64 = photo.url.split(',')[1];
            } else if (photo.url.startsWith('blob:')) {
                // If it's a blob URL, fetch and convert to base64
                const response = await fetch(photo.url);
                const blob = await response.blob();
                base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(blob);
                });
            }

            const analysis = await analyzeSitePhoto(base64, photo.category);
            const updatedPhotos = project.sitePhotos?.map(p => 
                p.id === photo.id ? { ...p, aiAnalysis: analysis, isAnalyzed: true } : p
            );
            onProjectUpdate({ ...project, sitePhotos: updatedPhotos });
            if (previewPhoto?.id === photo.id) {
                setPreviewPhoto(prev => prev ? { ...prev, aiAnalysis: analysis, isAnalyzed: true } : null);
            }
        } catch (error) {
            console.error("Analysis failed", error);
            alert('Failed to analyze photo: ' + (error as Error).message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const canDelete = userRole === UserRole.ADMIN || userRole === UserRole.PROJECT_MANAGER;
    
    const handleDeletePhoto = (id: string) => {
        if (!canDelete) {
            alert('Only Admin and Project Manager can delete photos');
            return;
        }
        
        if (confirm("Delete this site photo permanently?")) {
            // Add to offline queue if offline
            if (!navigator.onLine) {
                const photoToDelete = sitePhotos.find(p => p.id === id);
                if (photoToDelete) {
                    offlineManager.addToOfflineQueue('sitePhoto', 'delete', photoToDelete);
                }
            }
            
            onProjectUpdate({ ...project, sitePhotos: sitePhotos.filter(p => p.id !== id) });
        }
    };

    return (
        <Box className="animate-in fade-in duration-500">
            <Box display="flex" justifyContent="space-between" mb={4} alignItems="center">
                <Box>
                    <Typography variant="h5" fontWeight="900">Visual Intelligence</Typography>
                    <Typography variant="body2" color="text.secondary">Site surveillance and AI-powered progress monitoring</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" startIcon={<Camera />} onClick={() => setUploadModalOpen(true)}>Capture Update</Button>
                    <Box display="flex" alignItems="center" gap={1} p={1} pl={2} pr={2} borderRadius={20} bgcolor={isOnline ? "success.light" : "warning.light"}>
                        {isOnline ? <Wifi size={16} color="#10b981" /> : <WifiOff size={16} color="#f59e0b" />}
                        <Typography variant="body2" fontWeight="600" color={isOnline ? "success.dark" : "warning.dark"}>
                            {isOnline ? "Online" : "Offline"}
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'action.hover' }}>
                <TextField 
                    size="small" placeholder="Search captions, locations..." 
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    sx={{ width: 300, '.MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} color="disabled" /></InputAdornment> }}
                />
                <Divider orientation="vertical" flexItem />
                <Box display="flex" gap={1}>
                    <Chip 
                        label="All" onClick={() => setCategoryFilter('All')} 
                        variant={categoryFilter === 'All' ? 'filled' : 'outlined'} 
                        color={categoryFilter === 'All' ? 'primary' : 'default'}
                        clickable
                        sx={{ borderRadius: 1 }}
                    />
                    {PHOTO_CATEGORIES.map(cat => (
                        <Chip 
                            key={cat} label={cat} onClick={() => setCategoryFilter(cat)}
                            variant={categoryFilter === cat ? 'filled' : 'outlined'}
                            color={categoryFilter === cat ? 'primary' : 'default'}
                            clickable
                            sx={{ borderRadius: 1 }}
                        />
                    ))}
                </Box>
            </Paper>

            <Grid container spacing={3}>
                {filteredPhotos.map(photo => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                        <Card 
                            variant="outlined" 
                            sx={{ 
                                borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s', 
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }
                            }}
                            onClick={() => setPreviewPhoto(photo)}
                        >
                            <CardMedia component="img" height="180" image={photo.url} alt={photo.caption} />
                            <CardContent sx={{ p: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Chip label={photo.category} size="small" variant="outlined" sx={{ height: 16, fontSize: 8, fontWeight: 'bold' }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Calendar size={10}/> {photo.date}</Typography>
                                </Box>
                                <Typography variant="body2" fontWeight="bold" noWrap>{photo.caption}</Typography>
                                <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}><MapPin size={10}/> {photo.location}</Typography>
                                {photo.isAnalyzed && (
                                    <Box mt={1.5} p={1} bgcolor="indigo.50" borderRadius={1} border="1px solid" borderColor="indigo.100">
                                        <Typography variant="caption" sx={{ color: 'indigo.700', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Sparkles size={10} /> AI Analyzed
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Upload Modal */}
            <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Record Field Observation</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} mt={1}>
                        <Box 
                            sx={{ height: 200, border: '2px dashed #e2e8f0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'slate.50', cursor: 'pointer', overflow: 'hidden' }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {tempPreview ? <img src={tempPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                                <Stack alignItems="center" color="text.secondary">
                                    <Upload size={32} />
                                    <Typography variant="caption">Select Site Image</Typography>
                                </Stack>
                            )}
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
                        </Box>
                        <TextField label="Observation Caption" fullWidth size="small" value={uploadForm.caption} onChange={e => setUploadForm({...uploadForm, caption: e.target.value})} />
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField label="Location" fullWidth size="small" value={uploadForm.location} onChange={e => setUploadForm({...uploadForm, location: e.target.value})} /></Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Category</InputLabel>
                                    <Select value={uploadForm.category || 'General'} label="Category" onChange={(e) => setUploadForm({...uploadForm, category: e.target.value as 'General' | 'Earthwork' | 'Structures' | 'Pavement' | 'Safety'})}>
                                        {PHOTO_CATEGORIES.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setUploadModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" startIcon={<Upload/>} onClick={handleSavePhoto} disabled={!tempPreview}>Save to Log</Button>
                </DialogActions>
            </Dialog>

            {/* Preview Modal */}
            <Dialog open={!!previewPhoto} onClose={() => setPreviewPhoto(null)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: 'slate.900' } }}>
                {previewPhoto && (
                    <Box display="flex" sx={{ height: '80vh' }}>
                        <Box flex={1} display="flex" alignItems="center" justifyContent="center" p={4} position="relative">
                            <img src={previewPhoto.url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />
                            <IconButton onClick={() => setPreviewPhoto(null)} sx={{ position: 'absolute', top: 20, right: 20, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}><X/></IconButton>
                        </Box>
                        <Box width={400} bgcolor="white" p={4} sx={{ overflowY: 'auto' }}>
                            <Typography variant="h6" fontWeight="900" gutterBottom>{previewPhoto.caption}</Typography>
                            <Stack direction="row" spacing={1} mb={3}>
                                <Chip label={previewPhoto.category} size="small" color="primary" />
                                <Chip label={previewPhoto.date} size="small" variant="outlined" />
                            </Stack>
                            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1} mb={4}><MapPin size={16}/> {previewPhoto.location}</Typography>
                            
                            <Divider sx={{ my: 3 }} />
                            
                            <Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="subtitle2" fontWeight="bold">AI SITE AUDITOR</Typography>
                                    {!previewPhoto.isAnalyzed && (
                                        <Button 
                                            size="small" variant="contained" startIcon={<Sparkles size={14}/>} 
                                            onClick={() => handleAnalyze(previewPhoto)} disabled={isAnalyzing}
                                        >
                                            {isAnalyzing ? "Processing..." : "Analyze Progress"}
                                        </Button>
                                    )}
                                </Box>
                                {isAnalyzing && <LinearProgress sx={{ borderRadius: 1, mb: 2 }} />}
                                {previewPhoto.isAnalyzed ? (
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'indigo.50/30', borderRadius: 2 }}>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{previewPhoto.aiAnalysis}</Typography>
                                    </Paper>
                                ) : (
                                    <Typography variant="caption" color="text.disabled" fontStyle="italic">No automated analysis generated yet.</Typography>
                                )}
                            </Box>
                            
                            <Box mt="auto" pt={4}>
                                <Button fullWidth variant="outlined" color="error" startIcon={<Trash2/>} onClick={() => { handleDeletePhoto(previewPhoto.id); setPreviewPhoto(null); }}>Delete Record</Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Dialog>
        </Box>
    );
};

export default SitePhotosModule;
