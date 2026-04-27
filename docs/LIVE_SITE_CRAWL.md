# Live Site Crawl

Source domain: https://eltronic.co.uk

Date crawled: 2026-04-26

## Public Pages Reviewed

- https://eltronic.co.uk/
- https://eltronic.co.uk/products
- https://eltronic.co.uk/autopi
- https://eltronic.co.uk/eltronic-i-o-iq-can-bus-module
- https://eltronic.co.uk/topcon-opus-b6e
- https://eltronic.co.uk/topcon-opus-b4e
- https://eltronic.co.uk/topcon-opus-b3e
- https://eltronic.co.uk/topcon-opus-a8s
- https://eltronic.co.uk/topcon-opus-a8e
- https://eltronic.co.uk/topcon-a6s
- https://eltronic.co.uk/topcon-new
- https://eltronic.co.uk/opus-a3e
- https://eltronic.co.uk/opus-test-a3s
- https://eltronic.co.uk/product-data-sheets-certificates
- https://eltronic.co.uk/tutorials-videos
- https://eltronic.co.uk/get-in-touch

## Product Content Ported

- AutoPi CAN-FD Pro
- I&Q CAN-Bus I/O Module
- TOPCON OPUS B6e
- TOPCON OPUS B4e
- TOPCON OPUS B3e
- TOPCON OPUS A8s
- TOPCON OPUS A8e
- TOPCON OPUS A6s
- TOPCON OPUS A6e
- TOPCON OPUS A3e
- TOPCON OPUS A3s

## Content Notes

- The current site is WordPress with Colibri/Colibri Pro and WooCommerce assets loaded.
- The visible site acts as a product showcase and enquiry site, not a checkout-led shop.
- The product catalogue contains TOPCON OPUS HMIs, AutoPi CAN-FD Pro and an Eltronic I&Q CAN-Bus module.
- The I&Q CAN-Bus I/O Module page is marked as under construction and includes placeholder technical/order data.
- The contact form asks for name, company, email, message and an optional product selection.
- Public contact details shown include `+44(0) 79 3523 9421`, `sales@eltronic.co.uk` and footer references to `info@eltronic.co.uk`.
- Data-sheet and certificate pages exist, but some data-sheet labels appear duplicated or unfinished on the live site.

## Migration Shape

- Structured product data now lives in `src/content/products.ts`.
- Product pages in the new app are generated from that data through `/products/[slug]`.
- Old WordPress URLs are preserved in each product as `sourceUrl` for traceability.
- Product image URLs currently point to public WordPress uploads; these can later be downloaded into the Next.js repo if desired.
