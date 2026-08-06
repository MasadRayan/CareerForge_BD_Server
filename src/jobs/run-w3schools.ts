import { refreshW3SchoolsCatalog } from "./w3schools.job.js";

const count = await refreshW3SchoolsCatalog();

if (count === null) {
  console.log("W3Schools refresh skipped: W3SCHOOLS_ENABLED is 'false'.");
  process.exit(0);
}

console.log(`W3Schools catalog refresh complete: ${count} links now in DB.`);

process.exit(0);