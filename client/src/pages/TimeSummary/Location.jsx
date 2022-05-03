import React, { useState, useEffect } from "react";
import { FiUser } from "react-icons/fi";
import { getLocations } from "../../actions/timeSummary";
import format from "date-fns/format";
import MapGL, { Marker } from "react-map-gl";

const Location = () => {
  const [locations, setLocations] = useState([]);
  const [viewport, setViewport] = useState({
    width: "100%",
    height: 1000,
    latitude: 18.46082902910442,
    longitude: -69.92538720117118,
    zoom: 4,
  });

  const _getLocations = async () => {
    const res = await getLocations();
    setLocations(res);
  };

  useEffect(() => {
    if (!locations.length) {
      _getLocations();
    }
  }, []);

  const CustomeMarker = (props) => {
    const { longitude, latitude, timestamp, activity, user } = props;

    return (
      <Marker
        latitude={latitude}
        longitude={longitude}
        offsetLeft={-70}
        offsetTop={-20}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "5px",
              background: "blue",
              borderRadius: "50%",
              width: "40px",
              marginBottom: "4px",
            }}
          >
            <FiUser style={{}} size={30} color="white" />
          </div>
          <span className="badge bg-dark text-white">{user}</span>
          <span className="badge bg-dark text-white">{activity}</span>
          <span className="badge bg-dark text-white">
            {format(new Date(timestamp), "HH:mm dd/MM")}
          </span>
        </div>
      </Marker>
    );
  };

  const markers = React.useMemo(
    () =>
      locations.map((e) => (
        <CustomeMarker
          longitude={parseFloat(e.location?.longitude)}
          latitude={parseFloat(e.location?.latitude)}
          timestamp={e.timestamp}
          activity={e.activity}
          user={e._id}
        />
      )),
    [locations]
  );

  return (
    <MapGL
      {...viewport}
      mapboxApiAccessToken="pk.eyJ1IjoiaXZhbmhlcmQiLCJhIjoiY2p6bjN6MXM4MDA2ODNicTViaWQ5ZXQyayJ9.bkP15xMXwr_U0iY0JGyBFQ"
      onViewportChange={(nextViewport) => setViewport(nextViewport)}
      mapStyle="mapbox://sprites/mapbox/streets-v8"
    >
      {markers}
    </MapGL>
  );
};

export default Location;
