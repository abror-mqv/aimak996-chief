import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const MIN_SEARCH_LENGTH = 3;

const SearchBar = ({ onSearch }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [showMinLengthWarning, setShowMinLengthWarning] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedTerm = searchTerm.trim();
      if (trimmedTerm !== debouncedTerm) {
        setDebouncedTerm(trimmedTerm);
        if (trimmedTerm.length >= MIN_SEARCH_LENGTH || trimmedTerm.length === 0) {
          onSearch(trimmedTerm);
          setShowMinLengthWarning(false);
        } else if (trimmedTerm.length > 0) {
          setShowMinLengthWarning(true);
        }
      }
    }, 1000); // Задержка в 1 секунду

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length === 0) {
      setShowMinLengthWarning(false);
    }
  };

  const getHelperText = () => {
    if (showMinLengthWarning) {
      return t('search.minLength');
    }
    return t('search.placeholder');
  };

  const getHelperColor = () => {
    return showMinLengthWarning ? "error" : "text.secondary";
  };

  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        placeholder={t('search.placeholder')}
        value={searchTerm}
        onChange={handleSearchChange}
        error={showMinLengthWarning}
        helperText={getHelperText()}
        FormHelperTextProps={{
          sx: {
            color: getHelperColor(),
            marginLeft: '14px',
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color={showMinLengthWarning ? "error" : "action"} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'white',
            '&:hover': {
              '& > fieldset': {
                borderColor: (theme) => 
                  showMinLengthWarning ? theme.palette.error.main : theme.palette.primary.main,
              }
            },
          }
        }}
      />
    </Box>
  );
};

export default SearchBar; 