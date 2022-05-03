import React, { useState } from 'react';
import { login } from '../../actions/auth';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import './style.css';

const Login = ({ login, isAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (username !== '' && password !== '') {
      login(username, password);
    }
  };

  if (isAuthenticated) {
    return <Redirect to='/' />;
  }

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-sm-9 col-md-7 col-lg-5 mx-auto mt-5'>
          <div className='card card-signin my-5'>
            <div className='card-body'>
              <h5 className='card-title text-center'>Sign In</h5>
              <form className='form-signin' onSubmit={onSubmit}>
                <div className='form-label-group'>
                  <input
                    type='email'
                    id='inputEmail'
                    className='form-control'
                    placeholder='Email address'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                  <label htmlFor='inputEmail'>Email address</label>
                </div>

                <div className='form-label-group'>
                  <input
                    type='password'
                    id='inputPassword'
                    className='form-control'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label htmlFor='inputPassword'>Password</label>
                </div>
                <button
                  className='btn btn-lg btn-info btn-block text-uppercase'
                  type='submit'
                >
                  Sign in
                </button>
                <hr className='my-4' />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { login })(Login);
