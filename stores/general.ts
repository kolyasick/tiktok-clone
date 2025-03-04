import type { Chat, Profile } from "@prisma/client";
import { defineStore } from "pinia";
import type { IMessage, IRoom } from "~/types/user.type";
interface IChat extends Chat {
  messages: IMessage[];
  companion: Profile;
}
export const useGeneralStore = defineStore("gen", {
  state: () => ({
    isLoginOpen: false as boolean,
    isEditProfileOpen: false as boolean,
    chats: null as IChat[] | null,
    currentChat: null as IChat | null,
  }),
  actions: {
    bodySwitch(val: boolean) {
      if (val) {
        document.body.style.overflow = "hidden";
        return;
      }
      document.body.style.overflow = "visible";
    },

    allLowerCaseNoCaps(str: string) {
      return str.split(" ").join("").toLowerCase();
    },
  },
});
