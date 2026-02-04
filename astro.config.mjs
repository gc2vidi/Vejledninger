import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import AutoImport from 'astro-auto-import';


// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "GC2/Vidi",
      // Define language
      locales: {
        root: {
          label: "Dansk",
          lang: "da",
        },      },
      favicon: '/favicon.ico',
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'apple-touch-icon',
            sizes: '180x180',
            href: '/apple-touch-icon.png',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            href: '/favicon-32x32.png',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            type: 'image/svg+xml',
            href: '/icon.svg',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'manifest',
            href: '/manifest.webmanifest',
          },
        },
      ],
      // Set last updated
      lastUpdated: true,
      // Set logo
      logo: {
        src: './src/assets/logo-gc2-vidi.svg',
        alt: 'GC2/Vidi Brugergruppen',
      },
      // Set custom style
      customCss: ["./src/styles/style.css"],
      // Define sidebar
      sidebar: [
        {
          label: "Vidi",
          items: [
            {
              label: "Hvad er Vidi?",
              link: "/vidi",
            },
            {
              label: "Værktøjslinjen",
              collapsed: false,
              autogenerate: {
                directory: "vidi/vaerktojslinjen",
              },
            },
            {
              label: "Vidi-menuen",
              collapsed: false,
              autogenerate: {
                directory: "vidi/vidi-menuen",
              },
            },
            {
              label: "Extensions",
              collapsed: true,
              autogenerate: {
                directory: "vidi/extensions",
              },
            },
            {
              label: "Avanceret",
              collapsed: true,
              autogenerate: {
                directory: "vidi/avanceret",
              },
            },
            {
              label: "Tips & Tricks",
              collapsed: true,
              autogenerate: {
                directory: "vidi/tips-tricks",
              },
            },
          ],
        },
        {
          label: "GC2",
          //badge: { text: "Ny", variant: "success" },
          items: [
            {
              label: "Hvad er GC2?",
              link: "/gc2",
            },
            {
              label: "Indhold",
              collapsed: false,
              autogenerate: {
                directory: "gc2/pages",
              },
            },
          ],
        },
      ],
    }),
    AutoImport({
      imports: [
        // Add global components:
        './src/components/Ref.astro',
        './src/components/MenuPath.astro',
        './src/components/Key.astro',
      ],
    }),
  ],
});
