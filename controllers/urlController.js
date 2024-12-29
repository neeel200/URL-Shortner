import requestIp from "request-ip";
import Click from "../models/clicks.js";
import URL from "../models/url.js";
import customError from "../utils/customError.js";
import tryCatch from "../utils/tryCatch.js";
import { nanoid } from "nanoid";
import User from "../models/user.js";


const getShortenUrl = tryCatch(async (req, res, next) => {
  const { topic, customAlias, longUrl } = req.body;

  const userId = req.user.id;
  const shortId = customAlias || nanoid(10);

  // each topic can have its unique customAlias and if same topic and longUrl found then just change the alias
  const existingUrl = await URL.findOne({ topic, longUrl });

  if (existingUrl) {
    if (existingUrl.alias !== shortId) {
      existingUrl.alias = shortId;
      await existingUrl.save();
    }
    return res.status(200).json({
      shortUrl: `http://localhost:${process.env.PORT}/api/shorten/${shortId}`,
      createdAt: new Date().toLocaleString(),
    });
  }

  // else create a new url
  
  const url = await URL.create({
    shortUrl: shortId,
    longUrl,
    topic: topic || null,
    alias: customAlias,
    userId,
  });

  if (!url) {
    return next(new customError("url not created!", 500));
  }

  const user = await User.findById(userId);
  user.urls.push(url.id);
  await user.save();

  return res.status(201).json({
    shortUrl: `http://localhost:${process.env.PORT}/api/shorten/${shortId}`,
    createdAt: new Date().toLocaleString(),
  });
});

const redirectToTheOriginalUrl = tryCatch(async (req, res, next) => {
  const { alias } = req.params;

  const existingUrl = await URL.findOne({ shortUrl: alias });
  if (!existingUrl) {
    return next(new customError("This alias doesn't exist!", 400));
  }

  let clickDocument = await Click.findOne({ urlId: existingUrl.id });
  if (!clickDocument) {
    clickDocument = new Click({ urlId: existingUrl.id, uniqueIps: [] });
  }

  clickDocument.totalClicks++;

  // get the IP address
  const userIp = requestIp.getClientIp(req);

  // get the user (remote)details
  const userAgent = req.headers["user-agent"];
  const os = getOSFromUserAgent(userAgent);
  const deviceType = getDeviceTypeFromUserAgent(userAgent);

  // Check for unique IP with OS and Device
  const existingIpEntry = clickDocument.uniqueIps.find(
    (entry) =>
      entry.ip === userIp && entry.os === os && entry.device === deviceType
  );

  // if there is not an existing ip entry it means that we have a unique ip either in itself or in os or in device terms
  if (!existingIpEntry) {
    clickDocument.uniqueIps.push({ ip: userIp, os, device: deviceType });

    // Increment uniqueUsers for OS
    const osDetail = clickDocument.osDetails.find(
      (detail) => detail.osName === os
    );
    if (osDetail) {
      osDetail.uniqueUsers++;
    } else {
      clickDocument.osDetails.push({
        osName: os,
        uniqueClicks: 0,
        uniqueUsers: 1,
      });
    }

    // Increment uniqueUsers for Device
    const deviceDetail = clickDocument.deviceDetails.find(
      (detail) => detail.deviceType === deviceType
    );
    if (deviceDetail) {
      deviceDetail.uniqueUsers++;
    } else {
      clickDocument.deviceDetails.push({
        deviceType,
        uniqueClicks: 0,
        uniqueUsers: 1,
      });
    }
  }

  // Increment uniqueClicks for OS
  const osDetail = clickDocument.osDetails.find(
    (detail) => detail.osName === os
  );
  if (osDetail) {
    osDetail.uniqueClicks++;
  }

  // Increment uniqueClicks for Device
  const deviceDetail = clickDocument.deviceDetails.find(
    (detail) => detail.deviceType === deviceType
  );
  if (deviceDetail) {
    deviceDetail.uniqueClicks++;
  }

  // Increment clicks by date
  const currentDate = new Date();
  const formattedDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const dateEntry = clickDocument.clicksByDate.find(
    (entry) => entry.date.getTime() === formattedDate.getTime()
  );
  if (dateEntry) {
    dateEntry.clicks++;

    
  } else {
    clickDocument.clicksByDate.push({
      date: formattedDate,
      cliks: 1,
    });
  }

  const click = await clickDocument.save();

  existingUrl.clickId = click.id;
  await existingUrl.save();

  res.redirect(existingUrl.longUrl);
});

function getOSFromUserAgent(userAgent) {
  if (userAgent.search(/windows/i)) return "Windows";
  if (userAgent.search(/mac/i)) return "MacOS";
  if (userAgent.search(/linux/i)) return "Linux";
  return "Other";
}

function getDeviceTypeFromUserAgent(userAgent) {
  if (userAgent.search(/mobile/i)) return "Mobile";
  if (userAgent.search(/tablet/i)) return "Tablet";
  return "Desktop";
}

export { redirectToTheOriginalUrl, getShortenUrl };
