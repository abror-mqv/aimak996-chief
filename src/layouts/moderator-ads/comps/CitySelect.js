import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography
} from '@mui/material';

const CitySelect = ({ cities, selectedCity, onCityChange }) => {
  const { t } = useTranslation();
  
  const handleCityChange = (event, newCityId) => {
    if (newCityId !== null) {
      onCityChange(newCityId);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="subtitle1" sx={{ mr: 1 }}>
        {t('filters.selectCity')}:
      </Typography>
      <ToggleButtonGroup
        value={selectedCity}
        onChange={handleCityChange}
        exclusive
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            padding: '10px 12px',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            fontWeight: "900",
            // borderRadius: '16px !important',
            textTransform: 'none',
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }
          }
        }}
      >
        {/* <ToggleButton key={0} value={0}>
          {t('filters.allCities')}
        </ToggleButton> */}
        {cities.map((city) => (
          <ToggleButton key={city.id} value={city.id}>
            {city.name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default CitySelect; 