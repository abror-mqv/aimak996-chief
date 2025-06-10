import { useEffect, useState } from "react";

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

// @mui material components
import Card from "@mui/material/Card";
import LogoutIcon from '@mui/icons-material/Logout';

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";


import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";



// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import CustomPhoneInput from "components/CustomPhoneInput/CustomPhoneInput";

import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from "axios";
import { POST_REGISTER } from "constants/crud";
import { POST_LOGIN } from "constants/crud";
import { GET_ME } from "constants/crud";

function Basic() {
  const { t } = useTranslation();
  const [me, setMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
      const [showWelcomeModal, setShowWelcomeModal] = useState(false);
      const navigate = useNavigate();
  
      const handleCloseWelcomeModal = () => {
      setShowWelcomeModal(false);
      navigate("/dashboard"); // Редирект на главную после закрытия модалки
    };
 
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const submit = () => {
    const obj = {
      "phone": login,
      "password": password
    }
    axios.post(POST_LOGIN, obj).then(res=>{
      console.log(res)
      localStorage.setItem("authToken", res.data.token)
      setShowWelcomeModal(true);
    }).catch(err=>console.log(err))
  }

  useEffect(()=>{
    const token = localStorage.getItem("authToken")
    axios.get(GET_ME, {headers: {
      Authorization: `Token ${token}`
    }}).then(res=>{
      console.log(res)
      setMe(res.data)
    }).catch(err=>{
      console.log(err)
    })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.reload();
  };

  const Useriew = () => {
    return(
      <MDBox>
        <MDTypography variant="h6" fontWeight="medium" color="white" mt={1}>
              {t('auth.yourName')}: {me?.name}
        </MDTypography>
        <MDTypography variant="h6" fontWeight="medium" color="white" mt={1}>
              {t('auth.yourPhone')}: {me?.phone}
        </MDTypography>
        <MDButton
          variant="text"
          color="white"
          onClick={handleLogout}
          sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <LogoutIcon />
          {t('auth.logout')}
        </MDButton>
      </MDBox>
    )
  }

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="left"
        >
          <MDBox>
            {me ? <Useriew/> : <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
              {t('auth.anonymous')}
            </MDTypography>}
          </MDBox>
          {!me && <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            {t('auth.login')}
          </MDTypography>}
        </MDBox>
        {!me && (
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">
              <MDBox mb={2}>
                <CustomPhoneInput value={login} onChange={setLogin} default_country="kg" />
              </MDBox>
              
              <FormControl sx={{ mt: 1, width: "100%"}} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password" >{t('auth.password')}</InputLabel>
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
                          showPassword ? t('auth.hidePassword') : t('auth.showPassword')
                        }
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label={t('auth.password')}
                />
              </FormControl>

              <MDBox mt={4} mb={1}>
                <MDButton variant="gradient" color="info" fullWidth onClick={()=>{
                  submit()
                }}>
                  {t('auth.login')}
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        )}
      </Card>
      <Dialog open={showWelcomeModal} onClose={handleCloseWelcomeModal}>
        <DialogTitle>{t('auth.welcome')}</DialogTitle>
        <DialogContent>
          <MDTypography>{t('auth.loginSuccess')}</MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseWelcomeModal} color="info">
            {t('auth.continue')}
          </MDButton>
        </DialogActions>
      </Dialog>

    </BasicLayout>
  );
}

export default Basic;
