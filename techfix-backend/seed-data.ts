import mongoose from "mongoose";
import { env } from "./src/config/env";
import User from "./src/auth/models/user.model";
import Category from "./src/categories/models/category.model";
import RepairService, { IRepairServiceDocument } from "./src/repairs/models/repairService.model";
import Booking from "./src/bookings/models/booking.model";
import RepairStatusLog from "./src/bookings/models/repairStatusLog.model";
import Product from "./src/products/models/product.model";
import Review from "./src/reviews/models/review.model";
import {
  UserRole,
  UserRoleType,
  CategoryType,
  ServiceOption,
  BookingType,
  BookingPaymentMethod,
  BookingStatus,
  RepairStage,
  ProductCondition,
  AuthenticityLabel,
} from "./src/config/constants";

/**
 * Seeds (or clears) demo data for the full two-sided marketplace flow:
 *  - 5 SELLER accounts, each owning one Samsung Galaxy S23 screen-repair
 *    listing (so "browse different sellers, compare, book" is testable)
 *  - 1 CUSTOMER account with 3 sample bookings in different repair stages,
 *    each with real RepairStatusLog history (so "My Repairs" and the
 *    seller's "incoming bookings" queue both have something to show)
 *  - 1 ADMIN account
 *
 * Every seeded account uses the same password so you can log in as any
 * of them locally: Seed@12345
 *
 * Usage: ts-node seed-data.ts -i   (import)
 *        ts-node seed-data.ts -d   (delete)
 */

const SELLERS = [
  { name: "ScreenSavvy Co.", email: "screensavvy@seed.techfix.dev", phone: "+977-9800000001" },
  { name: "QuickFix Lab Center", email: "quickfixlab@seed.techfix.dev", phone: "+977-9800000002" },
  { name: "iMaster Repairs", email: "imaster@seed.techfix.dev", phone: "+977-9800000003" },
  { name: "TechHub Pro", email: "techhubpro@seed.techfix.dev", phone: "+977-9800000004" },
  { name: "QuickFix Hub", email: "quickfixhub@seed.techfix.dev", phone: "+977-9800000005" },
];

const CUSTOMER = { name: "Demo Customer", email: "customer@seed.techfix.dev", phone: "+977-9800000099" };
const ADMIN = { name: "Demo Admin", email: "admin@seed.techfix.dev", phone: "+977-9800000098" };

const SEED_EMAILS = [...SELLERS.map((s) => s.email), CUSTOMER.email, ADMIN.email];

const PICKUP_DELIVERY_FEE = 12;
const SERVICE_FEE = 5;

function generateReferenceId(): string {
  const digits = Math.floor(10000 + Math.random() * 90000);
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `TF-${digits}-${letter}`;
}

async function findOrCreateUser(data: {
  name: string;
  email: string;
  phone: string;
  role: UserRoleType;
  isVerifiedSeller?: boolean;
}) {
  // findOneAndUpdate bypasses the User model's pre("save") hash hook, which
  // is how an earlier version of this script ended up with plaintext
  // passwords. Load-or-build + .save() instead so bcrypt hashing runs.
  let user = await User.findOne({ email: data.email });
  if (!user) {
    user = new User({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: "Seed@12345",
      role: data.role,
      isVerified: true,
      isVerifiedSeller: data.isVerifiedSeller ?? false,
    });
    await user.save();
  } else {
    // Self-healing: re-running the seed script against a database seeded
    // before a schema/role change (e.g. the repair_provider -> seller
    // migration) must not silently leave stale field values in place.
    user.name = data.name;
    user.phone = data.phone;
    user.role = data.role;
    user.isVerified = true;
    user.isVerifiedSeller = data.isVerifiedSeller ?? false;
    await user.save();
  }
  return user;
}

