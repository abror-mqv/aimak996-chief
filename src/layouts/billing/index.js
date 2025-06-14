import Grid from "@mui/material/Grid";
import { useTranslation } from 'react-i18next';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MasterCard from "examples/Cards/MasterCard";
import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";

// Billing page components
import PaymentMethod from "layouts/billing/components/PaymentMethod";
import Invoices from "layouts/billing/components/Invoices";
import BillingInformation from "layouts/billing/components/BillingInformation";
import Transactions from "layouts/billing/components/Transactions";
import AdvertisementForm from "./сomps/AdvertisementForm";
import axios from "axios";
import { POST_AD } from "constants/crud";
import { useEffect } from "react";

function Billing() {
  const { t } = useTranslation();

  const handleSubmit = (formData) => {
    const token = localStorage.getItem("authToken")
    axios.post(`${POST_AD}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        "Authorization": `Token ${token}`
      }
    })
    .then(response => {
      alert('Объявление создано:', response.data);
    })
    .catch(error => {
      console.error('Ошибка:', error);
      if (error.response) {
        console.error('Данные ошибки:', error.response.data);
        console.error('Статус ошибки:', error.response.status);
      }
    });
  };

  return (
    <DashboardLayout>
      <MDBox mt={0}>
        {t('newAd.title')}
        <AdvertisementForm onSubmit={handleSubmit} />
      </MDBox>
    </DashboardLayout>
  );
}

export default Billing;
