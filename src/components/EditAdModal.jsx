import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import MultiCitySelect from "./MultipleCitySelect";
import CategorySelect from "./CategorySelect";
import { EDIT_AD } from "constants/crud";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
};

const EditAdModal = ({ open, handleClose, ad, categories, cities, token }) => {
  const [description, setDescription] = useState(ad.description || "");
  const [contactPhone, setContactPhone] = useState(ad.contact_phone || "");
  const [selectedCategory, setSelectedCategory] = useState(ad.category_id || "");
  const [selectedCities, setSelectedCities] = useState(ad.city_ids || []);
  const [images, setImages] = useState([]);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("contact_phone", contactPhone);
    formData.append("category", selectedCategory);

    selectedCities.forEach((cityId) => formData.append("cities", cityId));
    images.forEach((img) => formData.append("images", img));

    try {
      const token = localStorage.getItem("authToken")
      await axios.put(`${EDIT_AD}/${ad.id}/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      }).then(res=>{
        console.log(res)
        alert("Объявление обновилось! Перезагрузите страницу")
      });
      handleClose(true); // true = нужно обновить список
    } catch (error) {
      console.error("Ошибка при обновлении:", error);
    }
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  useEffect(() => {
    console.log(ad)

    setDescription(ad.description || "");
    setContactPhone(ad.contact_phone || "");
    setSelectedCategory(ad.category_id || "");
    setSelectedCities(ad.city_ids || []);
    setImages([]);
  }, [ad]);

  return (
    <Modal open={open} onClose={() => handleClose(false)}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          Редактирование объявления
        </Typography>

        <TextField
          fullWidth
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Телефон"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <CategorySelect
            categories={categories} 
            selectedCategory={selectedCategory} 
            onCategoryChange={setSelectedCategory} 
          />
          {/* <Select
            value={selectedCategory}
            label="Категория"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select> */}
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <MultiCitySelect
            cities={cities}
            selectedCities={selectedCities}
            onCitiesChange={setSelectedCities}
          />
          {/* <Select
            multiple
            value={selectedCities}
            onChange={(e) => setSelectedCities(e.target.value)}
            input={<OutlinedInput label="Города" />}
            renderValue={(selected) =>
              cities
                .filter((city) => selected.includes(city.id))
                .map((c) => c.name)
                .join(", ")
            }
          >
            {cities.map((city) => (
              <MenuItem key={city.id} value={city.id}>
                <Checkbox checked={selectedCities.includes(city.id)} />
                <ListItemText primary={city.name} />
              </MenuItem>
            ))}
          </Select> */}
        </FormControl>

        <Box display="flex" justifyContent="flex-end">
          <Button onClick={() => handleClose(false)} sx={{ mr: 2 }}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleSave} style={{color: "#fff"}}>
            Сохранить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditAdModal;
