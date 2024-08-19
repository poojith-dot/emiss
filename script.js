import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.videoio.VideoCapture;
import org.opencv.videoio.VideoWriter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
@RestController
public class VideoAnalyzer {

    public static void main(String[] args) {
        SpringApplication.run(VideoAnalyzer.class, args);
    }

    @PostMapping("/analyze")
    public ResponseEntity<List<String>> analyzeVideo(@RequestParam String url) {
        try {
            List<String> shortClipUrls = generateShortClips(url);
            return ResponseEntity.ok(shortClipUrls);
        } catch (Exception e) {
            System.out.println("Error analyzing video: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    private List<String> generateShortClips(String youtubeUrl) throws IOException {
        System.out.println("Starting video analysis...");
        List<String> shortClipUrls = new ArrayList<>();

        // Load OpenCV library
        System.loadLibrary(Core.NATIVE_LIBRARY_NAME);
        System.out.println("OpenCV library loaded...");

        // Create VideoCapture object
        VideoCapture capture = new VideoCapture(youtubeUrl);
        System.out.println("VideoCapture object created...");

        // Check if video is opened
        if (!capture.isOpened()) {
            System.out.println("Error opening video");
            return shortClipUrls;
        }

        // Get video properties
        int frameWidth = (int) capture.get(VideoCapture.PROP_FRAME_WIDTH);
        int frameHeight = (int) capture.get(VideoCapture.PROP_FRAME_HEIGHT);
        int fps = (int) capture.get(VideoCapture.PROP_FPS);

        // Create VideoWriter object for short clips
        VideoWriter writer = new VideoWriter();

        // Initialize variables for scene detection
        Mat previousFrame = new Mat();
        Mat currentFrame = new Mat();
        Mat difference = new Mat();

        // Capture first frame
        capture.read(previousFrame);

        int frameCount = 0;
        int threshold = 2000; // Adjust this value for scene detection

        while (capture.read(currentFrame)) {
            // Convert frames to grayscale
            Core.cvtColor(previousFrame, previousFrame, Core.COLOR_BGR2GRAY);
            Core.cvtColor(currentFrame, currentFrame, Core.COLOR_BGR2GRAY);

            // Calculate absolute difference
            Core.absdiff(previousFrame, currentFrame, difference);

            // Count non-zero pixels
            int nonZeroCount = Core.countNonZero(difference);

            // Detect scene change
            if (nonZeroCount > threshold) {
                // Save previous clip (if any)
                if (frameCount > 0) {
                    String shortClipUrl = saveShortClip(youtubeUrl, writer, capture, frameCount, frameWidth, frameHeight, fps);
                    shortClipUrls.add(shortClipUrl);
                }
                frameCount = 0; // Reset frame count
            }

            frameCount++;
            previousFrame.release();
            previousFrame = currentFrame.clone();
        }

        // Save last clip (if any)
        if (frameCount > 0) {
            String shortClipUrl = saveShortClip(youtubeUrl, writer, capture, frameCount, frameWidth, frameHeight, fps);
            shortClipUrls.add(shortClipUrl);
        }

        // Release resources
        capture.release();
        writer.release();
        previousFrame.release();
        currentFrame.release();
        difference.release();

        System.out.println("Video analysis completed.");
        return shortClipUrls;
    }

    private String saveShortClip(String youtubeUrl, VideoWriter writer, VideoCapture capture, int frameCount, int frameWidth, int frameHeight, int fps) throws IOException {
        // Create output video file
        File outputFile = File.createTempFile("short-clip", ".mp4");

        // Open VideoWriter
        writer.open(outputFile.getAbsolutePath(), VideoWriter.fourcc('M', 'J', 'P', 'G'), fps, new org.opencv.core.Size(frameWidth, frameHeight));

        // Write frames to output video
        for (int i = 0; i < frameCount; i++) {
            Mat frame = new Mat();
            capture.set(VideoCapture.PROP_POS_FRAMES, capture.get(VideoCapture.PROP_POS_FRAMES) - frameCount + i);
            capture.read(frame);
            writer.write(frame);
            frame.release();
        }

        // Release resources
        writer.release();

        System.out.println("Short clip saved to " + outputFile.getAbsolutePath());
        return outputFile.getAbsolutePath();
    }
}
