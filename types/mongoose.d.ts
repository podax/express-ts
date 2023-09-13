// mongoose.d.ts or another name of your choice
import mongoose from 'mongoose';

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
    populate?: object[] | string[] | object | string;
    lean?: boolean;
    leanWithId?: boolean;
    offset?: number;
    page?: number;
    limit?: number;
  }

  interface Model<T extends Document, QueryHelpers = {}> extends mongoose.Model<T, QueryHelpers> {
    paginate(
      query?: any,
      options?: PaginateOptions,
      callback?: (err: any, result: PaginateResult<T>) => void
    ): Promise<PaginateResult<T>>;
  }
}
