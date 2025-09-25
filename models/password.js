import bcryptjs from "bcryptjs";
import crypto from "node:crypto";

const pepper = process.env.PASSWORD_HASH_PEPPER || "";

async function hash(password) {
  const rounds = getNumberOfRounds();
  const preHashedPassword = preparePasswordHash(password);

  return bcryptjs.hash(preHashedPassword, rounds);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(providedPassword, storedPassword) {
  const passwordWithPepper = preparePasswordHash(providedPassword);
  return bcryptjs.compare(passwordWithPepper, storedPassword);
}

function preparePasswordHash(password) {
  const passwordWithPepper = password + pepper;
  return crypto.createHash("sha256").update(passwordWithPepper).digest("hex");
}

const password = {
  hash,
  compare,
};

export default password;
