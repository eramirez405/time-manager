import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import HomeTable from "./home/homeTable";
import CostumerTable from "./customerAt/costumerTable";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { socket } from "../../utils/socket";

import 'react-tabs/style/react-tabs.css';
const api_callBacks = "/api/twilio/callback";

const JuliaDashBoard = () => {
    const [loadingCallBacks, setLoadingCallBacks] = useState(true);
    const [callBacks, setCallBacks] = useState([]);


    const data =  useMemo(() => callBacks.filter((e) =>{ if(!e.assignedTo) return e } ) || [],[callBacks]);

    useEffect(() => {
        socket.on("call", data => {
          setCallBacks((preState) => [...preState, data])
        });
      }, []);
    useEffect(() => {
        async function getCallBacks() {
         await axios
            .get(api_callBacks) 
            .then((response) => {
              setCallBacks(response.data.callback);
              setLoadingCallBacks(false);
            });
        }
        if (loadingCallBacks) {
          getCallBacks();
        }
      }, []);
  return (
      <>
 <div className="container-fluid">
  <Tabs >
    <TabList style={{
        fontWeight:"bold"
    }}> 
       <Tab>Dashboard ({data.length})</Tab>
       <Tab>Costumer Attendant</Tab>
    </TabList>
      <TabPanel>
        <HomeTable callBacks={callBacks} setCallBacks={setCallBacks} />
         </TabPanel>
       <TabPanel>
     <CostumerTable />
    </TabPanel>
  </Tabs>
    </div>

    </>
  );
};

export default JuliaDashBoard;
