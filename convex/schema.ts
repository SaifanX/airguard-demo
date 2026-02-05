import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  flights: defineTable({
    timestamp: v.number(),
    droneModel: v.string(),
    riskScore: v.number(),
    status: v.string(), // "APPROVED" | "REJECTED"
    coordinateCount: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
