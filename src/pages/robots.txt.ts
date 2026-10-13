import type { APIRoute } from 'astro';
export const GET:APIRoute = ({site}) => new Response(`User-agent: *\n${site?.hostname==='ocean-remodeling.example'?'Disallow: /':'Allow: /'}\nSitemap: ${new URL(`${import.meta.env.BASE_URL.replace(/^\//,'')}sitemap-index.xml`,site)}\n`,{headers:{'Content-Type':'text/plain'}});
