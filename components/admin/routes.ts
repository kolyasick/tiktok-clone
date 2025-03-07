type Route = {
  name: string;
  descr: string;
  path: string;
  icon: string;
};

export const routes: Route[] = [
  {
    name: "Dashboard",
    descr: "Data overview",
    path: "/admin/dashboard",
    icon: "material-symbols:dashboard-outline-rounded",
  },
  {
    name: "Videos",
    descr: "Manage videos",
    path: "/admin/videos",
    icon: "material-symbols:video-library-outline",
  },
  {
    name: "Users",
    descr: "Manage users",
    path: "/admin/users",
    icon: "ci:users",
  },
  {
    name: "Settings",
    descr: "Edit settings",
    path: "/admin/settings",
    icon: "material-symbols:settings-account-box-outline",
  },
] ;
