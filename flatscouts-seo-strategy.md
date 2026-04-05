# FlatScouts.com — SEO Strategy & Implementation Guide

## Brand Context

FlatScouts.com is a rental property aggregator connecting buyers (tenants) and sellers (landlords/PG operators). The platform lists PG chains, standalone flats, and vacant rooms in existing shared flats across Indian cities.

---

## 1. Essential Meta Tags (Every Page)

### Homepage

```html
<title>FlatScouts — Find PGs, Flats & Rooms for Rent Near You | flatscouts.com</title>
<meta name="description" content="FlatScouts connects you with verified PGs, rental flats, and vacant rooms in shared apartments. Compare prices, amenities, and locations across top PG chains and independent landlords. Zero brokerage.">
<meta name="keywords" content="PG near me, flats for rent, paying guest, shared rooms, flatmate, rental apartment, no brokerage, PG chains India">
<link rel="canonical" href="https://www.flatscouts.com/">

<!-- Open Graph -->
<meta property="og:title" content="FlatScouts — Find PGs, Flats & Rooms for Rent">
<meta property="og:description" content="India's rental aggregator. Compare PGs, flats and shared rooms across multiple chains and independent landlords.">
<meta property="og:image" content="https://www.flatscouts.com/og-image.jpg">
<meta property="og:url" content="https://www.flatscouts.com/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="FlatScouts">
<meta property="og:locale" content="en_IN">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="FlatScouts — Find PGs, Flats & Rooms for Rent">
<meta name="twitter:description" content="Compare PGs, flats and shared rooms. Zero brokerage rental search.">
<meta name="twitter:image" content="https://www.flatscouts.com/twitter-card.jpg">

<!-- Mobile & Technical -->
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="theme-color" content="#FF6B2B">
```

### City/Location Pages

```html
<title>PGs & Flats for Rent in Koramangala, Bangalore — FlatScouts</title>
<meta name="description" content="Browse 200+ verified PGs, rental flats, and shared rooms in Koramangala, Bangalore. Compare prices from ₹5,000/month. Near metro, restaurants & offices.">
<link rel="canonical" href="https://www.flatscouts.com/bangalore/koramangala/">
```

### Individual Listing Pages

```html
<title>2BHK Flat for Rent in HSR Layout — ₹18,000/mo | FlatScouts</title>
<meta name="description" content="Semi-furnished 2BHK flat in HSR Layout, Bangalore. 950 sq ft, 2 bathrooms, 24/7 water, gym & parking. Available from July 2026. No brokerage on FlatScouts.">
<link rel="canonical" href="https://www.flatscouts.com/bangalore/hsr-layout/2bhk-flat-12345/">
```

### PG Chain Pages

```html
<title>Zolo PG in Bangalore — All Locations, Prices & Reviews | FlatScouts</title>
<meta name="description" content="Compare all Zolo PG locations in Bangalore on FlatScouts. Prices, amenities, reviews, and availability in one place. Book directly, zero brokerage.">
```

---

## 2. Schema Markup (JSON-LD)

