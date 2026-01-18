import React from 'react';
import { Typography, Box } from '@mui/material';
import { useI18n } from '../contexts/I18nContext';
import { formatDate, formatTime, formatCurrency, formatNumber } from '../utils/i18nUtils';

interface LocaleFormatterProps {
  date?: Date | string;
  time?: Date | string;
  currencyAmount?: number;
  currencyCode?: string;
  numberValue?: number;
  options?: Intl.DateTimeFormatOptions | Intl.NumberFormatOptions;
  variant?: 'date' | 'time' | 'datetime' | 'currency' | 'number';
  showLabel?: boolean;
}

const LocaleFormatter: React.FC<LocaleFormatterProps> = ({
  date,
  time,
  currencyAmount,
  currencyCode = 'USD',
  numberValue,
  options = {},
  variant = 'date',
  showLabel = true
}) => {
  const { language } = useI18n();
  
  let formattedValue = '';
  let label = '';
  
  switch (variant) {
    case 'date':
      if (date) {
        formattedValue = formatDate(date, language, options);
        label = 'Date';
      }
      break;
    case 'time':
      if (time) {
        formattedValue = formatTime(time, language, options);
        label = 'Time';
      }
      break;
    case 'datetime':
      if (date) {
        const datePart = formatDate(date, language);
        const timePart = time ? formatTime(time, language) : formatTime(date, language);
        formattedValue = `${datePart} ${timePart}`;
        label = 'Date & Time';
      }
      break;
    case 'currency':
      if (currencyAmount !== undefined) {
        formattedValue = formatCurrency(currencyAmount, currencyCode, language);
        label = 'Currency';
      }
      break;
    case 'number':
      if (numberValue !== undefined) {
        formattedValue = formatNumber(numberValue, language, options);
        label = 'Number';
      }
      break;
  }
  
  return (
    <Box>
      {showLabel && (
        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
          {label}:
        </Typography>
      )}
      <Typography component="span" variant="body2">
        {formattedValue}
      </Typography>
    </Box>
  );
};

export default LocaleFormatter;