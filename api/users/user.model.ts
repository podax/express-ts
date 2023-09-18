import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const StripeSchema = new Schema({
  customerId: String,
  subscriptionId: String,
  defaultPaymentMethodId: String,
  planName: String,
  latestInvoiceId: String,
  subscriptionStatus: String,
  priceId: String,
  productId: String,
})

const UserSchema = new Schema(
  {
    profilePhoto: String,
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    phone: String,
    smsCountryCode: String,
    countryCode: String,
    newsletterOptIn: Boolean,
    dob: Date,
    notify: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    isStaff: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    googleId: String,
    googleToken: String,
    location: {
      countryCode: {
        type: String,
      },
      countryName: {
        type: String,
      },
      city: {
        type: String,
      },
      postal: {
        type: String,
      },
      latitude: {
        type: String,
      },
      longtitude: {
        type: String,
      },
      IPv4: {
        type: String,
      },
      state: {
        type: String,
      },
    },
    opted_in: {
      type: Boolean,
      default: false,
    },
    stripe: {
      type: StripeSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

UserSchema.pre("find", function () {
  this.where({ isDeleted: false })
})

UserSchema.plugin(mongoosePaginate);

const User = model('User', UserSchema);

export default User;
