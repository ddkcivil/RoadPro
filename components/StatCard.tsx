import React from 'react';
import { Card, Typography, Box, LinearProgress } from '@mui/material';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard: React.FC<{
    title: string, 
    value: string | number, 
    icon: any, 
    color: string, 
    trend?: string,
}> = ({title, value, icon: Icon, color, trend}) => {
    const isPositive = trend && (trend.startsWith('+') || trend.includes('↑'));
    return (
        <Card sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            ':hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 20px 25px -5px ${color}20, 0 10px 10px -5px ${color}10`
            }
        }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="subtitle2" fontWeight="600" color="text.secondary" sx={{ opacity: 0.8 }}>{title}</Typography>
                    <Typography variant="h4" fontWeight="800" mt={1} sx={{ background: `linear-gradient(135deg, ${color} 0%, ${color} 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: `${color}1A`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.3s ease' }}>
                    <Icon size={20} strokeWidth={2.5} />
                </Box>
            </Box>
            {trend && (
                <Box display="flex" alignItems="center" gap={0.5} mt={2}>
                    {isPositive ? <ArrowUpRight size={16} color="#10b981"/> : <ArrowDownRight size={16} color="#ef4444"/>}
                    <Typography variant="caption" fontWeight="600" color={isPositive ? "#10b981" : "#ef4444"}>{trend} vs last period</Typography>
                </Box>
            )}
            <LinearProgress 
                variant="determinate" 
                value={Math.min(100, Math.abs(parseFloat(trend?.replace(/[+%]/g, '') || '0')) * 10)} 
                sx={{ 
                    height: 4, 
                    borderRadius: 2, 
                    mt: 2,
                    bgcolor: `${color}20`,
                    '& .MuiLinearProgress-bar': { 
                        background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
                        borderRadius: 2
                    } 
                }} 
            />
        </Card>
    );
};

export default StatCard;
