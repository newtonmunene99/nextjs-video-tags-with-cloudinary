import cloudinary from "../../utils/cloudinary";

export default async function videosController(req, res) {
  switch (req.method) {
    case "POST":
      try {
        const result = await handlePostRequest(req, res);
        return res.status(201).json({
          message: "Success",
          result,
        });
      } catch (error) {
        return res.status(400).json({
          message: "Error",
          error,
        });
      }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

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
        // Auto tagging threshold
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
