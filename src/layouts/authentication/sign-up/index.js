import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";



import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CustomPhoneInput from "components/CustomPhoneInput/CustomPhoneInput";
import { useState } from "react";
import { Typography } from "@mui/material";
import axios from "axios";
import { POST_REGISTER } from "constants/crud";

function Cover() {

  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    navigate("/dashboard"); // Редирект на главную после закрытия модалки
  };

 
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const navigate = useNavigate();
  const submit = () => {
    const obj = {
      "phone": password,
      "password": login
    }
    axios.post(POST_REGISTER, obj).then(res=>{
      console.log(res)
      localStorage.setItem("authToken", res.data.token)
     setShowWelcomeModal(true);
    }).catch(err=>console.log(err))
  }



  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <Typography>
                Регистрация модератора
              </Typography>
            </MDBox>
            <MDBox mb={2}>
              <CustomPhoneInput  value={login} onChange={setLogin} default_country="kg" />
            </MDBox>

            <FormControl sx={{ mt: 1, width: "100%"}} variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-password" >Пароль</InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e)=>{
                      setPassword(e.target.value)
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? 'hide the password' : 'display the password'
                          }
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Password"
                  />
            </FormControl>

            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth onClick={()=>{
                submit()
              }}>
                Регистрация
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>

      <Dialog open={showWelcomeModal} onClose={handleCloseWelcomeModal}>
        <DialogTitle>Добро пожаловать!</DialogTitle>
        <DialogContent>
          <MDTypography>Вы успешно вошли в систему.</MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseWelcomeModal} color="info">
            Продолжить
          </MDButton>
        </DialogActions>
      </Dialog>


    </CoverLayout>
  );
}

export default Cover;
