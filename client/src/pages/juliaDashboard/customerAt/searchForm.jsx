import React, { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import startOfDay from "date-fns/startOfDay";
import format from "date-fns/format";
import XLSX from "xlsx";
import axios from "axios";
import { FiChevronRight } from "react-icons/fi";
import { SiMicrosoftexcel } from "react-icons/si";
import { endOfDay } from "date-fns/esm";



const SearchForm = ({callBacks, setCallBacks}) => {
 
  const callback =  useMemo(() => callBacks.filter((e) =>{ if(e.assignedTo) return e } ) || [],[callBacks]);

    const ExportExcel = async () => {
        const newItem = callback.map((e) => ({
          //Creating the structure for the excel file from the data
          Name: e.name,
          Phone: e.phone,
          Reason: e.text,
          CallerID: e.callerID,
          RequestTime: format(new Date(e.requestTime), "dd/MM/yyyy hh:mm:ss aaaa"),
          AssignationTime: format(new Date(e.assignationTime), "dd/MM/yyyy hh:mm:ss aaaa"),
          Tag: e.tag,
          AssignedTo: e.assignedTo

        }));

        const ws = XLSX.utils.json_to_sheet(newItem); //Convert Json(data) to Excel work sheet
        const wb = XLSX.utils.book_new(); //Create a new Excel Workbook(like a folder)
        XLSX.utils.book_append_sheet(wb, ws, "Lista"); //Assign a name to the Excel sheet and putting it inside the Workbook
        XLSX.writeFile(wb, "Data importada.xlsx"); //Exporting the workbook with the data as an Excel file.
    };
      const [startDate, setStartDate] = useState(startOfDay(new Date()));
      const [endDate, setEndDate] = useState(endOfDay (new Date()));

      const filterData = () => {
        var config = {
          method: 'get',
          url: `/api/twilio/callback/${startDate}/${endDate}`,
        };
        
        axios(config)
        .then(function (response) {
            setCallBacks(response.data.callback)
        })
        .catch(function (error) {
          console.log(error);
        });
      }

    return ( 

      <div
        className="row"
        style={{
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <div
          className="DateFilterContainer"
          style={{
            display: "flex",
            width:"50%",
            flexwrap: "nowrap",
            minWidth: "auto",
            justifyContent: "space-between",
            marginLeft: "1rem",
            paddingRight: "1rem",
          }}
        >
          <span style={{ margin: "10px 1rem 0rem 10px" }}>From:</span>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="MMMM d, yyyy"
            className="form-control"
          />
          
          <span style={{ margin: "10px 1rem 0rem 1rem" }}>To:</span>
          <DatePicker
            selected={endDate}
            style={{}}
            onChange={(date) => setEndDate(date)}
            dateFormat="MMMM d, yyyy"
            className="form-control"
          />
    
              <div
                className="btn-container"
                style={{
                  display: "flex",
                  flexwrap: "nowrap",
                  alignItems: "flex-start",
                  width: "50%",
                }}
              >
                <button
                  style={{
                    display: "inline",
                    alignSelf: "flex-start",
                    marginLeft: "0rem",
                    marginRight: "1rem",
                    padding: "0.3rem 1.5rem",
                  }}
                  className="btn btn-info ml-2"
                  onClick={() => filterData()}>
                  <FiChevronRight style={{}} size={25} />
                  </button>
  
                <button
                  style={{
                    display: "inline",
                    alignSelf: "flex-start",
                    marginLeft: "0rem",
                    marginRight: "1rem",
                    padding: "0.3rem 1.5rem",
                    backgroundColor:"#00820E"
                  }}
                  className="btn"
                  onClick={() => ExportExcel()}>
                      <SiMicrosoftexcel style={{color: "white"}} size={22}/>
                </button>
              </div>
        </div>
      </div>
    );
}

export default SearchForm;