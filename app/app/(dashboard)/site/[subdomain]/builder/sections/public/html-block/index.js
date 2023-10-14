'use client'



function HtmlBlock({ id, data }) {

  return (
    <div key={id} className="min-h-[50px] h-full w-full relative group flex items-center justify-center">
      <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: data?.content?.value }} />
    </div>
  );
}

export default HtmlBlock;
