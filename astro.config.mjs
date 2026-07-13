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
              label: "Log ind og dashboard",
              link: "/gc2/log-ind-og-dashboard",
            },
            {
              label: "Brugere og adgang",
              link: "/gc2/brugere-og-adgang",
            },
            {
              label: "Skemaindstillinger",
              collapsed: false,
              items: [
                { label: "Oversigt", link: "/gc2/skemaindstillinger" },
                {
                  label: "Database",
                  collapsed: false,
                  items: [
                    { label: "Oversigt", link: "/gc2/skemaindstillinger/database" },
                    { label: "Opret, importer og organiser lag", link: "/gc2/skemaindstillinger/database/opret-importer-og-organiser-lag" },
                    { label: "Lagoversigt og grundindstillinger", link: "/gc2/skemaindstillinger/database/lagoversigt-og-grundindstillinger" },
                    { label: "Tabelstruktur, data og felter", link: "/gc2/skemaindstillinger/database/tabelstruktur-data-og-felter" },
                    { label: "Privilegier og authentication", link: "/gc2/skemaindstillinger/database/privilegier-og-authentication" },
                    { label: "Editerbare lag", link: "/gc2/skemaindstillinger/database/editerbare-lag" },
                    { label: "Avancerede lagindstillinger", link: "/gc2/skemaindstillinger/database/avancerede-lagindstillinger" },
                    { label: "Tjenester og API", link: "/gc2/skemaindstillinger/database/tjenester-og-api" },
                    { label: "Tags", link: "/gc2/skemaindstillinger/database/tags" },
                    { label: "Meta", link: "/gc2/skemaindstillinger/database/meta" },
                  ],
                },
                {
                  label: "Kort",
                  collapsed: true,
                  items: [
                    { label: "Oversigt", link: "/gc2/skemaindstillinger/kort" },
                    { label: "Lagtræ og kortvisning", link: "/gc2/skemaindstillinger/kort/lagtrae-og-kortvisning" },
                    { label: "Klasser, symboler og labels", link: "/gc2/skemaindstillinger/kort/klasser-symboler-og-labels" },
                    { label: "Lagindstillinger", link: "/gc2/skemaindstillinger/kort/lagindstillinger" },
                    { label: "Tile cache", link: "/gc2/skemaindstillinger/kort/tile-cache" },
                    { label: "Signaturforklaring", link: "/gc2/skemaindstillinger/kort/signaturforklaring" },
                    { label: "QML og QGIS-styling", link: "/gc2/skemaindstillinger/kort/qml-og-qgis-styling" },
                    { label: "Redigering i kortet", link: "/gc2/skemaindstillinger/kort/redigering-i-kortet" },
                  ],
                },
                {
                  label: "Workflow",
                  collapsed: true,
                  items: [
                    { label: "Workflow", link: "/gc2/skemaindstillinger/workflow" },
                    { label: "Versionering, roller og opsætning", link: "/gc2/skemaindstillinger/workflow/versionering-roller-og-opsaetning" },
                    { label: "Transaktioner og godkendelse", link: "/gc2/skemaindstillinger/workflow/transaktioner-og-godkendelse" },
                  ],
                },
                {
                  label: "Scheduler",
                  collapsed: true,
                  items: [
                    { label: "Scheduler", link: "/gc2/skemaindstillinger/scheduler" },
                    { label: "Opret og administrer jobs", link: "/gc2/skemaindstillinger/scheduler/opret-og-administrer-jobs" },
                    { label: "Overvågning og fejlsøgning", link: "/gc2/skemaindstillinger/scheduler/overvaagning-og-fejlsoegning" },
                  ],
                },
              ],
            },
            {
              label: "Konfigurationer",
              collapsed: true,
              items: [
                { label: "Introduktion", link: "/gc2/konfigurationer" },
                { label: "Opret, udgiv og test", link: "/gc2/konfigurationer/opret-udgiv-og-test" },
                { label: "Data, lag og baggrundskort", link: "/gc2/konfigurationer/data-lag-og-baggrundskort" },
                { label: "Søgning, funktioner og udseende", link: "/gc2/konfigurationer/soegning-funktioner-og-udseende" },
                { label: "Alle indstillinger i en Vidi-konfiguration", link: "/gc2/konfigurationer/alle-indstillinger" },
              ],
            },
            {
              label: "QGIS og eksterne datakilder",
              link: "/gc2/qgis-og-eksterne-datakilder",
            },
            {
              label: "Admin-drift og fejlsøgning",
              link: "/gc2/admin-drift-og-fejlsoegning",
            },
          ],
        },
        {
          label: "Bidrag til dokumentationen",
          link: "/bidrag",
        },
      ],
      components: {
        Head: './src/components/Head.astro',
      },
    }),
    AutoImport({
      imports: [
        // Add global components:
        './src/components/Ref.astro',
         './src/components/MenuPath.astro',
         './src/components/Key.astro',
         './src/components/MediaPlaceholder.astro',
         './src/components/Figure.astro',
      ],
    }),
  ],
});
