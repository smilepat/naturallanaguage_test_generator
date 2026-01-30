import { create } from "zustand";
import { AppState } from "@/types";

export const useAppStore = create<AppState>((set) => ({
  step: "input",
  userInput: "",
  criteria: null,
  problems: [],
  setStep: (step) => set({ step }),
  setUserInput: (userInput) => set({ userInput }),
  setCriteria: (criteria) => set({ criteria }),
  setProblems: (problems) => set({ problems }),
  reset: () =>
    set({ step: "input", userInput: "", criteria: null, problems: [] }),
}));
