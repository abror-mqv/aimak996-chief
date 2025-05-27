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
import { GET_STATS_MONTH } from "constants/crud";
import { Typography } from "@mui/material";
import DataTable from "examples/Tables/DataTable";
import getModeratorStatsTableData from "./components/ModeratorStatsTable";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;
  const [moderatorStats, setModeratorStats] = useState([])


  useEffect(()=>{
    const token = localStorage.getItem("authToken")
    axios.get(GET_STATS_MONTH, {
      headers: {
        Authorization: `Token ${token}`
      }
    }).then(res=>{
      console.log(res)
      setModeratorStats(res.data)
    }).catch(err=>{
      console.log(err)
    })
  }, [])

   const { columns, rows } = getModeratorStatsTableData(moderatorStats);

  return (
    <DashboardLayout>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Аналитика модераторов
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 0 }}>
        Количество обработанных публикаций по городам
      </Typography>
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
