import presetIcons from "https://esm.sh/@unocss/preset-icons/browser";
import presetUno from "https://esm.sh/@unocss/preset-uno";
import presetWebFonts from "https://esm.sh/@unocss/preset-web-fonts";
import initUnocssRuntime, {
  defineConfig,
} from "https://esm.sh/@unocss/runtime";

const cfg = defineConfig({
  presets: [
    presetUno(),
    presetIcons({ cdn: "https://esm.sh/" }),
    presetWebFonts({
      provider: "bunny",
      // customFetch: (url) => fetch(url, { cors:'no-cors' }).then(it => it.data),
      fonts: {
        sans: ["Inter", "Fira Sans", "sans-serif"],
        brand: "Orbitron",
        mono: ["Fira Code", "Fira Mono:400,700"],
      },
    }),
  ],
  theme: {
    colors: {
      primary: "rgb(var(--primary), <alpha-value>)",
      "primary-content": "rgb(var(--primary-content), <alpha-value>)",
    },
    spacing: {
      50: "2px",
      75: "4px",
      100: "8px",
      200: "12px",
      300: "16px",
      400: "24px",
      500: "32px",
      600: "40px",
      700: "48px",
      800: "64px",
      900: "80px",
      1000: "96px",
    },
    borderWidth: {
      sm: "calc(1*var(--border-width))",
      md: "calc(2*var(--border-width))",
      lg: "calc(4*var(--border-width))",
    },
    borderRadius: {
      xs: "var(--border-radius-xs)",
      sm: "var(--border-radius-sm)",
      md: "var(--border-radius-md)",
      lg: "var(--border-radius-lg)",
      xl: "var(--border-radius-xl)",
    },
  },
});
initUnocssRuntime({ defaults: cfg });
