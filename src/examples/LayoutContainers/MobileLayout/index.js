import { Box, ThemeProvider } from "@mui/material";
import { useMaterialUIController } from "context";
import theme from "assets/theme";

function MobileLayout({ children }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: darkMode ? "#1a2035" : "#f0f2f5",
          minHeight: "100vh",
          width: "100%",
          padding: 2,
          boxSizing: "border-box",
          overflowX: "hidden"
        }}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
}

export default MobileLayout;
