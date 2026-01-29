import React from 'react';
import { Box, Typography } from '@mui/material';
import { Project, AppSettings, UserRole } from '../../types';

interface BOQManagerProps {
  project: Project;
  settings: AppSettings;
  userRole: UserRole;
  onProjectUpdate: (project: Project) => void;
  compactView?: boolean;
}

const BOQManager: React.FC<BOQManagerProps> = ({ 
  project, 
  settings, 
  userRole, 
  onProjectUpdate,
  compactView = false
}) => {
  return (
    <Box sx={{ p: compactView ? 1 : 3 }}>
      <Typography variant="h6" gutterBottom>
        Bill of Quantities Manager
      </Typography>
      <Typography variant="body2" color="text.secondary">
        BOQ management interface would appear here
      </Typography>
    </Box>
  );
};

export default BOQManager;