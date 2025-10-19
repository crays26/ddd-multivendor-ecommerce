export const RoleList = {
    CUSTOMER: process.env.ROLE_CUSTOMER_ID!,
    VENDOR: process.env.ROLE_VENDOR_ID!,
    ADMIN: process.env.ROLE_ADMIN_ID!,
} as const;

export type RoleKey = keyof typeof RoleList; // "CUSTOMER" | "VENDOR" | "ADMIN"
export type RoleId = typeof RoleList[RoleKey]; // string (UUID)
