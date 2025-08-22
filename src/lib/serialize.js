// src/lib/serialize.js
export function serializeForClient(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    // Convert Prisma Decimal to number
    if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'Decimal') {
      return Number(value);
    }
    // Convert Date to ISO string
    if (value instanceof Date) {
      return value.toISOString();
    }
    // Convert BigInt to string
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
}