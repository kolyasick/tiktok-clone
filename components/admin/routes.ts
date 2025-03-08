import { IconsDashboard, IconsPeople, IconsSettings, IconsVideos } from "#components";
import type { Component } from "vue";

type Route = {
  name: string;
  descr: string;
  path: string;
  icon: Component;
};

export const routes: Route[] = [
  {
    name: "Dashboard",
    descr: "Data overview",
    path: "/admin/dashboard",
    icon: IconsDashboard,
  },
  {
    name: "Videos",
    descr: "Manage videos",
    path: "/admin/videos",
    icon: IconsVideos,
  },
  {
    name: "Users",
    descr: "Manage users",
    path: "/admin/users",
    icon: IconsPeople,
  },
  {
    name: "Settings",
    descr: "Edit settings",
    path: "/admin/settings",
    icon: IconsSettings,
  },
];
