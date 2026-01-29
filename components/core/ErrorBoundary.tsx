import React, { Component, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Also log to a more visible place
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={3}
        >
          <Typography variant="h4" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            An error occurred while rendering the application.
          </Typography>
          {this.state.error && (
            <Box mb={3} p={2} bgcolor="error.light" borderRadius={1} maxWidth="600px">
              <Typography variant="body2" color="error.main" component="pre" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                Error: {this.state.error.message}
                {this.state.error.stack && (
                  <>
                    <br /><br />
                    Stack trace:
                    <br />
                    {this.state.error.stack}
                  </>
                )}
              </Typography>
            </Box>
          )}
          <Button
            variant="contained"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            sx={{ ml: 2 }}
          >
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
