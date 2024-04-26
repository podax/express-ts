
// mongoose.d.ts or another name of your choice
import mongoose, { Document, Model } from 'mongoose';

declare module 'mongoose' {
  interface PaginateResult<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    page?: number;
    totalPages: number;
    nextPage?: number | null;
    prevPage?: number | null;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    meta?: any;
  }

  interface PaginateOptions {
    select?: object | string;
    sort?: object | string;
    customLabels?: object;
    collation?: object;
    projection?: object | string;
    populate?: object[] | string[] | object | string;
    lean?: boolean;
    leanWithId?: boolean;
    offset?: number;
    page?: number;
    limit?: number;
    autopopulate?: boolean;
    pagination?: boolean;
  }

  interface PaginateModel<T extends Document> extends Model<T> {
    paginate(query?: object, options?: PaginateOptions, callback?: (err: any, result: PaginateResult<T>) => void): Promise<PaginateResult<T>>;
  }

  interface IUser extends Document {
    email: string;
    password: string;
  }

  // Extend the PaginateModel interface to include standard Mongoose model methods
  interface UserModel<T extends Document> extends PaginateModel<T> {
    findOne(query: any): DocumentQuery<T | null, T>;
    create(doc: any): Promise<T>;
  }

  // Declare the User model explicitly with the extended interface
  const User: UserModel<IUser>;
  export default User;
}
