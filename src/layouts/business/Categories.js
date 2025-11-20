import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BASE_URL } from "constants/crud";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
export default function BusinessCategories() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const [form, setForm] = useState({
    name_ru: "",
    name_kg: "",
    gradient_start: "",
    gradient_end: "",
    icon: null,
  });

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Token ${token}` } : {};
  }, []);

  const listUrl = `${BASE_URL}/business/categories/`;
  const createUrl = `${BASE_URL}/business/mod/categories/create/`;
  const editUrl = (id) => `${BASE_URL}/business/mod/categories/${id}/edit/`;
  const deleteUrl = (id) => `${BASE_URL}/business/mod/categories/${id}/delete/`;

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(listUrl, { headers: authHeaders });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError("Не удалось загрузить категории");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [listUrl, authHeaders]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openCreate = () => {
    setForm({ name_ru: "", name_kg: "", gradient_start: "", gradient_end: "", icon: null });
    setCreateOpen(true);
  };

  const openEdit = (row) => {
    setCurrent(row);
    setForm({
      name_ru: row?.name_ru || "",
      name_kg: row?.name_kg || "",
      gradient_start: row?.gradient_start || "",
      gradient_end: row?.gradient_end || "",
      icon: null,
    });
    setEditOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "icon") {
      setForm((p) => ({ ...p, icon: files?.[0] || null }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const submitCreate = async () => {
    const fd = new FormData();
    fd.append("name_kg", form.name_kg);
    fd.append("name_ru", form.name_ru);
    if (form.gradient_start) fd.append("gradient_start", form.gradient_start);
    if (form.gradient_end) fd.append("gradient_end", form.gradient_end);
    if (form.icon) fd.append("icon", form.icon);
    try {
      await axios.post(createUrl, fd, { headers: { ...authHeaders } });
      setCreateOpen(false);
      await fetchList();
    } catch (e) {
      setError("Не удалось создать категорию");
    }
  };

  const submitEdit = async () => {
    if (!current) return;
    const fd = new FormData();
    if (form.name_kg) fd.append("name_kg", form.name_kg);
    if (form.name_ru) fd.append("name_ru", form.name_ru);
    if (form.gradient_start) fd.append("gradient_start", form.gradient_start);
    if (form.gradient_end) fd.append("gradient_end", form.gradient_end);
    if (form.icon) fd.append("icon", form.icon);
    try {
      await axios.patch(editUrl(current.id), fd, { headers: { ...authHeaders } });
      setEditOpen(false);
      setCurrent(null);
      await fetchList();
    } catch (e) {
      setError("Не удалось обновить категорию");
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Удалить категорию #${row.id}?`)) return;
    try {
      await axios.delete(deleteUrl(row.id), { headers: { ...authHeaders } });
      await fetchList();
    } catch (e) {
      setError("Не удалось удалить категорию");
    }
  };

  return (
     <DashboardLayout>
    <MDBox py={3} px={3}>
      <MDBox mb={2} display="flex" alignItems="center" justifyContent="space-between">
        <MDTypography variant="h5">категории</MDTypography>
        <Button variant="contained" onClick={openCreate}>Создать</Button>
      </MDBox>
      <Card>
        <MDBox p={2}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>name_ru</TableCell>
                    <TableCell>name_kg</TableCell>
                    <TableCell>icon</TableCell>
                    <TableCell>gradients</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>{r.name_ru}</TableCell>
                      <TableCell>{r.name_kg}</TableCell>
                      <TableCell>
                        {r.icon_url ? (
                          <img src={r.icon_url} alt="icon" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                        ) : (
                          <MDTypography variant="caption" color="text">—</MDTypography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: r.gradient_start || '#ccc' }} />
                          <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: r.gradient_end || '#ccc' }} />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(r)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(r)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {error && (
            <MDTypography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {error}
            </MDTypography>
          )}
        </MDBox>
      </Card>
    </MDBox>
    {/* Create dialog */}
    <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Создать категорию</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="name_ru" name="name_ru" value={form.name_ru} onChange={handleFormChange} fullWidth />
          <TextField label="name_kg" name="name_kg" value={form.name_kg} onChange={handleFormChange} fullWidth />
          <TextField label="gradient_start" name="gradient_start" value={form.gradient_start} onChange={handleFormChange} fullWidth />
          <TextField label="gradient_end" name="gradient_end" value={form.gradient_end} onChange={handleFormChange} fullWidth />
          <Button variant="outlined" component="label">
            Загрузить иконку
            <input hidden type="file" name="icon" accept="image/*" onChange={handleFormChange} />
          </Button>
          {form.icon && (
            <MDTypography variant="caption">Выбран файл: {form.icon.name}</MDTypography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
        <Button variant="contained" onClick={submitCreate}>Создать</Button>
      </DialogActions>
    </Dialog>

    {/* Edit dialog */}
    <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Редактировать категорию {current ? `#${current.id}` : ""}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="name_ru" name="name_ru" value={form.name_ru} onChange={handleFormChange} fullWidth />
          <TextField label="name_kg" name="name_kg" value={form.name_kg} onChange={handleFormChange} fullWidth />
          <TextField label="gradient_start" name="gradient_start" value={form.gradient_start} onChange={handleFormChange} fullWidth />
          <TextField label="gradient_end" name="gradient_end" value={form.gradient_end} onChange={handleFormChange} fullWidth />
          <Button variant="outlined" component="label">
            Загрузить новую иконку
            <input hidden type="file" name="icon" accept="image/*" onChange={handleFormChange} />
          </Button>
          {form.icon && (
            <MDTypography variant="caption">Выбран файл: {form.icon.name}</MDTypography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditOpen(false)}>Отмена</Button>
        <Button variant="contained" onClick={submitEdit}>Сохранить</Button>
      </DialogActions>
    </Dialog>
    </DashboardLayout>
    );
}
