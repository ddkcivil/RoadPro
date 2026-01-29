import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="caption" component="div" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, mt: 0.5 }}>
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="caption" sx={{ color: trend.startsWith('+') ? '#10b981' : '#ef4444' }}>
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ 
            backgroundColor: `${color}20`, 
            borderRadius: '8px', 
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={24} color={color} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;