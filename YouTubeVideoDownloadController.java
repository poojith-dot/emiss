import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class YouTubeVideoDownloadController {
    @GetMapping("/")
    public String index() {
        return "index";
    }

    @PostMapping("/download")
    public String downloadVideo(@RequestParam("videoUrl") String videoUrl) throws Exception {
        String outputDir = "downloads"; // Change to your desired output directory
        YouTubeVideoDownloader.downloadVideo(videoUrl, outputDir);
        return "download-success";
    }
}
