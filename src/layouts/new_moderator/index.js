// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import { useTranslation } from 'react-i18next';

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import AdvertisementForm from "./сomps/AdvertisementForm";
import axios from "axios";
import { POST_AD } from "constants/crud";
import { POST_NEW_MODERATOR } from "constants/crud";

function NewModerator() {
  const { t } = useTranslation();

  const handleSubmit = (formData) => {
    const token = localStorage.getItem("authToken")
    axios.post(`${POST_NEW_MODERATOR}`, formData, {
      headers: {
        "Authorization": `Token ${token}`
      }
    })
    .then(response => {
      alert(t('common.moderatorCreated'), response.data);
    })
    .catch(error => {
      console.error(t('common.error'), error);
      if (error.response) {
        console.error(t('common.errorData'), error.response.data);
        console.error(t('common.errorStatus'), error.response.status);
      }
    });
  };

  return (
    <DashboardLayout>
      <MDBox mt={0}>
        {t('common.newModerator')}
        <AdvertisementForm onSubmit={handleSubmit} />
      </MDBox>
    </DashboardLayout>
  );
}

export default NewModerator;
