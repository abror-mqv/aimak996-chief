import React from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography
} from '@mui/material';

const CategorySelect = ({ categories, selectedCategory, onCategoryChange }) => {
  const handleCategoryChange = (event, newCategoryId) => {
    if (newCategoryId !== null) {
      onCategoryChange(newCategoryId);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2}}>
      <Typography variant="subtitle1" sx={{ mr: 1 }}>
        Категория:
      </Typography>
      <ToggleButtonGroup
        value={selectedCategory}
        onChange={handleCategoryChange}
        exclusive
        size="small"
        sx={{
          flexWrap: 'wrap',
          gap: '8px',
          '& .MuiToggleButton-root': {
            padding: '4px 12px',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: '16px !important',
            textTransform: 'none',
            whiteSpace: 'nowrap',
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
        <ToggleButton  value={0}>
            Жалпы
          </ToggleButton>
        {categories.map((category) => (
          <ToggleButton key={category.id} value={category.id}>
            {category.name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default CategorySelect;