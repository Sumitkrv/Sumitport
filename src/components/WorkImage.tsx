import { useEffect, useState } from "react";
import { MdArrowOutward } from "react-icons/md";

interface Props {
  image?: string;
  alt?: string;
  video?: string;
  link?: string;
}

const getPreviewUrl = (link: string) =>
  `https://image.thum.io/get/width/1200/crop/675/noanimate/${link}`;
const PREVIEW_CACHE = "portfolio-project-previews-v1";

const WorkImage = (props: Props) => {
  const [isVideo, setIsVideo] = useState(false);
  const [video, setVideo] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const previewUrl = props.link && !props.image ? getPreviewUrl(props.link) : undefined;
  const [imageSource, setImageSource] = useState(props.image || previewUrl);

  useEffect(() => {
    setImageFailed(false);
    setImageSource(props.image || previewUrl);

    if (!previewUrl || !("caches" in window)) {
      return;
    }

    let cancelled = false;

    const loadCachedPreview = async () => {
      try {
        const cache = await window.caches.open(PREVIEW_CACHE);
        let response = await cache.match(previewUrl);

        if (!response) {
          response = await fetch(previewUrl);
          if (!response.ok) {
            throw new Error(`Preview service returned ${response.status}`);
          }
          await cache.put(previewUrl, response.clone());
        }

        if (!cancelled) {
          setImageSource(previewUrl);
        }
      } catch {
        if (!cancelled) {
          setImageSource(previewUrl);
        }
      }
    };

    void loadCachedPreview();

    return () => {
      cancelled = true;
    };
  }, [props.image, previewUrl]);

  const handleMouseEnter = async () => {
    if (props.video) {
      setIsVideo(true);
      const response = await fetch(`src/assets/${props.video}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setVideo(blobUrl);
    }
  };

  const visual = (
    <>
      {imageSource && !imageFailed ? (
        <img
          src={imageSource}
          alt={`${props.alt} website preview`}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="work-fallback" aria-label={`${props.alt} project preview`}>
          <span>{props.alt?.slice(0, 2).toUpperCase()}</span>
          <strong>{props.alt}</strong>
          <small>Project preview</small>
        </div>
      )}
      {isVideo && <video src={video} autoPlay muted playsInline loop />}
    </>
  );

  return (
    <div className="work-image">
      {props.link ? (
        <a
          className="work-image-in"
          href={props.link}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setIsVideo(false)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${props.alt} website`}
          data-cursor="disable"
        >
          <div className="work-link">
            <span>Open project</span>
            <MdArrowOutward />
          </div>
          {visual}
        </a>
      ) : (
        <div className="work-image-in">{visual}</div>
      )}
    </div>
  );
};

export default WorkImage;
