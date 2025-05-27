/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
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

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";

export default function getModeratorStatsTableData(moderatorData) {
  // Формируем колонки на основе первого модератора
  const getColumns = (cityStats) => {
    const columns = [
      { Header: "Модератор", accessor: "moderator", width: "25%", align: "left" }
    ];
    
    // Добавляем колонку "Всего"
    columns.push({
      Header: "Всего",
      accessor: "total",
      align: "center"
    });
    // Добавляем колонки для каждого города (кроме "В общем")
    cityStats
      .filter(city => city.city_id !== 0)
      .forEach(city => {
        columns.push({
          Header: city.city_name,
          accessor: `city_${city.city_id}`,
          align: "center"
        });
      });
    
    
    
    return columns;
  };

  // Формируем строки данных
  const getRows = () => {
    if (!moderatorData || moderatorData.length === 0) return [];
    
    return moderatorData.map(moderator => {
      const row = {
        moderator: (
          <MDBox display="flex" alignItems="center" lineHeight={1}>
            <MDTypography display="block" variant="button" fontWeight="medium" lineHeight={1}>
              {moderator.moderator_name}
            </MDTypography>
          </MDBox>
        )
      };
      
      // Добавляем данные по городам
      moderator.city_stats.forEach(city => {
        if (city.city_id !== 0) {
          row[`city_${city.city_id}`] = (
            <MDTypography variant="caption" color={city.ads_count > 0 ? "success" : "text"} fontWeight="medium">
              {city.ads_count}
            </MDTypography>
          );
        }
      });
      
      // Добавляем общее количество
      const total = moderator.city_stats.find(c => c.city_id === 0)?.ads_count || 0;
      row.total = (
        <MDTypography variant="button" color="info" fontWeight="bold">
          {total}
        </MDTypography>
      );
      
      return row;
    });
  };

  // Получаем колонки и строки
  const columns = moderatorData.length > 0 
    ? getColumns(moderatorData[0].city_stats) 
    : [];
  const rows = getRows();

  return {
    columns,
    rows
  };
}