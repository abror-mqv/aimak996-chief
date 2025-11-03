import { useTranslation } from 'react-i18next';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Feed from "./comps/Feed";
import { GET_CITIES_LIST } from "constants/crud";
import CitySelect from "./comps/CitySelect";
import { GET_CATEGORIES } from "constants/crud";
import CategorySelect from "./comps/CategorySelect";
import { BASE_URL } from "constants/crud";
import EditAdModal from "components/EditAdModal";
import CircularProgress from "@mui/material/CircularProgress";

function Tables() {
  const { t } = useTranslation();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [citiesList, setCitiesList] = useState([]);
  const [selectedCity, setSelectedCity] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1, // Start from 1 as backend expects 1-based page numbers
    limit: 10, // Reduced limit for better testing
    hasMore: true
  });


  const fetchAds = useCallback(async (isLoadMore = false, pageToFetch = null) => {
    // For the first load, we use page 1 (not 0) as that's what the backend expects
    const currentPage = pageToFetch !== null ? pageToFetch : (isLoadMore ? pagination.page + 1 : 1);
    
    console.log('=== fetchAds called ===');
    console.log('isLoadMore:', isLoadMore);
    console.log('currentPage:', currentPage, 'pagination.page:', pagination.page);
    console.log('loading:', loading, 'loadingMore:', loadingMore);
    console.log('URL:', `${BASE_URL}/ads/city/${selectedCity}/category/${selectedCategory}/?page=${currentPage}&limit=${pagination.limit}`);
    
    // Prevent concurrent requests
    if ((!isLoadMore && loading) || (isLoadMore && loadingMore)) {
      console.log('Prevented concurrent request');
      return;
    }
    
    try {
      isLoadMore ? setLoadingMore(true) : setLoading(true);
      
      // Build URL with query parameters manually to ensure proper encoding
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', pagination.limit);
      
      const url = `${BASE_URL}/ads/city/${selectedCity}/category/${selectedCategory}/?${params.toString()}`;
      console.log('Fetching from URL:', url);
      
      const response = await axios.get(url);
      const { results, count } = response.data;
      
      console.log('API Response - count:', count, 'results:', results.length);
      console.log('Current ads before update:', ads.length);
      
      setAds(prev => {
        const newAds = isLoadMore ? [...prev, ...results] : results;
        console.log('New ads after update:', newAds.length);
        return newAds;
      });
      
      // Check if we have more items to load
      const hasMore = results.length === pagination.limit;
      console.log('hasMore calculation:', {
        resultsCount: results.length,
        limit: pagination.limit,
        hasMore: hasMore,
        currentPage: currentPage,
        totalCount: count
      });
      
      setPagination(prev => ({
        ...prev,
        page: currentPage,
        hasMore: hasMore
      }));
      
      return response.data;
    } catch (err) {
      console.error('Error fetching ads:', err);
      return null;
    } finally {
      isLoadMore ? setLoadingMore(false) : setLoading(false);
    }
  }, [selectedCity, selectedCategory, pagination.limit, pagination.page, loading, loadingMore]);

  // Handle scroll event for infinite loading with optimized thresholds
  useEffect(() => {
    console.log('Setting up scroll handler...');
    let timeoutId;
    let ticking = false;
    
    const checkScrollPosition = () => {
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const documentHeight = document.documentElement.offsetHeight;
      const isMobile = window.innerWidth <= 768; // Check if mobile view
      
      // Use larger threshold for mobile (load earlier)
      const threshold = isMobile ? documentHeight * 0.3 : 1000; // 30% of screen height on mobile, 1000px on desktop
      const bottomThreshold = documentHeight - threshold;
      
      console.log('Scroll check - position:', scrollPosition, 
                 'bottomThreshold:', bottomThreshold, 
                 'documentHeight:', documentHeight,
                 'isMobile:', isMobile,
                 'hasMore:', pagination.hasMore,
                 'loading:', loading,
                 'loadingMore:', loadingMore);
      
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
      if (document.documentElement.offsetHeight <= window.innerHeight && pagination.hasMore && !loading && !loadingMore) {
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
    console.log('City or category changed - selectedCity:', selectedCity, 'selectedCategory:', selectedCategory);
    const controller = new AbortController();
    
    const fetchInitialData = async () => {
      console.log('Fetching initial data...');
      // Reset pagination and fetch first page (page=1 for backend)
      setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
      await fetchAds(false, 1);
    };
    
    fetchInitialData();
    
    return () => {
      controller.abort();
    };
  }, [selectedCity, selectedCategory]); // Removed fetchAds from deps

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
          selectedCity === 0 ? (
            <p>{t('common.selectCity')}</p>
          ) : (
            <>
              <Feed 
                ads={ads} 
                loading={loading} 
                setCurrentAd={setCurrentAd} 
                onOpen={() => setModalOpen(true)}
              />
              {loadingMore && (
                <MDBox display="flex" justifyContent="center" my={2}>
                  <CircularProgress size={24} />
                </MDBox>
              )}
              {!loading && !loadingMore && ads.length === 0 && (
                <MDBox textAlign="center" py={4}>
                  <MDTypography variant="body2" color="textSecondary">
                    {t('common.noAdsFound')}
                  </MDTypography>
                </MDBox>
              )}
            </>
          )
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
