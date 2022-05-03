import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import tags from '../../../utils/tags'
import axios from 'axios';


const url = '/api/users/emails';

const customStyles = {
  content: {
    overflow: 'visible',
    margin: "auto",
    width: "35%",
    height: "45%",
    border: "5px solid navy",
    padding: "20px",
      
  },
};
 
const options = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
];

Modal.setAppElement('#root');

const ModalCallbacks = ({id, text, phone, name, setCallBacks,setIsOpen,modalIsOpen} ) => {


    const [language, setLanguage] = useState('');
    const [tag, setTag] = useState('');
    const [member, setMember] = useState([]);
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [error, setError] = useState(false);


 

    const updateData = async() => {

      if( !member || !tag || member.length === 0 ){

        setError(true)
        setTimeout(() => {
          setError(false)
        }, 3000);

        return;

      }

      const data = JSON.stringify({
        "assignedTo": member.label,
        "tag": tag.label,
        "assignationTime": new Date()
      });
      
      const config = {
        method: 'put',
        url: `/api/twilio/callback/${id}`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
      axios(config)
      .then(function () {
        sendCallback()
        
      })
      .catch(function (error) {
        console.log(error);
      });
  
    }
    const sendCallback = () => { 

      
      var data = JSON.stringify({
        "name": name ,
        "text": text ,
        "phone": phone ,
        "email": member.label,
        "tag": tag.label,
        "language": language.label
      });
      
      var config = {
        method: 'post',
        url: '/api/twilio/callback',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
        axios(config)
        .then(function () {
          closeModal()
          setCallBacks((preState) => preState.filter((e) => e._id !== id ) )
          setMember('');
          setTag('');
        })
        .catch(function (error) {
          console.log(error);
      });
    }

    const mapMembers = members.map((e) => {
      e.label = e.email
      return e;
    })

useEffect(() => {
  async function getMembers() {
   await axios
      .get(url) 
      .then((response) => {
        setMembers(response.data);
        setLoadingMembers(false);
      });
  }
  if (loadingMembers) {
    getMembers();
  }
}, [])
    
  function closeModal() {
    setMember([]);
    setTag('');
    setIsOpen(false);
  }

  return (
     
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        // style={{height: "50px"}}
        >
      <div>
       <form>
        <h3 className="mt-2 text-center" style={{color:"navy"}}>Select Member</h3>
        <Select 
            className="mt-2"
            value={member}
            onChange={(value) => setMember(value)}
            options={mapMembers} />

        <h3  className="text-center mt-4"style={{color:"navy"}}>Select Tag</h3>
        <Select
            className="mt-2"
            value={tag}
            onChange={(value) => setTag(value) }
            options={tags} />

        <h3 className="text-center mt-4"style={{color:"navy"}}>Select Language</h3>
        <Select
            className="mt-2"
            value={language}
            onChange={(value) => setLanguage(value) }
            options={options} />
        </form>
        {error === true &&
        <div style={{height:"0px"}}>
        <p className="text-danger text-center" style={{color:"navy"}}>Debe completar ambos campos</p>
        </div>}
        <div style={{display:"flex", marginTop:"30px"}}>
       
        <button type="button"
                 style={{
                  margin: "auto",
                  width: "35%",
                  height: "35%",
                  padding: "10px",
                }} 
                className="btn btn-info"  
                onClick={updateData}>Assign</button>
       <button type="submit" 
        style={{
          margin: "auto",
          width: "35%",
          height: "35%",
          padding: "10px",
        }} 
                className="btn btn-danger" 
                onClick={closeModal}>Close</button>
                
        </div>
     </div>
      </Modal>
  );
}


export default ModalCallbacks;
