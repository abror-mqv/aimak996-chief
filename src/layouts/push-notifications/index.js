import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import MultiCitySelect from 'components/MultipleCitySelect';
import axios from 'axios';
import { GET_CITIES_LIST } from 'constants/crud';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DataTable from "examples/Tables/DataTable";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from 'components/MDButton';

const PushNotifications = () => {
  const [message, setMessage] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [history, setHistory] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  useEffect(() => {
    axios.get(GET_CITIES_LIST)
      .then(res => {
        console.log('Cities:', res.data);
        setCitiesList(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const handleSubmit = async () => {
    if (!message || selectedCities.length === 0) {
      return;
    }

    try {
      // TODO: Implement API call to send push notification
      const newNotification = {
        id: Date.now(),
        message,
        cities: selectedCities,
        timestamp: new Date().toISOString(),
      };

      setHistory(prev => [newNotification, ...prev]);
      setMessage('');
      setSelectedCities([]);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  const tableData = {
    columns: [
      { Header: "Дата", accessor: "date", width: "20%" },
      { Header: "Сообщение", accessor: "message", width: "50%" },
      { Header: "Города", accessor: "cities", width: "30%" },
    ],
    rows: history.map(notification => ({
      date: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {new Date(notification.timestamp).toLocaleString()}
        </MDTypography>
      ),
      message: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {notification.message}
        </MDTypography>
      ),
      cities: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {notification.cities
            .map(cityId => citiesList.find(city => city.id === cityId)?.name)
            .filter(Boolean)
            .join(', ')}
        </MDTypography>
      ),
    })),
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3, pt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Push-уведомления
        </Typography>

        <Card sx={{ mb: 4, mt: 4 }}>
          <CardContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              label="Текст уведомления"
              placeholder="Введите текст push-уведомления..."
              sx={{ mb: 3 }}
            />

            <MultiCitySelect
              cities={citiesList}
              selectedCities={selectedCities}
              onCitiesChange={setSelectedCities}
              sx={{ mb: 3 }}
            />

            <MDButton
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!message || selectedCities.length === 0}
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
                История уведомлений
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