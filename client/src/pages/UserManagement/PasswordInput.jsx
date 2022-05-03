import React from 'react';
import { useState } from 'react';
import { RiEyeFill } from 'react-icons/ri';
import { RiEyeCloseLine } from 'react-icons/ri';

const PasswordInput = ({ value, setValue, placeholder }) => {
  const [hidden, setHidden] = useState(true);

  const toggleShow = () => {
    setHidden(!hidden);
  };

  return (
    <div className='input-group'>
      <input
        type={hidden ? 'password' : 'text'}
        className='form-control'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      ></input>
      <div className='input-group-append' onClick={toggleShow}>
        <span className='input-group-text'>
          {hidden ? <RiEyeCloseLine /> : <RiEyeFill />}
        </span>
      </div>
    </div>
  );
};

export default PasswordInput;
