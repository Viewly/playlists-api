# Playlist builder API
# Create a new playlist (blank)
**URL** : `/api/playlist`
**Method** : `POST`
## Request example
```json
{
   
        "title": "string",
        "url": "string",
        "description": "string",
        "category_id": "integer",
        "hashtags": "string",
        "status": "string",
        "playlist_thumbnail_url": "string",
        "publish_date": "playlist.status === 'published' ? new Date(): null"
}
```
## Success Response
```json
{
    
    "id": "66254caa-7266-4687-941d-bd55140d7925"
     
}
```

## Notes

* `status` - status defaults to `hidden`





# Update a playlist (blank)
**URL** : `/api/playlist`
**Method** : `PUT`
## Request example
```json
{
        "id": "uuid",
        "title": "string",
        "url": "string",
        "description": "string",
        "category_id": "integer",
        "hashtags": "string",
        "status": "string",
        "playlist_thumbnail_url": "string",
        "publish_date": "playlist.status === 'published' ? new Date(): null"
}
```
## Success Response
```json
{
    
    "success": true
     
}
```

## Notes
`id` in the body is mandatory for `PUT`


# Delete a playlist
**URL** : `/api/playlist/playlist_id`
**Method** : `DELETE`
## Success Response
```json
{
    
    "success": true
     
}
```

# Prefill a video
# Add a video to a playlist
**URL** : `/api/video-prefill?url=https://www.youtube.com/watch?v=MuF5HVQfJKA`
**Method** : `GET`
## Success Response
```json
{
 
     "video_id": "string",
     "channel_title": "string",
     "channel_id": "string",
     "channel_thumbnail": "string",
     "title": "string",
     "thumbnail_url": "string",
     "duration": "string",
     "definition": "string",
     "category": "string" 
    
}
```

## Notes
- After prefilling, a video is added to the source videos, and ready to be part of a playlist
`video_id` is the extracted id from the youtube url
`category` is the youtube category, so should not be mistaken with our own playlist categories 


# Add a video to a playlist
**URL** : `/api/add-video`
**Method** : `POST`
## Request example
```json
{
    "video_id": "uuid",
    "playlist_id": "uuid",
    "title": "string",
    "description": "string",
    "thumbnail_url": "string",
    "position": "integer"
}
```
## Success Response
```json
{
    
     "success": true,
     "data": { "position": 5 } 
    
}
```

## Notes
This request assumes that you used the '/video-prefill' request above which can be used loosely, but it creates the source video and returns metadata about that video that can be presented. In order for a video to be added to a playlist, it must first pass through this request.
`position` is not mandatory, and will be auto-generated 
`video_id` is the youtube id for the video (https://www.youtube.com/watch?v=MuF5HVQfJKA) `video_id` is `MuF5HVQfJKA`. See the '/video-prefill' request. 




# Remove a video from a playlist
**URL** : `/api/remove-video`
**Method** : `POST`
## Request example
```json
{
    "playlist_id": "uuid",
    "video_id": "uuid"
}
```
## Success Response
```json
{
    
     "success": true
    
}
```

## Notes
`video_id` is the uuid of the video contained in `videos` fetched from `/playlist/:playlist_id`


# Reorder playlist's videos
**URL** : `/api/playlist-reorder/:playlist_id`
**Method** : `POST`
## Request example
```json
[
    { "id": "uuid", "position": 1 },
    { "id": "uuid", "position": 2 }
]
```
## Success Response
```json
{
    
     "success": true
    
}
```

## Notes
Array of videos with `id` and `position`
`id` is the uuid of the video contained in `videos` fetched from `/playlist/:playlist_id`



# Import youtube playlist
**URL** : `/api/playlist-import?yt_url=https://www.youtube.com/watch?v=RgKAFK5djSk&list=PLeCdlPO-XhWFzEVynMsmosfdRsIZXhZi0`
**Method** : `POST`
## Request example
```json
{
    "title": "string",
    "description": "string",
    "category": "string",
    "status": "string"
}
```
## Success Response
```json
{
    
     "success": true
    
}
```

## Notes
The `?yt_url=` is a youtube url from a playlist (can be root, or a video, it *MUST* contain the `list` query param inside). Example: `https://www.youtube.com/watch?v=RgKAFK5djSk&list=PLeCdlPO-XhWFzEVynMsmosfdRsIZXhZi0`
`status` defaults to `hidden`


# Update a video in a playlist
**URL** : `/api/video`
**Method** : `PUT`
## Request example
```json
{
    "id": "uuid",
    "title": "string",
    "description": "string"
}
```
## Success Response
```json
{
    
     "success": true
    
}
```


# Upload a file to s3
**URL** : `/api/upload-file`
**Method** : `POST`
## Request example
```json
{
    "key": "`${randomGuid}_${documentName}.${extension}`",
    "type": "string"
}
```
## Success Response
```json
{
    
     "url": "string"
    
}
```
## Notes
* This requests gives a url where the client can upload thumbnails or any other content.
After the upload, this url can be saved as part of a playlist.
* The key format currently used by playlists is: `randomUUID_thumbnail.png` or any other extension (`jpg..`) 
