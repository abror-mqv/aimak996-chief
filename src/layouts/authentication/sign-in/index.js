import { useEffect, useState } from "react";

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";


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

  const Useriew = () => {
    return(
      <MDBox>
        <MDTypography variant="h6" fontWeight="medium" color="white" mt={1}>
              Ваше имя: {me?.name}
        </MDTypography>
        <MDTypography variant="h6" fontWeight="medium" color="white" mt={1}>
              Ваш номер: {me?.phone}
        </MDTypography>
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
            {
              me?<Useriew/>: <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
              Аноним
            </MDTypography>
            }
           
          </MDBox>
          {
            me?<MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Сменить пользователя 
          </MDTypography>:<MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Вход 
          </MDTypography>
          }
          
         
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
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
                Войти
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

    </BasicLayout>
  );
}

export default Basic;
