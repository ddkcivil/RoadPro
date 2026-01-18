import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Box, Typography, Button, Stack, IconButton } from '@mui/material';
import { Download, Copy, QrCode } from 'lucide-react';

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  title?: string;
  description?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  data, 
  size = 256, 
  title = "QR Code", 
  description = "Scan this QR code to access information" 
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  
  const handleDownload = () => {
    // Convert the SVG to a canvas for download
    const svgElement = qrRef.current?.querySelector('svg') as SVGElement;
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${title.replace(/\s+/g, '_')}_QR_Code.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
      // Could add a snackbar notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Stack spacing={2} alignItems="center">
      <Box ref={qrRef} p={2} border="1px solid" borderColor="divider" borderRadius={2} bgcolor="white">
        <QRCodeSVG 
          value={data} 
          size={size} 
          level="H" 
          includeMargin={true}
          fgColor="#000000"
          bgColor="#ffffff"
        />
      </Box>
      <Typography variant="h6" fontWeight="600">{title}</Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">{description}</Typography>
      <Stack direction="row" spacing={1}>
        <IconButton 
          size="small" 
          onClick={handleDownload}
          sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
        >
          <Download size={16} />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={handleCopy}
          sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
        >
          <Copy size={16} />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default QRCodeGenerator;