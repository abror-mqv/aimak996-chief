import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Container,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Icon,
  MobileStepper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import { styled } from '@mui/material/styles';
import { BASE_URL } from 'constants/crud';
import MDBadge from 'components/MDBadge';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import axios from 'axios';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.01)',
    boxShadow: theme.shadows[6]
  }
}));  

const ImageSlider = ({ images }) => {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + maxSteps) % maxSteps);
  };

  if (!images || images.length === 0) return null;

  return (
    <Box sx={{ 
      position: 'relative',
      width: '100%',
      height: '200px',
      overflow: 'hidden',
      m: 0,
      p: 0,
    }}>
      <CardMedia
        component="img"
        image={images[activeStep]}
        alt={`Изображение ${activeStep + 1}`}
        sx={{ 
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          m: 0,
          p: 0,
        }}
      />
      {maxSteps > 1 && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: 0,
              transition: 'opacity 0.3s',
              '&:hover': {
                opacity: 1,
                bgcolor: 'rgba(0, 0, 0, 0.2)',
              },
              p: 0,
            }}
          >
            <IconButton 
              onClick={handleBack}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                ml: 1,
              }}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <IconButton 
              onClick={handleNext}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                mr: 1,
              }}
            >
              <KeyboardArrowRight />
            </IconButton>
          </Box>
          <MobileStepper
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            sx={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              background: 'transparent',
              p: 0,
              m: 0,
              '& .MuiMobileStepper-dot': {
                bgcolor: 'rgba(255, 255, 255, 0.5)',
              },
              '& .MuiMobileStepper-dotActive': {
                bgcolor: 'white',
              },
            }}
            backButton={null}
            nextButton={null}
          />
        </>
      )}
    </Box>
  );
};

const Feed = ({ ads, loading, onOpen, setCurrentAd }) => {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState(null);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        {t('search.noResults')}
      </Typography>
    );
  }

  const handleSetCurrentAd = (data) => {
    setCurrentAd(data)
    onOpen()
  }

  const handleDeleteClick = (adId) => {
    setSelectedAdId(adId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${BASE_URL}/ads/delete/${selectedAdId}`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      setDeleteDialogOpen(false);
      // Перезагрузить страницу для обновления списка
      window.location.reload();
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert('Ошибка при удалении объявления');
    }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {ads.map((ad) => (
            <Grid item xs={12} sm={6} md={4} key={ad.id}>
              <StyledCard>
                {ad.images && ad.images.length > 0 && (
                  <ImageSlider images={ad.images} />
                )}
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={ad.category} color="primary" size="small" />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {ad.contact_phone}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography gutterBottom variant="h6" component="div">
                    {ad.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {ad.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <MDBadge 
                      color="dark" 
                      onClick={() => {
                        console.log(ad)
                        handleSetCurrentAd({
                          id: ad.id,
                          description: ad.description,
                          contact_phone: ad.contact_phone,
                          category_id: ad.category_id,
                          city_ids: ad.cities_ids
                        })
                      }}
                      title={t('ad.edit')}
                    >
                      <Icon>edit</Icon>
                    </MDBadge>
                    <MDBadge 
                      color="error" 
                      onClick={() => handleDeleteClick(ad.id)}
                      title={t('ad.delete')}
                    >
                      <Icon>delete</Icon>
                    </MDBadge>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('ad.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('ad.deleteConfirmMessage')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Feed; 