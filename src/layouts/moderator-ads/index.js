import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { GET_MODERATOR_ADS, GET_CATEGORIES, GET_CITIES_LIST } from "constants/crud";
import Feed from "./comps/Feed";
import CitySelect from "./comps/CitySelect";
import CategorySelect from "./comps/CategorySelect";
import EditAdModal from "components/EditAdModal";

function ModeratorAds() {
  const { moderatorId } = useParams();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [citiesList, setCitiesList] = useState([]);
  const [selectedCity, setSelectedCity] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [moderatorName, setModeratorName] = useState("");

  // Получение объявлений
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    axios.get(`${GET_MODERATOR_ADS}${moderatorId}/${selectedCity || selectedCategory ? '?' : ''}${selectedCity ? `city_id=${selectedCity}` : ''}${selectedCity && selectedCategory ? '&' : ''}${selectedCategory ? `category_id=${selectedCategory}` : ''}`, {
      headers: {
        Authorization: `Token ${token}`
      }
    }).then(res => {
      setAds(res.data.ads || []);
      setModeratorName(res.data.moderator_name || "");
      setLoading(false);
    }).catch(err => {
      console.log(err);
      setLoading(false);
    });
  }, [moderatorId, selectedCity, selectedCategory]);

  // Получение списка городов
  useEffect(() => {
    setLoading(true);
    axios.get(GET_CITIES_LIST)
      .then(res => {
        console.log('Cities:', res.data);
        setCitiesList(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  // Получение категорий
  useEffect(() => {
    axios.get(GET_CATEGORIES)
      .then(res => {
        console.log('Categories:', res.data);
        setCategories(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const handleCityChange = (id) => {
    setSelectedCity(id);
  };

  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState({
    id: 0,
    description: "текст",
    contact_phone: "+996",
    category_id: 0,
    city_ids: [],
  });

  return (
    <DashboardLayout>
      <MDBox pt={0} pb={3}>
        <MDTypography variant="h4" mb={3}>
          Публикации модератора: {moderatorName}
        </MDTypography>
        <CitySelect
          cities={citiesList}
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
        />
        <CategorySelect
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategorySelect}
        />
        <div style={{ height: "18px" }} />
        
        {selectedCity === 0 ? (
          <MDTypography variant="body2" color="text">
            Выберите город
          </MDTypography>
        ) : (
          <>
            <MDTypography variant="body2" color="text" mb={2}>
              Все объявления по городу
            </MDTypography>
            <Feed
              ads={ads}
              loading={loading}
              setCurrentAd={setCurrentAd}
              onOpen={() => {
                setModalOpen(true);
              }}
            />
          </>
        )}
      </MDBox>
      <EditAdModal
        open={modalOpen}
        handleClose={(shouldReload) => {
          setModalOpen(false);
        }}
        ad={currentAd}
        categories={categories}
        cities={citiesList}
        token={localStorage.authToken}
      />
    </DashboardLayout>
  );
}

export default ModeratorAds; 