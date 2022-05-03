import React from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import PropTypes from "prop-types";
import { FiCircle, FiPauseCircle, FiMinusCircle } from "react-icons/fi";
import format from "date-fns/format";
import "../../index.css";

const Timeline = (workerActivityEvent) => {
  // workerActivityEvent.forEach((e) => {
  //   console.log(e);
  // });
  //console.log(workerActivityEvent);

  const ActEvent = Object.values(workerActivityEvent).flat(); //workerActivityEvent se recibe como Object
  //console.log(ActEvent);

  return (
    <>
      <VerticalTimeline>
        {ActEvent?.map((e) => {
          return (
            <>
              {e.WorkerActivityName === "Available" && (
                <VerticalTimelineElement
                  className="vertical-timeline-element--work"
                  contentStyle={{ background: "#000000", color: "#fff" }}
                  contentArrowStyle={{ borderRight: "7px solid  rgb(0, 0, 0)" }}
                  date="2011 - present"
                  iconStyle={{ background: "#000000", color: "#72fd00" }}
                  icon={<FiCircle fill="green" />}
                >
                  <h3 className="vertical-timeline-element-title">
                    {e.WorkerActivityName}
                  </h3>
                  <h5 className="vertical-timeline-element-subtitle">
                    At: {format(new Date(e?.createdAt), "h:mm")}
                  </h5>
                  <p>{e.EventDescription}</p>
                </VerticalTimelineElement>
              )}

              {e.WorkerActivityName === "Break" && (
                <VerticalTimelineElement
                  className="vertical-timeline-element--work"
                  contentStyle={{ background: "#000000", color: "#fff" }}
                  contentArrowStyle={{ borderRight: "7px solid  rgb(0, 0, 0)" }}
                  date="2011 - present"
                  iconStyle={{ background: "#000000", color: "yellow" }}
                  icon={<FiPauseCircle fill="orange" />}
                >
                  <h3 className="vertical-timeline-element-title">
                    {e.WorkerActivityName}
                  </h3>
                  <h5 className="vertical-timeline-element-subtitle">
                    At: {format(new Date(e?.createdAt), "h:mm")}
                  </h5>
                  <p>{e.EventDescription}</p>
                </VerticalTimelineElement>
              )}

              {e.WorkerActivityName === "Unavailable" && (
                <VerticalTimelineElement
                  className="vertical-timeline-element--work"
                  contentStyle={{ background: "#000000", color: "#fff" }}
                  contentArrowStyle={{ borderRight: "7px solid  rgb(0, 0, 0)" }}
                  date="2011 - present"
                  iconStyle={{ background: "#000000", color: "#ffc0cb" }}
                  icon={<FiMinusCircle fill="red" />}
                >
                  <h3 className="vertical-timeline-element-title">
                    {e.WorkerActivityName}
                  </h3>
                  <h5 className="vertical-timeline-element-subtitle">
                    At: {format(new Date(e?.createdAt), "h:mm")}
                  </h5>
                  <p>{e.EventDescription}</p>
                </VerticalTimelineElement>
              )}

              {e.WorkerActivityName === "Offline" && (
                <VerticalTimelineElement
                  className="vertical-timeline-element--work"
                  contentStyle={{ background: "#000000", color: "#fff" }}
                  contentArrowStyle={{ borderRight: "7px solid  rgb(0, 0, 0)" }}
                  date="2011 - present"
                  iconStyle={{ background: "#000000", color: "gray" }}
                  icon={<FiMinusCircle fill="#3b3b3b" />}
                >
                  <h3 className="vertical-timeline-element-title">
                    {e.WorkerActivityName}
                  </h3>
                  <h5 className="vertical-timeline-element-subtitle">
                    At: {format(new Date(e?.createdAt), "h:mm")}
                  </h5>
                  <p>{e.EventDescription}</p>
                </VerticalTimelineElement>
              )}
            </>
          );
        })}
      </VerticalTimeline>
    </>
  );
};

Timeline.propTypes = {
  workerActivityEvent: PropTypes.array.isRequired,
};

export default Timeline;
