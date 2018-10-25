# Bookmark Playlist API
# Create new bookmark
**URL** : `/api/user/bookmark/`
**Method** : `POST`
**Auth required** : YES
## Request example
```json
{
    "playlist_id": "66254caa-7266-4687-941d-bd55140d7925"
}
```
## Success Response
```json
{
    "success": true
}
```


## Notes

* The auth token that needs to be sent in every request that requires authentication. Like: `headers["authorization"] = jwt`


# Get bookmarks for user
**URL** : `/api/user/bookmarks/`
**Method** : `GET`
**Auth required** : YES
## Notes

* The auth token that needs to be sent in every request that requires authentication. Like: `headers["authorization"] = jwt`
* 
# Delete bookmark for user
**URL** : `/api/user/bookmark/:playlist_id`
**Method** : `DELETE`
**Auth required** : YES
## Notes
* Ex: `/api/user/bookmark/66254caa-7266-4687-941d-bd55140d7925`
* The auth token that needs to be sent in every request that requires authentication. Like: `headers["authorization"] = jwt`
*


# Review Playlist API
# Create new review
**URL** : `/api/review/`
**Method** : `POST`
**Auth required** : YES
## Request example
```json
{
    "playlist_id": "66254caa-7266-4687-941d-bd55140d7925",
    "title": "Something something",
    "description": "Very good playlist",
    "rating": 4,
}
```
## Success Response
```json
{
    "success": true
}
```


## Notes

* The auth token that needs to be sent in every request that requires authentication. Like: `headers["authorization"] = jwt`


# Get reviews for playlist
**URL** : `/api/reviews/:playlist_id`
**Method** : `GET`
**Auth required** : YES
## Notes
* Ex: `/api/reviews/66254caa-7266-4687-941d-bd55140d7925`
* The auth token that needs to be sent in every request that requires authentication. Like: `headers["authorization"] = jwt`
* 
# Delete a review
**URL** : `/api/review/:playlist_id`
**Method** : `DELETE`
**Auth required** : YES
## Notes
* Ex: `/api/review/66254caa-7266-4687-941d-bd55140d7925`
* The auth token that needs to be sent in every request that requires authentication. Like: `headers["authorization"] = jwt`
