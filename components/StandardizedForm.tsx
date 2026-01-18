import React from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    Grid, 
    Card, 
    CardContent, 
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Stack
} from '@mui/material';
import { X, Save, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

interface FormField {
    name: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
    required?: boolean;
    options?: { value: string; label: string }[];
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
}

interface StandardizedFormProps {
    title: string;
    fields: FormField[];
    values: Record<string, any>;
    onChange: (name: string, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
    open: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

const StandardizedForm: React.FC<StandardizedFormProps> = ({
    title,
    fields,
    values,
    onChange,
    onSave,
    onCancel,
    open,
    onClose,
    children
}) => {
    const handleFieldChange = (name: string, value: any) => {
        onChange(name, value);
    };

    const renderField = (field: FormField) => {
        const value = values[field.name] || '';
        
        switch (field.type) {
            case 'number':
                return (
                    <TextField
                        fullWidth
                        label={field.label}
                        type="number"
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        size="small"
                        required={field.required}
                        placeholder={field.placeholder}
                    />
                );
            case 'date':
                return (
                    <TextField
                        fullWidth
                        label={field.label}
                        type="date"
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        size="small"
                        required={field.required}
                        InputLabelProps={{ shrink: true }}
                        placeholder={field.placeholder}
                    />
                );
            case 'select':
                return (
                    <TextField
                        fullWidth
                        label={field.label}
                        select
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        size="small"
                        required={field.required}
                        placeholder={field.placeholder}
                        SelectProps={{ native: true }}
                    >
                        {field.options?.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </TextField>
                );
            case 'textarea':
                return (
                    <TextField
                        fullWidth
                        label={field.label}
                        multiline
                        rows={field.rows || 3}
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        size="small"
                        required={field.required}
                        placeholder={field.placeholder}
                    />
                );
            default:
                return (
                    <TextField
                        fullWidth
                        label={field.label}
                        type={field.type || 'text'}
                        value={value}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        size="small"
                        required={field.required}
                        placeholder={field.placeholder}
                    />
                );
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {title}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} mt={3}>
                    <Grid container spacing={2}>
                        {fields.map((field, index) => (
                            <Grid key={index} item xs={field.type === 'textarea' ? 12 : 6}>
                                {renderField(field)}
                            </Grid>
                        ))}
                    </Grid>
                    {children}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
                <Button onClick={onCancel} startIcon={<X />}>Cancel</Button>
                <Button variant="contained" startIcon={<Save />} onClick={onSave}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StandardizedForm;