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
import { GET_ADS_BY_CITY_ID } from "constants/crud";
import Feed from "./comps/Feed";
import { GET_CITIES_LIST } from "constants/crud";
import CitySelect from "./comps/CitySelect";
import { GET_CATEGORIES } from "constants/crud";
import CategorySelect from "./comps/CategorySelect";
import { BASE_URL } from "constants/crud";
import EditAdModal from "components/EditAdModal";

function Tables() {
  const { t } = useTranslation();
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(false)
  const [citiesList, setCitiesList] = useState([])
  const [selectedCity, setSelectedCity] = useState(1)

  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(0);


  useEffect(()=>{
    setLoading(true)
    axios.get(`${BASE_URL}/ads/city/${selectedCity}/category/${selectedCategory}`).then(res=>{
      console.log(res.data)
      setAds(res.data)
      setLoading(false)
    }).catch(err=>{
      console.log(err)

    })
  }, [selectedCity, selectedCategory])



  // useEffect(()=>{
  //   setLoading(true)
  //   axios.get(`${GET_ADS_BY_CITY_ID}/${selectedCity}`).then(res=>{
  //     console.log(res.data)
  //     setAds(res.data)
  //     setLoading(false)
  //   }).catch(err=>{
  //     console.log(err)

  //   })
  // }, [selectedCity])


  useEffect(()=>{
    setLoading(true)
    axios.get(`${GET_CITIES_LIST}`).then(res=>{
      console.log(res.data)
      setCitiesList(res.data)
    }).catch(err=>{
      console.log(err)
    })
  }, [])


  useEffect(()=>{
      axios.get(GET_CATEGORIES).then(res=>{setCategories(res.data); console.log(res.data)}).catch(err=>{console.log(err)})
    }, [])

  const handleCityChange = (id) =>{
    setSelectedCity(id)
  }

  const handleCategorySelect = (id) => {
    setSelectedCategory(id)
  } 

  const [modalOpen, setModalOpen] = useState(false)
  const [currentAd, setCurrentAd] = useState(
    {
          id: 0,
          description: t('text'),
          contact_phone: "+996",
          category_id: 0,
          city_ids: [],
    }
  )


  return (
    <DashboardLayout>
      <MDBox pt={0} pb={3}>
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
        <div style={{height: "18px"}}>

        </div>
        {
          (selectedCity === 0) ? <></> : <>{t('common.allAdsInCity')}</>
        }
        
        {
          (selectedCity === 0) ? <p>{t('common.selectCity')}</p> : <Feed ads={ads} loading={loading} setCurrentAd={setCurrentAd} onOpen={()=>{
            setModalOpen(true)
          }}/>
        }        
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

export default Tables;
