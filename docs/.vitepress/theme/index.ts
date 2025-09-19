import DefaultTheme from "vitepress/theme";
import HomeHero from "./components/HomeHero.vue";
import "../../public/style/index.scss";
import type { Theme } from "vitepress";

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("HomeHero", HomeHero);
  },
};

export default theme;
