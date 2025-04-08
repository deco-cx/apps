## Figma APP

TODO: Implement oAuth

Endpoints
Files endpoints allow for a wide range of functionality to get information about files. With a specific file key, you can get the JSON and image representations of the whole file or individual nodes within the file.

GET file
Returns the document referred to by :key as a JSON object. The file key can be parsed from any Figma file url: https://www.figma.com/:file_type/:file_key/:file_name. The name, lastModified, thumbnailUrl, editorType, linkAccess, and version attributes are all metadata of the retrieved file. The document attribute contains a Node of type DOCUMENT.

The components key contains a mapping from node IDs to component metadata. This is to help you determine which components each instance comes from.

HTTP Endpoint
GET/v1/files/:key

Path parameters	Description
key	String
File to export JSON from. This can be a file key or branch key. Use GET /v1/files/:key with the branch_data query param to get the branch key.
Query parameters	Description
version	Stringoptional
A specific version ID to get. Omitting this will get the current version of the file
ids	Stringoptional
Comma separated list of nodes that you care about in the document. If specified, only a subset of the document will be returned corresponding to the nodes listed, their children, and everything between the root node and the listed nodes.

Note: There may be other nodes included in the returned JSON that are outside the ancestor chains of the desired nodes. The response may also include dependencies of anything in the nodes' subtrees. For example, if a node subtree contains an instance of a local component that lives elsewhere in that file, that component and its ancestor chain will also be included.

For historical reasons, top-level canvas nodes are always returned, regardless of whether they are listed in the ids parameter. This quirk may be removed in a future version of the API.
depth	Numberoptional
Positive integer representing how deep into the document tree to traverse. For example, setting this to 1 returns only Pages, setting it to 2 returns Pages and all top level objects on each page. Not setting this parameter returns all nodes
geometry	Stringoptional
Set to "paths" to export vector data
plugin_data	Stringoptional
A comma separated list of plugin IDs and/or the string "shared". Any data present in the document written by those plugins will be included in the result in the `pluginData` and `sharedPluginData` properties.
branch_data	Booleanoptional
Returns branch metadata for the requested file. If the file is a branch, the main file's key will be included in the returned response. If the file has branches, their metadata will be included in the returned response. Default: false.
Error codes	Description
403	The developer / OAuth token is invalid or expired
404	The specified file was not found
Return value
{
  "name": String,
  "role": String,
  "lastModified": String,
  "editorType": String,
  "thumbnailUrl": String,
  "version": String,
  "document": Node,
  "components": Map<String, Component>,
  "componentSets": Map<String, ComponentSet>,
  "schemaVersion": 0,
  "styles": Map<String, Style>
  "mainFileKey": String,
  "branches": [
   {
    "key": String,
    "name": String,
    "thumbnail_url": String,
    "last_modified": String,
    "link_access": String,
   }
  ]
}
Try it out for yourself
file_key 
version (optional)
ids (optional)
depth (optional)
geometry (optional)
plugin_data (optional)
branch_data (optional)
figd_YFOG0pcXEpD-3EKhQgAjwq_EitgYtWLYx4rAU4Kp
Your cURL command
curl -H 'X-FIGMA-TOKEN: figd_YFOG0pcXEpD-3EKhQgAjwq_EitgYtWLYx4rAU4Kp' 'https://api.figma.com/v1/files/:file_key'
Examples
To get the JSON for specific nodes, their subtrees, and all the nodes in their ancestor chains:

GET /v1/files/:key?ids=1:2,1:3
To get the JSON for the document tree stopping at the top-level nodes on each page (all pages live at depth 1):

GET /v1/files/:key?depth=2
GET file nodes
Returns the nodes referenced to by :ids as a JSON object. The nodes are retrieved from the Figma file referenced to by :key.

The node id and file key can be parsed from any Figma node url: https://www.figma.com/:file_type/:file_key/:file_name?node-id=:id.

The name, lastModified, thumbnailUrl, editorType, and version attributes are all metadata of the specified file.

The linkAccess field describes the file link share permission level. There are 5 types of permissions a shared link can have: "inherit", "view", "edit", "org_view", and "org_edit". "inherit" is the default permission applied to files created in a team project, and will inherit the project's permissions. "org_view" and"org_edit" restrict the link to org users.

The document attribute contains a Node of type DOCUMENT.

The components key contains a mapping from node IDs to component metadata. This is to help you determine which components each instance comes from.

By default, no vector data is returned. To return vector data, pass the geometry=paths parameter to the endpoint.
Each node can also inherit properties from applicable styles. The styles key contains a mapping from style IDs to style metadata.

Important: the nodes map may contain values that are null . This may be due to the node id not existing within the specified file.

HTTP Endpoint
GET/v1/files/:key/nodes

Path parameters	Description
key	String
File to export JSON from. This can be a file key or branch key. Use GET /v1/files/:key with the branch_data query param to get the branch key.
Query parameters	Description
ids	String
A comma separated list of node IDs to retrieve and convert
version	Stringoptional
A specific version ID to get. Omitting this will get the current version of the file
depth	Numberoptional
Positive integer representing how deep into the node tree to traverse. For example, setting this to 1 will return only the children directly underneath the desired nodes. Not setting this parameter returns all nodes.

