import { ObjectId, Collection, Document } from 'mongodb';
import { getDatabase } from './mongodb';

export interface ICartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface IUser {
  _id?: ObjectId;
  clerkId: string;
  name: string;
  email: string;
  image: string;
  cart?: Record<string, ICartItem>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProduct {
  _id?: ObjectId;
  name: string;
  description: string;
  mrp: number;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  storeId: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrder {
  _id?: ObjectId;
  total: number;
  status: 'ORDER_PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  userId: ObjectId;
  storeId: ObjectId;
  addressId: ObjectId;
  isPaid: boolean;
  paymentMethod: 'COD' | 'STRIPE';
  isCouponUsed: boolean;
  coupon?: Partial<ICoupon>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderItem {
  _id?: ObjectId;
  orderId: ObjectId;
  productId: ObjectId;
  quantity: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRating {
  _id?: ObjectId;
  rating: number;
  review: string;
  userId: ObjectId;
  productId: ObjectId;
  orderId: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAddress {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  createdAt?: Date;
}

export interface ICoupon {
  _id?: string;
  code: string;
  description: string;
  discount: number;
  forNewUser: boolean;
  forMember: boolean;
  isPublic: boolean;
  expiresAt: Date;
  createdAt?: Date;
}

export interface IStore {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  description: string;
  username: string;
  address: string;
  status: string;
  isActive: boolean;
  logo: string;
  email: string;
  contact: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class MongoDBModels {
  private async getCollection<T extends Document>(
    collectionName: string
  ): Promise<Collection<T>> {
    const db = await getDatabase();
    return db.collection<T>(collectionName);
  }

  // User methods
  async users() {
    return this.getCollection<IUser>('users');
  }

  async upsertUser(clerkId: string, data: Partial<IUser>) {
    const collection = await this.users();
    return collection.updateOne(
      { clerkId },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  async deleteUserByClerkId(clerkId: string) {
    const collection = await this.users();
    return collection.deleteMany({ clerkId });
  }

  // Product methods
  async products() {
    return this.getCollection<IProduct>('products');
  }

  async orders() {
    return this.getCollection<IOrder>('orders');
  }

  async orderItems() {
    return this.getCollection<IOrderItem>('orderItems');
  }

  async ratings() {
    return this.getCollection<IRating>('ratings');
  }

  async addresses() {
    return this.getCollection<IAddress>('addresses');
  }

  async coupons() {
    return this.getCollection<ICoupon>('coupons');
  }

  async stores() {
    return this.getCollection<IStore>('stores');
  }
}

export const db = new MongoDBModels();
