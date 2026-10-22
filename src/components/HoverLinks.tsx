import "./styles/style.css";

const HoverLinks = ({ text, cursor }: { text: string; cursor?: boolean }) => {
  return (
    <div className="hover-link" data-cursor={!cursor && `disable`}>
      <span className="hover-in">
        <span className="hover-label">{text}</span>
        <span className="hover-label hover-label-copy" aria-hidden="true">
          {text}
        </span>
      </span>
    </div>
  );
};

export default HoverLinks;
