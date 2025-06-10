import React, { useState } from 'react';
import {
  Box,
  TextField,

  LinearProgress
} from '@mui/material';

import "./AdForm.scss"
import MDButton from 'components/MDButton';
import { useTranslation } from 'react-i18next';




const AdvertisementForm = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")




  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Создаем FormData для отправки файлов
     
      const formDataToSend = {
        "phone": phone,
        "full_name": fullName,
        "password": password
      }

      await onSubmit(formDataToSend);
      
      // Сброс формы после успешной отправки


    } catch (error) {
      console.error('Ошибка при отправке объявления:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { t } = useTranslation();
    
  return (
    <div className='NewAdForm'>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
         
          <TextField
            label={t('common.contactPhone')}
            name="contact_phone"
            value={phone}
            type='tel'
            onChange={(e)=>setPhone(e.target.value)}
            required
            fullWidth
            placeholder="996123456789"
          />
          <TextField
            label={t('common.name')}
            name="name"
            value={fullName}
            onChange={(e)=>setFullName(e.target.value)}
            required
            fullWidth
            placeholder="Адилет"
          />
          <TextField
            label="Пароль"
            name="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
            fullWidth
            placeholder="********"
          />          

          
          {isSubmitting && <LinearProgress />}
          
          <MDButton
            type="submit"
            variant="contained"
            color="dark"
            // size="large"
            disabled={isSubmitting}
            sx={{ mt: 2 }}
          >
            {isSubmitting ? 'Отправка...' : t('common.addModerator')}
          </MDButton>
        </Box>
      </form>
    </div>
  );
};

export default AdvertisementForm;