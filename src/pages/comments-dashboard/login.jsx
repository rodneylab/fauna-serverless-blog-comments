import axios from 'axios';
import { graphql, navigate } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import {
  getSessionStorageOrDefault,
  isBrowser,
  setSessionStorage,
} from '../../utilities/utilities';
import {
  container,
  content,
  formButton,
  formContainer,
  formError,
  formInput,
} from './login.module.scss';

export default function CommentsDashboardLogin({ data }) {
  const [serverState, setServerState] = useState({ ok: true, message: '' });
  const [sessionSecret, setSessionSecret] = useState(getSessionStorageOrDefault('token', false));
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setSessionStorage('token', sessionSecret);
  }, [sessionSecret]);

  const handleServerResponse = (ok, message) => {
    setServerState({ ok, message });
  };

  const onSubmit = async (formData, event) => {
    try {
      setSubmitting(true);
      const { Email: email, Password: password } = formData;
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
      event.target.reset();
      navigate('/comments-dashboard/');
    } catch (error) {
      handleServerResponse(false, 'There was an error logging in.  Please try again.');
    }
    setSubmitting(false);
  };

  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (sessionSecret && isBrowser) {
    navigate('/comments-dashboard/');
  }

  const { siteLanguage } = data.site.siteMetadata;

  return (
    <>
      <Helmet title="Comments dashboard login" htmlAttributes={{ lang: siteLanguage }} />
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className={container}>
        <div className={content}>
          <h1>Log In</h1>
          <form className={formContainer} onSubmit={handleSubmit(onSubmit)}>
            <h2>Log in to the Comments dashboard:</h2>
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
        </div>
      </main>
    </>
  );
}

CommentsDashboardLogin.propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        siteLanguage: PropTypes.string,
      }),
    }),
  }).isRequired,
};

export const query = graphql`
  query commentsDashboardLoginQuery {
    site {
      siteMetadata {
        siteLanguage
      }
    }
  }
`;
