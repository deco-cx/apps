# Grain App


This is a deco app for Grain API, which is described below


## TODO: Implement oAuth

Status
The Grain Public API is still in beta. Developer access is limited to select partners. Please reach out to support for more questions.
Authentication

Authenticating Calls
To authenticate API calls, the client must add the following header:
Authorization: Bearer XXX
​
where XXX is the access token obtained in the OAuth2 flow above or the Personal Access Token obtained in the Grain app.
API Calls
API Domain is: https://api.grain.com.
GET /_/public-api/me
Example response:
{
	"name": "Andy Arbol",
	"id": "aea95745-99e9-4609-8623-c9efa2926b82"
}
​
GET /_/public-api/recordings
Params:
cursor - used to paginate through the list
include_highlights - set to true to include a recording's highlights in the response.
include_participants - set to true to include a recording's participants in the response.
include_calendar_id - set to true to get an iCal UUID associated with the recording if one exists
attendance
hosted - only return recordings where the user was the meeting host
attended - only return recordings where the user attended the meeting
Example response:
{
    "cursor": null,
    "recordings": [
        {
            "id": "b5185ccb-9a08-458c-9be1-db17a03fb14c",
            "title": "Sample Recording",
            "url": "https://grain.com/recordings/b5185ccb-9a08-458c-9be1-db17a03fb14c/Kz5t1kAyPtt78hcxbSOJHJzFiPpZmUIeDVFXWzP0",
            "start_datetime": "2021-07-29T23:13:17Z",
		        "end_datetime": "2021-07-29T23:16:18Z",
   	 	      "public_thumbnail_url": null // Only non-null if recording share state is public
        }
    ]
}
​
GET /_/public-api/recordings/:id
Params:
include_highlights - set to true to include a recording's highlights in the response (default false).
include_participants - set to true to include a recording's participants in the response (default true).
include_owners - set to true to include the recording's owner emails in the response (default true).
include_calendar_id - set to true to get an iCal UUID associated with the recording if one exists (default false).
transcript_format (default null)
json - to return the transcript as nested JSON under the transcript_json key.
vtt - to return a URL to the transcript VTT under the transcript_vtt key.
intelligence_notes_format (default null).
json - to return notes as nested JSON objects under the intelligence_notes_json key.
md - to return notes as a markdown string under the intelligence_notes_md key.
text - to return notes as a formatted string under the intelligence_notes_text key.
allowed_intelligence_notes - whitelist of intelligence notes section titles to return in the intelligence_notes_* fields, or an empty list to return all sections (default []).
Example response:
{
  "id": "b5185ccb-9a08-458c-9be1-db17a03fb14c",
  "title": "Sample Recording",
  "url": "https://grain.com/recordings/b5185ccb-9a08-458c-9be1-db17a03fb14c/Kz5t1kAyPtt78hcxbSOJHJzFiPpZmUIeDVFXWzP0",
	"participants": [
		{
			"email": "bob@example.com",
			"name": "Bob Example",
			"scope": "external"
		}
	],
  "owners": ["alice@example.com"],
  "start_datetime": "2021-07-29T23:13:17Z",
  "end_datetime": "2021-07-29T23:16:18Z",
  "public_thumbnail_url": null, // Only non-null if recording share state is public
  "tags": ["sample"],
  "highlights": [
		{
			"created_datetime": "2021-07-29T23:16:34Z",
      "duration": 15000,
      "id": "vjQRUKsWw0aFpCT3531eGbr8V0HJrMjKMEIcAUmP",
	    "recording_id": "b5185ccb-9a08-458c-9be1-db17a03fb14c",
	    "text": "testing 123",
      "thumbnail_url": "https://media.grain.com/clips/v1/a14e5af9-d28e-43e9-902b-bc07419082eb/57zB8z52l7BKPoOvkS9KNyUi7LDSsNEh.jpeg",
      "timestamp": 3080,
      "transcript": "expected, that there was a mews in a lane which runs down by one wall of the garden. I lent the ostlers a hand in rubbing down their horses, and received in exchange twopence, a glass of half-and-half, two fills of shag tobacco, and as much information as I could desire about Miss Adler, to say nothing of half a dozen other people in",
      "url": "https://grain.com/highlight/vjQRUKsWw0aFpCT3531eGbr8V0HJrMjKMEIcAUmP"
    }
  ]
}
​
GET /_/public-api/recordings/:id/transcript.vtt
NOTE: this endpoint requires a paid seat for the authenticating user.
Returns the recording’s transcript in VTT format.
GET /_/public-api/recordings/:id/transcript.srt
NOTE: this endpoint requires a paid seat for the authenticating user.
Returns the recording’s transcript in SRT format. 
GET /_/public-api/views
List the views (i.e. saved filters) accessible to the calling user.
Params:
cursor - optional, for pagination
type_filter - optional, one of recordings, highlights, stories. Only return views that contain the given media type.
Example response
{
	"views": [
		{
		  "id": "b5185ccb-9a08-458c-9be1-db17a03fb14c",
		  "name": "My Recordings"
		}
	],
	"cursor": "abcdefg"
}
​
POST /_/public-api/hooks
Create a REST Hook. A reachability test is made to the hook_url on creation and the endpoint must respond with a 2xx status in order to successfully create the REST hook. Otherwise a 400 status is returned. NOTE: params should be sent as a JSON encoded POST body.
Body Params:
version - must be hardcoded to 2
hook_url - endpoint to be called when the event is triggered
view_id - a view_id obtained from GET /_/public-api/views 
actions - optional, a list of added, updated, removed. Actions in the view that will cause the REST hook to fire. Defaults to all.
Example response:
{
	"id": "d13ebcf9-d5cb-42b4-9a95-3e8fa95e38f9",
	"hook_url": "https://example.com/hook",
	"view_id": "b5185ccb-9a08-458c-9be1-db17a03fb14c",
  "inserted_at": "2024-04-22T14:59:39Z"
}
​
GET /_/public-api/hooks
List webhooks.
Example response:
{
  "hooks": [
    {
      "id": "d13ebcf9-d5cb-42b4-9a95-3e8fa95e38f9",
      "hook_url": "https://example.com/hook",
      "view_id": "b5185ccb-9a08-458c-9be1-db17a03fb14c",
      "inserted_at": "2024-04-22T14:59:39Z"
    }
  ]
}
​
DELETE /_/public-api/hooks/:id
Delete a webhook.
Example response:
{
	"success": true
}
​
REST Hook Example Payloads
Recording changes
{
  "type": "recording_added" | "recording_updated",
  "user_id": "aea95745-99e9-4609-8623-c9efa2926b82",
  "data": {
    "id": "b5185ccb-9a08-458c-9be1-db17a03fb14c",
    "title": "Sample Recording",
    "url": "https://grain.com/recordings/b5185ccb-9a08-458c-9be1-db17a03fb14c/Kz5t1kAyPtt78hcxbSOJHJzFiPpZmUIeDVFXWzP0",
    "start_datetime": "2021-07-29T23:13:17Z",
	  "end_datetime": "2021-07-29T23:16:18Z",
    "public_thumbnail_url": null // Only non-null if recording share state is public
  }
}
​
Recording removed
{
  "type": "recording_removed",
  "user_id": "aea95745-99e9-4609-8623-c9efa2926b82",
  "data": {
    "id": "b5185ccb-9a08-458c-9be1-db17a03fb14c"
  }
}
​
Highlight changes
{
  "type": "highlight_added" | "highlight_updated",
  "user_id": "aea95745-99e9-4609-8623-c9efa2926b82",
  "data": {
    "id": "vjQRUKsWw0aFpCT3531eGbr8V0HJrMjKMEIcAUmP",
	  "recording_id": "b5185ccb-9a08-458c-9be1-db17a03fb14c",
	  "text": "testing 123 #test",
    "transcript": "expected, that there was a mews in a lane which runs down by one wall of the garden. I lent the ostlers a hand in rubbing down their horses, and received in exchange twopence, a glass of half-and-half, two fills of shag tobacco, and as much information as I could desire about Miss Adler, to say nothing of half a dozen other people in",
    "speakers": ["Andy Arbol"],
    "timestamp": 3080,
    "duration": 15000,
	  "created_datetime": "2021-07-29T23:16:34Z",
    "url": "https://grain.com/highlight/vjQRUKsWw0aFpCT3531eGbr8V0HJrMjKMEIcAUmP"
    "thumbnail_url": "https://media.grain.com/clips/v1/a14e5af9-d28e-43e9-902b-bc07419082eb/57zB8z52l7BKPoOvkS9KNyUi7LDSsNEh.jpeg",
    "tags": ["test"]
  }
}
​
Highlight removed
{
  "type": "highlight_removed",
  "user_id": "aea95745-99e9-4609-8623-c9efa2926b82",
  "data": {
    "id": "vjQRUKsWw0aFpCT3531eGbr8V0HJrMjKMEIcAUmP",
    "recording_id": "b5185ccb-9a08-458c-9be1-db17a03fb14c"
  }
}
​
Story changes
{
  "type": "story_added" | "story_updated",
  "user_id": "aea95745-99e9-4609-8623-c9efa2926b82",
  "data": {
    "id": "1aff0fe4-6575-4d5f-a462-aaf09f5f17a6",
    "title": "My customer story",
    "description": "A customer journey with ACME Corp",
    "url": "https://grain.com/app/stories/89bd4a02-25f5-42c0-bd40-aa4c94be13ce",
    "public_url": "https://grain.com/share/story/89bd4a02-25f5-42c0-bd40-aa4c94be13ce/2hAEpxLsIN8hDQ48aQ1Yi1MIirv1qCPSJNhxXEoj",
    "banner_image_url": "https://media.grain.com/public/story_thumbnails/07.png",
	  "created_datetime": "2021-07-29T23:16:34Z",
	  "last_edited_datetime": "2021-08-29T23:16:34Z",
    "tags": ["customer"]
  }
}
​
Story removed
{
  "type": "story_removed",
  "user_id": "aea95745-99e9-4609-8623-c9efa2926b82",
  "data": {
    "id": "1aff0fe4-6575-4d5f-a462-aaf09f5f17a6"
  }
}