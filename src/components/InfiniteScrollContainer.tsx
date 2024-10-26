import React from "react";
import { useInView } from "react-intersection-observer";

interface InfiniteScrollContainerConfig extends React.PropsWithChildren {
  onBottomReached: () => void;
  className?: string;
}

export default function InfiniteScrollContainer({
  children,
  onBottomReached,
  className,
}: InfiniteScrollContainerConfig) {
  const { ref } = useInView({
    /**
     * This is the margin that the IntersectionObserver will use to determine when the element is in view.
     * We are using 200px as the margin. This means when the bottom of the element is 200px away from the viewport,
     * so we won't have to scroll all the way to the bottom to trigger the onBottomReached callback.
     */
    rootMargin: "200px",
    onChange: (inView) => {
      if (inView) {
        onBottomReached();
      }
    },
  });

  return (
    <div className={className}>
      {children}
      {/* Acts as a Sentinel component 
            (Sentinel - a soldier or guard whose job is to stand and keep watch; ) 

         The whole purpose of this div is to inform the IntersectionObserver when it is in view,
         which in turn will call the onBottomReached callback. THis way we can implement infinite scrolling.
        */}
      <div ref={ref}></div>
    </div>
  );
}
