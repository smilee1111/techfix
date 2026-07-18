import mongoose from "mongoose";
import { env } from "./src/config/env";
import User from "./src/auth/models/user.model";
import Category from "./src/categories/models/category.model";
import RepairService from "./src/repairs/models/repairService.model";
import { UserRole, CategoryType, ServiceOption } from "./src/config/constants";

/**
 * Seeds (or clears) demo data for repair-provider browsing:
 * a handful of repair-provider accounts, a repair category, and the
 * sample repair listings shown in the TechFix Figma designs
 * (Repair Search Results / Service Detail / Comparison View).
 *
 * Usage: ts-node seed-data.ts -i   (import)
 *        ts-node seed-data.ts -d   (delete)
 */

const PROVIDERS = [
  { name: "ScreenSavvy Co.", email: "screensavvy@seed.techfix.dev", phone: "+977-9800000001" },
  { name: "QuickFix Lab Center", email: "quickfixlab@seed.techfix.dev", phone: "+977-9800000002" },
  { name: "iMaster Repairs", email: "imaster@seed.techfix.dev", phone: "+977-9800000003" },
  { name: "TechHub Pro", email: "techhubpro@seed.techfix.dev", phone: "+977-9800000004" },
  { name: "QuickFix Hub", email: "quickfixhub@seed.techfix.dev", phone: "+977-9800000005" },
];

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

  const providerDocs = [];
  for (const p of PROVIDERS) {
    // findOneAndUpdate bypasses the User model's pre("save") hash hook,
    // which is how the seeded accounts ended up with plaintext passwords.
    // Load-or-build + .save() instead so bcrypt hashing actually runs.
    let user = await User.findOne({ email: p.email });
    if (!user) {
      user = new User({
        name: p.name,
        email: p.email,
        phone: p.phone,
        password: "Seed@12345",
        role: UserRole.REPAIR_PROVIDER,
        isVerified: true,
        isVerifiedSeller: true,
      });
      await user.save();
    }
    providerDocs.push(user);
  }
  const [screenSavvy, quickFixLab, iMaster, techHub, quickFixHub] = providerDocs;

  await RepairService.deleteMany({ title: { $regex: /Samsung Galaxy S23 Screen Repair/ } });

  const listings = [
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

  for (const listing of listings) {
    await RepairService.create({ ...listing, category: category._id });
  }

  console.log(`Seeded ${PROVIDERS.length} providers and ${listings.length} repair listings.`);
  await mongoose.disconnect();
  process.exit(0);
}

async function destroyData() {
  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected. Removing seed data...");

  const providerEmails = PROVIDERS.map((p) => p.email);
  const providers = await User.find({ email: { $in: providerEmails } }).select("_id");
  const providerIds = providers.map((p) => p._id);

  await RepairService.deleteMany({ provider: { $in: providerIds } });
  await User.deleteMany({ email: { $in: providerEmails } });
  await Category.deleteOne({ slug: "screen-repair" });

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
