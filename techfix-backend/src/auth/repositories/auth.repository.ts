import User, { IUserDocument } from "../models/user.model";
import { IAddress } from "../types/user.type";

/**
 * Auth Repository
 * The only layer that talks to MongoDB. All Mongoose queries live here.
 * Returns plain data objects to the service.
 */
export class AuthRepository {
  /**
   * Find a user by email. Optionally include hidden fields (+password, +refreshToken).
   */
  async findByEmail(
    email: string,
    includeSecrets = false
  ): Promise<IUserDocument | null> {
    const query = User.findOne({ email });
    if (includeSecrets) {
      query.select("+password +refreshToken");
    }
    return query.exec();
  }

  /**
   * Find a user by phone number.
   */
  async findByPhone(phone: string): Promise<IUserDocument | null> {
    return User.findOne({ phone }).exec();
  }

  /**
   * Find a user by ID. Optionally include hidden fields.
   */
  async findById(
    id: string,
    includeSecrets = false
  ): Promise<IUserDocument | null> {
    const query = User.findById(id);
    if (includeSecrets) {
      query.select("+password +refreshToken");
    }
    return query.exec();
  }

  /**
   * Create a new user document.
   */
  async create(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
  }): Promise<IUserDocument> {
    const user = new User(data);
    return user.save();
  }

  /**
   * Update user fields by ID.
   */
  async updateById(
    id: string,
    data: Partial<IUserDocument>
  ): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    }).exec();
  }

  /**
   * Store the refresh token on the user document.
   */
  async saveRefreshToken(
    id: string,
    refreshToken: string
  ): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      id,
      { refreshToken },
      { returnDocument: "after" }
    ).exec();
  }

  /**
   * Clear the refresh token (logout).
   */
  async clearRefreshToken(id: string): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      id,
      { $unset: { refreshToken: 1 } },
      { returnDocument: "after" }
    ).exec();
  }

  /**
   * Add an address to the user's addresses array.
   */
  async addAddress(
    userId: string,
    address: IAddress
  ): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      { $push: { addresses: address } },
      { returnDocument: "after", runValidators: true }
    ).exec();
  }

  /**
   * Remove an address by its index.
   */
  async removeAddress(
    userId: string,
    addressIndex: number
  ): Promise<IUserDocument | null> {
    const user = await User.findById(userId);
    if (!user) return null;

    user.addresses.splice(addressIndex, 1);
    return user.save();
  }

  /**
   * Check if email already exists (for registration).
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email });
    return count > 0;
  }

  /**
   * Check if phone already exists (for registration).
   */
  async phoneExists(phone: string): Promise<boolean> {
    const count = await User.countDocuments({ phone });
    return count > 0;
  }
}
