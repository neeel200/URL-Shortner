import mongoose from 'mongoose';

const ClickSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "urls",
      required: true,
    },
    totalClicks: { type: Number, default: 0 },
    uniqueIps: [
      {
        ip: { type: String, required: true },
        os: { type: String },
        device: { type: String },
      },
    ],

    osDetails: [
      {
        osName: { type: String },
        uniqueClicks: { type: Number, default: 0 },
        uniqueUsers: { type: Number, default: 0 },
      },
    ],
    deviceDetails: [
      {
        deviceType: { type: String },
        uniqueClicks: { type: Number, default: 0 },
        uniqueUsers: { type: Number, default: 0 },
      },
    ],
    clicksByDate: [
      {
        date: { type: Date },
        cliks: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const Click = mongoose.model("clicks", ClickSchema);

export default Click;
