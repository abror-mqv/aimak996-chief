import { useTranslation } from 'react-i18next';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

import AdvertisementForm from "./сomps/AdvertisementForm";
import axios from "axios";
import { POST_AD } from "constants/crud";

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
