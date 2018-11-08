# Get hashtags
**URL** : `/api/hashtags`
**Method** : `GET`
## Notes
* Ex: `/api/hashtags?limit=10`
* Default limit is 20


# Get playlists
**URL** : `/api/playlists`
**Method** : `GET`
## Notes
* The search can be done on multiple attributes
* `?q=keyword` searches by title, description, hashtags (ILIKE)
* `?title=keyword` searches by title (ILIKE)
* `?limit and ?page` are used for pagination. Paging stars from 0.
* `?hashtags` searches the hashtags (ILIKE)
* `?slug` searches by category handle (ex: gaming)
*  All the rest attributes are searchable, but they do exact search (`=`)


# Get playlist by ID
**URL** : `/api/playlist/:id`
**Method** : `GET`

# Get categories
**URL** : `/api/categories`
**Method** : `GET`
