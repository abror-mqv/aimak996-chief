import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import CircularProgress from '@mui/material/CircularProgress';
import { POST_PREDICT } from 'constants/crud';

const formatPercent = (v) => {
  if (typeof v !== 'number' || isNaN(v)) return '-';
  const pct = Math.round(v * 100);
  return `${pct}%`;
};

const PredictionWidget = ({ ad }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const authHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Token ${token}` } : {};
    };

  const handlePredict = useCallback(async () => {
    if (!ad) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      // Minimal payload: send ad_id; backend can fetch content by id
      const res = await axios.post(
        POST_PREDICT,
        { "text": ad.description },
        { headers: { 'Content-Type': 'application/json', ...authHeaders() } }
      );
      setResult(res.data || null);
    } catch (e) {
      setError('Не удалось получить уверенность модели');
    } finally {
      setLoading(false);
    }
  }, [ad]);

  // Reset when ad changes
  useEffect(() => {
    setLoading(false);
    setError('');
    setResult(null);
  }, [ad?.id]);

  return (
    <MDBox sx={{ mt: 2, p: 2, borderRadius: 2, border: '1px dashed rgba(0,0,0,0.2)', width: '100%' }}>
      <MDBox sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <MDButton variant="outlined" color="dark" onClick={handlePredict} disabled={!ad || loading}>
          {loading ? 'Запрос...' : 'Проверить уверенность'}
        </MDButton>
        {loading && <CircularProgress size={20} />}
        {error && (
          <MDTypography variant="caption" color="error" sx={{ ml: 1 }}>
            {error}
          </MDTypography>
        )}
      </MDBox>

      {result && (
        <MDBox sx={{ mt: 1 }}>
          <MDTypography variant="button" sx={{ display: 'block' }}>
            Категория: {result.category_name || result.category || '-'}
          </MDTypography>
          {result.phone && (
            <MDTypography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
              Телефон: {result.phone}
            </MDTypography>
          )}
          <MDTypography variant="h6" sx={{ mt: 0.5 }}>
            Уверенность: {formatPercent(result.confidence)}
          </MDTypography>
        </MDBox>
      )}
    </MDBox>
  );
};

export default PredictionWidget;
