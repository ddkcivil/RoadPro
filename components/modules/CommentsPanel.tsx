import React, { useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Comment } from '../../types';

interface CommentsPanelProps {
  entityId: string;
  entityType: 'document' | 'task' | 'structure' | 'rfi' | 'boq-item' | 'inspection' | 'photo';
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  currentUser: { id: string; name: string };
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({
  entityId,
  entityType,
  comments,
  onAddComment,
  currentUser
}) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment({
        entityId,
        entityType,
        authorId: currentUser.id,
        authorName: currentUser.name,
        content: newComment.trim()
      });
      setNewComment('');
    }
  };

  return (
    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
      <Typography variant="h6" gutterBottom>
        Comments
      </Typography>
      <List>
        {comments.map((comment) => (
          <ListItem key={comment.id} alignItems="flex-start">
            <ListItemText
              primary={`${comment.authorName}`}
              secondary={
                <>
                  <Typography
                    sx={{ display: 'inline' }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {comment.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {/* {new Date(comment.timestamp).toLocaleString()} */}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', mt: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          variant="outlined"
          size="small"
        />
        <Button
          onClick={handleAddComment}
          variant="contained"
          sx={{ ml: 1, alignSelf: 'flex-end', mb: 1 }}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
};

export default CommentsPanel;