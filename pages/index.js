import Head from "next/head";
import { useState, useRef, MutableRefObject } from "react";
import "../utils/typedef";

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
                  <source
                    src={video.secure_url + "?ap=em"}
                    type={`video/${video.format}`}
                  />
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
                        (tag) =>
                          tag.categories.includes("room") ||
                          tag.tag.includes("room")
                      )
                      .reduce((tags, tag) => {
                        /**
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
}
