import bcrypt from 'bcryptjs';

/**
 * Utility to hash passwords for the initial setup.
 * Run this locally once to get the hash for your Firestore /internal/config/admin document.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
