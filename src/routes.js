import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import SignIn from "layouts/authentication/sign-in";

// @mui icons
import Icon from "@mui/material/Icon";
import NewModerator from "layouts/new_moderator";
import AllModerators from "layouts/all_moderators/AllModerators";
import MyAds from "layouts/myads";

const routes = [
  {
    type: "collapse",
    name: "Аналитика",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Бардык жарыялар",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Менин жарыяларым",
    key: "myads",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/myads",
    component: <MyAds />,
  },
  {
    type: "collapse",
    name: "Жаңы жарыя",
    key: "billing",
    icon: <Icon fontSize="small">add</Icon>,
    route: "/billing",
    component: <Billing />,
  },
    {
    type: "collapse",
    name: "Модераторлор",
    key: "moderators",
    icon: <Icon fontSize="small">group</Icon>,
    route: "/moderators",
    component: <AllModerators />,
  },
   {
    type: "collapse",
    name: "Жаңы модератор",
    key: "new-moderator",
    icon: <Icon fontSize="small">person_add</Icon>,
    route: "/new-moderator",
    component: <NewModerator />,
  },
  {
    type: "collapse",
    name: "Кируу",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  }
];

export default routes;
