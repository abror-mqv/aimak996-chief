import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Button,
  Divider,
  Grid
} from '@mui/material';

const MultiCitySelect = ({ cities, selectedCities, onCitiesChange, columns = 3 }) => {
  // Разбиваем города на колонки
  const citiesPerColumn = Math.ceil(cities.length / columns);
  const cityColumns = Array.from({ length: columns }, (_, i) =>
    cities.slice(i * citiesPerColumn, (i + 1) * citiesPerColumn)
  );

  const handleCityToggle = (cityId) => {
    const newSelectedCities = selectedCities.includes(cityId)
      ? selectedCities.filter(id => id !== cityId)
      : [...selectedCities, cityId];
    onCitiesChange(newSelectedCities);
  };

  const handleSelectAll = () => {
    onCitiesChange(selectedCities.length === cities.length ? [] : cities.map(city => city.id));
  };

  return (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Выберите города
        </Typography>
        {selectedCities.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Выбрано: {selectedCities.length}
          </Typography>
        )}
      </Box>

      <Button
        size="small"
        onClick={handleSelectAll}
        sx={{ textTransform: 'none', mb: 1 }}
      >
        {selectedCities.length === cities.length ? 'Снять все' : 'Выбрать все'}
      </Button>

      <Divider sx={{ my: 1 }} />

      <Grid container spacing={2}>
        {cityColumns.map((columnCities, columnIndex) => (
          <Grid item xs={12} sm={6} md={4} key={columnIndex}>
            <FormGroup>
              {columnCities.map((city) => (
                <FormControlLabel
                  key={city.id}
                  control={
                    <Checkbox
                      checked={selectedCities.includes(city.id)}
                      onChange={() => handleCityToggle(city.id)}
                      size="small"
                      color="primary"
                    />
                  }
                  label={city.name}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              ))}
            </FormGroup>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default MultiCitySelect;