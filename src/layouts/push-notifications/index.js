import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import axios from 'axios';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DataTable from "examples/Tables/DataTable";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from 'components/MDButton';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from 'constants/crud';

const PushNotifications = () => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [history, setHistory] = useState([]);

  const CITY_TOPIC_MAP = {
    'nookat': 'all_users',
    'kyzylkya': 'kyzylkya',
    'kadamjai': 'kadamjai',
    'leilek': 'leilek',
    'batken': 'batken'
  };

  const cityOptions = Object.keys(CITY_TOPIC_MAP);

  const handleSubmit = async () => {
    if (!title || !body) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authorization token found');
        return;
      }

      const requestData = {
        title: title,
        body: body,
        ...(selectedCity && { city: selectedCity })
      };

      const response = await axios.post(`${BASE_URL}/fb/test-push/`, requestData, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Push notification sent successfully:', response.data);

      const newNotification = {
        id: Date.now(),
        title,
        body,
        city: selectedCity || 'Все города',
        topic: selectedCity ? CITY_TOPIC_MAP[selectedCity] : 'all_users',
        timestamp: new Date().toISOString(),
      };

      setHistory(prev => [newNotification, ...prev]);
      setTitle('');
      setBody('');
      setSelectedCity('');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  const tableData = {
    columns: [
      { Header: t('pushNotifications.table.date'), accessor: "date", width: "20%" },
      { Header: t('pushNotifications.table.title'), accessor: "title", width: "20%" },
      { Header: t('pushNotifications.table.body'), accessor: "body", width: "40%" },
      { Header: t('pushNotifications.table.city'), accessor: "city", width: "20%" },
    ],
    rows: history.map(notification => ({
      date: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {new Date(notification.timestamp).toLocaleString()}
        </MDTypography>
      ),
      title: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {notification.title}
        </MDTypography>
      ),
      body: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {notification.body}
        </MDTypography>
      ),
      city: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {notification.city}
        </MDTypography>
      ),
    })),
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3, pt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('pushNotifications.title')}
        </Typography>

        <Card sx={{ mb: 4, mt: 4 }}>
          <CardContent>
            <TextField
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              label="Заголовок"
              placeholder="Введите заголовок уведомления"
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              label="Текст уведомления"
              placeholder="Введите текст уведомления"
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                Выберите город:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {cityOptions.map((city) => (
                  <Chip
                    key={city}
                    label={city.charAt(0).toUpperCase() + city.slice(1)}
                    onClick={() => setSelectedCity(city)}
                    color={selectedCity === city ? 'primary' : 'default'}
                    variant={selectedCity === city ? 'filled' : 'outlined'}
                    clickable
                    sx={{ 
                      '&:hover': {
                        backgroundColor: selectedCity === city ? 'primary.dark' : 'action.hover'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>

            <MDButton
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!title || !body}
              sx={{ mt: 4, color: 'white' }}
            >
              Отправить уведомление
            </MDButton>
          </CardContent>
        </Card>

        <MDBox pt={6} pb={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium">
                {t('pushNotifications.history')}
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

export default PushNotifications; 