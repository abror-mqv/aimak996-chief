// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MDButton from "components/MDButton";
import { GET_CATEGORIES, GET_TINDER_NEXT, POST_TINDER_LABEL } from 'constants/crud';
import CircularProgress from '@mui/material/CircularProgress';
import { keyframes } from '@mui/system';
import PredictionWidget from './PredictionWidget';

function Tinder() {
  const [categories, setCategories] = useState([]);
  const [currentAd, setCurrentAd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRetrain, setShowRetrain] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Token ${token}` } : {};
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(GET_CATEGORIES, { headers: authHeaders() });
      setCategories(res.data || []);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchNextAd = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(GET_TINDER_NEXT, { headers: authHeaders() });
      setCurrentAd(res.data || null);
    } catch (err) {
      setError("Не удалось загрузить объявление");
      setCurrentAd(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLabel = useCallback(async (categoryId) => {
    if (!currentAd) return;
    setActionLoading(true);
    setError("");
    try {
      // Placeholder payload; adjust on backend confirmation
      const res = await axios.post(
        POST_TINDER_LABEL,
        { ad_id: currentAd.id, category_id: categoryId },
        { headers: { 'Content-Type': 'application/json', ...authHeaders() } }
      );
      const ok = res?.data?.fastapi_response?.status === 'ok' || res?.data?.status === 'ok';
      const retrainTriggered =
        res?.data?.fastapi_response?.retrain_triggered === true ||
        res?.data?.fastapi_response?.retraining_triggered === true ||
        res?.data?.final_response?.retraining_triggered === true;
      if (ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1200);
      }
      if (retrainTriggered) {
        setShowRetrain(true);
        setTimeout(() => setShowRetrain(false), 1800);
      }
      await fetchNextAd();
    } catch (err) {
      setError("Не удалось отправить метку. Попробуйте ещё раз.");
    } finally {
      setActionLoading(false);
    }
  }, [currentAd, fetchNextAd]);

  useEffect(() => {
    fetchCategories();
    fetchNextAd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts 1-9 to select categories
  useEffect(() => {
    const onKeyDown = (e) => {
      if (actionLoading || !currentAd) return;
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        const idx = num - 1;
        if (categories[idx]) {
          handleLabel(categories[idx].id);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [categories, actionLoading, currentAd, handleLabel]);

  const successPop = keyframes`
    0% { transform: scale(0.6); opacity: 0; }
    60% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  `;

  const pendingPulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  `;

  const rotate = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `;

  return (
    <DashboardLayout>
      <MDBox mt={0} sx={{ position: 'relative' }}>
        <MDTypography variant="h4" sx={{ mb: 2 }}>Тренировка AImakbek</MDTypography>

        {error && (
          <MDTypography variant="button" color="error" sx={{ display: 'block', mb: 2 }}>
            {error}
          </MDTypography>
        )}

        <MDBox sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', mb: 3, animation: actionLoading ? `${pendingPulse} 1.2s ease-in-out infinite` : 'none' }}>
          {loading ? (
            <MDTypography variant="button">Загрузка...</MDTypography>
          ) : currentAd ? (
            <>
              <MDTypography variant="h6" sx={{ mb: 1 }}>Объявление #{currentAd.id}</MDTypography>
              <MDTypography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 1 }}>
                {currentAd.description}
              </MDTypography>
              {currentAd.contact_phone && (
                <MDTypography variant="button" color="text" sx={{ display: 'block', mb: 1 }}>
                  Телефон: {currentAd.contact_phone}
                </MDTypography>
              )}
              {currentAd.created_at && (
                <MDTypography variant="caption" color="text">
                  Создано: {new Date(currentAd.created_at).toLocaleString('ru-RU')}
                </MDTypography>
              )}
            </>
          ) : (
            <MDTypography variant="button">Нет доступных объявлений</MDTypography>
          )}
        </MDBox>

        <MDTypography variant="h6" sx={{ mb: 1 }}>Выберите категорию</MDTypography>
        <MDBox sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <MDButton
              key={category.id}
              variant="contained"
              color="dark"
              onClick={() => handleLabel(category.id)}
              disabled={actionLoading || !currentAd}
              sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', py: 1, color: '#fff !important' }}
            >
              <MDTypography variant="button" sx={{ lineHeight: 1, color: 'inherit' }}>{category.name}</MDTypography>
              {(() => {
                const idx = categories.findIndex(c => c.id === category.id);
                if (idx >= 0 && idx < 9) {
                  return (
                    <MDTypography variant="caption" sx={{ opacity: 0.8, mt: 0.5, color: 'inherit' }}>{idx + 1}</MDTypography>
                  );
                }
                return null;
              })()}
            </MDButton>
          ))}
        </MDBox>

       

        {/* Prediction widget for model confidence (bottom, full width) */}
        <PredictionWidget ad={currentAd} />

        {actionLoading && (
          <MDBox sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(1px)' }}>
            <MDBox sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={36} color="inherit" />
              <MDTypography variant="button">Отправка...</MDTypography>
            </MDBox>
          </MDBox>
        )}

        {showSuccess && (
          <MDBox sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <MDBox sx={{ width: 96, height: 96, borderRadius: '50%', backgroundColor: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', animation: `${successPop} 500ms ease forwards` }}>
              <MDTypography variant="h4" sx={{ color: '#fff' }}>✓</MDTypography>
            </MDBox>
          </MDBox>
        )}

        {showRetrain && (
          <MDBox sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: 2, backgroundColor: 'rgba(16, 67, 145, 0.9)', color: '#fff' }}>
            <MDBox sx={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: `${rotate} 700ms linear infinite` }} />
            <MDTypography variant="caption" sx={{ color: '#fff' }}>Retraining...</MDTypography>
          </MDBox>
        )}
        
      </MDBox>
    </DashboardLayout>
  );
}

export default Tinder;
