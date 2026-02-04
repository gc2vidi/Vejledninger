import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to convert heading text to URL-friendly slug
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[æøå]/g, (match) => {
      const map = { 'æ': 'ae', 'ø': 'oe', 'å': 'aa' };
      return map[match] || match;
    })
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Function to extract frontmatter and content from MDX file
function parseMDXFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Split frontmatter and content
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, content: content };
  }
  
  const frontmatterText = match[1];
  const bodyContent = match[2];
  
  // Parse frontmatter (simple YAML-like parsing)
  const frontmatter = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  });
  
  return { frontmatter, content: bodyContent };
}

// Function to extract headings from MDX content
function extractHeadings(content) {
  const headings = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const slug = createSlug(text);
    
    headings.push({
      level,
      text,
      slug
    });
  }
  
  return headings;
}

// Function to convert file path to URL path
function getUrlPath(filePath, contentDir) {
  const relativePath = path.relative(contentDir, filePath);
  const urlPath = relativePath
    .replace(/\\/g, '/') // Convert Windows paths to URL paths
    .replace(/\/index\.mdx$/, '') // Remove /index.mdx
    .replace(/\.mdx$/, ''); // Remove .mdx extension
  
  return urlPath ? `/${urlPath}` : '/';
}

// Main function to build heading map
function buildHeadingMap() {
  const contentDir = path.join(__dirname, '../src/content/docs');
  const headingMap = {};
  
  // Function to recursively find all MDX files
  function findMDXFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        files.push(...findMDXFiles(itemPath));
      } else if (item.endsWith('.mdx')) {
        files.push(itemPath);
      }
    }
    
    return files;
  }
  
  const mdxFiles = findMDXFiles(contentDir);
  
  for (const filePath of mdxFiles) {

    
    try {
      const { content } = parseMDXFile(filePath);
      const headings = extractHeadings(content);
      const urlPath = getUrlPath(filePath, contentDir);
      
      // Add headings to the map with page prefix to avoid conflicts
      const pageSlug = urlPath === '/' ? 'index' : urlPath.replace(/^\//, '').replace(/\//g, '-');
      
      // Track slug usage within this page to handle duplicates
      const pageSlugCounts = {};
      
      for (const heading of headings) {
        let uniqueSlug = heading.slug;
        
        // Handle duplicate slugs on the same page by adding a counter
        if (pageSlugCounts[heading.slug]) {
          pageSlugCounts[heading.slug]++;
          uniqueSlug = `${heading.slug}-${pageSlugCounts[heading.slug]}`;
        } else {
          pageSlugCounts[heading.slug] = 1;
        }
        
        const fullUrl = urlPath === '/' ? `/#${uniqueSlug}` : `${urlPath}#${uniqueSlug}`;
        const uniqueKey = `${pageSlug}-${uniqueSlug}`;
        headingMap[uniqueKey] = {
          url: fullUrl,
          text: heading.text
        };
        
        console.log(`  Found heading: "${heading.text}" -> ${uniqueKey} = ${fullUrl}`);
      }
      
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }
  
  return headingMap;
}

// Function to update the globalHeadingMap.ts file
function updateHeadingMapFile(headingMap) {
  const mapFilePath = path.join(__dirname, '../src/data/globalHeadingMap.ts');
  
  // Generate the TypeScript content
  const mapEntries = Object.entries(headingMap)
    .map(([slug, data]) => `  "${slug}": { url: "${data.url}", text: "${data.text.replace(/"/g, '\\"')}" }`)
    .join(',\n');
  
  const content = `export const headingMap = {
${mapEntries}
} as const;

// Type for all available heading keys
export type HeadingKey = keyof typeof headingMap;

// Helper function with IntelliSense support for URLs
export function getHeadingUrl(key: HeadingKey): string {
  return headingMap[key].url;
}

// Helper function with IntelliSense support for text
export function getHeadingText(key: HeadingKey): string {
  return headingMap[key].text;
}

// Helper function to get both URL and text
export function getHeading(key: HeadingKey): { url: string; text: string } {
  return headingMap[key];
}
`;
  
  fs.writeFileSync(mapFilePath, content, 'utf-8');
  console.log(`\nUpdated ${mapFilePath} with ${Object.keys(headingMap).length} headings`);
}

// Function to extract Ref component IDs from MDX content
function extractRefIds(content) {
  const refIds = [];
  // Match <Ref id="..." /> and <Ref id="..."> patterns
  const refRegex = /<Ref\s+id=["']([^"']+)["'][^>]*\/?>/g;
  let match;
  
  while ((match = refRegex.exec(content)) !== null) {
    refIds.push(match[1]);
  }
  
  return refIds;
}

// Function to validate all Ref links
function validateRefLinks(contentDir, headingMap) {
  console.log('\nValidating Ref links...\n');
  
  let totalRefs = 0;
  let deadLinks = 0;
  const deadLinkDetails = [];
  
  // Function to recursively find all MDX files
  function findMDXFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        files.push(...findMDXFiles(itemPath));
      } else if (item.endsWith('.mdx')) {
        files.push(itemPath);
      }
    }
    
    return files;
  }
  
  const mdxFiles = findMDXFiles(contentDir);
  
  for (const filePath of mdxFiles) {
    try {
      const { content } = parseMDXFile(filePath);
      const refIds = extractRefIds(content);
      
      if (refIds.length > 0) {
        // console.log(`Checking ${refIds.length} Ref(s) in: ${path.relative(contentDir, filePath)}`);
        
        for (const refId of refIds) {
          totalRefs++;
          
          if (!headingMap[refId]) {
            deadLinks++;
            deadLinkDetails.push({
              file: path.relative(contentDir, filePath),
              refId: refId
            });
            // console.log(`  ❌ Dead link: "${refId}"`);
          } else {
            // console.log(`  ✅ Valid link: "${refId}" -> ${headingMap[refId].url}`);
          }
        }
      }
      
    } catch (error) {
      console.error(`Error validating ${filePath}:`, error.message);
    }
  }
  
  if (deadLinks > 0) {
    console.log(`\n💀 Dead Links Details:`);
    for (const deadLink of deadLinkDetails) {
      console.log(`  File: ${deadLink.file}`);
      console.log(`  Missing ID: "${deadLink.refId}"`);
      console.log('');
    }
    
    console.log(`Available heading IDs:`);
    const availableIds = Object.keys(headingMap).sort();
    availableIds.forEach(id => {
      console.log(`  - ${id}`);
    });
  }
  
  return { totalRefs, deadLinks, deadLinkDetails };
}

// Run the script
console.log('Building heading map from MDX files...\n');

const headingMap = buildHeadingMap();
updateHeadingMapFile(headingMap);

console.log('\nHeading map build complete!');

// Validate Ref links
const contentDir = path.join(__dirname, '../src/content/docs');
const validation = validateRefLinks(contentDir, headingMap);

if (validation.deadLinks > 0) {
  console.log(`\n❌ Error: Found ${validation.deadLinks} dead link(s). Build failed.`);
  process.exit(1);
} else {
  console.log('\n✅ All Ref links are valid!');
}