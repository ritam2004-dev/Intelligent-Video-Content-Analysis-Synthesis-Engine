import React, { useEffect, useRef, useState } from "react";
import api from "./api";

export default function App() {
  const uploadBoxRef = useRef(null);
  const videoUploadRef = useRef(null);
  const videoPlayerRef = useRef(null);

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");

  const [previewURL, setPreviewURL] = useState(null);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState("");

  const [showResults, setShowResults] = useState(false);

  const [summaryHTML, setSummaryHTML] = useState(null);

  const [loadingSummarize, setLoadingSummarize] = useState(false);

  // Capture the element at effect run-time to avoid React ref change warning
  useEffect(() => {
    const videoElement = videoPlayerRef.current;

    return () => {
      if (videoElement && videoElement.src) {
        try {
          URL.revokeObjectURL(videoElement.src);
        } catch (e) {
          console.error("Error revoking object URL:", e);
        }
      }
    };
  }, []);

  // Revoke previous previewURL when it changes / component unmounts
  useEffect(() => {
    const prev = previewURL;
    return () => {
      if (prev) {
        try {
          URL.revokeObjectURL(prev);
        } catch (e) {
          console.error("Error revoking object URL:", e);
        }
      }
    };
  }, [previewURL]);

  function handleBrowseClick() {
    videoUploadRef.current && videoUploadRef.current.click();
  }

  function onFileChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      handleFile(f);
    }
  }

  function handleFile(f) {
    if (f && f.type && f.type.startsWith("video/")) {
      if (previewURL) {
        try {
          URL.revokeObjectURL(previewURL);
        } catch (e) {
          console.error("Error revoking object URL:", e);
        }
      }

      setFile(f);
      setFileName(f.name);

      const fileURL = URL.createObjectURL(f);
      setPreviewURL(fileURL);
    } else {
      setFile(null);
      setFileName("Please select a valid video file.");
      if (previewURL) {
        try {
          URL.revokeObjectURL(previewURL);
        } catch (e) {
          console.error("Error revoking object URL:", e);
        }
        setPreviewURL(null);
      }
    }
  }

  function onDragOver(e) {
    e.preventDefault();
    uploadBoxRef.current?.classList.add("border-blue-500", "bg-slate-50");
  }
  function onDragLeave() {
    uploadBoxRef.current?.classList.remove("border-blue-500", "bg-slate-50");
  }
  function onDrop(e) {
    e.preventDefault();
    uploadBoxRef.current?.classList.remove("border-blue-500", "bg-slate-50");
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  }

  function seekVideo(time) {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = time;
      videoPlayerRef.current.play();
    }
  }

  function simulateProcessing() {
    const steps = [
      { percent: 10, text: "Uploading video..." },
      { percent: 25, text: "Extracting audio..." },
      { percent: 50, text: "Transcribing speech to text..." },
      { percent: 75, text: "Analyzing content..." },
      { percent: 90, text: "Generating summaries..." },
      { percent: 100, text: "Done!" },
    ];

    setProcessing(true);
    setProgress(0);
    setProgressStep("");

    let current = 0;
    const interval = setInterval(() => {
      if (current >= steps.length) {
        clearInterval(interval);
        setProcessing(false);
        return;
      }
      const st = steps[current];
      setProgress(st.percent);
      setProgressStep(st.text);
      current++;
    }, 1000);
  }

  // --- API summarization (adapted to your backend /process-video) ---
  const handleSummarizeAPI = async () => {
    if (!file) {
      alert("Please upload a video file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Show the results area and loader immediately so user sees progress
    setShowResults(true);
    setLoadingSummarize(true);

    try {
      // Send request (long timeout for heavy processing)
      const res = await api.post("/process-video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 10 * 60 * 1000, // 10 minutes — adjust if needed
      });

      const data = res.data || {};
      setSummaryHTML(data.summary || "No summary returned from server.");
    } catch (e) {
      console.error("Summarize API error:", e);
      if (e?.response?.data) {
        // server returned an error payload
        setSummaryHTML(`Server error: ${JSON.stringify(e.response.data)}`);
      } else {
        setSummaryHTML(
          "Network error or server did not respond. Check console."
        );
      }
    } finally {
      // hide loader (keep results visible and interactive)
      setLoadingSummarize(false);
      // reset simple progress UI if it was used
      setProcessing(false);
      setProgress(100);
      setProgressStep("Done!");
    }
  };

  // Single button handler — non-blocking UI
  async function onSummarizeClick() {
    // show results panel with loader, then fetch
    await handleSummarizeAPI();
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          AI Video Summarizer
        </h1>
        <p className="text-slate-600 mt-2">
          Upload a video to get a smart summary, key moments, and more.
        </p>
      </header>

      <main id="main-content">
        {/* Upload Section */}
        {!processing && !showResults && (
          <div
            id="upload-section"
            className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-slate-200"
          >
            <h2 className="text-xl font-semibold mb-4 text-slate-800">
              1. Start Here
            </h2>
            <div
              id="upload-box"
              ref={uploadBoxRef}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
              onClick={handleBrowseClick}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <input
                type="file"
                id="video-upload"
                ref={videoUploadRef}
                className="hidden"
                accept="video/*"
                onChange={onFileChange}
              />
              <div className="flex flex-col items-center">
                <svg
                  className="w-12 h-12 text-slate-400 mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <p className="font-semibold text-slate-700">
                  Click to browse or drag & drop your video file
                </p>
                <p id="file-name" className="text-sm text-slate-500 mt-1">
                  {fileName}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-slate-800 mb-3">
                2. Configure Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="summary-length"
                    className="block text-sm font-medium text-slate-600 mb-1"
                  >
                    Summary Length
                  </label>
                  <select
                    id="summary-length"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="short">Short</option>
                    <option value="medium" defaultValue>
                      Medium
                    </option>
                    <option value="long">Detailed</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="summary-style"
                    className="block text-sm font-medium text-slate-600 mb-1"
                  >
                    Summary Style
                  </label>
                  <select
                    id="summary-style"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="general" defaultValue>
                      General
                    </option>
                    <option value="business">Business-focused</option>
                    <option value="student">Student-focused</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                id="summarize-btn"
                className={`bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all shadow-sm ${
                  !file
                    ? "disabled:bg-slate-400 disabled:cursor-not-allowed"
                    : ""
                }`}
                disabled={!file}
                onClick={onSummarizeClick}
              >
                Summarize Video
              </button>
            </div>
          </div>
        )}

        {/* Processing Section — you can still use this if desired */}
        {processing && (
          <div
            id="processing-section"
            className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 mt-8"
          >
            <div className="flex items-center justify-center flex-col">
              <div className="loader"></div>
              <p
                id="progress-text"
                className="mt-4 font-semibold text-slate-700"
              >
                Processing your video...
              </p>
              <div className="w-full bg-slate-200 rounded-full h-2.5 mt-4">
                <div
                  id="progress-bar"
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p id="progress-step" className="text-sm text-slate-500 mt-2">
                {progressStep}
              </p>
            </div>
          </div>
        )}

        {/* Results Section: Summary only */}
        {showResults && (
          <div id="results-section" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Video Player */}
              <div className="lg:col-span-1 bg-white p-4 rounded-2xl shadow-md border border-slate-200 h-fit">
                <h2 className="text-xl font-semibold mb-4 text-slate-800">
                  Video Preview
                </h2>
                <video
                  id="video-player"
                  className="w-full rounded-lg"
                  controls
                  ref={videoPlayerRef}
                  src={previewURL || undefined}
                />
              </div>

              {/* Right Column: Summary only */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Summary
                  </h2>
                </div>

                {/* Loader while summary is loading */}
                {loadingSummarize ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="loader"></div>
                    <p className="mt-4 font-semibold text-slate-700">
                      Loading summary...
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      This may take a while depending on video length — please
                      don't close the tab.
                    </p>
                  </div>
                ) : (
                  <div
                    id="content-text"
                    className="space-y-4 custom-scrollbar"
                    style={{ maxHeight: 500, overflowY: "auto" }}
                  >
                    <p className="text-slate-600 leading-relaxed">
                      {summaryHTML ||
                        "Your paragraph summary will appear here. It will be a concise overview of the video's content."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
