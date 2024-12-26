# Advance Url Shortner

// will also update this later as the project tends to progress.

### 1. Architecture & Considerations

Backend Framework: Node.js with Express.js.

Authentication: Google OAuth 2.0 for user login via Google Sign-In. 

Database: MongoDB .

Caching: Redis . 

Containerization: Docker . 

Deployment: Cloud hosting service (maybe AWS) . 

Rate Limiting: maybe express-rate-limit package or something.

### 2. API Endpoints Required
 - User Authentication

    POST /api/auth/google \
    Google OAuth login endpoint.


 - Short URL Creation

    POST /api/shorten \
    Create a short URL with optional custom alias and topic.


 - Redirection
   
    GET /api/shorten/:alias \
    Redirects to the original long URL.

- Analytics 

    GET /api/analytics/:alias \
    Fetch analytics for a specific short URL.

    GET /api/analytics/topic/:topic \
    Retrieve topic-based analytics.
 
    GET /api/analytics/overall \
    Retrieve overall analytics for all user-created URLs.


### 3. Edge Cases
- Short URL Creation: 
- Rate limit exceeded for a user.
- Redirection

### 4. Dependencies

express \
mongoose \
dotenv

