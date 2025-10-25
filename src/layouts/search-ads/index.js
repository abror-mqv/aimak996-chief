import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { useTranslation } from 'react-i18next';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useEffect, useState } from "react";
import axios from "axios";
import { GET_CATEGORIES, GET_CITIES_LIST, BASE_URL } from "constants/crud";
import Feed from "../moderator-ads/comps/Feed";
import CitySelect from "../moderator-ads/comps/CitySelect";
import CategorySelect from "../moderator-ads/comps/CategorySelect";
import EditAdModal from "components/EditAdModal";
import SearchBar from "./comps/SearchBar";

function SearchAds() {
  const { t } = useTranslation();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [citiesList, setCitiesList] = useState([]);
  const [selectedCity, setSelectedCity] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Получение объявлений
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    const searchParams = new URLSearchParams();

    if (searchQuery) searchParams.append('search', searchQuery);

    const queryString = searchParams.toString();
    
    axios.get(`${BASE_URL}/ads/my-ads/${selectedCity}/${selectedCategory}/${queryString ? `?${queryString}` : ''}`, {
      headers: {
        Authorization: `Token ${token}`
      }
    }).then(res => {
      console.log('Response data:', res.data);
      console.log('Response data type:', typeof res.data);
      // Проверяем структуру данных и преобразуем в массив если нужно
      const adsData = res.data;
      if (Array.isArray(adsData)) {
        console.log('Data is array with length:', adsData.length);
        setAds(adsData);
      } else if (adsData && typeof adsData === 'object') {
        // Если получаем объект с полем ads
        console.log('Data is object with keys:', Object.keys(adsData));
        setAds(adsData.ads || []);
      } else {
        // Если ни то, ни другое - устанавливаем пустой массив
        console.log('Data is neither array nor object:', adsData);
        setAds([]);
      }
      setLoading(false);
    }).catch(err => {
      console.log('Error fetching ads:', err);
      setAds([]); // При ошибке устанавливаем пустой массив
      setLoading(false);
    });
  }, [selectedCity, selectedCategory, searchQuery]);

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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState({
    id: 0,
    description: t('ad.description'),
    contact_phone: "+996",
    category_id: 0,
    city_ids: [],
  });

  return (
    <DashboardLayout>
      <MDBox pt={0} pb={3}>
        <MDTypography variant="h4" mb={3}>
          {t('search.title')}
        </MDTypography>
        
        <SearchBar onSearch={handleSearch} />
        
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
        
        <Feed
          ads={ads}
          loading={loading}
          setCurrentAd={setCurrentAd}
          onOpen={() => {
            setModalOpen(true);
          }}
        />
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

export default SearchAds; 