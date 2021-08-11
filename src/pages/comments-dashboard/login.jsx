import axios from 'axios';
import { navigate } from 'gatsby';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getSessionStorageOrDefault } from '../../utilities/utilities';
import { container, formButton, formError, formInput } from './login.module.scss';
import FormInput from '../../components/FormInput';

export default function CommentsDashboardlogin() {
  const [serverState, setServerState] = useState({ ok: true, message: '' });
  const [sessionSecret, setSessionSecret] = useState(getSessionStorageOrDefault('id', false));
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    sessionStorage.setItem('id', JSON.stringify(sessionSecret));
  }, [sessionSecret]);

  const handleServerResponse = (ok, message) => {
    setServerState({ ok, message });
  };

  const onSubmit = async (data, event) => {
    try {
      setSubmitting(true);
      const { Email: email, Password: password } = data;
      const response = await axios({
        url: '/api/db-login',
        method: 'POST',
        data: {
          email,
          password,
        },
      });
      const { secret } = response.data;
      setSessionSecret(secret);
      setSubmitting(false);
      event.target.reset();
      navigate('/comments-dashboard/');
    } catch (error) {
      handleServerResponse(false, 'There was an error logging in.  Please try again.');
    }
  };

  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (sessionSecret) {
    navigate('/comments-dashboard/');
  }

  return (
    <>
      <h1>Login</h1>
      <form className={container} onSubmit={handleSubmit(onSubmit)}>
        <h3>Log in to the Comments dashboard:</h3>
        <div className={formInput}>
          <FormInput
            ariaInvalid={!!errors.Email}
            ariaLabel="Enter your email address"
            id="user-email"
            label="Email"
            maxLength={64}
            pattern={emailRegex}
            register={register}
            required
          />
          {errors.Email ? (
            <span id="user-email-error" className={formError}>
              <small>Please check your email address.</small>
            </span>
          ) : null}
        </div>
        <div className={formInput}>
          <FormInput
            ariaInvalid={!!errors.Password}
            ariaLabel="Enter your password"
            id="user-password"
            label="Password"
            maxLength={72}
            register={register}
            type="password"
            required
          />
          {errors.Password ? (
            <span className={formError}>
              <small>Please enter your password.</small>
            </span>
          ) : null}
        </div>
        <div className={formButton}>
          <input type="submit" aria-disabled={submitting} disabled={submitting} value="Login" />
          {serverState.message ? (
            <small className={serverState.ok ? '' : formError}>{serverState.message}</small>
          ) : null}
        </div>
      </form>
    </>
  );
}
