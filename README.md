# Navigating Real-Estate Videos With Auto Tagged Markers Using Next.js

## Introduction

Videos are a great way to promote products and drive customer engagement. Companies and businesses around the world have adopted video marketing. [Biteable](https://biteable.com) in a recent [blog post](https://biteable.com/blog/video-marketing-statistics/) mentioned that an estimated 60% of businesses use video as a marketing tool. They further noted that 94% of marketers who use videos plan to continue. Real Estate is one sector that benefits from this. Even though some realtors are now moving towards AR and VR to give demos and tours, videos are still broadly used. What can we as developers use to try and match the user experience of augmented reality? **Auto tagged markers**. Giving users the ability to navigate real estate videos using video tags would be a significant enhancement. While we could do this manually by visually analyzing the video and storing the tags in, say, a database, cloud-based services such as [Cloudinary](https://cloudinary.com/?ap=em) offer a more automated solution. Cloudinary provides a wide range of solutions, including but not limited to: programmable media, media optimization, and dynamic asset management. In this tutorial, we will be utilizing the video upload API and google automatic video tagging.

## TL;DR

Here's a summary of what we'll be doing

1. Obtain necessary credentials from [Cloudinary](https://cloudinary.com/?ap=em)
2. Upload and tag a real estate video
3. View the video on the frontend 
4. Navigate the video with auto-tagged markers

## Getting Started

This tutorial assumes that you are already familiar with Javascript and React. We will also be using Node.js and Next.js (some knowledge of the two is expected but not mandatory).

### Prerequisites

#### Installing Node.js and NPM

There are tons of tutorials on how to do this. You can check out the official [Node.js website](https://nodejs.org/en/) on installation and adding the path to your environment variables. You could also check out [NVM](https://github.com/nvm-sh/nvm), a version manager for node. If you are a power user and might be switching between node versions often, I would recommend the latter.

#### A code editor

You will need a code editor. Any code editor will do. Check out [Visual Studio Code](https://code.visualstudio.com/), which has great support for javascript and node.

#### Sample video

We're going to need a sample real estate video to work with. There are numerous sources for this type of video. One way would be to download a bunch of royalty-free images and then turn them into a video where each photo spans a couple of seconds. I used this approach on <https://moviemakeronline.com> and was able to quickly create a short video. [Here's the link]() to the video if you'd like to reuse it.

#### Cloudinary account and API keys

You will need some API credentials before making requests to Cloudinary. Luckily, you can get started with a free account immediately. Head over to [Cloudinary](https://cloudinary.com/?ap=em) and sign in or sign up for a free account. Once done with that, head over to your [console](https://cloudinary.com/console). At the top left corner of your console, you'll notice your account details. Take note of your `Cloud name` `API Key` and `API Secret`. We will need those later

![Cloudinary Dashboard](/public/images/cloudinary-dashboard.png "Cloudinary Dashboard")

### The fun Part

Let's go ahead and initialize a new project. You can check out different installation options on the [official docs](https://nextjs.org/docs).

Open up your terminal/command line and navigate to your desired Project folder. Run the following command

```bash
npx create-next-app
```

The terminal will ask for your project name. Give it any sensible name. I'm going to name mine `nextjs-video-tags`. The command installs a few react dependencies and scaffolds our project for us. I will not get into the react/next specifics since that is beyond the scope of this tutorial.

Change directory into your newly created project and open the folder in your code editor.

```bash
cd nextjs-video-tags
```

If you're not familiar with it yet, Next js supports API routes as well as hybrid client-side static/server-rendered pages. Let's work on the backend first.

#### The backend

In your code editor, navigate to `pages/api/` folder and create a new file names `videos.js`. This page will hold our `api/videos` endpoint. Read more about api routes on the [official docs](https://nextjs.org/docs/api-routes/introduction).

API route files in next js must export a default function that takes in two parameters; an API request object and an API response object. This should all be familiar if you've created a REST API Client in any language. Let's do that.

Inside the `pages/api/videos.js` file, paste the following code

```js
export default async function videosController(req,res){
    return res.status(200).send(`<h1>It works</h1>`);
}
```

Go ahead and run your app

```bash
npm run dev
```

If you open a browser and navigate to `{{BASE_URL}}/api/videos`, you should get the response `It works`. `BASE_URL` might be different depending on your development environment. Typically it's `http://localhost:3000` for the local development environment.

Great, our API route works. Let's now implement this to handle video uploads to Cloudinary. In a real-world use case, you would upload the video from the front using something like [multer](https://www.npmjs.com/package/multer), then process the video and upload it to Cloudinary. If you don't need to process the video, you could also do this on the frontend using Cloudinary's JS SDK. For the simplicity of this tutorial, we're going to make use of the video we mentioned in the [Prerequisites > Sample video](#sample-video) section. Go ahead and place this video inside your project folder. For ease, I put it inside `repository/videos/house.mp4`.

Before we proceed, let's install the Cloudinary npm package. Inside your terminal, run

```bash
npm install --save cloudinary
```

We need to set up a module that will initialize the Cloudinary API and prepare it for use. Let's create a new folder at the root of the project and name it `utils`. The folder will hold utility/shared code. Inside the folder, create a new file and name it `cloudinary.js`

```js
// utils/cloudinary.js

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export default cloudinary;
```

Let's go over this. At the top, we import the `v2` API from the Cloudinary package that we just installed. We rename the `v2` API as `cloudinary` for better readability. Calling the `config` method on the API will initialize it with the `cloud_name` `api_key` and `api_secret`. Notice the use of environment variables to store the sensitive keys. We've referenced the keys as environment variables but, we have not defined them yet. Let's do that now.

At the root of your project, create a new file and name it `.env.local`. Inside the file, paste the following data

```env
CLOUD_NAME=YOUR_CLOUD_NAME
API_KEY=YOUR_API_KEY
API_SECRET=YOUR_API_SECRET
```

Replace `YOUR_CLOUD_NAME` `YOUR_API_KEY` and `YOUR_API_SECRET` with the appropriate values from the [Prerequisites > Cloudinary account and API keys](#cloudinary-account-and-api-keys) section.

We're now ready to proceed. Open up `pages/api/videos.js` and paste the function below inside the file.

```js
// pages/api/videos.js
import cloudinary from "../../utils/cloudinary";

const handlePostRequest = () => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      "repository/videos/house.mp4",
      {
        // Folder to store video in
        folder: "videos/",
        // Id that will be used to identify the video
        public_id: "navigating-real-estate-with-auto-tagged-markers-demo",
        // Type of resource
        resource_type: "video",
        // What type of categorization to be done on the video
        categorization: "google_video_tagging",
        // Auto tagging threshold/confidence score
        auto_tagging: 0.6,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      }
    );
  });
};
```

At the top, we import the Cloudinary module that initializes the API. We then have a function named `handlePostRequest`. The function wraps the actual upload call in a Promise then returns that promise. Inside the upload call, we pass in the video/resource that we want to upload to Cloudinary. In our case, that's a path pointing to the video file. We then pass a few options. The most important options are the `categorization` and `auto_tagging` options. I will cover both shortly. You can read more about the options you can pass from the [official docs](https://cloudinary.com/documentation/image_upload_api_reference#upload_optional_parameters). Finally, we pass a callback function that either resolves or rejects the promise based on the result or error, respectively. Let's cover the `categorization` and `auto_tagging` options.

1. categorization
   A comma-separated list of the categorization add-ons to run on the asset. In our case, we will only be using the `google_video_tagging` add-on, which we also need to enable. On your browser, navigate to the [Cloudinary Addons Tab](https://cloudinary.com/console/lui/addons#google_video_tagging?ap=em) and enable the `Google Automatic Video Tagging` add-on.
2. auto_tagging
   Automatically assigns tags to an asset according to detected objects or categories with a confidence score higher than the specified value. We've used 0.6 so that we can have pretty accurate results.

We now have the upload video code in place. Let's map it to our API route. Inside the same file, `pages/api/videos.js`, modify the `videoController` function to the following.

```js
export default async function videosController(req, res) {
  switch (req.method) {
    // Handle POST http methods made to /api/videos
    case "POST":
      try {
        const result = await handlePostRequest(req, res);

        // Resolve the request with a status code of 201(Created)
        return res.status(201).json({
          message: "Success",
          result,
        });
      } catch (error) {
          // Reject the request with a response of status code 400(Bad Request)
        return res.status(400).json({
          message: "Error",
          error,
        });
      }
    // Reject all other http methods made to /api/videos
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}
```

What we're doing here is setting up the route to accept `POST` requests and handle them. All other HTTP methods will fail with status 405. You could go ahead and accept all methods, but we're going for a little bit more control in this case. We're now ready to use the `/api/videos` endpoint. You can use this endpoint from any API client but let's create a simple UI for it.

#### The frontend

Let's create a simple page where we can upload and view the video. Open up `pages/index.js` in your code editor and export a react component. Let's call it `Home`.

```jsx
import Head from "next/head";
import { useState, useRef, MutableRefObject } from "react";

export default function Home() {
  /**
   * @type {MutableRefObject<HTMLVideoElement>}
   */
  const playerRef = useRef(null);

  /**
   * @type {[Array<UploadVideoResult>, Function]} video
   */
  const [videos, setVideos] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  return (
    <div
      style={{ width: "100vw", minHeight: "100vh", backgroundColor: "white" }}
    >
      <Head></Head>
      <main
        style={{
          maxWidth: "1000px",
          margin: "auto",
          display: "flex",
          flexFlow: "column nowrap",
          justifyContent: "center",
          alignItems: "start",
        }}
      >
        <h1
          style={{
            margin: "100px auto",
            fontWeight: "bold",
            fontSize: "50px",
          }}
        >
          Real Estate
        </h1>

        <div
          style={{
            height: "2px",
            width: "100%",
            backgroundColor: "black",
          }}
        ></div>
      </main>
    </div>
  );
}

```

We've just created a simple React Functional Component and set up a few state and ref hooks. Read about react hooks in the [official docs](https://reactjs.org/docs/hooks-intro.html). The first hooks will hold our videos state; these are the videos that we upload. The second hook will hold our loading state; this is to show where an upload is in progress or not. And finally, our error hook that holds any errors that might arise from the upload. Apart from the state hooks, we also have a ref hook that stores a dom reference to our video player.

You might have also noticed the weird comments. These are JSDoc type definitions. [JSDoc Typedefs](https://jsdoc.app/tags-typedef.html) allow us to define interfaces and types without writing our app in Typescript and hence leverage the power of intelli-sense. Let's write a few of them.

Create `typedefs.js` inside `utils` folder and paste the following inside.

```js
/**
 * @typedef {Object} UploadVideoResult
 * @property {number} duration
 * @property {string} format
 * @property {number} height
 * @property {number} width
 * @property {string} url
 * @property {string} secure_url
 * @property {string} public_id
 * @property {Info} info
 */

/**
 * @typedef {Object} Info
 * @property {Categorization} categorization
 */

/**
 * @typedef {Object} Categorization
 * @property {Category} google_video_tagging
 */

/**
 * @typedef {Object} Category
 * @property {Array<VideoTag>} data
 */

/**
 * @typedef {Object} VideoTag
 * @property {string} tag
 * @property {Array<string>} categories
 * @property {number} start_time_offset
 * @property {number} end_time_offset
 * @property {number} confidence
 */

/**
 * @typedef {Object} TagWithRooms
 * @property {string} tag
 * @property {Array<VideoTag>} rooms
 *
 */

```

Go back to `pages/index.js` and import the file at the top.

```js
import "../utils/typedef";
```

We can now define our upload handler. Again, in a real-world scenario, you would want to have a file input and upload that to the backend or directly to Cloudinary, however, for this tutorial we're just going to be making a call to the `api/videos` endpoint to mock this behaviour. Let's add a handler method just below our state hooks.

```js
const handleUploadVideo = async () => {
    try {
      // Set loading to true
      setLoading(true);
      // Clear any existing errors
      setError(null);

      // Make a POST request to the `api/videos/` endpoint
      const response = await fetch("/api/videos", {
        method: "post",
      });

      // Set loading to true once a response is available
      setLoading(false);

      // Check if the response is successful
      if (response.status >= 200 && response.status < 300) {
        const data = await response.json();

        /**
         * @type {UploadVideoResult}
         */
        const result = data.result;

        // Update our videos state with the results
        setVideos([...videos, result]);
      } else {
        throw await response.json();
      }
    } catch (error) {
      // Set error state
      setError(error);
      console.error({ ...error });
    }
};
```

This method calls the `api/videos` endpoint and updates our videos state with the result. You could show an alert to the user when the upload completes or fails. Check out the [official docs](https://cloudinary.com/documentation/node_image_and_video_upload#upload_response) to understand the schema of the result object. Here's what it might look like

```js
{ 
  public_id: 'cr4mxeqx5zb8rlakpfkg',
  version: 1571218330,
  signature: '63bfbca643baa9c86b7d2921d776628ac83a1b6e',
  width: 864,
  height: 576,
  format: 'jpg',
  resource_type: 'image',
  created_at: '2017-06-26T19:46:03Z',
  bytes: 120253,
  type: 'upload',
  url: 'http://res.cloudinary.com/demo/image/upload/v1571218330/cr4mxeqx5zb8rlakpfkg.jpg',
  secure_url: 'https://res.cloudinary.com/demo/image/upload/v1571218330/cr4mxeqx5zb8rlakpfkg.jpg' 
  info:{
      categorization:{
          google_video_tagging:{
              data:[
                  {
                      tag:"",
                      categories:[""],
                      start_time_offset:0,
                      end_time_offset:0,
                  }
              ]
          }
      }
  }
}
```

Take special note of `format`, `url`, `secure_url`, and `info.categorization.google_video_tagging.data`. Inside `info.categorization.google_video_tagging.data` take note of `tag`,`categories` and `start_time_offset`. We're going to need these fields.

And now, let's update our UI. Modify the Home component to return the following

```jsx
return (
    <div
      style={{ width: "100vw", minHeight: "100vh", backgroundColor: "white" }}
    >
      <Head></Head>
      <main
        style={{
          maxWidth: "1000px",
          margin: "auto",
          display: "flex",
          flexFlow: "column nowrap",
          justifyContent: "center",
          alignItems: "start",
        }}
      >
        <h1
          style={{
            margin: "100px auto",
            fontWeight: "bold",
            fontSize: "50px",
          }}
        >
          Real Estate
        </h1>

        <div
          style={{
            height: "2px",
            width: "100%",
            backgroundColor: "black",
          }}
        ></div>

        <div
          style={{
            width: "100%",
            display: "flex",
            flexFlow: "column nowrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexFlow: "column nowrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p>
              {!videos.length ? "No Video Yet. " : ""}Tap on the button below to
              add a video.
            </p>
            <button
              style={{
                height: "50px",
                padding: "0 30px",
                fontWeight: "bold",
              }}
              disabled={loading}
              onClick={handleUploadVideo}
            >
              UPLOAD VIDEO
            </button>
          </div>
          {loading || error ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexFlow: "column nowrap",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <hr style={{ width: "60%" }}></hr>
              {loading ? (
                <p>Please be patient while the video uploads...</p>
              ) : null}
              {error ? (
                <p style={{ color: "red" }}>There was a problem</p>
              ) : null}
            </div>
          ) : null}
          {videos.length ? (
            videos.map((video) => (
              <div id="video-component">
              Show video here
              </div>
            ))
          ) : (
            <div
              style={{
                margin: "20px auto",
                width: "100%",
                display: "flex",
                flexFlow: "column nowrap",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <hr style={{ width: "60%" }}></hr>No videos yet
            </div>
          )}
        </div>
      </main>
    </div>
);
```

That's a lot of code. Let us go over what's happening. We have a div at the top that has an upload button. The button is disabled if `loading` is true. Below that, we have the loading indicator div. This div will only show when `loading` is true or if there's an `error`. After these two, we have a div that will now hold our video elements/components. We map through our uploaded videos and return a div for each video.

We're going to have a flex container with the video on the left and the navigation markers on the right. Replace the div with an id of `video-component` with the following code

```jsx
<div
  id="video-component"
  style={{
    height: "520px",
    display: "flex",
    flexFlow: "row nowrap",
    margin: "20px auto",
    backgroundColor: "white",
    border: "solid 2px black",
    borderRadius: "5px",
  }}
>
  <video
    ref={playerRef}
    controls
    style={{
      height: "100%",
      width: "75%",
      objectFit: "cover",
    }}
  >
    <source src={video.secure_url} type={`video/${video.format}`} />
    Your browser does not support the video tag.
  </video>
  <div
    style={{
      height: "100%",
      width: "25%",
      backgroundColor: "white",
      padding: "8px",
      overflowY: "auto",
    }}
  >
    <h1 style={{ fontSize: "18px" }}>Location Markers</h1>
    <hr></hr>
    <ul style={{ listStyleType: "none", overflowY: "none" }}>
      {video.info.categorization.google_video_tagging.data
        .filter(
          (tag) => tag.categories.includes("room") || tag.tag.includes("room")
        )
        .reduce((tags, tag) => {
          /**
           * @type {TagWithRooms}
           */
          const existingTagWithRoooms = tags?.find(
            (tagWithRoooms) =>
              tagWithRoooms.tag.toLowerCase() === tag.tag.toLowerCase()
          );

          if (!existingTagWithRoooms) {
            return [
              ...tags,
              {
                tag: tag.tag,
                rooms: [tag],
              },
            ];
          }

          existingTagWithRoooms.rooms.push(tag);

          return tags;
        }, [])
        .map(
          /**
           * @param {TagWithRooms} tag
           */
          (tag) => (
            <li style={{ margin: "5px 0" }}>
              {tag.rooms.length > 1 ? (
                [
                  <h2 style={{ fontSize: "16px" }}>{tag.tag}</h2>,
                  <hr></hr>,
                  <ul style={{ listStyleType: "none" }}>
                    {tag.rooms.map((room, index) => (
                      <li style={{ margin: "5px 0" }}>
                        <button
                          onClick={() => {
                            playerRef.current.currentTime =
                                            room.start_time_offset;
                          }}
                        >
                          {room.tag} {index + 1}
                        </button>
                      </li>
                    ))}
                  </ul>,
                ]
              ) : (
                <button
                  onClick={() => {
                   playerRef.current.currentTime =
                                    tag.rooms[0].start_time_offset;
                  }}
                >
                  {tag.rooms[0].tag}
                </button>
              )}
            </li>
          )
        )}
    </ul>
  </div>
</div>
```

The video element is self-explanatory. We just have a native HTML Video element. We then store a reference to the element in our `playerRef` ref hook. We set the source of the video to the `secure_url` field of the upload result and the format to `format` field of the upload result.

On the right side, we have an unorderd list. This list will hold our navigation markers which are currently stored in the `video.info.categorization.google_video_tagging.data` field of the upload result. Since Cloudinary returns all sorts of tags that we don't need, we're going to filter tags that include the word `room` in either the `tag` or `categories` field.

```js
video.info.categorization.google_video_tagging.data
.filter(
    (tag) =>
    tag.categories.includes("room") ||
    tag.tag.includes("room")
)
```

Next, we want to show a list item for every room and a list if there is more than one room with the same tag. i.e

```html
<ul>
    <li>
        <button>Kitchen</button>
    </li>
    <li>
        <button>Bathroom</button>
    </li>
    <li>
        <h2>Bedroom</h2>
        <ul>
            <li>
                <button>Bedroom 1</button>
            </li> 
            <li>
                <button>Bedroom 2</button>
            </li> 
        </ul>
    </li>
</ul>
```

Let's modify our data to help us achieve this. We will use Javascript's `Array.reduce` method to achieve the following schema. You could also use something like lodash.

```js
{
    tag:"",
    rooms:[
        {
            tag:"",
            categories:[""],
            start_time_offset:0,
            end_time_offset:0,
        }
    ]
}
```

Let's see how we'll do this. Chain our filter method with the following reduce method.

```js
.reduce((tags, tag) => {
/**
 * Check if a room with a similar tag has already been found
 * @type {TagWithRooms}
 */
const existingTagWithRoooms = tags?.find(
    (tagWithRoooms) =>
    tagWithRoooms.tag.toLowerCase() ===
    tag.tag.toLowerCase()
);

if (!existingTagWithRoooms) {
    return [
    ...tags,
    {
        tag: tag.tag,
        rooms: [tag],
    },
    ];
}

existingTagWithRoooms.rooms.push(tag);

return tags;
}, [])
```

Finally, we map this to a list item inside our unordered list. 

##### Navigating the video

We now have our video on the left and our tags in an unordered list on the right. Each list item wraps a button with an `onclick` method. This is where we will navigate the video. Remember the `tag.start_time_offset` field, this field tells us at what time in the video the room is shown. We're going to use this to seek the video player. When a user clicks on a button for a certain room we will set the video's `currentTime` to the `start_time_offset`

```js
playerRef.current.currentTime =room.start_time_offset;
```

You can go even further and add navigation markers to the video's progress bar using [video.js](https://videojs.com/) and [video.js marker plugin](https://www.npmjs.com/package/videojs-marker-plugin), but I won't get into that.

Congratulations~ You made it to the end of the tutorial. You can find the full code here.