import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Container, 
  Typography, 
  Grid, 
  Avatar, 
  Chip,
  Divider
} from '@mui/material';
import { 
  HardHat, 
  Building2, 
  Users, 
  Calendar,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={6}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Box sx={{ 
            width: 56, 
            height: 56, 
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white' 
          }}>
            <HardHat size={28} />
          </Box>
          <div>
            <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: '-0.04em' }}>
              About RoadMaster<span style={{ color: '#818cf8' }}>.Pro</span>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5 }}>
              Infrastructure Management System
            </Typography>
          </div>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
          RoadMaster.Pro is a comprehensive construction and infrastructure management platform designed to streamline 
          project execution, enhance collaboration, and optimize resource allocation across all phases of construction projects.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="700" gutterBottom>
                Our Mission
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                To revolutionize the construction industry by providing an integrated platform that connects all stakeholders, 
                simplifies complex workflows, and delivers real-time insights for smarter decision-making.
              </Typography>
              
              <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mt: 3 }}>
                What We Do
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                RoadMaster.Pro offers end-to-end project management solutions covering commercial operations, 
                partner coordination, execution tracking, quality assurance, and resource management. Our platform 
                bridges the gap between planning and execution, ensuring seamless project delivery.
              </Typography>
              
              <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mt: 3 }}>
                Key Features
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Box sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: 'primary.main', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white' 
                    }}>
                      <Calendar size={18} />
                    </Box>
                    <Typography variant="body2" fontWeight="600">Real-time Scheduling</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Box sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: 'primary.main', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white' 
                    }}>
                      <Building2 size={18} />
                    </Box>
                    <Typography variant="body2" fontWeight="600">Project Management</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Box sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: 'primary.main', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white' 
                    }}>
                      <Award size={18} />
                    </Box>
                    <Typography variant="body2" fontWeight="600">Quality Assurance</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Box sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: 'primary.main', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white' 
                    }}>
                      <Users size={18} />
                    </Box>
                    <Typography variant="body2" fontWeight="600">Team Collaboration</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="700" gutterBottom>
                Company Info
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' 
                  }}
                >
                  <HardHat size={32} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="700">RoadMaster.Pro</Typography>
                  <Typography variant="body2" color="text.secondary">Infrastructure Solutions</Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" fontWeight="700" gutterBottom>
                Founded
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                2024
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" fontWeight="700" gutterBottom>
                Headquarters
              </Typography>
              <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <MapPin size={16} color="#6366f1" />
                <Typography variant="body2" color="text.secondary">
                  Global Platform
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" fontWeight="700" gutterBottom>
                Specialties
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip label="Construction" size="small" sx={{ mb: 1 }} />
                <Chip label="Project Management" size="small" sx={{ mb: 1 }} />
                <Chip label="Infrastructure" size="small" sx={{ mb: 1 }} />
                <Chip label="Collaboration" size="small" sx={{ mb: 1 }} />
                <Chip label="Analytics" size="small" sx={{ mb: 1 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Card variant="outlined" sx={{ mt: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="700" gutterBottom>
            Our Vision
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            To become the leading infrastructure management platform globally, connecting millions of professionals 
            and enabling the successful completion of critical construction projects worldwide. We envision a future 
            where technology eliminates inefficiencies, enhances safety, and accelerates project timelines.
          </Typography>
          
          <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mt: 3 }}>
            Core Values
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center" p={2}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  bgcolor: 'primary.main', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mx: 'auto', 
                  mb: 2,
                  color: 'white'
                }}>
                  <Globe size={20} />
                </Box>
                <Typography variant="h6" fontWeight="700">Integrity</Typography>
                <Typography variant="body2" color="text.secondary">
                  Honest and transparent practices in all our interactions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center" p={2}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  bgcolor: 'primary.main', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mx: 'auto', 
                  mb: 2,
                  color: 'white'
                }}>
                  <Award size={20} />
                </Box>
                <Typography variant="h6" fontWeight="700">Excellence</Typography>
                <Typography variant="body2" color="text.secondary">
                  Commitment to delivering superior products and services
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center" p={2}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  bgcolor: 'primary.main', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mx: 'auto', 
                  mb: 2,
                  color: 'white'
                }}>
                  <Users size={20} />
                </Box>
                <Typography variant="h6" fontWeight="700">Collaboration</Typography>
                <Typography variant="body2" color="text.secondary">
                  Working together to achieve shared success
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AboutPage;