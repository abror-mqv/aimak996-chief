import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useState, useEffect } from "react";
import axios from "axios";
import { GET_CITIES_LIST, EDIT_CITY } from "constants/crud";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Collapse from "@mui/material/Collapse";
import Icon from "@mui/material/Icon";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";

function Cities() {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedCity, setExpandedCity] = useState(null);
    
    // Edit modal state
    const [editModal, setEditModal] = useState({
        open: false,
        cityId: null,
        field: '',
        label: '',
        value: '',
        isMultiline: false,
        loading: false,
        error: null
    });

    const fetchCities = async () => {
        setLoading(true);
        try {
            const response = await axios.get(GET_CITIES_LIST);
            setCities(response.data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCityExpand = (cityId) => {
        setExpandedCity(expandedCity === cityId ? null : cityId);
    };

    const handleOpenEdit = (field, label, value, cityId, isMultiline = false) => {
        setEditModal({
            open: true,
            cityId,
            field,
            label,
            value: value || '',
            isMultiline,
            loading: false,
            error: null
        });
    };

    const handleCloseEdit = () => {
        setEditModal(prev => ({ ...prev, open: false }));
    };

    const handleFieldChange = (e) => {
        setEditModal(prev => ({
            ...prev,
            value: e.target.value,
            error: null
        }));
    };

    const handleSaveField = async () => {
        const { cityId, field, value } = editModal;
        
        setEditModal(prev => ({ ...prev, loading: true, error: null }));
        
        try {
            const response = await axios.post(
                `${EDIT_CITY}${cityId}`,
                { [field]: value },
                {
                    headers: {
                        'Authorization': `Token ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Update local state
            setCities(prevCities => 
                prevCities.map(city => 
                    city.id === cityId
                        ? {
                              ...city,
                              info: {
                                  ...city.info,
                                  [field]: value
                              }
                          }
                        : city
                )
            );
            
            setEditModal(prev => ({ ...prev, open: false }));
            
            // Show success message (you can replace this with a toast/snackbar)
            alert('Изменения сохранены успешно!');
            
        } catch (error) {
            console.error('Error updating city:', error);
            setEditModal(prev => ({
                ...prev,
                error: error.response?.data?.detail || 'Произошла ошибка при сохранении',
                loading: false
            }));
        }
    };

    useEffect(() => {
        fetchCities();
    }, []);

    const renderField = (label, value, cityId, fieldName, isMultiline = false) => (
        <Grid container spacing={1} alignItems="flex-start" mb={2}>
            <Grid item xs={12} sm={2}>
                <MDTypography variant="button" fontWeight="medium" color="text">
                    {label}:
                </MDTypography>
            </Grid>
            <Grid item xs={12} sm={9}>
                <MDTypography 
                    variant="body2" 
                    color="text" 
                    sx={{
                        whiteSpace: isMultiline ? 'pre-line' : 'normal',
                        wordBreak: 'break-word',
                        backgroundColor: 'rgba(0,0,0,0.02)',
                        p: 1,
                        borderRadius: 1
                    }}
                >
                    {value || '—'}
                </MDTypography>
            </Grid>
            <Grid item xs={12} sm={1} sx={{ textAlign: 'right' }}>
                <MDButton 
                    variant="outlined" 
                    color="info" 
                    size="small"
                    onClick={() => handleOpenEdit(fieldName, label, value, cityId, isMultiline)}
                    sx={{ mt: { xs: 1, sm: 0 } }}
                >
                    <Icon>edit</Icon>
                </MDButton>
            </Grid>
        </Grid>
    );

    if (loading) return <MDBox>Loading cities...</MDBox>;
    if (error) return <MDBox>Error loading cities: {error.message}</MDBox>;

    return (
        <DashboardLayout>
            <MDBox py={3}>
                <MDBox mb={3}>
                    <MDTypography variant="h4">Города</MDTypography>
                </MDBox>
                <Grid container spacing={2}>
                    {cities.map((city) => (
                        <Grid item xs={12} key={city.id}>
                            <Card>
                                <MDBox 
                                    display="flex" 
                                    justifyContent="space-between" 
                                    alignItems="center" 
                                    p={2}
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => toggleCityExpand(city.id)}
                                >
                                    <MDTypography variant="h6">{city.name}</MDTypography>
                                    <Icon>{expandedCity === city.id ? 'expand_less' : 'expand_more'}</Icon>
                                </MDBox>
                                <Collapse in={expandedCity === city.id}>
                                    <Divider />
                                    <CardContent>
                                        {renderField('Телефон модератора', city.info?.moderator_phone, city.id, 'moderator_phone', false, 'moderator_phone')}
                                    {renderField('Текст для шаринга', city.info?.text_for_share, city.id, 'text_for_share', true, 'text_for_share')}
                                    {renderField('Текст для загрузки', city.info?.text_for_upload, city.id, 'text_for_upload', true, 'text_for_upload')}
                                    {renderField('Ссылка на Play Market', city.info?.playmarket_link, city.id, 'playmarket_link', false, 'playmarket_link')}
                                    {renderField('Ссылка на App Store', city.info?.appstore_link, city.id, 'appstore_link', false, 'appstore_link')}
                                    {renderField('Текст обновления', city.info?.update_text, city.id, 'update_text', false, 'update_text')}
                                    {renderField('Требуемая версия', city.info?.required_version, city.id, 'required_version', false, 'required_version')}
                                    </CardContent>
                                </Collapse>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </MDBox>
            
            {/* Edit Field Dialog */}
            <Dialog 
                open={editModal.open} 
                onClose={handleCloseEdit}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Редактировать {editModal.label?.toLowerCase()}
                </DialogTitle>
                <DialogContent>
                    {editModal.error && (
                        <MDTypography color="error" variant="caption">
                            {editModal.error}
                        </MDTypography>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label={editModal.label}
                        type="text"
                        fullWidth
                        multiline={editModal.isMultiline}
                        rows={editModal.isMultiline ? 4 : 1}
                        value={editModal.value}
                        onChange={handleFieldChange}
                        variant="outlined"
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <MDButton 
                        onClick={handleCloseEdit}
                        color="secondary"
                        disabled={editModal.loading}
                    >
                        Отмена
                    </MDButton>
                    <MDButton 
                        onClick={handleSaveField}
                        color="primary"
                        disabled={editModal.loading}
                        startIcon={editModal.loading ? <CircularProgress size={20} /> : null}
                    >
                        {editModal.loading ? 'Сохранение...' : 'Сохранить'}
                    </MDButton>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}

export default Cities;
