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
  points: number;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  isEmailVerified: boolean;
  roles: UserRoles[];
  phone?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
