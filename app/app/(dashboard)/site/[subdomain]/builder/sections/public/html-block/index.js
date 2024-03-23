"use client";

function HtmlBlock({ id, data }) {
  return (
    <div
      key={id}
      className="group relative flex h-full min-h-[50px] w-full items-center justify-center"
    >
      <div
        className="h-full w-full"
        dangerouslySetInnerHTML={{ __html: data?.content?.value }}
      />
    </div>
  );
}

export default HtmlBlock;
