/**
 * A common component to display a carousel of media.
 * Uses react-slick for the carousel.
 *
 * Currently displaying only list of post attachments. If needed
 * for other use cases, this component should be configured accordingly.
 */

"use client";

// React Slick carousel
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Attachment } from "@prisma/client";
import Image from "next/image";
import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const getAttachmentToRender = (attachment: Attachment) => {
  if (attachment.type === "IMAGE") {
    return (
      <Image
        src={attachment.url}
        alt="Attachment"
        width={500}
        height={500}
        className="mx-auto size-fit max-h-[20rem] min-h-[20rem] rounded-2xl"
      />
    );
  }

  if (attachment.type === "VIDEO") {
    return (
      <div>
        <video
          src={attachment.url}
          controls
          className="mx-auto size-fit max-h-[20rem] min-h-[20rem] rounded-2xl object-cover"
        />
      </div>
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
};

// This is a very simple carousel component. Customize as needed.
export default function MediaCarousel({
  attachments,
}: {
  attachments: Array<Attachment>;
}) {
  // React Slick does not support TypeScript yet. Hence, using any for the ref.
  const sliderRef = React.useRef<any>(null);

  const carouselSettings = {
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="relative">
      {attachments.length > 1 ? (
        <>
          <div
            className="cursor-pointer absolute top-1/2 left-0 p-2 bg-primary rounded-full z-10 hover:opacity-80"
            onClick={() => sliderRef?.current?.slickPrev()}
          >
            <ArrowLeft className="text-white size-4" />
          </div>
          <Slider {...carouselSettings} className="w-full" ref={sliderRef}>
            {React.Children.toArray(
              attachments.map((attachment) => (
                <>{getAttachmentToRender(attachment)}</>
              ))
            )}
          </Slider>
          <div
            className="cursor-pointer absolute top-1/2 right-0 p-2 bg-primary rounded-full z-10 hover:opacity-80"
            onClick={() => sliderRef?.current?.slickNext()}
          >
            <ArrowRight className="text-white size-4" />
          </div>
        </>
      ) : (
        <>{getAttachmentToRender(attachments[0])}</>
      )}
    </div>
  );
}
