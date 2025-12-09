import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Grid,
  Typography,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import { GET_UNPAID_ADS, BASE_URL, POST_MARK_PAID } from "constants/crud";

const UnpaidAds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(GET_UNPAID_ADS, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const { results } = res.data || {};
        setAds(results || []);
      } catch (err) {
        console.error("Failed to load unpaid ads", err);
        setError("Не удалось загрузить неоплаченные объявления");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <MDBox pt={0} pb={3}>
        <Typography variant="h4" mb={3}>
          Неоплаченные объявления
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && ads.length === 0 && (
          <Typography variant="body2">Нет неоплаченных объявлений</Typography>
        )}

        <Grid container spacing={3}>
          {ads.map((ad) => {
            const photo = ad.photos?.[0] ? `${BASE_URL}${ad.photos[0]}` : null;
            const cityNames = ad.cities?.map((c) => c.name).join(", ");
            const handleMarkPaid = async () => {
              try {
                setMarkingId(ad.id);
                const token = localStorage.getItem("authToken");
                await axios.post(
                  POST_MARK_PAID,
                  { ad_id: ad.id },
                  {
                    headers: {
                      Authorization: `Token ${token}`,
                    },
                  }
                );
                setAds((prev) => prev.filter((item) => item.id !== ad.id));
              } catch (err) {
                console.error("Failed to mark as paid", err);
                setError("Не удалось пометить как оплаченное");
              } finally {
                setMarkingId(null);
              }
            };
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={ad.id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  {photo && (
                    <CardMedia
                      component="img"
                      height="180"
                      image={photo}
                      alt={ad.category?.name || "Фото"}
                    />
                  )}
                  <CardContent
                    sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Chip label={ad.category?.name || "Категория"} size="small" color="primary" />
                      {ad.is_confident && <Chip label="Премиум" size="small" color="success" />}
                    </Stack>
                    {cityNames && (
                      <Typography variant="caption" color="text.secondary">
                        {cityNames}
                      </Typography>
                    )}
                    <Divider />
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {ad.description}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt="auto">
                      <Typography variant="caption" color="text.secondary">
                        {ad.contact_phone}
                      </Typography>
                      {ad.created_at && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(ad.created_at).toLocaleDateString()}
                        </Typography>
                      )}
                    </Stack>
                    {ad.author && (
                      <Chip label={ad.author} size="small" color="secondary" sx={{ alignSelf: "flex-start" }} />
                    )}
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{ mt: 1, alignSelf: "flex-start" }}
                      onClick={handleMarkPaid}
                      disabled={markingId === ad.id}
                    >
                      {markingId === ad.id ? "Отмечаем..." : "Отметить как оплаченное"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default UnpaidAds;
