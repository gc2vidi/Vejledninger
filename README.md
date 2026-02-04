[![Deploy](https://github.com/gc2vidi/Vejledninger/actions/workflows/deploy.yml/badge.svg)](https://github.com/gc2vidi/Vejledninger/actions/workflows/deploy.yml)

# GC2/Vidi - Vejledninger

Ved hver push til main, vil dokumentationen blive bygget og deployet til github pages.

Siden er tilgængelig her: [Vejledninger](https://gc2vidi.github.io/Vejledninger/)

## Udvikling

For at installere og køre projektet lokalt, skal du have node.js installeret.

```
npm install
```

Herefter kan du starte en lokal udviklingsserver med:

```
npm run dev
```

For at tjekke om projektet kan buygges korrekt, kan du køre:

```
npm run check
```

## Ref-komponenten

Projektet bruger en specialudviklet `Ref` komponent til at lave krydshenvisninger mellem sider i vejledningerne. Dette sikrer, at alle links er valide og opdateres automatisk, hvis overskrifter ændres.

### Sådan fungerer det

1. **Automatisk ID generering**: Alle overskrifter (h1-h6) i MDX filer får automatisk genereret et unikt ID baseret på overskriftens tekst og filens placering
2. **Global heading map**: Et build script (`scripts/buildHeadingMap.js`) scanner alle MDX filer og opbygger et globalt kort over alle overskrifter
3. **Validering**: Ved build tjekkes alle `Ref` komponenter for at sikre, at de refererer til eksisterende overskrifter

### Brug af Ref komponenten

```mdx
// Basis usage - bruger overskriftens tekst som link tekst
<Ref id="vidi-hvad-er-vidi" />

// Med custom tekst
<Ref id="vidi-hvad-er-vidi" text="Se Vidi introduktion" />

// Inline i en sætning
Dette forklares nærmere i <Ref id="gc2-installation" />.
```

### ID format

ID'er genereres automatisk i formatet: `{område}-{overskrift-slug}`

Eksempler:
- `vidi-hvad-er-vidi` (fra overskrift "Hvad er Vidi" i vidi sektion)
- `gc2-installation` (fra overskrift "Installation" i gc2 sektion)

### Fejlhåndtering

- **Build fejl**: Hvis en `Ref` refererer til et ikke-eksisterende ID, vil build'et fejle med detaljeret fejlinformation
- **Runtime**: Ugylde ID'er vises som "Bad ID" i rød tekst under udvikling
- **CI/CD**: GitHub Actions vil stoppe deployment hvis der findes ugyldige referencer

### Tilgængelige heading ID'er

For at se alle tilgængelige ID'er, kør:

```
npm run build-headings
```

Dette viser også eventuelle fejl og en liste over alle gyldige ID'er.

## MenuPath-komponenten

Vis menustier som blå bokse med pile imellem – samme idé som Sphinx’ `:menuselection:`.  
Eksempel: **Vis → Paneler → Browser**.

### Brug (MDX)

**Array-syntaks (anbefalet)**
```mdx
<MenuPath items={['Indstillinger', 'Avanceret', 'Netværk']} />
```
**Ét punkt (ingen pil)**
```mdx
<MenuPath items="Browser" />
```

## Key-komponenten

Vis tastaturgenveje som stilede knapper med `+` imellem – samme idé som Sphinx’ `:kbd:`.
Eksempel: **Ctrl** + **Shift** + **G**.

### Brug (MDX)

**Array-syntaks (anbefalet)**
```mdx
<Key items={['Ctrl', 'Shift', 'G']} />
```
**Ét punkt (ingen pil)**
```mdx
<Key items="Enter" />
```