### Homepage — Organization + WebSite + SearchAction

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.flatscouts.com/#organization",
      "name": "FlatScouts",
      "url": "https://www.flatscouts.com",
      "logo": "https://www.flatscouts.com/logo.svg",
      "description": "India's rental property aggregator connecting tenants with PGs, flats and shared rooms",
      "sameAs": [
        "https://www.instagram.com/flatscouts",
        "https://www.twitter.com/flatscouts",
        "https://www.linkedin.com/company/flatscouts"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-XXXXXXXXXX",
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://www.flatscouts.com/#website",
      "name": "FlatScouts",
      "url": "https://www.flatscouts.com",
      "publisher": { "@id": "https://www.flatscouts.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.flatscouts.com/search?q={search_term}"
        },
        "query-input": "required name=search_term"
      }
    }
  ]
}
```

### Individual Listing — RealEstateListing + Accommodation

```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "name": "2BHK Semi-Furnished Flat in HSR Layout",
  "description": "Spacious 2BHK apartment with modern kitchen, 24/7 water supply, gym and parking.",
  "url": "https://www.flatscouts.com/bangalore/hsr-layout/2bhk-flat-12345/",
  "datePosted": "2026-03-15",
  "image": [
    "https://www.flatscouts.com/images/listings/12345/photo1.jpg",
    "https://www.flatscouts.com/images/listings/12345/photo2.jpg"
  ],
  "offers": {
    "@type": "Offer",
    "price": "18000",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "validFrom": "2026-07-01"
  },
  "about": {
    "@type": "Apartment",
    "name": "2BHK in HSR Layout",
    "numberOfRooms": 2,
    "numberOfBathroomsTotal": 2,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": 950,
      "unitCode": "FTK"
    },
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Gym", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Parking", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "24/7 Water", "value": true }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "HSR Layout, Sector 2",
      "addressLocality": "Bangalore",
      "addressRegion": "Karnataka",
      "postalCode": "560102",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 12.9116,
      "longitude": 77.6389
    }
  },
  "leaseLength": {
    "@type": "QuantitativeValue",
    "value": 11,
    "unitText": "months"
  }
}
```

### PG Listing — LodgingBusiness

```json
{
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "Zolo Stays — Koramangala Branch",
  "description": "Fully furnished co-living PG with meals, Wi-Fi, housekeeping included.",
  "url": "https://www.flatscouts.com/bangalore/koramangala/zolo-stays-12345/",
  "image": "https://www.flatscouts.com/images/pg/zolo-koramangala.jpg",
  "priceRange": "₹8,000 - ₹15,000",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "5th Block, Koramangala",
    "addressLocality": "Bangalore",
    "addressRegion": "Karnataka",
    "postalCode": "560095",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 12.9352,
    "longitude": 77.6245
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.2",
    "reviewCount": "87"
  },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Wi-Fi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Meals Included", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "AC Rooms", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Laundry", "value": true }
  ]
}
```

### FAQ Schema (for city/category pages)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does a PG cost in Koramangala, Bangalore?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PG prices in Koramangala range from ₹5,000 to ₹20,000 per month depending on room type (single/double/triple), amenities, and the PG chain. Budget PGs start around ₹5,000 while premium options like Stanza Living go up to ₹20,000."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between a PG and a shared flat?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A PG (Paying Guest) typically includes furnished rooms with meals, housekeeping, and utilities in the rent. A shared flat means you rent a room in an existing apartment where tenants split rent and utilities independently."
      }
    }
  ]
}
```