async function importData() {
  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected. Seeding...");

  const category = await Category.findOneAndUpdate(
    { name: "Screen Repair" },
    {
      name: "Screen Repair",
      slug: "screen-repair",
      type: CategoryType.REPAIR,
      description: "Cracked or unresponsive screen replacement services",
    },
    { upsert: true, returnDocument: "after" }
  );

  const sellerDocs = [];
  for (const s of SELLERS) {
    sellerDocs.push(await findOrCreateUser({ ...s, role: UserRole.SELLER, isVerifiedSeller: true }));
  }
  const [screenSavvy, quickFixLab, iMaster, techHub, quickFixHub] = sellerDocs;

  const customer = await findOrCreateUser({ ...CUSTOMER, role: UserRole.CUSTOMER });
  await findOrCreateUser({ ...ADMIN, role: UserRole.ADMIN });

  await RepairService.deleteMany({ title: { $regex: /Samsung Galaxy S23 Screen Repair/ } });

  const listingsData = [
    {
      provider: screenSavvy._id,
      title: "Samsung Galaxy S23 Screen Repair",
      deviceType: "Samsung Galaxy S23",
      description:
        "TechFix Certified Partner specializing in Samsung OLED screen replacements with same-day turnaround.",
      priceRange: { min: 95, max: 95 },
      repairOptions: [
        { name: "Screen Replacement", description: "OEM-quality display, calibrated touch & color", price: 95, estimatedTime: "3 hrs" },
      ],
      warranty: "120 days",
      readyBy: "Today 3 PM",
      images: [],
      location: {
        address: "Thamel, Kathmandu",
        city: "Kathmandu",
        coordinates: { type: "Point" as const, coordinates: [85.3096, 27.7154] },
      },
      averageRating: 4.9,
      totalReviews: 312,
      serviceOptions: [ServiceOption.PICKUP, ServiceOption.DROPOFF],
      isVerified: true,
    },
    {
      provider: quickFixLab._id,
      title: "Samsung Galaxy S23 Screen Repair",
      deviceType: "Samsung Galaxy S23",
      description:
        "Certified hardware technicians specializing in iPhone and Samsung logic board repairs. 24-hour turnaround on most standard services.",
      priceRange: { min: 59, max: 129 },
      repairOptions: [
        { name: "Screen Replacement", description: "OEM-quality display, calibrated touch & color", price: 89, estimatedTime: "Ready in 2 hrs" },
        { name: "Battery Replacement", description: "Genuine battery, full diagnostics included", price: 59, estimatedTime: "Ready in 1 hr" },
        { name: "Full Diagnostic + Repair", description: "Comprehensive check, logic board service", price: 129, estimatedTime: "Ready in 24 hrs" },
      ],
      warranty: "90 days",
      readyBy: "Today 5 PM",
      images: [],
      location: {
        address: "New Road, Kathmandu",
        city: "Kathmandu",
        coordinates: { type: "Point" as const, coordinates: [85.3103, 27.7043] },
      },
      averageRating: 4.8,
      totalReviews: 218,
      serviceOptions: [ServiceOption.PICKUP, ServiceOption.DROPOFF],
      isVerified: true,
    },
    {
      provider: iMaster._id,
      title: "Samsung Galaxy S23 Screen Repair",
      deviceType: "Samsung Galaxy S23",
      description: "Independent verified repair shop offering budget-friendly screen and battery services.",
      priceRange: { min: 65, max: 65 },
      repairOptions: [
        { name: "Screen Replacement", description: "Aftermarket display, tested touch response", price: 65, estimatedTime: "24 hrs" },
      ],
      warranty: "60 days",
      readyBy: "Tomorrow 11 AM",
      images: [],
      location: {
        address: "Baluwatar, Kathmandu",
        city: "Kathmandu",
        coordinates: { type: "Point" as const, coordinates: [85.3266, 27.7304] },
      },
      averageRating: 4.6,
      totalReviews: 147,
      serviceOptions: [ServiceOption.DROPOFF],
      isVerified: true,
    },
    {
      provider: techHub._id,
      title: "Samsung Galaxy S23 Screen Repair",
      deviceType: "Samsung Galaxy S23",
      description: "General electronics repair shop with same-week screen replacement service.",
      priceRange: { min: 79, max: 79 },
      repairOptions: [
        { name: "Screen Replacement", description: "Standard display replacement", price: 79, estimatedTime: "Tomorrow 2 PM" },
      ],
      warranty: "30 days",
      readyBy: "Tomorrow 2 PM",
      images: [],
      location: {
        address: "Lazimpat, Kathmandu",
        city: "Kathmandu",
        coordinates: { type: "Point" as const, coordinates: [85.3230, 27.7172] },
      },
      averageRating: 4.5,
      totalReviews: 89,
      serviceOptions: [ServiceOption.PICKUP, ServiceOption.DROPOFF],
      isVerified: false,
    },
    {
      provider: quickFixHub._id,
      title: "Samsung Galaxy S23 Screen Repair",
      deviceType: "Samsung Galaxy S23",
      description: "Certified third-party repair hub offering competitive pricing on Samsung screen repairs.",
      priceRange: { min: 89, max: 89 },
      repairOptions: [
        { name: "Screen Replacement", description: "OEM-quality display", price: 89, estimatedTime: "2 hrs" },
      ],
      warranty: "90 days",
      readyBy: "Today",
      images: [],
      location: {
        address: "Patan, Lalitpur",
        city: "Lalitpur",
        coordinates: { type: "Point" as const, coordinates: [85.3247, 27.6766] },
      },
      averageRating: 4.7,
      totalReviews: 164,
      serviceOptions: [ServiceOption.PICKUP],
      isVerified: true,
    },
  ];

  const listings: IRepairServiceDocument[] = [];
  for (const listing of listingsData) {
    listings.push(await RepairService.create({ ...listing, category: category._id }));
  }
  const [screenSavvyListing, quickFixLabListing, iMasterListing] = listings;

  // ─── Sample bookings for the demo customer, each at a different stage ──
  await Booking.deleteMany({ user: customer._id });
  await RepairStatusLog.deleteMany({});

  async function seedBooking(opts: {
    listing: (typeof listings)[number];
    optionName: string;
    price: number;
    bookingType: (typeof BookingType)[keyof typeof BookingType];
    history: (typeof RepairStage)[keyof typeof RepairStage][];
    updatedBy: mongoose.Types.ObjectId;
  }) {
    const pickupDeliveryFee = opts.bookingType === BookingType.PICKUP ? PICKUP_DELIVERY_FEE : 0;
    const total = opts.price + pickupDeliveryFee + SERVICE_FEE;
    const currentStage = opts.history[opts.history.length - 1];
    const status = currentStage === RepairStage.DELIVERED ? BookingStatus.COMPLETED : BookingStatus.IN_PROGRESS;

    const estimatedPickupDate = new Date();
    estimatedPickupDate.setDate(estimatedPickupDate.getDate() + 2);
    estimatedPickupDate.setHours(10, 0, 0, 0);

    const booking = await Booking.create({
      referenceId: generateReferenceId(),
      user: customer._id,
      repairService: opts.listing._id,
      repairOptionName: opts.optionName,
      bookingType: opts.bookingType,
      pickupAddress: opts.bookingType === BookingType.PICKUP ? "Baneshwor, Kathmandu" : undefined,
      contactName: customer.name,
      contactPhone: customer.phone,
      contactEmail: customer.email,
      issueDescription: "Screen cracked after a drop, touch response is patchy near the edges.",
      issuePhotos: [],
      paymentMethod: BookingPaymentMethod.PAY_AT_PICKUP,
      subtotal: opts.price,
      pickupDeliveryFee,
      serviceFee: SERVICE_FEE,
      total,
      status,
      currentStage,
      estimatedPickupDate,
    });

    for (const stage of opts.history) {
      await RepairStatusLog.create({
        booking: booking._id,
        stage,
        updatedBy: opts.updatedBy,
      });
    }

    return booking;
  }

  await seedBooking({
    listing: screenSavvyListing,
    optionName: "Screen Replacement",
    price: 95,
    bookingType: BookingType.PICKUP,
    // Parked mid-journey on a waiting state, so the timeline demo shows an
    // in-progress repair that isn't simply "being worked on right now".
    history: [
      RepairStage.RECEIVED,
      RepairStage.DIAGNOSING,
      RepairStage.AWAITING_PARTS,
    ],
    updatedBy: screenSavvy._id,
  });

  await seedBooking({
    listing: quickFixLabListing,
    optionName: "Battery Replacement",
    price: 59,
    bookingType: BookingType.DROPOFF,
    // Walks every stage, so the completed timeline renders full-length.
    history: [
      RepairStage.RECEIVED,
      RepairStage.DIAGNOSING,
      RepairStage.AWAITING_PARTS,
      RepairStage.REPAIRING,
      RepairStage.QUALITY_CHECK,
      RepairStage.READY_FOR_PICKUP,
      RepairStage.DELIVERED,
    ],
    updatedBy: quickFixLab._id,
  });

  await seedBooking({
    listing: iMasterListing,
    optionName: "Screen Replacement",
    price: 65,
    bookingType: BookingType.DROPOFF,
    history: [RepairStage.RECEIVED],
    updatedBy: iMaster._id,
  });

  // ─── Products (spare parts + certified devices) ───────────────────
  const partsCategory = await Category.findOneAndUpdate(
    { name: "Spare Parts" },
    {
      name: "Spare Parts",
      slug: "spare-parts",
      type: CategoryType.PRODUCT,
      description: "Genuine and third-party replacement components",
    },
    { upsert: true, returnDocument: "after" }
  );

  await Product.deleteMany({ seller: { $in: sellerDocs.map((s) => s._id) } });

  const products = await Product.insertMany([
    {
      seller: screenSavvy._id,
      category: partsCategory._id,
      title: "iPhone 14 Pro OLED Screen",
      brand: "Apple",
      modelName: "iPhone 14 Pro",
      description:
        "Genuine Apple OLED display assembly with True Tone support. Pulled from certified refurbished stock and fully tested.",
      price: 189,
      originalPrice: 229,
      condition: ProductCondition.REFURBISHED,
      authenticityLabel: AuthenticityLabel.GENUINE,
      authenticityChecks: [
        { label: "Serial number verified", passed: true },
        { label: "True Tone functional", passed: true },
        { label: "Original Apple packaging", passed: false },
      ],
      certificateId: "TF-CERT-88213",
      warranty: "6 months",
      stock: 8,
      specs: [
        { label: "Panel", value: "OLED Super Retina XDR" },
        { label: "Resolution", value: "2556 x 1179" },
        { label: "Touch", value: "Calibrated" },
      ],
      compatibility: ["iPhone 14 Pro"],
      city: "Kathmandu",
      isVerified: true,
    },
    {
      seller: quickFixLab._id,
      category: partsCategory._id,
      title: "Samsung S22 Display Unit",
      brand: "Samsung",
      modelName: "Galaxy S22",
      description:
        "Dynamic AMOLED 2X replacement unit with frame. Brand new, sealed, sourced through an authorised distributor.",
      price: 145,
      condition: ProductCondition.NEW,
      authenticityLabel: AuthenticityLabel.GENUINE,
      authenticityChecks: [
        { label: "Distributor invoice on file", passed: true },
        { label: "Factory seal intact", passed: true },
      ],
      certificateId: "TF-CERT-41902",
      warranty: "12 months",
      stock: 3,
      specs: [
        { label: "Panel", value: "Dynamic AMOLED 2X" },
        { label: "Refresh rate", value: "120 Hz" },
        { label: "Includes", value: "Frame + adhesive" },
      ],
      compatibility: ["Galaxy S22", "Galaxy S22 5G"],
      city: "Lalitpur",
      isVerified: true,
    },
    {
      seller: iMaster._id,
      category: partsCategory._id,
      title: "Battery – iPhone 13 Series",
      brand: "Apple",
      modelName: "iPhone 13",
      description:
        "High-capacity third-party replacement battery. Cycle-tested to 500 charges with over 90% retained capacity.",
      price: 39,
      originalPrice: 55,
      condition: ProductCondition.NEW,
      authenticityLabel: AuthenticityLabel.THIRD_PARTY,
      authenticityChecks: [
        { label: "Capacity independently tested", passed: true },
        { label: "Apple-original cell", passed: false },
      ],
      warranty: "3 months",
      stock: 24,
      specs: [
        { label: "Capacity", value: "3240 mAh" },
        { label: "Cycles", value: "500+" },
      ],
      compatibility: ["iPhone 13", "iPhone 13 Pro"],
      city: "Kathmandu",
    },
    {
      seller: techHub._id,
      category: partsCategory._id,
      title: "USB-C Port Module",
      brand: "Generic",
      description:
        "Replacement USB-C charging port flex assembly for a range of Android handsets. Sold untested and as-is.",
      price: 14,
      condition: ProductCondition.USED,
      authenticityLabel: AuthenticityLabel.THIRD_PARTY,
      authenticityChecks: [{ label: "Visual inspection only", passed: true }],
      stock: 0,
      specs: [{ label: "Connector", value: "USB-C 2.0" }],
      compatibility: ["Various Android"],
      city: "Bhaktapur",
    },
    {
      seller: quickFixHub._id,
      category: partsCategory._id,
      title: "64-Bit Pro Repair Toolkit",
      brand: "iFixit",
      description:
        "64-piece precision driver kit covering virtually every fastener used in modern phones, tablets and laptops.",
      price: 72,
      condition: ProductCondition.NEW,
      authenticityLabel: AuthenticityLabel.GENUINE,
      authenticityChecks: [{ label: "Authorised reseller", passed: true }],
      warranty: "Lifetime on drivers",
      stock: 11,
      specs: [
        { label: "Pieces", value: "64" },
        { label: "Case", value: "Hard shell" },
      ],
      compatibility: ["Universal"],
      city: "Kathmandu",
      isVerified: true,
    },
  ]);

  console.log(
    `Seeded ${SELLERS.length} sellers, 1 customer, 1 admin, ${listings.length} listings, 3 bookings, ${products.length} products.`
  );
  console.log(`All seeded accounts use the password: Seed@12345`);
  await mongoose.disconnect();
  process.exit(0);
}

async function destroyData() {
  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected. Removing seed data...");

  const users = await User.find({ email: { $in: SEED_EMAILS } }).select("_id");
  const userIds = users.map((u) => u._id);

  const bookings = await Booking.find({ user: { $in: userIds } }).select("_id");
  const bookingIds = bookings.map((b) => b._id);

  await RepairStatusLog.deleteMany({ booking: { $in: bookingIds } });
  await Booking.deleteMany({ _id: { $in: bookingIds } });
  await RepairService.deleteMany({ provider: { $in: userIds } });
  await Review.deleteMany({ user: { $in: userIds } });
  await Product.deleteMany({ seller: { $in: userIds } });
  await User.deleteMany({ email: { $in: SEED_EMAILS } });
  await Category.deleteOne({ slug: "screen-repair" });
  await Category.deleteOne({ slug: "spare-parts" });

  console.log("Seed data removed.");
  await mongoose.disconnect();
  process.exit(0);
}

if (process.argv.includes("-i")) {
  importData().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else if (process.argv.includes("-d")) {
  destroyData().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  console.log("Pass -i to import seed data or -d to delete it.");
  process.exit(0);
}
