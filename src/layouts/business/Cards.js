import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "constants/crud";
import { Box, Button, CircularProgress, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function BusinessCards() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [cards, setCards] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setListLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/business/cards/`);
      setCards(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (e) {
      setCards([]);
      setError("Не удалось загрузить список карточек");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // creation is moved to /business/cards/create

  return (
    <DashboardLayout>
      <MDBox py={3} px={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <MDTypography variant="h5">карточки</MDTypography>
          <Button variant="contained" onClick={() => navigate('/business/cards/create')}>Создать карточку</Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Button variant="outlined" onClick={fetchList}>Обновить</Button>
        </Box>

        {error && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>{error}</Typography>
        )}

        {listLoading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress size={32} /></Box>
        ) : (
          <Grid container spacing={2}>
            {cards.map((c) => (
              <Grid key={c.pk || c.id} item xs={12} sm={6} md={4} lg={3}>
                <Card onClick={() => navigate(`/business/cards/${c.pk || c.id}/edit`)} sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform .15s ease', '&:hover': { transform: 'translateY(-2px)' } }}>
                  <Box sx={{ position: 'relative', pt: '56%', width: '100%', overflow: 'hidden', background: '#f4f6f8' }}>
                    {c.profile_photo ? (
                      <Box component="img" src={c.profile_photo} alt={c.name} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.4)' }}>Нет фото</Box>
                    )}
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>{c.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>
                      {(c.short_description || '').slice(0, 100)}{(c.short_description || '').length > 100 ? '…' : ''}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </MDBox>
    </DashboardLayout>
  );
}
