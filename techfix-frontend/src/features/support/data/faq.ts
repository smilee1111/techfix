export interface FaqEntry {
  question: string;
  answer: string;
  topic: FaqTopic;
}

export type FaqTopic = "Repairs" | "Orders" | "Payments" | "Account";

export const FAQ_TOPICS: FaqTopic[] = ["Repairs", "Orders", "Payments", "Account"];

/**
 * Static FAQ content. There is no backend resource behind the support pages
 * by design — the answers are documentation, not data, and shipping them as
 * a typed constant keeps them versioned with the code they describe.
 */
export const FAQ_ENTRIES: FaqEntry[] = [
  {
    topic: "Repairs",
    question: "How do I track a repair I've booked?",
    answer:
      "Open My Repairs from the main navigation and select the booking. You'll see the full stage-by-stage timeline — received, diagnosing, awaiting parts, repairing, quality check, ready for pickup and delivered — with a timestamp and technician note for every step that has happened.",
  },
  {
    topic: "Repairs",
    question: "What does the price estimate include?",
    answer:
      "The estimate gives a price range based on your device, the reported issue and your city, drawn from real listings by providers who repair that device. It's indicative — the exact price is fixed when you choose a specific repair option at booking.",
  },
  {
    topic: "Repairs",
    question: "Can I choose between pickup and drop-off?",
    answer:
      "Yes, wherever the provider offers it. Pickup adds a delivery fee shown in the price breakdown before you confirm; drop-off has no additional fee.",
  },
  {
    topic: "Repairs",
    question: "What does the Verified badge on a provider mean?",
    answer:
      "Verified badges are granted by TechFix administrators, never self-assigned by the provider. A badge means we have reviewed that provider or listing directly.",
  },
  {
    topic: "Orders",
    question: "How long does delivery take?",
    answer:
      "Orders show an estimated delivery date at checkout, typically four days from the order date. You can follow the order through placed, confirmed, processing, shipped and delivered on the order tracking page.",
  },
  {
    topic: "Orders",
    question: "How do I know a part is genuine?",
    answer:
      "Every product page has an Authenticity Verification panel listing each check the seller has submitted, including any that did not pass. Products also carry a condition label (new, refurbished or used) and a provenance label (genuine, refurbished or third-party) — these are separate: a part can be genuine but used, or third-party but new.",
  },
  {
    topic: "Orders",
    question: "Can I compare sellers before buying?",
    answer:
      "Yes. Tick Compare on up to three products in the listing, then open the comparison to see price, condition, authenticity checks, rating, warranty and stock side by side, with the strongest overall option highlighted.",
  },
  {
    topic: "Orders",
    question: "What if an item goes out of stock while it's in my cart?",
    answer:
      "Stock is checked and reserved when you place the order, not when you add to cart. If something sells out in between, checkout will tell you which item is affected and your cart is left intact so you can adjust it.",
  },
  {
    topic: "Payments",
    question: "Which payment methods are supported?",
    answer:
      "Checkout records eSewa, Khalti, cash on delivery and bank transfer. Note that no payment is actually processed in this release — your selection is stored with the order as your intended method.",
  },
  {
    topic: "Payments",
    question: "When is shipping free?",
    answer:
      "Shipping is free on orders of $100 or more. Below that, a flat $8 fee applies, shown in the order summary before you confirm.",
  },
  {
    topic: "Account",
    question: "How do I become a seller?",
    answer:
      "Choose the seller role when you sign up. You can then list repair services and products from your seller dashboard. The verified badge is applied separately by an administrator after review.",
  },
  {
    topic: "Account",
    question: "I've forgotten my password.",
    answer:
      "Use the Forgot password link on the login page. We'll email a reset link to the address on your account. For security, the response is the same whether or not an account exists for that address.",
  },
];
