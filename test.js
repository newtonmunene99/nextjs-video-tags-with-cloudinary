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
