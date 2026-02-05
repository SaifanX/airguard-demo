import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logFlight = mutation({
  args: {
    timestamp: v.number(),
    droneModel: v.string(),
    riskScore: v.number(),
    status: v.string(),
    coordinateCount: v.number(),
  },
  handler: async (ctx, args) => {
    // Backend validation logic could go here
    if (args.riskScore > 50 && args.status === "APPROVED") {
       // Force rejection if client side logic was bypassed
       // args.status = "REJECTED";
    }
    const flightId = await ctx.db.insert("flights", args);
    return flightId;
  },
});

export const getRecentFlights = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("flights")
      .withIndex("by_timestamp")
      .order("desc")
      .take(5);
  },
});
