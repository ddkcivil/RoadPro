import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  IconButton, 
  Divider, 
  Chip,
  Collapse,
  InputAdornment
} from '@mui/material';
import { 
  Send, 
  ThumbsUp, 
  Reply, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { Comment } from '../types';

interface Props {
  entityId: string;
  entityType: 'document' | 'task' | 'structure' | 'rfi' | 'boq-item' | 'inspection' | 'photo';
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onLikeComment: (commentId: string) => void;
  onMentionUser?: (userId: string, commentId: string) => void; // Callback to trigger notifications
  users: { id: string; name: string; avatar?: string }[]; // List of users for mentions
  currentUser: { id: string; name: string; avatar?: string };
}

const CommentsPanel: React.FC<Props> = ({ 
  entityId, 
  entityType, 
  comments, 
  onAddComment, 
  onLikeComment, 
  onMentionUser, 
  users, 
  currentUser 
}) => {
  const [mentionSuggestions, setMentionSuggestions] = useState<{ id: string; name: string; avatar?: string }[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionCursorPosition, setMentionCursorPosition] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  // Function to extract user mentions from comment content
  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const matches = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      // match[2] contains the user ID in the format user:id
      const userId = match[2].replace('user:', '');
      matches.push(userId);
    }
    
    return matches;
  };
  
  const handleAddComment = () => {
    if (newComment.trim()) {
      const mentionedUsers = extractMentions(newComment);
      
      onAddComment({
        entityId,
        entityType,
        authorId: currentUser.id,
        authorName: currentUser.name,
        content: newComment.trim(),
        mentionedUserIds: mentionedUsers
      });
      
      // Trigger notifications for mentioned users
      if (mentionedUsers.length > 0 && onMentionUser) {
        mentionedUsers.forEach(userId => {
          // Find the comment ID that was just created (this is a simplified approach)
          // In a real implementation, you'd need to handle this differently
          onMentionUser(userId, 'pending-comment-id');
        });
      }
      
      setNewComment('');
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const rootComments = comments.filter(comment => !comment.parentId);
  const childComments = comments.filter(comment => comment.parentId);

  return (
    <Box>
      <Box display="flex" alignItems="flex-end" gap={1} mb={2}>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleAddComment} color="primary">
                  <Send size={18} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <List sx={{ pb: 0 }}>
        {rootComments.map((comment) => {
          const replies = childComments.filter(reply => reply.parentId === comment.id);
          const isExpanded = expandedReplies[comment.id] ?? false;
          
          return (
            <React.Fragment key={comment.id}>
              <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                <ListItemAvatar>
                  <Avatar 
                    sx={{ width: 32, height: 32, fontSize: '0.8rem' }}
                  >
                    {comment.authorName.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" fontWeight="bold">
                        {comment.authorName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography 
                        variant="body2" 
                        color="text.primary"
                        sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}
                      >
                        {comment.content}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <IconButton 
                          size="small" 
                          onClick={() => onLikeComment(comment.id)}
                          sx={{ color: comment.likes?.includes(currentUser.id) ? 'error.main' : 'inherit' }}
                        >
                          <ThumbsUp size={14} />
                        </IconButton>
                        <Typography variant="caption" color="text.secondary">
                          {comment.likes?.length || 0}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleReplies(comment.id)}
                        >
                          {replies.length > 0 && (
                            isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          )}
                          <Reply size={14} />
                          <Typography variant="caption" ml={0.5}>
                            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                          </Typography>
                        </IconButton>
                      </Box>
                    </React.Fragment>
                  }
                />
                <IconButton size="small">
                  <MoreHorizontal size={16} />
                </IconButton>
              </ListItem>
              
              {replies.length > 0 && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 4 }}>
                    {replies.map((reply) => (
                      <ListItem key={reply.id} alignItems="flex-start" sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ width: 28, height: 28, fontSize: '0.7rem' }}
                          >
                            {reply.authorName.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography variant="body2" fontWeight="bold">
                                {reply.authorName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(reply.timestamp).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography 
                                variant="body2" 
                                color="text.primary"
                                sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}
                              >
                                {reply.content}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => onLikeComment(reply.id)}
                                  sx={{ color: reply.likes?.includes(currentUser.id) ? 'error.main' : 'inherit' }}
                                >
                                  <ThumbsUp size={12} />
                                </IconButton>
                                <Typography variant="caption" color="text.secondary">
                                  {reply.likes?.length || 0}
                                </Typography>
                              </Box>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                    <ListItem sx={{ py: 0.5 }}>
                      <Box width="100%">
                        <TextField
                          size="small"
                          fullWidth
                          multiline
                          rows={1}
                          placeholder="Write a reply..."
                          variant="outlined"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton 
                                  size="small"
                                  onClick={() => {
                                    // Handle reply submission
                                    if (newComment.trim()) {
                                      onAddComment({
                                        entityId,
                                        entityType,
                                        authorId: currentUser.id,
                                        authorName: currentUser.name,
                                        content: newComment.trim(),
                                        parentId: comment.id
                                      });
                                      setNewComment('');
                                    }
                                  }}
                                  color="primary"
                                >
                                  <Send size={14} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    </ListItem>
                  </List>
                </Collapse>
              )}
              <Divider variant="inset" component="li" sx={{ ml: 0 }} />
            </React.Fragment>
          );
        })}
      </List>
      
      {comments.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center" py={2}>
          No comments yet. Be the first to comment!
        </Typography>
      )}
    </Box>
  );
};

export default CommentsPanel;