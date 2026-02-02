const { Octokit } = require('@octokit/rest');
const fs = require('fs'); // Vercel එකේ default තියෙනවා

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // ඔයාගේ GitHub token එක environment variable එකකින් ගන්න (Vercel dashboard > Settings > Environment Variables > Add: GITHUB_TOKEN = ඔයාගේ token)
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    // Request එකෙන් file data ගන්න (multipart form use කරන්න frontend එකේ)
    const { file, filename, metadata } = req.body; // හෝ use formidable for file parsing if needed

    // File content base64 encode කරන්න
    const content = Buffer.from(file).toString('base64');

    // GitHub API call
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: 'bigunbimsara',
      repo: 'Fairyscript_-_subtitles',
      path: `subtitles/${filename}`, // subtitles folder එකට save වෙන්න
      message: 'New subtitle upload',
      content: content,
      branch: 'main', // ඔයාගේ default branch
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
};
