
import React, { Component, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import Button from '@material-ui/core/Button';

import { AiOutlineArrowRight } from "react-icons/ai";

export default ({text1,setText1}) => {

    
  //console.log("ver que trae");
    //console.log(text1,);


    return (

<form>
<div style={{
          display: "flex",
          width: "50%",
          justifycontent: "center",
          alignitems: "center",
          marginLeft:"200px"
        }}>
<div >
     <label>
     cantidad de deals:
    <input type="text" name="name" value={text1} onChange={(e)=> setText1(e.target.value)}/>
    
  </label>  
  </div>
  <br/>
  <br/>
  <div style={{marginLeft:"10px"}}>
      <label>
    gt:
    <input type="text" name="name" />
      </label>
  </div>
  <div style={{marginLeft:"10px"}}>
      <label>
     lte:
    <input type="text" name="name" />
      </label>
  </div>
  
    
</div>

 
</form>


    );
};