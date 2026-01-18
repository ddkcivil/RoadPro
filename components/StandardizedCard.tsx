import React from 'react';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    Typography, 
    Box, 
    Chip,
    Grid,
    Divider,
    IconButton
} from '@mui/material';
import { Edit, Trash2, Plus, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

interface DataCardProps {
    title: string;
    items: { label: string; value: string | number; icon?: React.ReactNode }[];
    status?: 'active' | 'warning' | 'error' | 'success';
    actions?: React.ReactNode;
    children?: React.ReactNode;
}

const DataCard: React.FC<DataCardProps> = ({ title, items, status, actions, children }) => {
    const statusColor = {
        active: 'success',
        warning: 'warning',
        error: 'error',
        success: 'success'
    }[status || 'active'];

    return (
        <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardHeader
                title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold">{title}</Typography>
                        {status && (
                            <Chip 
                                label={status.toUpperCase()} 
                                size="small" 
                                color={statusColor as any} 
                                sx={{ fontWeight: 'bold', fontSize: 10 }} 
                            />
                        )}
                    </Box>
                }
                action={actions}
                sx={{ p: 2, bgcolor: 'slate.50' }}
            />
            <CardContent sx={{ p: 2 }}>
                {children}
                <Grid container spacing={2}>
                    {items.map((item, index) => (
                        <Grid key={index} item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                {item.icon}
                                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="bold">{item.value}</Typography>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

interface ListCardProps {
    title: string;
    items: { primary: string; secondary?: string; status?: 'active' | 'warning' | 'error' | 'success'; actions?: React.ReactNode }[];
    emptyMessage?: string;
    actions?: React.ReactNode;
}

const ListCard: React.FC<ListCardProps> = ({ title, items, emptyMessage = 'No items found', actions }) => {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardHeader
                title={<Typography variant="h6" fontWeight="bold">{title}</Typography>}
                action={actions}
                sx={{ p: 2, bgcolor: 'slate.50' }}
            />
            <CardContent sx={{ p: 0 }}>
                {items.length > 0 ? (
                    <Box>
                        {items.map((item, index) => (
                            <React.Fragment key={index}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ '&:hover': { bgcolor: 'slate.50' } }}>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">{item.primary}</Typography>
                                        {item.secondary && <Typography variant="caption" color="text.secondary">{item.secondary}</Typography>}
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        {item.status && (
                                            <Chip 
                                                label={item.status.toUpperCase()} 
                                                size="small" 
                                                color={item.status as any} 
                                                sx={{ fontWeight: 'bold', fontSize: 10 }} 
                                            />
                                        )}
                                        {item.actions}
                                    </Box>
                                </Box>
                                {index < items.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </Box>
                ) : (
                    <Box p={3} textAlign="center">
                        <Typography color="text.secondary">{emptyMessage}</Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export { DataCard, ListCard };