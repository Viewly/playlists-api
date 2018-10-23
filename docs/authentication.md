# User Authentication API
# Register new user (email/password)
**URL** : `/api/user/register/`
**Method** : `POST`
## Request example
```json
{
    "email": "info@view.ly",
    "password": "StrongPassword123$%"
}
```
## Success Response
```json
{
    "success": true,
    "user": {
        "id": "66254caa-7266-4687-941d-bd55140d7925",
        "email": "denkomanceski+1234@gmail.com",
        "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MjU0Y2FhLTcyNjYtNDY4Ny05NDFkLWJkNTUxNDBkNzkyNSIsImVtYWlsIjoiZGVua29tYW5jZXNraSsxMjM0QGdtYWlsLmNvbSIsImlhdCI6MTU0MDMyOTQzMH0.pD9s05aNwAwug4-g8MEbyv4N0BatA34284vzHLvN9Hg"
    },
    "registered": true  
}
```


## Notes

* `jwt` is the auth token that needs to be sent in every request that requires authentication. Like: `headers["authorization"] = jwt`
* `registered`:`true` happens when the user registers for the first time (we can present a welcome/getting started page here)



# Register new user via Google (with Youtube permission)
**URL** : `/api/user/auth/`
**Method** : `GET`
## Success Response
```json
{
"url": "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&response_type=code&client_id=263514493763-3n665l3kov2qd1c3unbkqpsen684i687.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauthy"
}
```
## Notes

* `url` is the url that the user needs to be redirected. Than, youtube will redirect back to the supplied redirect_url (which is defined in .env variables on the API Server)


# Youtube Register/Login
**URL** : `/api/user/youtube-login/`
**Method** : `POST`
## Request example
```json
{
    "code": "YOUTUBE_CODE_HERE"
}
```
## Success Response
```json
{
    "success": true,
    "user": {
        "id": "66254caa-7266-4687-941d-bd55140d7925",
        "email": "denkomanceski+1234@gmail.com",
        "first_name": null,
        "last_name": null,
        "created_at": "2018-10-23T21:17:09.179Z",
        "avatar_url": null,
        "email_confirmed": false,
        "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MjU0Y2FhLTcyNjYtNDY4Ny05NDFkLWJkNTUxNDBkNzkyNSIsImVtYWlsIjoiZGVua29tYW5jZXNraSsxMjM0QGdtYWlsLmNvbSIsImZpcnN0X25hbWUiOm51bGwsImxhc3RfbmFtZSI6bnVsbCwiY3JlYXRlZF9hdCI6IjIwMTgtMTAtMjNUMjE6MTc6MDkuMTc5WiIsImF2YXRhcl91cmwiOm51bGwsImVtYWlsX2NvbmZpcm1lZCI6ZmFsc2UsImlhdCI6MTU0MDMyOTc4MH0.65NKuNVnY-vkHoMoLZ1aTbbIWJpRGgVWgTsmuGDq8k0"
    }
}
```
## Notes
* `code` the code is acquired from the redirect_url after redirecting back from `/api/user/auth`. Youtube calls that url with a query param that contains the code. This code needs to be sent to our server.
* Important: This request is used for both login and registering with youtube. If it is registered, the request will add `registered:true` to the response, so the FE will know that its a first time.


# Login
**URL** : `/api/user/login/`
**Method** : `POST`
## Request example
```json
{
    "email": "info@view.ly",
    "password": "StrongPassword123$%"
}
```
## Success Response
```json
{
    "success": true,
    "user": {
        "id": "66254caa-7266-4687-941d-bd55140d7925",
        "email": "denkomanceski+1234@gmail.com",
        "first_name": null,
        "last_name": null,
        "created_at": "2018-10-23T21:17:09.179Z",
        "avatar_url": null,
        "email_confirmed": false,
        "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MjU0Y2FhLTcyNjYtNDY4Ny05NDFkLWJkNTUxNDBkNzkyNSIsImVtYWlsIjoiZGVua29tYW5jZXNraSsxMjM0QGdtYWlsLmNvbSIsImZpcnN0X25hbWUiOm51bGwsImxhc3RfbmFtZSI6bnVsbCwiY3JlYXRlZF9hdCI6IjIwMTgtMTAtMjNUMjE6MTc6MDkuMTc5WiIsImF2YXRhcl91cmwiOm51bGwsImVtYWlsX2NvbmZpcm1lZCI6ZmFsc2UsImlhdCI6MTU0MDMyOTc4MH0.65NKuNVnY-vkHoMoLZ1aTbbIWJpRGgVWgTsmuGDq8k0"
    }
}
```
## Notes
* `jwt` usage mentioned above


# User Info
**URL** : `/api/user/info/`
**Method** : `GET`
## Success Response
```json
{
    
    "id": "66254caa-7266-4687-941d-bd55140d7925",
    "email": "denkomanceski+1234@gmail.com",
    "first_name": null,
    "last_name": null,
    "created_at": "2018-10-23T21:17:09.179Z",
    "avatar_url": null,
    "email_confirmed": false,
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MjU0Y2FhLTcyNjYtNDY4Ny05NDFkLWJkNTUxNDBkNzkyNSIsImVtYWlsIjoiZGVua29tYW5jZXNraSsxMjM0QGdtYWlsLmNvbSIsImZpcnN0X25hbWUiOm51bGwsImxhc3RfbmFtZSI6bnVsbCwiY3JlYXRlZF9hdCI6IjIwMTgtMTAtMjNUMjE6MTc6MDkuMTc5WiIsImF2YXRhcl91cmwiOm51bGwsImVtYWlsX2NvbmZpcm1lZCI6ZmFsc2UsImlhdCI6MTU0MDMyOTc4MH0.65NKuNVnY-vkHoMoLZ1aTbbIWJpRGgVWgTsmuGDq8k0"
}
```
## Notes
* This request does not need any params except the JWT token in the headers (as `headers['authorization'])`. It returns back the user info based on the JWT token provided.
* 



# Confirm Email Request 
**URL** : `/api/user/confirm-email-request/`
**Method** : `POST`
## Request example
```json
{
    "email": "info@view.ly"
}
```
## Success Response
```json
{
    "success": true
}
```
## Notes
* The user will recieve a reset link on his email. The domain that the link includes is in .env variables as `CURRENT_ENDPOINT`


# Confirm Email (when token is acquired from the email) 
**URL** : `/api/user/confirm-email/`
**Method** : `POST`
## Request example
```json
{
    "email_confirm_token": "uuid_here"
}
```
## Success Response
```json
{
    "success": true
}
```
## Notes
* If the provided link on his email is a frontend only link, the token should be parsed from the url and sent to the above endpoint.


# Reset Password Request 
**URL** : `/api/user/reset-password-request/`
**Method** : `POST`
## Request example
```json
{
    "email": "info@view.ly"
}
```
## Success Response
```json
{
    "success": true
}
```
## Notes
* The user will get a reset password link on his email. Domain is defined in .env as `CURRENT_ENDPOINT`



# Reset Password (After token is acquired) 
**URL** : `/api/user/reset-password/`
**Method** : `POST`
## Request example
```json
{
    "password_reset_token": "UUID_TOKEN_HERE"
}
```
## Success Response
```json
{
    "success": true
}
```
## Notes
* If the provided link on his email is a frontend only link, the token should be parsed from the url and sent to the above endpoint. (Same as `/confirm-email`)
**Auth required** : YES
