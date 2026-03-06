const ShareButton = ({ jobId }) => {

    const shareLink = `${window.location.origin}/job/${jobId}`;

    const copyLink = () => {
        navigator.clipboard.writeText(shareLink);
        alert("Link copied");
    };

    return (
        <button onClick={copyLink}>
            Share
        </button>
    );
};

export default ShareButton;