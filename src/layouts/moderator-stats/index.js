import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Divider,
} from '@mui/material';
import axios from 'axios';
import { BASE_URL } from 'constants/crud';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkIcon from '@mui/icons-material/Work';
import WorkOffIcon from '@mui/icons-material/WorkOff';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const ModeratorStats = () => {
  const { moderatorId } = useParams();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workingHours, setWorkingHours] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${BASE_URL}/users/moderator-stats/${moderatorId}/`, {
          headers: {
            Authorization: `Token ${token}`
          }
        });
        setStatsData(response.data);
        
        // Вычисляем рабочие часы для каждого дня
        const hours = {};
        Object.entries(response.data.data).forEach(([date, dayData]) => {
          const activeHours = Object.entries(dayData)
            .filter(([hour, count]) => count > 0)
            .map(([hour]) => parseInt(hour));
          
          if (activeHours.length > 0) {
            hours[date] = {
              start: Math.min(...activeHours),
              end: Math.max(...activeHours),
              total: activeHours.length
            };
          }
        });
        setWorkingHours(hours);
      } catch (error) {
        console.error('Error fetching moderator stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [moderatorId]);

  const prepareChartData = () => {
    if (!statsData) return null;

    const datasets = [];
    const dates = Object.keys(statsData.data);
    const gradientColors = [
      ['rgba(66, 133, 244, 0.8)', 'rgba(66, 133, 244, 0.1)'],  // Google Blue
      ['rgba(219, 68, 55, 0.8)', 'rgba(219, 68, 55, 0.1)'],    // Google Red
      ['rgba(244, 180, 0, 0.8)', 'rgba(244, 180, 0, 0.1)'],    // Google Yellow
    ];
    
    dates.forEach((date, index) => {
      const hours = Object.keys(statsData.data[date]).map(Number);
      const counts = Object.values(statsData.data[date]).map(Number);
      
      // Добавляем основной график
      datasets.push({
        label: date,
        data: counts,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, gradientColors[index][0]);
          gradient.addColorStop(1, gradientColors[index][1]);
          return gradient;
        },
        borderColor: gradientColors[index][0],
        tension: 0.4,
        pointRadius: (context) => {
          const value = context.raw;
          return value > 0 ? 4 : 2;
        },
        pointHoverRadius: 8,
      });

      // Добавляем маркеры начала и конца рабочего дня
      if (workingHours[date]) {
        const startData = new Array(24).fill(null);
        const endData = new Array(24).fill(null);
        startData[workingHours[date].start] = Math.max(...counts) + 1;
        endData[workingHours[date].end] = Math.max(...counts) + 1;

        datasets.push({
          label: `Начало работы ${date}`,
          data: startData,
          borderColor: gradientColors[index][0],
          backgroundColor: gradientColors[index][0],
          pointStyle: 'rectRot',
          pointRadius: 10,
          showLine: false,
        });

        datasets.push({
          label: `Конец работы ${date}`,
          data: endData,
          borderColor: gradientColors[index][0],
          backgroundColor: gradientColors[index][0],
          pointStyle: 'rect',
          pointRadius: 10,
          showLine: false,
        });
      }
    });

    return {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets,
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          filter: (item) => !item.text.includes('работы'),
        },
      },
      title: {
        display: true,
        text: 'Активность публикаций по часам',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.dataset.label.includes('работы')) {
              return context.dataset.label;
            }
            return `${context.dataset.label}: ${context.raw} публикаций`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const renderWorkingHoursCards = () => {
    return Object.entries(workingHours).map(([date, hours]) => (
      <Grid item xs={12} md={4} key={date}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
              <MDTypography variant="h6">{date}</MDTypography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon sx={{ mr: 1, color: 'success.main' }} fontSize="small" />
              <Typography>
                Начало: {hours.start}:00
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WorkOffIcon sx={{ mr: 1, color: 'error.main' }} fontSize="small" />
              <Typography>
                Конец: {hours.end}:00
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Активных часов: {hours.total}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  const chartData = prepareChartData();

  return (
    <DashboardLayout>
      <MDBox pt={6} pb={3}>
        {loading ? (
          <Typography>Загрузка...</Typography>
        ) : statsData ? (
          <>
            <Grid container spacing={3} mb={3}>
              {renderWorkingHoursCards()}
            </Grid>
            
            <Card>
              <CardContent>
                <MDTypography variant="h4" gutterBottom>
                  Статистика модератора: {statsData.user}
                </MDTypography>
                <Box sx={{ height: '70vh', position: 'relative' }}>
                  {chartData && (
                    <Line options={chartOptions} data={chartData} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </>
        ) : (
          <Typography>Нет данных</Typography>
        )}
      </MDBox>
    </DashboardLayout>
  );
};

export default ModeratorStats; 