const youtubeLinkInput = document.getElementById('youtube-link');
const downloadBtn = document.getElementById('download-btn');
const downloadPathInput = document.getElementById('download-path');
const browseBtn = document.getElementById('browse-btn');

downloadBtn.addEventListener('click', async () => {
    const youtubeLink = youtubeLinkInput.value.trim();
    if (!youtubeLink) {
        alert('Please enter a YouTube video link');
        return;
    }

    const downloadPath = downloadPathInput.value.trim();
    if (!downloadPath) {
        alert('Please choose a download path');
        return;
    }

    try {
        const videoId = getYoutubeVideoId(youtubeLink);
        const videoTitle = await getVideoTitle(videoId);
        const videoUrl = await getVideoUrl(videoId);

        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `${videoTitle}.mp4`;
        a.click();
    } catch (error) {
        console.error(error);
        alert('Error downloading video');
    }
});

browseBtn.addEventListener('click', () => {
    const folderPicker = document.createElement('input');
    folderPicker.type = 'file';
    folderPicker.directory = true;
    folderPicker.webkitdirectory = true;

    folderPicker.addEventListener('change', () => {
        const filePath = folderPicker.files[0].path;
        downloadPathInput.value = filePath;
    });

    folderPicker.click();
});

function getYoutubeVideoId(youtubeLink) {
    const regex = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:v=([^&]+))?$/;
    const match = youtubeLink.match(regex);
    return match && match[1];
}

async function getVideoTitle(videoId) {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    const data = await response.json();
    return data.title;
}

async function getVideoUrl(videoId) {
    const response = await fetch(`https://www.youtube.com/get_video_info?video_id=${videoId}`);
    const data = await response.json();
    const videoUrl = data.url;
    return videoUrl;
}
