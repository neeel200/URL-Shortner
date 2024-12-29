import jwt from "jsonwebtoken";
import tryCatch from "../utils/tryCatch.js";
import axios from "axios"
import User from "../models/user.js";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; // '/auth/google/callback'

// get '/auth/google'
const googleAuth = tryCatch(async (req, res, next) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;

  res.redirect(url);

});


const redirectUrlCallbackHandler = tryCatch(async(req, res, next) => {
  const { code } = req.query;
  
  const { data } = await axios.post('https://oauth2.googleapis.com/token', {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const { id_token, access_token } = data;

  // Fetch user profile
  const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  console.log("data2", response.data )

  const user = await User.create({
    name: response.data.name,
    email: response.data.email
  })

  const jwtToken = jwt.sign({id: user._id}, process.env.JWT_SECRET,{expiresIn:"1d"})

  res.cookie('auth_token', jwtToken, {
    httpOnly: false, 
    secure: false, 
    maxAge: 3600000, 
  });
console.log(res.cookie)
  res.redirect('/');
  // res.send("Authenticated successfully!")

})


const logOutHandler = tryCatch(async(req, res, next) => {

  res.clearCookie('auth_token');
  res.status(200).json({message: "logged out successfully !"})
})

export  { googleAuth, redirectUrlCallbackHandler, logOutHandler };
