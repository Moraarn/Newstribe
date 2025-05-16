export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  DELETED = "deleted",
}

export enum UserRoles {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  USER = "user",
  CUSTOMER = "customer",
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  points: number;
  preferences?: {
    categories: string[];
    preferredFormats: string[];
    readingLevel: string;
    notificationPreferences: string[];
    dailyDigest: boolean;
    weeklyDigest: boolean;
    language: string;
    timezone: string;
  };
}
