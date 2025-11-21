import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Card from "@mui/material/Card";
import { Box, CircularProgress, Grid, Stack, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import axios from "axios";
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

export default function BusinessCardEdit() {
  const { pk } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    profile_photo: null,
    header_photo: null,
  });

  // Map refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const dragPhotoIndexRef = useRef(null);

  // Image previews
  const [profilePreview, setProfilePreview] = useState("");
  const [headerPreview, setHeaderPreview] = useState("");

  // Custom button component (not MUI Button)
  const CButton = ({ children, variant = 'contained', color = 'primary', size = 'medium', asLabel = false, disabled = false, sx = {}, ...props }) => {
    const Component = asLabel ? 'label' : 'button';
    const palette = {
      primary: '#1e88e5',
      error: '#e53935',
      secondary: '#6c757d',
      success: '#43a047',
    };
    const fg = variant === 'contained' ? '#ffffff' : (color === 'error' ? palette.error : palette.primary);
    const bg = variant === 'contained' ? (color === 'error' ? palette.error : (color === 'secondary' ? palette.secondary : palette.primary)) : 'transparent';
    const border = variant === 'outlined' ? `1px solid ${color === 'error' ? palette.error : (color === 'secondary' ? palette.secondary : palette.primary)}` : 'none';
    const pad = size === 'small' ? '2px 8px' : size === 'large' ? '10px 18px' : '6px 14px';
    return (
      <Box
        component={Component}
        {...props}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          borderRadius: 8,
          fontWeight: 600,
          fontSize: size === 'small' ? 12 : 14,
          lineHeight: 1.2,
          padding: pad,
          color: fg,
          backgroundColor: bg,
          border,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          textDecoration: 'none',
          userSelect: 'none',
          transition: 'transform .06s ease, filter .2s',
          '&:hover': { filter: disabled ? 'none' : 'brightness(0.95)' },
          '&:active': { transform: disabled ? 'none' : 'translateY(1px)' },
          ...sx,
        }}
      >
        {children}
      </Box>
    );
  };

  // Carousel photos & catalog & schedules
  const [photos, setPhotos] = useState([]); // [{id, url}]
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [pendingPhotoPreviews, setPendingPhotoPreviews] = useState([]); // object URLs for previews before upload
  const [schedules, setSchedules] = useState([
    { day_of_week: 0, open_time: "", close_time: "", is_closed: false },
    { day_of_week: 1, open_time: "", close_time: "", is_closed: false },
    { day_of_week: 2, open_time: "", close_time: "", is_closed: false },
    { day_of_week: 3, open_time: "", close_time: "", is_closed: false },
    { day_of_week: 4, open_time: "", close_time: "", is_closed: false },
    { day_of_week: 5, open_time: "", close_time: "", is_closed: false },
    { day_of_week: 6, open_time: "", close_time: "", is_closed: false },
  ]);
  const [catalogItems, setCatalogItems] = useState([]); // [{id, name, description, price, photo}]
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "", photo: null });
  const [newItemPreview, setNewItemPreview] = useState("");

  // Lists for selects
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Token ${token}` } : {};
  }, []);

  const load = useCallback(async () => {
    if (!pk) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/business/pk/${pk}/`, { headers: authHeaders });
      const data = res.data || null;
      if (data) {
        setForm((p) => ({
          ...p,
          city_id: data.city_id ? String(data.city_id) : "",
          category_id: data.category_id ? String(data.category_id) : "",
          name: data.name || "",
          short_description: data.short_description || "",
          long_description: data.long_description || "",
          cta_phone: data.cta_phone || "",
          additional_phone: data.additional_phone || "",
          management_phone: data.management_phone || "",
          price_info: data.price_info || "",
          address_text: data.address_text || "",
          latitude: data.latitude ? String(data.latitude) : "",
          longitude: data.longitude ? String(data.longitude) : "",
          theme_color: data.theme_color || "",
        }));
        setProfilePreview(data.profile_photo || "");
        setHeaderPreview(data.header_photo || "");
        // optional arrays
        if (Array.isArray(data.photos)) setPhotos(data.photos);
        if (Array.isArray(data.catalog_items)) setCatalogItems(data.catalog_items);
        if (Array.isArray(data.schedules) && data.schedules.length === 7) setSchedules(data.schedules);
      }
    } catch (e) {
      setError("Не удалось загрузить карточку");
    } finally {
      setLoading(false);
    }
  }, [pk, authHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  // fetch cities and categories like in create
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get(GET_CITIES_LIST);
        const list = Array.isArray(res.data) ? res.data : [];
        setCities(list);
      } catch { setCities([]); }
    };
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/business/categories/`);
        const list = Array.isArray(res.data) ? res.data : [];
        setCategories(list);
      } catch { setCategories([]); }
    };
    fetchCities();
    fetchCategories();
  }, []);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_photo" || name === "header_photo") {
      const file = files?.[0] || null;
      setForm((p) => ({ ...p, [name]: file }));
      if (name === "profile_photo") setProfilePreview(file ? URL.createObjectURL(file) : profilePreview);
      if (name === "header_photo") setHeaderPreview(file ? URL.createObjectURL(file) : headerPreview);
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  // Photos: replace, reorder
  const replacePhoto = async (photoId, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      await axios.put(`${BASE_URL}/business/mod/photos/${photoId}/replace/`, fd, { headers: { ...authHeaders } });
      await load();
    } catch (e) {
      setError("Не удалось заменить фото");
    }
  };

  const movePhoto = (index, direction) => {
    setPhotos((list) => {
      const arr = [...list];
      const j = direction === 'up' ? index - 1 : index + 1;
      if (j < 0 || j >= arr.length) return arr;
      const tmp = arr[index];
      arr[index] = arr[j];
      arr[j] = tmp;
      return arr;
    });
  };

  const savePhotosOrder = async () => {
    const order = photos
      .map((ph) => {
        const idRaw = ph && typeof ph === 'object' ? (ph.image_id ?? ph.id) : null;
        if (idRaw == null) return null;
        if (typeof idRaw === 'number' && Number.isInteger(idRaw)) return idRaw;
        if (typeof idRaw === 'string' && /^\d+$/.test(idRaw)) return parseInt(idRaw, 10);
        return null;
      })
      .filter((id) => id != null);
    const fd = new FormData();
    fd.append("order", JSON.stringify(order));
    try {
      await axios.post(`${BASE_URL}/business/mod/cards/${pk}/photos/reorder/`, fd, { headers: { ...authHeaders } });
      await load();
    } catch (e) {
      setError("Не удалось сохранить порядок фото");
    }
  };

  // Catalog: reorder helpers
  const moveCatalogItem = (index, direction) => {
    setCatalogItems((list) => {
      const arr = [...list];
      const j = direction === 'up' ? index - 1 : index + 1;
      if (j < 0 || j >= arr.length) return arr;
      const tmp = arr[index];
      arr[index] = arr[j];
      arr[j] = tmp;
      return arr;
    });
  };

  const saveCatalogOrder = async () => {
    const order = catalogItems.map((it) => it.id).filter((id) => Number.isInteger(id));
    if (!order.length) return;
    const fd = new FormData();
    fd.append("order", JSON.stringify(order));
    try {
      await axios.post(`${BASE_URL}/business/mod/cards/${pk}/catalog/reorder/`, fd, { headers: { ...authHeaders } });
    } catch (e) {
      setError("Не удалось сохранить порядок каталога");
    }
  };

  // Photos: add multiple
  const onAddPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !pk) return;
    // local previews
    const previews = files.map((f) => URL.createObjectURL(f));
    setPendingPhotoPreviews(previews);
    const fd = new FormData();
    if (files.length === 1) {
      fd.append("image", files[0]);
    } else {
      files.forEach((f) => fd.append("images[]", f));
    }
    setUploadingPhotos(true);
    try {
      const res = await axios.post(`${BASE_URL}/business/mod/cards/${pk}/photos/add/`, fd, { headers: { ...authHeaders } });
      const createdIds = res?.data?.created_ids || [];
      await load();
      if (Array.isArray(createdIds) && createdIds.length) {
        // If backend detail returns photos as string URLs, try to pair last N with created ids
        setPhotos((list) => {
          if (!Array.isArray(list) || !list.length) return list;
          const n = Math.min(createdIds.length, list.length);
          const start = list.length - n;
          return list.map((ph, idx) => {
            if (idx >= start && typeof ph === 'string') {
              const offset = idx - start;
              const id = createdIds[offset];
              return { id, url: ph };
            }
            return ph;
          });
        });
      }
    } catch (e) {
      setError("Не удалось загрузить фото");
    } finally {
      setUploadingPhotos(false);
      e.target.value = "";
      // clear pending previews after attempt (will be replaced by real photos on success)
      setPendingPhotoPreviews([]);
    }
  };

  const removePhoto = async (photoId) => {
    if (!window.confirm("Удалить фото?")) return;
    try {
      await axios.delete(`${BASE_URL}/business/mod/photos/${photoId}/delete/`, { headers: { ...authHeaders } });
      setPhotos((p) => p.filter((ph) => ph.id !== photoId));
    } catch (e) {
      setError("Не удалось удалить фото");
    }
  };

  // Schedules: set all
  const saveSchedules = async () => {
    if (!pk) return;
    // validate day_of_week 0..6
    const valid = schedules.every((s, idx) => s.day_of_week === idx && idx >= 0 && idx <= 6);
    if (!valid) return setError("Неверный day_of_week в расписании");
    const fd = new FormData();
    fd.append("schedules", JSON.stringify(schedules.map((s) => ({
      day_of_week: s.day_of_week,
      open_time: s.is_closed ? null : (s.open_time || null),
      close_time: s.is_closed ? null : (s.close_time || null),
      is_closed: !!s.is_closed,
    }))));
    try {
      await axios.post(`${BASE_URL}/business/mod/cards/${pk}/schedules/set/`, fd, { headers: { ...authHeaders } });
      await load();
    } catch (e) {
      setError("Не удалось сохранить график");
    }
  };

  const onScheduleChange = (idx, field, value) => {
    setSchedules((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  // Catalog: add, edit, delete
  const addCatalogItem = async () => {
    if (!newItem.name) return;
    const fd = new FormData();
    fd.append("name", newItem.name);
    if (newItem.description) fd.append("description", newItem.description);
    if (newItem.price) fd.append("price", newItem.price);
    if (newItem.photo) fd.append("photo", newItem.photo);
    setAddingItem(true);
    try {
      await axios.post(`${BASE_URL}/business/mod/cards/${pk}/catalog/add/`, fd, { headers: { ...authHeaders } });
      setNewItem({ name: "", description: "", price: "", photo: null });
      await load();
    } catch (e) {
      setError("Не удалось добавить позицию");
    } finally {
      setAddingItem(false);
    }
  };

  const updateCatalogItem = async (itemId, patch) => {
    const fd = new FormData();
    Object.entries(patch).forEach(([k, v]) => {
      if (v !== undefined && v !== null && `${v}` !== "") fd.append(k, v);
    });
    try {
      await axios.patch(`${BASE_URL}/business/mod/catalog/${itemId}/edit/`, fd, { headers: { ...authHeaders } });
      setCatalogItems((list) => list.map((it) => it.id === itemId ? { ...it, ...patch } : it));
    } catch (e) {
      setError("Не удалось обновить позицию");
    }
  };

  const deleteCatalogItem = async (itemId) => {
    if (!window.confirm("Удалить позицию?")) return;
    try {
      await axios.delete(`${BASE_URL}/business/mod/catalog/${itemId}/delete/`, { headers: { ...authHeaders } });
      setCatalogItems((list) => list.filter((it) => it.id !== itemId));
    } catch (e) {
      setError("Не удалось удалить позицию");
    }
  };

  const initMap = useCallback(async (lat, lng) => {
    try {
      await loadLeaflet();
      const L = window.L;
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const hasCoords = !Number.isNaN(latNum) && !Number.isNaN(lngNum);
      const center = hasCoords ? [latNum, lngNum] : [42.8746, 74.5698];
      const map = L.map(mapRef.current).setView(center, hasCoords ? 14 : 12);
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
      // initialize form if it was empty
      syncPos({ lat: center[0], lng: center[1] });
    } catch (e) {
      // ignore map load error
    }
  }, [setForm]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) {
      // update marker position when form coords change
      const latNum = parseFloat(form.latitude);
      const lngNum = parseFloat(form.longitude);
      if (!Number.isNaN(latNum) && !Number.isNaN(lngNum) && markerRef.current) {
        markerRef.current.setLatLng([latNum, lngNum]);
        mapInstanceRef.current.setView([latNum, lngNum]);
      }
      return;
    }
    // init once after card loaded
    initMap(form.latitude, form.longitude);
  }, [form.latitude, form.longitude, initMap]);

  const save = async () => {
    if (!pk) return;
    const fd = new FormData();
    Object.entries({
      city_id: form.city_id,
      category_id: form.category_id,
      name: form.name,
      short_description: form.short_description,
      long_description: form.long_description,
      cta_phone: form.cta_phone,
      additional_phone: form.additional_phone,
      management_phone: form.management_phone,
      price_info: form.price_info,
      address_text: form.address_text,
      latitude: form.latitude,
      longitude: form.longitude,
      theme_color: form.theme_color,
    }).forEach(([k, v]) => { if (v !== undefined && v !== null && `${v}` !== "") fd.append(k, v); });
    if (form.profile_photo) fd.append("profile_photo", form.profile_photo);
    if (form.header_photo) fd.append("header_photo", form.header_photo);

    setSaving(true);
    setError("");
    try {
      await axios.patch(`${BASE_URL}/business/mod/cards/${pk}/edit/`, fd, { headers: { ...authHeaders } });
      await load();
    } catch (e) {
      setError("Не удалось сохранить изменения");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!pk) return;
    if (!window.confirm(`Удалить карточку ${pk}?`)) return;
    setSaving(true);
    setError("");
    try {
      await axios.delete(`${BASE_URL}/business/mod/cards/${pk}/delete/`, { headers: { ...authHeaders } });
      navigate("/business/cards");
    } catch (e) {
      setError("Не удалось удалить карточку");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <MDBox py={3} px={3}>
        <MDTypography variant="h5" sx={{ mb: 2 }}>Редактировать карточку #{pk}</MDTypography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={2}>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
                ) : (
                  <Stack spacing={1}>
                    <FormControl size="small">
                      <InputLabel id="city-select-label">Город</InputLabel>
                      <Select labelId="city-select-label" label="Город" value={form.city_id} name="city_id" onChange={onChange}>
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
                    <TextField size="small" label="Название" name="name" value={form.name} onChange={onChange} />
                    <TextField size="small" label="Короткое описание" name="short_description" value={form.short_description} onChange={onChange} />
                    <TextField size="small" multiline minRows={3} label="Описание" name="long_description" value={form.long_description} onChange={onChange} />
                    <TextField size="small" label="Телефон" name="cta_phone" value={form.cta_phone} onChange={onChange} />
                    <TextField size="small" label="Доп. телефон" name="additional_phone" value={form.additional_phone} onChange={onChange} />
                    <TextField size="small" label="Телефон менеджмента" name="management_phone" value={form.management_phone} onChange={onChange} />
                    <TextField size="small" label="Цена" name="price_info" value={form.price_info} onChange={onChange} />
                    <TextField size="small" label="Адрес" name="address_text" value={form.address_text} onChange={onChange} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="input" type="color" value={(form.theme_color && /^#/.test(form.theme_color) ? form.theme_color : `#${(form.theme_color||'').replace('#','')}`).slice(0,7)} onChange={(e) => setForm((p)=>({ ...p, theme_color: e.target.value }))} sx={{ width: 42, height: 32, p: 0, border: '1px solid rgba(0,0,0,0.2)', borderRadius: 1 }} />
                      <TextField size="small" label="Цвет темы (hex)" name="theme_color" value={form.theme_color} onChange={onChange} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <CButton disabled={saving} variant="contained" onClick={save}>{saving ? "Сохранение..." : "Сохранить"}</CButton>
                      <CButton disabled={saving} color="error" variant="outlined" onClick={remove}>Удалить</CButton>
                      <CButton variant="text" onClick={() => navigate('/business/cards')}>Назад к списку</CButton>
                    </Box>
                    {error && (
                      <MDTypography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>{error}</MDTypography>
                    )}
                  </Stack>
                )}
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <MDBox p={2}>
                    <MDTypography variant="button" sx={{ mb: 1, display: 'block' }}>Местоположение (OpenStreetMap)</MDTypography>
                    <Box ref={mapRef} sx={{ width: '100%', height: 360, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }} />
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <MDBox p={2}>
                    <MDTypography variant="button" sx={{ mb: 1, display: 'block' }}>Аватар</MDTypography>
                    <Box sx={{ position: 'relative', width: 80, height: 80, borderRadius: 2, overflow: 'hidden', bgcolor: '#fafafa', border: '1px solid rgba(0,0,0,0.1)', mb: 1 }}>
                      {profilePreview ? (
                        <img alt="profile" src={profilePreview} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>Нет фото</Box>
                      )}
                    </Box>
                    <CButton asLabel variant="outlined">Заменить аватар<input hidden type="file" name="profile_photo" accept="image/*" onChange={onChange} /></CButton>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <MDBox p={2}>
                    <MDTypography variant="button" sx={{ mb: 1, display: 'block' }}>Обложка</MDTypography>
                    <Box sx={{ position: 'relative', pt: '56%', borderRadius: 2, overflow: 'hidden', bgcolor: '#fafafa', border: '1px solid rgba(0,0,0,0.1)', mb: 1 }}>
                      {headerPreview ? (
                        <img alt="header" src={headerPreview} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>Нет фото</Box>
                      )}
                    </Box>
                    <CButton asLabel variant="outlined">Заменить обложку<input hidden type="file" name="header_photo" accept="image/*" onChange={onChange} /></CButton>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <MDBox p={2}>
                    <MDTypography variant="button" sx={{ mb: 1, display: 'block' }}>Карусель фотографий</MDTypography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {photos.map((ph, idx) => {
                        const isObj = ph && typeof ph === 'object';
                        const src = isObj ? (ph.url || ph.image || ph.photo || ph.src) : String(ph);
                        const pid = isObj ? (ph.image_id ?? ph.id) : undefined;
                        const key = pid ?? src ?? idx;
                        return (
                          <Box
                            key={key}
                            draggable
                            onDragStart={() => { dragPhotoIndexRef.current = idx; }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              const from = dragPhotoIndexRef.current;
                              const to = idx;
                              if (from == null || from === to) return;
                              setPhotos((list) => {
                                const arr = [...list];
                                const [moved] = arr.splice(from, 1);
                                arr.splice(to, 0, moved);
                                return arr;
                              });
                              dragPhotoIndexRef.current = null;
                            }}
                            sx={{ position: 'relative', width: 120, height: 90, borderRadius: 1, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}
                          >
                            <img alt="ph" src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <Box sx={{ position: 'absolute', left: 4, top: 4, display: 'flex', gap: 0.5 }}>
                              <CButton size="small" variant="contained" sx={{ minWidth: 0, p: '2px 6px' }} onClick={() => movePhoto(idx, 'up')}>↑</CButton>
                              <CButton size="small" variant="contained" sx={{ minWidth: 0, p: '2px 6px' }} onClick={() => movePhoto(idx, 'down')}>↓</CButton>
                            </Box>
                            {pid && (
                              <>
                                <CButton size="small" color="error" variant="contained" onClick={() => removePhoto(pid)} sx={{ position: 'absolute', top: 4, right: 4, minWidth: 0, p: '2px 6px' }}>×</CButton>
                                <CButton asLabel size="small" variant="contained" sx={{ position: 'absolute', bottom: 4, right: 4, minWidth: 0, p: '2px 6px' }}>
                                  ⇆
                                  <input hidden type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) replacePhoto(pid, f); }} />
                                </CButton>
                              </>
                            )}
                          </Box>
                        );
                      })}
                      {pendingPhotoPreviews.map((src, i) => (
                        <Box key={`pending-${i}`} sx={{ position: 'relative', width: 120, height: 90, borderRadius: 1, overflow: 'hidden', border: '1px dashed rgba(0,0,0,0.2)' }}>
                          <img alt="pending" src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                        </Box>
                      ))}
                    </Box>
                    <CButton asLabel disabled={uploadingPhotos} variant="outlined">
                      {uploadingPhotos ? 'Загрузка...' : 'Добавить фото'}
                      <input hidden type="file" accept="image/*" multiple onChange={onAddPhotos} />
                    </CButton>
                    <CButton sx={{ ml: 1 }} variant="contained" onClick={savePhotosOrder}>Сохранить порядок</CButton>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="button" sx={{ mb: 1, display: 'block' }}>График работы</MDTypography>
                <Grid container spacing={1}>
                  {schedules.map((sch, idx) => (
                    <Grid key={idx} item xs={12} md={6} lg={4}>
                      <Box sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1, p: 1 }}>
                        <MDTypography variant="caption" sx={{ display: 'block', mb: 0.5 }}>День {idx} {sch.is_closed ? '(выходной)' : ''}</MDTypography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CButton size="small" variant={sch.is_closed ? 'contained' : 'outlined'} color={sch.is_closed ? 'secondary' : 'primary'} onClick={() => onScheduleChange(idx, 'is_closed', !sch.is_closed)}>
                            {sch.is_closed ? 'Закрыто' : 'Открыто'}
                          </CButton>
                          <TextField size="small" type="time" label="Открытие" value={sch.open_time || ""} onChange={(e) => onScheduleChange(idx, 'open_time', e.target.value)} disabled={sch.is_closed} InputLabelProps={{ shrink: true }} />
                          <TextField size="small" type="time" label="Закрытие" value={sch.close_time || ""} onChange={(e) => onScheduleChange(idx, 'close_time', e.target.value)} disabled={sch.is_closed} InputLabelProps={{ shrink: true }} />
                        </Stack>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ mt: 1 }}>
                  <CButton variant="contained" onClick={saveSchedules}>Сохранить график</CButton>
                </Box>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="button" sx={{ mb: 1, display: 'block' }}>Каталог</MDTypography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={1}>
                      <TextField size="small" label="Название*" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                      <TextField size="small" label="Описание" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                      <TextField size="small" label="Цена" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
                      <CButton asLabel variant="outlined">Фото<input hidden type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0] || null; setNewItem({ ...newItem, photo: f }); setNewItemPreview(f ? URL.createObjectURL(f) : ""); }} /></CButton>
                      {newItemPreview && (
                        <Box sx={{ position: 'relative', pt: '56%', borderRadius: 1, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
                          <img alt="preview" src={newItemPreview} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                      )}
                      <CButton disabled={addingItem} variant="contained" onClick={addCatalogItem}>{addingItem ? 'Добавление...' : 'Добавить'}</CButton>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                      {catalogItems.map((it, idx) => (
                        <Grid key={it.id} item xs={12}>
                          <Box sx={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 2, p: 2, display: 'grid', gridTemplateColumns: '220px 1fr auto', gap: 2, alignItems: 'start' }}>
                            <Box sx={{ position: 'relative', height: 180, borderRadius: 1, overflow: 'hidden', bgcolor: '#fafafa' }}>
                              {it.preview || it.photo ? (
                                <img alt={it.name} src={it.preview || it.photo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>Нет фото</Box>
                              )}
                            </Box>
                            <Box>
                              <Stack spacing={1}>
                                <TextField size="small" label="Название" value={it.name || ''} onChange={(e) => updateCatalogItem(it.id, { name: e.target.value })} />
                                <TextField size="small" multiline minRows={2} label="Описание" value={it.description || ''} onChange={(e) => updateCatalogItem(it.id, { description: e.target.value })} />
                                <TextField size="small" label="Цена" value={it.price || ''} onChange={(e) => updateCatalogItem(it.id, { price: e.target.value })} />
                                <Box>
                                  <CButton asLabel variant="outlined" sx={{ mr: 1 }}>Заменить фото<input hidden type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const url = URL.createObjectURL(f); setCatalogItems((list) => list.map((x) => x.id === it.id ? { ...x, preview: url } : x)); updateCatalogItem(it.id, { photo: f }); } }} /></CButton>
                                  <CButton color="error" variant="text" onClick={() => deleteCatalogItem(it.id)}>Удалить</CButton>
                                </Box>
                              </Stack>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'stretch' }}>
                              <CButton size="small" variant="contained" onClick={() => moveCatalogItem(idx, 'up')}>↑</CButton>
                              <CButton size="small" variant="contained" onClick={() => moveCatalogItem(idx, 'down')}>↓</CButton>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ mt: 1 }}>
                      <CButton variant="contained" onClick={saveCatalogOrder}>Сохранить порядок</CButton>
                    </Box>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}
