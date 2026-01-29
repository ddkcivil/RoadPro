
import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../../types';
import { Send, Search, MoreVertical, Hash, User as UserIcon, Check, CheckCheck, MessageCircle, Mail, Phone, Paperclip, FileText, HardHat } from 'lucide-react';
import { 
    Box, 
    TextField, 
    Typography, 
    Avatar, 
    Badge, 
    IconButton,
    InputAdornment,
    Divider,
    Tooltip,
    Button
} from '@mui/material';

interface Props {
  currentUser: User | null;
  users: User[];
  messages: Message[];
  projectId: string;
  onSendMessage: (text: string, receiverId: string, projectId: string) => void;
}

const MessagesModule: React.FC<Props> = ({ currentUser, users, messages, projectId, onSendMessage }) => {
  const [activeChatId, setActiveChatId] = useState<string>('general');
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChatId]);

  const getFilteredMessages = () => {
      if (activeChatId === 'general') {
          return messages.filter(m => m.receiverId === 'general' && m.projectId === projectId);
      }
      // Direct messages between current user and selected user
      return messages.filter(m => 
          ((m.senderId === currentUser?.id && m.receiverId === activeChatId) ||
          (m.senderId === activeChatId && m.receiverId === currentUser?.id)) &&
          m.projectId === projectId
      );
  };

  const activeMessages = getFilteredMessages();

  const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputText.trim()) return;
      onSendMessage(inputText, activeChatId, projectId);
      setInputText('');
  };

  // Helper to get user details
  const getUser = (id: string) => users.find(u => u.id === id);

  const filteredUsers = users.filter(u => 
      u.id !== currentUser?.id && 
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWhatsAppClick = (phone?: string) => {
      if (!phone) {
          alert("No phone number available for this user.");
          return;
      }
      // Simple sanitize
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleEmailClick = (email?: string) => {
      if (!email) {
          alert("No email address available for this user.");
          return;
      }
      window.location.href = `mailto:${email}`;
  };

  // Mock handlers for enhancements
  const handleAttach = () => alert("Attachment Feature: Opens file picker.");
  const handleLinkRFI = () => {
      setInputText(prev => prev + "Ref: RFI/CH/12+500 ");
  };
  const handleLinkBOQ = () => {
      setInputText(prev => prev + "Ref: Item 4.01 (GSB) ");
  };

  const activeUser = getUser(activeChatId);

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {/* Sidebar */}
        <Box sx={{ width: 320, bgcolor: 'action.hover', borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            <Box p={3} borderBottom="1px solid" borderColor="divider">
                <Typography variant="h5" fontWeight="bold" color="text.primary" mb={3}>Messages</Typography>
                <TextField 
                    size="small" 
                    placeholder="Search people..." 
                    fullWidth 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search size={16} color="disabled" /></InputAdornment>
                    }}
                    sx={{ bgcolor: 'background.paper' }}
                />
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <Box px={3} py={1.5} textTransform="uppercase" fontSize="0.75rem" fontWeight="bold" color="text.secondary" mt={1}>Channels</Box>
                
                <Box 
                    onClick={() => setActiveChatId('general')}
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        px: 3, 
                        py: 2, 
                        cursor: 'pointer', 
                        transition: 'all 0.2s', 
                        bgcolor: activeChatId === 'general' ? 'primary.light' : 'transparent',
                        borderRight: activeChatId === 'general' ? '4px solid' : 'none',
                        borderColor: activeChatId === 'general' ? 'primary.main' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' }
                    }}
                >
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
                        <Hash size={20} />
                    </Box>
                    <Box>
                        <Typography variant="body2" fontWeight="600" color={activeChatId === 'general' ? 'primary.main' : 'text.primary'}>Project General</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>Team announcements</Typography>
                    </Box>
                </Box>

                <Box px={3} py={1.5} textTransform="uppercase" fontSize="0.75rem" fontWeight="bold" color="text.secondary" mt={2}>Direct Messages</Box>
                
                {filteredUsers.map(user => {
                    const lastMsg = messages.filter(m => (m.senderId === user.id && m.receiverId === currentUser?.id) || (m.senderId === currentUser?.id && m.receiverId === user.id)).pop();
                    const unreadCount = messages.filter(m => m.senderId === user.id && m.receiverId === currentUser?.id && !m.read).length;

                    return (
                        <Box 
                            key={user.id}
                            onClick={() => setActiveChatId(user.id)}
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2, 
                                px: 3, 
                                py: 2, 
                                cursor: 'pointer', 
                                transition: 'all 0.2s', 
                                bgcolor: activeChatId === user.id ? 'primary.light' : 'transparent',
                                borderRight: activeChatId === user.id ? '4px solid' : 'none',
                                borderColor: activeChatId === user.id ? 'primary.main' : 'transparent',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                            title={user.phone ? `Phone: ${user.phone}` : ''}
                        >
                             <Badge badgeContent={unreadCount} color="error" variant="dot" invisible={unreadCount === 0} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                                <Avatar 
                                    src={user.avatar}
                                    sx={{ width: 40, height: 40, bgcolor: 'secondary.light', fontSize: 14 }}
                                >
                                    {user.name.charAt(0)}
                                </Avatar>
                             </Badge>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight="600" color={activeChatId === user.id ? 'primary.main' : 'text.primary'}>{user.name}</Typography>
                                    {lastMsg && <Typography variant="caption" color="text.secondary">{new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Typography>}
                                </Box>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    {lastMsg ? (lastMsg.senderId === currentUser?.id ? 'You: ' + lastMsg.content : lastMsg.content) : user.role}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
             {/* Header */}
             <Box sx={{ minHeight: 80, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, flexShrink: 0, py: 1 }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                     {activeChatId === 'general' ? (
                         <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.contrastText', boxShadow: 2 }}>
                             <Hash size={24} />
                         </Box>
                     ) : (
                         <Avatar 
                            src={activeUser?.avatar}
                            sx={{ width: 48, height: 48, bgcolor: 'secondary.main', fontSize: 20 }}
                         >
                             {activeUser?.name.charAt(0)}
                         </Avatar>
                     )}
                     <Box>
                         <Typography variant="h6" fontWeight="bold" color="text.primary" lineHeight="1.2">
                             {activeChatId === 'general' ? 'Project General' : activeUser?.name}
                         </Typography>
                         <Typography variant="caption" color="text.secondary">
                             {activeChatId === 'general' ? `${users.length} members` : (
                                 <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: { xs: 0.25, sm: 1.5 }, mt: 0.5 }}>
                                     <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main', bgcolor: 'primary.light', px: 1, py: 0.25, borderRadius: 1 }}>{activeUser?.role}</Box>
                                     {activeUser?.phone && (
                                         <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontFamily: 'monospace', color: 'text.secondary' }}>
                                             <Phone size={12} color="disabled"/> {activeUser.phone}
                                         </Box>
                                     )}
                                     {activeUser?.email && (
                                         <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                             <Mail size={12} color="disabled"/> {activeUser.email}
                                         </Box>
                                     )}
                                 </Box>
                             )}
                         </Typography>
                     </Box>
                 </Box>
                 
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     {activeChatId !== 'general' && activeUser && (
                         <>
                             <Button 
                                variant="outlined"
                                color="inherit"
                                size="small" 
                                startIcon={<Mail size={16} />}
                                onClick={() => handleEmailClick(activeUser.email)}
                                sx={{ borderColor: 'divider', color: 'text.secondary', display: { xs: 'none', md: 'flex' } }}
                             >
                                Email
                             </Button>
                             <Button 
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<MessageCircle size={16} />}
                                onClick={() => handleWhatsAppClick(activeUser.phone)} 
                                sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' }, color: 'white', display: { xs: 'none', md: 'flex' } }}
                             >
                                WhatsApp
                             </Button>
                             
                             {/* Mobile Icons */}
                             <IconButton 
                                onClick={() => handleEmailClick(activeUser.email)} 
                                sx={{ display: { xs: 'flex', md: 'none' }, bgcolor: 'action.hover' }}
                             >
                                 <Mail size={20} color="disabled" />
                             </IconButton>
                             <IconButton 
                                onClick={() => handleWhatsAppClick(activeUser.phone)} 
                                sx={{ display: { xs: 'flex', md: 'none' }, bgcolor: 'success.light' }}
                             >
                                 <MessageCircle size={20} color="success" />
                             </IconButton>

                             <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto', mx: 1 }} />
                         </>
                     )}
                     <IconButton size="small"><MoreVertical size={20} color="disabled" /></IconButton>
                 </Box>
             </Box>

             {/* Messages */}
             <Box sx={{ flex: 1, overflowY: 'auto', p: 4, gap: 2, display: 'flex', flexDirection: 'column' }}>
                 {activeMessages.length === 0 ? (
                     <Box sx={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
                         <Box sx={{ width: 64, height: 64, bgcolor: 'action.hover', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                             {activeChatId === 'general' ? <Hash size={32} color="disabled" /> : <MessageCircle size={32} color="disabled" />}
                         </Box>
                         <Typography color="text.secondary">
                             {activeChatId === 'general' ? 'No announcements yet.' : `Start a conversation with ${activeUser?.name.split(' ')[0]}.`}
                         </Typography>
                     </Box>
                 ) : (
                     activeMessages.map((msg, index) => {
                         const isMe = msg.senderId === currentUser?.id;
                         const sender = getUser(msg.senderId);
                         const showHeader = index === 0 || activeMessages[index-1].senderId !== msg.senderId;
             
                         return (
                             <Box key={msg.id} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                 <Box sx={{ display: 'flex', maxWidth: '70%', flexDirection: isMe ? 'row-reverse' : 'row', gap: 2 }}>
                                     {!isMe && showHeader && (
                                         <Avatar 
                                            src={sender?.avatar}
                                            sx={{ width: 32, height: 32, fontSize: 12, bgcolor: isMe ? 'primary.main' : 'secondary.light' }}
                                         >
                                             {sender?.name.charAt(0)}
                                         </Avatar>
                                     )}
                                     {!isMe && !showHeader && <Box sx={{ width: 32 }} />} {/* Spacer */}
                                                  
                                     <Box>
                                         {showHeader && !isMe && <Typography variant="caption" color="text.secondary" ml={0.5} mb={0.5}>{sender?.name}</Typography>}
                                         <Box sx={{ 
                                             p: 2, 
                                             borderRadius: '20px', 
                                             boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
                                             fontSize: '0.875rem', 
                                             position: 'relative', 
                                             '&:hover': { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
                                             bgcolor: isMe ? 'primary.main' : 'background.paper',
                                             color: isMe ? 'primary.contrastText' : 'text.primary',
                                             borderTopRightRadius: isMe ? '4px' : '20px',
                                             borderTopLeftRadius: isMe ? '20px' : '4px',
                                             border: isMe ? 'none' : '1px solid',
                                             borderColor: isMe ? 'transparent' : 'divider'
                                         }}>
                                             {msg.content}
                                             <Box sx={{ 
                                                 fontSize: '0.75rem', 
                                                 mt: 0.5, 
                                                 display: 'flex', 
                                                 alignItems: 'center', 
                                                 justifyContent: 'flex-end', 
                                                 gap: 0.5, 
                                                 color: isMe ? 'primary.light' : 'text.secondary'
                                             }}>
                                                 {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                 {isMe && (msg.read ? <CheckCheck size={12}/> : <Check size={12}/>)}  {/* Only TWO closing braces here */}
                                             </Box>
                                         </Box>
                                     </Box>
                                 </Box>
                             </Box>
                         );
                     })
                 )}
                 <Box ref={messagesEndRef} />
             </Box>

             {/* Input Area with Enhanced Toolbar */}
             <Box sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', p: 2 }}>
                 <Box sx={{ display: 'flex', gap: 1, mb: 1, px: 1 }}>
                     <Tooltip title="Attach File">
                         <IconButton size="small" onClick={handleAttach} sx={{ bgcolor: 'action.hover' }}><Paperclip size={18} color="disabled" /></IconButton>
                     </Tooltip>
                     <Tooltip title="Link RFI">
                         <IconButton size="small" onClick={handleLinkRFI} sx={{ bgcolor: 'action.hover' }}><HardHat size={18} color="disabled" /></IconButton>
                     </Tooltip>
                     <Tooltip title="Link BOQ Item">
                         <IconButton size="small" onClick={handleLinkBOQ} sx={{ bgcolor: 'action.hover' }}><FileText size={18} color="disabled" /></IconButton>
                     </Tooltip>
                 </Box>
                 <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
                     <TextField 
                         fullWidth 
                         placeholder={`Message ${activeChatId === 'general' ? '#general' : activeUser?.name.split(' ')[0]}...`}
                         value={inputText}
                         onChange={(e) => setInputText(e.target.value)}
                         variant="outlined"
                         size="medium"
                         sx={{ 
                             '& .MuiOutlinedInput-root': {
                                 borderRadius: 4,
                                 bgcolor: 'action.hover',
                                 '& fieldset': { borderColor: 'divider' }
                             }
                         }}
                     />
                     <IconButton 
                         type="submit" 
                         disabled={!inputText.trim()}
                         sx={{ 
                             bgcolor: 'primary.main', 
                             color: 'primary.contrastText', 
                             width: 56, 
                             height: 56, 
                             borderRadius: 4,
                             '&:hover': { bgcolor: 'primary.dark' },
                             '&.Mui-disabled': { bgcolor: 'action.disabled', color: 'action.disabled' }
                         }}
                     >
                         <Send size={24} />
                     </IconButton>
                 </form>
             </Box>
        </Box>
    </Box>
  );
};

export default MessagesModule;
