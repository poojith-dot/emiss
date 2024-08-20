import com.github.kotlinstdlib.youtube.YoutubeDL;
import com.github.kotlinstdlib.youtube.YoutubeVideo;

public class YouTubeVideoDownloader {
    public static void downloadVideo(String videoUrl, String outputDir) throws Exception {
        // Extract video ID from URL
        String videoId = videoUrl.substring(videoUrl.lastIndexOf("=") + 1);

        // Create a YouTubeDL instance
        YoutubeDL youtubeDL = new YoutubeDL();

        // Get the video metadata
        YoutubeVideo video = youtubeDL.getVideo(videoId);

        // Get the download URL
        String downloadUrl = video.getDownloadUrl();

        // Download the video
        youtubeDL.download(downloadUrl, outputDir + "/" + video.getTitle() + ".mp4");
    }
}
