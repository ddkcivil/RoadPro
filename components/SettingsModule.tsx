import React, { useState } from 'react';
import { Tabs, Tab, Box, TextField, Grid, Button, Switch, FormControlLabel, Typography, Divider, Paper, Stack, Alert, AlertTitle, Avatar, Chip, Card, CardContent, MenuItem, Select, InputLabel, FormControl, Slider, Autocomplete, InputAdornment, IconButton } from '@mui/material';
import { AppSettings, DashboardWidget } from '../types';
import { Settings, Image as ImageIcon, Mail, AlertCircle, Cloud, Share2, Info, Save, Palette, Lock, Globe, Database, Monitor, Smartphone, Users, Shield, Bell, Eye, BarChart3, Activity } from 'lucide-react';

interface Props {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const SettingsModule: React.FC<Props> = ({ settings, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<AppSettings>(settings);

  const handleUpdate = () => {
      onUpdate(formData);
  };

  return (
    <Box className="animate-in fade-in duration-500">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
                <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.04em' }}>System Settings</Typography>
                <Typography variant="body1" color="text.secondary">Configure your project parameters and integrations</Typography>
            </Box>
            <Button 
                variant="contained" 
                startIcon={<Save size={18} />} 
                onClick={handleUpdate} 
                sx={{ 
                    paddingX: 3, 
                    paddingY: 1, 
                    fontWeight: 700,
                    borderRadius: 2
                }}
            >
                Save Changes
            </Button>
        </Box>
        
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)} 
            sx={{ 
              bgcolor: 'background.paper', 
              borderBottom: 1, 
              borderColor: 'divider',
              minHeight: 50
            }}
          >
            <Tab 
              label="General" 
              icon={<Settings size={16}/>} 
              iconPosition="start"
              sx={{ 
                fontWeight: '600', 
                minHeight: 50,
                textTransform: 'none',
                fontSize: 14
              }} 
            />
            <Tab 
              label="Appearance" 
              icon={<Palette size={16}/>} 
              iconPosition="start"
              sx={{ 
                fontWeight: '600', 
                minHeight: 50,
                textTransform: 'none',
                fontSize: 14
              }} 
            />
            <Tab 
              label="Security" 
              icon={<Shield size={16}/>} 
              iconPosition="start"
              sx={{ 
                fontWeight: '600', 
                minHeight: 50,
                textTransform: 'none',
                fontSize: 14
              }} 
            />
            <Tab 
              label="Cloud Integrations" 
              icon={<Cloud size={16}/>} 
              iconPosition="start" 
              sx={{ 
                fontWeight: '600', 
                minHeight: 50,
                textTransform: 'none',
                fontSize: 14
              }} 
            />
            <Tab 
              label="Project Parameters" 
              icon={<Settings size={16}/>} 
              iconPosition="start"
              sx={{ 
                fontWeight: '600', 
                minHeight: 50,
                textTransform: 'none',
                fontSize: 14
              }} 
            />
            <Tab 
              label="Reporting" 
              icon={<BarChart3 size={16}/>} 
              iconPosition="start"
              sx={{ 
                fontWeight: '600', 
                minHeight: 50,
                textTransform: 'none',
                fontSize: 14
              }} 
            />
            <Tab 
              label="Notifications" 
              icon={<Bell size={16}/>} 
              iconPosition="start"
              sx={{ 
                fontWeight: '600', 
                minHeight: 50,
                textTransform: 'none',
                fontSize: 14
              }} 
            />
            <Tab 
              label="Dashboard" 
              icon={<Activity size={16}/>} 
              iconPosition="start"
              sx={{ 
                fontWeight: '600', 
                minHeight: 50,
                textTransform: 'none',
                fontSize: 14
              }} 
            />
          </Tabs>
        </Paper>

          {/* TAB 0: General */}
          <div role="tabpanel" hidden={activeTab !== 0}>
              <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">Organization Details</Typography>
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <TextField 
                              fullWidth 
                              label="Company Name" 
                              value={formData.companyName} 
                              onChange={e => setFormData({...formData, companyName: e.target.value})} 
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <TextField 
                              fullWidth 
                              label="Default Currency" 
                              select
                              value={formData.currency} 
                              onChange={e => setFormData({...formData, currency: e.target.value})} 
                              SelectProps={{ native: true }}
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                          >
                              <option value="USD">USD ($)</option>
                              <option value="NPR">NPR (Rs.)</option>
                              <option value="INR">INR (₹)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="GBP">GBP (£)</option>
                          </TextField>
                      </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">Financial Defaults</Typography>
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <TextField 
                              fullWidth 
                              label="Default VAT Rate (%)" 
                              type="number"
                              value={formData.vatRate} 
                              onChange={e => setFormData({...formData, vatRate: parseFloat(e.target.value) || 0})} 
                              size="small"
                              variant="outlined"
                              helperText="Enter VAT rate as percentage (e.g., 13 for 13%)"
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <TextField 
                              fullWidth 
                              label="Fiscal Year Start" 
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              value={formData.fiscalYearStart} 
                              onChange={e => setFormData({...formData, fiscalYearStart: e.target.value})} 
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                  </Grid>
                            
                  <Divider sx={{ my: 3 }} />
                            
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">System Configuration</Typography>
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <TextField 
                              fullWidth 
                              label="Default Timezone" 
                              select
                              value={formData.timezone || "UTC+05:45"} 
                              onChange={e => setFormData({...formData, timezone: e.target.value as string})} 
                              SelectProps={{ native: true }}
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                          >
                              <option value="UTC+05:45">Nepal Time (UTC+05:45)</option>
                              <option value="UTC+00:00">GMT (UTC+00:00)</option>
                              <option value="UTC+01:00">CET (UTC+01:00)</option>
                              <option value="UTC+05:30">IST (UTC+05:30)</option>
                              <option value="UTC-05:00">EST (UTC-05:00)</option>
                              <option value="UTC-08:00">PST (UTC-08:00)</option>
                          </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <TextField 
                              fullWidth 
                              label="Date Format" 
                              select
                              value={formData.dateFormat || "DD/MM/YYYY"} 
                              onChange={e => setFormData({...formData, dateFormat: e.target.value as string})} 
                              SelectProps={{ native: true }}
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                          >
                              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                              <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
                          </TextField>
                      </Grid>
                  </Grid>
                            
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <FormControlLabel 
                              control={<Switch checked={formData.backupEnabled || false} onChange={(e) => setFormData({...formData, backupEnabled: e.target.checked})} />} 
                              label="Enable Auto-backup" 
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <TextField 
                              fullWidth 
                              label="Backup Frequency" 
                              select
                              value={formData.backupFrequency || "daily"} 
                              onChange={e => setFormData({...formData, backupFrequency: e.target.value as string})} 
                              SelectProps={{ native: true }}
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                          >
                              <option value="hourly">Hourly</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                          </TextField>
                      </Grid>
                  </Grid>
                </CardContent>
              </Card>
          </div>
                    
          {/* TAB 1: Cloud Integrations */}
          <div role="tabpanel" hidden={activeTab !== 1}>
              <Stack spacing={3}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Box display="flex" gap={2} mb={3}>
                          <Avatar sx={{ bgcolor: '#eef2ff', color: '#4f46e5' }}><Cloud size={20}/></Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">Google Sheets Data Bridge</Typography>
                            <Typography variant="body2" color="text.secondary">Connect your project registry to a Google Spreadsheet for bi-directional updates.</Typography>
                          </Box>
                      </Box>
                      
                      <Stack spacing={2}>
                          <TextField 
                            fullWidth 
                            label="Google Spreadsheet ID" 
                            placeholder="e.g. 1aBCdEfgHijkLmNoPqRsTuVwXyZ"
                            value={formData.googleSpreadsheetId || ''} 
                            onChange={e => setFormData({...formData, googleSpreadsheetId: e.target.value})}
                            helperText="The ID is found in the URL: docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit"
                            size="small"
                            variant="outlined"
                          />
                                                    
                          <Alert severity="info" icon={<Share2 size={20}/>} sx={{ borderRadius: 2 }}>
                              <AlertTitle sx={{ fontWeight: 'bold' }}>Step 2: Grant System Permissions</AlertTitle>
                              To allow the app to read and write to your sheet, you must <strong>Share</strong> your spreadsheet with the system service email:
                              <Box sx={{ mt: 1.5, p: 1, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 1, fontFamily: 'monospace', fontSize: 12, border: '1px dashed' }}>
                                roadmaster-bot@engineering-os.iam.gserviceaccount.com
                              </Box>
                          </Alert>
                      
                          <Box p={2} bgcolor="slate.50" borderRadius={2} border="1px solid #e2e8f0">
                              <Typography variant="subtitle2" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                                  <Info size={16} className="text-indigo-600"/> Synchronized Data Maps
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                  When enabled, the system will automatically look for the following tabs in your Google Sheet:
                              </Typography>
                              <Grid container spacing={1} mt={1}>
                                  {['BOQ_Master', 'Physical_Progress', 'Financial_Ledger', 'Quality_Logs'].map(tab => (
                                      <Grid item key={tab} xs={6} md={3}>
                                          <Chip label={tab} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: 10 }} />
                                      </Grid>
                                  ))}
                              </Grid>
                          </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">Webhooks</Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>Send real-time JSON payloads to external systems (e.g. Zapier, ERP).</Typography>
                      <TextField 
                        fullWidth 
                        size="small" 
                        label="Event Notification URL" 
                        placeholder="https://hooks.zapier.com/..." 
                        variant="outlined"
                      />
                    </CardContent>
                  </Card>
              </Stack>
          </div>

          {/* TAB 2: Project Parameters */}
          <div role="tabpanel" hidden={activeTab !== 2}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">Chainage & Location</Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>Define the standard project bounds for validation.</Typography>
                  
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                          <TextField 
                              fullWidth 
                              label="Chainage Format" 
                              select
                              value="KM"
                              SelectProps={{ native: true }}
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                          >
                              <option value="KM">Km (10+000)</option>
                              <option value="M">Meters (10000)</option>
                          </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                          <TextField 
                              fullWidth 
                              label="Start Chainage (Km)" 
                              placeholder="0.000"
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                      <Grid item xs={12} md={4}>
                          <TextField 
                              fullWidth 
                              label="End Chainage (Km)" 
                              placeholder="15.000"
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                  </Grid>

                  <Box mt={3} p={2} bgcolor="#eff6ff" borderRadius={2} border="1px solid #bfdbfe">
                      <Typography variant="subtitle2" color="#1e3a8a" display="flex" alignItems="center" gap={1}>
                          <Settings size={16}/> Auto-Numbering Logic
                      </Typography>
                      <Typography variant="caption" color="#1e40af">
                          RFI and Report numbers are currently auto-generated based on the format: <strong>PREFIX-CODE-SEQUENCE</strong>. 
                      </Typography>
                  </Box>
                </CardContent>
              </Card>
          </div>

          {/* TAB 3: Reporting */}
          <div role="tabpanel" hidden={activeTab !== 3}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">Report Branding</Typography>
                  
                  <Grid container spacing={4}>
                      <Grid item xs={12} md={4}>
                          <Box 
                              sx={{ 
                                  height: 150, 
                                  border: '2px dashed #cbd5e1', 
                                  borderRadius: 2, 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  color: 'text.secondary',
                                  cursor: 'pointer',
                                  '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: '#f5f7ff' }
                              }}
                          >
                              <ImageIcon size={28} />
                              <Typography variant="caption" mt={1}>Upload Company Logo</Typography>
                          </Box>
                      </Grid>
                      <Grid item xs={12} md={8}>
                          <TextField 
                              fullWidth 
                              label="Report Footer / Disclaimer Text" 
                              multiline 
                              rows={3}
                              defaultValue="This report is generated automatically. Please verify critical data on site."
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                          />
                          <Box>
                              <FormControlLabel control={<Switch defaultChecked />} label="Include Signature Block" />
                          </Box>
                      </Grid>
                  </Grid>
                </CardContent>
              </Card>
          </div>

          {/* TAB 4: Notifications */}
          <div role="tabpanel" hidden={activeTab !== 4}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">Alert Preferences</Typography>
                  
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="subtitle2" fontWeight="bold" mb={2} display="flex" alignItems="center" gap={1}>
                                  <Mail size={16}/> Email Alerts
                              </Typography>
                              <Box display="flex" flexDirection="column" gap={1}>
                                  <FormControlLabel 
                                      control={
                                        <Switch 
                                          checked={formData.notifications.enableEmail} 
                                          onChange={e => setFormData({
                                            ...formData, 
                                            notifications: {
                                              ...formData.notifications, 
                                              enableEmail: e.target.checked
                                            }
                                          })} 
                                        /> 
                                      } 
                                      label="Enable Email Notifications" 
                                  />
                                  <FormControlLabel control={<Switch defaultChecked />} label="Daily Digest Summary" />
                              </Box>
                          </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="subtitle2" fontWeight="bold" mb={2} display="flex" alignItems="center" gap={1}>
                                  <AlertCircle size={16}/> Triggers
                              </Typography>
                              <Box display="flex" flexDirection="column" gap={2}>
                                  <FormControlLabel 
                                      control={
                                        <Switch 
                                          checked={formData.notifications.notifyOverdue} 
                                          onChange={e => setFormData({
                                            ...formData, 
                                            notifications: {
                                              ...formData.notifications, 
                                              notifyOverdue: e.target.checked
                                            }
                                          })} 
                                        /> 
                                      } 
                                      label={<span style={{ color: '#ef4444' }}>Alert on Overdue Tasks</span>}
                                  />
                                  <FormControlLabel 
                                      control={
                                        <Switch 
                                          checked={formData.notifications.notifyUpcoming} 
                                          onChange={e => setFormData({
                                            ...formData, 
                                            notifications: {
                                              ...formData.notifications, 
                                              notifyUpcoming: e.target.checked
                                            }
                                          })} 
                                        /> 
                                      } 
                                      label="Alert on Upcoming Tasks" 
                                  />
                                  <FormControlLabel 
                                      control={
                                        <Switch 
                                          checked={formData.notifications.dailyDigest} 
                                          onChange={e => setFormData({
                                            ...formData, 
                                            notifications: {
                                              ...formData.notifications, 
                                              dailyDigest: e.target.checked
                                            }
                                          })} 
                                        /> 
                                      } 
                                      label="Daily Digest" 
                                  />
                              </Box>
                          </Card>
                      </Grid>
                  </Grid>
                </CardContent>
              </Card>
          </div>
          
          {/* TAB 5: Appearance */}
          <div role="tabpanel" hidden={activeTab !== 5}>
              <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">Theme Settings</Typography>
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small" variant="outlined" sx={{ mb: 2 }}>
                              <InputLabel>Theme</InputLabel>
                              <Select
                                  value="light"
                                  label="Theme"
                              >
                                  <MenuItem value="light">Light</MenuItem>
                                  <MenuItem value="dark">Dark</MenuItem>
                                  <MenuItem value="system">System Default</MenuItem>
                              </Select>
                          </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <TextField 
                              fullWidth 
                              label="Primary Color" 
                              type="color"
                              value="#3b82f6" 
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                  </Grid>
                  
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" mt={3}>Display Options</Typography>
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <FormControlLabel 
                              control={<Switch defaultChecked />} 
                              label="Compact Mode" 
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <FormControlLabel 
                              control={<Switch defaultChecked />} 
                              label="Auto-collapse Sidebar" 
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                  </Grid>
                  
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" mt={3}>Language & Localization</Typography>
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small" variant="outlined" sx={{ mb: 2 }}>
                              <InputLabel>Language</InputLabel>
                              <Select
                                  value="en"
                                  label="Language"
                              >
                                  <MenuItem value="en">English</MenuItem>
                                  <MenuItem value="np">Nepali</MenuItem>
                                  <MenuItem value="hi">Hindi</MenuItem>
                                  <MenuItem value="de">German</MenuItem>
                                  <MenuItem value="fr">French</MenuItem>
                                  <MenuItem value="es">Spanish</MenuItem>
                              </Select>
                          </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <FormControlLabel 
                              control={<Switch defaultChecked />} 
                              label="Show Language Selector" 
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                  </Grid>
                </CardContent>
              </Card>
          </div>
          
          {/* TAB 6: Security */}
          <div role="tabpanel" hidden={activeTab !== 6}>
              <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">Password Policy</Typography>
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <TextField 
                              fullWidth 
                              label="Minimum Password Length" 
                              type="number"
                              value={8} 
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <FormControlLabel 
                              control={<Switch defaultChecked />} 
                              label="Require Numbers" 
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                  </Grid>
                  
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <FormControlLabel 
                              control={<Switch defaultChecked />} 
                              label="Require Special Characters" 
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <FormControlLabel 
                              control={<Switch defaultChecked />} 
                              label="Require Uppercase" 
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                  </Grid>
                  
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" mt={3}>Session Management</Typography>
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <TextField 
                              fullWidth 
                              label="Session Timeout (minutes)" 
                              type="number"
                              value={30} 
                              size="small"
                              variant="outlined"
                              helperText="Session expires after inactivity period"
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <FormControlLabel 
                              control={<Switch />} 
                              label="Enable Two-Factor Authentication" 
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                  </Grid>
                  
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" mt={3}>Audit & Compliance</Typography>
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <FormControlLabel 
                              control={<Switch defaultChecked />} 
                              label="Enable Audit Logging" 
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <FormControlLabel 
                              control={<Switch defaultChecked />} 
                              label="Log User Actions" 
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                  </Grid>
                </CardContent>
              </Card>
          </div>
          
          {/* TAB 7: Dashboard */}
          <div role="tabpanel" hidden={activeTab !== 7}>
              <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">Dashboard Widgets</Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>Manage which widgets appear on your dashboard and their visibility.</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">Progress Tracking</Typography>
                            <Typography variant="caption" color="text.secondary">Monitor project progress metrics</Typography>
                          </Box>
                          <Switch defaultChecked />
                        </Box>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">Financial Overview</Typography>
                            <Typography variant="caption" color="text.secondary">Track budget and expenses</Typography>
                          </Box>
                          <Switch defaultChecked />
                        </Box>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">Schedule Tracking</Typography>
                            <Typography variant="caption" color="text.secondary">Monitor timeline and milestones</Typography>
                          </Box>
                          <Switch defaultChecked />
                        </Box>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">Quality Metrics</Typography>
                            <Typography variant="caption" color="text.secondary">Track quality control measures</Typography>
                          </Box>
                          <Switch defaultChecked />
                        </Box>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">Resource Allocation</Typography>
                            <Typography variant="caption" color="text.secondary">Monitor resource utilization</Typography>
                          </Box>
                          <Switch defaultChecked />
                        </Box>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">Document Status</Typography>
                            <Typography variant="caption" color="text.secondary">Track document approvals and reviews</Typography>
                          </Box>
                          <Switch defaultChecked />
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" mt={3}>Dashboard Behavior</Typography>
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <FormControlLabel 
                              control={<Switch defaultChecked />} 
                              label="Auto-refresh Charts" 
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <TextField 
                              fullWidth 
                              label="Refresh Interval (seconds)" 
                              type="number"
                              value={300} 
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                  </Grid>
                  
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small" variant="outlined" sx={{ mb: 2 }}>
                              <InputLabel>Default View</InputLabel>
                              <Select
                                  value="grid"
                                  label="Default View"
                              >
                                  <MenuItem value="grid">Grid Layout</MenuItem>
                                  <MenuItem value="list">List Layout</MenuItem>
                                  <MenuItem value="compact">Compact Layout</MenuItem>
                              </Select>
                          </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <FormControlLabel 
                              control={<Switch defaultChecked />} 
                              label="Show Charts" 
                              sx={{ mb: 2 }}
                          />
                      </Grid>
                  </Grid>
                </CardContent>
              </Card>
          </div>
    </Box>
  );
};

export default SettingsModule;