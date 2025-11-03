import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { useTranslation } from 'react-i18next';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { GET_ADS_BY_CITY_ID } from "constants/crud";
import Feed from "./comps/Feed";
import { GET_CITIES_LIST } from "constants/crud";
import CitySelect from "./comps/CitySelect";
import { GET_CATEGORIES } from "constants/crud";
import CategorySelect from "./comps/CategorySelect";
import { BASE_URL } from "constants/crud";
import EditAdModal from "components/EditAdModal";
import CircularProgress from "@mui/material/CircularProgress";

function MyAds() {
  const { t } = useTranslation();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [citiesList, setCitiesList] = useState([]);
  const [selectedCity, setSelectedCity] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    hasMore: true
  });


  const fetchAds = useCallback(async (isLoadMore = false, pageToFetch = null) => {
    const currentPage = pageToFetch !== null ? pageToFetch : (isLoadMore ? pagination.page + 1 : 1);
    
    // Prevent concurrent requests
    if ((!isLoadMore && loading) || (isLoadMore && loadingMore)) {
      console.log('Prevented concurrent request');
      return;
    }
    
    try {
      isLoadMore ? setLoadingMore(true) : setLoading(true);
      
      const token = localStorage.getItem("authToken");
      const url = `${BASE_URL}/ads/my-city/${selectedCity}/category/${selectedCategory}/`;
      const params = new URLSearchParams({
        page: currentPage,
        limit: pagination.limit
      });
      
      console.log('Fetching ads from:', `${url}?${params.toString()}`);
      
      const response = await axios.get(`${url}?${params.toString()}`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      
      const { results, count } = response.data;
      
      setAds(prev => isLoadMore ? [...prev, ...results] : results);
      
      setPagination(prev => ({
        ...prev,
        page: currentPage,
        hasMore: results.length === pagination.limit
      }));
      
      return response.data;
    } catch (err) {
      console.error('Error fetching ads:', err);
      return null;
    } finally {
      isLoadMore ? setLoadingMore(false) : setLoading(false);
    }
  }, [selectedCity, selectedCategory, pagination.limit, pagination.page, loading, loadingMore]);
  
  // Handle scroll event for infinite loading
  useEffect(() => {
    let timeoutId;
    let ticking = false;
    
    const checkScrollPosition = () => {
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const documentHeight = document.documentElement.offsetHeight;
      const isMobile = window.innerWidth <= 768;
      const threshold = isMobile ? documentHeight * 0.3 : 1000;
      const bottomThreshold = documentHeight - threshold;
      
      if (
        scrollPosition < bottomThreshold || 
        !pagination.hasMore || 
        loading || 
        loadingMore
      ) return;
      
      fetchAds(true);
    };
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check in case content doesn't fill the screen
    const initialCheck = () => {
      if (document.documentElement.offsetHeight <= window.innerHeight && 
          pagination.hasMore && 
          !loading && 
          !loadingMore) {
        fetchAds(true);
      }
    };

    // Throttled scroll handler
    const throttledScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    // Initial check
    initialCheck();
    
    // Add event listeners
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', throttledScroll);
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pagination.hasMore, loading, loadingMore, fetchAds]);
  
  // Fetch ads when city or category changes
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchInitialData = async () => {
      // Reset pagination and fetch first page
      setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
      await fetchAds(false, 1);
    };
    
    fetchInitialData();
    
    return () => {
      controller.abort();
    };
  }, [selectedCity, selectedCategory]);



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
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  {t('myAds.title')}
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
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
                <div style={{height: "18px"}}></div>
                
                {ads.length === 0 && !loading && !loadingMore ? (
                  <MDBox textAlign="center" py={4}>
                    <MDTypography variant="body2" color="textSecondary">
                      {t('common.noAdsFound')}
                    </MDTypography>
                  </MDBox>
                ) : (
                  <Feed 
                    ads={ads} 
                    loading={loading && !loadingMore} 
                    setCurrentAd={setCurrentAd} 
                    onOpen={() => setModalOpen(true)} 
                  />
                )}
                {loadingMore && (
                  <MDBox display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={24} />
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
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

export default MyAds;
