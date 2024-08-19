import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.videoio.VideoCapture;
import org.opencv.videoio.VideoWriter;

@RestController
public class VideoAnalyzerController {

    @PostMapping("/analyze")
    public ResponseEntity<List<String>> analyzeVideo(@RequestParam String url) throws IOException {
        List<String> shortClipUrls = generateShortClips(url);
        return ResponseEntity.ok(shortClipUrls);
    }

    private List<String> generateShortClips(String youtubeUrl) {
        List<String> shortClipUrls = new ArrayList<>();

        // Load OpenCV library
        System.loadLibrary(Core.NATIVE_LIBRARY_NAME);

        // Create VideoCapture object
        VideoCapture capture = new VideoCapture(youtubeUrl);

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

        return shortClipUrls;
    }

    private String saveShortClip(String youtubeUrl, VideoWriter writer, VideoCapture capture, int frameCount, int frameWidth, int frameHeight, int fps) {
        // Create output video URL
        String shortClipUrl = youtubeUrl + "?start=" + (capture.get(VideoCapture.PROP_POS_FRAMES) - frameCount) + "&end=" + capture.get(VideoCapture.PROP_POS_FRAMES);

        // Open VideoWriter
        writer.open(shortClipUrl, VideoWriter.fourcc('M', 'J', 'P', 'G'), fps, new Size(frameWidth, frameHeight));

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

        return shortClipUrl;
    }
}
