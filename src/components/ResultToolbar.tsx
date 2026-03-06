import DownloadButton from "./DownloadButton";
import ShareButton from "./ShareButton";

const ResultToolbar = ({ jobId }) => {

    return (
        <div className="flex gap-4">

            <DownloadButton jobId={jobId} />
            <ShareButton jobId={jobId} />

        </div>
    )
}

export default ResultToolbar;