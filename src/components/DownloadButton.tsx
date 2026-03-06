const DownloadButton = ({ jobId }) => {

    const handleDownload = async () => {
        const response = await fetch(`/api/job/${jobId}/download`);

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `job_${jobId}_result.csv`;
        a.click();
    };

    return (
        <button onClick={handleDownload}>
            Download Result
        </button>
    );
};

export default DownloadButton;