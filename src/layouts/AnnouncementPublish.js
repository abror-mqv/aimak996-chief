import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Slider,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import MultiCitySelect from '../components/MultipleCitySelect';
import axios from 'axios';
import { GET_CITIES_LIST } from 'constants/crud';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from 'components/MDButton';
import DataTable from "examples/Tables/DataTable";
import { BASE_URL } from 'constants/crud';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';

const AnnouncementPublish = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [duration, setDuration] = useState(7);
  const [error, setError] = useState('');
  const [citiesList, setCitiesList] = useState([]);
  const [history, setHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Загрузка списка городов
    axios.get(GET_CITIES_LIST)
      .then(res => {
        console.log('Cities:', res.data);
        setCitiesList(res.data);
      })
      .catch(err => {
        console.log(err);
        setError('Ошибка при загрузке списка городов');
      });

    // Загрузка истории сообщений
    axios.get(`${BASE_URL}/categories/pinned-message-list/`, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('authToken')}`
      }
    })
      .then(res => {
        console.log('History:', res.data);
        setHistory(res.data);
      })
      .catch(err => {
        console.log(err);
        setError('Ошибка при загрузке истории сообщений');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (message.length > 100) {
      setError(t('announcement.error.maxLength'));
      return;
    }

    if (selectedCities.length === 0) {
      setError(t('announcement.error.noCities'));
      return;
    }

    if (duration < 1 || duration > 14) {
      setError(t('announcement.error.invalidDuration'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/categories/create-pinned-message/`,
        {
          text: message,
          city_ids: selectedCities,
          lifetime_days: duration
        },
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`
          }
        }
      );

      setMessage('');
      setSelectedCities([]);
      setDuration(7);

      const historyResponse = await axios.get(
        `${BASE_URL}/categories/pinned-message-list/`,
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`
          }
        }
      );
      setHistory(historyResponse.data);

    } catch (err) {
      console.error('Error creating message:', err);
      setError(err.response?.data?.message || t('announcement.error.deactivate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (messageId) => {
    try {
      await axios.post(
        `${BASE_URL}/categories/deactivate-pinned-message/${messageId}/`,
        {},
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`
          }
        }
      );

      const historyResponse = await axios.get(
        `${BASE_URL}/categories/pinned-message-list/`,
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`
          }
        }
      );
      setHistory(historyResponse.data);
    } catch (err) {
      console.error('Error deactivating message:', err);
      setError(err.response?.data?.message || t('announcement.error.deactivate'));
    }
  };

  const marks = [
    { value: 1, label: '1' },
    { value: 7, label: '7' },
    { value: 14, label: '14' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tableData = {
    columns: [
      { Header: t('announcement.messageLabel'), accessor: "text", width: "30%" },
      { Header: t('filters.selectCity'), accessor: "cities", width: "20%" },
      { Header: t('announcement.period'), accessor: "period", width: "25%" },
      { Header: t('ad.status'), accessor: "status", width: "15%" },
      { Header: t('announcement.created'), accessor: "created", width: "20%" },
    ],
    rows: history.map(item => ({
      text: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.text}
        </MDTypography>
      ),
      cities: (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {item.cities.map((city, index) => (
            <Chip
              key={index}
              label={city}
              size="small"
              sx={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
          ))}
        </Box>
      ),
      period: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {`${formatDate(item.starts_at)} - ${formatDate(item.ends_at)}`}
        </MDTypography>
      ),
      status: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={item.is_active ? t('announcement.active') : t('announcement.completed')}
            size="small"
            color={item.is_active ? "success" : "default"}
            sx={{ 
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
          {item.is_active && (
            <Chip
              icon={<BlockIcon sx={{ fontSize: 16 }} />}
              label={t('announcement.deactivate')}
              size="small"
              onClick={() => handleDeactivate(item.id)}
              sx={{ 
                backgroundColor: 'rgba(16, 67, 145, 0.08)',
                color: '#104391',
                '& .MuiChip-label': {
                  px: 1
                },
                '&:hover': {
                  backgroundColor: 'rgba(16, 67, 145, 0.12)'
                }
              }}
            />
          )}
        </Box>
      ),
      created: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {formatDate(item.created_at)}
        </MDTypography>
      ),
    })),
  };

  const PreviewBox = ({ text }) => (
    <Box
      sx={{
        width: '100%',
        maxWidth: '375px',
        height: '84px',
        borderRadius: '15px',
        border: '2px solid #104391',
        backgroundColor: 'rgba(122, 183, 236, 0.15)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        px: 2,
        my: 2,
        mx: 'auto'
      }}
    >
      <Typography
        sx={{
          color: '#104391',
          fontSize: '16px',
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          flex: 1,
          mr: 0,
          mt: 1.5,
          whiteSpace: 'pre-line'
        }}
      >
        {text || t('announcement.messagePlaceholder')}
      </Typography>
      <CloseIcon sx={{ color: '#104391', width: 30, height: 30, flexShrink: 0, mt: 3.2 }} />
    </Box>
  );

  return (
    <DashboardLayout>
      <Box sx={{ p: 3, pt: 4 }}>
        <MDTypography variant="h4" gutterBottom>
          {t('announcement.title')}
        </MDTypography>

        <Card sx={{ mb: 4, mt: 4 }}>
          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('announcement.messageLabel')}
                    multiline
                    rows={2}
                    maxRows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    helperText={`${message.length}/100 ${t('common.text')}`}
                    error={message.length > 100}
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDTypography variant="button" fontWeight="medium" gutterBottom>
                    {t('announcement.messagePreview')}:
                  </MDTypography>
                  <PreviewBox text={message || t('announcement.messagePlaceholder')} />
                </Grid>

                <Grid item xs={12}>
                  <MultiCitySelect
                    cities={citiesList}
                    selectedCities={selectedCities}
                    onCitiesChange={setSelectedCities}
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDBox sx={{ px: 2 }}>
                    <MDTypography variant="button" fontWeight="medium" gutterBottom>
                      {t('announcement.durationLabel', { days: duration })}
                    </MDTypography>
                    <Slider
                      value={duration}
                      onChange={(_, newValue) => setDuration(newValue)}
                      min={1}
                      max={14}
                      step={1}
                      marks={marks}
                      valueLabelDisplay="auto"
                      sx={{
                        '& .MuiSlider-thumb': {
                          width: 20,
                          height: 20,
                        },
                        '& .MuiSlider-track': {
                          height: 4,
                        },
                        '& .MuiSlider-rail': {
                          height: 4,
                        },
                      }}
                    />
                  </MDBox>
                </Grid>

                <Grid item xs={12}>
                  <MDButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ mt: 2, color: 'white' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('announcement.publishing') : t('announcement.publish')}
                  </MDButton>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        <MDBox pt={6} pb={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium">
                {t('announcement.history')}
              </MDTypography>
            </MDBox>
            <DataTable
              table={tableData}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries={false}
              noEndBorder
            />
          </Card>
        </MDBox>
      </Box>
    </DashboardLayout>
  );
};

export default AnnouncementPublish; 