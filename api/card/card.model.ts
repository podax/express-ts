import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import moment from 'moment';

const StripeSchema = new Schema({
  subscriptionId: String,
  subscriptionStatus: String,
  paymentIntent: String,
  paymentStatus: String,
});

const CardSchema = new Schema(
  {
    title: String,
    recipientName: String,
    description: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    shortId: String,
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    isDeleted: { type: Boolean, default: false },
    template: { type: Schema.Types.ObjectId, ref: 'Template' },
    cardPdfUrl: { type: String },
    assets: [
      {
        url: String,
      },
    ],
    variables: [
      {
        type: { type: String, enum: ['text', 'image', 'QR'] },
        label: String,
        elementId: String,
        value: String,
        width: Number,
        height: Number,
        x: Number,
        y: Number,
      },
    ],
    coverUrl: String,
    stripe: {
      type: StripeSchema,
      default: () => ({}),
    },
    expiryAt: { type: Date, default: moment().add(21, 'days') },
    usage: {
      invites: { type: Number, default: 0 },
    },
    limits: {
      invites: { type: Number, default: 5 },
    },
    message: String,
    qrImage: String,
    scan: {
      count: { type: Number, default: 0 },
      limit: { type: Number, default: 10 },
      locations: [
        {
          countryCode: String,
          countryName: String,
          IPv4: String,
          userAgent: String,
        },
      ],
      unique: { type: Number },
    },
    members: [{ type: Schema.Types.ObjectId, ref: 'CardMember' }],
    entries: [{ type: Schema.Types.ObjectId, ref: 'Entry' }],
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  },
  { timestamps: true },
);

CardSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

CardSchema.plugin(mongoosePaginate);

const Card = model("Card", CardSchema);

export default Card;