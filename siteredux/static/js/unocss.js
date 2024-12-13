import presetIcons from 'https://esm.sh/@unocss/preset-icons/browser'
import presetUno from 'https://esm.sh/@unocss/preset-uno'
import presetWebFonts from 'https://esm.sh/@unocss/preset-web-fonts'
import initUnocssRuntime, { defineConfig } from 'https://esm.sh/@unocss/runtime'

const cfg =defineConfig({
  presets: [
	presetUno(),
	presetIcons({ cdn: 'https://esm.sh/' }),
	presetWebFonts({
		provider:'bunny',
        // customFetch: (url) => fetch(url, { cors:'no-cors' }).then(it => it.data),
		 fonts: {
			sans: ['Inter', 'Fira Sans', 'sans-serif'],
        brand: 'Orbitron',
        mono: ['Fira Code', 'Fira Mono:400,700'],
      },
	})
],
})
initUnocssRuntime({defaults:cfg})