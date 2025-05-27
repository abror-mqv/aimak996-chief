import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const EditModeratorModal = ({ 
  open, 
  onClose, 
  moderator, 
  onSave 
}) => {
  const [editedModerator, setEditedModerator] = useState({
    phone: '',
    full_name: ''
  });
  const [errors, setErrors] = useState({
    phone: false,
    full_name: false
  });

  useEffect(() => {
    if (moderator) {
      setEditedModerator({
        phone: moderator.phone || '',
        full_name: moderator.full_name || ''
      });
    }
  }, [moderator]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedModerator(prev => ({
      ...prev,
      [name]: value
    }));
    // Сбрасываем ошибку при изменении
    setErrors(prev => ({
      ...prev,
      [name]: false
    }));
  };

  const validate = () => {
    const newErrors = {
      phone: !editedModerator.phone,
      full_name: !editedModerator.full_name
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(editedModerator);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Редактировать модератора</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ pt: 2 }}>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Телефон"
            name="phone"
            value={editedModerator.phone}
            onChange={handleChange}
            error={errors.phone}
            helperText={errors.phone ? 'Обязательное поле' : ''}
            fullWidth
            placeholder="996707987654"
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
          />
          
          <TextField
            label="ФИО"
            name="full_name"
            value={editedModerator.full_name}
            onChange={handleChange}
            error={errors.full_name}
            helperText={errors.full_name ? 'Обязательное поле' : ''}
            fullWidth
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
        >
          Сохранить изменения
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditModeratorModal;