import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const UserSchema = new Schema({
  email: String,
  password: String,
});

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(mongooseAggregatePaginate);

const User = model("User", UserSchema);

export default User;
