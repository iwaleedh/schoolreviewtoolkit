import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function test() {
  try {
    const res = await client.query("schoolProfile:getBySchool", { schoolId: "SCH-001" });
    console.log("Success:", res);
  } catch (err) {
    console.error("Caught Convex Error:", err);
  }
}
test();
