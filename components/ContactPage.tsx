import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Container, 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  IconButton,
  Avatar,
  Link
} from '@mui/material';
import { 
  HardHat, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Twitter,
  Facebook,
  Linkedin,
  Instagram
} from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send the form data to a backend
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

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
              Contact Us
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5 }}>
              Get in touch with our team
            </Typography>
          </div>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
          Have questions about RoadMaster.Pro? Interested in learning more about our platform? 
          Reach out to us using any of the channels below, and our team will get back to you promptly.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="700" gutterBottom>
                Send us a message
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      multiline
                      rows={5}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="large" 
                      fullWidth
                      sx={{ 
                        py: 1.5, 
                        borderRadius: 2, 
                        fontWeight: 700,
                        textTransform: 'none'
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="700" gutterBottom>
                Contact Information
              </Typography>
              
              <Box display="flex" alignItems="flex-start" gap={2} mb={3}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: 'primary.main', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  mt: 0.5
                }}>
                  <MapPin size={18} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="700">Address</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Global Platform<br />
                    Connecting Teams Worldwide
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="flex-start" gap={2} mb={3}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: 'primary.main', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  mt: 0.5
                }}>
                  <Phone size={18} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="700">Phone</Typography>
                  <Typography variant="body2" color="text.secondary">
                    For support inquiries:<br />
                    <Link href="tel:+1234567890" color="primary" underline="hover">+1 (234) 567-8900</Link>
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="flex-start" gap={2} mb={3}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: 'primary.main', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  mt: 0.5
                }}>
                  <Mail size={18} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="700">Email</Typography>
                  <Typography variant="body2" color="text.secondary">
                    General inquiries:<br />
                    <Link href="mailto:info@roadmasterpro.com" color="primary" underline="hover">info@roadmasterpro.com</Link><br />
                    Support:<br />
                    <Link href="mailto:support@roadmasterpro.com" color="primary" underline="hover">support@roadmasterpro.com</Link>
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="flex-start" gap={2} mb={3}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: 'primary.main', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  mt: 0.5
                }}>
                  <Globe size={18} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="700">Website</Typography>
                  <Typography variant="body2" color="text.secondary">
                    <Link href="https://www.roadmasterpro.com" color="primary" underline="hover" target="_blank">
                      www.roadmasterpro.com
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ mt: 4, borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="700" gutterBottom>
                Follow Us
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Stay connected with us on social media for updates and news.
              </Typography>
              <Box display="flex" gap={2}>
                <IconButton 
                  href="#" 
                  target="_blank" 
                  sx={{ 
                    bgcolor: '#1da1f2', 
                    color: 'white',
                    '&:hover': { bgcolor: '#0d8bd9' }
                  }}
                >
                  <Twitter size={18} />
                </IconButton>
                <IconButton 
                  href="#" 
                  target="_blank" 
                  sx={{ 
                    bgcolor: '#1877f2', 
                    color: 'white',
                    '&:hover': { bgcolor: '#0d66d0' }
                  }}
                >
                  <Facebook size={18} />
                </IconButton>
                <IconButton 
                  href="#" 
                  target="_blank" 
                  sx={{ 
                    bgcolor: '#0077b5', 
                    color: 'white',
                    '&:hover': { bgcolor: '#005885' }
                  }}
                >
                  <Linkedin size={18} />
                </IconButton>
                <IconButton 
                  href="#" 
                  target="_blank" 
                  sx={{ 
                    bgcolor: '#e1306c', 
                    color: 'white',
                    '&:hover': { bgcolor: '#c1275c' }
                  }}
                >
                  <Instagram size={18} />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Card variant="outlined" sx={{ mt: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="700" gutterBottom>
            Office Hours
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" fontWeight="600" color="primary">Business Hours</Typography>
              <Typography variant="body2" color="text.secondary">Monday - Friday: 9:00 AM - 6:00 PM EST</Typography>
              <Typography variant="body2" color="text.secondary">Saturday: 10:00 AM - 2:00 PM EST</Typography>
              <Typography variant="body2" color="text.secondary">Sunday: Closed</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" fontWeight="600" color="primary">Support Availability</Typography>
              <Typography variant="body2" color="text.secondary">24/7 Online Support</Typography>
              <Typography variant="body2" color="text.secondary">Phone Support: Business Hours</Typography>
              <Typography variant="body2" color="text.secondary">Email Response: Within 24 hours</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ContactPage;