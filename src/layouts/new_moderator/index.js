// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import AdvertisementForm from "./сomps/AdvertisementForm";
import axios from "axios";
import { POST_AD } from "constants/crud";
import { POST_NEW_MODERATOR } from "constants/crud";

function NewModerator() {

  const handleSubmit = (formData) => {
    const token = localStorage.getItem("authToken")
    axios.post(`${POST_NEW_MODERATOR}`, formData, {
      headers: {
        "Authorization": `Token ${token}`
      }
    })
    .then(response => {
      alert('Модератор создан', response.data);
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
        Новый модератор
        <AdvertisementForm onSubmit={handleSubmit} />
      </MDBox>
     
    </DashboardLayout>
  );
}

export default NewModerator;
