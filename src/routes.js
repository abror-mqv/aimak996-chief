import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import SignIn from "layouts/authentication/sign-in";
import { useTranslation } from 'react-i18next';
import PushNotifications from "layouts/push-notifications";
import ModeratorStats from "layouts/moderator-stats";
import AnnouncementPublish from "layouts/AnnouncementPublish";

// @mui icons
import Icon from "@mui/material/Icon";
import NewModerator from "layouts/new_moderator";
import AllModerators from "layouts/all_moderators/AllModerators";
import MyAds from "layouts/myads";
import ModeratorAds from "layouts/moderator-ads";
import SearchAds from "layouts/search-ads";
import Tinder from "layouts/tinder";
import Cities from "layouts/cities";
const Routes = () => {
  const { t } = useTranslation();

  const routes = [
    {
      type: "collapse",
      name: t('sidebar.analytics'),
      key: "dashboard",
      icon: <Icon fontSize="small">dashboard</Icon>,
      route: "/dashboard",
      component: <Dashboard />,
    },
    {
      type: "collapse",
      name: t('sidebar.announcementPublish'),
      key: "announcement-publish",
      icon: <Icon fontSize="small">campaign</Icon>,
      route: "/announcement-publish",
      component: <AnnouncementPublish />,
    },
    {
      type: "collapse",
      name: t('sidebar.search'),
      key: "search",
      icon: <Icon fontSize="small">search</Icon>,
      route: "/search",
      component: <SearchAds />,
    },
    {
      type: "collapse",
      name: t('sidebar.allAds'),
      key: "tables",
      icon: <Icon fontSize="small">table_view</Icon>,
      route: "/tables",
      component: <Tables />,
    },
    {
      type: "collapse",
      name: t('sidebar.myAds'),
      key: "myads",
      icon: <Icon fontSize="small">table_view</Icon>,
      route: "/myads",
      component: <MyAds />,
    },
    {
      type: "collapse",
      name: t('sidebar.newAd'),
      key: "billing",
      icon: <Icon fontSize="small">add</Icon>,
      route: "/billing",
      component: <Billing />,
    },
    {
      type: "collapse",
      name: t('sidebar.moderators'),
      key: "moderators",
      icon: <Icon fontSize="small">group</Icon>,
      route: "/moderators",
      component: <AllModerators />,
    },
    {
      type: "collapse",
      name: t('sidebar.newModerator'),
      key: "new-moderator",
      icon: <Icon fontSize="small">person_add</Icon>,
      route: "/new-moderator",
      component: <NewModerator />,
    },
    {
      type: "collapse",
      name: t('sidebar.pushNotifications'),
      key: "push-notifications",
      icon: <Icon fontSize="small">notifications</Icon>,
      route: "/push-notifications",
      component: <PushNotifications />,
    },
    {
      type: "collapse",
      name: t('sidebar.login'),
      key: "sign-in",
      icon: <Icon fontSize="small">login</Icon>,
      route: "/authentication/sign-in",
      component: <SignIn />,
    },
    {
      type: "hidden",
      name: t('sidebar.moderatorAds'),
      key: "moderator-ads",
      route: "/moderator-ads/:moderatorId",
      component: <ModeratorAds />,
    },
    {
      type: "hidden",
      name: "Статистика модератора",
      key: "moderator-stats",
      route: "/moderator-stats/:moderatorId",
      component: <ModeratorStats />,
    },
    {
      type: "collapse",
      name: "Города",
      key: "cities",
      icon: <Icon fontSize="small">apartment</Icon>,
      route: "/cities",
      component: <Cities />,
    },
    {
      type: "collapse",
      name: "Тиндер",
      key: "tinder",
      icon: <Icon fontSize="small">smart_toy</Icon>,
      route: "/tinder",
      component: <Tinder />,
    }
  ];

  return routes;
};

export default Routes;
