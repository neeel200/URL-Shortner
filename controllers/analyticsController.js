import tryCatch from "../utils/tryCatch.js";
import User from "../models/user.js";
import customError from "../utils/customError.js";

const getUrlAnalyticForAlias = tryCatch(async (req, res, next) => {
  const { alias } = req.params;
  const userId = req.user.id;

  // validate for the current alias for the user
  const userAliasExists = await URL.findOne({ alias, userId });
  if (!userAliasExists) {
    return next(new customError("Alias not found for this user", 404));
  }

  const analytics = await URL.aggregate([
    { $match: { alias } },

    //join
    {
      $lookup: {
        from: "clicks",
        localField: "_id",
        foreignField: "urlId",
        as: "clickData",
      },
    },

    { $unwind: "$clickData" },

    {
      $project: {
        alias: 1,
        longUrl: 1,
        "clickData.totalClicks": 1,
        "clickData.uniqueIps": 1,
        "clickData.osDetails": 1,
        "clickData.deviceDetails": 1,
        "clickData.clicksByDate": 1,
      },
    },
  ]);

  if (!analytics.length) {
    return next(
      new customError("Alias not found or no analytics available", 404)
    );
  }

  const response = {
    alias: analytics[0].alias,
    longUrl: analytics[0].longUrl,
    totalClicks: analytics[0].clickData.totalClicks,
    uniqueIps: analytics[0].clickData.uniqueIps,
    osDetails: analytics[0].clickData.osDetails,
    deviceDetails: analytics[0].clickData.deviceDetails,
    clicksByDate: analytics[0].clickData.clicksByDate,
  };

  res.status(200).json({
    success: true,
    data: response,
  });
});

const getUrlAnalyticForTopic = tryCatch(async (req, res, next) => {
  const { topic } = req.params;

  // get user's url under a given topic
  // joining from user to url to click collection

  const pipeline = [
    { $match: { _id: user._id } },
    { $unwind: "$urls" },
    {
      $lookup: {
        // join user to url
        from: "urls",
        localField: "urls",
        foreignField: "_id",
        as: "urls",
      },
    },
    { $unwind: "$urls" },
    { $match: { "urls.topic": topic } }, // for the given topic
    {
      $lookup: {
        from: "clicks", // join to clicks by clickId
        localField: "urls.clickId",
        foreignField: "_id",
        as: "clickData",
      },
    },
    { $unwind: "$clickData" },
    {
      $addFields: {
        urlDetails: {
          // modify urlDetails for all user's urls
          shortUrl: "$urls.shortUrl",
          totalClicks: "$clickData.totalClicks",
          uniqueUsers: { $size: "$clickData.uniqueIps" },
        },
      },
    },
    {
      $group: {
        _id: null,
        urls: { $push: "$urlDetails" }, // for getting click by dates
        overallClicksByDate: { $push: "$clickData.clicksByDate" },
        overalTotalClicks: { $sum: "$clickData.totalClicks" },
        overallUniqueUsers: {
          $sum: { $size: "$clickData.uniqueIps" },
        },
      },
    },
    {
      $facet: {
        otherData: [
          {
            $project: {
              urls: 1,
              overalTotalClicks: 1,
              overallUniqueUsers: 1,
            },
          },
        ],
        clicksByDateData: [
          { $unwind: "$overallClicksByDate" },

          {
            $group: {
              _id: "$overallClicksByDate.date",
              totalClicks: { $sum: "$overallClicksByDate.cliks" },
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              totalClicks: 1,
            },
          },
        ],
      },
    },
  ];

  const [otherData, clicksByDateData] = (await User.aggregate(pipeline))[0];

  return res.status(200).json({
    urls: otherData[0].urls,
    clicksByDate: clicksByDateData[0],
    uniqueUsers: otherData[0].overallUniqueUsers,
    totalClicks: otherData[0].overalTotalClicks,
  });
});

const getOverallUrlAnalytics = tryCatch(async (req, res, next) => {
  const userId = req.user._id;

  const pipeline = [
    { $match: { userId: userId } },

    {
      $lookup: {
        from: "urls",
        localField: "_id",
        foreignField: "urlId",
        as: "urlDetails",
      },
    },

    { $unwind: { path: "$urlDetails", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "clicks",
        localField: "urlDetails._id",
        foreignField: "urlId",
        as: "clicks",
      },
    },

    { $unwind: { path: "$clicks", preserveNullAndEmptyArrays: true } },

    // Group by user for overall analytics
    {
      $group: {
        _id: null,
        totalUrls: { $sum: 1 },
        totalClicks: { $sum: "$clicks.totalClicks" },
        uniqueUsers: {
          $sum: { $size: { $ifNull: ["$clicks.uniqueIps", []] } },
        },
        overallClicksByDate: { $push: "$clicks.clicksByDate" },
        osType: { $push: "$clicks.osDetails" },
        deviceType: { $push: "$clicks.deviceDetails" },
      },
    },

    // for different modules
    {
      $facet: {
        clickData: [
          {
            $project: {
              _id: 0,
              totalUrls: 1,
              totalClicks: 1,
              uniqueUsers: 1,
            },
          },
        ],
        clicksByDateData: [
          { $unwind: "$overallClicksByDate" },
          {
            $group: {
              _id: "$overallClicksByDate.date",
              totalClicks: { $sum: "$overallClicksByDate.clicks" },
            },
          },
          { $project: { _id: 0, date: "$_id", totalClicks: 1 } },
        ],
        osData: [
          { $unwind: "$osType" },
          {
            $group: {
              _id: "$osType.osName",
              totalUniqueClicks: { $sum: "$osType.uniqueClicks" },
              totalUniqueUsers: { $sum: "$osType.uniqueUsers" },
            },
          },
          {
            $project: {
              _id: 0,
              osName: "$_id",
              totalUniqueClicks: 1,
              totalUniqueUsers: 1,
            },
          },
        ],
        deviceData: [
          { $unwind: "$deviceType" },
          {
            $group: {
              _id: "$deviceType.deviceName",
              totalUniqueClicks: { $sum: "$deviceType.uniqueClicks" },
              totalUniqueUsers: { $sum: "$deviceType.uniqueUsers" },
            },
          },
          {
            $project: {
              _id: 0,
              deviceName: "$_id",
              totalUniqueClicks: 1,
              totalUniqueUsers: 1,
            },
          },
        ],
      },
    },
  ];

  const aggregatedData = await User.aggregate(pipeline);
  const { clickData, clicksByDateData, osData, deviceData } = aggregatedData[0];

  return res.status(200).json({
    totalUrls: clickData[0]?.totalUrls || 0,
    totalClicks: clickData[0]?.totalClicks || 0,
    uniqueUsers: clickData[0]?.uniqueUsers || 0,
    clicksByDate: clicksByDateData || [],
    osType: osData || [],
    deviceType: deviceData || [],
  });
});

export  {
  getOverallUrlAnalytics,
  getUrlAnalyticForAlias,
  getUrlAnalyticForTopic,
};