### BreadcrumbList (every page)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.flatscouts.com/" },
    { "@type": "ListItem", "position": 2, "name": "Bangalore", "item": "https://www.flatscouts.com/bangalore/" },
    { "@type": "ListItem", "position": 3, "name": "Koramangala", "item": "https://www.flatscouts.com/bangalore/koramangala/" },
    { "@type": "ListItem", "position": 4, "name": "2BHK Flat in HSR Layout" }
  ]
}
```

---

## 3. URL Structure (Programmatic SEO)

Clean, hierarchical URLs are critical for an aggregator. Structure them to target long-tail keywords automatically:

```
flatscouts.com/                                    → Homepage
flatscouts.com/bangalore/                          → City hub
flatscouts.com/bangalore/koramangala/              → Locality hub
flatscouts.com/bangalore/koramangala/pg/           → PGs in Koramangala
flatscouts.com/bangalore/koramangala/flats/        → Flats in Koramangala
flatscouts.com/bangalore/koramangala/rooms/        → Vacant rooms in Koramangala
flatscouts.com/bangalore/hsr-layout/2bhk-flat-123/ → Individual listing
flatscouts.com/pg-chains/zolo-stays/               → PG chain overview
flatscouts.com/pg-chains/zolo-stays/bangalore/     → Chain + city page
flatscouts.com/blog/                               → Blog hub
flatscouts.com/blog/pg-vs-flat-which-is-better/    → Blog post
```

---

## 4. Page Types to Build (Programmatic Pages)

### City Hub Pages
Auto-generate for every city: Bangalore, Mumbai, Delhi, Hyderabad, Pune, Chennai, Kolkata, Gurgaon, Noida, etc.

Content to include: listing count per category (PGs/flats/rooms), price range summary, top localities with links, popular PG chains in that city, neighborhood comparison table, nearby metro stations and offices.

Target keywords: "PG in Bangalore", "flats for rent in Mumbai", "rooms available in Pune"

### Locality/Neighborhood Pages
Auto-generate for every neighborhood within each city.

Content to include: micro-market pricing data, walkability scores, proximity to offices/colleges/metro, comparison of PG options in that area, tenant reviews summary, "best PGs in [locality]" section.

Target keywords: "PG in Koramangala", "2BHK flat rent HSR Layout", "shared rooms near Electronic City"

### PG Chain Comparison Pages
One page per PG chain listing all their locations, aggregate pricing, and user ratings.

Target keywords: "Zolo PG Bangalore", "Stanza Living vs Zolo", "best PG chains in India"

### Property Type Landing Pages
Dedicated pages for each property type in each locality.

Target keywords: "single room PG near me", "boys PG Bangalore", "girls PG with food near Manyata Tech Park"

---

## 5. Long-Tail Keyword Strategy

### High-Intent Transactional Keywords
- "PG near [office/college name]" — e.g., "PG near Manyata Tech Park"
- "[N]BHK flat for rent in [locality]" — e.g., "1BHK flat for rent in Indiranagar"
- "PG with food in [locality]"
- "shared room available in [locality]"
- "no brokerage flats [city]"
- "furnished PG for boys/girls in [area]"
- "PG under ₹[amount] in [city]"
- "flatmate required [locality]"
- "room available in 2BHK [area]"

### Informational Keywords (Blog Content)
- "PG vs flat — which is better for working professionals"
- "how to find a good PG in [city]"
- "average rent in [locality] 2026"
- "best areas to live in [city] for IT professionals"
- "things to check before renting a PG"
- "tenant rights in India"
- "how to find a flatmate in [city]"
- "cost of living in [city] — complete breakdown"
- "[locality] vs [locality] — where to live in [city]"
- "safety tips for PG residents"
- "PG agreement format — what to include"

### Voice Search / Conversational Queries
- "which PG has the best food in Koramangala"
- "how much does a PG cost near Whitefield"
- "is there a girls PG near Christ University"
- "find me a room in a shared flat in Andheri"

---

## 6. Technical SEO Checklist

### Core Web Vitals
- Largest Contentful Paint (LCP) < 2.5s — lazy-load listing images, use WebP/AVIF format, implement CDN
- First Input Delay (FID) < 100ms — defer non-critical JavaScript, especially map embeds
- Cumulative Layout Shift (CLS) < 0.1 — set explicit dimensions on all images and listing cards

### Crawlability
- XML sitemap split by entity type: sitemap-cities.xml, sitemap-listings.xml, sitemap-pgs.xml, sitemap-blog.xml (max 50K URLs per file)
- Include `<lastmod>` dates — update when listings change
- robots.txt: block /search?*, /filter?*, /api/, /admin/ — expose all listing and locality pages
- Self-referencing canonical on every page
- Use `noindex` on filtered/sorted views to prevent duplicate content
- Implement pagination with rel="next"/"prev" or infinite scroll with proper indexing

### Mobile-First
- Responsive listing cards with touch-friendly tap targets (min 48×48px)
- Sticky search/filter bar on mobile
- AMP pages for listing detail pages (optional but beneficial for speed)

### Internal Linking
- Every listing links to its locality page, city page, and PG chain page
- Locality pages link to neighboring locality pages ("Also explore: BTM Layout, Jayanagar")
- Blog posts link to relevant listing pages with keyword-rich anchor text
- Breadcrumb navigation on every page

### Indexing Strategy
- Index: all city hubs, locality pages, individual listings, PG chain pages, blog posts
- Noindex: search results with filters applied, user dashboards, login pages, duplicate sorted views
- Use hreflang if expanding to regional languages (Hindi, Kannada, Telugu, Tamil, Marathi)

---

## 7. Content Strategy

### Evergreen Locality Guides
Create 1,500–2,500 word guides for top 50 localities across your active cities. Include rent trends, local amenities, commute times, food options, safety rating, and embedded listings. Update quarterly with fresh data.

### Comparison Content
"[PG Chain A] vs [PG Chain B]" pages with pricing tables, amenity comparisons, user review summaries. These rank well for brand-comparison queries and capture users in the decision phase.

### Rent Index & Data Pages
Publish monthly rent indices per city and locality. This generates backlinks from journalists and bloggers covering real estate trends, and positions FlatScouts as an authority.

### Seasonal Content
- "Best PGs for freshers joining in July [year]"
- "Rental market trends — festival season impact"
- "Student housing guide — admission season [year]"

---

## 8. Local SEO

### Google Business Profile
- Create and verify a GBP for FlatScouts
- Primary category: "Real estate agency" or "Rental agency"
- Upload office photos, logo, and team images
- Post weekly updates: new listings, locality guides, rental market insights
- Respond to every Google review within 24 hours

### Local Citations
List FlatScouts on: Justdial, Sulekha, IndiaMART, Yelp India, Facebook Business, Apple Maps, Bing Places, and all major Indian business directories. Ensure NAP (Name, Address, Phone) consistency across every listing.

### Geo-Targeted Landing Pages
For every major office cluster and college campus, create a dedicated page: "PGs near Manyata Tech Park", "Rooms near IIT Bombay", "Flats near Hinjewadi IT Park". These capture extremely high-intent traffic.

---

## 9. Generative Engine Optimization (GEO / AEO)

With users increasingly searching via ChatGPT, Google AI Overviews, and Perplexity, optimize for AI citation:

- Structure content with clear, factual claims that AI can quote: "The average PG rent in Koramangala is ₹8,500/month as of Q1 2026"
- Publish original research and data that AI models can reference
- Use structured data (schema) so AI tools can parse your listings programmatically
- Create authoritative FAQ content that directly answers common rental questions
- Ensure your brand name appears naturally alongside factual claims about pricing, availability, and market data

---

## 10. Link Building Strategy

### Tactics Ranked by ROI
1. **Data-driven PR**: Publish rent index reports → pitch to local news outlets (Bangalore Mirror, TOI, Economic Times)
2. **College partnerships**: Get listed on college accommodation pages as a recommended resource
3. **PG chain co-marketing**: Cross-link with listed PG chain websites
4. **Guest posts**: Write for relocation, career, and student lifestyle blogs
5. **Resource pages**: Get listed on "moving to [city]" guides and relocation company resource pages
6. **Local business directories**: Ensure consistent listings across 20+ Indian directories

---

## 11. Analytics & Tracking Setup

### Google Search Console
- Submit all sitemaps
- Monitor: indexing coverage, Core Web Vitals, mobile usability, rich results status
- Track click-through rates per page type (city hub vs listing vs blog)

### Google Analytics 4
- Track events: listing_view, contact_owner, save_listing, share_listing, filter_applied, search_performed
- Set up conversion goals: contact form submission, phone number reveal, WhatsApp click
- Create segments: by city, by property type (PG/flat/room), by traffic source

### Key Metrics to Monitor
- Organic traffic per city and locality page
- Keyword rankings for top 100 target keywords
- Click-through rate from SERPs (aim > 5% for branded, > 3% for non-branded)
- Pages indexed vs submitted in sitemap
- Rich result impressions and clicks
- Bounce rate on listing pages (aim < 55%)
- Time on site (aim > 2 minutes)

---

## Quick Wins (Do These First)

1. Implement Organization + WebSite + SearchAction schema on homepage
2. Add RealEstateListing schema to every listing page
3. Set up BreadcrumbList schema sitewide
4. Create and optimize Google Business Profile
5. Generate city hub pages for your top 5 cities with unique content
6. Set proper canonical tags and noindex on filtered views
7. Submit XML sitemaps to Google Search Console
8. Optimize title tags and meta descriptions for all existing pages
9. Ensure mobile page speed < 3 seconds
10. Add FAQ schema to your top 10 locality pages