Note: this parameter behaves differently from the same parameter in the GET /v1/files/:key endpoint. In this endpoint, the depth will be counted starting from the desired node rather than the document root node.
geometry	Stringoptional
Set to "paths" to export vector data
plugin_data	Stringoptional
A comma separated list of plugin IDs and/or the string "shared". Any data present in the document written by those plugins will be included in the result in the `pluginData` and `sharedPluginData` properties.
Error codes	Description
400	Invalid parameter, the "err" property will indicate which parameter is invalid
403	The developer / OAuth token is invalid or expired
404	The specified file was not found
Return value
{
  "name": String,
  "role": String,
  "lastModified": String,
  "editorType": String,
  "thumbnailUrl": String,
  "err": String,
  "nodes": {
    "id": {
      "document": Node,
      "components": Map<String, Component>,
      "componentSets": Map<String, ComponentSet>,
      "schemaVersion": 0,
      "styles": Map<String, Style>
       ...
    }
  }
}
Try it out for yourself
file_key 
ids 
depth (optional)
geometry (optional)
version (optional)
plugin_data (optional)
figd_YFOG0pcXEpD-3EKhQgAjwq_EitgYtWLYx4rAU4Kp
Your cURL command
curl -H 'X-FIGMA-TOKEN: figd_YFOG0pcXEpD-3EKhQgAjwq_EitgYtWLYx4rAU4Kp' 'https://api.figma.com/v1/files/:file_key/nodes'
Examples
To get the JSON for specific nodes and their subtrees:

GET /v1/files/:key/nodes?ids=1:2,1:3
To get the JSON for specific nodes and their direct children without any further descendants:

GET /v1/files/:key/nodes?ids=1:2,1:3&depth=1
GET image
Renders images from a file.

If no error occurs, "images" will be populated with a map from node IDs to URLs of the rendered images, and "status" will be omitted. The image assets will expire after 30 days. Images up to 32 megapixels can be exported. Any images that are larger will be scaled down.

Important: the image map may contain values that are null. This indicates that rendering of that specific node has failed. This may be due to the node id not existing, or other reasons such has the node having no renderable components. For example, a node that is invisible or has 0% opacity cannot be rendered. It is guaranteed that any node that was requested for rendering will be represented in this map whether or not the render succeeded.

To render multiple images from the same file, use the ids query parameter to specify multiple node ids.GET /v1/images/:key?ids=1:2,1:3,1:4

HTTP Endpoint
GET/v1/images/:key

Path parameters	Description
key	String
File to export images from. This can be a file key or branch key. Use GET /v1/files/:key with the branch_data query param to get the branch key.
Query parameters	Description
ids	String
A comma separated list of node IDs to render
scale	Numberoptional
A number between 0.01 and 4, the image scaling factor
format	Stringoptional
A string enum for the image output format, can be jpg, png, svg, or pdf
svg_outline_text	Booleanoptional
Whether text elements are rendered as outlines (vector paths) or as <text> elements in SVGs. Default: true.

Rendering text elements as outlines guarantees that the text looks exactly the same in the SVG as it does in the browser/inside Figma.

Exporting as <text> allows text to be selectable inside SVGs and generally makes the SVG easier to read. However, this relies on the browser's rendering engine which can vary between browsers and/or operating systems. As such, visual accuracy is not guaranteed as the result could look different than in Figma.
svg_include_id	Booleanoptional
Whether to include id attributes for all SVG elements. Adds the layer name to the id attribute of an svg element. Default: false.
svg_include_node_id	Booleanoptional
Whether to include node id attributes for all SVG elements. Adds the node id to a data-node-id attribute of an svg element. Default: false.
svg_simplify_stroke	Booleanoptional
Whether to simplify inside/outside strokes and use stroke attribute if possible instead of <mask>. Default: true.
contents_only	Booleanoptional
Whether content that overlaps the node should be excluded from rendering. Passing false (i.e., rendering overlaps) may increase processing time, since more of the document must be included in rendering. Default: true.
use_absolute_bounds	Booleanoptional
Use the full dimensions of the node regardless of whether or not it is cropped or the space around it is empty. Use this to export text nodes without cropping. Default: false.
version	Stringoptional
A specific version ID to use. Omitting this will use the current version of the file
Error codes	Description
400	Invalid parameter, the "err" property will indicate which parameter is invalid
403	The developer / OAuth token is invalid or expired
404	The specified file was not found
500	Unexpected rendering error, render could not be completed
Return value
{
  "err": String,
  "images": Map<String, String>,
  "status": Number
}
Try it out for yourself
file_key 
ids 
scale (optional)
format (optional)
use_absolute_bounds (optional)
version (optional)
figd_YFOG0pcXEpD-3EKhQgAjwq_EitgYtWLYx4rAU4Kp
Your cURL command
curl -H 'X-FIGMA-TOKEN: figd_YFOG0pcXEpD-3EKhQgAjwq_EitgYtWLYx4rAU4Kp' 'https://api.figma.com/v1/images/:file_key'
GET image fills
Returns download links for all images present in image fills in a document. Image fills are how Figma represents any user supplied images. When you drag an image into Figma, we create a rectangle with a single fill that represents the image, and the user is able to transform the rectangle (and properties on the fill) as they wish.

This endpoint returns a mapping from image references to the URLs at which the images may be download. Image URLs will expire after no more than 14 days. Image references are located in the output of the GET files endpoint under the imageRef attribute in a Paint.

HTTP Endpoint
GET/v1/files/:key/images

Path parameters	Description
key	String
File to get image URLs from. This can be a file key or branch key. Use GET /v1/files/:key with the branch_data query param to get the branch key.
Error codes	Description
403	The developer / OAuth token is invalid or expired
404	The specified file was not found