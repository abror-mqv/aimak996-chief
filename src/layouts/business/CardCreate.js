import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Card from "@mui/material/Card";
import { Box, Button, CircularProgress, Grid, Stack, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import axios from "axios";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { BASE_URL, GET_CITIES_LIST } from "constants/crud";

// Lightweight Leaflet (OpenStreetMap) loader (no extra deps)
const loadLeaflet = () =>
  new Promise((resolve, reject) => {
    if (window.L && window.L.map) return resolve(window.L);
    const existingJs = document.getElementById("leaflet-js");
    const existingCss = document.getElementById("leaflet-css");
    const onReady = () => (window.L && window.L.map ? resolve(window.L) : reject(new Error("Leaflet failed")));

    if (!existingCss) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (existingJs) {
      existingJs.addEventListener("load", onReady, { once: true });
      existingJs.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.defer = true;
    script.onload = onReady;
    script.onerror = reject;
    document.body.appendChild(script);
  });

export default function BusinessCardCreate() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // OpenStreetMap via Leaflet — ключ не требуется

  const [form, setForm] = useState({
    city_id: "",
    category_id: "",
    name: "",
    short_description: "",
    long_description: "",
    cta_phone: "",
    additional_phone: "",
    management_phone: "",
    price_info: "",
    address_text: "",
    latitude: "",
    longitude: "",
    theme_color: "",
    tags: "",
    profile_photo: null,
    header_photo: null,
  });

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Token ${token}` } : {};
  }, []);

  const initMap = useCallback(async () => {
    try {
      await loadLeaflet();
      const L = window.L;
      const center = [42.8746, 74.5698]; // Бишкек по умолчанию
      const map = L.map(mapRef.current).setView(center, 12);
      mapInstanceRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker(center, { draggable: true }).addTo(map);
      markerRef.current = marker;

      const syncPos = (latlng) => {
        setForm((p) => ({ ...p, latitude: latlng.lat.toFixed(6), longitude: latlng.lng.toFixed(6) }));
      };

      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        syncPos(e.latlng);
      });
      marker.on("dragend", () => {
        syncPos(marker.getLatLng());
      });
      // initialize lat/lng from default center
      syncPos(marker.getLatLng());
    } catch (e) {
      console.warn("Leaflet (OSM) failed to load.");
    }
  }, []);

  const fetchCities = useCallback(async () => {
    try {
      const res = await axios.get(GET_CITIES_LIST);
      const list = Array.isArray(res.data) ? res.data : [];
      setCities(list);
      if (!form.city_id && list.length) setForm((p) => ({ ...p, city_id: String(list[0].id) }));
    } catch (e) {
      setCities([]);
    }
  }, [form.city_id]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/business/categories/`);
      const list = Array.isArray(res.data) ? res.data : [];
      setCategories(list);
      if (!form.category_id && list.length) setForm((p) => ({ ...p, category_id: String(list[0].id) }));
    } catch (e) {
      setCategories([]);
    }
  }, [form.category_id]);

  useEffect(() => {
    fetchCities();
    fetchCategories();
    initMap();
  }, [fetchCities, fetchCategories, initMap]);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_photo" || name === "header_photo") {
      setForm((p) => ({ ...p, [name]: files?.[0] || null }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const submitCreate = async () => {
    const fd = new FormData();
    fd.append("city_id", form.city_id);
    fd.append("name", form.name);
    if (form.category_id) fd.append("category_id", form.category_id);
    if (form.short_description) fd.append("short_description", form.short_description);
    if (form.long_description) fd.append("long_description", form.long_description);
    if (form.cta_phone) fd.append("cta_phone", form.cta_phone);
    if (form.additional_phone) fd.append("additional_phone", form.additional_phone);
    if (form.management_phone) fd.append("management_phone", form.management_phone);
    if (form.price_info) fd.append("price_info", form.price_info);
    if (form.address_text) fd.append("address_text", form.address_text);
    if (form.latitude) fd.append("latitude", form.latitude);
    if (form.longitude) fd.append("longitude", form.longitude);
    if (form.theme_color) fd.append("theme_color", form.theme_color);
    if (form.tags) fd.append("tags", form.tags);
    if (form.profile_photo) fd.append("profile_photo", form.profile_photo);
    if (form.header_photo) fd.append("header_photo", form.header_photo);

    setCreating(true);
    setError("");
    try {
      const res = await axios.post(`${BASE_URL}/business/mod/cards/create/`, fd, { headers: { ...authHeaders } });
      const newPk = res?.data?.pk;
      if (newPk) navigate(`/business/cards/${newPk}/edit`);
    } catch (e) {
      setError("Не удалось создать карточку");
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
    <Box sx={{ p: 3 }}>
      <MDTypography variant="h5" sx={{ mb: 2 }}>Создать карточку</MDTypography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card>
            <MDBox p={2}>
              <Stack spacing={1}>
                <FormControl size="small">
                  <InputLabel id="city-select-label">Город*</InputLabel>
                  <Select labelId="city-select-label" label="Город*" value={form.city_id} name="city_id" onChange={onChange}>
                    {cities.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel id="category-select-label">Категория</InputLabel>
                  <Select labelId="category-select-label" label="Категория" value={form.category_id} name="category_id" onChange={onChange}>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={String(cat.id)}>{cat.name_ru || cat.name_kg || `#${cat.id}`}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField size="small" label="Название*" name="name" value={form.name} onChange={onChange} />
                <TextField size="small" label="Короткое описание" name="short_description" value={form.short_description} onChange={onChange} />
                <TextField size="small" multiline minRows={3} label="Описание" name="long_description" value={form.long_description} onChange={onChange} />
                <TextField size="small" label="Телефон" name="cta_phone" value={form.cta_phone} onChange={onChange} />
                <TextField size="small" label="Доп. телефон" name="additional_phone" value={form.additional_phone} onChange={onChange} />
                <TextField size="small" label="Телефон менеджмента" name="management_phone" value={form.management_phone} onChange={onChange} />
                <TextField size="small" label="Цена" name="price_info" value={form.price_info} onChange={onChange} />
                <TextField size="small" label="Адрес" name="address_text" value={form.address_text} onChange={onChange} />
                <Stack direction="row" spacing={1}>
                  <TextField size="small" label="Широта" name="latitude" value={form.latitude} onChange={onChange} />
                  <TextField size="small" label="Долгота" name="longitude" value={form.longitude} onChange={onChange} />
                </Stack>
                <TextField size="small" label="Цвет темы" name="theme_color" value={form.theme_color} onChange={onChange} />
                <TextField size="small" label="Теги (JSON)" name="tags" value={form.tags} onChange={onChange} />
                <Button variant="outlined" component="label">profile_photo<input hidden type="file" name="profile_photo" accept="image/*" onChange={onChange} /></Button>
                <Button variant="outlined" component="label">header_photo<input hidden type="file" name="header_photo" accept="image/*" onChange={onChange} /></Button>
                <Box>
                  <Button disabled={creating} variant="contained" onClick={submitCreate}>
                    {creating ? "Создание..." : "Создать"}
                  </Button>
                </Box>
                {error && (
                  <MDTypography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>{error}</MDTypography>
                )}
              </Stack>
            </MDBox>
          </Card>
          <Card>
            <MDBox p={2}>
              <MDTypography variant="button" sx={{ mb: 1, display: 'block' }}>Выберите точку на карте (OpenStreetMap)</MDTypography>
              <Box ref={mapRef} sx={{ width: '100%', height: 420, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }} />
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </Box>
    </DashboardLayout>
  );
}
