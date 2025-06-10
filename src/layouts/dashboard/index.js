/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";
import { useEffect, useState } from "react";
import axios from "axios";
import { GET_STATS_MONTH, GET_STATS_WEEK, GET_STATS_DAY } from "constants/crud";
import { Typography } from "@mui/material";
import DataTable from "examples/Tables/DataTable";
import getModeratorStatsTableData from "./components/ModeratorStatsTable";
import { useTranslation } from "react-i18next";

function Dashboard() {
  const { t } = useTranslation();
  const { sales, tasks } = reportsLineChartData;
  const [moderatorStats, setModeratorStats] = useState([]);
  const [period, setPeriod] = useState('month');

  const getPeriodEndpoint = () => {
    switch(period) {
      case 'day':
        return GET_STATS_DAY;
      case 'week':
        return GET_STATS_WEEK;
      default:
        return GET_STATS_MONTH;
    }
  };

  const fetchStats = () => {
    const token = localStorage.getItem("authToken");
    axios.get(getPeriodEndpoint(), {
      headers: {
        Authorization: `Token ${token}`
      }
    }).then(res => {
      console.log(res);
      setModeratorStats(res.data);
    }).catch(err => {
      console.log(err);
    });
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  const { columns, rows } = getModeratorStatsTableData(moderatorStats);

  return (
    <DashboardLayout>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {t('dashboard.title')}
      </Typography>
      <MDBox alignItems="center" mb={3}>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mr: 2 }}>
          {t('dashboard.subtitle')}
        </Typography>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={handlePeriodChange}
          aria-label="Период статистики"
          size="small"
          sx={{
            mt: 2,
            '& .MuiToggleButton-root': {
              padding: '10px 12px',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              fontWeight: "900",
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
          <ToggleButton value="day">
            {t('dashboard.for_today')}
          </ToggleButton>
          <ToggleButton value="week">
            {t('dashboard.for_week')}
          </ToggleButton>
          <ToggleButton value="month">
            {t('dashboard.for_month')}
          </ToggleButton>
        </ToggleButtonGroup>
      </MDBox>
      <MDBox pt={6} pb={3}>
        <DataTable
          table={{ columns, rows }}
          isSorted={false}
          entriesPerPage={false}
          showTotalEntries={false}
          noEndBorder
        />
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
