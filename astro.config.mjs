import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import AutoImport from 'astro-auto-import';

const isProduction = process.env.NODE_ENV === "production";
const basePath = isProduction ? "/Vejledninger" : "/";
const withBase = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return basePath === '/' ? normalizedPath : `${basePath}${normalizedPath}`;
};

const rewriteInternalRootLinks = (base) => () => {
  const normalizedBase = base === "/" ? "" : base.replace(/\/$/, "");

  return (tree) => {
    const walk = (node) => {
      if (!node || typeof node !== "object") return;

      if (node.type === "element" && node.tagName === "a") {
        const href = node.properties?.href;
        if (
          typeof href === "string" &&
          href.startsWith("/") &&
          !href.startsWith("//") &&
          !href.startsWith(`${normalizedBase}/`) &&
          normalizedBase
        ) {
          node.properties.href = `${normalizedBase}${href}`;
        }
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) walk(child);
      }
    };

    walk(tree);
  };
};


// https://astro.build/config
export default defineConfig({
  site: "https://gc2vidi.github.io",
  base: basePath,
  markdown: {
    rehypePlugins: [rewriteInternalRootLinks(basePath)],
  },
  integrations: [
    starlight({
      title: "GC2/Vidi",
      // Define language
      locales: {
        root: {
          label: "Dansk",
          lang: "da",
        },      },
      favicon: 'favicon.ico',
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'apple-touch-icon',
            sizes: '180x180',
            href: withBase('apple-touch-icon.png'),
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            href: withBase('favicon-32x32.png'),
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            type: 'image/svg+xml',
            href: withBase('icon.svg'),
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'manifest',
            href: withBase('manifest.webmanifest'),
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
          ],
        },
        {
          label: "GC2",
          items: [
            {
              label: "Hvad er GC2?",
              link: "/gc2",
            },
            {
              label: "Kom i gang",
              collapsed: false,
              autogenerate: {
                directory: "gc2/kom-i-gang",
              },
            },
            {
              label: "Konfiguration",
              collapsed: false,
              autogenerate: {
                directory: "gc2/koerselskonfiguration",
              },
            },
            {
              label: "Lag og metadata",
              collapsed: false,
              autogenerate: {
                directory: "gc2/lag",
              },
            },
            {
              label: "Redigering",
              collapsed: false,
              autogenerate: {
                directory: "gc2/redigering",
              },
            },
            {
              label: "Brugere og rettigheder",
              collapsed: false,
              autogenerate: {
                directory: "gc2/brugere",
              },
            },
            {
              label: "Integrationer",
              collapsed: true,
              autogenerate: {
                directory: "gc2/integrationer",
              },
            },
            {
              label: "Avanceret",
              collapsed: true,
              autogenerate: {
                directory: "gc2/avanceret",
              },
            },
          ],
        },
        {
          label: "Bidrag til dokumentationen",
          link: "/bidrag",
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
