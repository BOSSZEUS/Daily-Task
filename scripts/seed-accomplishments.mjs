import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://sfvhhhhkxmthlkwkdolm.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdmhoaGhreG10aGxrd2tkb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkxNzc0NCwiZXhwIjoyMDg2NDkzNzQ0fQ.HPUOPDCqcLfGHltLD94BIOEeD8Hf9kqn4MKyUW_DkI0";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── IDs from database ──
const USER_ID = "642e2d77-b07c-48f6-a9ed-a42af15f82a1";

const CATEGORIES = {
  "Bugs Fixed": "1d69221c-2c08-4d8b-a320-4fadbc60d461",
  "Projects Shipped": "fa21da47-41f7-47b0-9526-f612a19fcbf4",
  "Process Improvements": "cc2bf5be-95d1-4d3b-8097-e366efd79d5f",
  "Skills Learned": "124aa4c0-6d8e-4ded-9cbc-7f193822ffac",
  "Other Wins": "474473e3-74f2-457f-ad1c-6dec4bae0774",
};

const ENTRY_DATE = "2026-02-12";

// ── Entries mapped to categories ──
const entries = [
  // ═══════════════════════════════════════
  // BUGS FIXED (9 items)
  // ═══════════════════════════════════════
  {
    category: "Bugs Fixed",
    content:
      "Add-to-Cart Hidden Input Sync — Resolved AJAX cart submission break for increment-5 products. Kept hidden input name=\"quantity\" and synced select value to it to prevent submission failures.",
  },
  {
    category: "Bugs Fixed",
    content:
      "Layout Overlap Fix — Fixed \"Yards\" variant dropdown overlapping quantity dropdown on increment-5 products. Set [data-increment] .form-field--qty-select to position: relative with min-height; hid text input for increment products.",
  },
  {
    category: "Bugs Fixed",
    content:
      "Cart Quantity Update Fix — Fixed cart quantity changes not triggering for increment-5 products. Resolved: change event only bound on data-quantity-input; _getItemQuantity only read from input; debounce checks failed for select-based changes.",
  },
  {
    category: "Bugs Fixed",
    content:
      "Cart Price Safety Guard — Added guard so a $0 WCP price cannot override the real price in the cart. Changed condition to check if wcp_v_price > 0 AND wcp_v_price < item.final_price.",
  },
  {
    category: "Bugs Fixed",
    content:
      "Duplicate YTA Widget Removal — Removed a duplicate You May Also Like widget block loading CSS and widget JS twice. Kept first instance, commented out the second.",
  },
  {
    category: "Bugs Fixed",
    content:
      "ZSK Sprint 8 Image Link Fix — Fixed homepage promotion_KMwcpn image link to point to the correct ZSK Racer Series 1 product page instead of the old Sprint 8 URL.",
  },
  {
    category: "Bugs Fixed",
    content:
      "B2B Session Persistence Fixes — Fixed B2B/wholesale customers being logged out on every visit, when clicking View Cart, and at checkout. Root cause: domain mismatch — hardcoded spsionline.myshopify.com references caused cross-domain redirects and session cookie loss for spsi.com. Replaced hardcoded domains with shop.permanent_domain or relative URLs; added Swym post-login redirect domain guard; replaced WPD polling with delegated click listener.",
  },
  {
    category: "Bugs Fixed",
    content:
      "Form Routing Correction — Found forms still routing to Steve's email and corrected routing to the proper inbox.",
  },
  {
    category: "Bugs Fixed",
    content:
      "Shopify Site Image & URL Cleanup — Cleaned up Shopify site images and fixed URL misdirects / incorrect redirects.",
  },

  // ═══════════════════════════════════════
  // PROJECTS SHIPPED (9 items)
  // ═══════════════════════════════════════
  {
    category: "Projects Shipped",
    content:
      "Increment-5 Quantity Feature (Product Page) — Products tagged increment-5 display a quantity dropdown in multiples of 5 (5, 10, 15 ... 50). Manual entry disabled. Conditional data-increment=\"5\" attribute; preserved default selector for non-increment products; added \"Sold in increments of 5\" message under stock badge.",
  },
  {
    category: "Projects Shipped",
    content:
      "Dynamic Price × Quantity Display — Added a live \"Total: $XX.XX\" line beneath the quantity dropdown for increment-5 products. Added [data-total-price] with data-unit-price-cents; watches quantity changes and updates on variant switch.",
  },
  {
    category: "Projects Shipped",
    content:
      "Cart Guardrails for Increment-5 — Enforced increment-5 rules in cart: dropdown only (5–50), no manual entry, JS validation to round to nearest 5. Hidden input synced; StaticCart validates increment before AJAX call.",
  },
  {
    category: "Projects Shipped",
    content:
      "Optimistic Cart Line Total Update — Line total updates immediately on quantity change (optimistic UI) before AJAX response, preventing stale price flash.",
  },
  {
    category: "Projects Shipped",
    content:
      "WCP Wholesale Pricing in Increment-5 Total — Total price display respects WCP (Wholesale Pricing Discount) for logged-in wholesale customers. If customer tags exist and wcp_v_price > 0, uses wholesale price; otherwise falls back to selected_variant.price.",
  },
  {
    category: "Projects Shipped",
    content:
      "B2B Quantity Price Breaks — Dynamic Strikethrough — For B2B catalog customers with Shopify native quantity price breaks, shows strikethrough original price when selected quantity meets a break tier. Serializes break tiers as JSON; JS watches quantity and variant switch; retail customers unaffected.",
  },
  {
    category: "Projects Shipped",
    content:
      "Mobile Header — 50th Anniversary Logo & Tagline Responsive Sizing — Fixed header small-promo logo and tagline sizing across breakpoints. Responsive CSS: desktop ≥1024px logo 40px; mobile ≤1023px logo 30px with nowrap tagline; extra-narrow ≤379px logo 24px.",
  },
  {
    category: "Projects Shipped",
    content:
      "VELOX DTF Website Content Update — Updated all content on the VELOX DTF website.",
  },
  {
    category: "Projects Shipped",
    content:
      "Mailchimp Integration — Integrated Mailchimp with Shopify, Judge.me, and PageFly to support marketing automation and synced customer flows.",
  },

  // ═══════════════════════════════════════
  // PROCESS IMPROVEMENTS (1 item)
  // ═══════════════════════════════════════
  {
    category: "Process Improvements",
    content:
      "PageFly Page Discoverability — Exposed PageFly pages that were published but unreachable by adding navigation/link paths so customers and search engines can reach them.",
  },

  // ═══════════════════════════════════════
  // OTHER WINS (1 item)
  // ═══════════════════════════════════════
  {
    category: "Other Wins",
    content:
      "Shopify Product Description Updates — Updated Shopify product descriptions for clarity and consistency.",
  },
];

// ── Insert ──
async function main() {
  const rows = entries.map((e) => ({
    user_id: USER_ID,
    category_id: CATEGORIES[e.category],
    content: e.content,
    entry_date: ENTRY_DATE,
  }));

  console.log(`Inserting ${rows.length} entries...`);

  const { data, error } = await supabase.from("entries").insert(rows).select();

  if (error) {
    console.error("INSERT FAILED:", error);
    process.exit(1);
  }

  // Summary
  const byCat = {};
  for (const row of data) {
    const catName =
      Object.entries(CATEGORIES).find(([, id]) => id === row.category_id)?.[0] ??
      "Unknown";
    byCat[catName] = (byCat[catName] || 0) + 1;
  }

  console.log(`\n✓ Successfully inserted ${data.length} entries:`);
  for (const [cat, count] of Object.entries(byCat)) {
    console.log(`  ${cat}: ${count}`);
  }
}

main();
